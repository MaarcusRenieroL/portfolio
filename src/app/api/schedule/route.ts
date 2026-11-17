import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { HOST_TZ, bookingSchema, isBookableSlot, upcomingSlots } from "~/lib/booking";
import { allowBooking, clientKeyFrom } from "~/lib/rate-limit";
import { record } from "~/lib/server/analytics";
import { randomToken } from "~/lib/server/crypto";
import { hasDb, query } from "~/lib/server/db";
import { humanCheckEnabled, humanOk } from "~/lib/server/human";
import { generateIcs } from "~/lib/server/ics";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function validZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

const when = (d: Date, tz: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(d);

/** Slots already taken in the booking window, so the dialog can hide them. Empty without a database. */
export async function GET() {
  if (!hasDb()) return NextResponse.json({ taken: [] });
  const slots = upcomingSlots();
  if (!slots.length) return NextResponse.json({ taken: [] });
  try {
    const { rows } = await query<{ starts_at: Date }>(
      "select starts_at from meeting_booking where starts_at >= $1 and starts_at <= $2",
      [slots[0], slots[slots.length - 1]],
    );
    return NextResponse.json({ taken: rows.map((r) => new Date(r.starts_at).toISOString()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[schedule] availability lookup failed:", err);
    return NextResponse.json({ taken: [] });
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  const { name, email, duration, notes, token, website } = parsed.data;
  // Honeypot: pretend it worked so bots learn nothing.
  if (website) return NextResponse.json({ ok: true });

  const start = new Date(parsed.data.start);
  if (!isBookableSlot(start)) return fail("That time isn't available any more. Please pick another slot.", 409);

  const ip = clientKeyFrom(await headers());
  if (!allowBooking(ip)) return fail("Too many bookings from this connection. Please email me instead.", 429);
  if (!(await humanOk(token, ip))) return fail("The spam check didn't pass. Please try it again.", 400);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_EMAIL;
  const host = process.env.MY_EMAIL;
  if (!apiKey || !from || !host) return fail("Booking isn't available right now. Please email me instead.", 503);

  const id = randomToken(12);
  const tz = validZone(parsed.data.timezone);

  // Reserve the slot first: the unique index on starts_at makes a double booking impossible.
  if (hasDb()) {
    try {
      await query(
        `insert into meeting_booking (id, name, email, duration, meeting_date, meeting_time, visitor_tz, notes, starts_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, name, email, duration, start.toISOString().slice(0, 10), start.toISOString().slice(11, 16), tz, notes || null, start],
      );
    } catch (err) {
      if ((err as { code?: string }).code === "23505") return fail("Someone just booked that slot. Please pick another one.", 409);
      console.error("[schedule] insert failed:", err);
      return fail("Couldn't book right now. Please try again or email me.", 500);
    }
  }

  const title = `Call: Maarcus Reniero L × ${name} (${duration} min)`;
  const description = `Booked on maarcus.dev.\nMaarcus will email you a meeting link before the call.${notes ? `\n\nAgenda: ${notes}` : ""}`;
  const ics = (method: "REQUEST" | "PUBLISH") =>
    generateIcs({ id, method, title, description, start, durationMinutes: duration, attendeeEmail: email, attendeeName: name });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: host,
    replyTo: email,
    subject: `New call booked: ${name}, ${when(start, HOST_TZ)} IST`,
    text: `${name} <${email}> booked a ${duration}-minute call.\n\nYour time: ${when(start, HOST_TZ)}\nTheir time: ${when(start, tz)} (${tz})${notes ? `\n\nAgenda:\n${notes}` : ""}\n\nReply to this email to send them the meeting link.`,
    attachments: [{ filename: "call.ics", content: Buffer.from(ics("REQUEST")), contentType: "text/calendar; method=REQUEST" }],
  });
  if (error) {
    console.error("[schedule] host email failed:", error);
    // Release the slot: a booking Maarcus never hears about is worse than no booking.
    if (hasDb()) await query("delete from meeting_booking where id = $1", [id]).catch(() => {});
    return fail("Couldn't book right now. Please try again or email me.", 502);
  }

  // Only mail the visitor once a human check is on, or the form could be used to mail strangers.
  if (humanCheckEnabled()) {
    try {
      await resend.emails.send({
        from,
        to: email,
        replyTo: host,
        subject: `Call with Maarcus Reniero L, ${when(start, tz)}`,
        text: `Hi ${name},\n\nYour ${duration}-minute call is booked for ${when(start, tz)} (${tz}). The invite is attached; I'll send the meeting link before we talk.\n\nMaarcus`,
        attachments: [{ filename: "call.ics", content: Buffer.from(ics("REQUEST")), contentType: "text/calendar; method=REQUEST" }],
      });
    } catch (err) {
      console.error("[schedule] visitor email failed:", err);
    }
  }

  await record("book-call", "/contact");

  const end = new Date(start.getTime() + duration * 60_000);
  const g = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${g(start)}/${g(end)}&details=${encodeURIComponent(description)}`;

  return NextResponse.json({ ok: true, start: start.toISOString(), duration, gcal, ics: ics("PUBLISH"), emailed: humanCheckEnabled() });
}
