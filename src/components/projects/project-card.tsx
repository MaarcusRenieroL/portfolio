"use client";

import Link from "next/link";
import { ArrowUpRightIcon, GithubIcon, GlobeIcon } from "lucide-react";

import { Project } from "~/lib/types";
import { formatDuration } from "~/lib/data/projects";

const ACCENTS = [
  "from-emerald-400/25 via-teal-500/10 to-transparent",
  "from-cyan-400/25 via-sky-500/10 to-transparent",
  "from-violet-400/25 via-fuchsia-500/10 to-transparent",
  "from-amber-400/25 via-orange-500/10 to-transparent",
];

type ProjectCardProps = {
  project: Project;
  index?: number;
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="group lift project-card relative flex h-full flex-col overflow-hidden border border-border/60 bg-card/40 p-5 sm:p-6">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <Link
        href={`/projects/${project.id}`}
        aria-label={`open ${project.title}`}
        className="absolute inset-0 z-[1]"
      />

      <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] tabular-nums text-muted-foreground/70">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="pointer-events-none relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span>{project.category}</span>
        <span className="h-px w-4 bg-primary/40" />
        <span className="text-muted-foreground">{project.status}</span>
      </div>

      <h3 className="pointer-events-none relative mt-3 text-2xl font-semibold tracking-tight">
        {project.title}
        <ArrowUpRightIcon className="ml-1 inline size-5 -translate-y-0.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:text-primary" />
      </h3>

      <p className="pointer-events-none relative mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>

      <div className="pointer-events-none relative mt-4 flex flex-wrap gap-1.5">
        {project.skills.slice(0, 5).map((skill) => (
          <span key={skill} className="chip">
            {skill}
          </span>
        ))}
        {project.skills.length > 5 && (
          <span className="chip">+{project.skills.length - 5}</span>
        )}
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
        <span className="pointer-events-none font-mono">
          {formatDuration(project)}
        </span>
        <div className="relative z-10 flex items-center gap-2">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="open github repository"
              className="grid size-8 place-items-center border border-border/60 bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <GithubIcon className="size-3.5" />
            </a>
          )}
          {project.hostedLink && (
            <a
              href={project.hostedLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="open live site"
              className="grid size-8 place-items-center border border-border/60 bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <GlobeIcon className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
