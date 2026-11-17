"use client";

import { useEffect, useState } from "react";

/** The presence fields the badge shows, as served (trimmed) by /api/presence. */
export interface LanyardActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
}

export interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  listening_to_spotify: boolean;
  spotify: { song: string; artist: string; track_id?: string } | null;
  activities: LanyardActivity[];
}

/**
 * Polls this site's own /api/presence every 30 seconds while the tab is visible.
 * The browser never talks to Lanyard directly, so no visitor IP reaches it.
 */
export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch("/api/presence");
          if (res.ok && live) setData((await res.json()) as LanyardData);
        } catch {
          /* keep the last known state */
        }
      }
      if (live) timer = setTimeout(load, 30_000);
    };
    void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        void load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return data;
}
