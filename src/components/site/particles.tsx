"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; vx: number; vy: number; r: number };

const MAX_DOTS = 64;
const MAX_DOTS_SMALL = 26;
const LINK_DISTANCE = 150;
const MAX_DPR = 1.5;
/** Dots fade out over the reading column on wide screens so they never sit behind text. */
const COLUMN_HALF = 470;
const FADE = 70;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A quiet constellation behind the page: a few slow dots, joined by hairlines
 * when they drift close. It exists to give the page depth, not to be watched.
 *
 * Off (nothing mounted, no frames) for reduced motion, data-saver, and low-core or
 * low-memory devices. Paused while the tab is hidden. Capped at 64 dots and 1.5x
 * pixel ratio. Colours come from the theme tokens and follow theme changes.
 */
export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowPower = nav.connection?.saveData === true || (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
    if (lowPower) {
      canvas.hidden = true;
      return;
    }

    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let last = 0;
    let dot = "#808080";
    let accent = "#4ade80";
    let light = false;

    const readTheme = () => {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      dot = cs.getPropertyValue("--fg-3").trim() || dot;
      accent = cs.getPropertyValue("--green").trim() || accent;
      const set = root.dataset.theme;
      light = set ? set === "light" : !dark.matches;
    };

    /** On wide screens the dots live in the two side margins and bounce off the reading column. */
    const wide = () => w >= 1100;
    const margin = () => Math.max(0, w / 2 - COLUMN_HALF);
    const seed = () => {
      const count = w < 700 ? MAX_DOTS_SMALL : wide() ? Math.min(MAX_DOTS, Math.round((2 * margin() * h) / 9000)) : Math.min(MAX_DOTS, Math.round((w * h) / 28000));
      dots = Array.from({ length: count }, (_, i) => ({
        x: wide() ? (i % 2 ? w - Math.random() * margin() : Math.random() * margin()) : Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.4,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduce.matches) return;
      draw();
    };

    /** 1 in the side margins, 0 over the reading column (wide screens only). */
    const visibility = (x: number) => {
      if (w < 1100) return 1;
      return clamp01((Math.abs(x - w / 2) - COLUMN_HALF) / FADE);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const base = light ? 0.55 : 0.5;
      ctx.fillStyle = dot;
      ctx.strokeStyle = accent;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        const va = visibility(a.x) * (w < 700 ? 0.55 : 1);
        if (va > 0) {
          ctx.globalAlpha = base * va;
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue;
          const vis = Math.min(va, visibility(b.x) * (w < 700 ? 0.55 : 1));
          if (vis <= 0) continue;
          ctx.globalAlpha = (light ? 0.22 : 0.2) * (1 - Math.sqrt(d2) / LINK_DISTANCE) * vis;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const step = (t: number) => {
      const dt = Math.min(t - last || 16, 50) / 16;
      last = t;
      for (const p of dots) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (wide()) {
          const m = margin();
          const left = p.x < w / 2;
          const lo = left ? 0 : w - m;
          const hi = left ? m : w;
          if (p.x < lo || p.x > hi) {
            p.vx *= -1;
            p.x = Math.min(hi, Math.max(lo, p.x));
          }
        } else if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const running = () => !reduce.matches && !document.hidden;
    const start = () => {
      if (frame || !running()) return;
      last = 0;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => {
      if (reduce.matches) {
        stop();
        ctx.clearRect(0, 0, w, h);
        canvas.hidden = true;
        return;
      }
      canvas.hidden = false;
      running() ? start() : stop();
    };
    const retheme = () => {
      readTheme();
      if (!frame && !reduce.matches) draw();
    };

    readTheme();
    resize();
    sync();

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    dark.addEventListener("change", retheme);
    const watch = new MutationObserver(retheme);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      dark.removeEventListener("change", retheme);
      watch.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
