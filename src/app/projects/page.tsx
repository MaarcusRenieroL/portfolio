import { ScrambleText } from "~/components/misc/scramble-text";
import { ProjectTimeline } from "~/components/sections/project-timeline";
import { getProjects } from "~/lib/data/projects";

export default function ProjectsPage() {
  const sortedProjects = getProjects();

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <ScrambleText text="projects" />
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          active builds, experiments, and tools that shaped how I work.
        </p>
      </div>

      <ProjectTimeline projects={sortedProjects} />
    </section>
  );
}
