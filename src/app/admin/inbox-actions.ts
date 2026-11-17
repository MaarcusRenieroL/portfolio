"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { audit } from "~/lib/server/auth";
import { query } from "~/lib/server/db";
import { requireAdmin } from "~/lib/server/session";
import { SITE } from "~/lib/content";
import type { Result } from "./actions";

const fail = (e: unknown): { ok: false; errors: string[] } => ({ ok: false, errors: [e instanceof Error ? e.message : "Something went wrong."] });

export async function setMessageRead(id: number, read: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await query(`update contact_message set read_at = ${read ? "coalesce(read_at, now())" : "null"} where id = $1`, [id]);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setMessageArchived(id: number, archived: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await query("update contact_message set archived = $2, read_at = coalesce(read_at, now()) where id = $1", [id, archived]);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMessage(id: number): Promise<Result> {
  await requireAdmin();
  try {
    await query("delete from contact_message where id = $1", [id]);
    await audit("message_deleted", "admin", { id });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Cancels a booked call: frees the slot and, when email is set up, tells the guest. */
export async function cancelBooking(id: string, note: string): Promise<Result<{ emailed: boolean }>> {
  await requireAdmin();
  try {
    const row = (
      await query<{ name: string; email: string; starts_at: string | null; meeting_date: string; meeting_time: string }>(
        "delete from meeting_booking where id = $1 returning name, email, starts_at::text, meeting_date, meeting_time",
        [id],
      )
    ).rows[0];
    if (!row) return { ok: false, errors: ["That booking no longer exists."] };
    await audit("booking_cancelled", "admin", { id });
    revalidatePath("/admin", "layout");

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_EMAIL;
    if (!apiKey || !from) return { ok: true, emailed: false };
    const when = row.starts_at
      ? new Date(row.starts_at).toUTCString().replace(" GMT", " UTC")
      : `${row.meeting_date} ${row.meeting_time}`;
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: row.email,
      replyTo: process.env.MY_EMAIL || SITE.email,
      subject: "Our call is cancelled",
      text: `Hi ${row.name},\n\nI'm sorry, I have to cancel our call on ${when}.${note.trim() ? `\n\n${note.trim()}` : ""}\n\nYou're welcome to pick another time at ${SITE.url}/contact, or just reply to this email.\n\n${SITE.name}`,
    });
    return { ok: true, emailed: !error };
  } catch (e) {
    return fail(e);
  }
}
