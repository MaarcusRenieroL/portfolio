import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Branch coverage for src/lib/server/auth.ts with a scripted database (no real DB, no network).
 * The chain itself is covered against real Postgres in auth-chain.test.ts; this pins the edge/failure paths.
 */
type Res = { rows: unknown[]; rowCount?: number };
const m = vi.hoisted(() => ({
  route: (() => ({ rows: [], rowCount: 0 })) as (sql: string, p: unknown[]) => Res | Promise<Res>,
  sqls: [] as { sql: string; p: unknown[] }[],
  client: { query: vi.fn(), release: vi.fn() },
  connect: vi.fn(),
  send: vi.fn(),
  writeFileSync: vi.fn(),
  genAuth: vi.fn(),
  genReg: vi.fn(),
  verAuth: vi.fn(),
  verReg: vi.fn(),
}));

vi.mock("~/lib/server/db", () => ({
  query: async (sql: string, p: unknown[] = []) => {
    m.sqls.push({ sql, p });
    return m.route(sql, p);
  },
  pool: () => ({ connect: m.connect }),
}));
vi.mock("resend", () => ({ Resend: class { emails = { send: m.send }; } }));
vi.mock("node:fs", async (orig) => ({ ...(await orig<typeof import("node:fs")>()), writeFileSync: m.writeFileSync }));
vi.mock("@simplewebauthn/server", () => ({
  generateAuthenticationOptions: m.genAuth,
  generateRegistrationOptions: m.genReg,
  verifyAuthenticationResponse: m.verAuth,
  verifyRegistrationResponse: m.verReg,
}));

import * as auth from "~/lib/server/auth";
import * as c from "~/lib/server/crypto";

const EMAIL = "owner@example.com";
const IP = "1.2.3.4";
const future = () => new Date(Date.now() + 60_000);
const att = (o: Record<string, unknown> = {}) => ({ id: "x", kind: "login", stage: "magic_sent", magic_hash: c.sha256("tok"), challenge: null, pending: null, failures: 0, expires_at: future(), ...o });
/** Route by a fragment of SQL; later matches win. */
function script(rules: Record<string, (p: unknown[]) => Res | Promise<Res>>) {
  m.route = (sql, p) => {
    for (const [frag, fn] of Object.entries(rules)) if (sql.includes(frag)) return fn(p);
    return { rows: [], rowCount: 0 };
  };
}
const ran = (frag: string) => m.sqls.filter((s) => s.sql.includes(frag));

beforeEach(() => {
  m.sqls.length = 0;
  m.route = () => ({ rows: [], rowCount: 0 });
  for (const f of [m.send, m.writeFileSync, m.genAuth, m.genReg, m.verAuth, m.verReg, m.connect, m.client.query, m.client.release]) f.mockReset();
  m.client.query.mockResolvedValue({ rows: [] });
  m.connect.mockResolvedValue(m.client);
  m.send.mockResolvedValue({ error: null });
  vi.stubEnv("ADMIN_SECRET", "s".repeat(48));
  vi.stubEnv("MY_EMAIL", EMAIL);
  vi.stubEnv("SETUP_TOKEN", "setup-token-0123456789");
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_EMAIL", "");
  vi.stubEnv("ADMIN_E2E_LINK_FILE", "");
  vi.stubEnv("WEBAUTHN_RP_ID", undefined);
  vi.stubEnv("WEBAUTHN_ORIGIN", undefined);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("configuration helpers", () => {
  it("adminEmail is trimmed, lower-cased and empty when unset", () => {
    vi.stubEnv("MY_EMAIL", "  Owner@Example.COM ");
    expect(auth.adminEmail()).toBe("owner@example.com");
    vi.stubEnv("MY_EMAIL", "");
    expect(auth.adminEmail()).toBe("");
    delete process.env.MY_EMAIL;
    expect(auth.adminEmail()).toBe("");
  });
  it("appUrl defaults to localhost and drops one trailing slash; rp values derive from it unless overridden", () => {
    delete process.env.APP_URL;
    expect(auth.appUrl()).toBe("http://localhost:3000");
    vi.stubEnv("APP_URL", "https://site.example.com/");
    expect(auth.appUrl()).toBe("https://site.example.com");
    expect(auth.rpID()).toBe("site.example.com");
    expect(auth.rpOrigin()).toBe("https://site.example.com");
    delete process.env.WEBAUTHN_RP_ID;
    delete process.env.WEBAUTHN_ORIGIN;
    expect(auth.rpID()).toBe("site.example.com");
    vi.stubEnv("WEBAUTHN_RP_ID", "example.com");
    vi.stubEnv("WEBAUTHN_ORIGIN", "https://other.example.com");
    expect(auth.rpID()).toBe("example.com");
    expect(auth.rpOrigin()).toBe("https://other.example.com");
  });
  it("uses __Host- cookies, secure only in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect([auth.isProd(), auth.ATTEMPT_COOKIE(), auth.SESSION_COOKIE()]).toEqual([false, "adm_a", "adm_s"]);
    expect(auth.cookieOptions(60)).toEqual({ httpOnly: true, secure: false, sameSite: "strict", path: "/", maxAge: 60 });
    vi.stubEnv("NODE_ENV", "production");
    expect([auth.isProd(), auth.ATTEMPT_COOKIE(), auth.SESSION_COOKIE()]).toEqual([true, "__Host-adm_a", "__Host-adm_s"]);
    expect(auth.cookieOptions(5)).toMatchObject({ secure: true, httpOnly: true, sameSite: "strict" });
  });
});

describe("sameOrigin", () => {
  const h = (origin: string | null) => ({ get: () => origin });
  it("accepts only the configured origin", () => {
    expect(auth.sameOrigin(h("http://localhost:3000"))).toBe(true);
    expect(auth.sameOrigin(h("http://localhost:3000/"))).toBe(true);
    expect(auth.sameOrigin(h("http://localhost:3001"))).toBe(false);
    expect(auth.sameOrigin(h("https://localhost:3000"))).toBe(false);
    expect(auth.sameOrigin(h("http://localhost:3000.evil.com"))).toBe(false);
    expect(auth.sameOrigin(h(null))).toBe(false);
    expect(auth.sameOrigin(h(""))).toBe(false);
    expect(auth.sameOrigin(h("not a url"))).toBe(false);
    expect(auth.sameOrigin(h("null"))).toBe(false);
  });
  it("is false (not a throw) when the configured origin is itself malformed", () => {
    vi.stubEnv("WEBAUTHN_ORIGIN", "::::");
    expect(auth.sameOrigin(h("http://localhost:3000"))).toBe(false);
  });
});

describe("audit and throttling", () => {
  it("audit hashes the ip, and a failing database never throws", async () => {
    await auth.audit("evt", IP, { a: 1 });
    expect(m.sqls[0].p[0]).toBe("evt");
    expect(m.sqls[0].p[1]).toBe(c.ipHash(IP));
    expect(JSON.stringify(m.sqls[0].p)).not.toContain(IP);
    m.route = () => {
      throw new Error("db down");
    };
    await expect(auth.audit("evt", IP)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
  it.each([
    [4, 0, 0, false],
    [5, 0, 0, true],
    [0, 7, 0, false],
    [0, 8, 0, true],
    [0, 0, 19, false],
    [0, 0, 20, true],
  ])("throttled(starts=%i, failsIp=%i, failsAll=%i) is %s", async (starts, fi, fa, want) => {
    script({
      audit_log: (p) => {
        const evs = p[0] as string[];
        if (evs.includes("login_start")) return { rows: [{ n: String(starts) }] };
        return { rows: [{ n: String(p.length === 3 ? fi : fa) }] };
      },
    });
    expect(await auth.throttled(IP)).toBe(want);
  });
});

describe("startLogin / startSetup", () => {
  it("creates an attempt and writes the link to the test hook file when email is unconfigured", async () => {
    vi.stubEnv("ADMIN_E2E_LINK_FILE", "/tmp/never-written");
    script({ "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    const { cookie } = await auth.startLogin(` ${EMAIL.toUpperCase()} `, IP);
    expect(ran("insert into admin_attempt")).toHaveLength(1);
    expect(ran("insert into admin_attempt")[0].p[0]).toBe(c.sha256(cookie));
    expect(m.writeFileSync).toHaveBeenCalledWith("/tmp/never-written", expect.stringMatching(/^http:\/\/localhost:3000\/admin\/login\/verify#.+/));
    expect(console.log).toHaveBeenCalled();
  });
  it("does not log the link in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    script({ "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    await auth.startLogin(EMAIL, IP);
    expect(console.log).not.toHaveBeenCalled();
  });
  it("sends a real email when configured, and survives a send error", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_EMAIL", "from@example.com");
    script({ "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    await auth.startLogin(EMAIL, IP);
    expect(m.send).toHaveBeenCalledTimes(1);
    expect(m.send.mock.calls[0][0]).toMatchObject({ from: "from@example.com", to: EMAIL, subject: "Your admin sign-in link" });
    m.send.mockResolvedValue({ error: { message: "rejected" } });
    await expect(auth.startLogin(EMAIL, IP)).resolves.toHaveProperty("cookie");
    expect(console.error).toHaveBeenCalled();
  });
  it("setup mail has the setup subject and link", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_EMAIL", "from@example.com");
    await auth.startSetup(EMAIL, "setup-token-0123456789", IP);
    expect(m.send.mock.calls[0][0].subject).toBe("Finish setting up your admin");
    expect(m.send.mock.calls[0][0].text).toContain("/admin/setup/verify#");
  });
  it("login: no attempt for a wrong email, an empty configured email, or when no admin exists yet", async () => {
    script({ "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    expect((await auth.startLogin("someone@else.com", IP)).cookie).toBeTruthy();
    expect(ran("insert into admin_attempt")).toHaveLength(0);
    vi.stubEnv("MY_EMAIL", "");
    await auth.startLogin("", IP); // "" === "" must not count as a match
    expect(ran("insert into admin_attempt")).toHaveLength(0);
    vi.stubEnv("MY_EMAIL", EMAIL);
    script({ "select 1 from admin_user": () => ({ rows: [], rowCount: 0 }) });
    await auth.startLogin(EMAIL, IP);
    expect(ran("insert into admin_attempt")).toHaveLength(0);
    expect(m.send).not.toHaveBeenCalled();
  });
  it("setup refuses: short/unset token, wrong token, wrong email, empty admin email, admin already exists", async () => {
    const noAdmin = { "select 1 from admin_user": () => ({ rows: [], rowCount: 0 }) };
    script(noAdmin);
    vi.stubEnv("SETUP_TOKEN", "short");
    await auth.startSetup(EMAIL, "short", IP);
    vi.stubEnv("SETUP_TOKEN", "");
    await auth.startSetup(EMAIL, "", IP);
    vi.stubEnv("SETUP_TOKEN", "setup-token-0123456789");
    await auth.startSetup(EMAIL, "setup-token-WRONG-00000", IP);
    await auth.startSetup("x@y.com", "setup-token-0123456789", IP);
    vi.stubEnv("MY_EMAIL", "");
    await auth.startSetup("", "setup-token-0123456789", IP);
    vi.stubEnv("MY_EMAIL", EMAIL);
    script({ "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    await auth.startSetup(EMAIL, "setup-token-0123456789", IP);
    expect(ran("insert into admin_attempt")).toHaveLength(0);
    delete process.env.SETUP_TOKEN;
    await auth.startSetup(EMAIL, "", IP);
    expect(ran("insert into admin_attempt")).toHaveLength(0);
  });
  it("adminExists treats a null rowCount as no admin", async () => {
    script({ "select 1 from admin_user": () => ({ rows: [], rowCount: undefined }) });
    expect(await auth.adminExists()).toBe(false);
  });
});

describe("attempt loading and failure counting", () => {
  it("consumeMagic: no cookie, unknown attempt, wrong kind or stage all fail without touching the attempt", async () => {
    expect(await auth.consumeMagic(undefined, "tok", "login", IP)).toBe(false);
    expect(await auth.consumeMagic("", "tok", "login", IP)).toBe(false);
    expect(ran("from admin_attempt")).toHaveLength(0);
    script({ "from admin_attempt": () => ({ rows: [] }) });
    expect(await auth.consumeMagic("ck", "tok", "login", IP)).toBe(false);
    script({ "from admin_attempt": () => ({ rows: [att({ kind: "setup" })] }) });
    expect(await auth.consumeMagic("ck", "tok", "login", IP)).toBe(false);
    script({ "from admin_attempt": () => ({ rows: [att({ stage: "magic_ok" })] }) });
    expect(await auth.consumeMagic("ck", "tok", "login", IP)).toBe(false);
  });
  it("an expired attempt is deleted and refused", async () => {
    script({ "from admin_attempt": () => ({ rows: [att({ expires_at: new Date(Date.now() - 1) })] }) });
    expect(await auth.consumeMagic("ck", "tok", "login", IP)).toBe(false);
    expect(ran("delete from admin_attempt")).toHaveLength(1);
  });
  it("a wrong token counts a failure, the fifth failure deletes the attempt, a null result does not", async () => {
    script({ "from admin_attempt": () => ({ rows: [att()] }), "set failures": () => ({ rows: [{ failures: 4 }] }) });
    expect(await auth.consumeMagic("ck", "WRONG", "login", IP)).toBe(false);
    expect(ran("delete from admin_attempt")).toHaveLength(0);
    script({ "from admin_attempt": () => ({ rows: [att()] }), "set failures": () => ({ rows: [{ failures: 5 }] }) });
    await auth.consumeMagic("ck", "WRONG", "login", IP);
    expect(ran("delete from admin_attempt")).toHaveLength(1);
    m.sqls.length = 0;
    script({ "from admin_attempt": () => ({ rows: [att()] }), "set failures": () => ({ rows: [] }) });
    await auth.consumeMagic("ck", "WRONG", "login", IP);
    expect(ran("delete from admin_attempt")).toHaveLength(0);
  });
  it("an attempt without a magic hash cannot be consumed", async () => {
    script({ "from admin_attempt": () => ({ rows: [att({ magic_hash: null })] }), "set failures": () => ({ rows: [{ failures: 1 }] }) });
    expect(await auth.consumeMagic("ck", "", "login", IP)).toBe(false);
  });
  it("the right token advances the stage and clears the hash", async () => {
    script({ "from admin_attempt": () => ({ rows: [att()] }) });
    expect(await auth.consumeMagic("ck", "tok", "login", IP)).toBe(true);
    expect(ran("stage = 'magic_ok', magic_hash = null")).toHaveLength(1);
  });
});

describe("login passkey", () => {
  const okAttempt = (o = {}) => ({ "from admin_attempt": () => ({ rows: [att({ stage: "magic_ok", challenge: "ch", ...o })] }) });
  it("options need the magic_ok stage", async () => {
    expect(await auth.passkeyLoginOptions(undefined, IP)).toBeNull();
    expect(ran("login_fail") .length + ran("insert into audit_log").length).toBeGreaterThan(0);
  });
  it("options list stored keys (null transports allowed) and save the challenge", async () => {
    script({ ...okAttempt(), "from admin_passkey": () => ({ rows: [{ id: "k1", public_key: Buffer.from([1]), counter: "0", transports: null }, { id: "k2", public_key: Buffer.from([2]), counter: "3", transports: ["usb"] }] }) });
    m.genAuth.mockResolvedValue({ challenge: "new-ch" });
    expect(await auth.passkeyLoginOptions("ck", IP)).toEqual({ challenge: "new-ch" });
    const arg = m.genAuth.mock.calls[0][0];
    expect(arg.allowCredentials).toEqual([{ id: "k1", transports: undefined }, { id: "k2", transports: ["usb"] }]);
    expect(arg.userVerification).toBe("required");
    expect(ran("set challenge")[0].p[1]).toBe("new-ch");
  });
  it("verify: missing challenge, unknown credential, unverified, thrown, and success", async () => {
    const key = { id: "k1", public_key: Buffer.from([1, 2]), counter: "7", transports: null };
    script(okAttempt({ challenge: null }));
    expect(await auth.passkeyLoginVerify("ck", { id: "k1" } as never, IP)).toBe(false);
    expect(await auth.passkeyLoginVerify(undefined, { id: "k1" } as never, IP)).toBe(false);
    script({ ...okAttempt(), "from admin_passkey": () => ({ rows: [] }) });
    expect(await auth.passkeyLoginVerify("ck", { id: "nope" } as never, IP)).toBe(false);
    script({ ...okAttempt(), "from admin_passkey": () => ({ rows: [key] }) });
    m.verAuth.mockResolvedValueOnce({ verified: false });
    expect(await auth.passkeyLoginVerify("ck", { id: "k1" } as never, IP)).toBe(false);
    m.verAuth.mockRejectedValueOnce(new Error("bad sig"));
    expect(await auth.passkeyLoginVerify("ck", { id: "k1" } as never, IP)).toBe(false);
    expect(ran("set counter")).toHaveLength(0);
    m.verAuth.mockResolvedValueOnce({ verified: true, authenticationInfo: { newCounter: 8 } });
    expect(await auth.passkeyLoginVerify("ck", { id: "k1" } as never, IP)).toBe(true);
    expect(ran("set counter")[0].p).toEqual(["k1", 8]);
    expect(m.verAuth.mock.calls.at(-1)![0]).toMatchObject({ expectedChallenge: "ch", requireUserVerification: true, credential: { counter: 7 } });
  });
});

describe("finishLogin", () => {
  const pk = { "from admin_attempt": () => ({ rows: [att({ stage: "passkey_ok" })] }) };
  const secret = c.newTotpSecret();
  const userRow = (last = 0) => ({ "from admin_user": () => ({ rows: [{ totp_secret_enc: c.encrypt(secret), totp_last_step: String(last) }] }) });
  it("needs the passkey_ok stage", async () => {
    expect(await auth.finishLogin(undefined, "123456", IP, "ua")).toBeNull();
  });
  it("returns null when the admin row is gone", async () => {
    script({ ...pk, "from admin_user": () => ({ rows: [] }) });
    expect(await auth.finishLogin("ck", "123456", IP, "ua")).toBeNull();
  });
  it("accepts a valid TOTP once, and refuses the replay when the row has already advanced", async () => {
    const code = c.hotp(secret, c.totpStep());
    script({ ...pk, ...userRow(), "update admin_user": () => ({ rows: [], rowCount: 1 }) });
    const s = await auth.finishLogin("ck", ` ${code} `, IP, "x".repeat(500));
    expect(s).toBeTruthy();
    const ins = ran("insert into admin_session")[0];
    expect((ins.p[3] as string).length).toBe(200);
    script({ ...pk, ...userRow(), "update admin_user": () => ({ rows: [], rowCount: 0 }) });
    expect(await auth.finishLogin("ck", code, IP, "ua")).toBeNull();
    script({ ...pk, ...userRow(), "update admin_user": () => ({ rows: [], rowCount: null as never }) });
    expect(await auth.finishLogin("ck", code, IP, "ua")).toBeNull();
  });
  it("refuses a code from the past (already used step)", async () => {
    const code = c.hotp(secret, c.totpStep());
    script({ ...pk, ...userRow(c.totpStep() + 5), "update admin_user": () => ({ rows: [], rowCount: 1 }) });
    expect(await auth.finishLogin("ck", code, IP, "ua")).toBeNull();
    expect(ran("update admin_user")).toHaveLength(0);
  });
  it("recovery code: must match the format, burns exactly once, and is audited", async () => {
    script({ ...pk, ...userRow(), "update admin_recovery_code": () => ({ rows: [], rowCount: 1 }) });
    expect(await auth.finishLogin("ck", " ABCDE-01234 ", IP, "ua")).toBeTruthy();
    expect(ran("update admin_recovery_code")[0].p[0]).toBe(c.hashRecovery("abcde-01234"));
    expect(ran("insert into audit_log").some((s) => s.p[0] === "login_recovery_used")).toBe(true);
    script({ ...pk, ...userRow(), "update admin_recovery_code": () => ({ rows: [], rowCount: 0 }) });
    expect(await auth.finishLogin("ck", "abcde-01234", IP, "ua")).toBeNull();
    script({ ...pk, ...userRow(), "update admin_recovery_code": () => ({ rows: [], rowCount: undefined }) });
    expect(await auth.finishLogin("ck", "abcde-01234", IP, "ua")).toBeNull();
  });
  it.each(["", "12345", "1234567", "abcdef", "abcde-0123", "abcde_01234", "zzzzz-zzzzz", "123 456"])("rejects garbage %j without querying the code tables", async (bad) => {
    script({ ...pk, ...userRow() });
    expect(await auth.finishLogin("ck", bad, IP, "ua")).toBeNull();
    expect(ran("update admin_recovery_code")).toHaveLength(0);
    expect(ran("update admin_user")).toHaveLength(0);
  });
});

describe("setup passkey and TOTP stages", () => {
  const stage = (stg: string, o = {}) => ({ "from admin_attempt": () => ({ rows: [att({ kind: "setup", stage: stg, ...o })] }) });
  it("options are refused without the stage or when an admin already exists", async () => {
    expect(await auth.setupPasskeyOptions(undefined, IP)).toBeNull();
    script({ ...stage("magic_ok"), "select 1 from admin_user": () => ({ rows: [{}], rowCount: 1 }) });
    expect(await auth.setupPasskeyOptions("ck", IP)).toBeNull();
    expect(m.genReg).not.toHaveBeenCalled();
  });
  it("options are generated and the challenge stored", async () => {
    script({ ...stage("magic_ok"), "select 1 from admin_user": () => ({ rows: [], rowCount: 0 }) });
    m.genReg.mockResolvedValue({ challenge: "reg" });
    expect(await auth.setupPasskeyOptions("ck", IP)).toEqual({ challenge: "reg" });
    expect(ran("set challenge")[0].p[1]).toBe("reg");
    expect(m.genReg.mock.calls[0][0]).toMatchObject({ userName: EMAIL, attestationType: "none" });
  });
  it("verify: refuses without challenge, on unverified and on thrown; stores the credential on success", async () => {
    script(stage("magic_ok", { challenge: null }));
    expect(await auth.setupPasskeyVerify("ck", {} as never, IP)).toBe(false);
    script(stage("magic_ok", { challenge: "ch" }));
    m.verReg.mockResolvedValueOnce({ verified: false });
    expect(await auth.setupPasskeyVerify("ck", {} as never, IP)).toBe(false);
    m.verReg.mockRejectedValueOnce(new Error("x"));
    expect(await auth.setupPasskeyVerify("ck", {} as never, IP)).toBe(false);
    m.verReg.mockResolvedValueOnce({ verified: true, registrationInfo: { credential: { id: "c1", publicKey: new Uint8Array([9, 8]), counter: 0, transports: undefined } } });
    expect(await auth.setupPasskeyVerify("ck", {} as never, IP)).toBe(true);
    const upd = ran("stage = 'passkey_added'")[0];
    expect(JSON.parse(JSON.parse(upd.p[1] as string).passkey)).toEqual({ id: "c1", publicKey: Buffer.from([9, 8]).toString("base64"), counter: 0, transports: [] });
  });
  it("totp begin: refused without the stage, otherwise returns secret, uri and an svg QR, keeping the pending passkey", async () => {
    expect(await auth.setupTotpBegin(undefined, IP)).toBeNull();
    script(stage("passkey_added", { pending: { passkey: "{}" } }));
    const r = (await auth.setupTotpBegin("ck", IP))!;
    expect(r.uri).toContain(`secret=${r.secret}`);
    expect(r.qr).toContain("<svg");
    const saved = JSON.parse(ran("stage = 'totp_pending'")[0].p[1] as string);
    expect(saved.passkey).toBe("{}");
    expect(c.decrypt(saved.totp)).toBe(r.secret);
    script(stage("passkey_added", { pending: null }));
    expect(await auth.setupTotpBegin("ck", IP)).toBeTruthy();
  });
});

describe("finishSetup", () => {
  const secret = c.newTotpSecret();
  const pendingNow = () => ({ totp: c.encrypt(secret), passkey: JSON.stringify({ id: "c1", publicKey: Buffer.from([1]).toString("base64"), counter: 0, transports: ["internal"] }) });
  const at = (p: unknown) => ({ "from admin_attempt": () => ({ rows: [att({ kind: "setup", stage: "totp_pending", pending: typeof p === "function" ? (p as () => unknown)() : p })] }) });
  it.each([[null], [{ totp: "x" }], [{ passkey: "x" }]])("refuses incomplete pending state %j", async (p) => {
    script(at(p));
    expect(await auth.finishSetup("ck", "123456", IP, "ua")).toBeNull();
    expect(m.connect).not.toHaveBeenCalled();
  });
  it("refuses without any attempt", async () => {
    expect(await auth.finishSetup(undefined, "123456", IP, "ua")).toBeNull();
  });
  it("a wrong code writes nothing", async () => {
    script(at(pendingNow));
    const wrong = c.hotp(secret, c.totpStep() + 50);
    expect(await auth.finishSetup("ck", wrong, IP, "ua")).toBeNull();
    expect(m.connect).not.toHaveBeenCalled();
  });
  it("writes everything in one transaction and returns ten recovery codes plus a session", async () => {
    script(at(pendingNow));
    const r = (await auth.finishSetup("ck", c.hotp(secret, c.totpStep()), IP, "ua"))!;
    expect(r.recoveryCodes).toHaveLength(10);
    const sql = m.client.query.mock.calls.map((x) => String(x[0]));
    expect(sql[0]).toBe("begin");
    expect(sql.at(-1)).toBe("commit");
    expect(sql.filter((s) => s.includes("admin_recovery_code"))).toHaveLength(10);
    expect(m.client.release).toHaveBeenCalledTimes(1);
    expect(r.session).toBeTruthy();
  });
  it("rolls back, releases the connection and reports failure when a write fails (e.g. admin already exists)", async () => {
    script(at(pendingNow));
    m.client.query.mockImplementation(async (s: string) => {
      if (s.includes("insert into admin_user")) throw new Error("duplicate key");
      return { rows: [] };
    });
    expect(await auth.finishSetup("ck", c.hotp(secret, c.totpStep()), IP, "ua")).toBeNull();
    const sql = m.client.query.mock.calls.map((x) => String(x[0]));
    expect(sql).toContain("rollback");
    expect(sql).not.toContain("commit");
    expect(m.client.release).toHaveBeenCalledTimes(1);
    expect(ran("insert into admin_session")).toHaveLength(0);
  });
});

describe("sessions", () => {
  const row = (lastSeenAgoMs: number, expiresInMs: number) => ({ "from admin_session": () => ({ rows: [{ last_seen_at: new Date(Date.now() - lastSeenAgoMs), expires_at: new Date(Date.now() + expiresInMs) }] }) });
  it("createSession stores only the hash, an 8h expiry and a truncated user agent", async () => {
    const t = await auth.createSession(IP, "u".repeat(300));
    const p = ran("insert into admin_session")[0].p;
    expect(p[0]).toBe(c.sha256(t));
    expect(p[0]).not.toBe(t);
    expect((p[1] as Date).getTime() - Date.now()).toBeGreaterThan(auth.SESSION_ABSOLUTE_MS - 5_000);
    expect((p[3] as string).length).toBe(200);
  });
  it("no token or unknown token is invalid", async () => {
    expect(await auth.sessionValid(undefined)).toBe(false);
    expect(await auth.sessionValid("")).toBe(false);
    script({ "from admin_session": () => ({ rows: [] }) });
    expect(await auth.sessionValid("t")).toBe(false);
  });
  it("expired or idle sessions are deleted", async () => {
    script(row(1000, -1));
    expect(await auth.sessionValid("t")).toBe(false);
    expect(ran("delete from admin_session")).toHaveLength(1);
    script(row(auth.SESSION_IDLE_MS + 1000, 100_000));
    expect(await auth.sessionValid("t")).toBe(false);
    expect(ran("delete from admin_session")).toHaveLength(2);
  });
  it("a live session refreshes last_seen at most once a minute", async () => {
    script(row(30_000, 100_000));
    expect(await auth.sessionValid("t")).toBe(true);
    expect(ran("update admin_session")).toHaveLength(0);
    script(row(61_000, 100_000));
    expect(await auth.sessionValid("t")).toBe(true);
    expect(ran("update admin_session")).toHaveLength(1);
  });
  it("revoke helpers", async () => {
    await auth.revokeSession(undefined);
    expect(m.sqls).toHaveLength(0);
    await auth.revokeSession("t");
    expect(ran("delete from admin_session")[0].p).toEqual([c.sha256("t")]);
    await auth.revokeAllSessions();
    expect(ran("delete from admin_session")).toHaveLength(2);
  });
});
