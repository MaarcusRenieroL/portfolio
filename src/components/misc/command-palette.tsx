"use client";

import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ContrastIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  FolderGit2Icon,
  GithubIcon,
  HomeIcon,
  LayersIcon,
  LinkedinIcon,
  MailIcon,
  NewspaperIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareTerminalIcon,
  UserIcon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { LINKS } from "~/lib/constants";
import { SearchDoc } from "~/lib/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

type CommandGroup = "navigate" | "actions" | "connect" | "system";

type PaletteCommand = {
  id: string;
  label: string;
  hint?: string;
  group: CommandGroup;
  icon: ComponentType<{ className?: string }>;
  keywords?: string;
  run: () => void;
};

type ResultItem =
  | { kind: "doc"; id: string; doc: SearchDoc }
  | { kind: "command"; id: string; command: PaletteCommand };

type ResultSection = {
  label: string;
  items: ResultItem[];
};

const COMMAND_GROUP_LABELS: Record<CommandGroup, string> = {
  navigate: "navigate",
  actions: "actions",
  connect: "elsewhere",
  system: "system",
};

const DOC_GROUP_LABELS: Record<SearchDoc["group"], string> = {
  pages: "pages",
  projects: "projects",
  blog: "blog",
  stack: "stack",
};

const DOC_GROUP_ICONS: Record<
  SearchDoc["group"],
  ComponentType<{ className?: string }>
> = {
  pages: FileTextIcon,
  projects: FolderGit2Icon,
  blog: NewspaperIcon,
  stack: LayersIcon,
};

const EMAIL = "maarcusreniero.l@gmail.com";

function navigate(href: string) {
  window.dispatchEvent(new CustomEvent("route-loading-start", { detail: href }));
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function scoreDoc(doc: SearchDoc, query: string) {
  const title = doc.title.toLowerCase();
  if (title.startsWith(query)) return 3;
  if (title.includes(query)) return 2;

  const haystack = `${doc.description} ${doc.keywords ?? ""}`.toLowerCase();
  if (haystack.includes(query)) return 1;

  return 0;
}

function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim().toLowerCase();
  if (!q) return text;

  const index = text.toLowerCase().indexOf(q);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent text-primary underline decoration-primary/60 underline-offset-2">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}

type CommandPaletteProps = {
  docs?: SearchDoc[];
};

export function CommandPalette({ docs = [] }: CommandPaletteProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    setSystemMessage(null);
  }, []);

  const copyEmail = useCallback(async () => {
    await navigator.clipboard?.writeText(EMAIL);
    setSystemMessage(`> ${EMAIL} copied to clipboard`);
    window.setTimeout(close, 900);
  }, [close]);

  const downloadResume = useCallback(() => {
    const link = document.createElement("a");
    link.href = "/api/resume";
    link.download = "maarcus-reniero-resume.pdf";
    link.click();
    close();
  }, [close]);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    const direction = resolvedTheme === "dark" ? "bottom-left" : "top-right";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      close();
      return;
    }

    document.documentElement.dataset.themeTransition = direction;
    const transition = document.startViewTransition(() => setTheme(nextTheme));
    transition.finished.finally(() => {
      delete document.documentElement.dataset.themeTransition;
    });
    close();
  }, [resolvedTheme, setTheme, close]);

  const whoami = useCallback(() => {
    setSystemMessage(
      "> mr / full-stack software engineer / chennai, india / status: available",
    );
  }, []);

  const sudoHireMe = useCallback(() => {
    setSystemMessage("> permission granted — redirecting to /contact");
    window.setTimeout(() => {
      navigate("/contact");
      close();
    }, 700);
  }, [close]);

  const commands = useMemo<PaletteCommand[]>(
    () => [
      { id: "nav-home", label: "go to home", group: "navigate", icon: HomeIcon, run: () => { navigate("/"); close(); } },
      { id: "nav-projects", label: "go to projects", group: "navigate", icon: FolderGit2Icon, run: () => { navigate("/projects"); close(); } },
      { id: "nav-blog", label: "go to blog", group: "navigate", icon: NewspaperIcon, run: () => { navigate("/blog"); close(); } },
      { id: "nav-about", label: "go to about", group: "navigate", icon: UserIcon, run: () => { navigate("/about"); close(); } },
      { id: "nav-stack", label: "go to stack", group: "navigate", icon: LayersIcon, run: () => { navigate("/stack"); close(); } },
      { id: "nav-contact", label: "go to contact", group: "navigate", icon: MailIcon, run: () => { navigate("/contact"); close(); } },
      { id: "nav-resume", label: "go to resume", group: "navigate", icon: FileTextIcon, run: () => { navigate("/resume"); close(); } },

      { id: "action-theme", label: "toggle theme", hint: resolvedTheme === "dark" ? "dark → light" : "light → dark", group: "actions", icon: ContrastIcon, run: toggleTheme },
      { id: "action-copy-email", label: "copy email address", keywords: EMAIL, group: "actions", icon: CopyIcon, run: copyEmail },
      { id: "action-download-resume", label: "download resume", keywords: "cv pdf", group: "actions", icon: DownloadIcon, run: downloadResume },

      { id: "connect-github", label: "open github", keywords: "repo code source", group: "connect", icon: GithubIcon, run: () => { const l = LINKS.find((l) => l.name === "github"); if (l) openExternal(l.url); close(); } },
      { id: "connect-linkedin", label: "open linkedin", group: "connect", icon: LinkedinIcon, run: () => { const l = LINKS.find((l) => l.name === "linkedin"); if (l) openExternal(l.url); close(); } },
      { id: "connect-source", label: "view source of this site", keywords: "github repo portfolio code", group: "connect", icon: GithubIcon, run: () => openExternal("https://github.com/maarcusrenierol/portfolio") },

      { id: "system-whoami", label: "whoami", keywords: "identity info", group: "system", icon: SquareTerminalIcon, run: whoami },
      { id: "system-sudo", label: "sudo hire me", keywords: "job opportunity work", group: "system", icon: ShieldCheckIcon, run: sudoHireMe },
    ],
    [resolvedTheme, toggleTheme, copyEmail, downloadResume, whoami, sudoHireMe, close],
  );

  const sections = useMemo<ResultSection[]>(() => {
    const q = query.trim().toLowerCase();

    // empty query: quick links + commands, like the default cmd-k state.
    if (!q) {
      const grouped: ResultSection[] = [];
      for (const command of commands) {
        const label = COMMAND_GROUP_LABELS[command.group];
        const last = grouped[grouped.length - 1];
        const item: ResultItem = { kind: "command", id: command.id, command };
        if (last && last.label === label) {
          last.items.push(item);
        } else {
          grouped.push({ label, items: [item] });
        }
      }
      return grouped;
    }

    // typed query: search real content first, matching commands after.
    const result: ResultSection[] = [];

    for (const group of ["pages", "projects", "blog", "stack"] as const) {
      const matches = docs
        .filter((doc) => doc.group === group)
        .map((doc) => ({ doc, score: scoreDoc(doc, q) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry): ResultItem => ({ kind: "doc", id: entry.doc.id, doc: entry.doc }));

      if (matches.length > 0) {
        result.push({ label: DOC_GROUP_LABELS[group], items: matches });
      }
    }

    const commandMatches = commands
      .filter((command) => command.group !== "navigate")
      .filter((command) =>
        `${command.label} ${command.keywords ?? ""}`.toLowerCase().includes(q),
      )
      .map((command): ResultItem => ({ kind: "command", id: command.id, command }));

    if (commandMatches.length > 0) {
      result.push({ label: "commands", items: commandMatches });
    }

    return result;
  }, [commands, docs, query]);

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  const runItem = useCallback(
    (item: ResultItem) => {
      if (item.kind === "command") {
        item.command.run();
        return;
      }

      navigate(item.doc.href);
      close();
    },
    [close],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, flatItems.length - 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const item = flatItems[activeIndex];
        if (item) runItem(item);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, flatItems, activeIndex, close, runItem]);

  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let flatIndex = -1;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground"
        aria-label="open command palette"
      >
        <SearchIcon className="size-3.5" />
        <span className="hidden lg:inline">search</span>
        <Badge variant="secondary" className="hidden lg:inline-flex">
          {typeof navigator !== "undefined" && navigator.platform?.toLowerCase().includes("mac") ? "⌘K" : "ctrl K"}
        </Badge>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex justify-center bg-background/80 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative h-fit w-full max-w-xl animate-panel-in overflow-hidden border border-border/60 bg-card/95 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-primary/60" />

            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="text-sm text-primary">{">_"}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="search pages, projects, posts…"
                className="h-6 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="command palette input"
              />
              <Badge variant="secondary" className="shrink-0">
                esc
              </Badge>
            </div>

            {systemMessage ? (
              <div className="px-4 py-6 text-sm text-primary">{systemMessage}</div>
            ) : (
              <div
                ref={listRef}
                data-lenis-prevent
                className="palette-scroll max-h-[22rem] overflow-y-auto overscroll-contain p-2"
              >
                {sections.length === 0 && (
                  <div className="flex flex-col items-center gap-1 px-2 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      no results for{" "}
                      <span className="text-foreground">
                        &ldquo;{query.trim()}&rdquo;
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      try searching pages, projects, or posts
                    </p>
                  </div>
                )}

                {sections.map((section) => (
                  <div key={section.label} className="mb-1 last:mb-0">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                      {section.label}
                    </p>

                    {section.items.map((item) => {
                      flatIndex += 1;
                      const isActive = flatIndex === activeIndex;

                      if (item.kind === "command") {
                        const Icon = item.command.icon;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-active={isActive}
                            onMouseMove={
                              isActive ? undefined : () => setActiveIndex(flatIndex)
                            }
                            onClick={() => runItem(item)}
                            className={cn(
                              "flex w-full items-center gap-3 border border-transparent px-3 py-2 text-left text-sm text-foreground/90 transition-colors duration-200",
                              isActive && "border-primary/50 bg-primary/10 text-primary",
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate">
                              {highlightMatch(item.command.label, query)}
                            </span>
                            {item.command.hint && (
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {item.command.hint}
                              </span>
                            )}
                          </button>
                        );
                      }

                      const Icon = DOC_GROUP_ICONS[item.doc.group];

                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-active={isActive}
                          onMouseMove={
                            isActive ? undefined : () => setActiveIndex(flatIndex)
                          }
                          onClick={() => runItem(item)}
                          className={cn(
                            "flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-left transition-colors duration-200",
                            isActive && "border-primary/50 bg-primary/10",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center border border-border/60 bg-background/55 text-muted-foreground",
                              isActive && "border-primary/50 text-primary",
                            )}
                          >
                            <Icon className="size-4" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-sm text-foreground/90",
                                isActive && "text-primary",
                              )}
                            >
                              {highlightMatch(item.doc.title, query)}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {highlightMatch(item.doc.description, query)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="secondary">↑↓</Badge> navigate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="secondary">↵</Badge> select
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="secondary">esc</Badge> close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
