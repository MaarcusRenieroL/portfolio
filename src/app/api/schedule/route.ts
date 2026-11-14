import { NextResponse } from "next/server";
import { z } from "zod";
import pg from "pg";
import { generateIcs } from "~/lib/server/ics";
import { randomToken } from "~/lib/server/crypto";

const BookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().trim().optional(),
  duration: z.union([z.literal(15), z.literal(30), z.literal(45)]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  timezone: z.string().default("UTC"),
  notes: z.string().trim().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BookingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { name, email, company, duration, date, time, timezone, notes } = parsed.data;
    const bookingId = randomToken(12);

    // Parse meeting start in UTC
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const startDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    const meetingTitle = `Maarcus Reniero L × ${name}${company ? ` (${company})` : ""} - Technical Discussion`;
    const meetingDescription = `Technical discussion & intro call between Maarcus Reniero L and ${name}.\nDuration: ${duration} minutes\nNotes: ${notes || "None provided"}\nMeeting Link: https://meet.google.com/new`;

    // 1. Generate standard .ics file
    const icsContent = generateIcs({
      id: bookingId,
      title: meetingTitle,
      description: meetingDescription,
      start: startDateTime,
      durationMinutes: duration,
      attendeeEmail: email,
      attendeeName: name,
    });

    // 2. Generate direct Google Calendar link
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    const formatGCal = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      meetingTitle
    )}&dates=${formatGCal(startDateTime)}/${formatGCal(endDateTime)}&details=${encodeURIComponent(
      meetingDescription
    )}&add=${encodeURIComponent(email)}`;

    // 3. Persist to PostgreSQL if configured
    if (process.env.DATABASE_URL) {
      try {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        await pool.query(
          `insert into meeting_booking (id, name, email, company, duration, meeting_date, meeting_time, visitor_tz, notes)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           on conflict (id) do nothing`,
          [bookingId, name, email, company ?? null, duration, date, time, timezone, notes ?? null]
        );
        await pool.end();
      } catch {
        /* proceed even if DB write fails */
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      gcalUrl,
      icsContent,
    });
  } catch {
    return NextResponse.json({ error: "Failed to book meeting slot. Please try again." }, { status: 500 });
  }
}
