import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** media.ts R2 paths against an in-memory fake of R2 behind a stubbed fetch. The DB is a mock: no real queries. */
const m = vi.hoisted(() => ({
  query: vi.fn(),
  head: vi.fn(),
  del: vi.fn(),
  audit: vi.fn(async () => {}),
  client: { query: vi.fn(), release: vi.fn() },
  connect: vi.fn(),
}));
vi.mock("~/lib/server/db", () => ({ query: m.query, hasDb: () => true, pool: () => ({ connect: m.connect }) }));
vi.mock("@vercel/blob", () => ({ head: m.head, del: m.del }));
vi.mock("~/lib/server/auth", () => ({ audit: m.audit }));

import { addMedia, afterPublish, blobConfigured, mediaKeysIn, publishedMediaKeys, removeMedia, syncPublicMedia } from "~/lib/server/media";

type Obj = { type: string; size: number };
const store = { pub: new Map<string, Obj>(), priv: new Map<string, Obj>() };
const calls: string[] = [];
const copyHeaders: { key: string; type: string | null; cache: string | null }[] = [];
const fail = { on: null as null | ((method: string, bucket: string, key: string) => boolean) };

function fakeR2(input: Request | string, init?: RequestInit): Promise<Response> {
  const r = input instanceof Request ? input : new Request(input, init);
  const u = new URL(r.url);
  const [, bucket, ...rest] = u.pathname.split("/");
  const key = rest.map(decodeURIComponent).join("/");
  const b = bucket === "pubb" ? store.pub : store.priv;
  calls.push(`${r.method} ${bucket}/${key}`);
  if (fail.on?.(r.method, bucket, key)) return Promise.resolve(new Response(null, { status: 403 }));
  if (r.method === "GET" && !key) {
    const prefix = u.searchParams.get("prefix") ?? "";
    const keys = [...b.keys()].filter((k) => k.startsWith(prefix)).sort();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return Promise.resolve(new Response(`<R><IsTruncated>false</IsTruncated>${keys.map((k) => `<Key>${esc(k)}</Key>`).join("")}</R>`));
  }
  if (r.method === "HEAD") {
    const o = b.get(key);
    return Promise.resolve(o ? new Response(null, { headers: { "content-length": String(o.size), "content-type": o.type } }) : new Response(null, { status: 404 }));
  }
  if (r.method === "DELETE") {
    b.delete(key);
    return Promise.resolve(new Response(null, { status: 204 }));
  }
  if (r.method === "PUT") {
    const src = r.headers.get("x-amz-copy-source");
    if (src) {
      const o = store.priv.get(decodeURIComponent(src.replace(/^\/privb\//, "")));
      if (!o) return Promise.resolve(new Response("<Error/>", { status: 404 }));
      b.set(key, { ...o, type: r.headers.get("content-type") ?? "" });
      copyHeaders.push({ key, type: r.headers.get("content-type"), cache: r.headers.get("cache-control") });
      return Promise.resolve(new Response(null));
    }
  }
  return Promise.resolve(new Response(null, { status: 400 }));
}

const ENV = { R2_ACCOUNT_ID: "a", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_BUCKET_PUBLIC: "pubb", R2_BUCKET_PRIVATE: "privb", NEXT_PUBLIC_ASSETS_URL: "https://assets.test" };

/** Rows the two queries in publishedMediaKeys/syncPublicMedia would return. */
let liveTexts: string[] = [];
let mediaRows: string[] = [];
let types: Record<string, string> = {};
beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  vi.spyOn(console, "error").mockImplementation(() => {});
  store.pub.clear();
  store.priv.clear();
  calls.length = 0;
  copyHeaders.length = 0;
  fail.on = null;
  liveTexts = [];
  mediaRows = [];
  types = {};
  m.query.mockReset();
  m.head.mockReset();
  m.del.mockReset();
  m.audit.mockReset();
  m.audit.mockResolvedValue(undefined);
  m.query.mockImplementation(async (sql: string) => {
    if (sql.includes("from content_item where not deleted and published is not null")) return { rows: liveTexts.map((t) => ({ t })) };
    if (sql.startsWith("insert into media")) return { rows: [{ id: 1, url: "x" }] };
    return { rows: [] };
  });
  // syncPublicMedia runs on a pool client: begin, advisory lock, reads, commit/rollback, release.
  m.client.query.mockReset();
  m.client.release.mockReset();
  m.connect.mockReset();
  m.connect.mockResolvedValue(m.client);
  m.client.query.mockImplementation(async (sql: string) => {
    if (sql.includes("from content_item where not deleted and published is not null")) return { rows: liveTexts.map((t) => ({ t })) };
    if (sql.includes("like 'r2:%'")) return { rows: mediaRows.map((k) => ({ pathname: k, content_type: types[k] ?? "image/png" })) };
    return { rows: [] };
  });
  vi.stubGlobal("fetch", vi.fn(fakeR2));
  Object.entries(ENV).forEach(([k, v]) => vi.stubEnv(k, v));
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const png = { type: "image/png", size: 100 };

describe("blobConfigured", () => {
  it("true with R2 alone, false with neither, false with partial R2", () => {
    expect(blobConfigured()).toBe(true);
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    expect(blobConfigured()).toBe(false);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "t");
    expect(blobConfigured()).toBe(true);
  });
});

describe("addMedia (r2 ref)", () => {
  it("registers a valid upload with the type and size read from R2, not the client", async () => {
    store.priv.set("media/a-0123456789ab.png", png);
    await addMedia("r2:media/a-0123456789ab.png", 10, 20);
    const ins = m.query.mock.calls.find((c) => String(c[0]).startsWith("insert into media"))!;
    expect(ins[1]).toEqual(["r2:media/a-0123456789ab.png", "media/a-0123456789ab.png", "image/png", 100, 10, 20]);
    expect(m.head).not.toHaveBeenCalled();
  });
  it("rejects R2 refs when R2 is off (never falls through to Blob)", async () => {
    vi.stubEnv("R2_ACCOUNT_ID", "");
    await expect(addMedia("r2:media/a.png", null, null)).rejects.toThrow("R2 isn't configured");
    expect(m.head).not.toHaveBeenCalled();
  });
  it.each([
    "r2:media/../etc.png",
    "r2:media/a/b.png",
    "r2:media/A.png",
    "r2:media/a.png\n",
    "r2:media/a.png/",
    "r2:media/a b.png",
    "r2:media/a%2Fb.png",
    "r2:media/.png",
    "r2:media/a.",
    "r2:media/a",
    "r2:other/a.png",
    "r2:/media/a.png",
    "r2:media//a.png",
    "r2:media/a.png?x=1",
    "r2:media/a_b.png",
    "r2:media/a.tar.gz",
    "r2:",
    "r2:media/" + "a".repeat(5000) + ".png.exe\u0000",
  ])("bad name %j is rejected before any network call", async (ref) => {
    await expect(addMedia(ref, null, null)).rejects.toThrow("Bad file name");
    expect(calls).toEqual([]);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("forged ref for a file that isn't in the private bucket", async () => {
    store.pub.set("media/x-0123456789ab.png", png); // exists publicly only
    await expect(addMedia("r2:media/x-0123456789ab.png", null, null)).rejects.toThrow("isn't there");
    expect(calls).toEqual(["HEAD privb/media/x-0123456789ab.png"]);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("deletes a disallowed type from the private bucket and doesn't register it", async () => {
    store.priv.set("media/e-0123456789ab.html", { type: "text/html", size: 5 });
    await expect(addMedia("r2:media/e-0123456789ab.html", null, null)).rejects.toThrow("isn't allowed");
    expect(store.priv.has("media/e-0123456789ab.html")).toBe(false);
    expect(m.query).not.toHaveBeenCalled();
  });
  it.each(["image/png; charset=utf-8", "IMAGE/PNG", "application/octet-stream"])("type %j is not on the allow-list", async (type) => {
    store.priv.set("media/t-0123456789ab.png", { type, size: 5 });
    await expect(addMedia("r2:media/t-0123456789ab.png", null, null)).rejects.toThrow("isn't allowed");
    expect(store.priv.size).toBe(0);
  });
  it("size at the limit passes; one byte over is deleted", async () => {
    store.priv.set("media/a-0123456789ab.png", { type: "image/png", size: 8 * 1024 * 1024 });
    await expect(addMedia("r2:media/a-0123456789ab.png", null, null)).resolves.toBeTruthy();
    store.priv.set("media/b-0123456789ab.png", { type: "image/png", size: 8 * 1024 * 1024 + 1 });
    await expect(addMedia("r2:media/b-0123456789ab.png", null, null)).rejects.toThrow("isn't allowed");
    expect(store.priv.has("media/b-0123456789ab.png")).toBe(false);
  });
  it("a zero-byte upload is rejected and deleted", async () => {
    store.priv.set("media/z-0123456789ab.png", { type: "image/png", size: 0 });
    await expect(addMedia("r2:media/z-0123456789ab.png", null, null)).rejects.toThrow("isn't allowed");
    expect(store.priv.size).toBe(0);
  });
  it("a missing or garbage content-length (size NaN) is rejected and deleted", async () => {
    const real = fakeR2;
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((i: Request) =>
      i.method === "HEAD" ? Promise.resolve(new Response(null, { headers: { "content-length": "abc", "content-type": "image/png" } })) : real(i),
    );
    store.priv.set("media/n-0123456789ab.png", png);
    await expect(addMedia("r2:media/n-0123456789ab.png", null, null)).rejects.toThrow("isn't allowed");
    expect(store.priv.has("media/n-0123456789ab.png")).toBe(false);
  });
  it("a R2 HEAD failure propagates and does not delete anything", async () => {
    store.priv.set("media/a-0123456789ab.png", png);
    fail.on = (method) => method === "HEAD";
    await expect(addMedia("r2:media/a-0123456789ab.png", null, null)).rejects.toThrow("HEAD failed");
    expect(store.priv.size).toBe(1);
  });
  it("a hostile non-r2 URL still goes the Blob route and is rejected there", async () => {
    await expect(addMedia("https://evil.com/media/a.png", null, null)).rejects.toThrow("Not a Vercel Blob URL");
    await expect(addMedia("R2:media/a.png", null, null)).rejects.toThrow("Not a Vercel Blob URL");
  });
});

describe("removeMedia (r2 row)", () => {
  it("deletes from both buckets, then the row", async () => {
    store.pub.set("media/a-0123456789ab.png", png);
    store.priv.set("media/a-0123456789ab.png", png);
    m.query.mockImplementation(async (sql: string) => (sql.startsWith("select url") ? { rows: [{ url: "r2:media/a-0123456789ab.png" }] } : { rows: [] }));
    await removeMedia(5);
    expect(calls).toEqual(["DELETE pubb/media/a-0123456789ab.png", "DELETE privb/media/a-0123456789ab.png"]);
    expect(m.query).toHaveBeenLastCalledWith("delete from media where id = $1", [5]);
    expect(m.del).not.toHaveBeenCalled();
  });
  it("keeps the row when R2 delete fails, so it can be retried", async () => {
    m.query.mockImplementation(async (sql: string) => (sql.startsWith("select url") ? { rows: [{ url: "r2:media/a-0123456789ab.png" }] } : { rows: [] }));
    fail.on = (_m, bucket) => bucket === "privb";
    await expect(removeMedia(5)).rejects.toThrow("DELETE failed");
    expect(m.query.mock.calls.some((c) => String(c[0]).startsWith("delete from media"))).toBe(false);
  });
  it("missing row is a no-op", async () => {
    await removeMedia(99);
    expect(calls).toEqual([]);
  });
});

describe("publishedMediaKeys", () => {
  it("extracts names from markdown, JSON text, DE-only text and settings", async () => {
    liveTexts = [
      '{"body":"![a](/media/a-111111111111.png) and [pdf](/media/b-222222222222.pdf)."}',
      '{"cover":"/media/c-333333333333.png"}',
      '{"resume":"https://assets.test/media/d-444444444444.pdf"}',
    ];
    expect([...(await publishedMediaKeys())].sort()).toEqual([
      "media/a-111111111111.png",
      "media/b-222222222222.pdf",
      "media/c-333333333333.png",
      "media/d-444444444444.pdf",
    ]);
  });
  it("trailing sentence dots are stripped, but other trailing punctuation in the class is kept", async () => {
    liveTexts = ["see /media/a.png. Also /media/b.png.. and /media/c.png, /media/d.png) /media/e.png\\n next"];
    const k = [...(await publishedMediaKeys())];
    expect(k).toEqual(expect.arrayContaining(["media/a.png", "media/b.png", "media/c.png", "media/d.png", "media/e.png"]));
  });
  it("trailing dots, dashes and underscores are punctuation, not part of the name", async () => {
    liveTexts = ["/media/a.png-- thanks /media/b.png_ /media/c.png.-_"];
    expect([...(await publishedMediaKeys())].sort()).toEqual(["media/a.png", "media/b.png", "media/c.png"]);
  });
  it("mediaKeysIn works on plain text lists", () => {
    expect([...mediaKeysIn(["/media/x-1.png.", "no media here", "/media/y.pdf"])]).toEqual(["media/x-1.png", "media/y.pdf"]);
    expect(mediaKeysIn([]).size).toBe(0);
  });
  it("a full-width or non-ASCII char ends the name", async () => {
    liveTexts = ["/media/a.png。/media/b.png—"];
    expect([...(await publishedMediaKeys())].sort()).toEqual(["media/a.png", "media/b.png"]);
  });
  it("de-duplicates, and no rows gives an empty set", async () => {
    liveTexts = ["/media/a.png /media/a.png"];
    expect((await publishedMediaKeys()).size).toBe(1);
    liveTexts = [];
    expect((await publishedMediaKeys()).size).toBe(0);
  });
  it("a traversal-looking reference produces a key that matches nothing real", async () => {
    liveTexts = ["/media/../../etc/passwd"];
    expect([...(await publishedMediaKeys())]).toEqual(["media/"]);
  });
});

describe("syncPublicMedia", () => {
  const none = { copied: [], removed: [], failed: [] };
  it("is a no-op without R2: no connection, no query, no fetch", async () => {
    vi.stubEnv("R2_BUCKET_PRIVATE", "");
    expect(await syncPublicMedia()).toEqual(none);
    expect(m.connect).not.toHaveBeenCalled();
    expect(m.query).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });
  it("runs in a transaction under an advisory lock and always releases the client", async () => {
    await syncPublicMedia();
    const sqls = m.client.query.mock.calls.map((c) => String(c[0]));
    expect(sqls[0]).toBe("begin");
    expect(sqls[1]).toContain("pg_advisory_xact_lock($1)");
    expect(typeof m.client.query.mock.calls[1][1]![0]).toBe("number");
    expect(sqls.at(-1)).toBe("commit");
    expect(m.client.release).toHaveBeenCalledTimes(1);
    expect(m.query).not.toHaveBeenCalled(); // reads happen on the locked client, not the pool
  });
  it("rolls back, releases and rethrows when a read fails, without touching R2 objects", async () => {
    store.pub.set("media/a.png", png);
    m.client.query.mockImplementation(async (sql: string) => {
      if (sql.includes("from content_item")) throw new Error("db down");
      return { rows: [] };
    });
    await expect(syncPublicMedia()).rejects.toThrow("db down");
    expect(m.client.query.mock.calls.map((c) => c[0])).toContain("rollback");
    expect(m.client.release).toHaveBeenCalledTimes(1);
    expect(store.pub.size).toBe(1);
  });
  it("a failing rollback does not mask the original error", async () => {
    m.client.query.mockImplementation(async (sql: string) => {
      if (sql.includes("from content_item")) throw new Error("db down");
      if (sql === "rollback") throw new Error("rollback failed");
      return { rows: [] };
    });
    await expect(syncPublicMedia()).rejects.toThrow("db down");
    expect(m.client.release).toHaveBeenCalledTimes(1);
  });
  it("a failure to get a client throws before anything else", async () => {
    m.connect.mockRejectedValue(new Error("pool exhausted"));
    await expect(syncPublicMedia()).rejects.toThrow("pool exhausted");
    expect(calls).toEqual([]);
  });
  it("copies live files with the DB content type and the short cache, removes unused public ones, keeps private copies", async () => {
    mediaRows = ["media/live-111111111111.pdf", "media/old-222222222222.png"];
    types["media/live-111111111111.pdf"] = "application/pdf";
    store.priv.set("media/live-111111111111.pdf", { type: "application/octet-stream", size: 1 }); // private object says otherwise
    store.priv.set("media/old-222222222222.png", png);
    store.pub.set("media/old-222222222222.png", png);
    liveTexts = ['{"a":"/media/live-111111111111.pdf"}'];
    expect(await syncPublicMedia()).toEqual({ copied: ["media/live-111111111111.pdf"], removed: ["media/old-222222222222.png"], failed: [] });
    expect([...store.pub.keys()]).toEqual(["media/live-111111111111.pdf"]);
    expect(copyHeaders).toEqual([{ key: "media/live-111111111111.pdf", type: "application/pdf", cache: "public, max-age=600, s-maxage=600" }]);
    expect(store.priv.size).toBe(2);
    expect(calls.some((c) => c.startsWith("HEAD"))).toBe(false);
  });
  it("removals run before copies", async () => {
    mediaRows = ["media/new.png"];
    store.priv.set("media/new.png", png);
    store.pub.set("media/old.png", png);
    liveTexts = ["/media/new.png"];
    await syncPublicMedia();
    expect(calls.filter((c) => !c.startsWith("GET")).map((c) => c.split(" ")[0])).toEqual(["DELETE", "PUT"]);
  });
  it("a live reference to a file that isn't a registered R2 row (forged key) is never copied", async () => {
    liveTexts = ["/media/forged-000000000000.png"];
    store.priv.set("media/forged-000000000000.png", png);
    expect(await syncPublicMedia()).toEqual(none);
    expect(store.pub.size).toBe(0);
  });
  it("a live file already public is not copied again; a second run is idempotent", async () => {
    mediaRows = ["media/a.png"];
    store.priv.set("media/a.png", png);
    liveTexts = ["/media/a.png"];
    await syncPublicMedia();
    calls.length = 0;
    expect(await syncPublicMedia()).toEqual(none);
    expect(calls).toEqual(["GET pubb/"]);
  });
  it("does not delete a public file referenced only in the DE copy, a setting, or with trailing punctuation", async () => {
    for (const k of ["de.png", "set.pdf", "dot.png", "paren.png", "dash.png"]) store.pub.set(`media/${k}`, png);
    mediaRows = ["media/de.png", "media/set.pdf", "media/dot.png", "media/paren.png", "media/dash.png"];
    liveTexts = [
      '{"title":"x"}{"body":"de ![](/media/de.png)"}',
      '{"resume":"/media/set.pdf"}',
      '{"b":"End of sentence /media/dot.png."}',
      '{"b":"([x](/media/paren.png))"}',
      '{"b":"/media/dash.png--"}',
    ];
    expect((await syncPublicMedia()).removed).toEqual([]);
  });
  it("DOES delete a public file used only by a draft or deleted item (not in live text)", async () => {
    store.pub.set("media/draft.png", png);
    mediaRows = ["media/draft.png"];
    expect((await syncPublicMedia()).removed).toEqual(["media/draft.png"]);
  });
  it("removes non-library junk under media/ in the public bucket (pins: sync owns that prefix)", async () => {
    store.pub.set("media/hand-uploaded.png", png);
    expect((await syncPublicMedia()).removed).toEqual(["media/hand-uploaded.png"]);
  });
  it("only lists media/, so projects/ and logos/ are never touched", async () => {
    store.pub.set("projects/a/1.png", png);
    store.pub.set("logos/x.svg", png);
    await syncPublicMedia();
    expect(store.pub.size).toBe(2);
  });
  it("a key with XML-special characters is deleted by its decoded name", async () => {
    store.pub.set("media/a&b<c>.png", png);
    expect((await syncPublicMedia()).removed).toEqual(["media/a&b<c>.png"]);
  });
  it("an empty live set removes everything in media/ (pins; no safety net)", async () => {
    store.pub.set("media/a.png", png);
    mediaRows = ["media/a.png"];
    expect((await syncPublicMedia()).removed).toEqual(["media/a.png"]);
  });
  it("a failing copy no longer blocks removals or later copies, and is reported in failed", async () => {
    mediaRows = ["media/gone.png", "media/ok.png"];
    store.priv.set("media/ok.png", png); // media/gone.png has a row but no private object
    store.pub.set("media/stale.png", png);
    liveTexts = ["/media/gone.png /media/ok.png"];
    const r = await syncPublicMedia();
    expect(r.failed).toContain("media/gone.png");
    expect(r.copied).toEqual(["media/ok.png"]);
    expect(r.removed).toEqual(["media/stale.png"]);
    expect(store.pub.has("media/stale.png")).toBe(false);
    expect(store.pub.has("media/ok.png")).toBe(true);
    expect(m.client.query.mock.calls.at(-1)![0]).toBe("commit");
  });
  it("a failing delete is reported and the other deletes and copies still run", async () => {
    mediaRows = ["media/ok.png"];
    store.priv.set("media/ok.png", png);
    store.pub.set("media/bad.png", png);
    store.pub.set("media/good.png", png);
    liveTexts = ["/media/ok.png"];
    fail.on = (method, bucket, key) => method === "DELETE" && bucket === "pubb" && key === "media/bad.png";
    const r = await syncPublicMedia();
    expect(r.failed).toEqual(["media/bad.png"]);
    expect(r.removed).toEqual(["media/good.png"]);
    expect(r.copied).toEqual(["media/ok.png"]);
  });
  it("a failing listing aborts with rollback and release", async () => {
    fail.on = (method, _b, key) => method === "GET" && key === "";
    await expect(syncPublicMedia()).rejects.toThrow("LIST failed");
    expect(m.client.query.mock.calls.map((c) => c[0])).toContain("rollback");
    expect(m.client.release).toHaveBeenCalledTimes(1);
  });
});

describe("afterPublish", () => {
  it("returns a warning (never throws), logs, and doesn't audit when the sync itself fails", async () => {
    m.connect.mockRejectedValue(new Error("boom"));
    const w = await afterPublish();
    expect(w).toMatch(/couldn't be updated/);
    expect(console.error).toHaveBeenCalledWith("[media] public sync failed:", "boom");
    expect(m.audit).not.toHaveBeenCalled();
  });
  it("handles a non-Error rejection", async () => {
    m.connect.mockRejectedValue("str");
    expect(await afterPublish()).toMatch(/couldn't be updated/);
    expect(console.error).toHaveBeenCalledWith("[media] public sync failed:", "str");
  });
  it("returns null and doesn't audit when nothing changed", async () => {
    expect(await afterPublish()).toBeNull();
    expect(m.audit).not.toHaveBeenCalled();
  });
  it("returns null and audits media_synced once with the result when something changed", async () => {
    mediaRows = ["media/a.png"];
    store.priv.set("media/a.png", png);
    store.pub.set("media/old.png", png);
    liveTexts = ["/media/a.png"];
    expect(await afterPublish()).toBeNull();
    expect(m.audit).toHaveBeenCalledTimes(1);
    expect(m.audit).toHaveBeenCalledWith("media_synced", "admin", { copied: ["media/a.png"], removed: ["media/old.png"], failed: [] });
  });
  it("a partial failure returns a warning naming the files and audits media_sync_failed", async () => {
    mediaRows = ["media/gone.png"];
    liveTexts = ["/media/gone.png"];
    const w = await afterPublish();
    expect(w).toContain("media/gone.png");
    expect(w).toContain("1 file(s)");
    expect(m.audit).toHaveBeenCalledWith("media_sync_failed", "admin", { copied: [], removed: [], failed: ["media/gone.png"] });
  });
  it("a failing audit doesn't throw out of afterPublish (it becomes the generic warning)", async () => {
    mediaRows = ["media/a.png"];
    store.priv.set("media/a.png", png);
    liveTexts = ["/media/a.png"];
    m.audit.mockRejectedValue(new Error("audit down"));
    await expect(afterPublish()).resolves.toMatch(/couldn't be updated/);
  });
  it("is silent without R2", async () => {
    vi.stubEnv("R2_ACCOUNT_ID", "");
    expect(await afterPublish()).toBeNull();
    expect(m.audit).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });
});
