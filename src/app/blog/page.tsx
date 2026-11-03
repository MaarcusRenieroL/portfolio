import type { Metadata } from "next";
import { PostSearch } from "~/components/site/blog-client";
import { PageHeader } from "~/components/site/ui";
import { getPosts } from "~/lib/data/blog";
import { formatLongDate } from "~/lib/utils/date";

export const metadata: Metadata = { title: "Blog", description: "What I learn while building: backend, systems, and the road to security and cloud." };

export default function BlogPage() {
  const posts = getPosts().map((p) => ({ slug: p.slug, title: p.title, description: p.description, date: formatLongDate(p.date), tag: p.tags[0] ?? "" }));
  return (
    <>
      <PageHeader kanji="記" eyebrow="Blog · building in public" title="Notes from the forge" lead="What I learn while building — backend, systems, and the road to security and cloud." />
      <section className="wrap" style={{ paddingBottom: 112 }}>
        <PostSearch posts={posts} />
      </section>
    </>
  );
}
