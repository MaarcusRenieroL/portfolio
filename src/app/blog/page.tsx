import { SectionHeading } from "~/components/misc/section-heading";
import { BlogExplorer } from "~/components/sections/blog-explorer";
import { getPosts } from "~/lib/data/blog";

export const metadata = {
  title: "blog",
  description:
    "writing about building things — developer tools, the web, and lessons from actually shipping.",
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="05"
        title="blog"
        eyebrow="notes and write-ups"
        description="writing about building things — developer tools, the web, and lessons from actually shipping."
      />

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">no posts yet.</p>
      ) : (
        <BlogExplorer posts={posts} />
      )}
    </section>
  );
}
