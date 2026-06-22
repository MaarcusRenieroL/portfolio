import Link from "next/link";

import { SectionHeading } from "~/components/misc/section-heading";
import { getPosts } from "~/lib/data/blog";
import { formatLongDate } from "~/lib/utils/date";

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
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group border border-border/60 bg-card/35 p-5 transition-colors hover:border-primary/45"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{formatLongDate(post.date)}</span>
                <span className="h-px w-6 bg-border" aria-hidden="true" />
                <span>{post.readingTime}</span>
              </div>

              <h2 className="mt-2 text-xl font-semibold transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {post.description}
              </p>

              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
