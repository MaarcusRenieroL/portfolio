import { query } from "./db";
import { blobConfigured } from "./media";
import { headPrivate, listPublic, r2Env } from "./r2";

/**
 * What the admin Overview shows under "System": whether each integration is set up and, where it can be checked
 * cheaply, whether it answers. Never includes a secret's value. Each check has its own time limit, so one slow
 * service can't hold up the page.
 */

export type CheckState = "ok" | "off" | "warn" | "error";
export type Check = { id: string; label: string; state: CheckState; detail: string };

/** The newest file in db/migrations. A test keeps this in step with the folder. */
export const LATEST_MIGRATION = "007_content_versions.sql";

const LIMIT_MS = 4000;

function withLimit<T>(p: Promise<T>, ms = LIMIT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no answer in ${ms / 1000}s`)), ms);
  });
  return Promise.race([p, late]).finally(() => clearTimeout(timer));
}

/**
 * A short reason for a database failure, without the raw driver text: that can name the host and the user,
 * and the Overview gets screenshotted.
 */
export function dbReason(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  const msg = e instanceof Error ? e.message : "";
  if (code === "28P01" || code === "28000") return "the username or password was refused";
  if (code === "3D000") return "that database doesn't exist";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "the host name doesn't resolve";
  if (code === "ECONNREFUSED") return "nothing is listening at that address";
  if (code === "ETIMEDOUT" || /^no answer in/.test(msg)) return msg.startsWith("no answer") ? msg : "the connection timed out";
  if (/certificate|ssl|tls/i.test(msg)) return "the TLS/SSL settings don't match the server";
  return "the connection failed";
}

const message = (e: unknown) => (e instanceof Error ? e.message : "failed");

/** "007_content_versions.sql" → 7, so the comparison holds past 999. */
const migrationNumber = (name: string) => Number(/^(\d+)_/.exec(name)?.[1] ?? NaN);

export async function checkDatabase(): Promise<Check> {
  const base = { id: "db", label: "Database" };
  if (!process.env.DATABASE_URL) return { ...base, state: "error", detail: "DATABASE_URL isn't set. The site is serving its built-in content." };
  try {
    const t = Date.now();
    const r = await withLimit(query<{ name: string | null }>("select max(name) as name from _migration"));
    const ms = Date.now() - t;
    const at = r.rows[0]?.name ?? "";
    const have = migrationNumber(at);
    const want = migrationNumber(LATEST_MIGRATION);
    if (!(have >= want))
      return { ...base, state: "warn", detail: `Schema is at ${at || "nothing"}, the code expects ${LATEST_MIGRATION}. Run pnpm db:migrate against this database.` };
    if (have > want) return { ...base, state: "ok", detail: `Reachable (${ms} ms). Its schema (${at}) is newer than this code expects; fine after a rollback.` };
    return { ...base, state: "ok", detail: `Up to date (${LATEST_MIGRATION.replace(/\.sql$/, "")}), answered in ${ms} ms.` };
  } catch (e) {
    // Reachable, just never migrated.
    if ((e as { code?: string })?.code === "42P01") return { ...base, state: "warn", detail: "Reachable, but no migrations have run. Run pnpm db:migrate against this database." };
    return { ...base, state: "error", detail: `Not reachable: ${dbReason(e)}.` };
  }
}

export async function checkStorage(): Promise<Check> {
  const base = { id: "storage", label: "File storage" };
  const r2 = r2Env();
  if (!r2) {
    if (blobConfigured()) return { ...base, state: "ok", detail: "Vercel Blob (private). Files are served from /media on this site." };
    return { ...base, state: "off", detail: "No R2 or Blob credentials, so uploads are off. Site files come from /public." };
  }
  try {
    // Both buckets answer with these credentials (a missing key is fine; a 403 or a wrong bucket throws).
    await withLimit(Promise.all([listPublic("__health/"), headPrivate("__health")]));
  } catch (e) {
    return { ...base, state: "error", detail: `R2 refused the credentials or a bucket name: ${message(e)}.` };
  }
  try {
    // The one-time copy of the site's files has run when the résumé is on the assets domain.
    const res = await withLimit(fetch(`${r2.assets}/resume.pdf`, { method: "HEAD", cache: "no-store" }));
    if (!res.ok) return { ...base, state: "warn", detail: `R2 works, but ${new URL(r2.assets).host} doesn't serve the site's files yet (${res.status}). Run pnpm assets:upload.` };
  } catch (e) {
    return { ...base, state: "warn", detail: `R2 works, but ${r2.assets} didn't answer: ${message(e)}. Check the bucket's custom domain.` };
  }
  return { ...base, state: "ok", detail: `Cloudflare R2. Published files are served from ${new URL(r2.assets).host}.` };
}

/** Integrations that are only checked for being configured: calling them would send mail or spend quota. */
export function configChecks(env: NodeJS.ProcessEnv = process.env): Check[] {
  const has = (...keys: string[]) => keys.every((k) => Boolean(env[k]));
  const missing = (...keys: string[]) => keys.filter((k) => !env[k]).join(", ");
  const row = (id: string, label: string, keys: string[], on: string, off: string, offState: CheckState = "off"): Check =>
    has(...keys) ? { id, label, state: "ok", detail: on } : { id, label, state: offState, detail: `${off} Missing: ${missing(...keys)}.` };
  return [
    row("appurl", "Site address", ["APP_URL"], "Sign-in links and the admin's origin check use APP_URL.", "Sign-in links fall back to http://localhost:3000, so admin sign-in breaks on the live site.", env.NODE_ENV === "production" ? "error" : "off"),
    row("email", "Email", ["RESEND_API_KEY", "RESEND_EMAIL", "MY_EMAIL"], "Resend is set up: contact messages and booking emails go out.", "Messages are still saved to the inbox, but no email is sent.", "warn"),
    row("cron", "Daily cleanup", ["CRON_SECRET"], "The retention job runs once a day.", "Old data is only pruned when traffic triggers it.", "warn"),
    row("translate", "Translation", ["GEMINI_API_KEY"], "Translate with Gemini is available in the editor.", "German has to be written by hand."),
    row("github", "GitHub", ["GITHUB_TOKEN"], "The contribution graph and repos use an authenticated API (higher limits).", "GitHub data uses the anonymous API, 60 requests an hour."),
    row("turnstile", "Spam check", ["NEXT_PUBLIC_TURNSTILE_SITEKEY", "TURNSTILE_SECRET"], "Cloudflare Turnstile guards the contact form.", "The contact form relies on its rate limits only."),
  ];
}

export async function systemChecks(): Promise<Check[]> {
  const [db, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  return [db, storage, ...configChecks()];
}
