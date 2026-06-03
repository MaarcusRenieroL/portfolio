import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "content/blogs");

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt:
          data.excerpt ??
          contentPreview(fileContents.replace(/^---[\s\S]*?---/, "")),
        tags: Array.isArray(data.tags) ? data.tags : ["build log"],
        readingTime: getReadingTime(fileContents),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);

  const processed = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt:
      data.excerpt ?? contentPreview(content),
    tags: Array.isArray(data.tags) ? data.tags : ["build log"],
    readingTime: getReadingTime(content),
    contentHtml: processed.toString(),
  };
}

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function contentPreview(content: string) {
  return content
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}
