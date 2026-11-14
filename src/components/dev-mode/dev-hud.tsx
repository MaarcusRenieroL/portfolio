"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, Layers } from "lucide-react";

export function DevModeHud() {
  const [enabled, setEnabled] = useState(false);
  const [hydrationTime, setHydrationTime] = useState(12);

  useEffect(() => {
    // Measure hydration
    if (typeof window !== "undefined" && window.performance) {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry && navEntry.domContentLoadedEventEnd) {
        setHydrationTime(Math.max(8, Math.round(navEntry.domContentLoadedEventEnd - navEntry.responseEnd)));
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        setEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Dev Mode Floating Toggle Pill */}
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`fixed top-4 right-4 z-40 hidden md:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono transition-all backdrop-blur-md ${
          enabled
            ? "border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.25)]"
            : "border-neutral-800 bg-[#070b09]/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        }`}
        title="Toggle Developer Telemetry HUD (Ctrl+Shift+D)"
      >
        <Cpu className="h-3 w-3 text-emerald-400" />
        <span>Dev Mode: {enabled ? "ON" : "OFF"}</span>
      </button>

      {/* When Enabled: Floating Telemetry Panel */}
      {enabled && (
        <aside
          aria-label="Developer Telemetry HUD"
          className="fixed top-14 right-4 z-40 w-72 rounded-xl border border-emerald-500/30 bg-[#060a08]/95 p-3.5 shadow-2xl backdrop-blur-xl font-mono text-[11px] text-neutral-300 animate-in fade-in duration-150 space-y-2.5"
        >
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Activity className="h-3.5 w-3.5" />
              <span>Runtime Telemetry</span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(false)}
              className="text-neutral-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-neutral-400">
            <div className="flex justify-between">
              <span>Framework</span>
              <span className="text-neutral-200">Next.js 16.4 App Router</span>
            </div>
            <div className="flex justify-between">
              <span>Renderer</span>
              <span className="text-neutral-200">React 19.3 (Streaming)</span>
            </div>
            <div className="flex justify-between">
              <span>Hydration Time</span>
              <span className="text-emerald-400 font-semibold">{hydrationTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Strategy</span>
              <span className="text-neutral-200">ISR + Server Action</span>
            </div>
            <div className="flex justify-between">
              <span>Styling System</span>
              <span className="text-neutral-200">Tailwind v4 + shadcn</span>
            </div>
          </div>

          <div className="pt-1 border-t border-neutral-800/80 flex items-center gap-1.5 text-[10px] text-neutral-400">
            <Layers className="h-3 w-3 text-emerald-400" />
            <span>Hotkeys: Ctrl+Shift+D to toggle HUD</span>
          </div>
        </aside>
      )}
    </>
  );
}
