"use client"

import Link from "next/link";
import { useState } from "react";
import { GithubIcon, GlobeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PROJECTS } from "~/lib/constants";

export const Projects = () => {
  const projects = PROJECTS.sort((a, b) => {
    const aDate = a.endDate === "Ongoing" ? new Date(3000, 0, 1) : new Date(a.endDate);
    const bDate = b.endDate === "Ongoing" ? new Date(3000, 0, 1) : new Date(b.endDate);
    return bDate.getTime() - aDate.getTime();
  });

  const [hoveredGithub, setHoveredGithub] = useState<string | null>(null);
  const [hoveredGlobe, setHoveredGlobe] = useState<string | null>(null);
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <section className="flex flex-col w-full gap-16">
      <h1 className="text-4xl font-bold tracking-tight">projects</h1>

      <div className="flex flex-col gap-8">
        {projects.slice(0, 3).map((project) => (
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
                <Button size="icon" variant="outline" className="hover:scale-105 transition-transform">
                  <GithubIcon className="h-4 w-4" />
                </Button>
              </Link>

              {project.hostedLink && (
                <Link href={project.hostedLink} target="_blank" aria-label="Live Project">
                  <Button size="icon" variant="outline" className="hover:scale-105 transition-transform">
                    <GlobeIcon className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

        ))}
      </div>

      {/* View All Button */}
      <div className="flex items-center justify-end w-full pt-4">
        <Link href="/projects">
          <Button
            variant={hovered ? "default" : "outline"}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="transition-all duration-500 ease-in-out hover:scale-105 hover:border-primary hover:text-primary"
          >
            View all
          </Button>
        </Link>
      </div>
    </section>
  );
};
