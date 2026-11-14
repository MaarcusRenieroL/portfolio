"use client";

import { flushSync } from "react-dom";
import { useSyncExternalStore } from "react";
import { useDict } from "~/components/site/locale";

type Theme = "light" | "dark";

const KEY = "theme";
const COLORS: Record<Theme, string> = { dark: "#0b0b0b", light: "#fafafa" };
const listeners = new Set<() => void>();

/** The theme actually showing: the stored choice, else the system preference. */
function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

function apply(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = COLORS[next]));
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode: the choice just lasts for this visit */
  }
  flushSync(() => listeners.forEach((l) => l()));
}

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void> } };

/**
 * Switch theme with a circle that grows from the button across the page
 * (View Transitions API). Browsers without it, and visitors who prefer reduced
 * motion, get the instant switch.
 */
function choose(next: Theme, from: HTMLElement) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply(next);

  const box = from.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  doc
    .startViewTransition(() => apply(next))
    .ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    )
    .catch(() => {});
}

/** Flip the theme from anywhere (the command palette), with the same reveal animation. */
export function switchTheme() {
  const from = document.querySelector<HTMLElement>(".theme-toggle") ?? document.body;
  choose(current() === "dark" ? "light" : "dark", from);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = useDict().chrome.themeTo(next);

  return (
    <button type="button" className="theme-toggle" onClick={(e) => choose(next, e.currentTarget)} aria-label={label} title={label}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
        )}
      </svg>
    </button>
  );
}
