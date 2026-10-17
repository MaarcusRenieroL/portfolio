"use client";

import { useMemo, useState } from "react";
import {
  CpuIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
  LayersIcon,
  ServerIcon,
  TerminalIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  InfoIcon,
} from "lucide-react";

import { Reveal } from "../misc/reveal";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "~/lib/utils";
import { StackGroup } from "~/lib/types";
import { useHighlight } from "../providers/highlight-provider";
import { playBlip, playThock } from "~/lib/audio";
import { PROJECTS } from "~/lib/constants";

type StackExplorerProps = {
  groups: StackGroup[];
};

// Curated flagship architectural presets demonstrating how Maarcus pieces the stack together
const PRESETS = [
  {
    id: "saas",
    title: "Full-Stack SaaS Blueprint",
    badge: "PRODUCT VELOCITY",
    icon: LayersIcon,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    description:
      "My primary blueprint for high-polish products. Instant interactive feedback, end-to-end typed contracts, and edge-ready database layers.",
    metric: "< 80ms TTFB · Zero Type Drift",
    technologies: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "tRPC / Server Actions",
      "Drizzle ORM",
      "PostgreSQL",
      "Upstash Redis",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise Backend Spec",
    badge: "DETERMINISTIC SCALE",
    icon: ServerIcon,
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    description:
      "Heavy-duty architecture used for data ingestion, high-volume batch transformations, and strict relational enterprise platforms.",
    metric: "Millions of records processed deterministically",
    technologies: [
      "Java 21",
      "Spring Boot 3",
      "Spring Batch",
      "MySQL Server",
      "Spring Data JPA",
      "Docker",
      "AWS",
    ],
  },
  {
    id: "terminal",
    title: "Zero-Latency Dev Rig",
    badge: "DX & MARATHON FOCUS",
    icon: TerminalIcon,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    description:
      "The custom terminal-first environment powering daily coding, instant buffer traversal, and server administration without context loss.",
    metric: "< 2ms input response · 100% keyboard flow",
    technologies: [
      "Ghostty / Alacritty",
      "Neovim (Lua)",
      "tmux",
      "zsh",
      "custom dotfiles",
      "pnpm",
      "Git CLI",
    ],
  },
];

// In-depth micro-rationales explaining architectural choices
const TOOL_RATIONALES: Record<string, { summary: string; tradeoff: string }> = {
  "next.js": {
    summary:
      "Chosen for hybrid SSR/SSG rendering models, nested layout composition, and streaming UI out of the box.",
    tradeoff: "Server component mental model requires deliberate client-boundary design.",
  },
  typescript: {
    summary:
      "Strict mode by default. Zero-compromise type boundaries between client, server, and DB eliminate 95% of state defects before runtime.",
    tradeoff: "Slight upfront compilation ceremony, compensated 10x in refactoring speed.",
  },
  postgresql: {
    summary:
      "The undisputed relational workhorse. ACID guarantees, battle-tested indexing, row-level security (RLS), and JSONB flexibility.",
    tradeoff: "Requires deliberate connection pooling (PgBouncer) when deployed with serverless lambdas.",
  },
  "spring boot": {
    summary:
      "Enterprise spine for deterministic batch workloads, resilient transaction lifecycles, and rock-solid dependency injection.",
    tradeoff: "Heavier memory footprint than Go/Rust, but unrivaled enterprise ecosystem support.",
  },
  "tailwind css": {
    summary:
      "Colocated design tokens and zero-CSS-runtime bundle overhead. Ensures uniform rhythm and effortless design system maintenance.",
    tradeoff: "Verbose class strings mitigated through reusable compound components with cva and clsx.",
  },
  trpc: {
    summary:
      "End-to-end type safety without OpenAPI codegen ceremonies. Refactor an endpoint and watch TypeScript flag stale calls instantly.",
    tradeoff: "Couples client and server to TypeScript; ideal for monoliths and unified monorepos.",
  },
  docker: {
    summary:
      "Hermetic build environments, reproducible local testing, and predictable deployment units from macOS M-series to AWS EC2.",
    tradeoff: "Container orchestration overhead for small scripts; indispensable for multi-service environments.",
  },
  neovim: {
    summary:
      "Custom Lua-driven workflow. Keyboard-driven navigation, instantaneous buffer hopping, and zero latency during marathon coding.",
    tradeoff: "Steep learning curve, but pays life-long productivity dividends.",
  },
  "drizzle orm": {
    summary:
      "SQL-like syntax with zero magic. Extremely fast cold starts, minimal overhead, and auto-generated migrations.",
    tradeoff: "Less abstraction than Prisma, but gives precise control over emitted SQL queries.",
  },
};

const BELIEFS = [
  {
    num: "01",
    title: "Type Safety as System Proof",
    eyebrow: "RELIABILITY",
    description:
      "Data should never cross an architectural boundary untyped. From DB schema migrations to API serialization and UI state, TypeScript and strict schemas catch edge cases before users do.",
  },
  {
    num: "02",
    title: "Zero-Junk Interaction Craft",
    eyebrow: "TACTILITY",
    description:
      "Fast software feels respectful. Sub-millisecond UI feedback, zero cumulative layout shift (CLS), keyboard accessibility by default, and animations that explain spatial context rather than show off.",
  },
  {
    num: "03",
    title: "Pragmatic Architecture Over Hype",
    eyebrow: "SHIPPING",
    description:
      "Choose boring, battle-tested foundations (PostgreSQL, Spring Boot, Linux) paired with sharp modern interfaces (Next.js, Tailwind). Ship systems you can easily debug at 2 AM.",
  },
];

export function StackExplorer({ groups }: StackExplorerProps) {
  const { hoveredSkill, setHoveredSkill } = useHighlight();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [selectedRationale, setSelectedRationale] = useState<string | null>("next.js");

  // Map each skill to which project(s) use it
  const skillProjectMap = useMemo(() => {
    const map = new Map<string, string[]>();
    PROJECTS.forEach((p) => {
      p.skills.forEach((s) => {
        const key = s.toLowerCase();
        const existing = map.get(key) || [];
        existing.push(p.title);
        map.set(key, existing);
      });
    });
    return map;
  }, []);

  const totalTools = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.items.length, 0);
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => (!q ? true : item.toLowerCase().includes(q))),
      }))
      .filter((g) => (active === "all" ? true : g.title === active) && g.items.length > 0);
  }, [groups, query, active]);

  return (
    <div className="flex flex-col gap-10">
      {/* Telemetry Overview Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border/60 bg-card/30 px-4 py-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <CpuIcon className="size-3.5 text-primary" />
            <span className="uppercase tracking-wider text-[11px]">STACK_MATRIX // ACTIVE_RIG</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-muted-foreground text-[11px]">
            {totalTools} tools & libraries indexed across {groups.length} disciplines
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
          <span>Interactive cross-highlighting enabled</span>
        </div>
      </div>

      {/* Production Stack Presets */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">{"// PRESETS"}</span>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Curated Production Architectures
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase hidden sm:inline">
            PROVEN DEPLOYMENT CONFIGS
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                className="group relative flex flex-col justify-between border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity group-hover:via-primary"
                />
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase",
                        preset.accent,
                      )}
                    >
                      <Icon className="size-3" />
                      {preset.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {preset.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {preset.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5 pt-1">
                    {preset.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-border/70 bg-background/70 px-2 py-0.5 font-mono text-[10px] text-foreground/85"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-border/40 pt-3">
                  <p className="font-mono text-[10px] text-primary/90 flex items-center gap-1.5">
                    <CheckCircle2Icon className="size-3 text-primary shrink-0" />
                    <span>{preset.metric}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagship Micro-Rationales Sheet */}
      <Reveal>
        <div className="border border-border/60 bg-card/35 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <InfoIcon className="size-4 text-primary" />
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Architectural Rationales: &quot;Why I Picked This&quot;
              </h3>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              CLICK A FLAGSHIP TOOL TO VIEW TRADEOFF ANALYSIS
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(TOOL_RATIONALES).map((toolKey) => {
              const isSelected = selectedRationale === toolKey;
              return (
                <button
                  key={toolKey}
                  type="button"
                  onClick={() => {
                    setSelectedRationale(toolKey);
                    playThock();
                  }}
                  className={cn(
                    "relative cursor-pointer border px-3 py-1 font-mono text-xs uppercase transition-colors active:scale-95",
                    isSelected
                      ? "border-primary text-primary font-bold"
                      : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="active-rationale-pill"
                      className="absolute inset-0 bg-primary/20 shadow-[0_0_12px_rgba(74,222,128,0.25)] pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{toolKey}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedRationale && TOOL_RATIONALES[selectedRationale] && (
              <motion.div
                key={selectedRationale}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="grid gap-3 sm:grid-cols-2 border border-border/50 bg-background/60 p-4 font-mono text-xs"
              >
                <div>
                  <span className="text-[10px] uppercase text-primary font-semibold tracking-wider flex items-center gap-1">
                    <ArrowRightIcon className="size-3" /> Core Engineering Advantage
                  </span>
                  <p className="mt-1 text-sm font-sans leading-relaxed text-foreground/90">
                    {TOOL_RATIONALES[selectedRationale].summary}
                  </p>
                </div>
                <div className="border-t border-border/40 sm:border-t-0 sm:border-l sm:pl-4 pt-2 sm:pt-0">
                  <span className="text-[10px] uppercase text-amber-400 font-semibold tracking-wider flex items-center gap-1">
                    {"// Evaluated Tradeoff"}
                  </span>
                  <p className="mt-1 text-sm font-sans leading-relaxed text-muted-foreground">
                    {TOOL_RATIONALES[selectedRationale].tradeoff}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>

      {/* Filter and Search Bar */}
      <Reveal>
        <div className="flex flex-col gap-3 border border-border/60 bg-card/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2 border border-border/60 bg-background/60 px-3 transition-colors focus-within:border-primary/60">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  playThock();
                }}
                placeholder="filter technologies, frameworks, runtimes, protocols…"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    playBlip();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear filter"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Reset */}
            {active !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setActive("all");
                  playBlip();
                }}
                className="flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <span>Reset Discipline</span>
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setActive("all");
                playBlip();
              }}
              className={cn(
                "relative h-8 border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors active:scale-95",
                active === "all"
                  ? "border-primary text-primary font-bold"
                  : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {active === "all" && (
                <motion.span
                  layoutId="active-stack-tab"
                  className="absolute inset-0 bg-primary/15 shadow-[0_0_12px_rgba(74,222,128,0.2)] pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span className="relative z-10">All Disciplines ({totalTools})</span>
            </button>
            {groups.map((g) => (
              <button
                key={g.title}
                type="button"
                onClick={() => {
                  setActive(g.title);
                  playBlip();
                }}
                className={cn(
                  "relative h-8 border px-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors active:scale-95",
                  active === g.title
                    ? "border-primary text-primary font-bold"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {active === g.title && (
                  <motion.span
                    layoutId="active-stack-tab"
                    className="absolute inset-0 bg-primary/15 shadow-[0_0_12px_rgba(74,222,128,0.2)] pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{g.title} ({g.items.length})</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Grid of Stack Groups */}
      {filteredGroups.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <p className="font-mono text-xs text-primary font-semibold">[0 TOOLS MATCHED]</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No tools found matching &quot;{query}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive("all");
              playBlip();
            }}
            className="mt-4 inline-flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGroups.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.05}>
              <div className="group relative flex h-full flex-col justify-between overflow-hidden border border-border/60 bg-card/40 p-5 sm:p-6 transition-all hover:border-border hover:shadow-lg">
                {/* Top Subtle Line Accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity group-hover:via-primary"
                />

                <div>
                  <div className="mb-4 flex items-baseline justify-between border-b border-border/40 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary/70">
                          [{String(i + 1).padStart(2, "0")}]
                        </span>
                        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                          {group.eyebrow}
                        </p>
                      </div>
                      <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {group.title}
                      </h2>
                    </div>
                    <span className="rounded border border-border/70 bg-background/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {String(group.items.length).padStart(2, "0")} units
                    </span>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {group.items.map((item) => {
                      const isHovered = hoveredSkill === item;
                      const connectedProjects = skillProjectMap.get(item.toLowerCase());
                      const hasProjects = connectedProjects && connectedProjects.length > 0;

                      return (
                        <div
                          key={item}
                          onMouseEnter={() => {
                            setHoveredSkill(item);
                            playBlip();
                          }}
                          onMouseLeave={() => setHoveredSkill(null)}
                          className={cn(
                            "group/item relative cursor-pointer inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs transition-all select-none",
                            isHovered
                              ? "border-primary bg-primary/20 text-primary font-bold shadow-[0_0_12px_rgba(74,222,128,0.3)] scale-105"
                              : "border-border/70 bg-background/60 text-foreground/85 hover:border-primary/60 hover:text-primary",
                          )}
                          title={
                            hasProjects
                              ? `Shipped in: ${connectedProjects.join(", ")}`
                              : undefined
                          }
                        >
                          {hasProjects && (
                            <span
                              className="size-1.5 rounded-full bg-primary/80"
                              aria-hidden
                            />
                          )}
                          <span>{item}</span>
                          {hasProjects && (
                            <span className="text-[9px] text-primary/70 font-semibold opacity-70 group-hover/item:opacity-100">
                              [{connectedProjects.length}]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Micro Footer Notice */}
                <div className="mt-5 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>DISCIPLINE_VERIFIED</span>
                  <span className="text-primary/80">READY FOR PRODUCTION</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Engineering Philosophy Cards */}
      <Reveal>
        <div className="border border-border/60 bg-card/30 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <SparklesIcon className="size-4 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Architectural Convictions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {BELIEFS.map((b) => (
              <div
                key={b.title}
                className="group relative border border-border/60 bg-background/50 p-5 transition-all hover:border-primary/50"
              >
                <span className="font-mono text-xs font-bold text-primary">
                  {"// "}{b.num} {b.eyebrow}
                </span>
                <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {b.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
