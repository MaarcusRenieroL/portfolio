"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GLYPHS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Letters resolve left to right from random glyphs. Applied to the page title on each page and to the name in
 * the header on hover. It only touches plain-text elements, keeps the element's height so nothing shifts,
 * labels the element with its real text while it runs, and does nothing for reduced motion.
 */
function scramble(el: HTMLElement, ms: number) {
  if (el.dataset.scrambling || el.children.length > 0) return;
  const final = el.textContent ?? "";
  if (!final.trim()) return;
  el.dataset.scrambling = "1";
  const hadLabel = el.hasAttribute("aria-label");
  if (!hadLabel) el.setAttribute("aria-label", final);
  el.style.minHeight = `${el.offsetHeight}px`;
  const chars = [...final];
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    const fixed = Math.floor(t * chars.length);
    el.textContent = chars.map((c, i) => (i < fixed || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
    if (t < 1) requestAnimationFrame(frame);
    else {
      el.textContent = final;
      el.style.minHeight = "";
      if (!hadLabel) el.removeAttribute("aria-label");
      delete el.dataset.scrambling;
    }
  };
  requestAnimationFrame(frame);
}

export function Scramble() {
  const pathname = usePathname();

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) return;
    // The intro loader covers the first visit in a tab (~1.1s); start once it has split open.
    const wait = document.documentElement.dataset.intro === "seen" ? 40 : 1000;
    const t = setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>("#main h1.title");
      if (h1) scramble(h1, 400);
    }, wait);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const over = (e: MouseEvent) => {
      if (calm.matches) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(".brand");
      if (el) scramble(el, 380);
    };
    document.addEventListener("mouseover", over);
    return () => document.removeEventListener("mouseover", over);
  }, []);

  return null;
}
