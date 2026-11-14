import { CATEGORIES, CERTIFICATES, EDUCATION, PROJECTS, REASONS, ROLES, SKILLS } from "./content";
import { CERTS_DE, EDUCATION_DE, PROJECTS_DE, ROLES_DE, SKILL_GROUPS_DE } from "./content-de";
import { DICT } from "./dict";
import type { Lang } from "./i18n";
import { MAINTENANCE, NOT_FOUND, NOT_FOUND_DE, SERVER_ERROR, SERVER_ERROR_DE } from "./status";

/** Content in the requested language. English returns the source data untouched. */

export const projectsFor = (lang: Lang) => (lang === "en" ? PROJECTS : PROJECTS.map((p) => ({ ...p, ...PROJECTS_DE[p.slug] })));

export const rolesFor = (lang: Lang) =>
  lang === "en"
    ? ROLES
    : ROLES.map((r) => {
        const t = ROLES_DE[r.org];
        if (!t) return r;
        return {
          ...r,
          date: t.date ?? r.date,
          title: t.title,
          summary: t.summary,
          points: t.points,
          path: r.path?.map((step, i) => ({ ...step, note: t.path?.[i] ?? step.note })),
        };
      });

export const educationFor = (lang: Lang) => (lang === "en" ? EDUCATION : EDUCATION.map((e) => ({ ...e, ...EDUCATION_DE[e.school] })));

export const skillsFor = (lang: Lang) => (lang === "en" ? SKILLS.used : SKILLS.used.map((g) => ({ ...g, name: SKILL_GROUPS_DE[g.name] ?? g.name })));

export const certificatesFor = (lang: Lang) => (lang === "en" ? CERTIFICATES : CERTIFICATES.map((c) => ({ ...c, ...CERTS_DE[c.slug] })));

export const reasonsFor = (lang: Lang) => REASONS.map((r) => ({ id: r.id, label: DICT[lang].contact.reasons[r.id] ?? r.label, placeholder: DICT[lang].contact.placeholders[r.id] ?? r.placeholder }));

export const categoriesFor = (lang: Lang) => CATEGORIES.map(([id, label]) => [id, DICT[lang].projects.cats[id] ?? label] as [string, string]);

export const statusFor = (lang: Lang, kind: "404" | "500" | "503") => {
  if (kind === "503") return MAINTENANCE;
  if (kind === "404") return lang === "de" ? NOT_FOUND_DE : NOT_FOUND;
  return lang === "de" ? SERVER_ERROR_DE : SERVER_ERROR;
};
