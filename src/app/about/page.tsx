import { ArrowUpRightIcon, MapPinnedIcon, SparklesIcon, CoffeeIcon } from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { Reveal } from "~/components/misc/reveal";
import { IdentityPanel } from "~/components/misc/identity-panel";
import { MagneticCTA } from "~/components/misc/magnetic-cta";

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

const interests = [
  ["motorcycles", "chasing sunsets on two wheels around chennai"],
  ["guitar", "learning slowly, playing badly, loving it anyway"],
  ["anime & films", "wong kar-wai, makoto shinkai, jjk, frieren"],
  ["travel", "hills over beaches, small towns over cities"],
];

export default function AboutPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="03"
        title="about"
        eyebrow="person behind the repos"
        description="a full-stack developer from chennai who builds across the stack and is growing toward understanding, building, and running serious software end to end."
      />

      <Reveal>
        <IdentityPanel />
      </Reveal>

      <Reveal>
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
          </div>
        </article>
      </Reveal>

      <Reveal>
        <div className="border border-border/60 bg-card/40 p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <h2 className="text-xl font-semibold sm:text-2xl">
                operating principles
              </h2>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(principles.length).padStart(2, "0")} rules
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {principles.map((p, i) => (
              <div
                key={p}
                className="group flex gap-4 border border-border/50 bg-background/50 p-4 lift"
              >
                <span className="font-mono text-2xl font-semibold text-primary/70 transition-colors group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-6 text-foreground/85">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="border border-border/60 bg-card/40 p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            timeline
          </p>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
            how i got here
          </h2>
          <div className="relative mt-6">
            <div className="absolute left-[3.75rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />
            <div className="space-y-4">
              {milestones.map(([year, text]) => (
                <div
                  key={`${year}-${text}`}
                  className="relative grid grid-cols-[3.5rem_1rem_1fr] items-start gap-3"
                >
                  <span className="font-mono text-sm font-semibold text-primary">
                    {year}
                  </span>
                  <span className="relative mt-1.5 grid size-4 place-items-center">
                    <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_rgba(74,222,128,0.6)]" />
                  </span>
                  <p className="border border-border/50 bg-background/50 p-3 text-sm leading-6 text-foreground/85">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section className="border border-border/60 bg-card/40 p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                away from the keyboard
              </p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                what fills the rest
              </h2>
            </div>
            <CoffeeIcon className="size-5 text-primary/70" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {interests.map(([k, v]) => (
              <div key={k} className="border border-border/60 bg-background/50 p-4 lift">
                <p className="text-sm font-medium text-foreground">{k}</p>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{v}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <MagneticCTA href="/contact">
        start a conversation
        <ArrowUpRightIcon className="size-4" />
      </MagneticCTA>
    </section>
  );
}
