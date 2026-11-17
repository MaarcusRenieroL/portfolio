import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => {
  const jar = new Map<string, string>();
  return {
    jar,
    set: vi.fn((k: string, v: string) => void jar.set(k, v)),
    del: vi.fn((k: string) => void jar.delete(k)),
    hdrs: new Map<string, string>(),
    dm: { disable: vi.fn(), enable: vi.fn() },
    hasDb: vi.fn(() => true),
    auth: {
      sameOrigin: vi.fn(() => true),
      throttled: vi.fn(async () => false),
      startSetup: vi.fn(async () => ({ cookie: "att-setup" })),
      startLogin: vi.fn(async () => ({ cookie: "att-login" })),
      consumeMagic: vi.fn(async () => true),
      setupPasskeyOptions: vi.fn(async () => ({ challenge: "s" })),
      passkeyLoginOptions: vi.fn(async () => ({ challenge: "l" })),
      setupPasskeyVerify: vi.fn(async () => true),
      passkeyLoginVerify: vi.fn(async () => true),
      setupTotpBegin: vi.fn(async () => ({ secret: "x" })),
      finishSetup: vi.fn(async () => ({ session: "sess-s", recoveryCodes: ["a", "b"] })),
      finishLogin: vi.fn(async () => "sess-l"),
      revokeSession: vi.fn(async () => undefined),
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (k: string) => (m.jar.has(k) ? { value: m.jar.get(k) } : undefined), set: m.set, delete: m.del }),
  headers: async () => ({ get: (k: string) => m.hdrs.get(k.toLowerCase()) ?? null }),
  draftMode: async () => m.dm,
}));
vi.mock("~/lib/server/db", () => ({ hasDb: () => m.hasDb(), query: vi.fn(), pool: vi.fn() }));
vi.mock("~/lib/server/auth", () => ({
  ATTEMPT_COOKIE: () => "att",
  SESSION_COOKIE: () => "sess",
  STAGE_TTL_MS: 600_000,
  SESSION_ABSOLUTE_MS: 3_600_000,
  cookieOptions: (s: number) => ({ maxAge: s }),
  ...m.auth,
}));

import { POST } from "~/app/api/admin/auth/[step]/route";

const call = (step: string, body?: unknown, raw?: string) =>
  POST(new Request("http://x/api/admin/auth/" + step, { method: "POST", body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) }), {
    params: Promise.resolve({ step }),
  });

beforeEach(() => {
  vi.clearAllMocks();
  m.jar.clear();
  m.hdrs.clear();
  m.hdrs.set("x-real-ip", "1.2.3.4");
  m.hasDb.mockReturnValue(true);
  m.auth.sameOrigin.mockReturnValue(true);
  m.auth.throttled.mockResolvedValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("admin auth route gating", () => {
  it("403 on cross-origin before anything else runs", async () => {
    m.auth.sameOrigin.mockReturnValue(false);
    const r = await call("start", { email: "a@b.c" });
    expect(r.status).toBe(403);
    expect(m.auth.startLogin).not.toHaveBeenCalled();
    expect(m.auth.throttled).not.toHaveBeenCalled();
  });
  it("503 without a database", async () => {
    m.hasDb.mockReturnValue(false);
    expect((await call("start", {})).status).toBe(503);
  });
  it("429 when throttled, with no-store", async () => {
    m.auth.throttled.mockResolvedValue(true);
    const r = await call("start", { email: "a@b.c" });
    expect(r.status).toBe(429);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(m.auth.startLogin).not.toHaveBeenCalled();
  });
  it("404 on unknown step", async () => {
    expect((await call("nope", {})).status).toBe(404);
  });
  it("500 and generic body when a step throws (no leak)", async () => {
    m.auth.startLogin.mockRejectedValueOnce(new Error("secret db detail"));
    const r = await call("start", { email: "a@b.c" });
    expect(r.status).toBe(500);
    expect(JSON.stringify(await r.json())).not.toContain("secret");
  });
  it("malformed JSON is treated as an empty body", async () => {
    const r = await call("start", undefined, "{not json");
    expect(r.status).toBe(200);
    expect(m.auth.startLogin).toHaveBeenCalledWith("", "1.2.3.4");
  });
  it("uses the first x-vercel-forwarded-for hop as the client key", async () => {
    m.hdrs.set("x-vercel-forwarded-for", "9.9.9.9, 8.8.8.8");
    await call("start", { email: "a@b.c" });
    expect(m.auth.throttled).toHaveBeenCalledWith("9.9.9.9");
  });
});

describe("start", () => {
  it("login: sets attempt cookie and gives a uniform message", async () => {
    const r = await call("start", { email: "a@b.c" });
    expect(await r.json()).toMatchObject({ ok: true });
    expect(m.jar.get("att")).toBe("att-login");
    expect(m.auth.startSetup).not.toHaveBeenCalled();
  });
  it("setup: passes email and token", async () => {
    await call("start", { kind: "setup", email: "a@b.c", token: "tok" });
    expect(m.auth.startSetup).toHaveBeenCalledWith("a@b.c", "tok", "1.2.3.4");
    expect(m.jar.get("att")).toBe("att-setup");
  });
  it("oversized or non-string email/token are dropped to empty", async () => {
    await call("start", { kind: "setup", email: "a".repeat(321), token: 123 });
    expect(m.auth.startSetup).toHaveBeenCalledWith("", "", "1.2.3.4");
    await call("start", { email: ["x"] });
    expect(m.auth.startLogin).toHaveBeenCalledWith("", "1.2.3.4");
  });
  it("unknown kind falls back to login", async () => {
    await call("start", { kind: "admin", email: "a@b.c" });
    expect(m.auth.startLogin).toHaveBeenCalled();
  });
});

describe("magic", () => {
  it("ok / 401", async () => {
    m.jar.set("att", "cookie");
    expect((await call("magic", { token: "t" })).status).toBe(200);
    expect(m.auth.consumeMagic).toHaveBeenCalledWith("cookie", "t", "login", "1.2.3.4");
    m.auth.consumeMagic.mockResolvedValue(false);
    expect((await call("magic", { token: "t", kind: "setup" })).status).toBe(401);
  });
  it("token over 200 chars is blanked", async () => {
    await call("magic", { token: "x".repeat(201) });
    expect(m.auth.consumeMagic).toHaveBeenCalledWith(undefined, "", "login", "1.2.3.4");
  });
});

describe("passkey-options / passkey-verify", () => {
  it("options for login and setup, 401 when null", async () => {
    expect(await (await call("passkey-options", {})).json()).toMatchObject({ ok: true, options: { challenge: "l" } });
    expect(await (await call("passkey-options", { kind: "setup" })).json()).toMatchObject({ options: { challenge: "s" } });
    m.auth.passkeyLoginOptions.mockResolvedValue(null as never);
    expect((await call("passkey-options", {})).status).toBe(401);
  });
  it("verify without response is 400 and never reaches auth", async () => {
    expect((await call("passkey-verify", {})).status).toBe(400);
    expect(m.auth.passkeyLoginVerify).not.toHaveBeenCalled();
  });
  it("verify success, failure, setup", async () => {
    expect((await call("passkey-verify", { response: { id: 1 } })).status).toBe(200);
    m.auth.passkeyLoginVerify.mockResolvedValue(false);
    expect((await call("passkey-verify", { response: { id: 1 } })).status).toBe(401);
    expect((await call("passkey-verify", { kind: "setup", response: { id: 1 } })).status).toBe(200);
    expect(m.auth.setupPasskeyVerify).toHaveBeenCalled();
  });
});

describe("totp-begin", () => {
  it("returns payload or 401", async () => {
    expect(await (await call("totp-begin", {})).json()).toMatchObject({ ok: true, secret: "x" });
    m.auth.setupTotpBegin.mockResolvedValue(null as never);
    expect((await call("totp-begin", {})).status).toBe(401);
  });
});

describe("finish", () => {
  it("login success sets session cookie, deletes attempt cookie, no recovery codes", async () => {
    m.hdrs.set("user-agent", "UA");
    m.jar.set("att", "a");
    const r = await call("finish", { code: "123456" });
    const j = await r.json();
    expect(j).toEqual({ ok: true });
    expect(m.auth.finishLogin).toHaveBeenCalledWith("a", "123456", "1.2.3.4", "UA");
    expect(m.jar.get("sess")).toBe("sess-l");
    expect(m.jar.has("att")).toBe(false);
  });
  it("login failure sets no session", async () => {
    m.auth.finishLogin.mockResolvedValue(null as never);
    expect((await call("finish", { code: "000000" })).status).toBe(401);
    expect(m.jar.has("sess")).toBe(false);
    expect(m.set).not.toHaveBeenCalledWith("sess", expect.anything(), expect.anything());
  });
  it("setup success returns recovery codes and sets session", async () => {
    const j = await (await call("finish", { kind: "setup", code: "1" })).json();
    expect(j).toEqual({ ok: true, recoveryCodes: ["a", "b"] });
    expect(m.jar.get("sess")).toBe("sess-s");
  });
  it("setup failure is 401 with no cookie", async () => {
    m.auth.finishSetup.mockResolvedValue(null as never);
    expect((await call("finish", { kind: "setup", code: "1" })).status).toBe(401);
    expect(m.jar.has("sess")).toBe(false);
  });
  it("code over 40 chars is blanked", async () => {
    await call("finish", { code: "9".repeat(41) });
    expect(m.auth.finishLogin).toHaveBeenCalledWith(undefined, "", "1.2.3.4", "");
  });
});

describe("logout", () => {
  it("revokes, clears cookie, disables draft mode", async () => {
    m.jar.set("sess", "tok");
    const r = await call("logout", {});
    expect(r.status).toBe(200);
    expect(m.auth.revokeSession).toHaveBeenCalledWith("tok");
    expect(m.jar.has("sess")).toBe(false);
    expect(m.dm.disable).toHaveBeenCalled();
  });
  it("is still blocked cross-origin (no CSRF logout)", async () => {
    m.auth.sameOrigin.mockReturnValue(false);
    expect((await call("logout", {})).status).toBe(403);
    expect(m.auth.revokeSession).not.toHaveBeenCalled();
  });
});
