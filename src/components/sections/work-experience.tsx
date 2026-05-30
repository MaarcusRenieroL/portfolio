import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "~/components/ui/timeline";

import Link from "next/link";
import { FC } from "react";
import { WORK_EXPERIENCES } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { SectionHeading } from "../misc/section-heading";

export const WorkExperience: FC = () => {
  const sortedExperience = [...WORK_EXPERIENCES].sort((a, b) => {
    const getStartDate = (duration: string) => {
      const match = duration.match(/([a-z]{3,9}) (\d{4})/i);
      return match ? new Date(`${match[1]} 1, ${match[2]}`) : new Date(0);
    };
    return getStartDate(b.duration).getTime() - getStartDate(a.duration).getTime();
  });

  return (
    <section className="flex flex-col gap-10">
      <SectionHeading
        index="02"
        title="work experience"
        eyebrow="timeline"
        description="the places where i learned to ship, debug, and work with teams."
      />

      <Timeline>
        {sortedExperience.map((experience, index) => (
          <TimelineItem
            key={experience.id}
            step={index + 1}
            className="group relative group-data-[orientation=vertical]/timeline:ms-9 group-data-[orientation=vertical]/timeline:not-last:pb-10"
          >
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />

              <TimelineTitle className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                {experience.company}
              </TimelineTitle>

              <TimelineIndicator className="flex size-5 items-center justify-center border-none bg-primary/15 text-primary group-data-[orientation=vertical]/timeline:-left-6 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground">
                <span className="text-[10px] font-bold uppercase">
                  {experience.company[0]}
                </span>
              </TimelineIndicator>
            </TimelineHeader>

            <TimelineContent className="mt-4 p-0">
              <article className="group relative flex w-full flex-col gap-5 overflow-hidden border border-border/70 bg-card/45 p-5 transition-colors duration-300 hover:border-primary/50 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-primary/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {experience.title} ({experience.duration})
                  </p>

                  {experience.href && (
                    <Link
                      href={experience.href}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 opacity-80 transition-opacity duration-300 hover:opacity-100"
                    >
                      <Button size="icon" variant="ghost" className="size-8 rounded-none border border-border/60 bg-background/60 hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
                  {experience.highlights.map((point, index) => (
                    <li key={index}>
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="border border-border/50 bg-secondary/70 px-2.5 py-1 text-[11px] text-secondary-foreground/90">
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
    </section>
  );
};
