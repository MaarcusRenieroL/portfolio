"use client";

import { useEffect, useState } from "react";
import { SpotifyBar } from "./spotify-bar";
import { DiscordBadge } from "./discord-badge";

export function LiveTelemetry() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 bg-[#060a08]/90 py-3 px-4 text-xs backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2.5">
        <SpotifyBar />
        <DiscordBadge />
      </div>

      <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Chennai, IN {time ? `· ${time} IST` : ""}</span>
      </div>
    </div>
  );
}
