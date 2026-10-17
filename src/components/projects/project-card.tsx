"use client";

import { useRef, useState, MouseEvent } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, GlobeIcon } from "lucide-react";
import { GithubIcon } from "~/components/icons";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import { Project } from "~/lib/types";
import { formatDuration } from "~/lib/data/projects";
import { useHighlight } from "../providers/highlight-provider";
import { playBlip } from "~/lib/audio";

const ACCENTS = [
  "from-emerald-400/25 via-teal-500/10 to-transparent",
  "from-cyan-400/25 via-sky-500/10 to-transparent",
  "from-violet-400/25 via-fuchsia-500/10 to-transparent",
  "from-amber-400/25 via-orange-500/10 to-transparent",
];

type ProjectCardProps = {
  project: Project;
  index?: number;
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];
  const { hoveredSkill, setHoveredSkill } = useHighlight();
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse spotlight coordinates (in px)
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 280,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 280,
    damping: 22,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSpotlightPos({ x, y });

    // Normalized (-0.5 to 0.5)
    mouseX.set(x / rect.width - 0.5);
    mouseY.set(y / rect.height - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playBlip();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setSpotlightPos({ x: -1000, y: -1000 });
    mouseX.set(0);
    mouseY.set(0);
  };

  const isHighlighted = hoveredSkill ? (project.skills as readonly string[]).includes(hoveredSkill) : false;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`group lift project-card relative flex h-full flex-col overflow-hidden border p-5 sm:p-6 transition-all duration-300 ${
        isHighlighted
          ? "border-primary bg-primary/10 shadow-[0_0_35px_rgba(34,197,94,0.35)] scale-[1.015]"
          : "border-border/60 bg-card/40"
      }`}
    >
      {/* Background Gradient Accent */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Interactive Cursor Spotlight Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${spotlightPos.x}px ${spotlightPos.y}px, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)`,
        }}
      />

      {/* Holographic Angle Glare Layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-color-dodge transition-opacity duration-500 opacity-0 group-hover:opacity-30"
        style={{
          background: `linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)`,
          transform: `translate(${spotlightPos.x * 0.15}px, ${spotlightPos.y * 0.15}px)`,
        }}
      />

      <Link
        href={`/projects/${project.id}`}
        aria-label={`open ${project.title}`}
        className="absolute inset-0 z-[1]"
      />

      {/* 01 / 02 Index Numbering */}
      <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] tabular-nums text-muted-foreground/70 group-hover:text-primary transition-colors">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Category & Status */}
      <div className="pointer-events-none relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span>{project.category}</span>
        <span className="h-px w-4 bg-primary/40" />
        <span className="text-muted-foreground">{project.status}</span>
        {isHighlighted && (
          <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-primary animate-pulse">
            ★ MATCH: {hoveredSkill}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="pointer-events-none relative mt-3 text-2xl font-semibold tracking-tight">
        {project.title}
        <ArrowUpRightIcon className="ml-1 inline size-5 -translate-y-0.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:text-primary" />
      </h3>

      {/* Description */}
      <p className="pointer-events-none relative mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>

      {/* Skills Chips with Hover Cross-Reference */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mt-4 flex flex-wrap gap-1.5"
      >
        {project.skills.slice(0, 6).map((skill) => (
          <span
            key={skill}
            onMouseEnter={() => setHoveredSkill(skill)}
            onMouseLeave={() => setHoveredSkill(null)}
            className={`chip cursor-crosshair transition-colors ${
              hoveredSkill === skill ? "border-primary bg-primary/20 text-primary font-bold scale-105" : ""
            }`}
          >
            {skill}
          </span>
        ))}
        {project.skills.length > 6 && (
          <span className="chip">+{project.skills.length - 6}</span>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="relative mt-auto flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
        <span className="pointer-events-none font-mono">
          {formatDuration(project)}
        </span>
        <div className="relative z-10 flex items-center gap-2">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="open github repository"
              className="grid size-8 place-items-center border border-border/60 bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <GithubIcon className="size-3.5" />
            </a>
          )}
          {project.hostedLink && (
            <a
              href={project.hostedLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="open live site"
              className="grid size-8 place-items-center border border-border/60 bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <GlobeIcon className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
