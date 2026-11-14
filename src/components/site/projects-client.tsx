"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { GithubIcon, GlobeIcon, SearchIcon } from "~/components/site/icons";
import { ProjectIcon } from "~/components/site/project-icon";
import { useQueryState } from "~/components/site/use-query-state";
import { useListNav } from "~/components/site/use-list-nav";
import { useDict, useLang } from "~/components/site/locale";
import { categoriesFor } from "~/lib/localize";
import type { Project } from "~/lib/schema";

export function ProjectsClient({ projects: PROJECTS }: { projects: Project[] }) {
  const lang = useLang();
  const t = useDict().projects;
  const [q, setQ] = useQueryState("q");
  const [cat, setCat] = useQueryState("cat", "all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PROJECTS.filter((p) => (cat === "all" || p.cats.includes(cat as never)) && (!needle || [p.name, p.kind, p.desc, ...p.skills].join(" ").toLowerCase().includes(needle)));
  }, [q, cat, PROJECTS]);

  const { active, setActive, search } = useListNav(rows.length, (i) => {
    const p = rows[i];
    window.open(p.site ?? p.github, "_blank", "noopener");
  });

  return (
    <>
      <div className="filters">
        <label className="search">
          <SearchIcon aria-hidden="true" />
          <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.searchAria} />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div className="chips" role="group" aria-label={t.filter}>
          {categoriesFor(lang).map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="rows" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
        {rows.map((p, i) => (
          <motion.li key={p.slug} layout="position" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 8) * 0.04 }} className="prow" data-row={i} data-active={active === i ? "" : undefined} onMouseEnter={() => setActive(i)}>
            <ProjectIcon slug={p.slug} />
            <div className="pbody">
              <div className="phead">
                <span className="pname">{p.name}</span>
                <span className="pmeta">
                  {p.kind} · {p.status}
                </span>
              </div>
              <p className="pdesc">{p.desc}</p>
              <div className="pfoot">
                <span className="tags">
                  {p.skills.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
                <span className="plinks">
                  {p.site && (
                    <a data-track="project-click" data-track-label={p.slug} href={p.site} target="_blank" rel="noopener noreferrer" aria-label={t.liveAria(p.name)}>
                      <GlobeIcon /> {t.live}
                    </a>
                  )}
                  {p.github && (
                    <a data-track="project-click" data-track-label={p.slug} href={p.github} target="_blank" rel="noopener noreferrer" aria-label={t.codeAria(p.name)}>
                      <GithubIcon /> {t.code}
                    </a>
                  )}
                </span>
              </div>
            </div>
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>
      {rows.length === 0 && <p className="muted">{t.none}</p>}
      <p className="help kbd-help">
        <kbd>j</kbd> <kbd>k</kbd> {t.keys[0]} · <kbd>gg</kbd> <kbd>G</kbd> {t.keys[1]} · <kbd>Enter</kbd> {t.keys[2]} · <kbd>/</kbd> {t.keys[3]}
      </p>
    </>
  );
}
