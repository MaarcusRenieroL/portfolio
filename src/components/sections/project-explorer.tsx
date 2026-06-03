"use client";

import { useMemo, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { ProjectTimeline } from "./project-timeline";
import { Category, Project } from "~/lib/types";
import { cn } from "~/lib/utils";

const filters: Array<"all" | Category> = [
  "all",
  "full stack",
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

  const visibleProjects = useMemo(() => {
    const value = query.trim().toLowerCase();

    const filtered =
      activeFilter === "all"
        ? projects
        : projects.filter((project) => project.category === activeFilter);

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
  }, [activeFilter, projects, query]);

  const totalLabel = useMemo(() => {
    if (activeFilter === "all") {
      return `${visibleProjects.length} of ${projects.length}`;
    }

    return `${visibleProjects.length} ${activeFilter}`;
  }, [activeFilter, projects.length, visibleProjects.length]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-3 border border-border/60 bg-card/30 p-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="search projects, skills, status..."
            className="h-11 w-full border border-border/60 bg-background/55 pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/55"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="clear project search"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <span className="border border-border/60 bg-background/55 px-3 py-2 text-xs text-muted-foreground">
          {totalLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const count =
            filter === "all"
              ? projects.length
              : projects.filter((project) => project.category === filter).length;

          if (count === 0) {
            return null;
          }

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "border px-3 py-2 text-xs transition-colors",
                activeFilter === filter
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {filter}
              <span className="ml-2 text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      {visibleProjects.length > 0 ? (
        <ProjectTimeline projects={visibleProjects} />
      ) : (
        <div className="border border-border/60 bg-card/35 p-8 text-center text-sm text-muted-foreground">
          no matching projects
        </div>
      )}
    </div>
  );
}
