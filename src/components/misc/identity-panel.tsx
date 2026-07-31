import Image from "next/image";
import { CameraIcon, MapPinnedIcon, SparklesIcon, HeartIcon, CodeIcon } from "lucide-react";

import { PROFILE } from "~/lib/constants";

type IdentityPanelProps = {
  compact?: boolean;
};

const stats = [
  { label: "years coding", value: "6+" },
  { label: "shipped projects", value: "4" },
  { label: "coffee/day", value: "3" },
  { label: "based in", value: "chennai" },
];

const infoRows = [
  { label: "base", value: "chennai, india", icon: MapPinnedIcon },
  { label: "current", value: "developer 1 - software engineering", icon: SparklesIcon },
  { label: "mode", value: "focused builds and long-term systems", icon: HeartIcon },
  { label: "stack pref", value: "typescript, react, node, postgres", icon: CodeIcon },
];

export function IdentityPanel({ compact = false }: IdentityPanelProps) {
  return (
    <aside className="overflow-hidden border border-border/60 bg-card/40">
      <div className="grid gap-0 lg:grid-cols-[0.65fr_1fr]">
        <div className="relative flex flex-col justify-between gap-6 border-b border-border/60 bg-background/50 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between text-xs font-medium text-primary">
            <span>portrait</span>
            <CameraIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="grid place-items-center py-2">
            {PROFILE.headshot ? (
              <div className="relative size-28 overflow-hidden border border-primary/45">
                <Image
                  src={PROFILE.headshot}
                  alt="maarcus reniero l"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="grid size-28 place-items-center border-2 border-primary/50 bg-primary/10 font-mono text-4xl font-bold text-primary shadow-[inset_0_0_60px_rgba(74,222,128,0.15)]">
                mr
              </div>
            )}
          </div>

          {!compact && (
            <div className="grid grid-cols-2 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="border border-border/60 bg-background/60 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-primary">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              identity
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              maarcus reniero l
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              full-stack developer from chennai building range across product,
              systems, tooling, and the craft behind maintainable software.
            </p>
          </div>

          <div className="grid gap-2">
            {infoRows.slice(0, compact ? 2 : 4).map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid grid-cols-[1.5rem_1fr] items-start gap-3 border border-border/60 bg-background/50 p-3 transition-colors hover:border-primary/40"
              >
                <Icon className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
