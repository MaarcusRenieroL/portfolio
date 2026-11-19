import * as React from "react";
import * as m from "motion/react-m";
import { type HTMLMotionProps } from "motion/react";
import { cn } from "~/lib/utils";

export type ButtonVariant =
  | "default"
  | "action"
  | "chip"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonVariantProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: ButtonVariantProps = {}) {
  // Exact class match: a substring test would also catch "header-actions", "transaction", etc.
  const classes = className.split(/\s+/);
  const isChip = variant === "chip" || classes.includes("chip");
  const isAction = variant === "action" || classes.includes("action");

  if (isChip) {
    return cn(
      "chip inline-flex items-center justify-center gap-1 h-[26px] px-2.5 rounded-full border border-[var(--line)] bg-transparent text-[var(--fg-2)] text-[12px] font-normal leading-none whitespace-nowrap cursor-pointer select-none transition-[color,background-color,border-color,opacity,translate,scale,box-shadow] duration-160 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:duration-75 motion-reduce:translate-none motion-reduce:scale-100 hover:text-[var(--fg)] hover:border-[var(--line-2)] hover:bg-[var(--hover)] aria-pressed:bg-[var(--green)] aria-pressed:text-[var(--green-ink)] aria-pressed:border-[var(--green)] aria-pressed:font-medium disabled:pointer-events-none disabled:opacity-50",
      className
    );
  }

  if (isAction) {
    return cn(
      "action inline-flex items-center justify-center gap-1.5 h-[30px] px-3 rounded-[6px] border border-[var(--line)] bg-transparent text-[var(--fg-2)] text-[12px] font-normal leading-none whitespace-nowrap cursor-pointer select-none transition-colors duration-160 hover:text-[var(--fg)] hover:border-[var(--line-2)] hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--green)] disabled:pointer-events-none disabled:opacity-50",
      className
    );
  }

  return cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[12px] font-normal leading-none transition-[color,background-color,border-color,opacity,translate,scale,box-shadow] duration-160 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--green)] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
    // Every button lifts on hover and presses on click (links stay put; reduced motion stays still).
    variant !== "link" && "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:duration-75 motion-reduce:translate-none motion-reduce:scale-100",
    // Variants
    variant === "default" &&
      "h-[32px] px-3.5 rounded-[6px] bg-[var(--green)] text-[var(--green-ink)] font-semibold border border-[var(--green)] hover:opacity-90",
    variant === "outline" &&
      "h-[30px] px-3 rounded-[6px] border border-[var(--line)] bg-transparent text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)] hover:border-[var(--line-2)]",
    variant === "secondary" &&
      "h-[30px] px-3 rounded-[6px] border border-[var(--line)] bg-[var(--hover)] text-[var(--fg)] hover:border-[var(--line-2)]",
    variant === "ghost" &&
      "h-[30px] px-2.5 rounded-[6px] bg-transparent text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]",
    variant === "destructive" &&
      "h-[30px] px-3 rounded-[6px] bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/20",
    variant === "link" &&
      "text-[var(--green)] underline-offset-4 hover:underline p-0 h-auto font-normal",
    // Sizing overrides if specified
    size === "sm" && variant !== "link" && "h-[24px] px-2 text-[11px]",
    size === "lg" && variant !== "link" && "h-[36px] px-4 text-[13px]",
    size === "icon" && variant !== "link" && "h-[30px] w-[30px] p-0",
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        // Opts the control into the site-wide button animation (globals.css, "Button and link animation").
        data-fx={variant === "link" ? undefined : "btn"}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export interface MotionButtonProps
  extends HTMLMotionProps<"button">,
    ButtonVariantProps {}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant = "default", size = "default", whileHover, whileTap, transition, ...props }, ref) => {
    return (
      <m.button
        ref={ref}
        // motion/react animates this one; drop the CSS lift so the two don't fight.
        data-fx={variant === "link" ? undefined : "btn"}
        className={cn(buttonVariants({ variant, size, className }), "hover:translate-y-0 active:scale-100")}
        whileHover={whileHover ?? { y: -2, scale: 1.02 }}
        whileTap={whileTap ?? { scale: 0.96 }}
        transition={transition ?? { type: "spring" as const, stiffness: 450, damping: 25 }}
        {...props}
      />
    );
  }
);
MotionButton.displayName = "MotionButton";
