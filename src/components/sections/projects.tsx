import Link from "next/link";
import { Button } from "../ui/button";

import { ScrambleText } from "../misc/scramble-text";
import { getFeaturedProjects } from "~/lib/data/projects";
import { ProjectTimeline } from "./project-timeline";

export const Projects = () => {
  const sortedProjects = getFeaturedProjects();

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <ScrambleText text="projects" />
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          selected builds with enough signal to show what I like making.
        </p>
      </div>

      <ProjectTimeline projects={sortedProjects} />

      <div className="flex items-center justify-end w-full pt-4">
        <Link href="/projects">
          <Button
            variant="outline"
            className="border-border/70 bg-background/40 transition-colors duration-300 hover:border-primary/60 hover:text-primary"
          >
            View all
          </Button>
        </Link>
      </div>
    </section>
  );
};
