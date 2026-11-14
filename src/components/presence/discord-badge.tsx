"use client";

import { useEffect, useState } from "react";

interface DiscordInfo {
  status: "online" | "idle" | "dnd" | "offline";
  customStatus?: string;
  activity?: {
    name: string;
    details?: string;
    state?: string;
  } | null;
}

export function DiscordBadge() {
  const [discord, setDiscord] = useState<DiscordInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/presence/discord");
        if (res.ok) {
          const data: DiscordInfo = await res.json();
          if (!cancelled) setDiscord(data);
        }
      } catch {
        /* ignore */
      }
    };

    void fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const statusColor =
    discord?.status === "online"
      ? "bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
      : discord?.status === "idle"
      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
      : discord?.status === "dnd"
      ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
      : "bg-neutral-600";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-neutral-800/80 bg-[#070b09]/90 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-neutral-700"
      title={
        discord?.activity?.name
          ? `${discord.status}: ${discord.activity.name} (${discord.activity.details || ""})`
          : `Discord: ${discord?.status || "online"}`
      }
    >
      <span className={`h-2 w-2 rounded-full ${statusColor}`} />
      <span className="font-mono text-[11px] text-neutral-400">
        {discord?.activity?.name ? (
          <span className="text-neutral-200">
            {discord.activity.name}
          </span>
        ) : (
          discord?.status || "online"
        )}
      </span>
    </div>
  );
}
