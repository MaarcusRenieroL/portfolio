"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth scrolling (Lenis). Entrances and scroll reveals are plain CSS in
 * globals.css (they run from first paint, never hide content before
 * hydration, and are off for reduced motion), so this is the only motion
 * that needs JavaScript.
 */
export function Motion() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({ lerp: 0.09, anchors: true });
      const raf = (t: number) => {
        lenis?.raf(t);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };
    const sync = () => (calm.matches ? stop() : start());

    sync();
    calm.addEventListener("change", sync);
    return () => {
      calm.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
