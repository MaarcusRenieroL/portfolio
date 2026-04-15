"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "../ui/input";

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
    return allPosts.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allPosts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
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
    <section className="flex flex-col gap-8">

      <h1 className="text-3xl font-semibold">blog</h1>

      <p className="text-sm text-muted-foreground">
        press / to search · enter to open
      </p>

      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search posts..."
        className="border-b bg-transparent outline-none text-sm py-1"
      />

      <div className="flex flex-col">
        {posts.map((post, index) => {
          const isActive = index === selected;

          const date = new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Link key={post.slug} href={`/blogs/${post.slug}`}>
              <div
                ref={(el) => {
                  refs.current[index] = el;
                }}
                className={`w-full cursor-pointer ${isActive ? "bg-muted/50" : "hover:bg-muted/40"
                  }`}
              >
                <div className="flex items-center gap-6 p-3">

                  <span className="text-sm text-muted-foreground">
                    {date.toLowerCase()}
                  </span>

                  <p className="text-green-500">
                    {post.title}
                  </p>

                </div>
              </div>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            no results found
          </p>
        )}
      </div>

    </section>
  );
}
