"use client";

import { ArrowDown, ArrowUp, ChevronRight, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createElement, useMemo, useState } from "react";
import type { Row } from "~/lib/server/store";
import { moveItem } from "../actions";
import { kindIcon } from "./admin-ui";
import { ListTools } from "./row-controls";
import { SkillRowChips } from "./skills-manager";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

type Status = "live" | "changed" | "draft" | "removed";

function statusOf(r: Row): Status {
  if (r.deleted) return "removed";
  if (!r.published) return "draft";
  if (!same(r.draft, r.published) || !same(r.draft_de, r.published_de)) return "changed";
  return "live";
}

const STATUS: Record<Status, { label: string; dot: string; text: string }> = {
  live: { label: "Live", dot: "bg-[var(--green)]", text: "text-[var(--fg-2)]" },
  changed: { label: "Unpublished changes", dot: "bg-[var(--green)] ring-2 ring-[var(--green-wash)]", text: "text-[var(--green)]" },
  draft: { label: "Draft", dot: "border border-[var(--fg-3)]", text: "text-[var(--fg-3)]" },
  removed: { label: "Removed", dot: "bg-[var(--danger)]", text: "text-[var(--danger)]" },
};

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" });
}

function German({ r }: { r: Row }) {
  const has = r.draft_de && Object.keys(r.draft_de).length > 0;
  if (!has) return <span className="text-[var(--fg-3)]">EN only</span>;
  return r.de_machine ? (
    <span className="text-[var(--fg-2)]" title="Machine-translated German, not reviewed yet">
      DE · machine
    </span>
  ) : (
    <span className="text-[var(--fg-2)]" title="German reviewed">
      DE
    </span>
  );
}

function Reorder({ kind, k, first, last }: { kind: string; k: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async (dir: -1 | 1) => {
    setBusy(true);
    await moveItem(kind, k, dir);
    setBusy(false);
    router.refresh();
  };
  const btn =
    "flex h-7 w-7 items-center justify-center rounded-md text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] disabled:pointer-events-none disabled:opacity-30 pointer-coarse:h-9 pointer-coarse:w-9";
  return (
    <span className="flex items-center">
      {busy ? (
        <Loader2 className="mx-2 h-3.5 w-3.5 animate-spin text-[var(--fg-3)]" />
      ) : (
        <>
          <button type="button" className={btn} aria-label="Move up" disabled={first} onClick={() => void go(-1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={btn} aria-label="Move down" disabled={last} onClick={() => void go(1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </span>
  );
}

/**
 * One collection: search, a status filter, and a row per item with its live state, German
 * state, last edit and order. Order is the order on the site, so reordering is only offered
 * while the list isn't filtered.
 */
export function CmsTable({
  kind,
  titleField,
  label,
  rows,
  pending,
}: {
  kind: string;
  titleField: string;
  label: string;
  plural: string;
  rows: Row[];
  pending: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "pending" | "removed">("all");

  const counts = useMemo(() => {
    const c = { all: 0, live: 0, pending: 0, removed: 0 };
    for (const r of rows) {
      const s = statusOf(r);
      if (s === "removed") c.removed++;
      else {
        c.all++;
        if (s === "live") c.live++;
        else c.pending++;
      }
    }
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const s = statusOf(r);
      if (filter === "removed" ? s !== "removed" : s === "removed") return false;
      if (filter === "live" && s !== "live") return false;
      if (filter === "pending" && s !== "draft" && s !== "changed") return false;
      if (!q) return true;
      return String(r.draft[titleField] ?? r.key).toLowerCase().includes(q) || r.key.toLowerCase().includes(q);
    });
  }, [rows, titleField, search, filter]);

  const canReorder = filter === "all" && !search.trim();
  const ordered = rows.filter((r) => !r.deleted);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line-2)] px-6 py-12 text-center">
        {createElement(kindIcon(kind), { className: "mx-auto h-6 w-6 text-[var(--fg-3)]", "aria-hidden": true })}
        <p className="mt-3 text-sm text-[var(--fg)]">No {label.toLowerCase()} yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-[var(--fg-3)]">
          Import what the site shows today to start editing it here, or create the first one from scratch.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <ListTools kind={kind} empty pending={false} />
          <Link
            href={`/admin/content/${kind}/new`}
            className="inline-flex h-8 items-center rounded-md border border-[var(--line)] px-3 text-[13px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] pointer-coarse:h-10"
          >
            Start from scratch
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    ["all", "All", counts.all],
    ["live", "Live", counts.live],
    ["pending", "Unpublished", counts.pending],
    ["removed", "Removed", counts.removed],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-3)]" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}s`}
            aria-label={`Search ${label.toLowerCase()}s`}
            className="h-8 rounded-md !pl-8 !pr-8 text-[13px] pointer-coarse:h-10"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[var(--fg-3)] hover:text-[var(--fg)]" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by status">
          {tabs
            .filter(([id, , n]) => id === "all" || n > 0)
            .map(([id, name, n]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] transition-colors pointer-coarse:h-10 ${
                  filter === id ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                }`}
              >
                {name}
                <span className="font-mono text-[11px] tabular-nums text-[var(--fg-3)]">{n}</span>
              </button>
            ))}
        </div>
        <div className="sm:ml-auto">
          <ListTools kind={kind} empty={false} pending={pending} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--line)]">
        {/* Column labels, desktop only */}
        <div className="hidden grid-cols-[minmax(0,1fr)_11rem_7rem_6rem_4.5rem] items-center gap-3 border-b border-[var(--line)] bg-[var(--hover)]/40 px-4 py-2 text-[11px] text-[var(--fg-3)] md:grid">
          <span>{label}</span>
          <span>Status</span>
          <span>Language</span>
          <span>Edited</span>
          <span className="text-right">Order</span>
        </div>

        {shown.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[13px] text-[var(--fg-3)]">Nothing matches.</p>
            <button
              type="button"
              className="mt-2 text-[13px] text-[var(--green)] hover:underline"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {shown.map((r) => {
              const s = statusOf(r);
              const st = STATUS[s];
              const idx = ordered.findIndex((o) => o.key === r.key);
              const href = `/admin/content/${kind}/${encodeURIComponent(r.key)}`;
              const name = String(r.draft[titleField] ?? r.key);
              const items = kind === "skillgroup" && Array.isArray(r.draft.items) ? (r.draft.items as string[]) : null;
              return (
                <li key={r.key} className="group relative transition-colors hover:bg-[var(--hover)]/60">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,1fr)_11rem_7rem_6rem_4.5rem]">
                    <div className="min-w-0">
                      <Link href={href} className="block truncate text-[14px] font-medium text-[var(--fg)] after:absolute after:inset-0 after:content-[''] hover:text-[var(--green)]">
                        {name}
                      </Link>
                      {name !== r.key && <p className="truncate font-mono text-[11px] text-[var(--fg-3)]">{r.key}</p>}
                      {/* Phone: status and meta under the title */}
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] md:hidden">
                        <span className={`inline-flex items-center gap-1.5 ${st.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                          {st.label}
                        </span>
                        <span className="text-[var(--line-2)]">·</span>
                        <German r={r} />
                        <span className="text-[var(--line-2)]">·</span>
                        <span className="text-[var(--fg-3)]">{ago(r.updated_at)}</span>
                      </p>
                    </div>

                    <span className={`hidden items-center gap-2 text-[12px] md:inline-flex ${st.text}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} aria-hidden="true" />
                      {st.label}
                    </span>
                    <span className="hidden text-[12px] md:block">
                      <German r={r} />
                    </span>
                    <span className="hidden font-mono text-[11px] tabular-nums text-[var(--fg-3)] md:block">{ago(r.updated_at)}</span>

                    <div className="relative z-10 flex items-center justify-end">
                      {canReorder && s !== "removed" ? (
                        <Reorder kind={kind} k={r.key} first={idx === 0} last={idx === ordered.length - 1} />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  {items && (
                    <div className="relative z-10 px-4 pb-3">
                      <SkillRowChips groupName={r.key} items={items} allGroups={rows.map((x) => x.key)} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-[12px] text-[var(--fg-3)]">
        {canReorder ? "Order here is the order on the site." : "Clear search and filters to reorder."}
      </p>
    </div>
  );
}
