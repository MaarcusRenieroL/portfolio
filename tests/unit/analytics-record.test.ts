import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  hasDb: true,
  hdrs: new Map<string, string>(),
  admin: false,
  query: vi.fn(),
  after: vi.fn(),
  prune: vi.fn(async () => undefined),
}));
vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => m.hdrs.get(k.toLowerCase()) ?? null }) }));
vi.mock("next/server", () => ({ after: m.after }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => m.hasDb, query: m.query, pool: vi.fn() }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => m.admin }));
vi.mock("~/lib/server/retention", () => ({ pruneOldData: m.prune }));
vi.mock("~/lib/server/crypto", () => ({ dailyHash: (ip: string, ua: string) => `h(${ip}|${ua})` }));

import { EVENT_KINDS, record } from "~/lib/server/analytics";

const UA = "Mozilla/5.0 (Macintosh) Safari/605";
let n = 0;
/** Each test gets its own IP so the module-level limiter never leaks between tests. */
const fresh = () => m.hdrs.set("x-real-ip", `10.0.${Math.floor(++n / 250)}.${n % 250}`);

beforeEach(() => {
  vi.clearAllMocks();
  delete (m.hdrs as unknown as { get?: unknown }).get;
  m.hasDb = true;
  m.admin = false;
  m.hdrs.clear();
  m.hdrs.set("user-agent", UA);
  fresh();
  m.query.mockResolvedValue({ rows: [] });
  m.after.mockImplementation((fn: () => void) => fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("record: skips", () => {
  it("unknown kind", async () => {
    expect(await record("not-a-kind")).toBe(false);
    expect(await record("")).toBe(false);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("no database", async () => {
    m.hasDb = false;
    expect(await record("view", "/")).toBe(false);
  });
  it("missing UA", async () => {
    m.hdrs.delete("user-agent");
    expect(await record("view", "/")).toBe(false);
  });
  it.each(["Googlebot/2.1", "curl/8.0", "HeadlessChrome", "python-requests", "Lighthouse", "Slackbot-LinkExpanding", "Vercel-Screenshot", "UptimeRobot"])("bot UA %s", async (ua) => {
    m.hdrs.set("user-agent", ua);
    expect(await record("view", "/")).toBe(false);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("Do Not Track and Global Privacy Control", async () => {
    m.hdrs.set("dnt", "1");
    expect(await record("view", "/")).toBe(false);
    m.hdrs.delete("dnt");
    m.hdrs.set("sec-gpc", "1");
    expect(await record("view", "/")).toBe(false);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("DNT:0 does not suppress", async () => {
    m.hdrs.set("dnt", "0");
    expect(await record("view", "/")).toBe(true);
  });
  it("the signed-in admin", async () => {
    m.admin = true;
    expect(await record("view", "/")).toBe(false);
    expect(m.query).not.toHaveBeenCalled();
  });
});

describe("record: writes", () => {
  it("accepts every declared kind", async () => {
    for (const k of EVENT_KINDS) expect(await record(k, "/p"), k).toBe(true);
  });
  it("stores path, target and the hashed visitor, never the raw IP", async () => {
    expect(await record("project-click", "/projects", "repo")).toBe(true);
    const [sql, params] = m.query.mock.calls[0];
    expect(sql).toMatch(/insert into site_event/);
    expect(params[0]).toBe("project-click");
    expect(params[1]).toBe("/projects");
    expect(params[2]).toBe("repo");
    expect(params[3]).toMatch(/^h\(/);
    expect(params).toHaveLength(4);
  });
  it("path must start with / and is capped at 200 chars; control chars stripped", async () => {
    await record("view", "https://evil.com");
    expect(m.query.mock.calls[0][1][1]).toBeNull();
    await record("view", "/" + "a".repeat(500));
    expect(m.query.mock.calls[1][1][1]).toHaveLength(200);
    await record("view", "/a\u0000b\nc");
    expect(m.query.mock.calls[2][1][1]).toBe("/abc");
  });
  it("non-string path/target become null; target capped at 120", async () => {
    await record("view", { x: 1 }, 42);
    expect(m.query.mock.calls[0][1].slice(1, 3)).toEqual([null, null]);
    await record("view", "/", "t".repeat(999));
    expect(m.query.mock.calls[1][1][2]).toHaveLength(120);
  });
  it("schedules pruning after the response; falls back to a direct call outside a request", async () => {
    await record("view", "/");
    expect(m.after).toHaveBeenCalledTimes(1);
    expect(m.prune).toHaveBeenCalledTimes(1);
    m.after.mockImplementation(() => {
      throw new Error("outside request scope");
    });
    expect(await record("view", "/")).toBe(true);
    expect(m.prune).toHaveBeenCalledTimes(2);
  });
  it("insert failure returns false and logs", async () => {
    m.query.mockRejectedValue(new Error("db down"));
    expect(await record("view", "/")).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
  it("unexpected header failure is swallowed", async () => {
    m.hdrs.get = () => {
      throw new Error("boom");
    };
    expect(await record("view", "/")).toBe(false);
  });
});

describe("record: rate limit", () => {
  it("allows 40 per minute per client, then blocks, other clients unaffected", async () => {
    for (let i = 0; i < 40; i++) expect(await record("view", "/")).toBe(true);
    expect(await record("view", "/")).toBe(false);
    expect(m.query).toHaveBeenCalledTimes(40);
    fresh();
    expect(await record("view", "/")).toBe(true);
  });
  it("window slides after 60s", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 40; i++) await record("view", "/");
      expect(await record("view", "/")).toBe(false);
      vi.advanceTimersByTime(60_001);
      expect(await record("view", "/")).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
  it("prunes the limiter map once it grows past 5000 entries", async () => {
    for (let i = 0; i < 5002; i++) {
      m.hdrs.set("x-real-ip", `bulk-${i}`);
      await record("view", "/");
    }
    expect(m.query).toHaveBeenCalledTimes(5002);
  }, 30_000);
});
