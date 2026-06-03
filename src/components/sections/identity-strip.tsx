import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { IdentityPanel } from "~/components/misc/identity-panel";

export function IdentityStrip() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.58fr] lg:items-stretch">
      <IdentityPanel compact />

      <div className="flex flex-col justify-between gap-4 border border-border/60 bg-background/45 p-5">
        <div>
          <p className="text-xs font-semibold text-primary">signal</p>
          <h2 className="mt-2 text-2xl font-semibold">proof over polish</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            this site is built to show the work, the decisions, and the way i
            keep improving the system around the work.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/about"
            className="inline-flex h-9 items-center gap-2 border border-border/60 bg-card/35 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            about me
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex h-9 items-center gap-2 border border-primary/45 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            project proof
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
