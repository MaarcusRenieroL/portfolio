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
import { WORK_EXPERIENCE } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";

export const WorkExperience: FC = () => {
  const sortedExperience = [...WORK_EXPERIENCE].sort((a, b) => {
    const getStartDate = (duration: string) => {
      const match = duration.match(/([a-z]{3,9}) (\d{4})/i);
      return match ? new Date(`${match[1]} 1, ${match[2]}`) : new Date(0);
    };
    return getStartDate(b.duration).getTime() - getStartDate(a.duration).getTime();
  });

  return (
    <section className="flex flex-col gap-16">
      <h1 className="text-4xl font-bold tracking-tight">work experience</h1>

      <Timeline>
        {sortedExperience.map((experience, index) => (
          <TimelineItem
            key={experience.id}
            step={index + 1}
            className="group relative group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-12"
          >
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />

              <TimelineTitle className="text-xl font-semibold transition-colors duration-300 group-hover:text-green-500">
                {experience.company}
              </TimelineTitle>

              <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
                <span className="text-xs font-bold uppercase">
                  {experience.company[0]}
                </span>
              </TimelineIndicator>
            </TimelineHeader>

            <TimelineContent className="p-0 mt-5">
              <div className="group relative flex flex-col w-full gap-5 border p-6 transition-all duration-300 ease-in-out hover:border-primary">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground mb-1">
                    {experience.title} ({experience.duration})
                  </p>

                  {experience.href && (
                    <Link
                      href={experience.href}
                      target="_blank"
                      className="opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto"
                    >
                      <Button size="icon" variant="ghost" className="transition-transform hover:scale-105">
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                <ul className="list-disc pl-5 text-sm space-y-2 text-foreground leading-relaxed">
                  {experience.highlights.map((point, index) => (
                    <li key={index} className="transition-all duration-300 ease-in-out">
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill, index) => (
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
};
