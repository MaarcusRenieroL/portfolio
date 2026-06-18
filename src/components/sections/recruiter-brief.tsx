import Link from "next/link";
import {
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  Code2Icon,
  FileTextIcon,
  Layers3Icon,
  MailIcon,
} from "lucide-react";

const highlights = [
  {
    label: "current role",
    value: "developer 1 - software engineering at ust healthproof",
    icon: BriefcaseBusinessIcon,
  },
  {
    label: "strongest fit",
    value: "frontend-heavy full-stack roles, internal tools, saas workflows",
    icon: Layers3Icon,
  },
  {
    label: "daily stack",
    value: "typescript, next.js, react, angular, java, spring boot, sql",
    icon: Code2Icon,
  },
];

const proof = [
  "built zentro as a multi-tenant collaboration product experiment with organizations, permissions, workspaces, and activity-heavy workflows.",
  "created next-cli to reduce repeated setup decisions when starting opinionated next.js projects.",
  "maintain this portfolio and dotfiles as living proof of product taste, code organization, and day-to-day engineering habits.",
];

export function RecruiterBrief() {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr_1fr]">
      <div className="border border-border/60 bg-card/35 p-5 sm:p-6">
        <p className="text-xs font-semibold text-primary">recruiter snapshot</p>
        <h2 className="mt-2 text-2xl font-semibold">quick signal</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          the short version: i am early-career, hands-on across the stack, and
          most interested in teams where product thinking and engineering
          ownership meet.
        </p>

        <div className="mt-5 grid gap-3">
          {highlights.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="grid grid-cols-[2.25rem_1fr] gap-3 border border-border/60 bg-background/45 p-3"
            >
              <span className="grid size-9 place-items-center border border-primary/35 bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-muted-foreground">
                  {label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-foreground">
                  {value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 border border-border/60 bg-background/45 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold text-primary">why keep reading</p>
          <h2 className="mt-2 text-2xl font-semibold">proof worth checking</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/85">
            {proof.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 size-1.5 shrink-0 bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/projects"
            className="inline-flex h-10 items-center justify-center gap-2 border border-primary/50 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            view projects
            <ArrowUpRightIcon className="size-4" />
          </Link>
          <Link
            href="/resume"
            className="inline-flex h-10 items-center justify-center gap-2 border border-border/60 bg-card/35 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <FileTextIcon className="size-4" />
            resume
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center gap-2 border border-border/60 bg-card/35 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <MailIcon className="size-4" />
            contact
          </Link>
        </div>
      </div>
    </section>
  );
}
