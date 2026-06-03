import { SectionHeading } from "~/components/misc/section-heading";
import { STACK_GROUPS } from "~/lib/constants";

export default function StackPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="04"
        title="stack"
        eyebrow="tools and range"
        description="the tools i use, the systems i am comfortable around, and the edges i am actively sharpening."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {STACK_GROUPS.map((group) => (
          <article
            key={group.title}
            className="border border-border/60 bg-card/35 p-5 transition-colors hover:border-primary/45"
          >
            <div className="mb-5">
              <p className="text-xs font-semibold text-primary">
                {group.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{group.title}</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="border border-border/60 bg-background/55 px-2.5 py-1.5 text-xs text-foreground/90"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="grid gap-4 border border-border/60 bg-background/45 p-5 md:grid-cols-3">
        {[
          ["frontend", "interfaces that stay usable after the first impression"],
          ["backend", "typed contracts, access boundaries, and reliable workflows"],
          ["product", "small decisions that make software easier to ship and explain"],
        ].map(([label, text]) => (
          <div key={label}>
            <p className="text-xs font-semibold text-primary">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </section>
  );
}
