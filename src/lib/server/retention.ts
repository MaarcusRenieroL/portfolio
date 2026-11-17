import { query } from "./db";
import { VERSIONS_KEPT } from "./store";

/** How long personal data is kept. /privacy (src/lib/legal.ts) states these numbers. */
export const RETENTION = {
  analyticsMonths: 13,
  bookingMonthsAfterCall: 12,
  messageMonths: 12,
  auditLogMonths: 13,
} as const;

const g = globalThis as unknown as { __pruneAt?: number };
const DAY = 86400_000;

/**
 * Deletes data past its retention. The daily cron (/api/cron/retention) calls it with force; traffic
 * also triggers it at most once a day per server instance, as a backstop. Only a run that finished
 * counts toward that daily limit. Never throws; returns whether it completed.
 */
export async function pruneOldData(now = Date.now(), force = false): Promise<boolean> {
  if (!force && g.__pruneAt && now - g.__pruneAt < DAY) return true;
  try {
    await query(`delete from site_event where at < now() - interval '${RETENTION.analyticsMonths} months'`);
    await query(`delete from meeting_booking where coalesce(starts_at, created_at) < now() - interval '${RETENTION.bookingMonthsAfterCall} months'`);
    await query(`delete from contact_message where created_at < now() - interval '${RETENTION.messageMonths} months'`);
    await query(`delete from audit_log where at < now() - interval '${RETENTION.auditLogMonths} months'`);
    await query("delete from admin_attempt where expires_at < now() - interval '1 day'");
    await query("delete from admin_session where expires_at < now()");
    // Not personal data: just caps content history at the newest versions of each item.
    await query(
      `delete from content_version v using (
         select id, row_number() over (partition by kind, key order by id desc) n from content_version
       ) r where v.id = r.id and r.n > ${VERSIONS_KEPT}`,
    );
    g.__pruneAt = now;
    return true;
  } catch (err) {
    console.error("[retention] prune failed:", err);
    return false;
  }
}
