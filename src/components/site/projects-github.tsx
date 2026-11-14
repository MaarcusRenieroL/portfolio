"use client";

import { useEffect, useState } from "react";
import { GitBranch, Star, RefreshCw } from "lucide-react";
import type { GitHubRepo } from "~/app/api/github/repos/route";

export function GitHubMetricsBar() {
  const [data, setData] = useState<{ repos: GitHubRepo[]; totalStars: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/github/repos");
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            setData(json);
            setIsLoading(false);
          }
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono py-1">
        <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
        <span>Syncing GitHub telemetry…</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 py-2 text-xs font-mono">
      <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-1 text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>GitHub Live Sync</span>
      </div>

      <div className="inline-flex items-center gap-1.5 text-neutral-400">
        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
        <span className="text-neutral-200 font-semibold">{data.totalStars}</span>
        <span>stargazers</span>
      </div>

      <div className="inline-flex items-center gap-1.5 text-neutral-400">
        <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-neutral-200 font-semibold">{data.repos.length}</span>
        <span>repositories</span>
      </div>
    </div>
  );
}
