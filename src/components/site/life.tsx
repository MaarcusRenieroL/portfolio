"use client";

import { useEffect } from "react";

/**
 * The small things that make the page feel alive, in one place:
 * a spotlight that follows the pointer, tiles that lean toward it, and
 * numbers that count up when they scroll into view. Renders nothing.
 * Everything is skipped for reduced motion, and the page works without it.
 */
export function Life() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanup: (() => void)[] = [];

    if (!calm && fine) {
      const root = document.documentElement;
      let frame = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          root.style.setProperty("--mx", `${e.clientX}px`);
          root.style.setProperty("--my", `${e.clientY}px`);
        });

        const tile = (e.target as Element | null)?.closest<HTMLElement>(".shot");
        if (!tile) return;
        const r = tile.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tile.dataset.tilting = "";
        tile.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        tile.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
      };
      const leave = (e: PointerEvent) => {
        const tile = (e.target as Element | null)?.closest<HTMLElement>(".shot");
        if (!tile) return;
        delete tile.dataset.tilting;
        tile.style.removeProperty("--rx");
        tile.style.removeProperty("--ry");
      };
      document.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerout", leave, { passive: true });
      cleanup.push(() => {
        cancelAnimationFrame(frame);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerout", leave);
      });
    }

    if (!calm) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io.unobserve(entry.target);
            const el = entry.target as HTMLElement;
            const to = Number(el.dataset.count);
            const decimals = Number(el.dataset.decimals ?? 0);
            const prefix = el.dataset.prefix ?? "";
            const start = performance.now();
            const run = (now: number) => {
              const t = Math.min((now - start) / 900, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              el.textContent = prefix + (to * eased).toFixed(decimals);
              if (t < 1) requestAnimationFrame(run);
            };
            requestAnimationFrame(run);
          }
        },
        { threshold: 0.6 },
      );
      document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
      cleanup.push(() => io.disconnect());
    }

    return () => cleanup.forEach((fn) => fn());
  }, []);

  return null;
}
