import { ArrowUpRightIcon, MailIcon, FileTextIcon } from "lucide-react";
import { SectionHeading } from "../misc/section-heading";
import { MagneticCTA } from "../misc/magnetic-cta";
import { Reveal } from "../misc/reveal";

const highlights = [
  {
    k: "current role",
    v: "developer 1 - software engineering @ ust healthproof",
  },
  {
    k: "strongest fit",
    v: "frontend-heavy full-stack roles, internal tools, saas workflows",
  },
  {
    k: "daily stack",
    v: "typescript, next.js, react, angular, java, spring boot, sql",
  },
];

const proof = [
  "built zentro as a multi-tenant collaboration product experiment with organizations, permissions, workspaces, and activity-heavy workflows.",
  "created next-kit to reduce repeated setup decisions when starting opinionated next.js projects.",
  "maintain this portfolio and dotfiles as living proof of product taste, code organization, and day-to-day engineering habits.",
];

export function RecruiterBrief() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        index="01"
        eyebrow="recruiter snapshot"
        title="quick signal"
        description="the short version: hands-on across the stack, most interested in teams where product thinking and engineering ownership meet."
      />

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1fr]">
        <Reveal>
          <div className="border border-border/60 bg-card/40 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              at a glance
            </p>
            <div className="mt-4 grid gap-3">
              {highlights.map((h) => (
                <div key={h.k} className="border border-border/60 bg-background/50 p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {h.k}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground">{h.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col justify-between gap-6 border border-border/60 bg-background/50 p-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                why keep reading
              </p>
              <h3 className="mt-2 text-xl font-semibold">proof worth checking</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/85">
                {proof.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 bg-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <MagneticCTA href="/projects">
                view projects
                <ArrowUpRightIcon className="size-4" />
              </MagneticCTA>
              <MagneticCTA href="/resume" variant="ghost">
                <FileTextIcon className="size-4" />
                resume
              </MagneticCTA>
              <MagneticCTA href="/contact" variant="ghost">
                <MailIcon className="size-4" />
                contact
              </MagneticCTA>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
