import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbq = vi.fn();
const admin = { on: false };
const blobGet = vi.fn();
const handleUpload = vi.fn();
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => dbq(...a) }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => admin.on, requireAdmin: async () => { if (!admin.on) throw new Error("REDIRECT"); } }));
vi.mock("@vercel/blob", () => ({ get: (...a: unknown[]) => blobGet(...a), head: vi.fn(), del: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ handleUpload: (...a: unknown[]) => handleUpload(...a) }));

import { GET as mediaGET } from "../../src/app/media/[name]/route";
import { GET as presenceGET } from "../../src/app/api/presence/route";
import { GET as securityGET } from "../../src/app/.well-known/security.txt/route";
import { POST as uploadPOST } from "../../src/app/api/admin/media/upload/route";

const call = (name: string, headers: Record<string, string> = {}) => mediaGET(new Request("http://x/media/" + name, { headers }), { params: Promise.resolve({ name }) });
const stream = () => new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode("data")); c.close(); } });

beforeEach(() => {
  dbq.mockReset();
  blobGet.mockReset();
  handleUpload.mockReset();
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
  it("unpublished file is 404 for anon and never reads blob", async () => {
    dbq.mockResolvedValue({ rows: [{ url: "https://s.blob.vercel-storage.com/media/a.png", content_type: "image/png", published: false }] });
    expect((await call("a.png")).status).toBe(404);
    expect(blobGet).not.toHaveBeenCalled();
  });
  it("unpublished file is 200 for admin, private no-store", async () => {
    admin.on = true;
    dbq.mockResolvedValue({ rows: [{ url: "https://s.blob.vercel-storage.com/media/a.png", content_type: "image/png", published: false }] });
    blobGet.mockResolvedValue({ statusCode: 200, stream: stream(), blob: { etag: '"e"' } });
    const r = await call("a.png");
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("private, no-store");
    expect(r.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await r.text()).toBe("data");
  });
  it("published file is public cacheable for anon, 304 passes if-none-match", async () => {
    dbq.mockResolvedValue({ rows: [{ url: "https://s.blob.vercel-storage.com/media/a.png", content_type: "image/png", published: true }] });
    blobGet.mockResolvedValue({ statusCode: 304, stream: null, blob: { etag: '"e"' } });
    const r = await call("a.png", { "if-none-match": '"e"' });
    expect(r.status).toBe(304);
    expect(r.headers.get("cache-control")).toContain("public");
    expect(blobGet.mock.calls[0][1]).toMatchObject({ access: "private", ifNoneMatch: '"e"' });
    expect(r.headers.get("etag")).toBe('"e"');
  });
  it("SVG gets a sandbox CSP, PDF is inline, png has no CSP", async () => {
    blobGet.mockResolvedValue({ statusCode: 200, stream: stream(), blob: { etag: "e" } });
    dbq.mockResolvedValue({ rows: [{ url: "u", content_type: "image/svg+xml", published: true }] });
    const svg = await call("a.svg");
    expect(svg.headers.get("content-security-policy")).toMatch(/sandbox/);
    expect(svg.headers.get("content-security-policy")).toMatch(/default-src 'none'/);
    blobGet.mockResolvedValue({ statusCode: 200, stream: stream(), blob: { etag: "e" } });
    dbq.mockResolvedValue({ rows: [{ url: "u", content_type: "application/pdf", published: true }] });
    expect((await call("cv.pdf")).headers.get("content-disposition")).toBe('inline; filename="cv.pdf"');
    blobGet.mockResolvedValue({ statusCode: 200, stream: stream(), blob: { etag: "e" } });
    dbq.mockResolvedValue({ rows: [{ url: "u", content_type: "image/png", published: true }] });
    expect((await call("a.png")).headers.get("content-security-policy")).toBeNull();
  });
  it("404 when blob fetch fails", async () => {
    dbq.mockResolvedValue({ rows: [{ url: "u", content_type: "image/png", published: true }] });
    blobGet.mockRejectedValue(new Error("x"));
    expect((await call("a.png")).status).toBe(404);
    blobGet.mockResolvedValue(null);
    expect((await call("a.png")).status).toBe(404);
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
  const req = (body: unknown) => new Request("http://x/api/admin/media/upload", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
  it("503 without BLOB token", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect((await uploadPOST(req({}))).status).toBe(503);
  });
  it("400 on bad json", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "t");
    expect((await uploadPOST(req("{nope"))).status).toBe(400);
  });
  it("checks admin and pathname inside onBeforeGenerateToken", async () => {
    const pn = { v: "" };
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "t");
    handleUpload.mockImplementation(async ({ onBeforeGenerateToken }: { onBeforeGenerateToken: (p: string) => Promise<unknown> }) => onBeforeGenerateToken(pn.v));
    pn.v = "media/ok.png";
    let r = await uploadPOST(req({}));
    expect(r.status).toBe(401);
    admin.on = true;
    for (const bad of ["media/../x.png", "x.png", "media/A.png", "media/a/b.png", "media/a.png.exe/", "media/a b.png", "media/.png"]) {
      pn.v = bad;
      r = await uploadPOST(req({}));
      expect(r.status, bad).toBe(400);
    }
    pn.v = "media/ok-1.png";
    r = await uploadPOST(req({}));
    expect(r.status).toBe(200);
    const cfg = await r.json();
    expect(cfg.allowedContentTypes).toContain("application/pdf");
    expect(cfg.maximumSizeInBytes).toBe(8 * 1024 * 1024);
    expect(cfg.addRandomSuffix).toBe(true);
  });
});
