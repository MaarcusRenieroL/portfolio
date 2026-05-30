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
    description: `read ${post.title} by maarcus reniero l.`,
  };
}

export default async function BlogPost({
  params,
}: BlogPostProps) {
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

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{post.title}</h1>

          <p className="text-sm text-muted-foreground">
            {formattedDate}
          </p>
        </div>

        <div className="w-full h-px bg-border" />

        <div
          className="text-sm leading-relaxed text-foreground space-y-4"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
    </article>
  );
}
