"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseIcon,
  FileTextIcon,
  FolderGit2Icon,
  HomeIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";

const actions = [
  {
    label: "home",
    shortcut: "h",
    description: "return to the main feed",
    href: "/",
    icon: HomeIcon,
  },
  {
    label: "projects",
    shortcut: "p",
    description: "view active builds and experiments",
    href: "/projects",
    icon: FolderGit2Icon,
  },
  {
    label: "blogs",
    shortcut: "b",
    description: "read notes and build logs",
    href: "/blogs",
    icon: FileTextIcon,
  },
  {
    label: "resume",
    shortcut: "r",
    description: "open the resume pdf",
    href: "/resume",
    icon: BriefcaseIcon,
  },
  {
    label: "email",
    shortcut: "e",
    description: "start a conversation",
    href: "mailto:maarcusreniero.l@gmail.com",
    icon: MailIcon,
  },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filteredActions = useMemo(() => {
    const value = query.trim();

    if (!value) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.label} ${action.description}`.includes(value)
    );
  }, [query]);

  const runAction = useCallback((href: string) => {
    setOpen(false);
    setQuery("");

    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    router.push(href);
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (!open) {
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((current) =>
          Math.min(current + 1, Math.max(filteredActions.length - 1, 0))
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter" && filteredActions[selected]) {
        event.preventDefault();
        runAction(filteredActions[selected].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredActions, open, runAction, selected]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 border border-border/60 bg-background/55 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
        aria-label="open command palette"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span className="hidden text-[11px] sm:inline">cmd k</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/55 p-4 backdrop-blur-md">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="close command palette"
            onClick={() => setOpen(false)}
          />

          <div className="relative mx-auto mt-16 w-full max-w-lg overflow-hidden border border-border/70 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="border-b border-border/60 bg-card/35 px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs font-medium uppercase text-primary">
                  command center
                </span>
                <span className="border border-border/60 px-2 py-1 text-[10px] uppercase text-muted-foreground">
                  esc
                </span>
              </div>

              <div className="flex items-center gap-3">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="type a destination..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-1.5">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.href}
                    type="button"
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => runAction(action.href)}
                    className={cn(
                      "group flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-3 text-left transition-colors",
                      selected === index
                        ? "border-l-primary bg-primary/10"
                        : "hover:bg-card/50"
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center border border-border/60 bg-background/60 text-primary transition-colors group-hover:border-primary/40">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                    <span className="border border-border/60 px-2 py-1 text-[10px] text-muted-foreground">
                      {action.shortcut}
                    </span>
                  </button>
                );
              })}

              {filteredActions.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  no command found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
