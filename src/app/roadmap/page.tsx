import Link from "next/link";
import { CheckCircle2Icon, CircleDashedIcon, LoaderIcon } from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { Reveal } from "~/components/misc/reveal";
import { AskPortfolio } from "~/components/misc/ask-portfolio";
import { PROJECTS } from "~/lib/constants";
import {
  CERTS,
  MASTERS_LINE,
  ROADMAP,
  SKILLS,
  TRACKS,
  roadmapProgress,
  type Level,
  type Status,
} from "~/lib/data/career";
import type { TrackId } from "~/lib/types";
import { cn } from "~/lib/utils";

export const metadata = {
  title: "Roadmap",
  description:
    "Where I am heading: AI, cloud and cybersecurity. What is done, what I'm learning, and what comes next.",
};

const TRACK_IDS = Object.keys(TRACKS) as TrackId[];

const STATUS_STYLE: Record<Status, { label: string; icon: typeof CheckCircle2Icon; className: string }> = {
  done: { label: "done", icon: CheckCircle2Icon, className: "text-primary" },
  learning: { label: "learning", icon: LoaderIcon, className: "text-amber-500" },
  planned: { label: "planned", icon: CircleDashedIcon, className: "text-muted-foreground" },
};

const LEVEL_STYLE: Record<Level, string> = {
  working: "border-primary/60 bg-primary/10 text-primary",
  familiar: "border-border bg-background/60 text-foreground/90",
  planned: "border-dashed border-border/60 bg-transparent text-muted-foreground",
};

export default function RoadmapPage() {
  return (
    <section className="flex w-full flex-col gap-14">
      <SectionHeading
        index="03"
        eyebrow="ai · cloud · security"
        title="roadmap"
        description={MASTERS_LINE}
      />

      {/* tracks */}
      <div className="grid gap-5 md:grid-cols-3">
        {TRACK_IDS.map((id, i) => {
          const track = TRACKS[id];
          const { done, total } = roadmapProgress(id);
          return (
            <Reveal key={id} delay={i * 0.06}>
              <article className="flex h-full flex-col gap-4 border border-border/60 bg-card/40 p-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl font-semibold">{track.title}</h2>
                  <span className="font-mono text-xs text-primary">
                    {done}/{total} done
                  </span>
                </div>
                <div
                  className="h-1.5 w-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={done}
                  aria-label={`${track.title} roadmap progress`}
                >
                  <div className="h-full bg-primary" style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <p className="text-base leading-7">{track.summary}</p>
                <p className="text-base leading-7 text-muted-foreground">{track.why}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {track.projects.map((pid) => {
                    const p = PROJECTS.find((x) => x.id === pid);
                    return p ? (
                      <Link key={pid} href={`/projects/${pid}`} className="chip hover:border-primary/60 hover:text-primary">
                        {p.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* board */}
      <div className="flex flex-col gap-6">
        <Reveal>
          <h2 className="text-3xl font-semibold">what is done and what is next</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            only items with evidence in a project, a job or a certificate are marked done.
          </p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {TRACK_IDS.map((id) => (
            <Reveal key={id}>
              <div className="flex flex-col gap-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{TRACKS[id].title}</h3>
                <ul className="flex flex-col gap-3">
                  {ROADMAP.filter((r) => r.track === id).map((item) => {
                    const st = STATUS_STYLE[item.status];
                    const Icon = st.icon;
                    return (
                      <li key={item.id} className="border border-border/60 bg-card/40 p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={cn("mt-1 size-4 shrink-0", st.className)} aria-hidden />
                          <div>
                            <p className="text-base font-medium leading-snug">
                              {item.title}
                              <span className="sr-only"> ({st.label})</span>
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* skills */}
      <div className="flex flex-col gap-6">
        <Reveal>
          <h2 className="text-3xl font-semibold">skills by track</h2>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            solid = working · outlined = familiar · dashed = planned
          </p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {TRACK_IDS.map((id) => (
            <Reveal key={id}>
              <div className="border border-border/60 bg-card/40 p-5">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{TRACKS[id].title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SKILLS[id].map((s) => (
                    <li
                      key={s.name}
                      className={cn("border px-3 py-1.5 font-mono text-sm", LEVEL_STYLE[s.level])}
                    >
                      {s.name}
                      <span className="sr-only"> ({s.level})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* certs */}
      <div className="flex flex-col gap-6">
        <Reveal>
          <h2 className="text-3xl font-semibold">certifications</h2>
        </Reveal>
        <div role="list" className="grid gap-3 sm:grid-cols-2">
          {CERTS.map((c) => (
            <Reveal key={c.name}>
              <div role="listitem" className="flex h-full items-start justify-between gap-4 border border-border/60 bg-card/40 p-4">
                <div>
                  <p className="text-base font-medium">{c.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 border px-2 py-0.5 font-mono text-[11px]",
                    c.status === "earned" ? "border-primary/60 text-primary" : "border-dashed border-border text-muted-foreground",
                  )}
                >
                  {c.status}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ask */}
      <div className="flex flex-col gap-6">
        <Reveal>
          <h2 className="text-3xl font-semibold">ask about my work</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            answers come only from the projects, experience and roadmap on this site. if it isn&apos;t here, it says so.
          </p>
        </Reveal>
        <Reveal>
          <AskPortfolio />
        </Reveal>
      </div>
    </section>
  );
}
