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
};

export const BlogClient = ({ posts: allPosts }: { posts: Post[] }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const posts = useMemo(() => {
    return allPosts.filter((p) => p.title.includes(query));
  }, [query, allPosts]);

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
  }, [query]);

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
                <div className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:gap-6">
                  <span className="text-sm text-muted-foreground sm:w-28">
                    {date}
                  </span>

                  <p className="text-primary">{post.title}</p>
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
