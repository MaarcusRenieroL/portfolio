import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Branch coverage for the content layer: palette, site-content search data, localize fallbacks, the
 * structured-data graph and the schema error formatter. The content store and the DB are mocked, so
 * nothing here touches the real Postgres.
 */
type R = { kind: string; key: string; position: number; data: Record<string, unknown> | null; de: Record<string, unknown> | null; deleted: boolean };
const s = vi.hoisted(() => ({ readAll: vi.fn(), saved: null as unknown }));

vi.mock("next/cache", () => ({ unstable_cache: (f: unknown) => f }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ isEnabled: false }) }));
vi.mock("~/lib/server/db", () => ({
  hasDb: () => true,
  query: async () => ({ rows: s.saved ? [{ value: s.saved }] : [] }),
}));
vi.mock("~/lib/server/store", async (orig) => ({ ...(await orig<typeof import("~/lib/server/store")>()), readAll: (...a: unknown[]) => s.readAll(...a) }));

import { ALL_PROJECT_DATA, CERTIFICATES, EDUCATION, ROLES, SITE, SKILLS } from "~/lib/content";
import { CERTS_DE, EDUCATION_DE, ROLES_DE, SKILL_GROUPS_DE } from "~/lib/content-de";
import { DICT } from "~/lib/dict";
import { certificatesFor, educationFor, reasonsFor, rolesFor, skillsFor } from "~/lib/localize";
import { check, roleSchema } from "~/lib/schema";
import { getSearchData, getSiteContent } from "~/lib/site-content";
import { getPaletteItems } from "~/lib/server/palette";
import { siteGraph } from "~/lib/structured-data";

const row = (kind: string, key: string, data: unknown, o: Partial<R> = {}): R => ({ kind, key, position: 0, data: data as R["data"], de: null, deleted: false, ...o });
const project = (slug: string, o: Record<string, unknown>) => ({ ...(ALL_PROJECT_DATA[0] as Record<string, unknown>), slug, name: `P ${slug}`, hidden: false, site: undefined, github: undefined, ...o });

beforeEach(() => {
  s.readAll.mockReset();
  s.readAll.mockResolvedValue([]);
  s.saved = null;
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("palette and search data from CMS rows", () => {
  const rows = () => [
    row("project", "site-only", project("site-only", { site: "https://site.example" })),
    row("project", "gh-only", project("gh-only", { github: "https://github.com/x/y" })),
    row("project", "both", project("both", { site: "https://both.example", github: "https://github.com/x/z" })),
    row("project", "neither", project("neither", {})),
    row("role", "Org A", { ...ROLES[0], org: "Org A", place: "Chennai", tags: ["a", "b"] }),
    row("role", "Org B", { ...ROLES[0], org: "Org B", place: undefined, tags: [] }),
  ];

  it("prefers a project's site over its github, falls back to github, and drops projects with neither", async () => {
    s.readAll.mockResolvedValue(rows());
    const d = await getSearchData();
    for (const lang of ["en", "de"] as const) {
      const byName = Object.fromEntries(d[lang].projects.map((p) => [p.name, p.href]));
      expect(byName["P site-only"]).toBe("https://site.example");
      expect(byName["P gh-only"]).toBe("https://github.com/x/y");
      expect(byName["P both"]).toBe("https://both.example");
      expect(byName["P neither"]).toBeUndefined();
    }
  });

  it("palette: project value is site else github, roles without place/tags render a clean hint, empty keywords", async () => {
    s.readAll.mockResolvedValue(rows());
    const items = await getPaletteItems("en");
    const val = (id: string) => items.find((i) => i.id === id);
    expect(val("project-site-only")?.value).toBe("https://site.example");
    expect(val("project-gh-only")?.value).toBe("https://github.com/x/y");
    expect(val("project-both")?.value).toBe("https://both.example");
    expect(val("project-neither")).toBeUndefined();
    const a = val("role-org-a")!;
    expect(a.hint).toContain(" · Chennai");
    expect(a.keywords).toContain("a b");
    const b = val("role-org-b")!;
    expect(b.hint).not.toContain("·");
    expect(b.keywords?.trim()).toBe("");
  });

  it("palette: a /now entry appears when only the German text is set, and in both languages", async () => {
    s.saved = { now: { en: "   ", de: "Heute" } };
    for (const lang of ["en", "de"] as const) {
      const ids = (await getPaletteItems(lang)).map((i) => i.id);
      expect(ids).toContain("page-now");
    }
    s.saved = { now: { en: "", de: "  " } };
    expect((await getPaletteItems("en")).map((i) => i.id)).not.toContain("page-now");
  });

  it("palette: an empty skills group and a role with an apostrophe/symbol org slug cleanly", async () => {
    s.readAll.mockResolvedValue([
      row("skillgroup", "Empty", { name: "Empty", items: [] }),
      row("skillgroup", "Tools", { name: "C++ & Co.", items: ["C++", "R&D"] }),
      row("role", "Zed's Lab!", { ...ROLES[0], org: "Zed's Lab!" }),
      row("certificate", "c1", { ...CERTIFICATES[0], title: "A/B Test #1" }),
    ]);
    const items = await getPaletteItems("de");
    expect(items.filter((i) => i.hint === "Empty")).toHaveLength(0);
    expect(items.find((i) => i.label === "C++")?.id).toBe("skill-c-co-c-");
    expect(items.find((i) => i.label === "C++")?.value).toBe("/skills?q=C%2B%2B");
    expect(items.some((i) => i.id === "role-zed-s-lab-")).toBe(true);
    expect(items.find((i) => i.group === "Certifications")?.value).toBe("/certifications?q=A%2FB%20Test%20%231");
  });
});

describe("palette optional entries", () => {
  it("adds a call action only when SITE.call is set, and falls back to English labels the dictionary lacks", async () => {
    const site = SITE as { call?: string };
    const oldCall = site.call;
    const items = DICT.en.palette.items as Record<string, string | undefined>;
    const [oldResume, oldSound] = [items.resume, items.sound];
    try {
      site.call = undefined;
      expect((await getPaletteItems("en")).some((i) => i.id === "call")).toBe(false);
      site.call = "tel:+10000000000";
      const withCall = (await getPaletteItems("en")).find((i) => i.id === "call");
      expect(withCall).toMatchObject({ run: "external", value: "tel:+10000000000" });
      delete items.resume;
      delete items.sound;
      const all = await getPaletteItems("en");
      expect(all.find((i) => i.id === "resume-download")?.label).toBe("Download Resume (PDF)");
      expect(all.find((i) => i.id === "sound")?.label).toBe("Toggle sound effects");
    } finally {
      site.call = oldCall;
      items.resume = oldResume;
      items.sound = oldSound;
    }
  });
});

describe("site-content German overlay edge cases", () => {
  it("a role whose German text has a shorter path list keeps the English notes for the rest", async () => {
    const r = ROLES.find((x) => (x.path?.length ?? 0) > 1)!;
    s.readAll.mockResolvedValue([row("role", r.org, r, { de: { title: "T", path: "not-an-array", place: "ignored" } })]);
    const c = await getSiteContent("de");
    expect(c.roles[0].title).toBe("T");
    expect(c.roles[0].path?.map((p) => p.note)).toEqual(r.path!.map((p) => p.note));
    s.readAll.mockResolvedValue([row("role", r.org, r, { de: { path: ["only first"] } })]);
    const c2 = await getSiteContent("de");
    expect(c2.roles[0].path![0].note).toBe("only first");
    expect(c2.roles[0].path![1].note).toBe(r.path![1].note);
  });

  it("a role with no path and German text is returned without a path", async () => {
    const { path: _p, ...noPath } = ROLES[0];
    void _p;
    s.readAll.mockResolvedValue([row("role", ROLES[0].org, noPath, { de: { title: "Titel" } })]);
    const c = await getSiteContent("de");
    expect(c.roles[0].path).toBeUndefined();
    expect(c.roles[0].title).toBe("Titel");
  });
});

describe("localize fallbacks when a translation is missing", () => {
  const restore: (() => void)[] = [];
  afterEach(() => restore.splice(0).reverse().forEach((f) => f()));
  const drop = <T extends object>(obj: T, key: string) => {
    const k = key as keyof T;
    const old = obj[k];
    delete obj[k];
    restore.push(() => { obj[k] = old; });
  };

  it("rolesFor('de') returns the English role untouched when ROLES_DE has no entry", () => {
    const org = ROLES[0].org;
    drop(ROLES_DE, org);
    expect(rolesFor("de")[0]).toBe(ROLES[0]);
  });

  it("rolesFor('de') keeps the English date, and English step notes beyond the translated ones", () => {
    const i = ROLES.findIndex((r) => (r.path?.length ?? 0) > 0);
    const r = ROLES[i];
    const old = ROLES_DE[r.org];
    ROLES_DE[r.org] = { ...old, date: undefined, path: undefined } as typeof old;
    restore.push(() => { ROLES_DE[r.org] = old; });
    const out = rolesFor("de")[i];
    expect(out.date).toBe(r.date);
    expect(out.path?.map((p) => p.note)).toEqual(r.path?.map((p) => p.note));
  });

  it("rolesFor('de') survives a role without a path", () => {
    const i = ROLES.findIndex((r) => !r.path);
    if (i < 0) return;
    expect(rolesFor("de")[i].path).toBeUndefined();
  });

  it("educationFor / certificatesFor / skillsFor fall back to English when untranslated", () => {
    drop(EDUCATION_DE, EDUCATION[0].school);
    expect(educationFor("de")[0]).toEqual(EDUCATION[0]);
    drop(CERTS_DE, CERTIFICATES[0].slug);
    expect(certificatesFor("de")[0]).toEqual(CERTIFICATES[0]);
    drop(SKILL_GROUPS_DE, SKILLS.used[0].name);
    expect(skillsFor("de")[0].name).toBe(SKILLS.used[0].name);
    expect(skillsFor("en")).toBe(SKILLS.used);
  });

  it("reasonsFor falls back to the English label/placeholder for a reason the dictionary lacks", () => {
    const reasons = DICT.de.contact.reasons as Record<string, string>;
    const ph = DICT.de.contact.placeholders as Record<string, string>;
    const id = Object.keys(reasons)[0];
    const [oldR, oldP] = [reasons[id], ph[id]];
    delete reasons[id];
    delete ph[id];
    restore.push(() => { reasons[id] = oldR; ph[id] = oldP; });
    const out = reasonsFor("de").find((r) => r.id === id)!;
    expect(out.label.length).toBeGreaterThan(0);
    expect(out.label).not.toBe(oldR);
    expect(reasonsFor("en").every((r) => r.label && r.placeholder)).toBe(true);
  });
});

describe("structured data graph", () => {
  const base = { lang: "en" as const, education: EDUCATION, skills: ["a"] };
  const person = (g: ReturnType<typeof siteGraph>) => (g["@graph"] as Record<string, unknown>[]).find((n) => n["@type"] === "Person")!;

  it("worksFor carries the url only when the current role has one, and is absent with no current role", () => {
    const withUrl = person(siteGraph({ ...base, roles: [{ ...ROLES[0], now: true, url: "https://x.example" }] })) as { worksFor?: { url?: string } };
    expect(withUrl.worksFor?.url).toBe("https://x.example");
    const noUrl = person(siteGraph({ ...base, roles: [{ ...ROLES[0], now: true, url: undefined }] })) as { worksFor?: Record<string, unknown> };
    expect(noUrl.worksFor).toMatchObject({ name: ROLES[0].org });
    expect("url" in noUrl.worksFor!).toBe(false);
    expect("worksFor" in person(siteGraph({ ...base, roles: [{ ...ROLES[0], now: false }] }))).toBe(false);
  });

  it("alumniOf includes a url only for schools that have one; photo adds image", () => {
    const g = person(siteGraph({ ...base, roles: [], education: [{ ...EDUCATION[0], url: "https://u.example" }, { ...EDUCATION[0], school: "Nowhere", url: undefined }], photo: "/me.jpg" })) as { alumniOf: Record<string, unknown>[]; image?: string };
    expect(g.alumniOf[0].url).toBe("https://u.example");
    expect("url" in g.alumniOf[1]).toBe(false);
    expect(g.image).toMatch(/\/me\.jpg$/);
  });

  it("the profile page name falls back to the site name when the dictionary has no meta title", () => {
    const meta = DICT.de.meta as { title?: string };
    const old = meta.title;
    delete meta.title;
    try {
      const g = siteGraph({ ...base, lang: "de", roles: [] });
      const page = (g["@graph"] as Record<string, unknown>[]).find((n) => n["@type"] === "ProfilePage")!;
      expect(page.name).toBeTruthy();
      expect(page.inLanguage).toBe("de");
    } finally {
      meta.title = old;
    }
  });
});

describe("schema.check", () => {
  it("labels a top-level (empty path) failure as (entry) and nested ones by dotted path", () => {
    const z = (globalThis as { __z?: unknown }).__z;
    void z;
    expect(() => check("role", "k", roleSchema, "not an object")).toThrow(/Invalid role "k": \(entry\):/);
    expect(() => check("role", "k", roleSchema, { ...ROLES[0], org: 5 })).toThrow(/Invalid role "k": org:/);
    expect(check("role", "k", roleSchema, ROLES[0]).org).toBe(ROLES[0].org);
  });
});
