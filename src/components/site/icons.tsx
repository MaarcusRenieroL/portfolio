import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  "aria-hidden": true,
} as const;

type P = SVGProps<SVGSVGElement>;

export const Arrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Download = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
  </svg>
);
export const External = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);
export const Search = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4.5-4.5" />
  </svg>
);
export const Term = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6l6 6-6 6M12 18h8" />
  </svg>
);
export const Moon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </svg>
);
export const Menu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const File = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" />
  </svg>
);
export const Mail = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const Code = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
  </svg>
);
export const Linkedin = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const Info = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
);

export const Mark = ({ size = 28, ...p }: P & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...p}>
    <path d="M7 27L27 7M19 35L35 19" stroke="var(--fg)" strokeWidth="2.6" />
    <path d="M11 33L33 11" stroke="var(--lime)" strokeWidth="2.6" />
    <path d="M8 22l4 4M12 28l4 4M20 30l4 4" stroke="var(--blade)" strokeWidth="2.6" />
  </svg>
);
