"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, Code2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDict, useLocalePath } from "~/components/site/locale";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { computeSkillUsage } from "~/lib/skill-match";
import { useSkillUsageData } from "./skill-usage";

/**
 * A skill name that opens "where I used this": the jobs and projects that list it.
 * The trigger is a real <button>, so it works from the keyboard. Skills with no
 * recorded usage render as plain text.
 */
export function SkillCrosslink({
  skill,
  children,
  onSkillSelect,
  className,
}: {
  skill: string;
  children: React.ReactNode;
  onSkillSelect?: (skill: string) => void;
  className?: string;
}) {
  const t = useDict().skills;
  const href = useLocalePath();
  const [open, setOpen] = useState(false);
  const data = useSkillUsageData();
  const usage = useMemo(() => computeSkillUsage(skill, data), [skill, data]);

  if (!usage.roles.length && !usage.projects.length) return <span className={className}>{children}</span>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={`skill-link ${className ?? ""}`} onClick={() => onSkillSelect?.(skill)} aria-label={t.usage(skill)}>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-3.5 text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
          <span className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" aria-hidden="true" />
            {skill}
          </span>
          <Link
            href={href(`/skills?q=${encodeURIComponent(skill)}`)}
            className="text-[11px] text-[var(--green)] hover:underline inline-flex items-center gap-0.5"
            onClick={() => setOpen(false)}
          >
            {t.showAll}
            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        {usage.roles.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-3)] flex items-center gap-1">
              <Briefcase className="w-3 h-3" aria-hidden="true" />
              {t.usedIn(usage.roles.length)}
            </div>
            <ul className="space-y-1">
              {usage.roles.map((r) => (
                <li key={r.org} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="font-medium text-[var(--fg)]">{r.org}</span>
                  <span className="text-[10px] text-[var(--fg-3)] truncate max-w-[130px]">{r.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {usage.projects.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-[var(--line)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-3)] flex items-center gap-1">
              <Code2 className="w-3 h-3" aria-hidden="true" />
              {t.builtIn(usage.projects.length)}
            </div>
            <ul className="space-y-1">
              {usage.projects.map((p) => (
                <li key={p.slug} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <Link
                    href={href(`/projects?q=${encodeURIComponent(p.name)}`)}
                    className="font-medium text-[var(--fg)] hover:text-[var(--green)] transition-colors inline-flex items-center gap-1"
                    onClick={() => setOpen(false)}
                  >
                    {p.name}
                    <ArrowUpRight className="w-2.5 h-2.5 text-[var(--fg-3)]" aria-hidden="true" />
                  </Link>
                  <span className="text-[10px] text-[var(--fg-3)]">{p.kind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
