"use client";

import { useEffect, useRef, useState } from "react";

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
};

/**
 * Vim-style navigation for a list: j/k or arrows move, g g / G jump,
 * Enter or o opens, "/" focuses search, Esc leaves it. Returns the active
 * index and a ref for the search input.
 */
export function useListNav(count: number, open: (index: number) => void) {
  const [active, setActive] = useState(-1);
  const search = useRef<HTMLInputElement>(null);
  const last = useRef(0);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => setActive(-1), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (typing(e.target)) {
        if (e.key === "Escape" || (e.key === "Enter" && count > 0)) {
          (e.target as HTMLElement).blur();
          if (e.key === "Enter") setActive(0);
        }
        return;
      }

      const move = (to: number) => {
        if (count === 0) return;
        e.preventDefault();
        setActive(Math.max(0, Math.min(count - 1, to)));
      };

      switch (e.key) {
        case "/":
          e.preventDefault();
          search.current?.focus();
          break;
        case "j":
        case "ArrowDown":
          move(active + 1);
          break;
        case "k":
        case "ArrowUp":
          move(active < 0 ? 0 : active - 1);
          break;
        case "G":
          move(count - 1);
          break;
        case "g":
          if (Date.now() - last.current < 500) move(0);
          last.current = Date.now();
          break;
        case "Enter":
        case "o":
          if (active >= 0) {
            e.preventDefault();
            openRef.current(active);
          }
          break;
        case "Escape":
          setActive(-1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, count]);

  useEffect(() => {
    if (active < 0) return;
    document.querySelector<HTMLElement>(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return { active, setActive, search };
}
