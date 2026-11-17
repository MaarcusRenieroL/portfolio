import * as React from "react";
import { cn } from "~/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "w-full min-h-[9rem] resize-vertical leading-[1.55] font-inherit text-[13px] text-[var(--fg)] bg-transparent border border-[var(--line)] rounded-[6px] px-2.5 py-2 placeholder:text-[var(--fg-3)] transition-colors duration-160 hover:border-[var(--line-2)] focus:outline-none focus:border-[var(--green)] focus:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
