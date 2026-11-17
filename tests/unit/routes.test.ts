import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbq = vi.fn();
const admin = { on: false };
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => dbq(...a) }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => admin.on, requireAdmin: async () => { if (!admin.on) throw new Error("REDIRECT"); } }));

import { GET as mediaGET } from "../../src/app/media/[name]/route";
import { GET as presenceGET } from "../../src/app/api/presence/route";
import { GET as securityGET } from "../../src/app/.well-known/security.txt/route";
import { POST as uploadPOST } from "../../src/app/api/admin/media/upload/route";

const call = (name: string, headers: Record<string, string> = {}) => mediaGET(new Request("http://x/media/" + name, { headers }), { params: Promise.resolve({ name }) });

beforeEach(() => {
  dbq.mockReset();
  admin.on = false;
});
afterEach(() => vi.unstubAllEnvs());

describe("/media/[name]", () => {
  it.each(["a/b", "a b", "a%2f..%2fb", "", "a\\b", "x;y", "a\n", "é.png"])("404 for bad name %j without touching the db", async (n) => {
    const r = await call(n);
    expect(r.status).toBe(404);
    expect(dbq).not.toHaveBeenCalled();
  });
  it("404 when row missing or db fails", async () => {
    dbq.mockResolvedValueOnce({ rows: [] });
    expect((await call("a.png")).status).toBe(404);
    dbq.mockRejectedValueOnce(new Error("down"));
    expect((await call("a.png")).status).toBe(404);
  });
  it("a legacy non-r2 row is 404 for anon and admin, published or not (R2 serving is covered in media-r2-routes)", async () => {
    vi.stubGlobal("fetch", vi.fn());
    for (const published of [true, false]) {
      for (const on of [false, true]) {
        admin.on = on;
        dbq.mockResolvedValue({ rows: [{ url: "https://s.blob.vercel-storage.com/media/a.png", content_type: "image/png", published }] });
        expect((await call("a.png")).status).toBe(404);
      }
    }
    expect(fetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it("dot-only names are accepted by the name filter but only ever bound as a parameter", async () => {
    dbq.mockResolvedValue({ rows: [] });
    expect((await call("..")).status).toBe(404);
    // Bound as parameters; the second is an exact-path pattern with the dots escaped.
    expect(dbq.mock.calls[0][1]).toEqual(["media/..", "/media/\\.\\.[._-]*($|[^A-Za-z0-9_.-])"]);
  });
});

describe("/api/presence", () => {
  const lanyard = (data: unknown, success = true) => vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success, data }) })));
  afterEach(() => vi.unstubAllGlobals());
  it("normalises status, trims activities, validates track id", async () => {
    lanyard({ discord_status: "hacked", listening_to_spotify: true, spotify: { song: 1, artist: null, track_id: "ab<>" }, activities: Array.from({ length: 9 }, (_, i) => ({ name: `a${i}`, type: "3", details: "" })) });
    const r = await presenceGET();
    const b = await r.json();
    expect(b.discord_status).toBe("offline");
    expect(b.spotify).toEqual({ song: "1", artist: "", track_id: undefined });
    expect(b.activities).toHaveLength(5);
    expect(b.activities[0]).toEqual({ name: "a0", type: 3, details: undefined, state: undefined });
    expect(r.headers.get("cache-control")).toContain("s-maxage=30");
  });
  it("spotify null when not listening", async () => {
    lanyard({ discord_status: "dnd", listening_to_spotify: false, spotify: { song: "x" } });
    const b = await (await presenceGET()).json();
    expect(b.discord_status).toBe("dnd");
    expect(b.spotify).toBeNull();
    expect(b.listening_to_spotify).toBe(false);
  });
  it("503 on upstream failure, unsuccessful, or bad json", async () => {
    lanyard(undefined, false);
    expect((await presenceGET()).status).toBe(503);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }));
    expect((await presenceGET()).status).toBe(503);
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => { throw new Error("bad"); } })));
    expect((await presenceGET()).status).toBe(503);
  });
});

describe("security.txt", () => {
  it("has RFC 9116 fields and a future Expires under a year", async () => {
    const r = securityGET();
    const t = await r.text();
    expect(r.headers.get("content-type")).toMatch(/text\/plain/);
    expect(t).toMatch(/^Contact: mailto:.+@.+/m);
    const exp = /^Expires: (.+)$/m.exec(t)![1];
    const d = new Date(exp);
    expect(d.getTime()).toBeGreaterThan(Date.now() + 360 * 86400_000);
    expect(d.getTime()).toBeLessThanOrEqual(Date.now() + 366 * 86400_000);
    expect(exp).toMatch(/Z$/);
    expect(t).toMatch(/^Canonical: https:\/\/.+\/\.well-known\/security\.txt$/m);
    expect(t.endsWith("\n")).toBe(true);
  });
});

describe("/api/admin/media/upload", () => {
  const R2 = { R2_ACCOUNT_ID: "a", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_BUCKET_PUBLIC: "pubb", R2_BUCKET_PRIVATE: "privb", NEXT_PUBLIC_ASSETS_URL: "https://assets.test" };
  const on = () => Object.entries(R2).forEach(([k, v]) => vi.stubEnv(k, v));
  const req = (body: unknown) => new Request("http://x/api/admin/media/upload", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
  it("401 for non-admins before anything else, even with R2 off", async () => {
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    expect((await uploadPOST(req("{nope"))).status).toBe(401);
  });
  it("503 without R2", async () => {
    admin.on = true;
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    expect((await uploadPOST(req({}))).status).toBe(503);
  });
  it("400 on bad json", async () => {
    admin.on = true;
    on();
    expect((await uploadPOST(req("{nope"))).status).toBe(400);
  });
  it("signs an upload for an admin", async () => {
    admin.on = true;
    on();
    const r = await uploadPOST(req({ name: "a.png", contentType: "image/png", size: 10 }));
    expect(r.status).toBe(200);
    expect(((await r.json()) as { ref: string }).ref).toMatch(/^r2:media\/a-[0-9a-f]{12}\.png$/);
  });
});
