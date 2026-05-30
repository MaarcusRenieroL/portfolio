import { SectionHeading } from "~/components/misc/section-heading";
import { ProjectExplorer } from "~/components/sections/project-explorer";
import { getProjects } from "~/lib/data/projects";

export default function ProjectsPage() {
  const sortedProjects = getProjects();

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="01"
        title="projects"
        eyebrow="filtered archive"
        description="active builds, experiments, and tools that shaped how I work."
      />

      <ProjectExplorer projects={sortedProjects} />
    </section>
  );
}
