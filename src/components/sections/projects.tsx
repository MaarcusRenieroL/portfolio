import { ArrowRightIcon } from "lucide-react";
import { getFeaturedProjects } from "~/lib/data/projects";
import { ProjectCard } from "../projects/project-card";
import { Reveal } from "../misc/reveal";
import { SectionHeading } from "../misc/section-heading";
import { MagneticCTA } from "../misc/magnetic-cta";

export const Projects = () => {
  const sortedProjects = getFeaturedProjects();

  return (
    <section className="flex w-full flex-col gap-8">
      <SectionHeading
        index="02"
        eyebrow="selected work"
        title="featured projects"
        description="products, tools, and experiments — the ones i point to when someone asks how i think."
        action={
          <MagneticCTA href="/projects" variant="ghost" className="text-xs">
            archive <ArrowRightIcon className="size-3.5" />
          </MagneticCTA>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {sortedProjects.map((project, index) => (
          <Reveal key={project.id} delay={index * 0.05}>
            <ProjectCard project={project} index={index} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};
