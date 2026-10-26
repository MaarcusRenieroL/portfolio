"use client";

import { useMemo, useState } from "react";
import { FolderGit2Icon, SearchIcon, XIcon } from "lucide-react";

import { ProjectCard } from "../projects/project-card";
import { Reveal } from "../misc/reveal";
import { motion } from "motion/react";
import { Category, Project, TrackId } from "~/lib/types";
import { cn } from "~/lib/utils";
import { playBlip, playThock } from "~/lib/audio";

const filters: Array<"all" | Category> = [
  "all",
  "full stack",
  "desktop app",
  "cli",
  "front end",
  "miscellaneous",
  "freelance",
];

type ProjectExplorerProps = {
  projects: Project[];
};

export function ProjectExplorer({ projects }: ProjectExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | Category>("all");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<"all" | TrackId>("all");

  const visibleProjects = useMemo(() => {
    const value = query.trim().toLowerCase();

    const byCategory =
      activeFilter === "all"
        ? projects
        : projects.filter((project) => project.category === activeFilter);

    const filtered =
      track === "all" ? byCategory : byCategory.filter((project) => project.tracks?.includes(track));

    if (!value) {
      return filtered;
    }

    return filtered.filter((project) =>
      [
        project.title,
        project.description,
        project.impact,
        project.category,
        project.status,
        ...project.skills,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [activeFilter, projects, query, track]);

  return (
    <div className="flex flex-col gap-10">
      {/* Filter and Search Control Center */}
      <Reveal>
        <div className="flex flex-col gap-3 border border-border/60 bg-card/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2 border border-border/60 bg-background/60 px-3 transition-colors focus-within:border-primary/60">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  playThock();
                }}
                placeholder="search projects, skills, status, tools…"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    playBlip();
                  }}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="clear search"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Reset Filter */}
            {(activeFilter !== "all" || query || track !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("all");
                  setTrack("all");
                  setQuery("");
                  playBlip();
                }}
                className="flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <span>Reset View</span>
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {/* Track filter */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1" role="group" aria-label="filter by track">
            <span className="mr-1 font-mono text-[11px] text-muted-foreground">track</span>
            {(["all", "ai", "cloud", "security"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={track === t}
                onClick={() => {
                  setTrack(t);
                  playBlip();
                }}
                className={cn(
                  "h-8 border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  track === t
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filters.map((filter) => {
              const count =
                filter === "all"
                  ? projects.length
                  : projects.filter((project) => project.category === filter).length;

              if (count === 0) return null;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    playBlip();
                  }}
                  className={cn(
                    "relative h-8 border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors select-none font-medium active:scale-95",
                    activeFilter === filter
                      ? "border-primary text-primary font-bold"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {activeFilter === filter && (
                    <motion.span
                      layoutId="active-project-tab"
                      className="absolute inset-0 bg-primary/15 shadow-[0_0_12px_rgba(74,222,128,0.2)] pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{filter} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Projects Grid */}
      {visibleProjects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {visibleProjects.map((project, index) => (
            <Reveal key={project.id} delay={(index % 6) * 0.05}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <FolderGit2Icon className="size-8 mx-auto text-primary/60" />
          <p className="mt-3 font-mono text-xs text-primary font-bold">[0 PROJECTS MATCHED]</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No projects found matching &quot;{query}&quot;. Try resetting the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveFilter("all");
              setTrack("all");
              playBlip();
            }}
            className="mt-4 inline-flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-4 py-1.5 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
