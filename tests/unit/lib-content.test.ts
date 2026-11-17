import { beforeEach, describe, expect, it, vi } from "vitest";

/** site-content, posts, palette, seo, cms-fields and settings fallbacks, with the content store replaced. */
type R = { kind: string; key: string; position: number; data: Record<string, unknown> | null; de: Record<string, unknown> | null; deleted: boolean };
const s = vi.hoisted(() => ({
  dbOn: true,
  draft: false,
  draftThrows: false,
  readAll: vi.fn(),
  saved: null as unknown,
  savedThrows: false,
}));

vi.mock("next/cache", () => ({ unstable_cache: (f: unknown) => f }));
vi.mock("next/headers", () => ({
  draftMode: async () => {
    if (s.draftThrows) throw new Error("outside a request scope");
    return { isEnabled: s.draft };
  },
}));
vi.mock("~/lib/server/db", () => ({
  hasDb: () => s.dbOn,
  query: async () => {
    if (s.savedThrows) throw new Error("db down");
    return { rows: s.saved ? [{ value: s.saved }] : [] };
  },
}));
vi.mock("~/lib/server/store", async (orig) => ({ ...(await orig<typeof import("~/lib/server/store")>()), readAll: (...a: unknown[]) => s.readAll(...a) }));

import { ALL_PROJECT_DATA, CERTIFICATES, EDUCATION, NAV_LINKS, ROLES, SITE, SKILLS } from "~/lib/content";
import { SPECS, deFields } from "~/lib/cms-fields";
import { getPostBySlug, getPostList, getRelatedPosts } from "~/lib/posts";
import { OG_PAGES, pageMeta } from "~/lib/seo";
import { getSearchData, getSiteContent, staticSeed } from "~/lib/site-content";
import { getPaletteItems } from "~/lib/server/palette";
import { getSiteSettings, photoSrc } from "~/lib/server/settings";
import { defaultSettings } from "~/lib/settings";
import { KINDS } from "~/lib/server/store";

const row = (kind: string, key: string, data: unknown, o: Partial<R> = {}): R => ({ kind, key, position: 0, data: data as R["data"], de: null, deleted: false, ...o });
const postData = (slug: string, o: Record<string, unknown> = {}) => ({ slug, title: `Title ${slug}`, description: "desc", date: "2026-03-01", tags: ["a", "b"], body: "one two three", featured: false, ...o });

beforeEach(() => {
  s.dbOn = true;
  s.draft = false;
  s.draftThrows = false;
  s.saved = null;
  s.savedThrows = false;
  s.readAll.mockReset();
  s.readAll.mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getSiteContent", () => {
  it("serves the files when there is no database", async () => {
    s.dbOn = false;
    const c = await getSiteContent("en");
    expect(c.projects.length).toBe(ALL_PROJECT_DATA.filter((p) => !p.hidden).length);
    expect(c.roles).toHaveLength(ROLES.length);
    expect(s.readAll).not.toHaveBeenCalled();
  });

  it("serves the files, and logs, when the database throws", async () => {
    s.readAll.mockRejectedValue(new Error("connection refused"));
    const c = await getSiteContent("en");
    expect(c.certificates).toHaveLength(CERTIFICATES.length);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("database unavailable"), "connection refused");
    s.readAll.mockRejectedValue("a string, not an Error");
    await getSiteContent("en");
    expect(console.error).toHaveBeenLastCalledWith(expect.any(String), "a string, not an Error");
  });

  it("uses the file for any kind that was never seeded, and DB rows for the others", async () => {
    s.readAll.mockResolvedValue([row("skillgroup", "Only", { name: "Only", items: ["x"] })]);
    const c = await getSiteContent("en");
    expect(c.skills).toEqual([{ name: "Only", items: ["x"] }]);
    expect(c.education).toHaveLength(EDUCATION.length);
    expect(c.projects.length).toBeGreaterThan(0);
  });

  it("skips an invalid row and a deleted row, logs the invalid one, keeps the rest", async () => {
    const good = { ...CERTIFICATES[0], slug: "good", date: "2024-01-01" };
    s.readAll.mockResolvedValue([row("certificate", "good", good), row("certificate", "bad", { slug: "bad" }), row("certificate", "gone", { ...good, slug: "gone" }, { deleted: true })]);
    const c = await getSiteContent("en");
    expect(c.certificates.map((x) => x.slug)).toEqual(["good"]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('skipping invalid certificate "bad"'), expect.any(String));
  });

  it("an all-deleted kind is empty (not the files): the owner removed everything", async () => {
    s.readAll.mockResolvedValue([row("skillgroup", "A", { name: "A", items: ["x"] }, { deleted: true })]);
    expect((await getSiteContent("en")).skills).toEqual([]);
  });

  it("sorts certificates newest first, hides hidden projects and renumbers", async () => {
    const base = ALL_PROJECT_DATA[0];
    s.readAll.mockResolvedValue([
      row("certificate", "old", { ...CERTIFICATES[0], slug: "old", date: "2020-01-01" }),
      row("certificate", "new", { ...CERTIFICATES[0], slug: "new", date: "2025-01-01" }),
      row("project", "h", { ...base, slug: "h", hidden: true }),
      row("project", "a", { ...base, slug: "a" }),
      row("project", "b", { ...base, slug: "b" }),
    ]);
    const c = await getSiteContent("en");
    expect(c.certificates.map((x) => x.slug)).toEqual(["new", "old"]);
    expect(c.projects.map((p) => [p.slug, p.num])).toEqual([["a", "01"], ["b", "02"]]);
  });

  it("overlays German only for lang=de", async () => {
    const edu = { ...EDUCATION[0] };
    s.readAll.mockResolvedValue([row("education", edu.school, edu, { de: { degree: "Abschluss" } }), row("skillgroup", "G", { name: "G", items: ["x"] }, { de: { name: "Gruppe" } })]);
    expect((await getSiteContent("en")).education[0].degree).toBe(edu.degree);
    const de = await getSiteContent("de");
    expect(de.education[0].degree).toBe("Abschluss");
    expect(de.skills[0].name).toBe("Gruppe");
  });

  it("roles: German overlay maps path notes by index and ignores a translated place", async () => {
    const role = { ...ROLES[0], path: [{ org: "Old Co", date: "2020", note: "n0" }, { org: "Older", date: "2019", note: "n1" }] };
    s.readAll.mockResolvedValue([row("role", role.org, role, { de: { title: "Titel", place: "Berlin", path: ["Notiz 0"] } }), row("role", "Plain", { ...ROLES[0], org: "Plain" }, { de: null })]);
    const en = await getSiteContent("en");
    expect(en.roles[0].title).toBe(role.title);
    const de = await getSiteContent("de");
    expect(de.roles[0].title).toBe("Titel");
    expect(de.roles[0].place).toBe(role.place);
    expect(de.roles[0].path?.map((p) => p.note)).toEqual(["Notiz 0", "n1"]);
    expect(de.roles[1].org).toBe("Plain");
    // a non-array `path` in the German copy leaves the English notes alone
    s.readAll.mockResolvedValue([row("role", role.org, role, { de: { path: "nope" } })]);
    expect((await getSiteContent("de")).roles[0].path?.map((p) => p.note)).toEqual(["n0", "n1"]);
  });

  it("draft mode reads drafts; a draftMode() failure outside a request falls back to published", async () => {
    s.draft = true;
    await getSiteContent("en");
    expect(s.readAll).toHaveBeenLastCalledWith("draft");
    s.draft = false;
    await getSiteContent("en");
    expect(s.readAll).toHaveBeenLastCalledWith("published");
    s.draftThrows = true;
    await getSiteContent("en");
    expect(s.readAll).toHaveBeenLastCalledWith("published");
  });

  it("staticSeed exposes the file data and getSearchData lists linkable projects and certs for both languages", async () => {
    expect(staticSeed().SKILLS).toBe(SKILLS);
    s.dbOn = false;
    const d = await getSearchData();
    expect(Object.keys(d).sort()).toEqual(["de", "en"]);
    expect(d.en.certs).toHaveLength(CERTIFICATES.length);
    expect(d.en.projects.every((p) => p.href.startsWith("http"))).toBe(true);
  });
});

describe("posts", () => {
  it("without a database it lists published file posts (drafts with published:false are hidden)", async () => {
    s.dbOn = false;
    const list = await getPostList("post", "en");
    expect(list.find((p) => p.slug === "building-nyx-search")).toBeUndefined();
    expect(await getPostList("note", "en")).toEqual([]);
    expect(await getPostBySlug("post", "missing", "en")).toBeNull();
  });

  it("DB posts are sorted newest first, strip content in lists, and carry a localized reading time", async () => {
    s.readAll.mockResolvedValue([
      row("post", "old", postData("old", { date: "2025-01-01" })),
      row("post", "new", postData("new", { date: "2026-05-05", featured: true, body: Array(450).fill("w").join(" ") })),
    ]);
    const list = await getPostList("post", "en");
    expect(list.map((p) => p.slug)).toEqual(["new", "old"]);
    expect(list[0]).not.toHaveProperty("content");
    expect(list[0].featured).toBe(true);
    expect(list[0].readingTime).toBe("2 min read");
    const de = await getPostList("post", "de");
    expect(de[0].readingTime).toBe("2 Min. Lesezeit");
    expect((await getPostBySlug("post", "new", "en"))?.content).toContain("w w");
  });

  it("a CMS row replaces the file post with the same slug, and a deleted one hides it", async () => {
    s.dbOn = false;
    const files = await getPostList("post", "en");
    if (files.length === 0) return; // no published file posts in this checkout
    const slug = files[0].slug;
    s.dbOn = true;
    s.readAll.mockResolvedValue([row("post", slug, postData(slug, { title: "Override" }))]);
    expect((await getPostBySlug("post", slug, "en"))?.title).toBe("Override");
    s.readAll.mockResolvedValue([row("post", slug, null, { deleted: true })]);
    expect(await getPostBySlug("post", slug, "en")).toBeNull();
  });

  it("skips an invalid post row, logs it, and keeps kinds apart", async () => {
    s.readAll.mockResolvedValue([row("post", "bad", { slug: "bad" }), row("note", "n", postData("n")), row("post", "ok", postData("ok"))]);
    expect((await getPostList("post", "en")).map((p) => p.slug)).toEqual(["ok"]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('skipping invalid post "bad"'));
    expect((await getPostList("note", "en")).map((p) => p.slug)).toEqual(["n"]);
  });

  it("German copy overrides title, description and body; the reading time follows the German body", async () => {
    s.readAll.mockResolvedValue([row("post", "p", postData("p"), { de: { title: "Titel", description: "Beschreibung", body: Array(1000).fill("x").join(" ") } })]);
    const en = await getPostBySlug("post", "p", "en");
    const de = await getPostBySlug("post", "p", "de");
    expect(en?.title).toBe("Title p");
    expect(de).toMatchObject({ title: "Titel", description: "Beschreibung", readingTime: "5 Min. Lesezeit" });
  });

  it("an empty body still counts as one minute", async () => {
    s.readAll.mockResolvedValue([row("post", "e", postData("e", { body: "" }))]);
    expect((await getPostList("post", "en"))[0].readingTime).toBe("1 min read");
  });

  it("related posts rank by shared tags, exclude the post itself and respect the limit", async () => {
    s.readAll.mockResolvedValue([
      row("post", "me", postData("me", { tags: ["a", "b"], date: "2026-01-01" })),
      row("post", "one", postData("one", { tags: ["a"], date: "2026-01-02" })),
      row("post", "two", postData("two", { tags: ["a", "b"], date: "2026-01-03" })),
      row("post", "none", postData("none", { tags: ["z"], date: "2026-01-04" })),
    ]);
    expect((await getRelatedPosts("post", "me", "en")).map((p) => p.slug)).toEqual(["two", "one", "none"]);
    expect((await getRelatedPosts("post", "me", "en", 1)).map((p) => p.slug)).toEqual(["two"]);
    expect(await getRelatedPosts("post", "ghost", "en")).toEqual([]);
  });
});

describe("palette", () => {
  it("builds pages, actions, projects and deep-search entries; blog/notes links only when there is something to read", async () => {
    s.dbOn = false;
    const items = await getPaletteItems("en");
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    // No /now text in settings → no /now entry (the page 404s).
    expect(ids).not.toContain("page-now");
    for (const id of ["resume-download", "schedule", "theme", "sound", "email", "vcard", "shortcuts", "github", "linkedin"]) expect(ids).toContain(id);
    expect(ids).not.toContain("page-/notes");
    expect(items.some((i) => i.group === "Skills")).toBe(true);
    expect(items.some((i) => i.group === "Experience")).toBe(true);
    expect(items.some((i) => i.group === "Certifications")).toBe(true);
    expect(ids.includes("call")).toBe(Boolean(SITE.call));
    const withNotes = NAV_LINKS.some((l) => l.href === "/notes");
    s.dbOn = true;
    s.readAll.mockResolvedValue([row("note", "n", postData("n")), row("post", "p", postData("p"))]);
    const ids2 = (await getPaletteItems("en")).map((i) => i.id);
    expect(ids2).toContain("page-/blog");
    if (withNotes) expect(ids2).toContain("page-/notes");
  });

  it("German entries keep the language-neutral paths (localePath is the identity) and the deep links are url-encoded", async () => {
    s.dbOn = false;
    const items = await getPaletteItems("de");
    const skill = items.find((i) => i.group === "Skills")!;
    expect(skill.value).toMatch(/^\/skills\?q=[^\s&]+$/);
    expect(skill.id).toMatch(/^[a-z0-9-]+$/);
    for (const i of items.filter((x) => x.run === "href")) expect(i.value!.startsWith("/")).toBe(true);
  });
});

describe("seo.pageMeta", () => {
  it("returns title, description, canonical and a per-page share image in English", () => {
    const m = pageMeta("skills", "en", "/skills");
    expect(m.alternates?.canonical).toBe("/skills");
    expect((m.openGraph as { images: { url: string }[] }).images[0].url).toBe("/og?page=skills");
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["/og?page=skills"] });
    expect(typeof m.title).toBe("string");
  });
  it("adds lang=de to the image url and every OG page resolves to non-empty text in both languages", () => {
    for (const key of Object.keys(OG_PAGES) as (keyof typeof OG_PAGES)[]) {
      for (const lang of ["en", "de"] as const) {
        const m = pageMeta(key, lang, `/${key}`);
        expect(String(m.title).length).toBeGreaterThan(0);
        expect(String(m.description).length).toBeGreaterThan(0);
      }
    }
    expect((pageMeta("about", "de", "/about").twitter as { images: string[] }).images[0]).toBe("/og?page=about&lang=de");
  });
  it("falls back to the fixed OG text for a page the dictionary does not know", () => {
    const m = pageMeta("legal", "en", "/legal");
    expect(m.title).toBeTruthy();
  });
});

describe("cms-fields", () => {
  it("every kind has a spec whose key field and title field exist", () => {
    for (const k of KINDS) {
      const spec = SPECS[k];
      const names = spec.fields.map((f) => f.name);
      expect(names).toContain(spec.keyField);
      expect(names).toContain(spec.titleField);
      expect(new Set(names).size).toBe(names.length);
      expect(spec.preview("k").startsWith("/")).toBe(true);
    }
    expect(SPECS.post.preview("hello")).toBe("/blog/hello");
    expect(SPECS.note.preview("hello")).toBe("/notes/hello");
    expect(SPECS.project.preview("x")).toBe("/projects");
    expect(SPECS.role.preview("x")).toBe("/experience");
    expect(SPECS.education.preview("x")).toBe("/experience");
    expect(SPECS.skillgroup.preview("x")).toBe("/skills");
    expect(SPECS.certificate.preview("x")).toBe("/certifications");
  });
  it("select fields carry options and media fields say what they accept", () => {
    for (const k of KINDS) for (const f of SPECS[k].fields) {
      if (f.type === "select" || f.type === "cats") expect(f.options?.length).toBeGreaterThan(0);
      if (f.type === "media") expect(["image", "file"]).toContain(f.accept);
    }
  });
  it("deFields returns only the translatable fields", () => {
    expect(deFields("post").map((f) => f.name)).toEqual(["title", "description", "body"]);
    expect(deFields("education").every((f) => f.de)).toBe(true);
    expect(deFields("skillgroup").map((f) => f.name)).toEqual(["name"]);
  });
});

describe("site settings fallbacks", () => {
  it("returns the defaults without a database and when the read fails", async () => {
    s.dbOn = false;
    expect(await getSiteSettings()).toEqual(defaultSettings());
    s.dbOn = true;
    s.savedThrows = true;
    expect(await getSiteSettings()).toEqual(defaultSettings());
  });
  it("merges saved values over the defaults; blank text falls back", async () => {
    s.saved = { location: " Berlin ", available: false, heroTitle: { en: "  ", de: "Hallo" } };
    const r = await getSiteSettings();
    expect(r.location).toBe("Berlin");
    expect(r.available).toBe(false);
    expect(r.heroTitle.en).toBe(defaultSettings().heroTitle.en);
    expect(r.heroTitle.de).toBe("Hallo");
  });
  it("photoSrc: the CMS photo wins, otherwise the bundled one or empty (never a 404 path)", () => {
    const base = defaultSettings();
    expect(photoSrc({ ...base, photo: "/media/a.png" })).toBe("/media/a.png");
    expect(["", "/me.jpg"]).toContain(photoSrc(base));
  });
});
