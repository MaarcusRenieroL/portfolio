import fs from "fs";
import path from "path";

import { getSafeTime } from "../utils/date";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function parseScalar(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return trimmed.replace(/^["']|["']$/g, "");
}

// minimal frontmatter parser for self-authored posts (flat key: value pairs).
function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);

  if (!match) {
    return { data: {}, content: raw };
  }

  const [, frontmatter, content] = match;
  const data: Record<string, unknown> = {};

  let listKey: string | null = null;

  for (const line of frontmatter.split("\n")) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      (data[listKey] as string[]).push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    if (!key) continue;

    const rest = line.slice(separator + 1);
    if (rest.trim() === "") {
      listKey = key;
      data[key] = [];
      continue;
    }

    listKey = null;
    data[key] = parseScalar(rest);
  }

  return { data, content: content ?? "" };
}

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
  featured: boolean;
};

export type Post = PostMeta & { content: string };

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function readPost(slug: string): (Post & { published: boolean }) | null {
  if (!SLUG_RE.test(slug)) return null;
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = parseFrontmatter(raw);

  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    readingTime: estimateReadingTime(content),
    featured: data.featured === true,
    published: data.published !== false,
    content,
  };
}

export function getPostSlugs() {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => readPost(slug))
    .filter((post): post is Post & { published: boolean } => post?.published === true)
    .sort((a, b) => getSafeTime(b.date) - getSafeTime(a.date))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      readingTime: post.readingTime,
      featured: post.featured,
    }));
}

export function getPost(slug: string): Post | null {
  const post = readPost(slug);

  if (!post || !post.published) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    tags: post.tags,
    readingTime: post.readingTime,
    featured: post.featured,
    content: post.content,
  };
}

export type Heading = { id: string; text: string; level: 2 | 3 };

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section";

export function makeIdGenerator() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/** h2/h3 headings of a markdown body, skipping fenced code. */
export function getHeadings(content: string): Heading[] {
  const out: Heading[] = [];
  const nextId = makeIdGenerator();
  let fence = false;
  for (const line of content.split("\n")) {
    if (line.startsWith("```")) fence = !fence;
    if (fence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) out.push({ id: nextId(m[2]), text: m[2], level: m[1].length as 2 | 3 });
  }
  return out;
}

/** Other posts ranked by shared tags, newest first on ties. */
export function getRelated(slug: string, limit = 3): PostMeta[] {
  const all = getPosts();
  const me = all.find((p) => p.slug === slug);
  if (!me) return [];
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => me.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
