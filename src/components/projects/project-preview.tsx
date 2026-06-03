import { ActivityIcon, BoxesIcon, Code2Icon, TerminalIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Project } from "~/lib/types";
import { formatDuration } from "~/lib/data/projects";

type ProjectPreviewProps = {
  project: Project;
  compact?: boolean;
};

const previewMeta = {
  terminal: {
    icon: TerminalIcon,
    label: "cli system",
  },
  dashboard: {
    icon: ActivityIcon,
    label: "interface",
  },
  editor: {
    icon: Code2Icon,
    label: "codebase",
  },
  system: {
    icon: BoxesIcon,
    label: "product system",
  },
};

export function ProjectPreview({ project, compact = false }: ProjectPreviewProps) {
  const meta = previewMeta[project.preview];
  const Icon = meta.icon;
  const initials = project.title
    .split(/[\s-]+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
  const featuredSkills = project.skills.slice(0, compact ? 3 : 4);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-56 flex-col overflow-hidden border border-border/70 bg-background/55",
        compact && "min-h-48",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-card/45 px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <span className="text-xs font-medium text-foreground">{meta.label}</span>
        </div>

        <span className="text-[10px] text-muted-foreground">
          {project.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-4">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="grid size-20 place-items-center border border-primary/45 bg-primary/10 text-3xl font-bold text-primary">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              {project.category}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/90">
              {project.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border border-border/60 bg-card/35 text-xs">
          <div className="border-r border-border/60 p-3">
            <p className="text-muted-foreground">duration</p>
            <p className="mt-1 font-medium text-foreground">
              {formatDuration(project)}
            </p>
          </div>

          <div className="p-3">
            <p className="text-muted-foreground">mode</p>
            <p className="mt-1 font-medium text-foreground">{project.status}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            key stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {featuredSkills.map((skill, index) => (
              <span
                key={skill}
                className={cn(
                  "border border-border/50 bg-secondary/60 px-2 py-1 text-[10px] text-secondary-foreground/85",
                  index === 0 && "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="border-l border-primary/45 pl-3">
            <p className="text-xs font-semibold text-muted-foreground">
              proof point
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-foreground/80">
              {project.outcome[0]}
            </p>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-primary/40" />
    </div>
  );
}
