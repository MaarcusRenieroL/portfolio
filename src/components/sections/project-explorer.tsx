"use client";

import { useMemo, useState } from "react";

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

  const visibleProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects;
    }

    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="flex flex-col gap-8">
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
                  : "border-border/60 bg-card/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter}
              <span className="ml-2 text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>

      <ProjectTimeline projects={visibleProjects} />
    </div>
  );
}
