"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./hero-scene"), { ssr: false });

/**
 * Client-side hero behaviour: cursor parallax (CSS vars), scroll-linked name
 * drift, and the WebGL scene lazy-loaded after LCP (tier 2 + WebGL2 only).
 */
export function HeroFx() {
  const [scene, setScene] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    if (!hero) return;
    const tier = document.documentElement.dataset.tier;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (tier === "0") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--px", String(((e.clientX - r.left) / r.width) * 2 - 1));
        hero.style.setProperty("--py", String(((e.clientY - r.top) / r.height) * 2 - 1));
      });
    };
    const onScroll = () => {
      if (tier === "0") return;
      const y = Math.min(window.scrollY, hero.offsetHeight);
      hero.style.setProperty("--sy", String(y));
      hero.style.setProperty("--sp", String(Math.min(1, y / (hero.offsetHeight * 0.6))));
    };
    if (matchMedia("(pointer: fine)").matches) hero.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let idle = 0;
    if (tier === "2") {
      const start = () => {
        try {
          const ok = !!document.createElement("canvas").getContext("webgl2");
          if (ok) setScene(true);
        } catch {}
      };
      const arm = () => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 2500 });
        else idle = globalThis.setTimeout(start, 1200) as unknown as number;
      };
      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });
    }

    return () => {
      hero.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      if (idle) { if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle); else clearTimeout(idle); }
    };
  }, []);

  return scene ? <Scene /> : null;
}
