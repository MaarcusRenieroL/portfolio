"use client";

import { useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";

export type AnimeTheme =
  | "github"
  | "linkedin"
  | "email"
  | "discord"
  | "spotify"
  | "zoro";

interface ThemeConfig {
  primary: string;
  secondary: string;
  glow: string;
  innerGlow: string;
  shadow: string;
  emberColor: string;
  slashColor: string;
}

const THEMES: Record<AnimeTheme, ThemeConfig> = {
  github: {
    primary: "#a855f7",
    secondary: "#c084fc",
    glow: "rgba(168, 85, 247, 0.4)",
    innerGlow: "rgba(192, 132, 252, 0.2)",
    shadow:
      "0 0 16px rgba(168, 85, 247, 0.55), 0 0 32px rgba(168, 85, 247, 0.25)",
    emberColor: "#c084fc",
    slashColor: "#c084fc",
  },
  linkedin: {
    primary: "#00d2ff",
    secondary: "#38bdf8",
    glow: "rgba(0, 210, 255, 0.4)",
    innerGlow: "rgba(10, 102, 194, 0.2)",
    shadow:
      "0 0 16px rgba(0, 210, 255, 0.55), 0 0 32px rgba(10, 102, 194, 0.25)",
    emberColor: "#38bdf8",
    slashColor: "#00d2ff",
  },
  email: {
    primary: "#f59e0b",
    secondary: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.4)",
    innerGlow: "rgba(249, 115, 22, 0.2)",
    shadow:
      "0 0 16px rgba(245, 158, 11, 0.55), 0 0 32px rgba(249, 115, 22, 0.25)",
    emberColor: "#fbbf24",
    slashColor: "#fbbf24",
  },
  discord: {
    primary: "#5865f2",
    secondary: "#818cf8",
    glow: "rgba(88, 101, 242, 0.4)",
    innerGlow: "rgba(99, 102, 241, 0.2)",
    shadow:
      "0 0 16px rgba(88, 101, 242, 0.55), 0 0 32px rgba(88, 101, 242, 0.25)",
    emberColor: "#818cf8",
    slashColor: "#818cf8",
  },
  spotify: {
    primary: "#1ed760",
    secondary: "#00ff88",
    glow: "rgba(30, 215, 96, 0.4)",
    innerGlow: "rgba(0, 255, 136, 0.2)",
    shadow:
      "0 0 16px rgba(30, 215, 96, 0.55), 0 0 32px rgba(0, 255, 136, 0.25)",
    emberColor: "#1ed760",
    slashColor: "#00ff88",
  },
  zoro: {
    primary: "#4ade80",
    secondary: "#00ff88",
    glow: "rgba(74, 222, 128, 0.4)",
    innerGlow: "rgba(0, 255, 136, 0.2)",
    shadow:
      "0 0 16px rgba(74, 222, 128, 0.55), 0 0 32px rgba(0, 255, 136, 0.25)",
    emberColor: "#00ff88",
    slashColor: "#4ade80",
  },
};

/**
 * Continuous anime electric lightning crackle while hovered.
 * Plays actively with multiple crackling arcs until the hover is removed.
 */
function ContinuousAnimeLightning({ config }: { config: ThemeConfig }) {
  return (
    <svg
      className="pointer-events-none absolute -inset-3.5 h-[calc(100%+28px)] w-[calc(100%+28px)] overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Primary Top-Right Jagged Bolt */}
      <m.path
        d="M6 26 L26 8 L44 24 L70 6 L94 22"
        stroke={config.primary}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 0.8, 1, 0],
          opacity: [0, 1, 0.4, 1, 0],
        }}
        transition={{
          duration: 0.42,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.06,
        }}
        style={{
          filter: `drop-shadow(0 0 6px ${config.secondary}) drop-shadow(0 0 12px ${config.primary})`,
        }}
      />

      {/* Secondary Bottom-Left Jagged Bolt */}
      <m.path
        d="M92 74 L72 94 L50 78 L26 94 L8 76"
        stroke={config.secondary}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 0.9, 0.3, 1, 0],
          opacity: [0, 0.9, 0.3, 1, 0],
        }}
        transition={{
          duration: 0.38,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.14,
          repeatDelay: 0.08,
        }}
        style={{
          filter: `drop-shadow(0 0 5px ${config.primary})`,
        }}
      />

      {/* Vertical Side Zap Bolt */}
      <m.path
        d="M4 38 L14 52 L6 66 L18 80"
        stroke={config.secondary}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.22,
          repeatDelay: 0.16,
        }}
        style={{
          filter: `drop-shadow(0 0 4px ${config.primary})`,
        }}
      />

      {/* Opposite Side Zap Bolt */}
      <m.path
        d="M96 28 L84 44 L94 58 L82 72"
        stroke={config.primary}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.32,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.08,
          repeatDelay: 0.12,
        }}
        style={{
          filter: `drop-shadow(0 0 4px ${config.secondary})`,
        }}
      />
    </svg>
  );
}

/**
 * Continuous corner star glint while hovered.
 */
function ContinuousAnimeGlint({ config }: { config: ThemeConfig }) {
  return (
    <m.svg
      className="pointer-events-none absolute -right-1.5 -top-1.5 h-3.5 w-3.5 overflow-visible"
      viewBox="0 0 24 24"
      fill="#ffffff"
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 0.4, 1.4, 0],
        rotate: [0, 45, 90, 135, 180],
        opacity: [0, 1, 0.3, 1, 0],
      }}
      transition={{
        duration: 0.65,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.15,
      }}
      style={{ filter: `drop-shadow(0 0 6px ${config.primary})` }}
      aria-hidden="true"
    >
      <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z" />
    </m.svg>
  );
}

/**
 * High-tier Anime Power-up Button Wrapper:
 * - Steady, calm, non-looping aura when hovered (no breathing up and down).
 * - Plays a crisp one-shot ignition spark on entrance.
 * - Solid mouse hover stability (moving cursor inside never flickers).
 * - Explosive Zoro katana slash on click.
 */
export function AnimePowerup({
  children,
  className = "",
  theme = "zoro",
}: {
  children: React.ReactNode;
  className?: string;
  theme?: AnimeTheme;
}) {
  const [hovered, setHovered] = useState(false);
  const [slashed, setSlashed] = useState(false);
  const [ignitionKey, setIgnitionKey] = useState(0);
  // Reduced motion keeps the steady glow but drops the looping lightning, glint and slash.
  const calm = useReducedMotion();

  const config = THEMES[theme] ?? THEMES.zoro;

  const handleMouseEnter = () => {
    setHovered(true);
    setIgnitionKey((prev) => prev + 1);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const triggerImpact = () => {
    setSlashed(true);
    setTimeout(() => setSlashed(false), 300);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onPointerDown={calm ? undefined : triggerImpact}
    >
      {/* 1. One-Shot Ignition Shockwave on Entrance */}
      <AnimatePresence>
        {hovered && !calm && (
          <m.span
            key={`shock-${ignitionKey}`}
            className="pointer-events-none absolute -inset-1 rounded-[inherit] border"
            style={{
              borderColor: config.primary,
              boxShadow: `0 0 12px ${config.secondary}`,
            }}
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 2. Continuous Lightning Crackle until Hover is Removed */}
      <AnimatePresence>
        {hovered && !calm && <ContinuousAnimeLightning key="lightning" config={config} />}
      </AnimatePresence>

      {/* 3. Continuous Corner Star Glint until Hover is Removed */}
      <AnimatePresence>
        {hovered && !calm && <ContinuousAnimeGlint key="glint" config={config} />}
      </AnimatePresence>

      {/* 4. Steady, Clean, Non-Looping Brand Glow while Hovered */}
      <AnimatePresence>
        {hovered && (
          <m.div
            className="pointer-events-none absolute -inset-0.5 rounded-[inherit]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              boxShadow: config.shadow,
              border: `1px solid ${config.primary}`,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 5. Explosive Zoro Katana Slash on Click */}
      <AnimatePresence>
        {slashed && (
          <>
            <m.span
              className="pointer-events-none absolute -inset-2 rounded-full border-2"
              style={{
                borderColor: config.primary,
                filter: `drop-shadow(0 0 10px ${config.secondary})`,
              }}
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              aria-hidden="true"
            />
            <m.span
              className="pointer-events-none absolute -inset-3 h-full w-[2.5px] bg-white"
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "center",
                boxShadow: `0 0 16px ${config.secondary}, 0 0 30px ${config.primary}`,
              }}
              initial={{ rotate: -45, scaleY: 0, opacity: 1 }}
              animate={{ rotate: -45, scaleY: 2.5, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
          </>
        )}
      </AnimatePresence>

      {/* 6. Button Content with Smooth, Steady Brand Accent */}
      <div
        className="relative z-10 flex h-full w-full items-center justify-center transition-colors duration-200"
        style={hovered ? { color: config.secondary } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
