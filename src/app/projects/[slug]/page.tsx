import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, GlobeIcon } from "lucide-react";
import { GithubIcon } from "~/components/icons";

import { MagneticCTA } from "~/components/misc/magnetic-cta";
import { Reveal } from "~/components/misc/reveal";
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

  const ogImage = `/og?title=${encodeURIComponent(
    project.title,
  )}&subtitle=${encodeURIComponent(project.impact)}`;

  return {
    title: project.title,
    description: project.impact,
    openGraph: {
      title: project.title,
      description: project.impact,
      url: `https://maarcus.dev/projects/${project.id}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.impact,
      images: [ogImage],
    },
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
        className="inline-flex w-fit items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-3.5" />
        all projects
      </Link>

      {/* Header */}
      <Reveal>
        <header className="border border-border/60 bg-card/40 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span className="text-primary">{project.category}</span>
            <span>·</span>
            <span>{project.status}</span>
            <span>·</span>
            <span>{formatDuration(project)}</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {project.description}
          </p>

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <MagneticCTA href={project.githubLink} variant="ghost" external>
              <GithubIcon className="size-4" />
              repository
            </MagneticCTA>
            {project.hostedLink && (
              <MagneticCTA href={project.hostedLink} external>
                <GlobeIcon className="size-4" />
                live
              </MagneticCTA>
            )}
          </div>

          {/* Skills */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {project.skills.map((skill) => (
              <span key={skill} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </header>
      </Reveal>

      {/* Key info row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal>
          <div className="h-full border border-border/60 bg-card/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">role</p>
            <p className="mt-2 text-sm text-foreground">{project.role}</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="h-full border border-border/60 bg-card/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">impact</p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">{project.impact}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full border border-border/60 bg-card/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">challenge</p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">{project.challenge}</p>
          </div>
        </Reveal>
      </div>

      {/* Approach */}
      {project.approach?.length > 0 && (
        <Reveal>
          <section className="border border-border/60 bg-card/40 p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">approach</p>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
              {project.approach.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      {/* Outcome */}
      {project.outcome?.length > 0 && (
        <Reveal>
          <section className="border border-border/60 bg-card/40 p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">outcome</p>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
              {project.outcome.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      {/* Lessons & Next Steps — side by side */}
      {(project.lessons?.length > 0 || project.nextSteps?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {project.lessons?.length > 0 && (
            <Reveal>
              <section className="h-full border border-border/60 bg-card/40 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">lessons</p>
                <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
                  {project.lessons.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 size-1 shrink-0 bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
          {project.nextSteps?.length > 0 && (
            <Reveal delay={0.05}>
              <section className="h-full border border-border/60 bg-card/40 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">next steps</p>
                <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
                  {project.nextSteps.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 size-1 shrink-0 bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
        </div>
      )}

      {/* Prev / Next nav */}
      <nav className="flex flex-col gap-2 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {previous ? (
          <Link
            href={`/projects/${previous.id}`}
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em]">
                previous
              </span>
              <span className="block text-foreground">{previous.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/projects/${next.id}`}
            className="group inline-flex items-center gap-2 text-right text-sm text-muted-foreground hover:text-primary"
          >
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em]">
                next
              </span>
              <span className="block text-foreground">{next.title}</span>
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <MagneticCTA href="/contact" variant="ghost">
            get in touch
            <ArrowRightIcon className="size-4" />
          </MagneticCTA>
        )}
      </nav>
    </article>
  );
}
