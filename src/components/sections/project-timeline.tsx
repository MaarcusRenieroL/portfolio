import Link from "next/link";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  GithubIcon,
  GlobeIcon,
  LayersIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "~/components/ui/timeline";
import { cn } from "~/lib/utils";
import { formatDuration } from "~/lib/data/projects";
import { Project } from "~/lib/types";
import { ProjectPreview } from "../projects/project-preview";

type ProjectTimelineProps = {
  projects: Project[];
  compact?: boolean;
};

export function ProjectTimeline({ projects, compact = false }: ProjectTimelineProps) {
  return (
    <Timeline>
      {projects.map((project, index) => (
        <TimelineItem
          key={project.id}
          step={index + 1}
          className="group relative group-data-[orientation=vertical]/timeline:ms-9 group-data-[orientation=vertical]/timeline:not-last:pb-10"
        >
          <TimelineHeader className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />

              <TimelineIndicator className="flex size-5 items-center justify-center border-none bg-primary/15 text-primary group-data-[orientation=vertical]/timeline:-left-6 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground">
                <span className="text-[10px] font-bold">
                  {project.title[0]}
                </span>
              </TimelineIndicator>

              <TimelineTitle className="truncate text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                {project.title}
              </TimelineTitle>
            </div>

            <span className="shrink-0 border border-border/60 bg-background/55 px-2 py-1 text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          </TimelineHeader>

          <TimelineContent className="mt-4 p-0">
            <article className="relative overflow-hidden border border-border/70 bg-card/45 transition-colors duration-300 hover:border-primary/50">
              <div className="absolute inset-x-0 top-0 h-px bg-primary/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="grid gap-0 lg:grid-cols-[0.92fr_1fr]">
                <div className="border-b border-border/60 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                  <ProjectPreview project={project} compact={compact} />
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/30 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5 text-primary" />
                        {formatDuration(project)}
                      </span>
                      <span aria-hidden="true">/</span>
                      <span>{project.category}</span>
                    </div>

                    <span className="border border-primary/35 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      {project.status}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {project.description}
                      </p>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {project.impact}
                      </p>
                    </div>

                    {project.features.length > 0 && !compact && (
                      <div className="flex flex-col gap-2 border-l border-primary/40 pl-4">
                        <p className="text-xs font-semibold text-muted-foreground">
                          features
                        </p>
                        <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/85">
                          {project.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex gap-2">
                              <span className="mt-2 size-1.5 shrink-0 bg-primary/70" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <LayersIcon className="size-3.5 text-primary" />
                        technologies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.slice(0, compact ? 6 : project.skills.length).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className={cn(
                              "border border-border/50 bg-secondary/70 px-2.5 py-1 text-[11px] text-secondary-foreground/90",
                              compact && "py-0.5",
                            )}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex h-9 items-center gap-2 border border-primary/45 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        case study
                        <ArrowUpRightIcon className="size-3.5" />
                      </Link>

                      <Link
                        href={project.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-2 border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      >
                        <GithubIcon className="size-3.5" />
                        repo
                      </Link>

                      {project.hostedLink && (
                        <Link
                          href={project.hostedLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        >
                          <GlobeIcon className="size-3.5" />
                          live
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
