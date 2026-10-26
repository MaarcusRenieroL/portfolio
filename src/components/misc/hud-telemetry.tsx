"use client";

import { useEffect, useState } from "react";
import { ActivityIcon, ClockIcon, CompassIcon } from "lucide-react";

export function HudTelemetry() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [scrollPos, setScrollPos] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      // Chennai, India (IST, UTC+5:30)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTimeStr(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // one update per frame, and only when the rounded percentage changes
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable > 0) {
          setScrollPos(Math.round((window.scrollY / scrollable) * 100));
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(interval);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border/50 bg-card/25 px-4 py-2 font-mono text-[11px] text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <ClockIcon className="size-3.5 text-primary" />
        <span>CHENNAI [IST]:</span>
        <span className="text-foreground font-semibold tabular-nums">{timeStr || "10:00:00 AM"}</span>
      </div>

      <div className="hidden items-center gap-1.5 sm:flex">
        <ActivityIcon className="size-3.5 text-primary animate-pulse" />
        <span>STATUS:</span>
        <span className="text-primary font-medium">SYS_ONLINE [24ms]</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 ml-auto">
        <CompassIcon className="size-3.5 text-primary" />
        <span>TELEMETRY:</span>
        <span className="text-foreground tabular-nums">{scrollPos}% SCROLL</span>
      </div>
    </div>
  );
}
