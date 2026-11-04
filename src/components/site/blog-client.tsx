"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SearchIcon } from "~/components/site/icons";
import { useListNav } from "~/components/site/use-list-nav";
import type { PostMeta } from "~/lib/data/blog";
import { formatShortDate } from "~/lib/utils/date";

export function BlogClient({ posts }: { posts: PostMeta[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");

  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => (tag === "all" || p.tags.includes(tag)) && (!needle || [p.title, p.description, ...p.tags].join(" ").toLowerCase().includes(needle)));
  }, [posts, q, tag]);

  const { active, setActive, search } = useListNav(rows.length, (i) => router.push(`/blog/${rows[i].slug}`));

  return (
    <>
      <div className="filters">
        <label className="search">
          <SearchIcon aria-hidden="true" />
          <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts or tags" aria-label="Search posts" />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div className="chips" role="group" aria-label="Filter by tag">
          {["all", ...tags].map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      <ul className="rows" aria-live="polite">
        <AnimatePresence mode="popLayout" initial>
        {rows.map((p, i) => (
          <motion.li key={p.slug} layout="position" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.04 }} data-row={i} data-active={active === i ? "" : undefined} onMouseEnter={() => setActive(i)}>
            <Link className="leader" href={`/blog/${p.slug}`}>
              <span className="name">{p.title}</span>
              <span className="when">
                {formatShortDate(p.date)} · {p.readingTime}
              </span>
              <span className="desc">{p.description}</span>
              <span className="tags" style={{ gridColumn: "1 / -1" }}>
                {p.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </span>
            </Link>
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>
      {rows.length === 0 && <p className="muted">Nothing matches. Try another word or clear the filter.</p>}
      <p className="help kbd-help">
        <kbd>j</kbd> <kbd>k</kbd> move · <kbd>gg</kbd> <kbd>G</kbd> jump · <kbd>Enter</kbd> open · <kbd>/</kbd> search
      </p>
    </>
  );
}
