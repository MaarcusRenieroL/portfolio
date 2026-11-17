"use client";

import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  SearchIcon,
  ClockIcon,
  CalendarIcon,
  ArrowUpRightIcon,
  LayoutGridIcon,
  ListIcon,
  SparklesIcon,
  BookOpenIcon,
} from "~/components/site/icons";
import { useListNav } from "~/components/site/use-list-nav";
import { useDict } from "~/components/site/locale";
import type { PostMeta } from "~/lib/data/blog";
import { formatShortDate } from "~/lib/utils/date";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function BlogClient({ posts, kind = "blog" }: { posts: PostMeta[]; kind?: "blog" | "notes" }) {
  const t = useDict()[kind];
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    for (const p of posts) {
      for (const tg of p.tags) {
        counts[tg] = (counts[tg] ?? 0) + 1;
      }
    }
    return counts;
  }, [posts]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (tag === "all" || p.tags.includes(tag)) &&
        (!needle || [p.title, p.description, ...p.tags].join(" ").toLowerCase().includes(needle)),
    );
  }, [posts, q, tag]);

  const { active, setActive, search } = useListNav(rows.length, (i) => router.push(`${t.base}/${rows[i].slug}`));

  // Nothing published: no search box, toggles or "All 0" chip over an empty page.
  if (!posts.length) return <p className="muted">{t.empty}</p>;

  const isFiltered = q.trim() !== "" || tag !== "all";

  return (
    <div className="blog-section-container">
      {/* Search and Filters Toolbar */}
      <div className="blog-toolbar">
        <div className="blog-toolbar-top">
          {/* Enhanced Search Input */}
          <div className="blog-search-box">
            <SearchIcon width={15} height={15} className="blog-search-icon" aria-hidden="true" />
            <Input
              ref={search}
              type="search"
              className="blog-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              aria-label={t.searchAria}
            />
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="blog-search-clear"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                ×
              </Button>
            ) : (
              <kbd className="blog-search-kbd" aria-hidden="true">/</kbd>
            )}
          </div>

          {/* View Mode Toggle (Grid vs. List) */}
          <div className="blog-view-toggle" role="group" aria-label="Layout view">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`blog-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Card Grid view"
              aria-label="Grid view"
            >
              <LayoutGridIcon width={14} height={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`blog-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Compact Editorial List view"
              aria-label="List view"
            >
              <ListIcon width={14} height={14} />
            </Button>
          </div>
        </div>

        {/* Topic Filter Chips with Item Counts */}
        <div className="chips" role="group" aria-label={t.filterAria}>
          {["all", ...tags].map((tg) => (
            <Button
              key={tg}
              type="button"
              variant="chip"
              className={tag === tg ? "active" : ""}
              aria-pressed={tag === tg}
              onClick={() => setTag(tg)}
            >
              <span>{tg === "all" ? t.all : tg}</span>
              <span className="chip-n">{tagCounts[tg] ?? 0}</span>
            </Button>
          ))}
          {isFiltered && (
            <Button
              type="button"
              variant="chip"
              className="blog-clear-chip"
              onClick={() => {
                setQ("");
                setTag("all");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: Grid Cards */}
      {viewMode === "grid" && rows.length > 0 && (
        <ul className="blog-grid" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {rows.map((p, i) => (
              <m.li
                key={p.slug}
                layout="position"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.03 }}
                data-row={i}
                data-active={active === i ? "" : undefined}
                onMouseEnter={() => setActive(i)}
                className="blog-card-item"
              >
                <Link className="blog-card" href={`${t.base}/${p.slug}`}>
                  <div className="blog-card-meta">
                    <span className="blog-card-date">
                      <CalendarIcon width={12} height={12} className="blog-card-icon" />
                      {formatShortDate(p.date)}
                    </span>
                    <span className="blog-card-dot">·</span>
                    <span className="blog-card-time">
                      <ClockIcon width={12} height={12} className="blog-card-icon" />
                      {p.readingTime}
                    </span>
                    {p.featured && (
                      <span className="blog-featured-badge">
                        <SparklesIcon width={11} height={11} />
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="blog-card-title">
                    <span>{p.title}</span>
                    <ArrowUpRightIcon width={14} height={14} className="blog-card-arrow" />
                  </h2>

                  {p.description && <p className="blog-card-desc">{p.description}</p>}

                  {p.tags.length > 0 && (
                    <div className="blog-card-tags">
                      {p.tags.map((tg) => (
                        <span key={tg} className="blog-tag-pill">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* VIEW MODE 2: Editorial List */}
      {viewMode === "list" && rows.length > 0 && (
        <ul className="rows" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {rows.map((p, i) => (
              <m.li
                key={p.slug}
                layout="position"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.03 }}
                data-row={i}
                data-active={active === i ? "" : undefined}
                onMouseEnter={() => setActive(i)}
              >
                <Link className="leader" href={`${t.base}/${p.slug}`}>
                  <span className="name">{p.title}</span>
                  <span className="when">
                    {formatShortDate(p.date)} · {p.readingTime}
                  </span>
                  <span className="desc">{p.description}</span>
                  <span className="tags" style={{ gridColumn: "1 / -1" }}>
                    {p.tags.map((tg) => (
                      <span key={tg}>#{tg}</span>
                    ))}
                  </span>
                </Link>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Crafted Empty State */}
      {rows.length === 0 && (
        <div className="blog-empty-box" role="status">
          <div className="blog-empty-icon-wrapper">
            <BookOpenIcon width={28} height={28} className="blog-empty-svg" />
          </div>
          <h3 className="blog-empty-headline">
            {isFiltered ? "No articles match that filter" : "No articles published yet"}
          </h3>
          <p className="muted blog-empty-text">{t.none}</p>
          {isFiltered && (
            <Button
              type="button"
              variant="outline"
              className="blog-empty-reset-btn"
              onClick={() => {
                setQ("");
                setTag("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Monospace Keyboard Command Bar */}
      <footer className="blog-command-bar">
        <span className="blog-command-hint">
          <kbd>j</kbd> <kbd>k</kbd> move
        </span>
        <span className="blog-command-sep">·</span>
        <span className="blog-command-hint">
          <kbd>gg</kbd> <kbd>G</kbd> jump
        </span>
        <span className="blog-command-sep">·</span>
        <span className="blog-command-hint">
          <kbd>Enter</kbd> open
        </span>
        <span className="blog-command-sep">·</span>
        <span className="blog-command-hint">
          <kbd>/</kbd> search
        </span>
      </footer>
    </div>
  );
}
