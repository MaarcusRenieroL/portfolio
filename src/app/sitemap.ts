import type { MetadataRoute } from "next";
import { CASE_STUDIES, SITE } from "~/lib/content";
import { getPosts } from "~/lib/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE.url;
  const pages: [string, number][] = [["", 1], ["/projects", 0.9], ["/experience", 0.8], ["/stack", 0.6], ["/about", 0.7], ["/contact", 0.6], ["/resume", 0.8], ["/privacy", 0.3], ["/blog", 0.5]];
  return [
    ...pages.map(([p, priority]) => ({ url: `${base}${p}`, lastModified: now, priority })),
    ...Object.keys(CASE_STUDIES).map((s) => ({ url: `${base}/projects/${s}`, lastModified: now, priority: 0.8 })),
    ...getPosts().map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.date ? new Date(p.date) : now, priority: 0.5 })),
  ];
}
