"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "../ui/input";
import { SectionHeading } from "./section-heading";
import { formatShortDate } from "~/lib/utils/date";

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: number;
};

export const BlogClient = ({ posts: allPosts }: { posts: Post[] }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [activeTag, setActiveTag] = useState("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const posts = useMemo(() => {
    const value = query.trim().toLowerCase();
    const tagFiltered =
      activeTag === "all"
        ? allPosts
        : allPosts.filter((post) => post.tags.includes(activeTag));

    if (!value) {
      return tagFiltered;
    }

    return tagFiltered.filter((post) =>
      `${post.title} ${post.excerpt} ${post.tags.join(" ")}`
        .toLowerCase()
        .includes(value),
    );
  }, [activeTag, query, allPosts]);

  const tags = useMemo(() => {
    return ["all", ...Array.from(new Set(allPosts.flatMap((post) => post.tags)))];
  }, [allPosts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((current) =>
          Math.min(current + 1, Math.max(posts.length - 1, 0)),
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }

      if (e.key === "Enter" && posts[selected]) {
        window.location.href = `/blogs/${posts[selected].slug}`;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [posts, selected]);

  useEffect(() => {
    refs.current[selected]?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  useEffect(() => {
    setSelected(0);
  }, [activeTag, query]);

  return (
    <section className="flex flex-col gap-8 w-full">
      <SectionHeading
        index="01"
        title="blogs"
        eyebrow="notes and build logs"
        description="press / to search · enter to open"
      />

      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search posts..."
        className="h-12 rounded-none border-border/70 bg-card/45 px-4 text-sm shadow-none focus-visible:ring-1"
      />

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          const count =
            tag === "all"
              ? allPosts.length
              : allPosts.filter((post) => post.tags.includes(tag)).length;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`border px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {tag}
              <span className="ml-2 text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        {posts.map((post, index) => {
          const date = formatShortDate(post.date);

          return (
            <Link key={post.slug} href={`/blogs/${post.slug}`}>
              <div
                ref={(el) => {
                  refs.current[index] = el;
                }}
                className={`w-full cursor-pointer border transition-colors duration-300 hover:border-border/70 hover:bg-card/35 ${
                  selected === index
                    ? "border-primary/45 bg-primary/10"
                    : "border-border/40 bg-card/20"
                }`}
              >
                <div className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
                  <div className="text-sm text-muted-foreground">
                    <span className="block">{date}</span>
                    <span className="mt-1 block text-xs">
                      {post.readingTime} min read
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-primary">{post.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:justify-end">
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
              </div>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">no results found</p>
        )}
      </div>
    </section>
  );
};
