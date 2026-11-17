"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";
import { cn } from "~/lib/utils";

/** shadcn/ui ToggleGroup (outline style) on the site's tokens. */
const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>>(
  ({ className, ...props }, ref) => <ToggleGroupPrimitive.Root ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />,
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md border border-[var(--line)] px-3 text-xs text-[var(--fg-2)] transition-[color,background-color,border-color,translate,scale] duration-160",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:translate-none motion-reduce:scale-100",
        "hover:bg-[var(--hover)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--green)]",
        "data-[state=on]:border-[var(--green)] data-[state=on]:bg-[var(--green-wash)] data-[state=on]:text-[var(--green)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
