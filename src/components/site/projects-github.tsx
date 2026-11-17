"use client";

import { useMemo } from "react";
import {
  GitBranch,
  Star,
  GitFork,
  Activity,
} from "lucide-react";
import type { GitHubData } from "~/lib/server/github-repos";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { useDict, useLang } from "~/components/site/locale";
import { SITE } from "~/lib/site";

/** "3d ago" / "vor 3 Tagen", in the page language. */
function timeAgo(iso: string, locale: string): string {
  const secs = (new Date(iso).getTime() - Date.now()) / 1000;
  if (!Number.isFinite(secs)) return "";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["second", 60], ["minute", 60], ["hour", 24], ["day", 7], ["week", 4.35], ["month", 12], ["year", Infinity]];
  let v = secs;
  for (const [unit, size] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return "";
}

export function GitHubMetricsBar({
  data,
  onSelectLanguage,
  selectedLanguage,
  viewAllRepos,
  onToggleViewAllRepos,
}: {
  /** Fetched on the server with the page. */
  data: GitHubData;
  onSelectLanguage?: (lang: string | null) => void;
  selectedLanguage?: string | null;
  viewAllRepos?: boolean;
  onToggleViewAllRepos?: (show: boolean) => void;
}) {
  const t = useDict().gh;
  const locale = useLang() === "de" ? "de-DE" : "en-US";
  const stats = useMemo(() => {
    if (!data?.repos) return null;
    const repos = data.repos;
    const totalStars = data.totalStars || repos.reduce((a, r) => a + r.stars, 0);
    const totalForks = repos.reduce((a, r) => a + r.forks, 0);
    const originalCount = repos.filter((r) => !r.isFork).length;
    const forkedCount = repos.filter((r) => r.isFork).length;

    // Language aggregation
    const langCounts: Record<string, number> = {};
    repos.forEach((r) => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });
    const totalWithLang = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({
        lang,
        count,
        percent: Math.round((count / (totalWithLang || 1)) * 100),
      }));

    // Latest active repo
    const sortedByUpdate = [...repos].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const latest = sortedByUpdate[0];

    return {
      totalStars,
      totalForks,
      totalRepos: repos.length,
      originalCount,
      forkedCount,
      languages,
      latest,
    };
  }, [data]);

  // No repos (GitHub down or rate-limited): show nothing rather than a bar of zeros.
  if (!stats || stats.totalRepos === 0) return null;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--hover)]/30 p-3 sm:p-3.5 transition-colors">
        {/* Top Line: Live Sync Status + Metrics + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Status identity with portfolio green dot */}
          <div className="flex items-center gap-2">
            <span className="dot" aria-hidden="true" />
            <span className="font-mono text-xs text-[var(--fg-2)]">
              {t.title} ·{" "}
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-link underline underline-offset-2 hover:text-[var(--green)] transition-colors text-[var(--fg)]"
              >
                @{SITE.github.split("/").pop()}
              </a>
            </span>
          </div>

          {/* Key Metrics: Stars, Repos, Forks */}
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--fg-3)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-default">
                  <Star className="h-3 w-3" />
                  <strong className="text-[var(--fg)] font-medium">
                    {stats.totalStars}
                  </strong>{" "}
                  {t.stars}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.starsTip}
              </TooltipContent>
            </Tooltip>

            <span className="text-[var(--line-2)]">·</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-default">
                  <GitBranch className="h-3 w-3" />
                  <strong className="text-[var(--fg)] font-medium">
                    {stats.totalRepos}
                  </strong>{" "}
                  {t.repos}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.reposTip(stats.originalCount, stats.forkedCount)}
              </TooltipContent>
            </Tooltip>

            <span className="hidden text-[var(--line-2)] sm:inline">·</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="hidden sm:inline-flex items-center gap-1 cursor-default">
                  <GitFork className="h-3 w-3" />
                  <strong className="text-[var(--fg)] font-medium">
                    {stats.totalForks}
                  </strong>{" "}
                  {t.forks}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.forksTip}
              </TooltipContent>
            </Tooltip>

          </div>
        </div>

        {/* Hairline Divider */}
        <div className="h-px w-full bg-[var(--line)]" />

        {/* Bottom Line: Stack Breakdown & Latest Push Activity */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
          {/* Primary Languages Breakdown */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="w-full text-[var(--fg-3)] sm:mr-0.5 sm:w-auto">{t.stack}</span>
            {stats.languages.slice(0, 5).map((l) => {
              const isSelected = selectedLanguage === l.lang;
              return (
                <Button
                  key={l.lang}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  type="button"
                  onClick={() =>
                    onSelectLanguage?.(isSelected ? null : l.lang)
                  }
                  className={`h-6 rounded-md border px-2 text-[11px] font-mono pointer-coarse:h-8 ${
                    isSelected
                      ? "border-[var(--green)] bg-[var(--green)] text-[var(--green-ink)] font-medium"
                      : "border-[var(--line)] text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                  }`}
                >
                  {l.lang}{" "}
                  <span className={isSelected ? "opacity-90" : "opacity-60"}>
                    {l.percent}%
                  </span>
                </Button>
              );
            })}
            {selectedLanguage && (
              <Button
                variant="link"
                type="button"
                onClick={() => onSelectLanguage?.(null)}
                className="h-auto p-0 text-[10px] text-[var(--green)] hover:underline ml-1"
              >
                {t.clear}
              </Button>
            )}
          </div>

          {/* Right: Latest Push & Scope Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] text-[var(--fg-3)] sm:justify-end">
            {stats.latest && (
              <span className="min-w-0">
                {t.latest}{" "}
                <a
                  href={stats.latest.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh-link text-[var(--fg-2)] hover:text-[var(--green)] transition-colors underline underline-offset-2"
                >
                  {stats.latest.name}
                </a>{" "}
                <span className="opacity-60">
                  · {timeAgo(stats.latest.updatedAt, locale)}
                </span>
              </span>
            )}

            {onToggleViewAllRepos && (
              <div className="inline-flex items-center rounded-md border border-[var(--line)] p-0.5" role="group" aria-label={t.scope}>
                {([false, true] as const).map((all) => (
                  <Button
                    key={String(all)}
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onToggleViewAllRepos(all)}
                    aria-pressed={viewAllRepos === all}
                    className={`h-6 rounded px-2 text-[11px] font-mono pointer-coarse:h-8 ${
                      viewAllRepos === all ? "bg-[var(--hover)] text-[var(--green)] font-medium" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                    }`}
                  >
                    {all ? t.all(stats.totalRepos) : t.curated}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
