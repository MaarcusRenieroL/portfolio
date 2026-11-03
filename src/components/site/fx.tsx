"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SEL = "[data-reveal],[data-wipe],.tl-item,.meter,.slash[data-draw]";

/** Scroll reveals, card spotlight + tilt, count-up. Tier-aware, no deps. */
export function Fx() {
  const pathname = usePathname();

  // scroll-triggered reveals (re-scans after route changes and DOM updates)
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const scan = () => {
      document.querySelectorAll(REVEAL_SEL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // count-up numbers
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-count]");
    if (!els.length) return;
    const reduce = document.documentElement.dataset.tier === "0";
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          const el = en.target as HTMLElement;
          const to = parseFloat(el.dataset.count ?? "0");
          const dec = (el.dataset.count?.split(".")[1] ?? "").length;
          if (reduce || Number.isNaN(to)) {
            el.textContent = to.toFixed(dec);
            continue;
          }
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / 1100);
            const e = 1 - Math.pow(1 - p, 4);
            el.textContent = (to * e).toFixed(dec);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // pointer: spotlight on cards, tilt on [data-tilt]
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let tiltEl: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const tier = document.documentElement.dataset.tier;
      if (tier === "0") return;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".card");
      if (!card) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (!card.querySelector(":scope > .spot") && tier === "2") {
          const s = document.createElement("span");
          s.className = "spot";
          s.setAttribute("aria-hidden", "true");
          card.prepend(s);
        }
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
        if (card.hasAttribute("data-tilt") && tier === "2") {
          tiltEl = card;
          const rx = ((y / r.height) * 2 - 1) * -4;
          const ry = ((x / r.width) * 2 - 1) * 4;
          card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
        } else if (card.hasAttribute("data-tilt")) {
          card.style.transform = "translateY(-4px)";
        }
      });
    };
    const onLeave = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]");
      if (card) card.style.transform = "";
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      if (tiltEl) tiltEl.style.transform = "";
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
