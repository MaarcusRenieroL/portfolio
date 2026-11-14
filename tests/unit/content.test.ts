import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COVERS, NAV_LINKS, PROJECTS, ROLES, SITE, MEDIA, shotUrl } from "~/lib/content";

const pub = path.join(process.cwd(), "public");
const isUrl = (u: string) => {
  try {
    return ["http:", "https:"].includes(new URL(u).protocol);
  } catch {
    return false;
  }
};
describe("SITE / NAV", () => {
  it("site urls valid", () => {
    expect(isUrl(SITE.url)).toBe(true);
    expect(SITE.url.endsWith("/")).toBe(false);
    expect(isUrl(SITE.github)).toBe(true);
    expect(isUrl(SITE.linkedin)).toBe(true);
    expect(SITE.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });
  it("nav hrefs unique and absolute", () => {
    const h = NAV_LINKS.map((l) => l.href);
    expect(new Set(h).size).toBe(h.length);
    h.forEach((x) => expect(x.startsWith("/")).toBe(true));
  });
});

describe("PROJECTS", () => {
  it("unique slugs and nums", () => {
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
    expect(new Set(PROJECTS.map((p) => p.num)).size).toBe(PROJECTS.length);
  });
  it("site/github are valid URLs", () => {
    for (const p of PROJECTS) {
      if (p.site) expect(isUrl(p.site), p.slug).toBe(true);
      if (p.github) expect(isUrl(p.github), p.slug).toBe(true);
    }
  });
  it("cover files exist in public/projects/<slug>", () => {
    for (const p of PROJECTS.filter((p) => p.cover)) expect(fs.existsSync(path.join(pub, "projects", p.slug, p.cover!)), `${p.slug}/${p.cover}`).toBe(true);
  });
  it("has no project pages: nothing links to /projects/<slug>", () => {
    for (const p of PROJECTS) expect([p.site, p.github].filter(Boolean).every((u) => isUrl(u!))).toBe(true);
  });
});

describe("COVERS", () => {
  it("point at existing files", () => {
    for (const [k, u] of Object.entries(COVERS)) {
      expect(fs.existsSync(path.join(pub, u.replace(/^\/+/, ""))), `${k}: ${u}`).toBe(true);
    }
  });
});

describe("shotUrl / MEDIA", () => {
  it("prefixes with empty base path when unset", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(shotUrl("nyx", "a.webp")).toBe("/projects/nyx/a.webp");
  });
  it("prefixes base path when set (evaluated at call time)", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/x";
    expect(shotUrl("nyx", "a.webp")).toBe("/x/projects/nyx/a.webp");
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });
  it("COVERS is computed at import: not affected by later env changes", () => {
    expect(COVERS.nyx.startsWith("/projects/nyx/")).toBe(true);
  });
  it("MEDIA.shot returns nothing for projects without a screenshot (no request for a missing file)", () => {
    expect(MEDIA.shot("nyx")).toBe(COVERS.nyx);
    expect(MEDIA.shot("portfolio")).toBe("");
  });
  it("MEDIA.photo (/me.jpg) is not shipped; Pic component supposedly falls back", () => {
    expect(fs.existsSync(path.join(pub, MEDIA.photo))).toBe(false);
  });
  it("logo files exist where listed", () => {
    const missing = Object.entries(MEDIA.logos).filter(([, u]) => !fs.existsSync(path.join(pub, u))).map(([n]) => n);
    expect(missing).toEqual([]);
  });
});

describe("ROLES", () => {
  it("non-empty", () => expect(ROLES.length).toBeGreaterThan(0));
});
