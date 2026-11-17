"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "~/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, filter, ...props }, ref) => {
  // Every query word must appear in the value or keywords; a label that starts with the query ranks first.
  const defaultCommandFilter = (value: string, search: string, keywords?: string[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return 1;
    // With keywords the value is just an id: search the keywords (label first), never the id itself.
    const words = keywords?.length ? keywords : [value];
    const label = words[0].toLowerCase();
    const hay = words.join(" ").toLowerCase();
    if (!q.split(/\s+/).every((w) => hay.includes(w))) return 0;
    if (label.startsWith(q)) return 1;
    if (label.includes(q)) return 0.75;
    return 0.5;
  };

  return (
    <CommandPrimitive
      ref={ref}
      filter={filter ?? defaultCommandFilter}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-[var(--bg)] text-[var(--fg)]",
        className
      )}
      {...props}
    />
  );
});
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {
  label?: string;
}

const CommandDialog = ({
  children,
  label = "Command palette",
  ...props
}: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent
        aria-label={label}
        hideCloseButton
        className="overflow-hidden p-0 shadow-2xl border-[var(--line-2)] max-w-xl top-[24%] translate-y-[-24%] bg-[var(--bg)]"
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <DialogDescription className="sr-only">{label}</DialogDescription>
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--fg-3)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-1.5 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]]:rounded-lg">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--line)] px-3.5" cmdk-input-wrapper="">
    <Search className="mr-2.5 h-4 w-4 shrink-0 text-[var(--fg-3)]" />
    <CommandPrimitive.Input
      ref={ref}
      autoFocus
      className={cn(
        "flex h-12 w-full rounded-md bg-transparent py-3 text-sm font-sans outline-none placeholder:text-[var(--fg-3)] disabled:cursor-not-allowed disabled:opacity-50 text-[var(--fg)]",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-lenis-prevent
    style={{ height: "var(--cmdk-list-height)" }}
    className={cn(
      "max-h-[340px] overflow-y-auto overflow-x-hidden p-2 overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--line-2)] hover:[&::-webkit-scrollbar-thumb]:bg-[var(--green)]",
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-8 text-center text-xs font-mono text-[var(--fg-3)]"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-[var(--fg)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--fg-3)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-[var(--line)]", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2 text-xs font-sans outline-none transition-colors duration-150 data-[disabled=true]:pointer-events-none data-[selected=true]:bg-[var(--hover)] data-[selected=true]:text-[var(--green)] data-[disabled=true]:opacity-50 text-[var(--fg)]",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] font-mono tracking-widest text-[var(--fg-3)]",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
