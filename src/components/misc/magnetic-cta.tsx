"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMagnetic } from "~/hooks/use-magnetic";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
};

export function MagneticCTA({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  external,
}: Props) {
  const { x: sx, y: sy, onMouseMove: onMove, onMouseLeave: onLeave } = useMagnetic();

  const base =
    "relative inline-flex h-11 items-center justify-center gap-2 px-5 text-sm font-medium tracking-tight transition-colors";
  const variants = {
    primary:
      "border border-primary/50 bg-primary text-primary-foreground hover:bg-primary/90",
    ghost:
      "border border-border/60 bg-card/40 text-foreground hover:border-primary/50 hover:text-primary",
  };

  const Inner = (
    <motion.span style={{ x: sx, y: sy }} className="flex items-center gap-2">
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {Inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {Inner}
    </motion.button>
  );
}
