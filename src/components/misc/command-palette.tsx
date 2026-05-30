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
    label: "Home",
    description: "return to the main feed",
    href: "/",
    icon: HomeIcon,
  },
  {
    label: "Projects",
    description: "view active builds and experiments",
    href: "/projects",
    icon: FolderGit2Icon,
  },
  {
    label: "Blogs",
    description: "read notes and build logs",
    href: "/blogs",
    icon: FileTextIcon,
  },
  {
    label: "Resume",
    description: "open the resume pdf",
    href: "/resume",
    icon: BriefcaseIcon,
  },
  {
    label: "Email",
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
    const value = query.trim().toLowerCase();

    if (!value) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.label} ${action.description}`.toLowerCase().includes(value)
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

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
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
        className="hidden border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:inline-flex"
      >
        <span>cmd+k</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/75 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close command palette"
            onClick={() => setOpen(false)}
          />

          <div className="relative mx-auto mt-24 w-full max-w-xl overflow-hidden border border-border/70 bg-background shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <SearchIcon className="h-4 w-4 text-primary" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="jump to..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="text-xs text-muted-foreground">esc</span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.href}
                    type="button"
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => runAction(action.href)}
                    className={cn(
                      "flex w-full items-center gap-3 border border-transparent px-3 py-3 text-left transition-colors",
                      selected === index
                        ? "border-primary/45 bg-primary/10"
                        : "hover:bg-card/60"
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {action.description}
                      </span>
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
