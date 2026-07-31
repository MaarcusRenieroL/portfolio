import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type Props = {
  index: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ index, eyebrow, title, description, action }: Props) {
  return (
    <Reveal>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <span className="tabular-nums">{index}</span>
            <span className="h-px w-8 bg-primary/60" />
            {eyebrow && <span className="text-muted-foreground">{eyebrow}</span>}
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
    </Reveal>
  );
}
