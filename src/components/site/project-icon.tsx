import type { ReactNode } from "react";

/** One small line glyph per project, drawn to say what the project is. */
const GLYPHS: Record<string, ReactNode> = {
  // four modules in one workspace
  zentro: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  // a ring around a core: one process
  "life-os": (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // crescent
  nyx: <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />,
  // a package with an arrow out
  "next-kit": (
    <>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  // a portrait frame
  "snap-pass": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M7.5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" />
    </>
  ),
  // a gate: one way in
  gateway: (
    <>
      <path d="M5 21V10a7 7 0 0114 0v11" />
      <path d="M3 21h18M12 21v-6M9.5 17.5L12 15l2.5 2.5" />
    </>
  ),
  // a prompt
  dotfiles: (
    <>
      <path d="M5 7l5 5-5 5" />
      <path d="M13 18h6" />
    </>
  ),
  // braces
  portfolio: (
    <>
      <path d="M9 4C6.5 4 7 6 7 8s0 3-2.5 4C7 13 7 14 7 16s-.5 4 2 4" />
      <path d="M15 4c2.5 0 2 2 2 4s0 3 2.5 4c-2.5 1-2.5 2-2.5 4s.5 4-2 4" />
    </>
  ),
};

export function ProjectIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <span className={`picon ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[slug] ?? <circle cx="12" cy="12" r="6" />}
      </svg>
    </span>
  );
}
