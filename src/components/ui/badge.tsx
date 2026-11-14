import * as React from "react";
import { cn } from "~/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "zoro";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variant === "default" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        variant === "zoro" && "bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(74,222,128,0.15)]",
        variant === "secondary" && "bg-neutral-900 text-neutral-300 border border-neutral-800",
        variant === "destructive" && "bg-red-500/10 text-red-400 border border-red-500/30",
        variant === "outline" && "border border-neutral-800 text-neutral-400",
        className
      )}
      {...props}
    />
  );
}
