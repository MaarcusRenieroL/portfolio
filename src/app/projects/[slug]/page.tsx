import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, GithubIcon, GlobeIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { ProjectPreview } from "~/components/projects/project-preview";
import {
  getProject,
  getProjectNeighbors,
  getProjects,
  formatDuration,
} from "~/lib/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProjects().map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.impact,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return notFound();
  }

  const { previous, next } = getProjectNeighbors(project.id);

  return (
    <article className="flex w-full flex-col gap-10">
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-4" />
        back to projects
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="text-primary">{project.status}</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span>{project.category}</span>
            <span>/</span>
            <span>{formatDuration(project)}</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {project.title}
            </h1>

            <p className="max-w-3xl text-base leading-8 text-foreground/90">
              {project.description}
            </p>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {project.impact}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/55 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              <GithubIcon className="size-4" />
              github
            </Link>

            {project.hostedLink && (
              <Link
                href={project.hostedLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <GlobeIcon className="size-4" />
                live
              </Link>
            )}
          </div>
        </div>

        <ProjectPreview project={project} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["product surface", project.description],
          ["system surface", project.challenge],
        ].map(([label, text]) => (
          <div
            key={label}
            className="relative overflow-hidden border border-border/60 bg-card/35 p-5"
          >
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-3">
              <p className="text-xs font-semibold text-primary">{label}</p>
              <span className="size-2 bg-primary/70" />
            </div>
            <div className="grid min-h-40 place-items-center border border-border/60 bg-background/45 p-5 text-center">
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["role", project.role],
          ["challenge", project.challenge],
          ["result", project.outcome[0]],
        ].map(([label, value]) => (
          <div key={label} className="border border-border/60 bg-card/35 p-4">
            <p className="mb-2 text-xs font-semibold text-primary">
              {label}
            </p>
            <p className="text-sm leading-6 text-foreground/85">{value}</p>
          </div>
        ))}
      </section>

      <section className="border border-border/60 bg-card/35 p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold text-primary">architecture</p>
          <h2 className="mt-2 text-2xl font-semibold">how the pieces connect</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["interface", project.skills.slice(0, 3).join(", ")],
            ["workflow", project.approach[0]],
            ["data and rules", project.decisions[0]],
          ].map(([label, text], index) => (
            <div
              key={label}
              className="relative border border-border/60 bg-background/45 p-4"
            >
              <span className="mb-4 grid size-8 place-items-center border border-primary/45 bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 border border-border/60 bg-card/35 p-5">
          <div>
            <p className="text-xs font-semibold text-primary">
              approach
            </p>
            <h2 className="mt-2 text-2xl font-semibold">how it was shaped</h2>
          </div>

          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/85">
            {project.approach.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 border border-border/60 bg-card/35 p-5">
          <div>
            <p className="text-xs font-semibold text-primary">
              outcome
            </p>
            <h2 className="mt-2 text-2xl font-semibold">what it proves</h2>
          </div>

          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/85">
            {project.outcome.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          ["decisions", project.decisions],
          ["lessons", project.lessons],
          ["next steps", project.nextSteps],
        ].map(([label, items]) => (
          <div
            key={label as string}
            className="flex flex-col gap-4 border border-border/60 bg-card/35 p-5"
          >
            <p className="text-xs font-semibold text-primary">{label as string}</p>
            <ul className="space-y-2 text-sm leading-7 text-foreground/85">
              {(items as string[]).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 border border-border/60 bg-card/35 p-5">
        <p className="text-xs font-semibold text-primary">stack</p>
        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="border border-border/50 bg-secondary/70 px-2.5 py-1 text-[11px] text-secondary-foreground/90"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      <nav className="grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2">
        {[
          ["previous", previous],
          ["next", next],
        ].map(([label, item]) => {
          if (!item) {
            return (
              <div
                key={label as string}
                className="border border-border/40 bg-card/20 p-4 text-sm text-muted-foreground"
              >
                no {label as string} project
              </div>
            );
          }

          const neighbor = item as NonNullable<typeof previous>;

          return (
            <Link
              key={label as string}
              href={`/projects/${neighbor.id}`}
              className="group border border-border/60 bg-card/35 p-4 transition-colors hover:border-primary/45 hover:bg-primary/5"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                {label as string}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                {neighbor.title}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {neighbor.description}
              </p>
            </Link>
          );
        })}
      </nav>
    </article>
  );
}
