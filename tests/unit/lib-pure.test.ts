import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSettings, mergeSettings, settingsSchema } from "~/lib/settings";
import { assetUrl, certAsset, logoUrl, shotUrl } from "~/lib/site";
import { slugify, readingStats } from "~/lib/writing";
import { computeSkillUsage, isSkillMatch } from "~/lib/skill-match";
import { breadcrumbs, projectList, siteGraph } from "~/lib/structured-data";
import { LEGAL_DOCS } from "~/lib/legal";
import { RETENTION } from "~/lib/server/retention";
import { isLibraryRef, mediaSrc } from "~/lib/media";

afterEach(() => vi.unstubAllEnvs());

describe("settings", () => {
  it("returns defaults for null and for blank text", () => {
    const d = defaultSettings();
    expect(mergeSettings(null)).toEqual(d);
    const m = mergeSettings({ heroTitle: { en: "   ", de: "" }, location: "  ", homeAbout: { en: "", de: "x" } });
    expect(m.heroTitle).toEqual(d.heroTitle);
    expect(m.location).toBe(d.location);
    expect(m.homeAbout).toEqual({ en: d.homeAbout.en, de: "x" });
  });
  it("keeps saved booleans, photo and resume", () => {
    const m = mergeSettings({ available: false, photo: "/media/a.png", resume: "/media/cv.pdf" });
    expect(m.available).toBe(false);
    expect(m.photo).toBe("/media/a.png");
    expect(m.resume).toBe("/media/cv.pdf");
  });
  it("default settings pass the schema", () => {
    expect(settingsSchema.safeParse(defaultSettings()).success).toBe(true);
  });
  it.each(["https://evil.com/x.png", "/media/", "/media/a/b", "/media/a b", "javascript:alert(1)", "/other/x.png", "//evil.com", "/media/x?y=1"])("rejects media path %s", (p) => {
    expect(settingsSchema.safeParse({ ...defaultSettings(), photo: p }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...defaultSettings(), resume: p }).success).toBe(false);
  });
  it("rejects over-long text", () => {
    expect(settingsSchema.safeParse({ ...defaultSettings(), location: "x".repeat(81) }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...defaultSettings(), homeAbout: { en: "x".repeat(1501), de: "" } }).success).toBe(false);
  });
});

describe("asset urls", () => {
  it("uses /public paths without a base path", () => {
    expect(shotUrl("nyx", "a.png")).toBe("/projects/nyx/a.png");
    expect(logoUrl("a.svg")).toBe("/logos/a.svg");
    expect(certAsset("c.pdf")).toBe("/certificates/c.pdf");
  });
  it("prefixes NEXT_PUBLIC_BASE_PATH", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/base");
    expect(shotUrl("nyx", "a.png")).toBe("/base/projects/nyx/a.png");
    expect(logoUrl("a.svg")).toBe("/base/logos/a.svg");
    expect(shotUrl("nyx", "/media/x.png")).toBe("/base/media/x.png");
    expect(logoUrl("/media/x.png")).toBe("/base/media/x.png");
    expect(certAsset("/media/x.pdf")).toBe("/base/media/x.pdf");
  });
  it("passes absolute https urls through untouched", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/base");
    expect(shotUrl("s", "https://x.test/a.png")).toBe("https://x.test/a.png");
  });
  it("uses the assets domain for every site file when set", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSETS_URL", "https://cdn.test/");
    expect(certAsset("c.pdf")).toBe("https://cdn.test/certifications/c.pdf");
    expect(shotUrl("nyx", "cover.webp")).toBe("https://cdn.test/projects/nyx/cover.webp");
    expect(logoUrl("a.svg")).toBe("https://cdn.test/logos/a.svg");
    expect(assetUrl("files", "/resume.pdf")).toBe("https://cdn.test/resume.pdf");
    // Library paths stay on the site: drafts serve them from /media, live content is rewritten on the server.
    expect(certAsset("/media/c.pdf")).toBe("/media/c.pdf");
  });
  it("falls back to /public folders without the assets domain", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSETS_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(certAsset("c.pdf")).toBe("/certificates/c.pdf");
    expect(assetUrl("files", "resume.pdf")).toBe("/resume.pdf");
  });
  it("media helpers", () => {
    expect(mediaSrc({ pathname: "media/a-1.png" })).toBe("/media/a-1.png");
    expect(isLibraryRef("/media/x")).toBe(true);
    expect(isLibraryRef("http://x")).toBe(false);
    expect(isLibraryRef("x.png")).toBe(false);
  });
});

describe("writing", () => {
  it("slugifies", () => {
    expect(slugify("Why I rebuilt my site (again)!")).toBe("why-i-rebuilt-my-site-again");
    expect(slugify("Café Über")).toBe("cafe-uber");
    expect(slugify("!!!")).toBe("");
    expect(slugify("a".repeat(200)).length).toBe(80);
  });
  it("reading stats ignore code and image urls, min 1 minute", () => {
    expect(readingStats("")).toEqual({ words: 0, minutes: 1 });
    const r = readingStats("hello world ```code code code``` ![alt](http://x/y.png) [link](http://z)");
    expect(r.words).toBe(3);
    expect(readingStats("word ".repeat(2200)).minutes).toBe(10);
  });
});

describe("skill match", () => {
  it("matches same tech only", () => {
    expect(isSkillMatch("Java", "JavaScript")).toBe(false);
    expect(isSkillMatch("Go", "Django")).toBe(false);
    expect(isSkillMatch("Go", "MongoDB")).toBe(false);
    expect(isSkillMatch("Next.js 16", "next.js")).toBe(true);
    expect(isSkillMatch("Spring Boot 3", "Spring Boot")).toBe(true);
    expect(isSkillMatch("Node.js", "nodejs")).toBe(true);
    expect(isSkillMatch("C", "C++")).toBe(false);
    expect(isSkillMatch("Python 3.12", "python v3")).toBe(true);
  });
  it("edge: all-digit skill names are not the same skill", () => {
    expect(isSkillMatch("3", "42")).toBe(false);
    expect(isSkillMatch("Next.js 16", "next.js")).toBe(true);
  });
  it("computes usage", () => {
    const data = {
      roles: [{ org: "A", title: "Dev", date: "2024", tags: ["Java"] }, { org: "B", title: "Dev", tags: ["JavaScript"] }, { org: "C", title: "x" }],
      projects: [{ name: "P", slug: "p", kind: "backend", skills: ["java 21"] }, { name: "Q", slug: "q", kind: "ai" }],
    };
    const u = computeSkillUsage("Java", data);
    expect(u.roles.map((r) => r.org)).toEqual(["A"]);
    expect(u.projects.map((p) => p.slug)).toEqual(["p"]);
    expect(u.normalizedSkill).toBe("java");
    expect(computeSkillUsage("Rust", data).roles).toEqual([]);
  });
});

describe("structured data", () => {
  const roles = [{ org: "Acme", now: true, url: "https://acme.test" }, { org: "Old" }] as never;
  const edu = [{ school: "Uni", url: "https://u.test" }] as never;
  it("links the graph by @id", () => {
    for (const lang of ["en", "de"] as const) {
      const g = siteGraph({ lang, roles, education: edu, skills: Array.from({ length: 40 }, (_, i) => `s${i}`), photo: "/media/a.png" })["@graph"];
      const ids = new Set(g.map((n) => n["@id"]));
      const web = g.find((n) => n["@type"] === "WebSite")!;
      const person = g.find((n) => n["@type"] === "Person")! as Record<string, unknown>;
      const page = g.find((n) => n["@type"] === "ProfilePage")! as Record<string, unknown>;
      expect(ids.has((web.publisher as { "@id": string })["@id"])).toBe(true);
      expect(ids.has((page.isPartOf as { "@id": string })["@id"])).toBe(true);
      expect(ids.has((page.mainEntity as { "@id": string })["@id"])).toBe(true);
      expect(page.inLanguage).toBe(lang);
      expect((person.knowsAbout as string[]).length).toBe(30);
      expect((person.worksFor as { name: string }).name).toBe("Acme");
      expect(person.image).toBe("https://maarcus.dev/media/a.png");
    }
  });
  it("omits optional fields", () => {
    const p = siteGraph({ lang: "en", roles: [], education: [], skills: [] })["@graph"][1] as Record<string, unknown>;
    expect(p).not.toHaveProperty("worksFor");
    expect(p).not.toHaveProperty("image");
  });
  it("breadcrumb positions and urls", () => {
    const en = breadcrumbs("en", [["Projects", "/projects"]]).itemListElement;
    expect(en.map((i) => i.position)).toEqual([1, 2]);
    expect(en[0].item).toBe("https://maarcus.dev");
    expect(en[1].item).toBe("https://maarcus.dev/projects");
    const de = breadcrumbs("de", [["Projekte", "/projects"]]).itemListElement;
    // One URL per page; the language is a cookie, and /de/... redirects.
    expect(de[0].item).toBe("https://maarcus.dev");
    expect(de[1].item).toBe("https://maarcus.dev/projects");
  });
  it("project list", () => {
    const l = projectList("en", [{ name: "N", desc: "d", github: "g", skills: ["a"] }, { name: "M", desc: "e", site: "s", skills: [] }] as never);
    expect(l.itemListElement[0].item).toMatchObject({ codeRepository: "g" });
    expect(l.itemListElement[1].item).toMatchObject({ url: "s" });
    expect(l.itemListElement[1].item).not.toHaveProperty("codeRepository");
  });
});

describe("legal", () => {
  for (const kind of ["privacy", "legal"] as const) {
    it(`${kind}: unique section ids, EN and DE aligned, no empty copy`, () => {
      const en = LEGAL_DOCS[kind].en.sections.map((s) => s.id);
      const de = LEGAL_DOCS[kind].de.sections.map((s) => s.id);
      expect(new Set(en).size).toBe(en.length);
      expect(new Set(de).size).toBe(de.length);
      expect(de).toEqual(en);
      for (const l of ["en", "de"] as const) {
        const d = LEGAL_DOCS[kind][l];
        expect(d.title && d.lead && d.updated).toBeTruthy();
        for (const s of d.sections) {
          expect(s.h.trim()).not.toBe("");
          expect(s.p.length).toBeGreaterThan(0);
        }
        expect(LEGAL_DOCS[kind][l].sections.length).toBe(en.length);
      }
    });
  }
  it("retention numbers in the text match the code", () => {
    const text = (l: "en" | "de") => LEGAL_DOCS.privacy[l].sections.map((s) => [...s.p, ...(s.list ?? [])].join(" ")).join("\n");
    const find = (l: "en" | "de", id: string) => { const s = LEGAL_DOCS.privacy[l].sections.find((x) => x.id === id)!; return [...s.p, ...(s.list ?? [])].join(" "); };
    for (const l of ["en", "de"] as const) {
      expect(find(l, "visiting")).toContain(`${RETENTION.analyticsMonths} `);
      expect(find(l, "visiting")).toContain(`${RETENTION.auditLogMonths} `);
      expect(find(l, "contact")).toContain(`${RETENTION.messageMonths} `);
      expect(find(l, "booking")).toContain(`${RETENTION.bookingMonthsAfterCall} `);
      expect(text(l)).not.toMatch(/\b(6|24|36) (months|Monate)/);
    }
  });
});
