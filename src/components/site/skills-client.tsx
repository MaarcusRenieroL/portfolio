"use client";

import { LayoutGrid, List as ListIcon, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDict } from "~/components/site/locale";
import { useQueryState } from "~/components/site/use-query-state";
import { SkillCrosslink } from "~/components/skills/skill-crosslink-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { SkillGroup } from "~/lib/site-content";

const SORTS = ["default", "name-asc", "name-desc", "length"] as const;
type Sort = (typeof SORTS)[number];

/**
 * Skills: text search, category and sort dropdowns, and a flat or grouped view.
 * "/" focuses search, Esc clears it. Each skill with recorded usage opens
 * "where I used this".
 */
export function SkillsClient({ groups }: { groups: SkillGroup[] }) {
  const t = useDict().skills;
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useQueryState("q");
  const [catRaw, setCat] = useQueryState("cat");
  const [sort, setSort] = useState<Sort>("default");
  const [view, setView] = useState<"flow" | "grouped">("flow");

  const cat = catRaw || null;
  const needle = q.trim().toLowerCase();
  const allCount = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  const shownGroups = useMemo(
    () =>
      groups
        .filter((g) => !cat || g.name === cat)
        .map((g) => ({
          ...g,
          items: needle ? g.items.filter((item) => item.toLowerCase().includes(needle) || g.name.toLowerCase().includes(needle)) : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [groups, cat, needle],
  );

  const flat = useMemo(() => {
    const list = shownGroups.flatMap((g) => g.items.map((name) => ({ name, category: g.name })));
    if (sort === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name-desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "length") return [...list].sort((a, b) => b.name.length - a.name.length);
    return list;
  }, [shownGroups, sort]);

  const total = flat.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && el === searchRef.current) {
        setQ("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setQ]);

  const filtered = Boolean(q || cat || sort !== "default");
  const reset = () => {
    setQ("");
    setCat("");
    setSort("default");
  };

  const activeTrigger = "border-[var(--green)] text-[var(--green)] font-medium";
  const chip = (label: string, onClear: () => void) => (
    <Badge variant="outline" className="font-mono text-[11px] gap-1 py-0 h-5 border-[var(--green)] text-[var(--green)]">
      {label}
      <button type="button" onClick={onClear} className="hover:opacity-80" aria-label={t.remove(label)}>
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    </Badge>
  );

  return (
    <div className="stack g24">
      <div className="filters">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label className="search">
              <Search className="h-3.5 w-3.5 text-[var(--fg-3)] shrink-0" aria-hidden="true" />
              <Input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.searchAria} aria-controls={id} />
              {q ? (
                <Button variant="ghost" size="icon" type="button" onClick={() => setQ("")} className="h-6 w-6 p-0 text-[var(--fg-3)] hover:text-[var(--fg)]" aria-label={t.clearSearch}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              ) : (
                <kbd aria-hidden="true">/</kbd>
              )}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={cat ?? "all"} onValueChange={(v) => setCat(v === "all" ? "" : v)}>
              <SelectTrigger className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${cat ? activeTrigger : ""}`} aria-label={t.filter}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCats(allCount)}</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.name} value={g.name}>
                    {g.name} ({g.items.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${sort !== "default" ? activeTrigger : ""}`} aria-label={t.sort}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t.sorts[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border border-[var(--line)] rounded-lg p-0.5 h-[38px] pointer-coarse:h-10 shrink-0" role="group">
              {(
                [
                  ["flow", t.viewFlow, LayoutGrid],
                  ["grouped", t.viewGrouped, ListIcon],
                ] as const
              ).map(([mode, label, Icon]) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setView(mode)}
                  className={`h-7 w-7 pointer-coarse:h-9 pointer-coarse:w-9 ${view === mode ? "bg-[var(--hover)] text-[var(--green)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
                  aria-label={label}
                  aria-pressed={view === mode}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 font-mono text-xs text-[var(--fg-3)]">
          <p className="muted small" role="status" aria-live="polite">
            {t.count(total, Boolean(needle || cat))}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {q && chip(`“${q}”`, () => setQ(""))}
            {cat && chip(cat, () => setCat(""))}
            {sort !== "default" && chip(t.sorts[sort], () => setSort("default"))}
            {filtered && total > 0 && (
              <Button variant="link" type="button" onClick={reset} className="h-auto p-0 font-mono text-[11px] ml-1">
                {t.clear}
              </Button>
            )}
          </div>
        </div>
      </div>

      {view === "flow" ? (
        <ul className="skill-chips skill-flat" id={id} aria-label={t.list}>
          {flat.map((s) => (
            <li key={`${s.category}-${s.name}`} title={s.category}>
              <SkillCrosslink skill={s.name}>{s.name}</SkillCrosslink>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-6" id={id}>
          {shownGroups.map((g) => (
            <section key={g.name} className="p-5 rounded-xl border border-[var(--line)] space-y-3" aria-label={g.name}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-sm text-[var(--fg)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)]" aria-hidden="true" />
                  {g.name}
                </h2>
                <span className="font-mono text-xs text-[var(--fg-3)]">{t.inGroup(g.items.length)}</span>
              </div>
              <ul className="skill-chips skill-flat">
                {g.items.map((item) => (
                  <li key={item}>
                    <SkillCrosslink skill={item}>{item}</SkillCrosslink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {total === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-[var(--line)] space-y-2">
          <p className="muted font-mono text-xs">{t.nothing(q)}</p>
          <Button type="button" variant="link" className="text-xs" onClick={reset}>
            {t.clear}
          </Button>
        </div>
      )}
    </div>
  );
}
