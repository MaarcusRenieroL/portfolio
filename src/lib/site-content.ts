import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { z } from "zod";
import { CERTIFICATES, EDUCATION, PROJECTS, ROLES, SKILLS } from "./content";
import { certificateSchema, educationSchema, projectSchema, roleSchema, skillGroupSchema, type Certificate, type Education, type Project, type Role } from "./schema";
import { certificatesFor, educationFor, projectsFor, rolesFor, skillsFor } from "./localize";
import type { Lang } from "./i18n";
import { hasDb } from "./server/db";
import { toPublicAssets } from "./server/r2";
import { r2Names } from "./server/r2-names";
import { readAll } from "./server/store";

/**
 * What the site shows. The database (edited in the CMS) is the source of truth; `content.ts` is the
 * seed and the fallback. If the database is down, unconfigured, or a kind has never been seeded, the site
 * serves the files, so a database problem can never take the portfolio down. A row that fails validation
 * is skipped and logged rather than breaking a page.
 */

export type SkillGroup = { name: string; items: string[] };
export type SiteContent = { projects: Project[]; roles: Role[]; education: Education[]; skills: SkillGroup[]; certificates: Certificate[] };


type Rows = Awaited<ReturnType<typeof readAll>>;

// Live content points library files at the public assets domain (when R2 is set up); drafts keep /media/.
const published = unstable_cache(async () => toPublicAssets(await readAll("published"), await r2Names()), ["site-content-published", process.env.NEXT_PUBLIC_ASSETS_URL ?? ""], { tags: ["content"], revalidate: 3600 });

export async function contentRows(): Promise<Rows | null> {
  if (!hasDb()) return null;
  try {
    let draft = false;
    try {
      draft = (await draftMode()).isEnabled;
    } catch {
      // draftMode() is unavailable outside a request (build-time callers); published content is right then.
    }
    return draft ? await readAll("draft") : await published();
  } catch (e) {
    console.error("[content] database unavailable, serving files:", e instanceof Error ? e.message : e);
    return null;
  }
}

function parse<S extends z.ZodType>(kind: string, schema: S, all: Rows) {
  const mine = all.filter((r) => r.kind === kind);
  if (mine.length === 0) return null; // never seeded: use the files
  const out: { data: z.output<S>; de: Record<string, unknown> | null }[] = [];
  for (const r of mine) {
    if (r.deleted) continue;
    const p = schema.safeParse(r.data);
    if (!p.success) {
      console.error(`[content] skipping invalid ${kind} "${r.key}":`, p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      continue;
    }
    out.push({ data: p.data, de: r.de });
  }
  return out;
}

const overlay = <T extends object>(data: T, de: Record<string, unknown> | null, lang: Lang): T => (lang === "de" && de ? ({ ...data, ...de } as T) : data);

export async function getSiteContent(lang: Lang): Promise<SiteContent> {
  const all = await contentRows();
  const fallback = (): SiteContent => ({ projects: projectsFor(lang), roles: rolesFor(lang), education: educationFor(lang), skills: skillsFor(lang), certificates: certificatesFor(lang) });
  if (!all) return fallback();
  const f = fallback();

  const projects = parse("project", projectSchema, all);
  const roles = parse("role", roleSchema, all);
  const education = parse("education", educationSchema, all);
  const skills = parse("skillgroup", skillGroupSchema, all);
  const certs = parse("certificate", certificateSchema, all);

  return {
    projects: projects
      ? projects
          .map((p) => overlay(p.data, p.de, lang))
          .filter((p) => !p.hidden)
          .map((p, i) => ({ ...p, num: String(i + 1).padStart(2, "0") }))
      : f.projects,
    roles: roles
      ? roles.map((r) => {
          const de = lang === "de" ? r.de : null;
          if (!de) return r.data;
          const { path: notes, place: _place, ...rest } = de as { path?: unknown; place?: unknown } & Record<string, unknown>;
          void _place;
          const list = Array.isArray(notes) ? (notes as string[]) : [];
          return { ...r.data, ...rest, path: r.data.path?.map((step, i) => ({ ...step, note: list[i] ?? step.note })) } as Role;
        })
      : f.roles,
    education: education ? education.map((e) => overlay(e.data, e.de, lang)) : f.education,
    skills: skills ? skills.map((g) => overlay(g.data, g.de, lang)) : f.skills,
    certificates: certs ? certs.map((c) => overlay(c.data, c.de, lang)).sort((a, b) => b.date.localeCompare(a.date)) : f.certificates,
  };
}

/** Used by the seed: the static data as rows. */
export function staticSeed() {
  return { PROJECTS, ROLES, EDUCATION, SKILLS, CERTIFICATES };
}

export type SearchData = Record<Lang, { projects: { name: string; kind: string; href: string }[]; certs: { title: string; issuer: string }[] }>;

/** Names only, for the 404 page's search. Both languages, since that page does not know the language on the server. */
export async function getSearchData(): Promise<SearchData> {
  const one = async (lang: Lang) => {
    const c = await getSiteContent(lang);
    return {
      projects: c.projects.filter((p) => p.site ?? p.github).map((p) => ({ name: p.name, kind: p.kind, href: (p.site ?? p.github)! })),
      certs: c.certificates.map((x) => ({ title: x.title, issuer: x.issuer })),
    };
  };
  return { en: await one("en"), de: await one("de") };
}
