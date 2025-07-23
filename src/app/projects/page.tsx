"use client";

import { useState } from "react";
import Link from "next/link";
import { GithubIcon, GlobeIcon } from "lucide-react";
import { PROJECTS } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const sortedProjects = [...PROJECTS]
  .map(p => ({
    ...p,
    endDate: p.endDate.toLowerCase()
  }))
  .sort((a, b) => {
    const aDate = a.endDate === "ongoing" ? new Date(3000, 0, 1) : new Date(a.endDate);
    const bDate = b.endDate === "ongoing" ? new Date(3000, 0, 1) : new Date(b.endDate);
    return bDate.getTime() - aDate.getTime();
  });

export default function ProjectsPage() {

  const [hoveredGithub, setHoveredGithub] = useState<boolean>(false);
  const [hoveredGlobe, setHoveredGlobe] = useState<boolean>(false);

  return (
    <section className="flex flex-col w-full gap-10">
      <h1 className="text-4xl font-bold tracking-tight">projects</h1>

      <div className="flex flex-col gap-6">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="group relative w-full flex flex-col gap-6 border p-6 transition-all duration-200 hover:border-primary"
          >
            <h2 className="text-2xl font-semibold transition-colors duration-200 group-hover:text-primary">
              {project.title}
            </h2>

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
                  <Badge key={index} variant="secondary" className="capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Link href={project.githubLink} target="_blank" aria-label="GitHub Repository">
                <Button variant={hoveredGithub ? "default" : "outline"}
                  onMouseEnter={() => setHoveredGithub(true)}
                  onMouseLeave={() => setHoveredGithub(false)}
                  size="icon" className="hover:scale-105 transition-transform">
                  <GithubIcon className="h-4 w-4" />
                </Button>
              </Link>

              {project.hostedLink && (
                <Link href={project.hostedLink} target="_blank" aria-label="Live Project">
                  <Button variant={hoveredGlobe ? "default" : "outline"}
                    onMouseEnter={() => setHoveredGlobe(true)}
                    onMouseLeave={() => setHoveredGlobe(false)}
                    size="icon" className="hover:scale-105 transition-transform">
                    <GlobeIcon className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
