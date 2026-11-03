"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "~/lib/content";

/** Top progress bar (sticky under the nav) that fills with page scroll. */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        el.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <div style={{ position: "sticky", top: 0, height: 2, background: "var(--line)", zIndex: 41 }} aria-hidden="true">
      <div ref={ref} style={{ height: "100%", background: "var(--blade)", boxShadow: "0 0 10px var(--blade)", transformOrigin: "left", transform: "scaleX(0)" }} />
    </div>
  );
}

/** Chapter rail: highlights the active chapter with a gliding blade marker. */
export function ChapterRail() {
  const [active, setActive] = useState(CHAPTERS[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(en.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="rail" aria-label="Case study chapters">
      <span className="label" style={{ marginBottom: 10 }}>Chapters</span>
      {CHAPTERS.map((c) => (
        <a key={c.id} href={`#${c.id}`} className={active === c.id ? "on" : ""} aria-current={active === c.id ? "true" : undefined}>
          {c.label}
        </a>
      ))}
    </nav>
  );
}
