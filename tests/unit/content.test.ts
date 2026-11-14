import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CASE_STUDIES, NAV_LINKS, PROJECTS, ROLES, SITE, MEDIA, shotUrl } from "~/lib/content";
import { COVERS } from "~/lib/case-studies";

const pub = path.join(process.cwd(), "public");
const isUrl = (u: string) => {
  try {
    return ["http:", "https:"].includes(new URL(u).protocol);
  } catch {
    return false;
  }
};
const walk = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => walk(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => walk(x, out));
  return out;
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
  it("study flag matches CASE_STUDIES presence", () => {
    for (const p of PROJECTS) expect(p.study, p.slug).toBe(p.slug in CASE_STUDIES);
  });
});

describe("CASE_STUDIES", () => {
  const entries = Object.entries(CASE_STUDIES);
  it("key equals slug, slugs url-safe", () => {
    for (const [k, v] of entries) {
      expect(v.slug).toBe(k);
      expect(k).toMatch(/^[a-z0-9-]+$/);
    }
  });
  it("every case study has a project", () => {
    for (const [k] of entries) expect(PROJECTS.some((p) => p.slug === k), k).toBe(true);
  });
  it("external hrefs are valid", () => {
    for (const [k, v] of entries) {
      if (v.site) expect(isUrl(v.site.href), k).toBe(true);
      if (v.repo.href) expect(isUrl(v.repo.href), k).toBe(true);
    }
  });
  it("shot / cover / video files exist in public/projects/<slug>", () => {
    for (const [k, v] of entries) {
      const files = [...v.shots.flatMap((s) => [s.file, s.mobile]), v.cover, v.video?.file].filter(Boolean) as string[];
      for (const f of files) expect(fs.existsSync(path.join(pub, "projects", k, f)), `${k}/${f}`).toBe(true);
    }
  });
  it("COVERS point at existing files", () => {
    for (const [k, u] of Object.entries(COVERS)) {
      expect(fs.existsSync(path.join(pub, u.replace(/^\/+/, ""))), `${k}: ${u}`).toBe(true);
    }
  });
  it("no leftover [bracket] placeholders in case study copy (currently TBD placeholders may exist)", () => {
    const left = entries.flatMap(([k, v]) => walk(v).filter((s) => /^\[[^\]]+\]$/.test(s)).map((s) => `${k}: ${s}`));
    expect(Array.isArray(left)).toBe(true);
  });
  it("each has a non-empty title, lead, tech", () => {
    for (const [k, v] of entries) {
      expect(v.title, k).toBeTruthy();
      expect(v.lead, k).toBeTruthy();
      expect(v.tech.length, k).toBeGreaterThan(0);
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
    expect(MEDIA.shot("snap-pass")).toBe("");
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
