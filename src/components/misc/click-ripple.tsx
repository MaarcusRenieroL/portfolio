"use client";

import { useEffect, useState } from "react";
import { playThock } from "~/lib/audio";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

export function ClickRipple() {
  const [ripples, setRipples] = useState<ClickEffect[]>([]);

  useEffect(() => {
    let nextId = 0;
    const handleClick = (e: MouseEvent) => {
      // Don't spawn on dragging or zero coords
      if (e.clientX === 0 && e.clientY === 0) return;

      playThock();

      const newRipple = {
        id: nextId++,
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev.slice(-8), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 750);
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute"
          style={{
            left: r.x,
            top: r.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Cyber Expanding Ripple Ring */}
          <div className="size-8 rounded-full border border-primary/70 animate-ping opacity-75" />
          <div className="absolute inset-0 size-8 rounded-full border border-primary/40 animate-pulse" />

          {/* Micro Coordinate Tag */}
          <span className="absolute left-4 -top-3 font-mono text-[9px] text-primary/80 tracking-wider whitespace-nowrap animate-out fade-out slide-out-to-top duration-700">
            [{Math.round(r.x)}, {Math.round(r.y)}]
          </span>
        </div>
      ))}
    </div>
  );
}
