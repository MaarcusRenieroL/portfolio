import { SITE } from "./content";
import { DICT } from "./dict";
import type { Lang } from "./i18n";
import type { Education, Project, Role } from "./schema";

/**
 * schema.org data for search engines. One graph: the site, the person behind it, and the
 * profile page that is about them, linked by @id so crawlers see one entity, not three.
 */

const PERSON_ID = `${SITE.url}/#person`;
const SITE_ID = `${SITE.url}/#website`;

/** Canonical URL. The site has one URL per page; the language comes from a cookie (/de/... redirects). */
const abs = (path: string, _lang?: Lang) => `${SITE.url}${path === "/" ? "" : path}`;

export function siteGraph({ lang, roles, education, skills, photo }: { lang: Lang; roles: Role[]; education: Education[]; skills: string[]; photo?: string }) {
  const current = roles.find((r) => r.now);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE.url,
        name: SITE.name,
        inLanguage: ["en", "de"],
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE.name,
        url: SITE.url,
        email: `mailto:${SITE.email}`,
        jobTitle: "Full stack engineer",
        ...(photo ? { image: `${SITE.url}${photo}` } : {}),
        address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
        sameAs: [SITE.github, SITE.linkedin],
        ...(current ? { worksFor: { "@type": "Organization", name: current.org, ...(current.url ? { url: current.url } : {}) } } : {}),
        alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.school, ...(e.url ? { url: e.url } : {}) })),
        knowsAbout: skills.slice(0, 30),
        knowsLanguage: ["en", "ta", "de"],
      },
      {
        "@type": "ProfilePage",
        "@id": `${abs("/", lang)}#profile`,
        url: abs("/", lang),
        name: DICT[lang].meta.title ?? SITE.name,
        inLanguage: lang,
        isPartOf: { "@id": SITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
    ],
  };
}

/** Home → page breadcrumbs, for search results. */
export function breadcrumbs(lang: Lang, trail: [name: string, path: string][]) {
  const all: [string, string][] = [[DICT[lang].nav.home, "/"], ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path, lang) })),
  };
}

/** The projects page as a list of software projects, each with its code and live site. */
export function projectList(lang: Lang, projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: p.name,
        description: p.desc,
        ...(p.github ? { codeRepository: p.github } : {}),
        ...(p.site ? { url: p.site } : {}),
        programmingLanguage: p.skills,
        author: { "@id": PERSON_ID },
        inLanguage: lang,
      },
    })),
  };
}
