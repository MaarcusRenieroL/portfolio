"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CameraIcon,
  SparklesIcon,
  HeartIcon,
  CodeIcon,
  TerminalIcon,
  LaptopIcon,
  CpuIcon,
  HeadphonesIcon,
  KeyboardIcon,
} from "lucide-react";

import { PROFILE } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { playBlip, playThock } from "~/lib/audio";
import { motion, AnimatePresence } from "motion/react";

type IdentityPanelProps = {
  compact?: boolean;
};

const stats = [
  { label: "experience", value: "6+ yrs", sub: "tinkering & coding" },
  { label: "core builds", value: "5 active", sub: "production & tools" },
  { label: "daily fuel", value: "3 shots", sub: "espresso & filter coffee" },
  { label: "base locale", value: "chennai", sub: "ist (utc+5:30)" },
];

const infoRows = [
  {
    label: "current station",
    value: "Developer 1 — Software Engineering @ UST Healthproof",
    icon: SparklesIcon,
  },
  {
    label: "craft ethos",
    value: "Building range across frontend craft, distributed backend & developer tooling",
    icon: HeartIcon,
  },
  {
    label: "preferred stack",
    value: "TypeScript, Next.js, Spring Boot, PostgreSQL, Rust (Tauri), Tailwind CSS",
    icon: CodeIcon,
  },
  {
    label: "terminal setup",
    value: "Ghostty + zsh + Neovim (Lua) + custom dotfiles on macOS",
    icon: TerminalIcon,
  },
];

const hardwareSpecs = [
  {
    label: "Workstation",
    value: "Apple Silicon M-Series MacBook",
    icon: LaptopIcon,
    detail: "High-efficiency local compiles & whisper-quiet thermal profile",
  },
  {
    label: "Input Hardware",
    value: "Keychron Mechanical Keyboard",
    icon: KeyboardIcon,
    detail: "Tactile switches, tuned stabilizers, 100% mechanical feedback",
  },
  {
    label: "Shell & Runtime",
    value: "Ghostty + Neovim + tmux",
    icon: CpuIcon,
    detail: "Custom Lua mappings, persistent sessions & a reproducible dotfiles setup",
  },
  {
    label: "Audio Telemetry",
    value: "Studio Monitor Headphones",
    icon: HeadphonesIcon,
    detail: "Acoustic fingerstyle, ambient game OSTs, and lo-fi focus soundscapes",
  },
];

export function IdentityPanel({ compact = false }: IdentityPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "hardware">("overview");

  return (
    <aside className="overflow-hidden border border-border/60 bg-card/40 shadow-sm">
      {/* Top Cyber Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-5 py-2.5 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span>DOSSIER // IDENTITY_SPECIMEN</span>
        </div>

        <div className="flex items-center gap-2">
          {!compact && (
            <div className="flex rounded border border-border/60 bg-background/50 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("overview");
                  playBlip();
                }}
                className={cn(
                  "relative px-2.5 py-0.5 text-[11px] uppercase font-mono transition-colors active:scale-95",
                  activeTab === "overview"
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {activeTab === "overview" && (
                  <motion.span
                    layoutId="active-identity-tab"
                    className="absolute inset-0 bg-primary pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">Overview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("hardware");
                  playThock();
                }}
                className={cn(
                  "relative px-2.5 py-0.5 text-[11px] uppercase font-mono transition-colors active:scale-95",
                  activeTab === "hardware"
                    ? "text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {activeTab === "hardware" && (
                  <motion.span
                    layoutId="active-identity-tab"
                    className="absolute inset-0 bg-primary pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">Battlestation Rig</span>
              </button>
            </div>
          )}
          <span className="text-muted-foreground text-[11px] hidden sm:inline">
            COORDS: 13.0827° N, 80.2707° E
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.7fr_1fr]">
        {/* Left Column: Portrait and Key Stats */}
        <div className="relative flex flex-col justify-between gap-6 border-b border-border/60 bg-background/50 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between text-xs font-mono text-primary">
            <span>[SYS_PORTRAIT]</span>
            <CameraIcon className="size-3.5 text-muted-foreground" />
          </div>

          {/* Viewfinder Monogram Box */}
          <div className="relative mx-auto my-2 grid place-items-center">
            {/* Viewfinder corner brackets */}
            <div className="absolute -top-2 -left-2 size-3 border-t-2 border-l-2 border-primary/70 pointer-events-none" />
            <div className="absolute -top-2 -right-2 size-3 border-t-2 border-r-2 border-primary/70 pointer-events-none" />
            <div className="absolute -bottom-2 -left-2 size-3 border-b-2 border-l-2 border-primary/70 pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 size-3 border-b-2 border-r-2 border-primary/70 pointer-events-none" />

            {PROFILE.headshot ? (
              <div className="relative size-32 overflow-hidden border border-primary/45 shadow-lg">
                <Image
                  src={PROFILE.headshot}
                  alt="maarcus reniero l"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative grid size-32 place-items-center border border-primary/60 bg-primary/10 font-mono text-4xl font-black text-primary shadow-[inset_0_0_50px_rgba(74,222,128,0.18)]">
                <span>MR</span>
                <span className="absolute bottom-1 right-2 text-[11px] font-mono text-primary/70 uppercase">
                  v2.4
                </span>
              </div>
            )}
          </div>

          {!compact && (
            <div className="grid grid-cols-2 gap-2 font-mono">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="border border-border/60 bg-background/70 p-3 transition-colors hover:border-primary/50"
                >
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 text-base font-bold text-primary">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground/75 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Bio & Core Attributes OR Battlestation Specs */}
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-primary/80 uppercase tracking-widest">
                {"// SPEC_01"}
              </span>
              <span className="text-border">·</span>
              <span className="font-mono text-[11px] text-muted-foreground uppercase">
                {activeTab === "overview" ? "ENGINEER PROFILE" : "LOCAL HARDWARE & DX RIG"}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl text-foreground tracking-tight">
              Maarcus Reniero L
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A 22-year-old full-stack software engineer based in Chennai, India.
              Obsessed with building clean product flows, high-performance web applications,
              developer tooling, and robust systems from backend storage to frontend interactions.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="grid gap-2.5"
              >
                {infoRows.slice(0, compact ? 2 : 4).map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="group grid grid-cols-[1.5rem_1fr] items-start gap-3 border border-border/60 bg-background/50 p-3 transition-all hover:border-primary/50 hover:bg-background/80"
                  >
                    <Icon className="mt-0.5 size-4 text-primary transition-transform group-hover:scale-110" />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm text-foreground/90 font-medium">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="hardware"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="grid gap-2.5"
              >
                {hardwareSpecs.map(({ label, value, icon: Icon, detail }) => (
                  <div
                    key={label}
                    className="group grid grid-cols-[1.5rem_1fr] items-start gap-3 border border-border/60 bg-background/50 p-3 transition-all hover:border-primary/50 hover:bg-background/80"
                  >
                    <Icon className="mt-0.5 size-4 text-primary transition-transform group-hover:scale-110" />
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-foreground/90 font-semibold font-mono">
                        {value}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-normal">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 flex items-center justify-between border-t border-border/40 font-mono text-[11px] text-muted-foreground">
            <span>LOCATION: CHENNAI, TN (IN)</span>
            <span className="text-primary font-bold">STATUS: AVAILABLE FOR IMPACT</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
