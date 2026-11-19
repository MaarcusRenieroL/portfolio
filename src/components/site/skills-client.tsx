"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";
import { useDict } from "~/components/site/locale";
import { useQueryState } from "~/components/site/use-query-state";
import { SkillCrosslink } from "~/components/skills/skill-crosslink-card";
import { useSkillUsageData } from "~/components/skills/skill-usage";
import { computeSkillUsage } from "~/lib/skill-match";
import type { SkillGroup } from "~/lib/site-content";

/** Where a skill is proven: in a job, only in my own projects, or neither (studied, practised). */
type Evidence = "work" | "project" | "none";
const EVIDENCE = ["all", "work", "project"] as const;
type Show = (typeof EVIDENCE)[number];

/**
 * Skills as an evidence index: one row per category, each skill marked by where it was used
 * (filled dot: at work, ring: in my projects). Search and the evidence filter dim what doesn't
 * match instead of removing it, so the page never jumps. A category label narrows to that row.
 * "/" focuses search, Esc clears it. Skills with recorded usage open "where I used this".
 */
export function SkillsClient({ groups }: { groups: SkillGroup[] }) {
  const t = useDict().skills;
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const usage = useSkillUsageData();

  const [q, setQ] = useQueryState("q");
  const [catRaw, setCat] = useQueryState("cat");
  const [showRaw, setShow] = useQueryState("show");
  const cat = catRaw || null;
  const show: Show = (EVIDENCE as readonly string[]).includes(showRaw) ? (showRaw as Show) : "all";
  const needle = q.trim().toLowerCase();

  // Evidence for every skill, once per data change.
  const rows = useMemo(
    () =>
      groups.map((g) => ({
        name: g.name,
        items: g.items.map((name) => {
          const u = computeSkillUsage(name, usage);
          const evidence: Evidence = u.roles.length ? "work" : u.projects.length ? "project" : "none";
          return { name, evidence };
        }),
      })),
    [groups, usage],
  );

  const totals = useMemo(() => {
    const all = rows.flatMap((r) => r.items);
    return { all: all.length, work: all.filter((s) => s.evidence === "work").length, project: all.filter((s) => s.evidence === "project").length };
  }, [rows]);

  const matches = (group: string, s: { name: string; evidence: Evidence }) =>
    (!cat || group === cat) &&
    (show === "all" || s.evidence === show) &&
    (!needle || s.name.toLowerCase().includes(needle) || group.toLowerCase().includes(needle));

  const shown = rows.reduce((n, r) => n + r.items.filter((s) => matches(r.name, s)).length, 0);
  const filtered = Boolean(needle || cat || show !== "all");

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

  const reset = () => {
    setQ("");
    setCat("");
    setShow("");
  };

  const filterLabel: Record<Show, string> = { all: t.evAll(totals.all), work: t.evWork(totals.work), project: t.evProject(totals.project) };

  return (
    <div className="stack g24">
      <div className="skills-tools">
        <label className="search">
          <Search aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            aria-label={t.searchAria}
            aria-controls={id}
            autoComplete="off"
            spellCheck={false}
          />
          {q ? (
            <button type="button" className="search-clear" onClick={() => setQ("")} aria-label={t.clearSearch}>
              <X aria-hidden="true" />
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
        </label>
        <div className="chips" role="group" aria-label={t.filterEvidence}>
          {EVIDENCE.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={show === k} onClick={() => setShow(k === "all" ? "" : k)}>
              {k !== "all" && <i className={`ev ev-${k}`} aria-hidden="true" />}
              {filterLabel[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="skills-meta small">
        <p className="skills-legend">
          <span>
            <i className="ev ev-work" aria-hidden="true" />
            {t.legendWork}
          </span>
          <span>
            <i className="ev ev-project" aria-hidden="true" />
            {t.legendProject}
          </span>
          <span className="skills-legend-none">{t.legendNone}</span>
        </p>
        <p role="status" aria-live="polite" className="skills-count">
          {filtered ? t.count(shown, true) : t.count(totals.all, false)}
          {filtered && (
            <button type="button" className="link-btn" onClick={reset}>
              {t.clear}
            </button>
          )}
        </p>
      </div>

      <dl className="skills-index" id={id} aria-label={t.list}>
        {rows.map((r) => {
          const hits = r.items.filter((s) => matches(r.name, s)).length;
          const active = cat === r.name;
          return (
            <div key={r.name} className="skills-row" data-dim={hits === 0 ? "" : undefined}>
              <dt>
                <button
                  type="button"
                  className="skills-cat"
                  aria-pressed={active}
                  onClick={() => setCat(active ? "" : r.name)}
                  title={active ? t.catOff(r.name) : t.catOn(r.name)}
                >
                  {r.name}
                  <span className="skills-n">{r.items.length}</span>
                </button>
              </dt>
              <dd>
                <ul className="skills-list">
                  {r.items.map((s) => (
                    <li key={s.name} data-ev={s.evidence} data-dim={matches(r.name, s) ? undefined : ""}>
                      <SkillCrosslink skill={s.name}>{s.name}</SkillCrosslink>
                      {s.evidence !== "none" && <i className={`ev ev-${s.evidence}`} aria-label={s.evidence === "work" ? t.legendWork : t.legendProject} role="img" />}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          );
        })}
      </dl>

      {shown === 0 && (
        <p className="skills-empty">
          {t.nothing(q.trim() || filterLabel[show])}{" "}
          <button type="button" className="link-btn" onClick={reset}>
            {t.clear}
          </button>
        </p>
      )}
    </div>
  );
}
