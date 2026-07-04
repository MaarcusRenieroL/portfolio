"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseIcon,
  CopyIcon,
  FileTextIcon,
  FolderGit2Icon,
  HomeIcon,
  LayersIcon,
  MailIcon,
  MessageSquareIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { PROJECTS } from "~/lib/constants";

const pageActions = [
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
    label: "about",
    shortcut: "a",
    description: "learn the person behind the repos",
    href: "/about",
    icon: UserIcon,
  },
  {
    label: "stack",
    shortcut: "s",
    description: "view tools, skills, and current edges",
    href: "/stack",
    icon: LayersIcon,
  },
  {
    label: "blog",
    shortcut: "b",
    description: "read notes and build logs",
    href: "/blog",
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
    label: "contact",
    shortcut: "c",
    description: "open contact options",
    href: "/contact",
    icon: MessageSquareIcon,
  },
  {
    label: "email",
    shortcut: "e",
    description: "start a conversation",
    href: "mailto:maarcusreniero.l@gmail.com",
    icon: MailIcon,
  },
  {
    label: "copy email",
    shortcut: "copy",
    description: "copy my email address",
    href: "copy:maarcusreniero.l@gmail.com",
    icon: CopyIcon,
  },
];

const projectActions = PROJECTS.map((project) => ({
  label: project.title,
  shortcut: "project",
  description: project.description,
  href: `/projects/${project.id}`,
  icon: FolderGit2Icon,
}));

const actions = [...pageActions, ...projectActions];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  // only auto-scroll the list on keyboard nav, never on mouse hover.
  const keyboardNav = useRef(false);

  const filteredActions = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.label} ${action.description}`.toLowerCase().includes(value),
    );
  }, [query]);

  const runAction = useCallback((href: string) => {
    setOpen(false);
    setQuery("");

    if (href.startsWith("copy:")) {
      void navigator.clipboard?.writeText(href.replace("copy:", ""));
      return;
    }

    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    window.dispatchEvent(
      new CustomEvent("route-loading-start", {
        detail: href,
      }),
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "k" || event.key === "K")
      ) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (!open) return;

      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        keyboardNav.current = true;

        setSelected((current) =>
          Math.min(current + 1, Math.max(filteredActions.length - 1, 0)),
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        keyboardNav.current = true;

        setSelected((current) => Math.max(current - 1, 0));

        return;
      }

      if (event.key === "Enter" && filteredActions[selected]) {
        event.preventDefault();
        runAction(filteredActions[selected].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredActions, open, runAction, selected]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected(0);
      keyboardNav.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!keyboardNav.current) return;
    keyboardNav.current = false;
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 border border-border/60 bg-background/55 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground sm:px-3"
        aria-label="open command palette"
      >
        <SearchIcon className="size-3.5" />
        <span className="hidden text-[11px] sm:inline">search</span>
        <span className="hidden min-w-10 border border-border/60 bg-background/70 px-1.5 py-0.5 text-center text-[10px] leading-none text-muted-foreground sm:inline">
          ⌘K
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/65 p-3 backdrop-blur-md sm:p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="close command palette"
            onClick={() => setOpen(false)}
          />

          <div className="relative mt-14 flex max-h-[min(680px,calc(100dvh-7rem))] w-full max-w-xl flex-col overflow-hidden border border-border/70 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:mt-20">
            <div className="border-b border-border/60 bg-card/45 px-4 py-3 sm:px-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-primary">
                  command center
                </span>

                <span className="min-w-9 border border-border/60 px-2 py-1 text-center text-[10px] text-muted-foreground">
                  esc
                </span>
              </div>

              <div className="flex items-center gap-3">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />

                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="type a destination..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="command palette input"
                />
              </div>
            </div>

            <div
              ref={listRef}
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto p-1.5 sm:p-2"
            >
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                const isActive = selected === index;

                return (
                  <button
                    key={action.href}
                    type="button"
                    data-active={isActive}
                    onMouseMove={() => setSelected(index)}
                    onClick={() => runAction(action.href)}
                    className={cn(
                      "group flex w-full items-start gap-3 border-l-2 border-transparent px-3 py-3 text-left transition-colors sm:items-center",
                      isActive
                        ? "border-l-primary bg-primary/10 text-foreground"
                        : "text-foreground/90 hover:bg-card/55 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center border border-border/60 bg-background/60 text-primary transition-colors sm:mt-0",
                        isActive && "border-primary/45 bg-primary/10",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium leading-5">
                        {action.label}
                      </span>

                      <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {action.description}
                      </span>
                    </span>

                    <span className="hidden min-w-12 shrink-0 border border-border/60 px-2 py-1 text-center text-[10px] text-muted-foreground sm:inline">
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
