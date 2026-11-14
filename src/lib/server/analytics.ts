import { headers } from "next/headers";
import { clientKeyFrom } from "~/lib/rate-limit";
import { dailyHash } from "./crypto";
import { hasDb, query } from "./db";
import { isAdmin } from "./session";

export const EVENT_KINDS = ["view", "resume-download", "resume-open", "resume-print", "vcard-download", "book-call", "project-click", "social-click", "contact-sent", "contact-click", "email-click"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|wget|python|node-fetch|axios|monitor|uptime|vercel/i;

/** Small in-memory limiter: one visitor can log a handful of events a minute, enough for real browsing. */
const seen = new Map<string, number[]>();
function allow(key: string) {
  const now = Date.now();
  const mine = (seen.get(key) ?? []).filter((t) => now - t < 60_000);
  if (mine.length >= 40) return false;
  mine.push(now);
  seen.set(key, mine);
  if (seen.size > 5000) for (const [k, v] of seen) if (v.every((t) => now - t >= 60_000)) seen.delete(k);
  return true;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).replace(/[\u0000-\u001f]/g, "") : null);

/**
 * Records one event. Skipped for the signed-in owner, bots and visitors who send Do Not Track.
 * No cookie is set and no address is stored: the visitor id is a hash that changes every day.
 */
export async function record(kind: string, path?: unknown, target?: unknown): Promise<boolean> {
  try {
    return await write(kind, path, target);
  } catch (err) {
    console.error("[analytics] skipped:", err);
    return false;
  }
}

async function write(kind: string, path?: unknown, target?: unknown): Promise<boolean> {
  if (!hasDb() || !(EVENT_KINDS as readonly string[]).includes(kind)) return false;
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  if (!ua || BOT.test(ua) || h.get("dnt") === "1" || h.get("sec-gpc") === "1") return false;
  if (await isAdmin()) return false;
  const ip = clientKeyFrom(h);
  if (!allow(ip)) return false;
  const p = clean(path, 200);
  try {
    await query("insert into site_event (kind, path, target, visitor) values ($1, $2, $3, $4)", [kind, p && p.startsWith("/") ? p : null, clean(target, 120), dailyHash(ip, ua)]);
    return true;
  } catch (err) {
    console.error("[analytics] insert failed:", err);
    return false;
  }
}

