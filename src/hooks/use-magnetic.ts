"use client";

import { useMotionValue, useSpring } from "motion/react";
import type { MouseEvent } from "react";

/**
 * Mouse-follow "magnetic" pull, shared by every interactive button/link
 * on the site (originally introduced on the hero's "see the work" CTA).
 */
export function useMagnetic() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { x: sx, y: sy, onMouseMove, onMouseLeave };
}
