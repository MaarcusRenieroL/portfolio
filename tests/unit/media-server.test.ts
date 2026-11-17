import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ query: vi.fn(), head: vi.fn(), del: vi.fn(), configured: vi.fn() }));
vi.mock("~/lib/server/db", () => ({ query: m.query, hasDb: () => true, pool: vi.fn() }));
vi.mock("~/lib/server/auth", () => ({ audit: vi.fn(async () => {}) }));
vi.mock("~/lib/server/r2", async (orig) => ({
  ...(await orig<typeof import("~/lib/server/r2")>()),
  r2Configured: () => m.configured(),
  headPrivate: (...a: unknown[]) => m.head(...a),
  deleteObject: (...a: unknown[]) => m.del(...a),
}));

import { addMedia, listMedia, mediaForServing, mediaUsage, removeMedia, setMediaAlt, storageConfigured } from "~/lib/server/media";

const URL_OK = "r2:media/a-0123456789ab.png";
const KEY = "media/a-0123456789ab.png";

beforeEach(() => {
  vi.resetAllMocks();
  m.query.mockResolvedValue({ rows: [] });
  m.configured.mockReturnValue(true);
});

describe("storageConfigured", () => {
  it("follows r2Configured", () => {
    expect(storageConfigured()).toBe(true);
    m.configured.mockReturnValue(false);
    expect(storageConfigured()).toBe(false);
  });
});

describe("listMedia", () => {
  it("returns rows, newest first", async () => {
    m.query.mockResolvedValue({ rows: [{ id: 2 }, { id: 1 }] });
    expect(await listMedia()).toEqual([{ id: 2 }, { id: 1 }]);
    expect(m.query.mock.calls[0][0]).toMatch(/order by created_at desc, id desc/);
  });
});

describe("addMedia", () => {
  it.each(["https://abc.private.blob.vercel-storage.com/media/a.png", "https://evil.com/a.png", "R2:media/a.png", "not a url", "", "javascript:alert(1)"])(
    "rejects non-r2 reference %j without touching storage or db",
    async (u) => {
      await expect(addMedia(u, 1, 1)).rejects.toThrow("Not an upload reference.");
      expect(m.head).not.toHaveBeenCalled();
      expect(m.query).not.toHaveBeenCalled();
    },
  );
  it("rejects when R2 is off", async () => {
    m.configured.mockReturnValue(false);
    await expect(addMedia(URL_OK, 1, 1)).rejects.toThrow("R2 isn't configured.");
    expect(m.head).not.toHaveBeenCalled();
  });
  it("rejects a bad file name before any storage call", async () => {
    await expect(addMedia("r2:media/../x.png", 1, 1)).rejects.toThrow("Bad file name.");
    expect(m.head).not.toHaveBeenCalled();
  });
  it("takes size/type from the object store, not the client", async () => {
    m.head.mockResolvedValue({ type: "image/png", size: 123 });
    m.query.mockResolvedValue({ rows: [{ id: 5 }] });
    expect(await addMedia(URL_OK, 10, 20)).toEqual({ id: 5 });
    expect(m.head).toHaveBeenCalledWith(KEY);
    expect(m.query.mock.calls[0][1]).toEqual([URL_OK, KEY, "image/png", 123, 10, 20]);
    expect(m.query.mock.calls[0][0]).toMatch(/on conflict \(url\)/);
  });
  it("rejects an upload that isn't there", async () => {
    m.head.mockResolvedValue(null);
    await expect(addMedia(URL_OK, null, null)).rejects.toThrow("isn't there");
    expect(m.query).not.toHaveBeenCalled();
  });
  it("deletes a disallowed type or size and writes nothing", async () => {
    m.head.mockResolvedValue({ type: "text/html", size: 5 });
    await expect(addMedia(URL_OK, null, null)).rejects.toThrow("isn't allowed");
    expect(m.del).toHaveBeenCalledWith("private", KEY);
    expect(m.query).not.toHaveBeenCalled();
  });
  it("propagates head failure and writes nothing", async () => {
    m.head.mockRejectedValue(new Error("not found"));
    await expect(addMedia(URL_OK, null, null)).rejects.toThrow("not found");
    expect(m.query).not.toHaveBeenCalled();
  });
});

describe("setMediaAlt", () => {
  it("truncates alt to 300 chars", async () => {
    await setMediaAlt(3, "x".repeat(500));
    expect(m.query.mock.calls[0][1]).toEqual([3, "x".repeat(300)]);
  });
});

describe("removeMedia", () => {
  it("does nothing for an unknown id", async () => {
    await removeMedia(9);
    expect(m.del).not.toHaveBeenCalled();
    expect(m.query).toHaveBeenCalledTimes(1);
  });
  it("deletes the public and private objects first, then the row", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ url: URL_OK }] }).mockResolvedValueOnce({ rows: [] });
    await removeMedia(1);
    expect(m.del.mock.calls).toEqual([["public", KEY], ["private", KEY]]);
    expect(m.query.mock.calls[1][0]).toMatch(/delete from media/);
  });
  it("keeps the row if storage deletion fails", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ url: URL_OK }] });
    m.del.mockRejectedValue(new Error("r2 down"));
    await expect(removeMedia(1)).rejects.toThrow("r2 down");
    expect(m.query).toHaveBeenCalledTimes(1);
  });
  it("a legacy non-r2 row only loses its record, with no storage call", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ url: "https://x.private.blob.vercel-storage.com/media/a.png" }] }).mockResolvedValueOnce({ rows: [] });
    await removeMedia(1);
    expect(m.del).not.toHaveBeenCalled();
    expect(m.query.mock.calls[1][0]).toMatch(/delete from media/);
  });
});

describe("mediaUsage", () => {
  it("empty for unknown id without a second query", async () => {
    expect(await mediaUsage(1)).toEqual([]);
    expect(m.query).toHaveBeenCalledTimes(1);
  });
  it("searches for the public /media path, not the stored url", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ pathname: "media/a.png" }] }).mockResolvedValueOnce({ rows: [{ kind: "project", key: "p" }] });
    expect(await mediaUsage(1)).toEqual([{ kind: "project", key: "p" }]);
    expect(m.query.mock.calls[1][1]).toEqual(["/media/a.png"]);
  });
});

describe("mediaForServing", () => {
  it("escapes dots and anchors the name in the regex param", async () => {
    m.query.mockResolvedValue({ rows: [{ url: "u", content_type: "image/png", published: true }] });
    expect(await mediaForServing("a.png")).toEqual({ url: "u", content_type: "image/png", published: true });
    const [pathname, re] = m.query.mock.calls[0][1];
    expect(pathname).toBe("media/a.png");
    expect(re).toBe("/media/a\\.png[._-]*($|[^A-Za-z0-9_.-])");
    const rx = new RegExp(re);
    expect(rx.test('"/media/a.png"')).toBe(true);
    expect(rx.test("/media/a.png2")).toBe(false);
    expect(rx.test("/media/aXpng")).toBe(false);
  });
  it("null when the file is unknown", async () => {
    expect(await mediaForServing("nope.png")).toBeNull();
  });
});
