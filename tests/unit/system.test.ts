import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  dbq: vi.fn(),
  listPublic: vi.fn(async (_p: string) => [] as string[]),
  headPrivate: vi.fn(async (_k: string) => null as unknown),
}));

vi.mock("~/lib/server/db", () => ({ query: (...a: unknown[]) => h.dbq(...a), hasDb: () => true }));
vi.mock("~/lib/server/r2", async (orig) => {
  const real = await orig<typeof import("~/lib/server/r2")>();
  return { ...real, listPublic: (p: string) => h.listPublic(p), headPrivate: (k: string) => h.headPrivate(k) };
});

import { checkDatabase, checkStorage, configChecks, LATEST_MIGRATION, systemChecks } from "~/lib/server/system";

const R2 = {
  R2_ACCOUNT_ID: "acc",
  R2_ACCESS_KEY_ID: "k",
  R2_SECRET_ACCESS_KEY: "s",
  R2_BUCKET_PUBLIC: "pub",
  R2_BUCKET_PRIVATE: "priv",
  NEXT_PUBLIC_ASSETS_URL: "https://assets.test",
};
const stubR2 = () => Object.entries(R2).forEach(([k, v]) => vi.stubEnv(k, v));

beforeEach(() => {
  h.dbq.mockReset();
  h.listPublic.mockReset().mockResolvedValue([]);
  h.headPrivate.mockReset().mockResolvedValue(null);
  vi.stubEnv("DATABASE_URL", "postgres://x/portfolio");
  for (const k of Object.keys(R2)) vi.stubEnv(k, "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("LATEST_MIGRATION", () => {
  it("is the newest file in db/migrations, so the schema check can't go stale", () => {
    const files = fs.readdirSync(path.join("db", "migrations")).filter((f) => f.endsWith(".sql")).sort();
    expect(LATEST_MIGRATION).toBe(files.at(-1));
  });
});

describe("checkDatabase", () => {
  it("is an error without DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(await checkDatabase()).toMatchObject({ state: "error" });
    expect(h.dbq).not.toHaveBeenCalled();
  });
  it("ok when the schema is current, with the latency", async () => {
    h.dbq.mockResolvedValue({ rows: [{ name: LATEST_MIGRATION }] });
    const c = await checkDatabase();
    expect(c.state).toBe("ok");
    expect(c.detail).toMatch(/\d+ ms/);
  });
  it("warns, naming both versions, when migrations are behind (e.g. production never migrated)", async () => {
    h.dbq.mockResolvedValue({ rows: [{ name: "006_contact_messages.sql" }] });
    const c = await checkDatabase();
    expect(c.state).toBe("warn");
    expect(c.detail).toContain("006_contact_messages.sql");
    expect(c.detail).toContain("pnpm db:migrate");
    h.dbq.mockResolvedValue({ rows: [{ name: null }] });
    expect((await checkDatabase()).detail).toContain("nothing");
  });
  it("errors when unreachable, and gives up after its time limit", async () => {
    h.dbq.mockRejectedValue(Object.assign(new Error('password authentication failed for user "neondb_owner"'), { code: "28P01" }));
    const c = await checkDatabase();
    expect(c).toMatchObject({ state: "error", detail: "Not reachable: the username or password was refused." });
    expect(c.detail).not.toContain("neondb_owner");
    vi.useFakeTimers();
    h.dbq.mockReturnValue(new Promise(() => {}));
    const p = checkDatabase();
    await vi.advanceTimersByTimeAsync(4001);
    expect(await p).toMatchObject({ state: "error", detail: expect.stringContaining("no answer in 4s") });
  });
});

describe("checkDatabase edge cases", () => {
  it("a reachable but never-migrated database is a warning, not 'not reachable'", async () => {
    h.dbq.mockRejectedValue(Object.assign(new Error('relation "_migration" does not exist'), { code: "42P01" }));
    expect(await checkDatabase()).toMatchObject({ state: "warn", detail: expect.stringContaining("no migrations have run") });
  });
  it("compares migration numbers, not strings, and says so when the database is ahead", async () => {
    h.dbq.mockResolvedValue({ rows: [{ name: "1000_future.sql" }] });
    expect(await checkDatabase()).toMatchObject({ state: "ok", detail: expect.stringContaining("newer than this code expects") });
  });
  it("maps each driver failure to a fixed reason", async () => {
    const { dbReason } = await import("~/lib/server/system");
    const e = (code: string, msg = "x") => Object.assign(new Error(msg), { code });
    expect(dbReason(e("3D000"))).toBe("that database doesn't exist");
    expect(dbReason(e("ENOTFOUND"))).toBe("the host name doesn't resolve");
    expect(dbReason(e("ETIMEDOUT"))).toBe("the connection timed out");
    expect(dbReason(new Error("self-signed certificate in chain"))).toBe("the TLS/SSL settings don't match the server");
    expect(dbReason(null)).toBe("the connection failed");
  });
});

describe("Site address row", () => {
  it("is an error in production without APP_URL (sign-in links would point at localhost), just off in dev", () => {
    const prod = configChecks({ NODE_ENV: "production" } as unknown as NodeJS.ProcessEnv).find((c) => c.id === "appurl")!;
    expect(prod.state).toBe("error");
    const dev = configChecks({ NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv).find((c) => c.id === "appurl")!;
    expect(dev.state).toBe("off");
  });
});

describe("checkStorage", () => {
  it("reports off, saying R2 isn't set up, without R2", async () => {
    expect(await checkStorage()).toMatchObject({ state: "off", detail: expect.stringContaining("R2 isn't set up") });
    expect(h.listPublic).not.toHaveBeenCalled();
  });
  it("with R2: ok when both buckets answer and the assets domain serves the résumé", async () => {
    stubR2();
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const c = await checkStorage();
    expect(c).toMatchObject({ state: "ok", detail: expect.stringContaining("assets.test") });
    expect(fetch).toHaveBeenCalledWith("https://assets.test/resume.pdf", expect.objectContaining({ method: "HEAD" }));
  });
  it("with R2: error when credentials or a bucket are wrong", async () => {
    stubR2();
    h.headPrivate.mockRejectedValue(new Error("R2 HEAD failed (403)."));
    expect(await checkStorage()).toMatchObject({ state: "error", detail: expect.stringContaining("403") });
  });
  it("with R2: warns when the one-time upload hasn't run or the domain doesn't answer", async () => {
    stubR2();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 404 })));
    expect(await checkStorage()).toMatchObject({ state: "warn", detail: expect.stringContaining("pnpm assets:upload") });
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("ENOTFOUND"))));
    expect(await checkStorage()).toMatchObject({ state: "warn", detail: expect.stringContaining("custom domain") });
  });
});

describe("configChecks", () => {
  it("lists missing variable names but never values", () => {
    const env = { RESEND_API_KEY: "re_secret_value", GEMINI_API_KEY: "g-secret" } as unknown as NodeJS.ProcessEnv;
    const rows = configChecks(env);
    const text = JSON.stringify(rows);
    expect(text).not.toContain("re_secret_value");
    expect(text).not.toContain("g-secret");
    const email = rows.find((r) => r.id === "email")!;
    expect(email.state).toBe("warn");
    expect(email.detail).toContain("RESEND_EMAIL, MY_EMAIL");
    expect(email.detail).not.toContain("RESEND_API_KEY");
    expect(rows.find((r) => r.id === "translate")!.state).toBe("ok");
    expect(rows.find((r) => r.id === "github")!.state).toBe("off");
    expect(rows.find((r) => r.id === "cron")!.state).toBe("warn");
  });
  it("everything set → all ok", () => {
    const env = Object.fromEntries(
      ["APP_URL", "RESEND_API_KEY", "RESEND_EMAIL", "MY_EMAIL", "CRON_SECRET", "GEMINI_API_KEY", "GITHUB_TOKEN", "NEXT_PUBLIC_TURNSTILE_SITEKEY", "TURNSTILE_SECRET"].map((k) => [k, "x"]),
    ) as unknown as NodeJS.ProcessEnv;
    expect(configChecks(env).every((c) => c.state === "ok")).toBe(true);
  });
});

describe("systemChecks", () => {
  it("database and storage first, then the configured-only rows", async () => {
    h.dbq.mockResolvedValue({ rows: [{ name: LATEST_MIGRATION }] });
    const ids = (await systemChecks()).map((c) => c.id);
    expect(ids.slice(0, 2)).toEqual(["db", "storage"]);
    expect(ids).toEqual(expect.arrayContaining(["email", "cron", "translate", "github", "turnstile"]));
  });
});
