import { CameraIcon, MapPinnedIcon, SparklesIcon } from "lucide-react";

type IdentityPanelProps = {
  compact?: boolean;
};

export function IdentityPanel({ compact = false }: IdentityPanelProps) {
  return (
    <aside className="overflow-hidden border border-border/60 bg-card/35">
      <div className="grid gap-0 sm:grid-cols-[0.9fr_1fr]">
        <div className="relative min-h-56 border-b border-border/60 bg-background/45 p-4 sm:border-b-0 sm:border-r">
          <div className="absolute inset-x-0 top-0 h-px bg-primary/45" />
          <div className="flex h-full min-h-48 flex-col justify-between border border-border/60 bg-card/35 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">portrait</span>
              <CameraIcon className="size-4 text-muted-foreground" />
            </div>

            <div className="grid place-items-center">
              <div className="grid size-28 place-items-center border border-primary/45 bg-primary/10 text-4xl font-bold text-primary">
                mr
              </div>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              chennai / full-stack / focused builds
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold text-primary">identity</p>
            <h2 className="mt-2 text-2xl font-semibold">maarcus reniero l</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              full-stack developer from chennai building range across product,
              systems, tooling, and the craft behind maintainable software.
            </p>
          </div>

          <div className="grid gap-2">
            {[
              { label: "base", value: "chennai, india", icon: MapPinnedIcon },
              {
                label: "current",
                value: "developer 1 - software engineering",
                icon: SparklesIcon,
              },
              {
                label: "mode",
                value: "focused builds and long-term systems",
                icon: SparklesIcon,
              },
            ].slice(0, compact ? 2 : 3).map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid grid-cols-[1.75rem_1fr] gap-3 border border-border/60 bg-background/45 p-3"
              >
                <Icon className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
