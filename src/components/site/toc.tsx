"use client";

import { useEffect, useState } from "react";
import type { Heading } from "~/lib/data/blog";

/** Sticky "On this page" list that highlights the heading being read. */
export function Toc({ headings, label = "On this page" }: { headings: Heading[]; label?: string }) {
  const [current, setCurrent] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    // Active = the last heading whose top has passed just under the sticky header.
    let frame = 0;
    const update = () => {
      frame = 0;
      let active = headings[0]?.id ?? "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 140) active = h.id;
      }
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc" aria-label={label}>
      <span className="toc-h">{label}</span>
      <ul>
        {headings.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a href={`#${h.id}`} aria-current={current === h.id ? "true" : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
