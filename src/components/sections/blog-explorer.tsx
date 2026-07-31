"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, SearchIcon } from "lucide-react";

import { Reveal } from "../misc/reveal";
import { cn } from "~/lib/utils";
import { formatLongDate } from "~/lib/utils/date";
import { PostMeta } from "~/lib/data/blog";

type BlogExplorerProps = {
  posts: PostMeta[];
};

const PAGE_SIZE = 5;

export function BlogExplorer({ posts }: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => (tag === "all" ? true : p.tags.includes(tag)))
      .filter((p) =>
        !q
          ? true
          : `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q),
      );
  }, [posts, query, tag]);

  useEffect(() => setPage(1), [query, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <div className="flex flex-col gap-3 border border-border/60 bg-card/40 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 border border-border/60 bg-background/60 px-3">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search posts…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
              {filtered.length}/{posts.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={cn(
                  "h-9 border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  t === tag
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
          nothing matches. try clearing the filters.
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-border/50 border-y border-border/50">
            {pageItems.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.05}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-3 py-6 transition-colors hover:bg-card/40 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-6 sm:px-4"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    {formatLongDate(post.date)}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {post.description}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <span key={t} className="chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    {post.readingTime}
                    <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="pager-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
              >
                <ArrowLeftIcon className="size-3.5" /> prev
              </button>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                page {current} / {totalPages}
              </span>
              <button
                type="button"
                className="pager-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
              >
                next <ArrowRightIcon className="size-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
