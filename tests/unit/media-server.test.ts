import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ query: vi.fn(), head: vi.fn(), del: vi.fn() }));
vi.mock("~/lib/server/db", () => ({ query: m.query, hasDb: () => true, pool: vi.fn() }));
vi.mock("@vercel/blob", () => ({ head: m.head, del: m.del }));

import { addMedia, blobConfigured, listMedia, mediaForServing, mediaUsage, removeMedia, setMediaAlt } from "~/lib/server/media";

const URL_OK = "https://abc.private.blob.vercel-storage.com/media/a.png";

beforeEach(() => {
  vi.resetAllMocks();
  m.query.mockResolvedValue({ rows: [] });
});

describe("blobConfigured", () => {
  it("follows BLOB_READ_WRITE_TOKEN", () => {
    const old = process.env.BLOB_READ_WRITE_TOKEN;
    process.env.BLOB_READ_WRITE_TOKEN = "t";
    expect(blobConfigured()).toBe(true);
    process.env.BLOB_READ_WRITE_TOKEN = "";
    expect(blobConfigured()).toBe(false);
    if (old === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = old;
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
  it.each(["http://abc.blob.vercel-storage.com/a.png", "https://evil.com/a.png", "https://blob.vercel-storage.com.evil.com/a", "not a url", "", "javascript:alert(1)"])(
    "rejects non-blob url %j without touching blob or db",
    async (u) => {
      await expect(addMedia(u, 1, 1)).rejects.toThrow("Not a Vercel Blob URL.");
      expect(m.head).not.toHaveBeenCalled();
      expect(m.query).not.toHaveBeenCalled();
    },
  );
  it("takes size/type from the blob store, not the client", async () => {
    m.head.mockResolvedValue({ url: URL_OK, pathname: "media/a.png", contentType: "image/png", size: 123 });
    m.query.mockResolvedValue({ rows: [{ id: 5 }] });
    expect(await addMedia(URL_OK, 10, 20)).toEqual({ id: 5 });
    expect(m.query.mock.calls[0][1]).toEqual([URL_OK, "media/a.png", "image/png", 123, 10, 20]);
    expect(m.query.mock.calls[0][0]).toMatch(/on conflict \(url\)/);
  });
  it("propagates head failure (file not in store) and writes nothing", async () => {
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
  it("deletes the blob first, then the row", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ url: URL_OK }] }).mockResolvedValueOnce({ rows: [] });
    await removeMedia(1);
    expect(m.del).toHaveBeenCalledWith(URL_OK);
    expect(m.query.mock.calls[1][0]).toMatch(/delete from media/);
  });
  it("keeps the row if blob deletion fails", async () => {
    m.query.mockResolvedValueOnce({ rows: [{ url: URL_OK }] });
    m.del.mockRejectedValue(new Error("blob down"));
    await expect(removeMedia(1)).rejects.toThrow("blob down");
    expect(m.query).toHaveBeenCalledTimes(1);
  });
});

describe("mediaUsage", () => {
  it("empty for unknown id without a second query", async () => {
    expect(await mediaUsage(1)).toEqual([]);
    expect(m.query).toHaveBeenCalledTimes(1);
  });
  it("searches for the public /media path, not the blob url", async () => {
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
