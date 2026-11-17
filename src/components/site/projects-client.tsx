"use client";

import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List as ListIcon, X, Star, Sparkles } from "lucide-react";
import { GithubIcon, GlobeIcon, SearchIcon } from "~/components/site/icons";
import { ProjectIcon } from "~/components/site/project-icon";
import { useQueryState } from "~/components/site/use-query-state";
import { useListNav } from "~/components/site/use-list-nav";
import { useDict, useLang } from "~/components/site/locale";
import { categoriesFor } from "~/lib/localize-ui";
import type { Project } from "~/lib/schema";
import { GitHubMetricsBar } from "./projects-github";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { GitHubData, GitHubRepo } from "~/lib/server/github-repos";

type SortOption =
  "featured" | "newest" | "name-asc" | "name-desc" | "tech-count" | "stars";

interface EnrichedProject extends Project {
  stars?: number;
  forks?: number;
  language?: string | null;
  updatedAt?: string;
  isGitHubOnly?: boolean;
}

export function ProjectsClient({
  projects: initialProjects,
  github,
}: {
  projects: Project[];
  github: GitHubData;
}) {
  const lang = useLang();
  const dict = useDict();
  const t = dict.projects;
  const ui = dict.ui;

  // Search & Filter state
  const [q, setQ] = useQueryState("q");
  const [cat, setCat] = useQueryState("cat", "all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [viewAllRepos, setViewAllRepos] = useState(false);

  // GitHub repos, fetched on the server with the page (cached an hour), so nothing shifts in later.
  const githubRepos = github.repos;

  // GitHub repo map for quick lookup
  const repoMap = useMemo(() => {
    const map = new Map<string, GitHubRepo>();
    githubRepos.forEach((r) => {
      map.set(r.name.toLowerCase(), r);
    });
    return map;
  }, [githubRepos]);

  // Combined project pool (curated vs full github repos)
  const allProjects = useMemo<EnrichedProject[]>(() => {
    const enrichedCurated: EnrichedProject[] = initialProjects.map((p) => {
      const liveRepo =
        repoMap.get(p.slug.toLowerCase()) || repoMap.get(p.name.toLowerCase());
      return {
        ...p,
        stars: liveRepo?.stars ?? 0,
        forks: liveRepo?.forks ?? 0,
        language: liveRepo?.language ?? null,
        updatedAt: liveRepo?.updatedAt,
        isGitHubOnly: false,
      };
    });

    if (!viewAllRepos) {
      return enrichedCurated;
    }

    // Add remaining GitHub repos not present in curated projects
    const curatedSlugs = new Set(
      initialProjects.map((p) => p.slug.toLowerCase()),
    );
    const gitHubOnly: EnrichedProject[] = githubRepos
      .filter((r) => !curatedSlugs.has(r.name.toLowerCase()))
      .map((r, idx) => ({
        slug: r.name,
        num: String(initialProjects.length + idx + 1).padStart(2, "0"),
        name: r.name,
        kind: r.isFork
          ? t.fork
          : r.language
            ? t.repo(r.language)
            : t.repository,
        status: r.isFork ? t.fork : t.public,
        featured: r.stars > 0,
        cats: ["tooling"],
        desc: r.description || t.repoDesc,
        skills: [r.language, ...(r.topics || [])].filter(Boolean) as string[],
        site: r.homepage || undefined,
        github: r.htmlUrl,
        stars: r.stars,
        forks: r.forks,
        updatedAt: r.updatedAt,
        isGitHubOnly: true,
      }));

    return [...enrichedCurated, ...gitHubOnly];
  }, [initialProjects, githubRepos, repoMap, viewAllRepos, t]);

  // Extract all unique skills across all projects
  const availableSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    allProjects.forEach((p) => {
      p.skills.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([skill, count]) => ({ skill, count }));
  }, [allProjects]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProjects.length };
    allProjects.forEach((p) => {
      p.cats.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [allProjects]);

  // Filter & Sort Engine
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();

    // 1. Search & Filter
    const filtered = allProjects.filter((p) => {
      // Category match
      const matchesCat = cat === "all" || p.cats.includes(cat as never);
      if (!matchesCat) return false;

      // Tech skill match
      if (
        selectedTech &&
        !p.skills.some((s) => s.toLowerCase() === selectedTech.toLowerCase())
      ) {
        return false;
      }

      // Query text match
      if (needle) {
        const hay = [
          p.name,
          p.kind,
          p.desc,
          p.status,
          ...(p.skills || []),
          ...(p.cats || []),
        ]
          .join(" ")
          .toLowerCase();

        const words = needle.split(/\s+/).filter(Boolean);
        const matchesWords = words.every((word) => hay.includes(word));
        if (!matchesWords) return false;
      }

      return true;
    });

    // 2. Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "featured":
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          return (b.stars || 0) - (a.stars || 0);

        case "newest":
          if (a.updatedAt && b.updatedAt) {
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          }
          return 0;

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "tech-count":
          return b.skills.length - a.skills.length;

        case "stars":
          return (b.stars || 0) - (a.stars || 0);

        default:
          return 0;
      }
    });

    return filtered;
  }, [allProjects, q, cat, selectedTech, sort]);

  // Keyboard navigation for list view
  const { active, setActive, search } = useListNav(rows.length, (i) => {
    const p = rows[i];
    if (p) {
      window.open(p.site ?? p.github, "_blank", "noopener");
    }
  });

  // Hotkey / to focus search, Esc to clear
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        search.current?.focus();
      } else if (
        e.key === "Escape" &&
        document.activeElement === search.current
      ) {
        setQ("");
        search.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [search, setQ]);

  const hasActiveFilters = Boolean(
    q || cat !== "all" || selectedTech || sort !== "featured",
  );

  const resetFilters = () => {
    setQ("");
    setCat("all");
    setSelectedTech(null);
    setSort("featured");
  };

  return (
    <>
      {/* 1. Informative GitHub Live Telemetry Bar */}
      {/* Direct child of the page column (56px gap): pull the filters it drives closer. */}
      <div className="-mb-6 empty:hidden">
        <GitHubMetricsBar
          data={github}
          onSelectLanguage={(lang) => {
            setSelectedTech(lang);
          }}
          selectedLanguage={selectedTech}
          viewAllRepos={viewAllRepos}
          onToggleViewAllRepos={(show) => setViewAllRepos(show)}
        />
      </div>

      {/* 2. Portfolio Search & Filtering Controls (shadcn UI components) */}
      {/* Filters and the list read as one block, so the list sits right under its controls. */}
      <div className="stack g24">
        <div className="filters">
          {/* Row 1: Search Input + Sort Dropdown + View Toggle */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            {/* shadcn Search Input */}
            <div className="relative flex-1">
              <label className="search">
                <SearchIcon aria-hidden="true" />
                <Input
                  ref={search}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.search}
                  aria-label={t.searchAria}
                />
                {q ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setQ("")}
                    className="h-6 w-6 p-0 text-[var(--fg-3)] hover:text-[var(--fg)]"
                    aria-label={ui.clearSearch}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <kbd>/</kbd>
                )}
              </label>
            </div>

            {/* Controls Toolbar: shadcn Select Dropdowns + View Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* shadcn Category Dropdown */}
              <Select value={cat} onValueChange={(val) => setCat(val)}>
                <SelectTrigger
                  className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[125px] ${
                    cat !== "all"
                      ? "border-[var(--green)] text-[var(--green)] font-medium"
                      : "border-[var(--line)] text-[var(--fg-2)]"
                  }`}
                  aria-label={t.filter}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t.allAreas} ({categoryCounts.all ?? 0})
                  </SelectItem>
                  {categoriesFor(lang)
                    .filter(([id]) => id !== "all")
                    .map(([id, label]) => (
                      <SelectItem key={id} value={id}>
                        {label} ({categoryCounts[id] ?? 0})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* shadcn Skill / Technology Dropdown */}
              {availableSkills.length > 0 && (
                <Select
                  value={selectedTech ?? "all"}
                  onValueChange={(val) =>
                    setSelectedTech(val === "all" ? null : val)
                  }
                >
                  <SelectTrigger
                    className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[125px] ${
                      selectedTech
                        ? "border-[var(--green)] text-[var(--green)] font-medium"
                        : "border-[var(--line)] text-[var(--fg-2)]"
                    }`}
                    aria-label={t.skillFilter}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t.allSkills} ({availableSkills.length})
                    </SelectItem>
                    {availableSkills.map(({ skill, count }) => (
                      <SelectItem key={skill} value={skill}>
                        {skill} ({count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* shadcn Sort Dropdown */}
              <Select
                value={sort}
                onValueChange={(val) => setSort(val as SortOption)}
              >
                <SelectTrigger
                  className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${
                    sort !== "featured"
                      ? "border-[var(--green)] text-[var(--green)] font-medium"
                      : "border-[var(--line)] text-[var(--fg-2)]"
                  }`}
                  aria-label={t.sortAria}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.sorts).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* shadcn View Mode Toggle Buttons */}
              <div className="flex shrink-0 items-center gap-1 border border-[var(--line)] rounded-lg p-0.5 h-[38px] pointer-coarse:h-10 bg-[var(--bg)]">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`h-7 w-7 pointer-coarse:h-9 pointer-coarse:w-9 ${
                    viewMode === "list"
                      ? "bg-[var(--hover)] text-[var(--green)]"
                      : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                  }`}
                  aria-label={ui.listView}
                  title={ui.listView}
                  aria-pressed={viewMode === "list"}
                >
                  <ListIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`h-7 w-7 pointer-coarse:h-9 pointer-coarse:w-9 ${
                    viewMode === "grid"
                      ? "bg-[var(--hover)] text-[var(--green)]"
                      : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                  }`}
                  aria-label={ui.gridView}
                  title={ui.gridView}
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Counter & Active Filter Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs text-[var(--fg-3)]">
            <div className="flex items-center gap-2">
              <span role="status" aria-live="polite">
                {ui.showing(rows.length, allProjects.length)}
              </span>

              {/* Active filter badges */}
              {hasActiveFilters && (
                <div className="hidden sm:flex items-center gap-1.5 ml-2">
                  {cat !== "all" && (
                    <Badge
                      variant="outline"
                      className="gap-1 font-mono text-[10px]"
                    >
                      {t.cats[cat] ?? cat}
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setCat("all")}
                        className="h-3 w-3 p-0 hover:text-[var(--fg)]"
                        aria-label={ui.removeFilter(t.cats[cat] ?? cat)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  )}
                  {selectedTech && (
                    <Badge
                      variant="outline"
                      className="gap-1 font-mono text-[10px]"
                    >
                      {selectedTech}
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setSelectedTech(null)}
                        className="h-3 w-3 p-0 hover:text-[var(--fg)]"
                        aria-label={ui.removeFilter(selectedTech)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="link"
                type="button"
                onClick={resetFilters}
                className="h-auto p-0 font-mono text-[11px] text-[var(--green)] hover:underline"
              >
                Reset filters
              </Button>
            )}
          </div>
        </div>

        {/* 3. Projects View: Native List View or Grid Cards */}
        {viewMode === "list" ? (
          <ul className="rows" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((p, i) => (
                <m.li
                  key={p.slug}
                  layout="position"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min(i, 8) * 0.03,
                  }}
                  className="prow"
                  data-row={i}
                  data-active={active === i ? "" : undefined}
                  onMouseEnter={() => setActive(i)}
                >
                  <ProjectIcon slug={p.slug} />
                  <div className="pbody">
                    <div className="phead">
                      <div className="flex items-center gap-2">
                        <span className="pname">{p.name}</span>
                        {p.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--green)]">
                            <Sparkles className="h-2.5 w-2.5" />
                            featured
                          </span>
                        )}
                        {Boolean(p.stars && p.stars > 0) && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--fg-3)]">
                            <Star className="h-2.5 w-2.5 fill-current opacity-80" />
                            {p.stars}
                          </span>
                        )}
                      </div>
                      <span className="pmeta">
                        {p.kind} · {p.status}
                      </span>
                    </div>
                    <p className="pdesc">{p.desc}</p>
                    <div className="pfoot">
                      <span className="tags">
                        {p.skills.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedTech(s)}
                            className={`hover:text-[var(--green)] transition-colors pointer-coarse:min-h-8 ${
                              selectedTech?.toLowerCase() === s.toLowerCase()
                                ? "text-[var(--green)] font-semibold"
                                : ""
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </span>
                      <span className="plinks">
                        {p.site && (
                          <a
                            data-track="project-click"
                            data-track-label={p.slug}
                            href={p.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.liveAria(p.name)}
                          >
                            <GlobeIcon /> {t.live}
                          </a>
                        )}
                        {p.github && (
                          <a
                            data-track="project-click"
                            data-track-label={p.slug}
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.codeAria(p.name)}
                          >
                            <GithubIcon /> {t.code}
                          </a>
                        )}
                      </span>
                    </div>
                  </div>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          /* Grid / Bento Cards View matching theme */
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((p, i) => (
                <m.div
                  key={p.slug}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min(i, 8) * 0.03,
                  }}
                  className="group flex flex-col justify-between rounded-lg border border-[var(--line)] bg-[var(--hover)]/20 p-4 transition-colors hover:border-[var(--green)] hover:bg-[var(--hover)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2.5">
                        <ProjectIcon slug={p.slug} />
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--fg)] group-hover:text-[var(--green)] transition-colors">
                            {p.name}
                          </h3>
                          <span className="text-[11px] text-[var(--fg-3)] font-mono">
                            {p.kind}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--fg-3)]">
                        {p.featured && (
                          <span className="text-[var(--green)]">featured</span>
                        )}
                        {Boolean(p.stars && p.stars > 0) && (
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current opacity-80" />
                            {p.stars}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-[var(--fg-2)] leading-relaxed line-clamp-3">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)] space-y-2.5">
                    <div className="tags">
                      {p.skills.slice(0, 5).map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                      {p.skills.length > 5 && (
                        <span className="text-[10px] text-[var(--fg-3)]">
                          +{p.skills.length - 5}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs font-mono">
                      <span className="text-[11px] text-[var(--fg-3)]">
                        {p.status}
                      </span>
                      <div className="plinks">
                        {p.site && (
                          <a
                            href={p.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--green)]"
                          >
                            <GlobeIcon /> {t.live}
                          </a>
                        )}
                        {p.github && (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--green)]"
                          >
                            <GithubIcon /> {t.code}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm text-[var(--fg-2)]">{t.none}</p>
            <Button
              variant="outline"
              type="button"
              onClick={resetFilters}
              className="text-xs font-mono text-[var(--green)] border-[var(--green)]/30 hover:bg-[var(--green)]/10"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Keyboard navigation hints */}
      </div>

      <p className="help kbd-help">
        <kbd>j</kbd> <kbd>k</kbd> {t.keys[0]} · <kbd>gg</kbd> <kbd>G</kbd>{" "}
        {t.keys[1]} · <kbd>Enter</kbd> {t.keys[2]} · <kbd>/</kbd> {t.keys[3]}
      </p>
    </>
  );
}
