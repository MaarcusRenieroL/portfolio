import { SITE } from "~/lib/content";
import { getPosts } from "~/lib/data/blog";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0. Valid (and empty) until the first post is published. */
export function GET() {
  const posts = getPosts();
  const items = posts
    .map((p) => {
      const url = `${SITE.url}/blog/${p.slug}`;
      const date = p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : "";
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid>${date}<description>${esc(p.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE.name)}</title><link>${SITE.url}</link><description>Writing by ${esc(SITE.name)}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
