import { describe, expect, it } from "vitest";
import { EDUCATION, MEDIA, PROJECTS, ROLES, SKILLS } from "~/lib/content";
import { type Project, type Role, assertContent, check, projectSchema, roleSchema } from "~/lib/schema";

const project: Omit<Project, "num"> = { slug: "demo", name: "demo", kind: "Web", status: "Live", featured: false, cats: ["frontend"], desc: "A demo.", skills: ["Next.js"] };
const role: Role = { date: "2024", org: "Acme", title: "Dev", summary: "s", points: [], tags: [] };

describe("content schemas", () => {
  it("everything shipped parses (content.ts would have thrown on import otherwise)", () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
    expect(ROLES.length).toBeGreaterThan(0);
    expect(EDUCATION.length).toBeGreaterThan(0);
    expect(SKILLS.used.length).toBeGreaterThan(0);
  });

  it("project numbers come from list order", () => {
    PROJECTS.forEach((p, i) => expect(p.num).toBe(String(i + 1).padStart(2, "0")));
  });

  it("a role's logo field feeds MEDIA.logos, so adding a role needs no other edit", () => {
    for (const r of ROLES.filter((r) => r.logo)) expect(MEDIA.logos[r.org]).toMatch(new RegExp(`/logos/${r.logo}$`));
  });

  it("rejects an unknown logo tile tone", () => {
    expect(() => check("role", "Acme", roleSchema, { ...role, logoOn: "blue" })).toThrow(/logoOn/);
    expect(check("role", "Acme", roleSchema, { ...role, logoOn: "dark" }).logoOn).toBe("dark");
  });

  it("rejects a bad entry with a message naming the entry and the field", () => {
    expect(() => check("project", "demo", projectSchema, { ...project, site: "not a url" })).toThrow(/Invalid project "demo": site:/);
    expect(() => check("project", "Bad Slug", projectSchema, { ...project, slug: "Bad Slug" })).toThrow(/slug/);
    expect(() => check("project", "demo", projectSchema, { ...project, cats: [] })).toThrow(/cats/);
    expect(() => check("role", "Acme", roleSchema, { ...role, url: "nope" })).toThrow(/Invalid role "Acme": url:/);
  });

  describe("cross-entry rules", () => {
    const base = () => ({
      projects: [{ ...project, featured: true, num: "01" }],
      roles: [{ ...role, now: true }],
    });
    it("accepts a consistent set", () => expect(() => assertContent(base())).not.toThrow());
    it("duplicate slug", () => {
      const c = base();
      c.projects.push({ ...c.projects[0], num: "02" });
      expect(() => assertContent(c)).toThrow(/Duplicate project slug "demo"/);
    });
    it("needs a featured project and exactly one current role", () => {
      const a = base();
      a.projects[0].featured = false;
      expect(() => assertContent(a)).toThrow(/featured/);
      const b = base();
      b.roles[0].now = false;
      expect(() => assertContent(b)).toThrow(/Exactly one role/);
    });
  });
});
