import { jsonLdString } from "~/lib/utils";

/** schema.org data rendered into the HTML, so crawlers read it without running JavaScript. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}

const CRUMB_PATHS = {
  projects: "/projects",
  experience: "/experience",
  skills: "/skills",
  certifications: "/certifications",
  about: "/about",
  contact: "/contact",
  resume: "/resume",
  privacy: "/privacy",
  legal: "/legal",
} as const;

/** Home → this page, as BreadcrumbList data. */
export async function Crumb({ params, k }: { params: Promise<{ lang: string }>; k: keyof typeof CRUMB_PATHS }) {
  const { langOf } = await import("~/lib/lang");
  const { DICT } = await import("~/lib/dict");
  const { breadcrumbs } = await import("~/lib/structured-data");
  const lang = await langOf(params);
  const name = (DICT[lang].meta.pages as Record<string, string[]>)[k]?.[0] ?? k;
  return <JsonLd data={breadcrumbs(lang, [[name, CRUMB_PATHS[k]]])} />;
}
