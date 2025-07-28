"use client";

import Link from "next/link";
import { GithubIcon, GlobeIcon } from "lucide-react";
import { PROJECTS } from "~/lib/constants";
import { Button } from "~/components/ui/button";
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

export default function ProjectsPage() {
  return (
    <section className="flex flex-col w-full gap-10">
      <h1 className="text-4xl font-bold tracking-tight">projects</h1>

      <Timeline>
        {[...PROJECTS]
          .map(p => ({
            ...p,
            endDate: p.endDate.toLowerCase(),
          }))
          .sort((a, b) => {
            const aDate = a.endDate === "ongoing" ? new Date(3000, 0, 1) : new Date(a.endDate);
            const bDate = b.endDate === "ongoing" ? new Date(3000, 0, 1) : new Date(b.endDate);
            return bDate.getTime() - aDate.getTime();
          })
          .map((project, index) => (
            <TimelineItem
              key={project.id}
              step={index + 1}
              className="group relative group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-12"
            >
              <TimelineHeader className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                  <TimelineTitle className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                    {project.title}
                  </TimelineTitle>
                  <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
                    <span className="text-xs font-bold uppercase">{project.title[0]}</span>
                  </TimelineIndicator>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <div className="group/github">
                    <Link href={project.githubLink} target="_blank" aria-label="GitHub Repository">
                      <Button
                        variant="outline"
                        size="icon"
                        className="transition-all group-hover/github:variant-default hover:scale-105"
                      >
                        <GithubIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {project.hostedLink && (
                    <div className="group/live">
                      <Link href={project.hostedLink} target="_blank" aria-label="Live Project">
                        <Button
                          variant="outline"
                          size="icon"
                          className="transition-all group-hover/live:variant-default hover:scale-105"
                        >
                          <GlobeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </TimelineHeader>

              <TimelineContent className="p-0 mt-5">
                <div className="group relative w-full flex flex-col gap-6 border p-6 transition-all duration-200 hover:border-primary">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">
                      {project.startDate} – {project.endDate}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-muted-foreground">features</p>
                    <ul className="list-disc pl-5 text-sm text-foreground leading-relaxed space-y-1">
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-muted-foreground">technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>
    </section>
  );
}
