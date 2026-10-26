import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ClockIcon, FlameIcon } from "lucide-react";
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
      {/* Back to Blog Button */}
      <Link
        href="/blog"
        className="inline-flex w-fit items-center gap-2 border border-border/60 bg-card/40 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <ArrowLeftIcon className="size-3.5" />
        <span>Return to dispatches</span>
      </Link>

      {/* Article Specimen Container */}
      <div className="relative overflow-hidden border border-border/60 bg-card/35 p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        <header className="flex flex-col gap-4 border-b border-border/40 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-primary font-bold">
              <FlameIcon className="size-3.5 text-primary" />
              <span className="uppercase tracking-wider text-[11px]">DISPATCH // {post.slug}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span>{formatLongDate(post.date)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3 text-primary/70" />
                {post.readingTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border/60 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Markdown Content */}
        <div className="prose prose-zinc sm:prose-lg max-w-none pt-8 text-foreground/90 dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 prose-code:border prose-code:border-border/60 prose-code:bg-background/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-pre:border prose-pre:border-border/60 prose-pre:bg-background/90">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
