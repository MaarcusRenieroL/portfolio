import * as React from "react";
import { cn } from "~/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "zoro";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50 select-none",
          variant === "default" && "bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 active:translate-y-px",
          variant === "zoro" && "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 hover:border-emerald-400 hover:text-emerald-200 shadow-sm shadow-emerald-950/50",
          variant === "destructive" && "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
          variant === "outline" && "border border-neutral-800 bg-transparent text-neutral-200 hover:bg-neutral-900 hover:text-neutral-50 hover:border-neutral-700",
          variant === "secondary" && "bg-neutral-900 text-neutral-200 border border-neutral-800 hover:bg-neutral-800",
          variant === "ghost" && "hover:bg-neutral-800/60 text-neutral-300 hover:text-white",
          variant === "link" && "text-emerald-400 underline-offset-4 hover:underline",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-10 rounded-md px-8",
          size === "icon" && "h-9 w-9 p-0",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
