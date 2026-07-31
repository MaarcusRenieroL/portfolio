import { SectionHeading } from "~/components/misc/section-heading";
import { StackExplorer } from "~/components/sections/stack-explorer";
import { STACK_GROUPS } from "~/lib/constants";

export default function StackPage() {
  const total = STACK_GROUPS.reduce((n, g) => n + g.items.length, 0);

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="04"
        title="stack"
        eyebrow="tools and range"
        description="the tools i use, the systems i am comfortable around, and the edges i am actively sharpening."
        action={
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {total} entries
          </span>
        }
      />

      <StackExplorer groups={STACK_GROUPS} />
    </section>
  );
}
