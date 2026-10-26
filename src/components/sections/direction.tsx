import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SectionHeading } from "../misc/section-heading";
import { Reveal } from "../misc/reveal";
import { MASTERS_LINE, TRACKS, roadmapProgress } from "~/lib/data/career";
import type { TrackId } from "~/lib/types";

const IDS = Object.keys(TRACKS) as TrackId[];

export function Direction() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        index="02"
        eyebrow="where i'm heading"
        title="ai, cloud, security"
        description={MASTERS_LINE}
        action={
          <Link
            href="/roadmap"
            className="inline-flex h-11 items-center gap-2 border border-border/60 bg-card/40 px-5 text-base transition-colors hover:border-primary/50 hover:text-primary"
          >
            see the roadmap <ArrowRightIcon className="size-4" />
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-3">
        {IDS.map((id, i) => {
          const { done, total } = roadmapProgress(id);
          return (
            <Reveal key={id} delay={i * 0.06}>
              <Link
                href="/roadmap"
                className="group flex h-full flex-col gap-3 border border-border/60 bg-card/40 p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-semibold group-hover:text-primary">{TRACKS[id].title}</h3>
                  <span className="font-mono text-xs text-primary">
                    {done}/{total} done
                  </span>
                </div>
                <p className="text-base leading-7 text-muted-foreground">{TRACKS[id].summary}</p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
