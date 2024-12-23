import { posts } from "#site/content";
import { redirect } from "next/navigation";
import { MDXContent } from "./_components/mdx-content";

interface Props {
  slug: string[];
}

export default async function BlogContentPage({
  params,
}: {
  params: Promise<Props>;
}) {
  const { slug } = await params;

  const post = posts.find(post => post.slugAsParams === slug.join("/"));

  if (!post) {
    redirect("/blog");
  }
  return (
    <article className="container py-6 prose dark:prose-invert max-w-3xl mx-auto md:mt-20 mt-5">
      <h1 className="text-center mb-2">{post.title}</h1>
      {post.description ? (
        <p className="text-center text-xl mt-0 text-muted-foreground">
          {post.description}
        </p>
      ) : null}
      <hr className="my-4" />
      <MDXContent code={post.body} />
    </article>
  );
}
