import type { MetadataRoute } from "next";
import { SITE } from "~/lib/content";
import { getPostList } from "~/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const pages: [string, number][] = [["", 1], ["/projects", 0.9], ["/experience", 0.8], ["/certifications", 0.6], ["/changelog", 0.3], ["/skills", 0.7], ["/about", 0.7], ["/contact", 0.6], ["/resume", 0.8]];
  const posts = await getPostList("post", "en");
  const notes = await getPostList("note", "en");
  if (posts.length) pages.push(["/blog", 0.5]);
  if (notes.length) pages.push(["/notes", 0.4]);
  return [
    ...pages.map(([p, priority]) => ({ url: `${base}${p}`, priority })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, ...(p.date ? { lastModified: new Date(p.date) } : {}), priority: 0.5 })),
    ...notes.map((p) => ({ url: `${base}/notes/${p.slug}`, ...(p.date ? { lastModified: new Date(p.date) } : {}), priority: 0.4 })),
  ];
}
