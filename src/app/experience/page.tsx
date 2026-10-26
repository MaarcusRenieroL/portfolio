import { ArrowUpRightIcon } from "lucide-react";
import { SectionHeading } from "~/components/misc/section-heading";
import { Reveal } from "~/components/misc/reveal";
import {
  getExperiences,
  formatExperienceDuration,
} from "~/lib/data/experience";

export const metadata = {
  title: "Experience",
  description: "Full work history — teams, roles, and problems I have contributed to.",
};

export default function ExperiencePage() {
  const experiences = getExperiences();

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="02"
        eyebrow="career timeline"
        title="experience"
        description="every team, every role, every problem i've contributed to — in order."
      />

      <div className="relative">
        {/* Vertical line */}
        <div
          aria-hidden
          className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent overflow-hidden"
        >
          <div className="w-full h-20 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse" />
        </div>

        <div className="flex flex-col gap-6">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="group relative pl-12">
                {/* Timeline node */}
                <span
                  aria-hidden
                  className="absolute left-2 top-4 grid size-5 place-items-center border border-primary/50 bg-background transition-all group-hover:border-primary group-hover:scale-110"
                >
                  <span className="size-1.5 bg-primary group-hover:shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                </span>

                <article className="relative overflow-hidden border border-border/60 bg-card/40 p-5 sm:p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                  {/* Hover accent line */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />

                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold leading-tight text-foreground">
                        {exp.title}
                      </h2>
                      {exp.href ? (
                        <a
                          href={exp.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-base text-primary hover:underline"
                        >
                          {exp.company}
                          <ArrowUpRightIcon className="size-3.5" />
                        </a>
                      ) : (
                        <p className="mt-0.5 text-base text-primary">{exp.company}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatExperienceDuration(exp)}
                      </span>
                      {exp.isOngoing && (
                        <p className="mt-0.5 flex items-center justify-end gap-1 font-mono text-[11px] text-primary">
                          <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                          current
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Highlights */}
                  <ul className="mt-4 space-y-2.5 text-base leading-7 text-foreground/90">
                    {exp.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5">
                        <span className="mt-2 size-1 shrink-0 bg-primary/60" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
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
}
