import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "~/lib/blogs";
import { formatLongDate } from "~/lib/utils/date";

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return notFound();
  }

  const formattedDate = formatLongDate(post.date);

  return (
    <article className="w-full flex">
      <div className="w-full flex flex-col gap-8">
        <Link
          href="/blogs"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← back to blog
        </Link>

        <div className="flex flex-col gap-4 border border-border/60 bg-card/35 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>{formattedDate}</span>
            <span>/</span>
            <span>{post.readingTime} min read</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border/60 bg-background/55 px-2 py-1 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        <div
          className="space-y-4 text-sm leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:pt-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
    </article>
  );
}
