"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  ClockIcon,
  FlameIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Reveal } from "../misc/reveal";
import { motion } from "motion/react";
import { cn } from "~/lib/utils";
import { formatLongDate } from "~/lib/utils/date";
import { PostMeta } from "~/lib/data/blog";
import { playBlip, playThock } from "~/lib/audio";

type BlogExplorerProps = {
  posts: PostMeta[];
};

const PAGE_SIZE = 6;

export function BlogExplorer({ posts }: BlogExplorerProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);

  const featuredPost = posts[0];

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
    <div className="flex flex-col gap-10">
      {/* Telemetry Overview Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border/60 bg-card/30 px-4 py-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <BookOpenIcon className="size-3.5 text-primary" />
            <span className="uppercase tracking-wider text-[11px]">BLOG_DISPATCHES // ARCHIVE_FEED</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-muted-foreground text-[11px]">
            {posts.length} engineering field notes & architectural dispatches
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
          <span>Interactive filter & reading metrics</span>
        </div>
      </div>

      {/* Flagship Featured Article Banner */}
      {featuredPost && !query && tag === "all" && (
        <Reveal>
          <div className="group relative overflow-hidden border border-border/70 bg-card/40 p-6 sm:p-8 transition-all hover:border-primary/60 hover:shadow-lg">
            {/* Top Subtle Line Accent */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity group-hover:via-primary"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
                <FlameIcon className="size-4 animate-pulse text-primary" />
                <span className="uppercase text-[11px]">FEATURED DISPATCH</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-xs font-mono">
                <span>{formatLongDate(featuredPost.date)}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3 text-primary/80" />
                  {featuredPost.readingTime}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group-hover:text-primary transition-colors block"
              >
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {featuredPost.title}
                </h2>
              </Link>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-3">
                {featuredPost.description}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {featuredPost.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-border/70 bg-background/70 px-2 py-0.5 font-mono text-xs text-foreground/80 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                onClick={() => playBlip()}
                className="inline-flex items-center gap-2 border border-primary/50 bg-primary px-4 py-2 font-mono text-xs font-bold text-primary-foreground shadow transition-transform hover:bg-primary/90"
              >
                <span>Read Full Article</span>
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* Filter and Search Control Center */}
      <Reveal>
        <div className="flex flex-col gap-3 border border-border/60 bg-card/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2 border border-border/60 bg-background/60 px-3 transition-colors focus-within:border-primary/60">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  playThock();
                }}
                placeholder="search articles, architecture notes, tools..."
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    playBlip();
                  }}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Reset Filter */}
            {(tag !== "all" || query) && (
              <button
                type="button"
                onClick={() => {
                  setTag("all");
                  setQuery("");
                  playBlip();
                }}
                className="flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <span>Clear Filters</span>
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {/* Category Tag Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTag(t);
                  playBlip();
                }}
                className={cn(
                  "relative h-8 border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors select-none font-medium active:scale-95",
                  t === tag
                    ? "border-primary text-primary font-bold"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {t === tag && (
                  <motion.span
                    layoutId="active-blog-tab"
                    className="absolute inset-0 bg-primary/15 shadow-[0_0_12px_rgba(74,222,128,0.2)] pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{t === "all" ? `All Topics (${posts.length})` : t}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Articles Feed */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <BookOpenIcon className="size-8 mx-auto text-primary/60" />
          <p className="mt-3 font-mono text-xs text-primary font-bold">[0 DISPATCHES FOUND]</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No entries match your search &quot;{query}&quot;. Try clearing query filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTag("all");
              playBlip();
            }}
            className="mt-4 inline-flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-4 py-1.5 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pageItems.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.05}>
              <Link
                href={`/blog/${post.slug}`}
                onMouseEnter={() => playBlip()}
                className="group relative flex h-full flex-col justify-between overflow-hidden border border-border/60 bg-card/40 p-5 sm:p-6 transition-all hover:border-border hover:shadow-lg"
              >
                {/* Top Subtle Line Accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity group-hover:via-primary"
                />

                <div>
                  {/* Top Header: Date & Reading Time */}
                  <div className="flex items-center justify-between font-mono text-xs text-muted-foreground pb-3 border-b border-border/30">
                    <span className="text-primary font-bold uppercase tracking-wider text-[11px]">
                      {formatLongDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <ClockIcon className="size-3 text-primary/70" />
                      {post.readingTime}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Tags & Arrow */}
                <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="border border-border/60 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>READ</span>
                    <ArrowUpRightIcon className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <button
            type="button"
            className="pager-btn flex items-center gap-2 border border-border/60 px-4 py-2 font-mono text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              playBlip();
            }}
            disabled={current === 1}
          >
            <ArrowLeftIcon className="size-3.5" /> Previous
          </button>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Page {current} of {totalPages}
          </span>
          <button
            type="button"
            className="pager-btn flex items-center gap-2 border border-border/60 px-4 py-2 font-mono text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              playBlip();
            }}
            disabled={current === totalPages}
          >
            Next <ArrowRightIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
