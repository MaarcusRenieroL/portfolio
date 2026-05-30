import Link from "next/link";
import { GithubIcon, GlobeIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
                <span className="text-[10px] font-bold uppercase">
                  {project.title[0]}
                </span>
              </TimelineIndicator>

              <TimelineTitle className="truncate text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                {project.title}
              </TimelineTitle>
            </div>

            <div className="flex shrink-0 gap-2 md:opacity-70 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
              <Button asChild size="icon" variant="ghost" className="size-8 border border-border/60 bg-background/40 hover:border-primary/50 hover:text-primary">
                <Link
                  href={project.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title} GitHub repository`}
                >
                  <GithubIcon className="h-4 w-4" />
                </Link>
              </Button>

              {project.hostedLink && (
                <Button asChild size="icon" variant="ghost" className="size-8 border border-border/60 bg-background/40 hover:border-primary/50 hover:text-primary">
                  <Link
                    href={project.hostedLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.title} live project`}
                  >
                    <GlobeIcon className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </TimelineHeader>

          <TimelineContent className="mt-4 p-0">
            <article className="flex w-full flex-col gap-5 border border-border/70 bg-card/20 p-5 transition-colors duration-300 hover:border-primary/50 sm:p-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                  <span>{formatDuration(project)}</span>
                  <span aria-hidden="true">/</span>
                  <span>{project.category}</span>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed text-foreground/90">
                  {project.description}
                </p>
              </div>

              {project.features.length > 0 && !compact && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    features
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
                    {project.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  technologies
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className={cn(
                        "border border-border/50 bg-secondary/70 px-2.5 py-1 text-[11px] text-secondary-foreground/90",
                        compact && "py-0.5"
                      )}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
