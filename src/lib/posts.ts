import { getPost as getFilePost, getPosts as getFilePosts, type Post, type PostMeta } from "./data/blog";
import type { Lang } from "./i18n";
import { postSchema } from "./schema";
import { contentRows } from "./site-content";

/**
 * Blog posts and notes. Posts come from Markdown files in src/content/blog and from the CMS; a CMS post with
 * the same slug replaces the file, and a removed one hides it. Notes only live in the CMS.
 */
export type ArticleKind = "post" | "note";

const minutes = (body: string) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
const readTime = (n: number, lang: Lang) => (lang === "de" ? `${n} Min. Lesezeit` : `${n} min read`);

async function fromDb(kind: ArticleKind, lang: Lang): Promise<Map<string, Post | null>> {
  const out = new Map<string, Post | null>();
  const all = await contentRows();
  if (!all) return out;
  for (const r of all) {
    if (r.kind !== kind) continue;
    if (r.deleted) {
      out.set(String(r.key), null);
      continue;
    }
    const p = postSchema.safeParse(r.data);
    if (!p.success) {
      console.error(`[content] skipping invalid ${kind} "${r.key}"`);
      continue;
    }
    const de = lang === "de" && r.de ? (r.de as Partial<{ title: string; description: string; body: string }>) : {};
    const body = de.body ?? p.data.body;
    out.set(p.data.slug, {
      slug: p.data.slug,
      title: de.title ?? p.data.title,
      description: de.description ?? p.data.description,
      date: p.data.date,
      tags: p.data.tags,
      featured: p.data.featured === true,
      readingTime: readTime(minutes(body), lang),
      content: body,
    });
  }
  return out;
}

async function all(kind: ArticleKind, lang: Lang): Promise<Post[]> {
  const map = new Map<string, Post | null>();
  if (kind === "post") {
    for (const m of getFilePosts()) {
      const full = getFilePost(m.slug);
      if (full) map.set(m.slug, { ...full, readingTime: readTime(Number(/^\d+/.exec(full.readingTime)?.[0] ?? 1), lang) });
    }
  }
  for (const [slug, post] of await fromDb(kind, lang)) map.set(slug, post);
  return [...map.values()].filter((p): p is Post => p !== null).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostList(kind: ArticleKind, lang: Lang): Promise<PostMeta[]> {
  return (await all(kind, lang)).map(({ content: _c, ...meta }) => {
    void _c;
    return meta;
  });
}

export async function getPostBySlug(kind: ArticleKind, slug: string, lang: Lang): Promise<Post | null> {
  return (await all(kind, lang)).find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(kind: ArticleKind, slug: string, lang: Lang, limit = 3): Promise<PostMeta[]> {
  const list = await getPostList(kind, lang);
  const me = list.find((p) => p.slug === slug);
  if (!me) return [];
  return list
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => me.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
