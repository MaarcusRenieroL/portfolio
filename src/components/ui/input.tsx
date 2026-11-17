import * as React from "react";
import { cn } from "~/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "font-inherit text-[13px] text-[var(--fg)] placeholder:text-[var(--fg-3)] transition-colors duration-160 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // Standalone input styling matching .input
        "w-full bg-transparent border border-[var(--line)] rounded-[6px] px-2.5 py-1.5 hover:border-[var(--line-2)] focus:border-[var(--green)] focus:bg-[var(--hover)]",
        // Inside search bar: reset borders, bg, and padding
        "[.search_&]:border-0 [.search_&]:bg-transparent [.search_&]:p-0 [.search_&]:rounded-none [.search_&]:text-[14px] [.search_&]:flex-1 [.search_&]:min-w-0 [.search_&]:hover:border-0 [.search_&]:focus:bg-transparent [.search_&]:focus:border-0",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
