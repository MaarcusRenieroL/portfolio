import Link from "next/link";
import { Button } from "../ui/button";

import { getFeaturedProjects } from "~/lib/data/projects";
import { ProjectTimeline } from "./project-timeline";
import { SectionHeading } from "../misc/section-heading";

export const Projects = () => {
  const sortedProjects = getFeaturedProjects();

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="03"
        title="projects"
        eyebrow="selected work"
        description="selected builds with enough signal to show what i like making."
      />

      <ProjectTimeline projects={sortedProjects} compact />

      <div className="flex items-center justify-end w-full pt-4">
        <Link href="/projects">
          <Button
            variant="outline"
            className="border-border/70 bg-background/40 transition-colors duration-300 hover:border-primary/60 hover:text-primary"
          >
            view all
          </Button>
        </Link>
      </div>
    </section>
  );
};
