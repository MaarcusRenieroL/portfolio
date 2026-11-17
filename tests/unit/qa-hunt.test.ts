import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import { SPECS } from "~/lib/cms-fields";
import { certificateSchema, educationSchema, postSchema, projectSchema, roleSchema, skillGroupSchema } from "~/lib/schema";
import { breadcrumbs, siteGraph } from "~/lib/structured-data";
import { proxy } from "../../src/proxy";

const SCHEMAS = { project: projectSchema, role: roleSchema, education: educationSchema, skillgroup: skillGroupSchema, certificate: certificateSchema, post: postSchema, note: postSchema } as const;

describe("CMS field specs vs zod schemas", () => {
  for (const [kind, schema] of Object.entries(SCHEMAS)) {
    const shape = (schema as unknown as z.ZodObject).shape as Record<string, z.ZodType>;
    const fields = SPECS[kind as keyof typeof SPECS].fields;
    it(`${kind}: every form field exists in the schema`, () => {
      expect(fields.map((f) => f.name).filter((n) => !(n in shape))).toEqual([]);
    });
    it(`${kind}: every required schema key has a form field (or a server default)`, () => {
      const defaults: Record<string, string[]> = { project: ["featured"], role: ["points", "tags"], post: ["tags"], note: ["tags"] };
      const required = Object.entries(shape).filter(([, s]) => !s.safeParse(undefined).success).map(([k]) => k);
      const names = new Set(fields.map((f) => f.name));
      expect(required.filter((k) => !names.has(k))).toEqual([]);
      expect(defaults[kind] ?? []).toBeDefined();
    });
    it(`${kind}: keyField and titleField are real fields`, () => {
      const spec = SPECS[kind as keyof typeof SPECS];
      expect(fields.map((f) => f.name)).toContain(spec.keyField);
      expect(fields.map((f) => f.name)).toContain(spec.titleField);
    });
  }
  it("post and note forms can set `featured`, which postSchema supports", () => {
    // Characterization: the schema has it, the form does not.
    expect(SPECS.post.fields.some((f) => f.name === "featured")).toBe(true);
    expect(SPECS.note.fields.some((f) => f.name === "featured")).toBe(true);
    expect(Object.keys(postSchema.shape)).toContain("featured");
  });
});

describe("BUG: url fields accept non-http schemes", () => {
  const base = { slug: "a", name: "A", kind: "k", status: "s", featured: true, cats: ["ai"], desc: "d", skills: ["x"] };
  it("project.site should reject javascript: URLs (rendered as <a href>)", () => {
    expect(projectSchema.safeParse({ ...base, site: "javascript:alert(1)" }).success).toBe(false);
  });
  it("certificate.verify should reject javascript: URLs", () => {
    const c = { slug: "a", title: "t", issuer: "i", date: "2020-01-01", about: "a", verify: "javascript:alert(1)" };
    expect(certificateSchema.safeParse(c).success).toBe(false);
  });
});

describe("BUG: structured data points at URLs the proxy redirects away", () => {
  it("proxy redirects /de/projects to /projects (language is a cookie, not part of the URL)", () => {
    const res = proxy(new NextRequest("https://maarcus.dev/de/projects"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://maarcus.dev/projects");
  });
  it("German breadcrumb items should be canonical (non-redirecting) URLs", () => {
    const items = breadcrumbs("de", [["Projekte", "/projects"]]).itemListElement;
    for (const i of items) expect(i.item).not.toContain("/de");
  });
  it("German ProfilePage url/@id should be canonical", () => {
    const g = siteGraph({ lang: "de", roles: [], education: [], skills: [] })["@graph"];
    const page = g.find((n) => n["@type"] === "ProfilePage") as { url: string };
    expect(page.url).not.toContain("/de");
  });
});

describe("proxy", () => {
  it("does not rewrite /media files, api, well-known", () => {
    for (const p of ["/media/a.png", "/api/presence", "/.well-known/security.txt", "/admin/login"]) {
      const res = proxy(new NextRequest("https://maarcus.dev" + p));
      expect(res.headers.get("x-middleware-rewrite"), p).toBeNull();
    }
  });
  it("/media/<extensionless> is served by the route (upload allows names without an extension)", () => {
    const res = proxy(new NextRequest("https://maarcus.dev/media/noext"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
  });
  it("serves the language by cookie", () => {
    const res = proxy(new NextRequest("https://maarcus.dev/about", { headers: { cookie: "lang=de" } }));
    expect(res.headers.get("x-middleware-rewrite")).toContain("/de/about");
    const bad = proxy(new NextRequest("https://maarcus.dev/about", { headers: { cookie: "lang=fr" } }));
    expect(bad.headers.get("x-middleware-rewrite")).toContain("/en/about");
  });
});

import { isSkillMatch } from "~/lib/skill-match";
import { DICT } from "~/lib/dict";

describe("BUG: skill normalisation strips digits glued to a name", () => {
  it("Web3 / S3 / EC2 / Auth0 are not the same skill as Web / S / EC / Auth", () => {
    expect(isSkillMatch("Web3", "Web")).toBe(false);
    expect(isSkillMatch("S3", "S")).toBe(false);
  });
});

describe("dictionary parity", () => {
  const walk = (a: unknown, b: unknown, path: string, out: string[]) => {
    if (typeof a !== typeof b) return out.push(`${path}: type ${typeof a} vs ${typeof b}`);
    if (a && typeof a === "object") {
      const ka = Object.keys(a as object), kb = Object.keys(b as object);
      for (const k of new Set([...ka, ...kb])) {
        if (!(k in (a as object)) || !(k in (b as object))) out.push(`${path}.${k}: missing in ${k in (a as object) ? "de" : "en"}`);
        else walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, out);
      }
    }
  };
  it("en and de have identical keys", () => {
    const out: string[] = [];
    walk(DICT.en, DICT.de, "", out);
    // contact.errors is a lookup keyed by the English message, so only de has entries.
    expect(out.filter((l) => !l.startsWith(".contact.errors.") && !l.startsWith(".booking.errors."))).toEqual([]);
  });
  it("de strings are not just copies of en (untranslated), outside a small allow-list", () => {
    const same: string[] = [];
    const walk2 = (a: unknown, b: unknown, p: string) => {
      if (typeof a === "string" && typeof b === "string" && a === b && a.length > 25) same.push(p);
      else if (a && typeof a === "object") for (const k of Object.keys(a)) walk2((a as never)[k], (b as never)?.[k], `${p}.${k}`);
    };
    walk2(DICT.en, DICT.de, "");
    expect(same).toEqual([]);
  });
});
