import { describe, expect, it } from "vitest";
import { CERTIFICATES, PROJECTS, REASONS, ROLES, EDUCATION, SKILLS } from "~/lib/content";
import { CERTS_DE, EDUCATION_DE, PROJECTS_DE, ROLES_DE, SKILL_GROUPS_DE } from "~/lib/content-de";
import { DICT, type Dict } from "~/lib/dict";
import { isLang, localePath, stripLang } from "~/lib/i18n";
import { categoriesFor, certificatesFor, projectsFor, reasonsFor, rolesFor, skillsFor, statusFor } from "~/lib/localize";

/** Every key path in an object, so en and de can be compared structurally. */
function paths(o: unknown, prefix = ""): string[] {
  if (typeof o === "function" || typeof o === "string" || typeof o === "number") return [prefix];
  if (Array.isArray(o)) return [prefix];
  return Object.entries(o as object).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}

describe("localePath / stripLang", () => {
  it("links are language-neutral: the language is a cookie, not a path", () => {
    for (const h of ["/skills", "/", "/certifications?q=aws", "/resume.pdf", "/api/vcard", "https://x.dev", "#top"]) {
      expect(localePath("de", h), h).toBe(h);
      expect(localePath("en", h), h).toBe(h);
    }
  });
  it("stripLang drops the internal /en or /de prefix", () => {
    expect(stripLang("/de")).toEqual({ lang: "de", path: "/" });
    expect(stripLang("/de/about")).toEqual({ lang: "de", path: "/about" });
    expect(stripLang("/en/about")).toEqual({ lang: "en", path: "/about" });
    expect(stripLang("/about")).toEqual({ lang: "en", path: "/about" });
    expect(stripLang("/details")).toEqual({ lang: "en", path: "/details" });
  });
  it("isLang", () => {
    expect(isLang("en") && isLang("de")).toBe(true);
    expect(isLang("fr")).toBe(false);
  });
});

describe("dictionary", () => {
  it("German has exactly the same keys as English", () => {
    // The German error map is keyed by the English message, so it is the one place the shapes differ on purpose.
    const keys = (d: Dict) => paths(d).filter((p) => !p.startsWith("contact.errors")).sort();
    expect(keys(DICT.de)).toEqual(keys(DICT.en));
  });
  it("no German string is left identical to English where it must differ", () => {
    for (const k of ["home.open", "home.about", "about.p1", "contact.title", "skills.lead", "certs.search", "status.retry"] as const) {
      const get = (d: Dict) => k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], d);
      expect(get(DICT.de), k).not.toBe(get(DICT.en));
    }
  });
  it("German error messages cover every English validation and server message", () => {
    const keys = Object.keys(DICT.de.contact.errors);
    for (const m of ["Please enter your name", "Please enter a valid email", "Message should be at least 10 characters", "Message is too long", "Please fix the highlighted fields."]) expect(keys).toContain(m);
  });
  it("function entries format correctly in both languages", () => {
    expect(DICT.en.skills.count(1, false)).toBe("1 skill");
    expect(DICT.en.skills.count(3, true)).toBe("3 skills match");
    expect(DICT.de.skills.count(1, true)).toBe("1 Skill passt");
    expect(DICT.de.skills.count(5, false)).toBe("5 Skills");
    expect(DICT.de.chrome.themeTo("light")).toContain("hellen");
    expect(DICT.de.chrome.themeTo("dark")).toContain("dunklen");
  });
});

describe("German content", () => {
  it("every project, role, certificate, education entry and skill group has a translation", () => {
    for (const p of PROJECTS) expect(PROJECTS_DE[p.slug]?.desc, p.slug).toBeTruthy();
    for (const r of ROLES) {
      const t = ROLES_DE[r.org];
      expect(t, r.org).toBeTruthy();
      expect(t.points.length, `${r.org} points`).toBe(r.points.length);
      if (r.path) expect(t.path?.length, `${r.org} path`).toBe(r.path.length);
    }
    for (const c of CERTIFICATES) expect(CERTS_DE[c.slug]?.about, c.slug).toBeTruthy();
    for (const e of EDUCATION) expect(EDUCATION_DE[e.school], e.school).toBeTruthy();
    for (const g of SKILLS.used) expect(SKILL_GROUPS_DE[g.name], g.name).toBeTruthy();
    for (const r of REASONS) expect(DICT.de.contact.reasons[r.id], r.id).toBeTruthy();
  });
  it("translations keep facts that must not change (links, numbers, names)", () => {
    const de = projectsFor("de");
    for (const p of de) {
      const en = PROJECTS.find((x) => x.slug === p.slug)!;
      expect([p.site, p.github, p.name, p.slug]).toEqual([en.site, en.github, en.name, en.slug]);
    }
    expect(rolesFor("de").map((r) => [r.org, r.logo, r.url])).toEqual(ROLES.map((r) => [r.org, r.logo, r.url]));
    const certs = certificatesFor("de");
    expect(certs.map((c) => [c.slug, c.date, c.file, c.verify, c.hours])).toEqual(CERTIFICATES.map((c) => [c.slug, c.date, c.file, c.verify, c.hours]));
    expect(skillsFor("de").map((g) => g.items)).toEqual(SKILLS.used.map((g) => g.items));
    expect(rolesFor("de")[0].date).toBe("Jan 2025 — heute");
  });
  it("English helpers return the source data untouched", () => {
    expect(projectsFor("en")).toBe(PROJECTS);
    expect(rolesFor("en")).toBe(ROLES);
    expect(categoriesFor("en")[0]).toEqual(["all", "All"]);
    expect(categoriesFor("de")[0]).toEqual(["all", "Alle"]);
    expect(reasonsFor("de")[0].label).toBe("einer Vollzeitstelle");
    expect(statusFor("de", "404").title).toBe("Schon wieder verlaufen?");
    expect(statusFor("en", "404").title).toBe("Got lost again?");
  });
});
