import Link from "next/link";
import { ArrowUpRightIcon, MapPinnedIcon, SparklesIcon } from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { IdentityPanel } from "~/components/misc/identity-panel";

const principles = [
  "build enough of the stack to understand the tradeoffs, not just the task",
  "keep interfaces quiet, fast, and useful for repeat visits",
  "turn side projects into proof of how i think",
  "stay curious across code, systems, design, music, films, anime, and travel",
];

const milestones = [
  ["2020", "100 days of code in python"],
  ["2021", "100 days of web development"],
  ["2023", "networking foundations, ccna/ccnp practice, and first internship"],
  ["2023", "startup product work with next.js, strapi, prisma, and postgres"],
  ["2024", "freelance and internal product exposure across cms-heavy builds"],
  ["2025", "developer 1 role working with angular, java, spring, and mysql"],
];

export default function AboutPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="03"
        title="about"
        eyebrow="person behind the repos"
        description="a full-stack developer from chennai trying to grow into someone who can understand, build, and run serious software end to end."
      />

      <IdentityPanel />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <article className="border border-border/60 bg-card/35 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPinnedIcon className="size-4 text-primary" />
            chennai, india
          </div>

          <div className="space-y-4 text-sm leading-7 text-foreground/90">
            <p>
              i am maarcus reniero l, a 22-year-old full-stack developer working
              as developer 1 - software engineering at ust healthproof.
            </p>
            <p>
              my long-term dream is to run an it firm end to end, so i keep
              building range: frontend craft, backend architecture, product
              decisions, dev tooling, and the operational habits that make
              software easier to maintain.
            </p>
            <p>
              away from the keyboard, i am usually chasing sunsets on two
              wheels, playing guitar, watching anime or films, or following a
              curiosity thread until it becomes a new skill.
            </p>
          </div>
        </article>

        <aside className="grid gap-3">
          {[
            ["current role", "developer 1 - software engineering"],
            ["focus", "full-stack product engineering"],
            ["favorite loop", "learn, build, document, refine"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border border-border/60 bg-background/45 p-4"
            >
              <p className="text-xs font-semibold text-primary">
                {label}
              </p>
              <p className="mt-2 text-sm text-foreground">{value}</p>
            </div>
          ))}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border/60 bg-card/35 p-5">
          <div className="mb-5 flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            <h2 className="text-xl font-semibold">operating principles</h2>
          </div>

          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/85">
            {principles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="border border-border/60 bg-card/35 p-5">
          <h2 className="mb-5 text-xl font-semibold">timeline</h2>

          <div className="space-y-3">
            {milestones.map(([year, text]) => (
              <div
                key={`${year}-${text}`}
                className="grid grid-cols-[4.5rem_1fr] gap-3 border-l border-border/60 pl-3"
              >
                <span className="text-sm font-semibold text-primary">
                  {year}
                </span>
                <p className="text-sm leading-6 text-foreground/85">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Link
        href="/contact"
        className="inline-flex w-fit items-center gap-2 border border-primary/50 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        start a conversation
        <ArrowUpRightIcon className="size-4" />
      </Link>
    </section>
  );
}
