"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRightIcon, GithubIcon, GlobeIcon, SearchIcon } from "~/components/site/icons";
import { ProjectIcon } from "~/components/site/project-icon";
import { useListNav } from "~/components/site/use-list-nav";
import { CATEGORIES, PROJECTS } from "~/lib/content";

export function ProjectsClient() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PROJECTS.filter((p) => (cat === "all" || p.cats.includes(cat as never)) && (!needle || [p.name, p.kind, p.desc, ...p.skills].join(" ").toLowerCase().includes(needle)));
  }, [q, cat]);

  const { active, setActive, search } = useListNav(rows.length, (i) => {
    const p = rows[i];
    if (p.study) router.push(`/projects/${p.slug}`);
    else window.open(p.site ?? p.github, "_blank", "noopener");
  });

  return (
    <>
      <div className="filters">
        <label className="search">
          <SearchIcon aria-hidden="true" />
          <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects or skills" aria-label="Search projects" />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div className="chips" role="group" aria-label="Filter by area">
          {CATEGORIES.map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={cat === id} onClick={() => setCat(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="rows" aria-live="polite">
        {rows.map((p, i) => (
          <li key={p.slug} className="prow" data-row={i} data-active={active === i ? "" : undefined} onMouseEnter={() => setActive(i)}>
            <ProjectIcon slug={p.slug} />
            <div className="pbody">
              <div className="phead">
                {p.study ? (
                  <Link className="pname" href={`/projects/${p.slug}`}>
                    {p.name}
                  </Link>
                ) : (
                  <span className="pname">{p.name}</span>
                )}
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
                    <a href={p.site} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} live site`}>
                      <GlobeIcon /> Live
                    </a>
                  )}
                  <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on GitHub`}>
                    <GithubIcon /> Code
                  </a>
                  {p.study && (
                    <Link href={`/projects/${p.slug}`} aria-label={`${p.name} case study`}>
                      Case study <ArrowUpRightIcon />
                    </Link>
                  )}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="muted">Nothing matches. Try another word or clear the filter.</p>}
      <p className="help kbd-help">
        <kbd>j</kbd> <kbd>k</kbd> move · <kbd>gg</kbd> <kbd>G</kbd> jump · <kbd>Enter</kbd> open · <kbd>/</kbd> search
      </p>
    </>
  );
}
