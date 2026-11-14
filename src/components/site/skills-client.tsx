"use client";

import { useId, useMemo } from "react";
import { useQueryState } from "~/components/site/use-query-state";
import { useDict, useLang } from "~/components/site/locale";
import { skillsFor } from "~/lib/localize";

/** Skills as pills: a text search plus a category filter, both combined. */
export function SkillsClient() {
  const lang = useLang();
  const t = useDict().skills;
  const groups = useMemo(() => skillsFor(lang), [lang]);
  const [q, setQ] = useQueryState("q");
  const [catRaw, setCat] = useQueryState("cat");
  const cat = catRaw || null;
  const id = useId();

  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      groups
        .filter((g) => !cat || g.name === cat)
        .map((g) => ({ ...g, items: needle ? g.items.filter((t) => t.toLowerCase().includes(needle) || g.name.toLowerCase().includes(needle)) : g.items }))
        .filter((g) => g.items.length > 0),
    [groups, cat, needle],
  );
  const total = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="stack g24">
      <div className="filters">
        <label className="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.searchAria} aria-controls={id} />
        </label>
        <div className="chips" role="group" aria-label={t.filter}>
          <button type="button" className="chip" aria-pressed={cat === null} onClick={() => setCat("")}>
            {t.all}
          </button>
          {groups.map((g) => (
            <button key={g.name} type="button" className="chip" aria-pressed={cat === g.name} onClick={() => setCat(cat === g.name ? "" : g.name)}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small" role="status" aria-live="polite">
        {t.count(total, Boolean(needle || cat))}
      </p>

      <ul className="skill-chips skill-flat" id={id} aria-label={t.list}>
        {shown.flatMap((g) => g.items).map((t, i) => (
          <li key={`${t}-${i}`}>{t}</li>
        ))}
      </ul>
      {total === 0 && (
        <p className="muted">
          {t.nothing(q)}{" "}
          <button type="button" className="link" onClick={() => (setQ(""), setCat(""))}>
            {t.clear}
          </button>
        </p>
      )}
    </div>
  );
}
