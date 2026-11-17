import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Coverage for the small pure/near-pure libs: lang, r2-names, localize-ui, rate-limit, crypto. No real DB is touched. */

const m = vi.hoisted(() => ({ query: vi.fn(), notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("~/lib/server/db", () => ({ query: m.query, hasDb: () => true, pool: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (f: unknown) => f }));
vi.mock("next/navigation", () => ({ notFound: m.notFound }));
vi.mock("~/lib/site", async (orig) => {
  const real = await orig<typeof import("~/lib/site")>();
  return { ...real, CATEGORIES: [...real.CATEGORIES, ["zzz-untranslated", "Fallback Label"]] as [string, string][] };
});

import { langOf } from "~/lib/lang";
import { r2Names } from "~/lib/server/r2-names";
import { categoriesFor, statusFor } from "~/lib/localize-ui";
import { MAINTENANCE, NOT_FOUND, NOT_FOUND_DE, SERVER_ERROR, SERVER_ERROR_DE } from "~/lib/status";
import * as rl from "~/lib/rate-limit";
import * as c from "~/lib/server/crypto";

const R2 = { R2_ACCOUNT_ID: "a", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_BUCKET_PUBLIC: "pub", R2_BUCKET_PRIVATE: "priv", NEXT_PUBLIC_ASSETS_URL: "https://assets.example.com" };

beforeEach(() => {
  m.query.mockReset();
  m.notFound.mockClear();
});
afterEach(() => vi.unstubAllEnvs());

describe("langOf", () => {
  it("resolves supported languages", async () => {
    expect(await langOf(Promise.resolve({ lang: "de" }))).toBe("de");
    expect(await langOf(Promise.resolve({ lang: "en" }))).toBe("en");
  });
  it.each(["fr", "", "EN", "en/", "../de", "de "])("404s on %j", async (l) => {
    await expect(langOf(Promise.resolve({ lang: l }))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(m.notFound).toHaveBeenCalled();
  });
});

describe("r2Names", () => {
  it("is empty and never queries when R2 is not configured", async () => {
    for (const k of Object.keys(R2)) vi.stubEnv(k, "");
    expect((await r2Names()).size).toBe(0);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("stays empty when only some R2 variables are set", async () => {
    for (const [k, v] of Object.entries(R2)) vi.stubEnv(k, v);
    vi.stubEnv("R2_BUCKET_PRIVATE", "");
    expect((await r2Names()).size).toBe(0);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("returns a de-duplicated Set from the cached rows", async () => {
    for (const [k, v] of Object.entries(R2)) vi.stubEnv(k, v);
    m.query.mockResolvedValue({ rows: [{ pathname: "a.png" }, { pathname: "b.png" }, { pathname: "a.png" }] });
    const s = await r2Names();
    expect([...s].sort()).toEqual(["a.png", "b.png"]);
    expect(String(m.query.mock.calls[0][0])).toContain("r2:%");
  });
  it("swallows database errors and returns an empty Set", async () => {
    for (const [k, v] of Object.entries(R2)) vi.stubEnv(k, v);
    m.query.mockRejectedValue(new Error("connection refused"));
    const s = await r2Names();
    expect(s).toBeInstanceOf(Set);
    expect(s.size).toBe(0);
  });
});

describe("localize-ui", () => {
  it("translates categories per language and falls back to the English label", () => {
    const en = categoriesFor("en");
    const de = categoriesFor("de");
    expect(en.find(([id]) => id === "ai")?.[1]).toBe("AI");
    expect(de.find(([id]) => id === "ai")?.[1]).toBe("KI");
    expect(de.find(([id]) => id === "zzz-untranslated")?.[1]).toBe("Fallback Label");
    expect(en.map(([id]) => id)).toEqual(de.map(([id]) => id));
  });
  it("picks status pages by kind and language", () => {
    expect(statusFor("en", "503")).toBe(MAINTENANCE);
    expect(statusFor("de", "503")).toBe(MAINTENANCE);
    expect(statusFor("en", "404")).toBe(NOT_FOUND);
    expect(statusFor("de", "404")).toBe(NOT_FOUND_DE);
    expect(statusFor("en", "500")).toBe(SERVER_ERROR);
    expect(statusFor("de", "500")).toBe(SERVER_ERROR_DE);
  });
});

describe("rate limiters", () => {
  beforeEach(() => {
    rl.resetContactLimits();
    rl.resetBookingLimits();
    rl.resetOgLimits();
  });
  it("allows 3 contact messages per key per 10 minutes, then blocks, then recovers", () => {
    const t = 1_000_000;
    expect([1, 2, 3, 4].map(() => rl.allowContact("ip", t))).toEqual([true, true, true, false]);
    expect(rl.allowContact("other", t)).toBe(true);
    expect(rl.allowContact("ip", t + 10 * 60_000 - 1)).toBe(false);
    expect(rl.allowContact("ip", t + 10 * 60_000)).toBe(true);
  });
  it("a blocked attempt does not extend the block (is not counted)", () => {
    const t = 5_000;
    for (let i = 0; i < 3; i++) rl.allowContact("k", t);
    for (let i = 0; i < 50; i++) rl.allowContact("k", t + 9 * 60_000);
    expect(rl.allowContact("k", t + 10 * 60_000)).toBe(true);
  });
  it("enforces the global cap across many keys (30 per hour for contact)", () => {
    const t = 10;
    const results = Array.from({ length: 32 }, (_, i) => rl.allowContact(`ip${i}`, t));
    expect(results.filter(Boolean)).toHaveLength(30);
    expect(rl.allowContact("fresh", t + 60 * 60_000)).toBe(true);
  });
  it("og allows 20 per minute and booking 3 per hour; resets clear state", () => {
    expect(Array.from({ length: 21 }, () => rl.allowOg("x", 0)).filter(Boolean)).toHaveLength(20);
    expect(rl.allowOg("x", 60_000)).toBe(true);
    expect(Array.from({ length: 4 }, () => rl.allowBooking("b", 0)).filter(Boolean)).toHaveLength(3);
    rl.resetBookingLimits();
    expect(rl.allowBooking("b", 0)).toBe(true);
    rl.resetOgLimits();
    expect(Array.from({ length: 20 }, () => rl.allowOg("x", 0)).every(Boolean)).toBe(true);
  });
  it("defaults to Date.now()", () => {
    expect(rl.allowContact("now")).toBe(true);
  });
  it("stays correct after the key map grows past 5000 (prune path) and keeps live keys limited", () => {
    // 5001 distinct keys at t=0: the global cap (600/h) rejects most, but every key is remembered, so the map exceeds 5000.
    const allowed = Array.from({ length: 5001 }, (_, i) => rl.allowOg(`k${i}`, 0)).filter(Boolean).length;
    expect(allowed).toBe(600);
    // Three hours later everything has expired: the next allowed call prunes the stale keys without losing the fresh one.
    const later = 3 * 60 * 60_000;
    for (let i = 0; i < 20; i++) expect(rl.allowOg("later", later)).toBe(true);
    expect(rl.allowOg("later", later)).toBe(false);
  });
  it("extracts the client key, preferring the platform header", () => {
    const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
    expect(rl.clientKeyFrom(h({ "x-vercel-forwarded-for": " 1.1.1.1 , 2.2.2.2", "x-real-ip": "3.3.3.3", "x-forwarded-for": "4.4.4.4" }))).toBe("1.1.1.1");
    expect(rl.clientKeyFrom(h({ "x-real-ip": "3.3.3.3", "x-forwarded-for": "4.4.4.4" }))).toBe("3.3.3.3");
    expect(rl.clientKeyFrom(h({ "x-forwarded-for": " 4.4.4.4 , 5.5.5.5" }))).toBe("4.4.4.4");
    expect(rl.clientKeyFrom(h({}))).toBe("unknown");
  });
});

describe("crypto", () => {
  it("rejects a missing or short ADMIN_SECRET for encrypt/decrypt", () => {
    vi.stubEnv("ADMIN_SECRET", "");
    expect(() => c.encrypt("x")).toThrow(/ADMIN_SECRET/);
    vi.stubEnv("ADMIN_SECRET", "short");
    expect(() => c.encrypt("x")).toThrow(/at least 32/);
  });
  it("round-trips, uses a fresh IV, and rejects tampering and wrong keys", () => {
    vi.stubEnv("ADMIN_SECRET", "a".repeat(40));
    const e1 = c.encrypt("héllo ✓");
    expect(c.encrypt("héllo ✓")).not.toBe(e1);
    expect(c.decrypt(e1)).toBe("héllo ✓");
    const [iv, tag, ct] = e1.split(".");
    expect(() => c.decrypt([iv, tag, ct.slice(0, -2) + (ct.endsWith("AA") ? "BB" : "AA")].join("."))).toThrow();
    vi.stubEnv("ADMIN_SECRET", "b".repeat(40));
    expect(() => c.decrypt(e1)).toThrow();
  });
  it("base32 encodes padding-free, decodes lenient input, and rejects invalid characters", () => {
    expect(c.base32Encode(Buffer.from("f"))).toBe("MY");
    expect(c.base32Encode(Buffer.from("foobar"))).toBe("MZXW6YTBOI");
    expect(c.base32Encode(Buffer.alloc(0))).toBe("");
    expect(c.base32Decode("my======").toString()).toBe("f");
    expect(c.base32Decode("mzxw 6ytb oi").toString()).toBe("foobar");
    expect(() => c.base32Decode("MY1!")).toThrow("invalid base32");
    const rnd = Buffer.from([0, 255, 1, 254, 7]);
    expect(c.base32Decode(c.base32Encode(rnd))).toEqual(rnd);
  });
  it("safeEqual handles different lengths and unicode", () => {
    expect(c.safeEqual("a", "a")).toBe(true);
    expect(c.safeEqual("a", "aa")).toBe(false);
    expect(c.safeEqual("", "")).toBe(true);
    expect(c.safeEqual("é", "é")).toBe(true);
  });
});
