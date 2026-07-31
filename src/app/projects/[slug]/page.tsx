import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, GithubIcon, GlobeIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { MagneticCTA } from "~/components/misc/magnetic-cta";
import { Reveal } from "~/components/misc/reveal";
import {
  getProject,
  getProjectNeighbors,
  getProjects,
  formatDuration,
} from "~/lib/data/projects";

const ACCENTS = [
  "from-emerald-400/20 via-teal-500/10 to-transparent",
  "from-cyan-400/20 via-sky-500/10 to-transparent",
  "from-violet-400/20 via-fuchsia-500/10 to-transparent",
  "from-amber-400/20 via-orange-500/10 to-transparent",
];

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
  const index = getProjects().findIndex((p) => p.id === project.id);
  const accent = ACCENTS[Math.max(0, index) % ACCENTS.length];

  const sections: [string, string[]][] = [
    ["approach", project.approach],
    ["outcome", project.outcome],
    ["decisions", project.decisions],
    ["lessons", project.lessons],
    ["next steps", project.nextSteps],
  ];

  return (
    <article className="flex w-full flex-col gap-10">
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeftIcon className="size-3.5" />
        all projects
      </Link>

      <header className="relative overflow-hidden border border-border/60 bg-card/40 p-6 sm:p-10">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${accent}`}
        />
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          <span>{project.category}</span>
          <span className="h-px w-8 bg-primary/50" />
          <span className="text-muted-foreground">{project.status}</span>
          <span className="text-muted-foreground">
            · {formatDuration(project)}
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          {project.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          {project.description}
        </p>

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

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <span key={skill} className="chip">
              {skill}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <Reveal>
          <div className="h-full border border-border/60 bg-card/40 p-5 lift">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              role
            </p>
            <p className="mt-2 text-sm text-foreground">{project.role}</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="h-full border border-border/60 bg-card/40 p-5 lift">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              impact
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {project.impact}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full border border-border/60 bg-card/40 p-5 lift">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              challenge
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {project.challenge}
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <section className="border border-border/60 bg-card/40 p-6 sm:p-8">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              architecture
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              how the pieces connect
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["interface", project.skills.slice(0, 3).join(", ")],
              ["workflow", project.approach[0]],
              ["data and rules", project.decisions[0]],
            ].map(([label, text], i) => (
              <div
                key={label}
                className="relative border border-border/60 bg-background/45 p-4 lift"
              >
                <span className="mb-4 grid size-8 place-items-center border border-primary/45 bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map(([title, items], idx) => (
          <Reveal key={title} delay={idx * 0.05}>
            <section className="h-full border border-border/60 bg-card/40 p-5 lift">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {String(idx + 1).padStart(2, "0")} — {title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm leading-6 text-foreground/85">
                {items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-2 size-1 shrink-0 bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <section className="flex flex-col gap-3 border border-border/60 bg-card/40 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            stack
          </p>
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
      </Reveal>

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
