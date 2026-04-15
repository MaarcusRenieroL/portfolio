import { getPost } from "~/lib/blogs";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug);

  return (
    <article className="max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4">
        {post.title}
      </h1>

      <p className="text-sm text-muted-foreground mb-6">
        {post.date}
      </p>

      <div
        className="prose prose-invert"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
