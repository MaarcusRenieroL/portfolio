import { beforeEach, describe, expect, it, vi } from "vitest";

/** posts.ts merges file posts with CMS rows. Both sources are stubbed; no DB. */
const m = vi.hoisted(() => ({
  rows: null as null | Record<string, unknown>[],
  files: [] as { slug: string; date: string; readingTime: string; body: string; tags?: string[] }[],
  err: vi.fn(),
}));
vi.mock("~/lib/site-content", () => ({ contentRows: async () => m.rows }));
vi.mock("~/lib/data/blog", () => ({
  getPosts: () => m.files.map((f) => ({ slug: f.slug })),
  getPost: (slug: string) => {
    const f = m.files.find((x) => x.slug === slug);
    return f ? { slug, title: `T-${slug}`, description: "d", date: f.date, tags: f.tags ?? [], featured: false, readingTime: f.readingTime, content: f.body } : null;
  },
}));

import { getPostBySlug, getPostList, getRelatedPosts } from "~/lib/posts";

const post = (slug: string, o: Record<string, unknown> = {}) => ({ slug, title: `Title ${slug}`, description: "desc", date: "2026-01-01", tags: [], body: "one two three", ...o });
const row = (kind: string, key: string, data: unknown, extra: Record<string, unknown> = {}) => ({ kind, key, data, deleted: false, de: null, ...extra });

beforeEach(() => {
  m.rows = null;
  m.files = [];
  vi.spyOn(console, "error").mockImplementation(m.err);
  m.err.mockClear();
});

describe("getPostList", () => {
  it("serves file posts, newest first, without content, when the CMS is down (rows = null)", async () => {
    m.files = [
      { slug: "old", date: "2024-01-01", readingTime: "3 min read", body: "x" },
      { slug: "new", date: "2025-06-01", readingTime: "9 min read", body: "x" },
    ];
    const list = await getPostList("post", "en");
    expect(list.map((p) => p.slug)).toEqual(["new", "old"]);
    expect(list[0]).not.toHaveProperty("content");
    expect(list[0].readingTime).toBe("9 min read");
  });
  it("localises the file post reading time and defaults a malformed one to 1", async () => {
    m.files = [
      { slug: "a", date: "2024-01-01", readingTime: "5 min read", body: "x" },
      { slug: "b", date: "2024-01-02", readingTime: "unknown", body: "x" },
    ];
    const de = await getPostList("post", "de");
    expect(de.find((p) => p.slug === "a")!.readingTime).toBe("5 Min. Lesezeit");
    expect(de.find((p) => p.slug === "b")!.readingTime).toBe("1 Min. Lesezeit");
  });
  it("skips a file that is listed but cannot be read (race with deletion)", async () => {
    m.files = [{ slug: "a", date: "2024-01-01", readingTime: "1 min read", body: "x" }];
    const orig = m.files.slice();
    m.files = new Proxy(orig, {
      get: (t, k) => (k === "find" ? () => undefined : Reflect.get(t, k)),
    }) as typeof m.files;
    expect(await getPostList("post", "en")).toEqual([]);
  });
  it("never reads file posts for notes", async () => {
    m.files = [{ slug: "a", date: "2024-01-01", readingTime: "1 min read", body: "x" }];
    expect(await getPostList("note", "en")).toEqual([]);
  });
  it("a CMS post overrides the file with the same slug; a deleted one hides it", async () => {
    m.files = [
      { slug: "keep", date: "2024-01-01", readingTime: "1 min read", body: "x" },
      { slug: "hide", date: "2024-01-02", readingTime: "1 min read", body: "x" },
      { slug: "over", date: "2024-01-03", readingTime: "1 min read", body: "x" },
    ];
    m.rows = [
      row("post", "hide", null, { deleted: true }),
      row("post", "over", post("over", { title: "From CMS", date: "2026-02-02", featured: true })),
      row("note", "n1", post("n1")),
    ];
    const list = await getPostList("post", "en");
    expect(list.map((p) => p.slug)).toEqual(["over", "keep"]);
    expect(list[0]).toMatchObject({ title: "From CMS", featured: true });
  });
  it("skips invalid CMS rows (logging) and keeps going", async () => {
    m.rows = [row("post", "bad", { slug: "bad" }), row("post", "bad2", post("x", { date: "01/02/2026" })), row("post", "ok", post("ok"))];
    const list = await getPostList("post", "en");
    expect(list.map((p) => p.slug)).toEqual(["ok"]);
    expect(m.err).toHaveBeenCalledTimes(2);
  });
  it("applies German overrides per field only for lang=de, and ignores them for en", async () => {
    m.rows = [row("post", "p", post("p", { body: "a b c" }), { de: { title: "Deutsch" } })];
    const de = (await getPostBySlug("post", "p", "de"))!;
    expect(de.title).toBe("Deutsch");
    expect(de.description).toBe("desc");
    expect(de.content).toBe("a b c");
    expect((await getPostBySlug("post", "p", "en"))!.title).toBe("Title p");
  });
  it("computes reading time from the (translated) body, minimum 1, 200 wpm", async () => {
    const long = Array(450).fill("w").join(" ");
    m.rows = [row("post", "p", post("p", { body: "short" }), { de: { body: long } }), row("post", "empty", post("empty", { body: "   " }))];
    expect((await getPostBySlug("post", "p", "en"))!.readingTime).toBe("1 min read");
    expect((await getPostBySlug("post", "p", "de"))!.readingTime).toBe("2 Min. Lesezeit");
    expect((await getPostBySlug("post", "empty", "en"))!.readingTime).toBe("1 min read");
  });
  it("sorts equal dates deterministically and handles notes only from the CMS", async () => {
    m.rows = [row("note", "a", post("a", { date: "2026-03-03" })), row("note", "b", post("b", { date: "2026-04-04" }))];
    expect((await getPostList("note", "en")).map((p) => p.slug)).toEqual(["b", "a"]);
  });
});

describe("getPostBySlug", () => {
  it("returns null for unknown or deleted slugs", async () => {
    m.rows = [row("post", "gone", null, { deleted: true })];
    expect(await getPostBySlug("post", "nope", "en")).toBeNull();
    expect(await getPostBySlug("post", "gone", "en")).toBeNull();
    expect(await getPostBySlug("post", "__proto__", "en")).toBeNull();
  });
  it("does not mix kinds: a note slug is not a post", async () => {
    m.rows = [row("note", "n", post("n"))];
    expect(await getPostBySlug("post", "n", "en")).toBeNull();
    expect(await getPostBySlug("note", "n", "en")).not.toBeNull();
  });
});

describe("getRelatedPosts", () => {
  beforeEach(() => {
    m.rows = [
      row("post", "me", post("me", { tags: ["a", "b"], date: "2026-01-05" })),
      row("post", "one", post("one", { tags: ["a"], date: "2026-01-04" })),
      row("post", "two", post("two", { tags: ["a", "b"], date: "2026-01-03" })),
      row("post", "none", post("none", { tags: ["z"], date: "2026-01-02" })),
      row("post", "none2", post("none2", { tags: [], date: "2026-01-01" })),
    ];
  });
  it("ranks by shared tags, excludes itself, and respects the limit", async () => {
    expect((await getRelatedPosts("post", "me", "en")).map((p) => p.slug)).toEqual(["two", "one", "none"]);
    expect((await getRelatedPosts("post", "me", "en", 1)).map((p) => p.slug)).toEqual(["two"]);
    expect(await getRelatedPosts("post", "me", "en", 0)).toEqual([]);
  });
  it("returns [] for an unknown slug", async () => {
    expect(await getRelatedPosts("post", "ghost", "en")).toEqual([]);
  });
});
