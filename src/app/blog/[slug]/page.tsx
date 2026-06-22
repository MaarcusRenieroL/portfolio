import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { getPost, getPostSlugs } from "~/lib/data/blog";
import { formatLongDate } from "~/lib/utils/date";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  const ogImage = `/og?title=${encodeURIComponent(
    post.title,
  )}&subtitle=${encodeURIComponent(post.description)}`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://maarcus.dev/blog/${post.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return notFound();
  }

  return (
    <article className="flex w-full flex-col gap-8">
      <Link
        href="/blog"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" />
        back to blog
      </Link>

      <header className="flex flex-col gap-3 border-l border-primary/50 pl-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{formatLongDate(post.date)}</span>
          <span className="h-px w-6 bg-border" aria-hidden="true" />
          <span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border/50 bg-background/45 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-zinc max-w-none text-foreground/90 dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
