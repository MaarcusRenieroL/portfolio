"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * shadcn/ui Calendar (react-day-picker v9), styled with the site's tokens
 * (--green, --line, --hover, --fg-*) instead of shadcn's --primary/--accent,
 * which this project doesn't define.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  const d = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1 [--cell:2.25rem]", className)}
      classNames={{
        root: cn("w-fit", d.root),
        months: cn("relative flex flex-col gap-4", d.months),
        month: cn("flex w-full flex-col gap-3", d.month),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", d.nav),
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-[var(--cell)] p-0 text-[var(--fg-2)] aria-disabled:opacity-40", d.button_previous),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-[var(--cell)] p-0 text-[var(--fg-2)] aria-disabled:opacity-40", d.button_next),
        month_caption: cn("flex h-[var(--cell)] items-center justify-center px-[var(--cell)]", d.month_caption),
        caption_label: cn("text-sm font-medium text-[var(--fg)] select-none", d.caption_label),
        weekdays: cn("flex", d.weekdays),
        weekday: cn("w-[var(--cell)] text-[11px] font-normal text-[var(--fg-3)] select-none", d.weekday),
        week: cn("mt-1 flex w-full", d.week),
        day: cn("relative size-[var(--cell)] p-0 text-center text-[13px]", d.day),
        day_button: cn(
          "inline-flex size-[var(--cell)] items-center justify-center rounded-md text-[var(--fg)] transition-colors",
          "hover:bg-[var(--hover)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--green)]",
          "disabled:pointer-events-none",
        ),
        // Today is marked only while it can still be picked; a disabled today looks like any other past day.
        today: cn("[&>button:enabled]:font-semibold [&>button:enabled]:text-[var(--green)]", d.today),
        selected: cn("[&>button]:bg-[var(--green)] [&>button]:!text-[var(--green-ink)] [&>button]:font-semibold [&>button:hover]:bg-[var(--green)]", d.selected),
        outside: cn("[&>button]:text-[var(--fg-3)] [&>button]:opacity-50", d.outside),
        disabled: cn("[&>button]:text-[var(--fg-3)] [&>button]:opacity-35", d.disabled),
        hidden: cn("invisible", d.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c }) =>
          orientation === "left" ? <ChevronLeft className={cn("size-4", c)} aria-hidden="true" /> : <ChevronRight className={cn("size-4", c)} aria-hidden="true" />,
      }}
      {...props}
    />
  );
}

export { Calendar };
