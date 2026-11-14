import type { MetadataRoute } from "next";
import { CASE_STUDIES, SITE } from "~/lib/content";
import { getPosts } from "~/lib/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const pages: [string, number][] = [["", 1], ["/projects", 0.9], ["/experience", 0.8], ["/stack", 0.6], ["/about", 0.7], ["/contact", 0.6], ["/resume", 0.8]];
  const posts = getPosts();
  if (posts.length) pages.push(["/blog", 0.5]);
  return [
    ...pages.map(([p, priority]) => ({ url: `${base}${p}`, priority })),
    ...Object.keys(CASE_STUDIES).map((s) => ({ url: `${base}/projects/${s}`, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, ...(p.date ? { lastModified: new Date(p.date) } : {}), priority: 0.5 })),
  ];
}
