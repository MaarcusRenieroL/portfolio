import { FC } from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { SectionHeading } from "../misc/section-heading";
import { Reveal } from "../misc/reveal";
import { MagneticCTA } from "../misc/magnetic-cta";
import {
  getExperiences,
  formatExperienceDuration,
} from "~/lib/data/experience";

export const WorkExperience: FC = () => {
  const sortedExperience = getExperiences();
  // Show only 2 most recent on home page
  const preview = sortedExperience.slice(0, 2);

  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        index="04"
        eyebrow="timeline"
        title="work experience"
        description="a compact map of the teams and problems i've contributed to."
      />

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent overflow-hidden"
        >
          <div className="w-full h-16 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" />
        </div>
        <div className="flex flex-col gap-6">
          {preview.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="group relative pl-12">
                <span
                  aria-hidden
                  className="absolute left-2 top-4 grid size-5 place-items-center border border-primary/50 bg-background transition-all group-hover:border-primary group-hover:scale-110"
                >
                  <span className="size-1.5 bg-primary group-hover:shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                </span>
                <article className="relative overflow-hidden border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-semibold leading-tight">
                        {exp.title}
                      </h3>
                      {exp.href && (
                        <a
                          href={exp.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-base text-primary hover:underline"
                        >
                          {exp.company}
                          <ArrowUpRightIcon className="size-3.5" />
                        </a>
                      )}
                      {!exp.href && (
                        <p className="mt-0.5 text-base text-primary">
                          {exp.company}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatExperienceDuration(exp)}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-base leading-7 text-foreground/90">
                    {exp.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5">
                        <span className="mt-2 size-1 shrink-0 bg-primary/60" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.skills.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {sortedExperience.length > 2 && (
        <Reveal delay={0.15}>
          <MagneticCTA href="/experience" variant="ghost">
            view full experience history
            <ArrowRightIcon className="size-4" />
          </MagneticCTA>
        </Reveal>
      )}
    </section>
  );
};
