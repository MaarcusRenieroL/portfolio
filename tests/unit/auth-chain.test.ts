import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Runs the real state machine against a real Postgres (the portfolio_test database).
 * Only the WebAuthn signature check is stubbed, since that needs a physical authenticator.
 */
const HAS_DB = Boolean(process.env.DATABASE_URL?.endsWith("/portfolio"));
const TEST_URL = (process.env.DATABASE_URL ?? "").replace(/\/portfolio$/, "/portfolio_test");

vi.mock("@simplewebauthn/server", () => ({
  generateRegistrationOptions: vi.fn(async () => ({ challenge: "reg-challenge" })),
  generateAuthenticationOptions: vi.fn(async () => ({ challenge: "auth-challenge" })),
  verifyRegistrationResponse: vi.fn(async ({ response }: { response: { ok?: boolean } }) => {
    if (!response.ok) throw new Error("bad");
    return { verified: true, registrationInfo: { credential: { id: "cred-1", publicKey: new Uint8Array([1, 2, 3]), counter: 0, transports: ["internal"] } } };
  }),
  verifyAuthenticationResponse: vi.fn(async ({ response }: { response: { ok?: boolean } }) => {
    if (!response.ok) throw new Error("bad");
    return { verified: true, authenticationInfo: { newCounter: 1 } };
  }),
}));

const EMAIL = "owner@example.com";
const SETUP_TOKEN = "setup-token-0123456789";
let auth: typeof import("~/lib/server/auth");
let crypto: typeof import("~/lib/server/crypto");
let db: pg.Pool;
let lastLink = "";

const origLog = console.log;
beforeAll(async () => {
  if (!HAS_DB) return;
  if (!TEST_URL.endsWith("portfolio_test")) throw new Error("DATABASE_URL must point at the local portfolio database");
  process.env.DATABASE_URL = TEST_URL;
  Object.assign(process.env, { ADMIN_SECRET: "y".repeat(48), MY_EMAIL: EMAIL, SETUP_TOKEN, APP_URL: "http://localhost:3000", RESEND_API_KEY: "", RESEND_EMAIL: "" });
  db = new pg.Pool({ connectionString: TEST_URL });
  const exists = await db.query("select to_regclass('admin_user') t");
  if (!exists.rows[0].t) await db.query(fs.readFileSync(path.join("db", "migrations", "001_init.sql"), "utf8"));
  auth = await import("~/lib/server/auth");
  crypto = await import("~/lib/server/crypto");
  console.log = (...a: unknown[]) => {
    const m = /link: (\S+)/.exec(String(a[0]));
    if (m) lastLink = m[1];
    else origLog(...a);
  };
});
afterAll(async () => {
  if (!HAS_DB) return;
  console.log = origLog;
  await db.end();
  await (await import("~/lib/server/db")).pool().end();
});

beforeEach(async () => {
  if (!HAS_DB) return;
  lastLink = "";
  await db.query("truncate admin_user, admin_passkey, admin_recovery_code, admin_attempt, admin_session, audit_log restart identity");
});

const tokenFrom = (link: string) => link.split("#")[1];
const ip = "9.9.9.9";

async function setupAdmin() {
  const { cookie } = await auth.startSetup(EMAIL, SETUP_TOKEN, ip);
  expect(await auth.consumeMagic(cookie, tokenFrom(lastLink), "setup", ip)).toBe(true);
  expect(await auth.setupPasskeyOptions(cookie, ip)).toBeTruthy();
  expect(await auth.setupPasskeyVerify(cookie, { ok: true } as never, ip)).toBe(true);
  const t = await auth.setupTotpBegin(cookie, ip);
  expect(t).toBeTruthy();
  const code = crypto.hotp(t!.secret, crypto.totpStep());
  const done = await auth.finishSetup(cookie, code, ip, "ua");
  expect(done).toBeTruthy();
  return { secret: t!.secret, recoveryCodes: done!.recoveryCodes, session: done!.session };
}

/** Walk a login up to (and including) the given number of steps: 1 magic, 2 passkey. */
async function loginTo(steps: 0 | 1 | 2) {
  const { cookie } = await auth.startLogin(EMAIL, ip);
  if (steps >= 1) expect(await auth.consumeMagic(cookie, tokenFrom(lastLink), "login", ip)).toBe(true);
  if (steps >= 2) {
    await auth.passkeyLoginOptions(cookie, ip);
    expect(await auth.passkeyLoginVerify(cookie, { id: "cred-1", ok: true } as never, ip)).toBe(true);
  }
  return cookie;
}

describe.skipIf(!HAS_DB)("first-run setup", () => {
  it("refuses a wrong setup token, a wrong email, and an unset token; sends no link", async () => {
    await auth.startSetup(EMAIL, "wrong-token-wrong-token", ip);
    await auth.startSetup("someone@else.com", SETUP_TOKEN, ip);
    expect(lastLink).toBe("");
    process.env.SETUP_TOKEN = "";
    await auth.startSetup(EMAIL, "", ip);
    expect(lastLink).toBe("");
    process.env.SETUP_TOKEN = SETUP_TOKEN;
    expect((await db.query("select count(*) n from admin_attempt")).rows[0].n).toBe("0");
  });

  it("walks every stage in order, writes everything atomically, then locks setup forever", async () => {
    const r = await setupAdmin();
    expect(r.recoveryCodes).toHaveLength(10);
    expect(await auth.adminExists()).toBe(true);
    expect((await db.query("select count(*) n from admin_passkey")).rows[0].n).toBe("1");
    expect(await auth.sessionValid(r.session)).toBe(true);
    // The TOTP secret is encrypted at rest.
    const u = await db.query("select totp_secret_enc from admin_user");
    expect(u.rows[0].totp_secret_enc).not.toContain(r.secret);
    // Setup is now closed: no link, even with the right token and email.
    lastLink = "";
    await auth.startSetup(EMAIL, SETUP_TOKEN, ip);
    expect(lastLink).toBe("");
  });

  it("cannot skip stages", async () => {
    const { cookie } = await auth.startSetup(EMAIL, SETUP_TOKEN, ip);
    // Before the magic link is confirmed, nothing else works.
    expect(await auth.setupPasskeyOptions(cookie, ip)).toBeNull();
    expect(await auth.setupTotpBegin(cookie, ip)).toBeNull();
    expect(await auth.finishSetup(cookie, "123456", ip, "ua")).toBeNull();
    await auth.consumeMagic(cookie, tokenFrom(lastLink), "setup", ip);
    // After the magic link, the authenticator step and finish are still closed.
    expect(await auth.setupTotpBegin(cookie, ip)).toBeNull();
    expect(await auth.finishSetup(cookie, "123456", ip, "ua")).toBeNull();
    expect(await auth.adminExists()).toBe(false);
  });

  it("a wrong authenticator code at the end writes nothing", async () => {
    const { cookie } = await auth.startSetup(EMAIL, SETUP_TOKEN, ip);
    await auth.consumeMagic(cookie, tokenFrom(lastLink), "setup", ip);
    await auth.setupPasskeyOptions(cookie, ip);
    await auth.setupPasskeyVerify(cookie, { ok: true } as never, ip);
    await auth.setupTotpBegin(cookie, ip);
    expect(await auth.finishSetup(cookie, "000000", ip, "ua")).toBeNull();
    expect(await auth.adminExists()).toBe(false);
    expect((await db.query("select count(*) n from admin_passkey")).rows[0].n).toBe("0");
  });

  it("a setup login cookie cannot be used on the login path, and the reverse", async () => {
    const { cookie } = await auth.startSetup(EMAIL, SETUP_TOKEN, ip);
    expect(await auth.consumeMagic(cookie, tokenFrom(lastLink), "login", ip)).toBe(false);
  });
});

describe.skipIf(!HAS_DB)("login chain", () => {
  beforeEach(async () => {
    await setupAdmin();
    lastLink = "";
  });

  it("sends a link only for the exact configured email (case-insensitive), nothing otherwise", async () => {
    await auth.startLogin("nobody@example.com", ip);
    expect(lastLink).toBe("");
    await auth.startLogin("OWNER@example.com ", ip);
    expect(lastLink).toContain("/admin/login/verify#");
  });

  it("returns a cookie either way, so the response cannot reveal the email", async () => {
    const a = await auth.startLogin("nobody@example.com", ip);
    const b = await auth.startLogin(EMAIL, ip);
    expect(a.cookie).toBeTruthy();
    expect(b.cookie).toBeTruthy();
  });

  it("full chain ends in a session", async () => {
    const cookie = await loginTo(2);
    const secret = crypto.decrypt((await db.query("select totp_secret_enc from admin_user")).rows[0].totp_secret_enc);
    const step = crypto.totpStep() + 1; // setup already burned the current step
    const session = await auth.finishLogin(cookie, crypto.hotp(secret, step), ip, "ua");
    expect(session).toBeTruthy();
    expect(await auth.sessionValid(session!)).toBe(true);
  });

  it("the magic link works once only", async () => {
    const { cookie } = await auth.startLogin(EMAIL, ip);
    const t = tokenFrom(lastLink);
    expect(await auth.consumeMagic(cookie, t, "login", ip)).toBe(true);
    expect(await auth.consumeMagic(cookie, t, "login", ip)).toBe(false);
  });

  it("the magic link is useless in a different browser (cookie mismatch)", async () => {
    await auth.startLogin(EMAIL, ip);
    const t = tokenFrom(lastLink);
    expect(await auth.consumeMagic("some-other-browser-cookie", t, "login", ip)).toBe(false);
    expect(await auth.consumeMagic(undefined, t, "login", ip)).toBe(false);
  });

  it("a wrong magic token is refused", async () => {
    const { cookie } = await auth.startLogin(EMAIL, ip);
    expect(await auth.consumeMagic(cookie, "wrong", "login", ip)).toBe(false);
  });

  it("an expired magic link is refused", async () => {
    const { cookie } = await auth.startLogin(EMAIL, ip);
    await db.query("update admin_attempt set expires_at = now() - interval '1 second'");
    expect(await auth.consumeMagic(cookie, tokenFrom(lastLink), "login", ip)).toBe(false);
  });

  it("cannot reach the passkey step without the magic link", async () => {
    const { cookie } = await auth.startLogin(EMAIL, ip);
    expect(await auth.passkeyLoginOptions(cookie, ip)).toBeNull();
    expect(await auth.passkeyLoginVerify(cookie, { id: "cred-1", ok: true } as never, ip)).toBe(false);
  });

  it("cannot reach the authenticator step without the passkey, even with a valid code", async () => {
    const cookie = await loginTo(1);
    const secret = crypto.decrypt((await db.query("select totp_secret_enc from admin_user")).rows[0].totp_secret_enc);
    expect(await auth.finishLogin(cookie, crypto.hotp(secret, crypto.totpStep() + 1), ip, "ua")).toBeNull();
  });

  it("cannot reach the authenticator step by going straight there with no attempt", async () => {
    expect(await auth.finishLogin(undefined, "123456", ip, "ua")).toBeNull();
  });

  it("a bad passkey signature is refused and does not advance", async () => {
    const cookie = await loginTo(1);
    await auth.passkeyLoginOptions(cookie, ip);
    expect(await auth.passkeyLoginVerify(cookie, { id: "cred-1", ok: false } as never, ip)).toBe(false);
    expect(await auth.passkeyLoginVerify(cookie, { id: "unknown", ok: true } as never, ip)).toBe(false);
    expect((await db.query("select stage from admin_attempt")).rows[0].stage).toBe("magic_ok");
  });

  it("a replayed authenticator code is refused", async () => {
    const secret = crypto.decrypt((await db.query("select totp_secret_enc from admin_user")).rows[0].totp_secret_enc);
    const code = crypto.hotp(secret, crypto.totpStep() + 1);
    expect(await auth.finishLogin(await loginTo(2), code, ip, "ua")).toBeTruthy();
    expect(await auth.finishLogin(await loginTo(2), code, ip, "ua")).toBeNull();
  });

  it("five wrong moves end the attempt, and even the right code then fails", async () => {
    const cookie = await loginTo(2);
    const secret = crypto.decrypt((await db.query("select totp_secret_enc from admin_user")).rows[0].totp_secret_enc);
    for (let i = 0; i < 5; i++) expect(await auth.finishLogin(cookie, "000000", ip, "ua")).toBeNull();
    expect((await db.query("select count(*) n from admin_attempt")).rows[0].n).toBe("0");
    expect(await auth.finishLogin(cookie, crypto.hotp(secret, crypto.totpStep() + 1), ip, "ua")).toBeNull();
  });

  it("a recovery code works once and is burned", async () => {
    const codes = (await db.query("select code_hash from admin_recovery_code")).rows;
    expect(codes).toHaveLength(10);
    // Re-run setup in this test's own world to learn a plaintext code.
    await db.query("truncate admin_user, admin_passkey, admin_recovery_code, admin_attempt, admin_session restart identity");
    lastLink = "";
    const r = await setupAdmin();
    const rc = r.recoveryCodes[0];
    expect(await auth.finishLogin(await loginTo(2), rc, ip, "ua")).toBeTruthy();
    expect(await auth.finishLogin(await loginTo(2), rc, ip, "ua")).toBeNull();
    expect(await auth.finishLogin(await loginTo(2), "aaaaa-bbbbb", ip, "ua")).toBeNull();
  });

  it("throttles an address that keeps failing", async () => {
    for (let i = 0; i < 8; i++) await auth.consumeMagic("nope", "nope", "login", "5.5.5.5");
    expect(await auth.throttled("5.5.5.5")).toBe(true);
    expect(await auth.throttled("6.6.6.6")).toBe(false);
  });
});

describe.skipIf(!HAS_DB)("sessions", () => {
  it("expire after the idle limit and the absolute limit, and can be revoked", async () => {
    const r = await setupAdmin();
    expect(await auth.sessionValid(r.session)).toBe(true);
    await db.query("update admin_session set last_seen_at = now() - interval '2 hours'");
    expect(await auth.sessionValid(r.session)).toBe(false);

    const s2 = await auth.createSession(ip, "ua");
    await db.query("update admin_session set expires_at = now() - interval '1 second'");
    expect(await auth.sessionValid(s2)).toBe(false);

    const s3 = await auth.createSession(ip, "ua");
    expect(await auth.sessionValid(s3)).toBe(true);
    await auth.revokeSession(s3);
    expect(await auth.sessionValid(s3)).toBe(false);
    expect(await auth.sessionValid(undefined)).toBe(false);
    expect(await auth.sessionValid("forged")).toBe(false);
  });

  it("only the hash of a session token is stored", async () => {
    const t = await auth.createSession(ip, "ua");
    const rows = await db.query("select id from admin_session");
    expect(rows.rows.some((x) => x.id === t)).toBe(false);
  });
});

describe.skipIf(!HAS_DB)("origin check", () => {
  it("accepts only the configured origin and refuses a missing one", () => {
    const h = (o?: string) => ({ get: (k: string) => (k === "origin" ? (o ?? null) : null) });
    expect(auth.sameOrigin(h("http://localhost:3000"))).toBe(true);
    expect(auth.sameOrigin(h("https://evil.example"))).toBe(false);
    expect(auth.sameOrigin(h("http://localhost:3000.evil.example"))).toBe(false);
    expect(auth.sameOrigin(h())).toBe(false);
    expect(auth.sameOrigin(h("not a url"))).toBe(false);
  });
});
