import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "~/lib/blogs";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
            {formattedDate.toLowerCase()}
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
