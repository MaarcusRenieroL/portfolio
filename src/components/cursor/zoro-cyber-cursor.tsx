"use client";

import { useEffect, useRef, useState } from "react";

type TrailPoint = { x: number; y: number; alpha: number };

/**
 * Anime cursor: a HUD reticle (corner brackets, spinning dashed ring, centre dot)
 * that follows the pointer, a fading green katana trail drawn on a canvas, and a
 * slash flash on click. The native cursor stays visible underneath for precision.
 *
 * Mouse/trackpad only (never on touch), off for reduced motion, and the frame loop
 * sleeps once the trail has faded, so an idle page costs nothing.
 */
export function ZoroCyberCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [slashing, setSlashing] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setEnabled(true);

    const mouse = { x: -100, y: -100 };
    let trail: TrailPoint[] = [];
    let frame = 0;
    let shown = false;
    let drawn = false;
    let green = "#4ade80";
    const readGreen = () => {
      green = getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || green;
    };
    readGreen();
    // The theme toggle flips data-theme on <html>: pick up the new accent.
    const themeWatch = new MutationObserver(readGreen);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const loop = () => {
      frame = 0;
      const el = cursorRef.current;
      if (el && shown) el.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
          canvas.width = innerWidth;
          canvas.height = innerHeight;
        }
        if (trail.length) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawn = true;
          const pts = [...trail, { x: mouse.x, y: mouse.y, alpha: 1 }];
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = green;
          ctx.shadowColor = green;
          for (let i = 0; i < pts.length - 1; i++) {
            const progress = i / (pts.length - 1); // 0 at the tail, 1 at the cursor
            ctx.globalAlpha = Math.max(0, pts[i].alpha * progress * 0.75);
            ctx.lineWidth = 0.8 + progress * 1.6;
            ctx.shadowBlur = progress > 0.5 ? 4 : 0;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          trail = trail.map((p) => ({ ...p, alpha: p.alpha * 0.91 })).filter((p) => p.alpha > 0.05);
        } else if (drawn) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawn = false;
        }
      }
      // Keep animating only while there is a trail left to fade.
      if (trail.length || drawn) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!shown) {
        shown = true;
        setVisible(true);
      }
      trail.push({ x: e.clientX, y: e.clientY, alpha: 1 });
      if (trail.length > 26) trail.shift();
      const target = e.target instanceof Element ? e.target : null;
      setHovering(Boolean(target?.closest('a, button, input, textarea, select, [role="button"], .chip, .action, .shot, .contrib-cell, kbd')));
      wake();
    };
    const onDown = () => {
      setClicking(true);
      setSlashing(true);
      setTimeout(() => setSlashing(false), 200);
    };
    const onUp = () => setClicking(false);
    const onLeave = () => {
      shown = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      themeWatch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className={`zoro-cursor ${visible ? "is-visible" : "is-hidden"}`} aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[9998] select-none" />
      <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-[10000] select-none" style={{ willChange: "transform" }}>
        <div className={`relative flex items-center justify-center transition-all duration-200 ease-out ${hovering ? "h-11 w-11" : "h-7 w-7"} ${clicking ? "scale-75" : "scale-100"}`}>
          <span className="hud-corner hud-top-left" />
          <span className="hud-corner hud-top-right" />
          <span className="hud-corner hud-bottom-left" />
          <span className="hud-corner hud-bottom-right" />
          <div className={`zoro-ring ${hovering ? "is-hot" : ""}`} />
          {hovering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-full w-px rotate-45 bg-[var(--green)] opacity-20" />
              <span className="h-full w-px -rotate-45 bg-[var(--green)] opacity-20" />
            </div>
          )}
          <span className="absolute h-1.5 w-1.5 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)]" />
          <span className="absolute h-3 w-px bg-[var(--green)] opacity-70" />
          <span className="absolute h-px w-3 bg-[var(--green)] opacity-70" />
          {slashing && <span className="katana-slash-beam absolute h-10 w-[2px] bg-white shadow-[0_0_14px_var(--green)]" />}
        </div>
      </div>
    </div>
  );
}
