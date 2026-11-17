import type { Metadata } from "next";
import { DICT } from "./dict";
import type { Lang } from "./i18n";

/** Share-card text per page. A fixed list, so /og can't be used to print arbitrary text on this domain. */
export const OG_PAGES = {
  projects: { title: "Projects", subtitle: "nyx, next-kit, dotfiles and this site." },
  experience: { title: "Experience", subtitle: "From networking to Next.js to healthcare backends in Java." },
  certifications: { title: "Certifications", subtitle: "Cloud, databases, C++ and web development." },
  skills: { title: "Skills", subtitle: "Languages, frameworks, data, cloud and tools." },
  about: { title: "About", subtitle: "A full stack engineer who likes knowing how the whole thing works." },
  contact: { title: "Contact", subtitle: "A role, a freelance project, or something you're building." },
  resume: { title: "Resume", subtitle: "Java/Spring Boot, TypeScript/Next.js, healthcare ETL." },
  changelog: { title: "Changelog", subtitle: "What changed on this site, and when." },
  privacy: { title: "Privacy", subtitle: "What this site collects, and how to get it deleted." },
  legal: { title: "Legal", subtitle: "Copyright, takedown requests and who runs this site." },
} as const;

export type OgPage = keyof typeof OG_PAGES;

/** Title, description, a per-page share image and the canonical URL. `path` is the English path, e.g. "/skills". */
export function pageMeta(key: OgPage, lang: Lang, path: string): Metadata {
  const pages = DICT[lang].meta.pages as Record<string, string[]>;
  const [title, description] = pages[key] ?? [OG_PAGES[key].title, OG_PAGES[key].subtitle];
  const url = `/og?page=${key}${lang === "de" ? "&lang=de" : ""}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, images: [{ url, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [url] },
  };
}
