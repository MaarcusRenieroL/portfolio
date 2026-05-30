import { ScrambleText } from "./scramble-text";

type SectionHeadingProps = {
  index: string;
  title: string;
  description: string;
  eyebrow?: string;
};

export function SectionHeading({
  index,
  title,
  description,
  eyebrow,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 border-l border-primary/50 pl-4">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
        <span className="text-primary">{index}</span>
        <span className="h-px w-8 bg-border" aria-hidden="true" />
        {eyebrow && <span>{eyebrow}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <ScrambleText text={title} />
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
