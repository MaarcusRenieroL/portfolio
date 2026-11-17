import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { writeFileSync } from "node:fs";
import QRCode from "qrcode";
import { Resend } from "resend";
import { query, pool } from "./db";
import {
  decrypt,
  encrypt,
  hashRecovery,
  ipHash,
  newRecoveryCodes,
  newTotpSecret,
  randomToken,
  safeEqual,
  sha256,
  totpUri,
  verifyTotp,
} from "./crypto";

/**
 * Admin sign-in is a chain, and every link is checked on the server:
 *
 *   email (must equal MY_EMAIL) -> magic link -> passkey -> authenticator code -> session
 *
 * The browser holds one random "attempt" cookie. The attempt row records which stage it is
 * at, and each function below refuses to run unless the attempt is exactly one stage before
 * it. A session is only ever created by `finishLogin`/`finishSetup`, after the last stage.
 * Every failure looks the same from outside (no "wrong email" vs "wrong code").
 */

export type Stage = "magic_sent" | "magic_ok" | "passkey_ok" | "passkey_added" | "totp_pending";
export type Kind = "login" | "setup";

export const MAGIC_TTL_MS = 10 * 60_000;
export const STAGE_TTL_MS = 15 * 60_000;
export const MAX_FAILURES = 5;
export const SESSION_ABSOLUTE_MS = 8 * 60 * 60_000;
export const SESSION_IDLE_MS = 60 * 60_000;

const RP_NAME = "Portfolio admin";

export const adminEmail = () => (process.env.MY_EMAIL ?? "").trim().toLowerCase();
// `||`, not `??`: a blank line in .env (WEBAUTHN_RP_ID=) must fall back too, or every passkey request is refused.
export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
export const rpID = () => process.env.WEBAUTHN_RP_ID || new URL(appUrl()).hostname;
export const rpOrigin = () => process.env.WEBAUTHN_ORIGIN || appUrl();

export const isProd = () => process.env.NODE_ENV === "production";
export const ATTEMPT_COOKIE = () => (isProd() ? "__Host-adm_a" : "adm_a");
export const SESSION_COOKIE = () => (isProd() ? "__Host-adm_s" : "adm_s");

export const cookieOptions = (maxAgeSec: number) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: "strict" as const,
  path: "/",
  maxAge: maxAgeSec,
});

/* ---------- audit + throttling (database-backed, so it holds across serverless instances) ---------- */

export async function audit(event: string, ip: string, detail: Record<string, unknown> = {}) {
  try {
    await query("insert into audit_log (event, ip_hash, detail) values ($1, $2, $3)", [event, ipHash(ip), JSON.stringify(detail)]);
  } catch (e) {
    console.error("[admin] audit failed", e);
  }
}

async function countRecent(events: string[], ip: string | null, minutes: number) {
  const r = await query<{ n: string }>(
    `select count(*) n from audit_log where event = any($1) and at > now() - ($2 || ' minutes')::interval ${ip ? "and ip_hash = $3" : ""}`,
    ip ? [events, String(minutes), ipHash(ip)] : [events, String(minutes)],
  );
  return Number(r.rows[0].n);
}

/** Too many starts or failures from one address, or too many failures overall, means "wait". */
export async function throttled(ip: string): Promise<boolean> {
  const [startsIp, failsIp, failsAll] = await Promise.all([
    countRecent(["login_start", "setup_start"], ip, 15),
    countRecent(["login_fail", "setup_fail"], ip, 15),
    countRecent(["login_fail", "setup_fail"], null, 15),
  ]);
  return startsIp >= 5 || failsIp >= 8 || failsAll >= 20;
}

/* ---------- attempts ---------- */

type Attempt = {
  id: string;
  kind: Kind;
  stage: Stage;
  magic_hash: string | null;
  challenge: string | null;
  pending: Record<string, string> | null;
  failures: number;
  expires_at: Date;
};

async function loadAttempt(cookie: string | undefined, kind: Kind, stage: Stage): Promise<Attempt | null> {
  if (!cookie) return null;
  const r = await query<Attempt>("select * from admin_attempt where id = $1", [sha256(cookie)]);
  const a = r.rows[0];
  if (!a) return null;
  if (a.expires_at.getTime() < Date.now()) {
    await query("delete from admin_attempt where id = $1", [a.id]);
    return null;
  }
  if (a.kind !== kind || a.stage !== stage) return null;
  return a;
}

/** A wrong move at any stage counts; five of them end the attempt. */
async function fail(attempt: Attempt | null, kind: Kind, ip: string, why: string) {
  await audit(`${kind}_fail`, ip, { why });
  if (!attempt) return;
  const r = await query<{ failures: number }>("update admin_attempt set failures = failures + 1 where id = $1 returning failures", [attempt.id]);
  if ((r.rows[0]?.failures ?? 0) >= MAX_FAILURES) await query("delete from admin_attempt where id = $1", [attempt.id]);
}

export async function adminExists(): Promise<boolean> {
  const r = await query("select 1 from admin_user where id = 1");
  return (r.rowCount ?? 0) > 0;
}

/* ---------- step 1: start (login or first-run setup) ---------- */

async function sendMagic(to: string, token: string, kind: Kind) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_EMAIL;
  const link = `${appUrl()}/admin/${kind === "setup" ? "setup" : "login"}/verify#${token}`;
  if (!apiKey || !from) {
    if (!isProd()) console.log(`[admin] email not configured; ${kind} link: ${link}`);
    // Test hook: the browser tests read the link from a file. Only used when email is unconfigured and the variable is set.
    if (process.env.ADMIN_E2E_LINK_FILE) writeFileSync(process.env.ADMIN_E2E_LINK_FILE, link);
    return;
  }
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: kind === "setup" ? "Finish setting up your admin" : "Your admin sign-in link",
    text: `Open this link in the SAME browser you started in. It works once and expires in 10 minutes.\n\n${link}\n\nIf you did not ask for this, ignore it; nothing happens.`,
  });
  if (error) console.error("[admin] magic link email failed:", error);
}

export type StartResult = { cookie: string };

/**
 * Always returns a cookie and the caller always answers the same way, so the response never
 * reveals whether the email was the right one. The magic token travels in the URL fragment
 * (never sent to servers, proxies or logs) and is consumed by a POST, not by opening the link.
 */
export async function startLogin(email: string, ip: string): Promise<StartResult> {
  const cookie = randomToken();
  await audit("login_start", ip);
  const match = safeEqual(email.trim().toLowerCase(), adminEmail()) && adminEmail() !== "";
  if (match && (await adminExists())) {
    const token = randomToken();
    await query(
      "insert into admin_attempt (id, kind, stage, magic_hash, ip_hash, expires_at) values ($1, 'login', 'magic_sent', $2, $3, $4)",
      [sha256(cookie), sha256(token), ipHash(ip), new Date(Date.now() + MAGIC_TTL_MS)],
    );
    await sendMagic(adminEmail(), token, "login");
  }
  return { cookie };
}

export async function startSetup(email: string, setupToken: string, ip: string): Promise<StartResult> {
  const cookie = randomToken();
  await audit("setup_start", ip);
  const expected = process.env.SETUP_TOKEN ?? "";
  const ok =
    expected.length >= 16 &&
    safeEqual(setupToken, expected) &&
    safeEqual(email.trim().toLowerCase(), adminEmail()) &&
    adminEmail() !== "" &&
    !(await adminExists());
  if (ok) {
    const token = randomToken();
    await query(
      "insert into admin_attempt (id, kind, stage, magic_hash, ip_hash, expires_at) values ($1, 'setup', 'magic_sent', $2, $3, $4)",
      [sha256(cookie), sha256(token), ipHash(ip), new Date(Date.now() + MAGIC_TTL_MS)],
    );
    await sendMagic(adminEmail(), token, "setup");
  }
  return { cookie };
}

/* ---------- step 2: the magic link ---------- */

export async function consumeMagic(cookie: string | undefined, token: string, kind: Kind, ip: string): Promise<boolean> {
  const a = await loadAttempt(cookie, kind, "magic_sent");
  if (!a || !a.magic_hash || !safeEqual(sha256(token), a.magic_hash)) {
    await fail(a, kind, ip, "magic");
    return false;
  }
  await query("update admin_attempt set stage = 'magic_ok', magic_hash = null, expires_at = $2 where id = $1", [a.id, new Date(Date.now() + STAGE_TTL_MS)]);
  await audit(`${kind}_magic_ok`, ip);
  return true;
}

/* ---------- step 3a (login): passkey ---------- */

type StoredKey = { id: string; public_key: Buffer; counter: string; transports: string[] | null };

export async function passkeyLoginOptions(cookie: string | undefined, ip: string) {
  const a = await loadAttempt(cookie, "login", "magic_ok");
  if (!a) {
    await fail(null, "login", ip, "passkey_options");
    return null;
  }
  const keys = await query<StoredKey>("select id, public_key, counter, transports from admin_passkey");
  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: "required",
    allowCredentials: keys.rows.map((k) => ({ id: k.id, transports: (k.transports ?? undefined) as never })),
  });
  await query("update admin_attempt set challenge = $2 where id = $1", [a.id, options.challenge]);
  return options;
}

export async function passkeyLoginVerify(cookie: string | undefined, response: AuthenticationResponseJSON, ip: string): Promise<boolean> {
  const a = await loadAttempt(cookie, "login", "magic_ok");
  if (!a || !a.challenge) {
    await fail(a, "login", ip, "passkey_state");
    return false;
  }
  const r = await query<StoredKey>("select id, public_key, counter, transports from admin_passkey where id = $1", [response.id]);
  const key = r.rows[0];
  if (!key) {
    await fail(a, "login", ip, "passkey_unknown");
    return false;
  }
  try {
    const v = await verifyAuthenticationResponse({
      response,
      expectedChallenge: a.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
      credential: { id: key.id, publicKey: new Uint8Array(key.public_key), counter: Number(key.counter), transports: (key.transports ?? undefined) as never },
    });
    if (!v.verified) throw new Error("not verified");
    await query("update admin_passkey set counter = $2, last_used_at = now() where id = $1", [key.id, v.authenticationInfo.newCounter]);
    await query("update admin_attempt set stage = 'passkey_ok', challenge = null, expires_at = $2 where id = $1", [a.id, new Date(Date.now() + STAGE_TTL_MS)]);
    await audit("login_passkey_ok", ip);
    return true;
  } catch {
    await fail(a, "login", ip, "passkey_verify");
    return false;
  }
}

/* ---------- step 4 (login): authenticator code or a recovery code, then the session ---------- */

export async function finishLogin(cookie: string | undefined, code: string, ip: string, ua: string): Promise<string | null> {
  const a = await loadAttempt(cookie, "login", "passkey_ok");
  if (!a) {
    await fail(null, "login", ip, "totp_state");
    return null;
  }
  const u = await query<{ totp_secret_enc: string; totp_last_step: string }>("select totp_secret_enc, totp_last_step from admin_user where id = 1");
  const user = u.rows[0];
  if (!user) return null;

  const clean = code.trim();
  let ok = false;
  const step = verifyTotp(decrypt(user.totp_secret_enc), clean, Number(user.totp_last_step));
  if (step !== null) {
    // Only one request can claim a time step; a replayed code finds the row already advanced.
    const claim = await query("update admin_user set totp_last_step = $1 where id = 1 and totp_last_step < $1", [step]);
    ok = (claim.rowCount ?? 0) === 1;
  } else if (/^[0-9a-f]{5}-[0-9a-f]{5}$/i.test(clean)) {
    const burn = await query("update admin_recovery_code set used_at = now() where code_hash = $1 and used_at is null", [hashRecovery(clean)]);
    ok = (burn.rowCount ?? 0) === 1;
    if (ok) await audit("login_recovery_used", ip);
  }
  if (!ok) {
    await fail(a, "login", ip, "totp");
    return null;
  }
  await query("delete from admin_attempt where id = $1", [a.id]);
  await audit("login_ok", ip);
  return createSession(ip, ua);
}

/* ---------- first-run setup: register passkey, enrol authenticator, issue recovery codes ---------- */

export async function setupPasskeyOptions(cookie: string | undefined, ip: string) {
  const a = await loadAttempt(cookie, "setup", "magic_ok");
  if (!a || (await adminExists())) {
    await fail(null, "setup", ip, "passkey_options");
    return null;
  }
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rpID(),
    userName: adminEmail(),
    userID: new TextEncoder().encode("admin"),
    attestationType: "none",
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
  });
  await query("update admin_attempt set challenge = $2 where id = $1", [a.id, options.challenge]);
  return options;
}

export async function setupPasskeyVerify(cookie: string | undefined, response: RegistrationResponseJSON, ip: string): Promise<boolean> {
  const a = await loadAttempt(cookie, "setup", "magic_ok");
  if (!a || !a.challenge) {
    await fail(a, "setup", ip, "passkey_state");
    return false;
  }
  try {
    const v = await verifyRegistrationResponse({
      response,
      expectedChallenge: a.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
    });
    if (!v.verified) throw new Error("not verified");
    const c = v.registrationInfo.credential;
    const pending = {
      passkey: JSON.stringify({ id: c.id, publicKey: Buffer.from(c.publicKey).toString("base64"), counter: c.counter, transports: c.transports ?? [] }),
    };
    await query("update admin_attempt set stage = 'passkey_added', challenge = null, pending = $2, expires_at = $3 where id = $1", [
      a.id,
      JSON.stringify(pending),
      new Date(Date.now() + STAGE_TTL_MS),
    ]);
    await audit("setup_passkey_ok", ip);
    return true;
  } catch {
    await fail(a, "setup", ip, "passkey_verify");
    return false;
  }
}

/** Creates the TOTP secret for this setup attempt and returns what the authenticator app needs. */
export async function setupTotpBegin(cookie: string | undefined, ip: string) {
  const a = await loadAttempt(cookie, "setup", "passkey_added");
  if (!a) {
    await fail(null, "setup", ip, "totp_begin");
    return null;
  }
  const secret = newTotpSecret();
  const pending = { ...(a.pending ?? {}), totp: encrypt(secret) };
  await query("update admin_attempt set stage = 'totp_pending', pending = $2 where id = $1", [a.id, JSON.stringify(pending)]);
  const uri = totpUri(secret, adminEmail(), "Portfolio admin");
  return { secret, uri, qr: await QRCode.toString(uri, { type: "svg", margin: 1, width: 220 }) };
}

/**
 * Last setup step. Nothing is written to the real tables until this succeeds, so an abandoned
 * setup leaves no half-created admin. The insert into `admin_user` (pinned id = 1) fails if one
 * already exists, which also makes two simultaneous setups safe.
 */
export async function finishSetup(cookie: string | undefined, code: string, ip: string, ua: string): Promise<{ session: string; recoveryCodes: string[] } | null> {
  const a = await loadAttempt(cookie, "setup", "totp_pending");
  if (!a?.pending?.totp || !a.pending.passkey) {
    await fail(null, "setup", ip, "finish_state");
    return null;
  }
  const secret = decrypt(a.pending.totp);
  const step = verifyTotp(secret, code.trim(), 0);
  if (step === null) {
    await fail(a, "setup", ip, "finish_code");
    return null;
  }
  const pk = JSON.parse(a.pending.passkey) as { id: string; publicKey: string; counter: number; transports: string[] };
  const recoveryCodes = newRecoveryCodes();
  const client = await pool().connect();
  try {
    await client.query("begin");
    await client.query("insert into admin_user (id, email, totp_secret_enc, totp_last_step) values (1, $1, $2, $3)", [adminEmail(), a.pending.totp, step]);
    await client.query("insert into admin_passkey (id, public_key, counter, transports, label) values ($1, $2, $3, $4, 'First passkey')", [
      pk.id,
      Buffer.from(pk.publicKey, "base64"),
      pk.counter,
      pk.transports,
    ]);
    for (const c of recoveryCodes) await client.query("insert into admin_recovery_code (code_hash) values ($1)", [hashRecovery(c)]);
    await client.query("delete from admin_attempt where kind = 'setup'");
    await client.query("commit");
  } catch {
    await client.query("rollback");
    await fail(a, "setup", ip, "finish_write");
    return null;
  } finally {
    client.release();
  }
  await audit("setup_complete", ip);
  return { session: await createSession(ip, ua), recoveryCodes };
}

/* ---------- sessions ---------- */

export async function createSession(ip: string, ua: string): Promise<string> {
  const token = randomToken();
  await query("insert into admin_session (id, expires_at, ip_hash, ua) values ($1, $2, $3, $4)", [
    sha256(token),
    new Date(Date.now() + SESSION_ABSOLUTE_MS),
    ipHash(ip),
    ua.slice(0, 200),
  ]);
  return token;
}

/** True only for a live session: not expired, not idle too long. Idle time is refreshed at most once a minute. */
export async function sessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const r = await query<{ last_seen_at: Date; expires_at: Date }>("select last_seen_at, expires_at from admin_session where id = $1", [sha256(token)]);
  const s = r.rows[0];
  if (!s) return false;
  const now = Date.now();
  if (s.expires_at.getTime() < now || now - s.last_seen_at.getTime() > SESSION_IDLE_MS) {
    await query("delete from admin_session where id = $1", [sha256(token)]);
    return false;
  }
  if (now - s.last_seen_at.getTime() > 60_000) await query("update admin_session set last_seen_at = now() where id = $1", [sha256(token)]);
  return true;
}

export async function revokeSession(token: string | undefined) {
  if (token) await query("delete from admin_session where id = $1", [sha256(token)]);
}

export async function revokeAllSessions() {
  await query("delete from admin_session");
}

/** Mutating requests must come from our own origin. Cookies are SameSite=Strict as well; this is the second lock. */
export function sameOrigin(h: Pick<Headers, "get">): boolean {
  const origin = h.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(rpOrigin()).origin;
  } catch {
    return false;
  }
}
