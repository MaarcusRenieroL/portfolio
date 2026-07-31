import { FC } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { SectionHeading } from "../misc/section-heading";
import { Reveal } from "../misc/reveal";
import {
  getExperiences,
  formatExperienceDuration,
} from "~/lib/data/experience";

export const WorkExperience: FC = () => {
  const sortedExperience = getExperiences();

  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        index="03"
        eyebrow="timeline"
        title="work experience"
        description="a compact map of the teams and problems i've contributed to."
      />

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent"
        />
        <div className="flex flex-col gap-6">
          {sortedExperience.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="relative pl-12">
                <span
                  aria-hidden
                  className="absolute left-2 top-4 grid size-5 place-items-center border border-primary/50 bg-background"
                >
                  <span className="size-1.5 bg-primary" />
                </span>
                <article className="border border-border/60 bg-card/40 p-5 lift">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {exp.title}
                      </h3>
                      {exp.href && (
                        <a
                          href={exp.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {exp.company}
                          <ArrowUpRightIcon className="size-3.5" />
                        </a>
                      )}
                      {!exp.href && (
                        <p className="mt-0.5 text-sm text-primary">
                          {exp.company}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatExperienceDuration(exp)}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground/85">
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
    </section>
  );
};
