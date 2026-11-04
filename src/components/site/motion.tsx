"use client";

import Lenis from "lenis";
import { animate, inView, stagger } from "motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Rows that scroll into view one by one. List pages animate their own rows. */
const REVEAL = ".h2, .leader, .job, .item, .facts > div, .stats > div, .shot-fig, .pager a, .tl > li, .skillrow, .contact-block, .related";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Smooth scrolling (Lenis) plus the page's motion: the first screen rises in
 * order, everything below arrives as it scrolls into view. Nothing here is
 * needed to read the page, and all of it is skipped for reduced motion.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (calm()) return;
    const lenis = new Lenis({ lerp: 0.09, anchors: true });
    let frame = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    if (calm()) return;
    const stops: (() => void)[] = [];

    const head = document.querySelectorAll<HTMLElement>(".hero > *, .page > header > *, .page > .hero + *");
    if (head.length) {
      head.forEach((el) => (el.style.opacity = "0"));
      animate(head, { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, ease: EASE, delay: stagger(0.07) }).then(() => head.forEach((el) => el.style.removeProperty("opacity")));
    }

    document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      if (el.closest(".rows, .hero, .page > header")) return;
      el.style.opacity = "0";
      stops.push(
        inView(
          el,
          () => {
            animate(el, { opacity: [0, 1], y: [20, 0] }, { duration: 0.65, ease: EASE }).then(() => el.style.removeProperty("opacity"));
          },
          { margin: "0px 0px -8% 0px" },
        ),
      );
    });

    return () => stops.forEach((stop) => stop());
  }, [pathname]);

  return null;
}
