"use client";

import { useEffect, useState } from "react";
import * as m from "motion/react-m";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

const baseSvg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * 1. Animated GitHub Icon:
 * Octocat playful wobble/bob + git commit node pulse.
 */
export function AnimatedGithubIcon({ className, width = 14, height = 14 }: IconProps) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <svg {...baseSvg} width={width} height={height} className={className}>
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    );
  }
  return (
    <m.svg
      {...baseSvg}
      width={width}
      height={height}
      className={className}
      variants={{
        rest: { rotate: 0, y: 0 },
        hover: {
          rotate: [0, -16, 12, -8, 5, 0],
          y: [0, -2.5, 0],
          transition: { duration: 0.65, ease: "easeInOut" },
        },
      }}
    >
      <m.path
        d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"
      />
      {/* Git commit pulse dot at bottom */}
      <m.circle
        cx="12"
        cy="19"
        r="1"
        fill="currentColor"
        variants={{
          rest: { scale: 0, opacity: 0.001 },
          hover: {
            scale: [0, 1.8, 1],
            opacity: [0, 1, 0.8],
            transition: { delay: 0.25, duration: 0.4 },
          },
        }}
      />
    </m.svg>
  );
}

/**
 * 2. Animated LinkedIn Icon:
 * The dot of the "i" bounces up like an incoming notification alert and springs back down.
 */
export function AnimatedLinkedinIcon({ className, width = 14, height = 14 }: IconProps) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <svg {...baseSvg} width={width} height={height} className={className}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" />
      </svg>
    );
  }
  return (
    <m.svg
      {...baseSvg}
      width={width}
      height={height}
      className={className}
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
      }}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      {/* "i" stem and "n" letter */}
      <path d="M8 10v7M12 17v-4a2 2 0 014 0v4M12 10v7" />

      {/* The "i" notification dot that bounces up with elastic spring */}
      <m.circle
        cx="8"
        cy="7"
        r="1"
        fill="currentColor"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: {
            y: [0, -4.5, -4.5, 0],
            scale: [1, 1.4, 1.2, 1],
            transition: {
              duration: 0.6,
              times: [0, 0.35, 0.6, 1],
              ease: [0.16, 1, 0.3, 1],
            },
          },
        }}
      />

      {/* Notification ping ripple ring */}
      <m.circle
        cx="8"
        cy="7"
        r="2"
        stroke="var(--green)"
        strokeWidth="1"
        variants={{
          rest: { scale: 0, opacity: 0.001 },
          hover: {
            scale: [0.5, 2.8],
            opacity: [0.9, 0],
            transition: { delay: 0.15, duration: 0.5, ease: "easeOut" },
          },
        }}
      />
    </m.svg>
  );
}

/**
 * 3. Animated Mail Icon:
 * The envelope unseals and a mini letter slides out on hover.
 */
export function AnimatedMailIcon({ className, width = 14, height = 14 }: IconProps) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <svg {...baseSvg} width={width} height={height} className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }
  return (
    <m.svg
      {...baseSvg}
      width={width}
      height={height}
      className={className}
      variants={{
        rest: { y: 0 },
        hover: { y: -2, transition: { type: "spring", stiffness: 450, damping: 25 } },
      }}
    >
      {/* Letter sheet sliding up from inside */}
      <m.g
        variants={{
          rest: { y: 3, opacity: 0.001 },
          hover: {
            y: -3,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
        }}
      >
        <rect x="6" y="2" width="12" height="6" rx="1" fill="var(--bg)" stroke="currentColor" strokeWidth="1.2" />
        <line x1="8" y1="4.5" x2="14" y2="4.5" stroke="var(--green)" strokeWidth="1" />
      </m.g>

      {/* Envelope body */}
      <rect x="3" y="5" width="18" height="14" rx="2" fill="var(--bg)" />

      {/* Envelope flap unsealing */}
      <m.path
        d="M3 7l9 6 9-6"
        variants={{
          rest: { d: "M3 7l9 6 9-6" },
          hover: {
            d: "M3 7l9 -3 9 3",
            transition: { duration: 0.28, ease: "easeOut" },
          },
        }}
      />
    </m.svg>
  );
}

/**
 * 4. Animated Discord Icon:
 * Clyde controller head wiggles playfully and eyes blink.
 */
export function AnimatedDiscordIcon({ className, width = 14, height = 14 }: IconProps) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <svg {...baseSvg} width={width} height={height} className={className}>
        <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.8-1.7 3.5-3 .7-1.7.5-5.8-1.5-11.5-1.5-1-3-1.3-4.5-1.5l-1 1.5c-1-.3-2-.3-3 0l-1-1.5c-1.5.2-3 .5-4.5 1.5-2 5.7-2.2 9.8-1.5 11.5.7 1.3 2 3 3.5 3 .5 0 2-2 2-3" />
        <path d="M7.5 16.5c3 .8 6 .8 9 0" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <m.svg
      {...baseSvg}
      width={width}
      height={height}
      className={className}
      variants={{
        rest: { rotate: 0 },
        hover: {
          rotate: [-7, 7, -5, 5, 0],
          transition: { duration: 0.55, ease: "easeInOut" },
        },
      }}
    >
      <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.8-1.7 3.5-3 .7-1.7.5-5.8-1.5-11.5-1.5-1-3-1.3-4.5-1.5l-1 1.5c-1-.3-2-.3-3 0l-1-1.5c-1.5.2-3 .5-4.5 1.5-2 5.7-2.2 9.8-1.5 11.5.7 1.3 2 3 3.5 3 .5 0 2-2 2-3" />
      <path d="M7.5 16.5c3 .8 6 .8 9 0" />

      {/* Left eye blinking */}
      <m.circle
        cx="9"
        cy="12"
        r="1"
        fill="currentColor"
        variants={{
          rest: { scaleY: 1 },
          hover: {
            scaleY: [1, 0.15, 1, 0.15, 1],
            transition: { duration: 0.5, delay: 0.1 },
          },
        }}
      />

      {/* Right eye blinking */}
      <m.circle
        cx="15"
        cy="12"
        r="1"
        fill="currentColor"
        variants={{
          rest: { scaleY: 1 },
          hover: {
            scaleY: [1, 0.15, 1, 0.15, 1],
            transition: { duration: 0.5, delay: 0.1 },
          },
        }}
      />
    </m.svg>
  );
}

/**
 * 5. Animated Spotify Icon:
 * Acoustic audio sound waves pulse sequentially outward like an active equalizer.
 */
export function AnimatedSpotifyIcon({ className, width = 14, height = 14 }: IconProps) {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <svg {...baseSvg} width={width} height={height} className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 10.5c3.5-1.8 7-1.2 9 0.5" />
        <path d="M8.5 13.5c2.8-1.4 5.6-0.9 7.2 0.4" />
        <path d="M9.5 16.5c2.1-1 4.2-0.7 5.4 0.3" />
      </svg>
    );
  }
  return (
    <m.svg
      {...baseSvg}
      width={width}
      height={height}
      className={className}
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.08, transition: { duration: 0.2 } },
      }}
    >
      <circle cx="12" cy="12" r="10" />

      {/* Top outer sound wave */}
      <m.path
        d="M7.5 10.5c3.5-1.8 7-1.2 9 0.5"
        variants={{
          rest: { opacity: 0.7, pathLength: 1 },
          hover: {
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.08, 1],
            transition: { repeat: Infinity, duration: 1.1, delay: 0.25 },
          },
        }}
      />

      {/* Middle sound wave */}
      <m.path
        d="M8.5 13.5c2.8-1.4 5.6-0.9 7.2 0.4"
        variants={{
          rest: { opacity: 0.85, pathLength: 1 },
          hover: {
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.06, 1],
            transition: { repeat: Infinity, duration: 1.1, delay: 0.12 },
          },
        }}
      />

      {/* Bottom inner sound wave */}
      <m.path
        d="M9.5 16.5c2.1-1 4.2-0.7 5.4 0.3"
        variants={{
          rest: { opacity: 1, pathLength: 1 },
          hover: {
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 1.1, delay: 0 },
          },
        }}
      />
    </m.svg>
  );
}
