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

  for (const line of frontmatter.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    if (!key) continue;

    data[key] = parseScalar(line.slice(separator + 1));
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
};

export type Post = PostMeta & { content: string };

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function readPost(slug: string): (Post & { published: boolean }) | null {
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
    .filter((file) => file.endsWith(".md"))
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
    content: post.content,
  };
}
