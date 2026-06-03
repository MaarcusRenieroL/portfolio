import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { NOW_ITEMS } from "~/lib/constants";

export default function NowPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="05"
        title="now"
        eyebrow="current signal"
        description="a small snapshot of what has my attention right now: work, builds, learning loops, and life outside the editor."
      />

      <div className="grid gap-4">
        {NOW_ITEMS.map((item, index) => (
          <article
            key={item.title}
            className="grid gap-4 border border-border/60 bg-card/35 p-5 transition-colors hover:border-primary/45 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
          >
            <span className="text-2xl font-bold text-primary/75">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <span className="border border-border/60 bg-background/55 px-2 py-1 text-[10px] text-muted-foreground">
                  {item.meta}
                </span>
              </div>

              <p className="text-sm leading-7 text-foreground/85">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/projects/zentro"
          className="inline-flex items-center gap-2 border border-border/60 bg-background/55 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          view zentro
          <ArrowUpRightIcon className="size-4" />
        </Link>

        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 border border-border/60 bg-background/55 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          read notes
          <ArrowUpRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
