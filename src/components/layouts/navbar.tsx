"use client";

import { useCallback, useEffect, FC, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ClockIcon,
  LayersIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { CommandPalette } from "../misc/command-palette";
import { ModeToggle } from "../misc/theme-switcher";

const primaryLinks = ["home", "projects", "about", "contact"];
const secondaryLinks = ["stack", "now", "blogs", "resume"];
const linkDescriptions: Record<string, string> = {
  stack: "tools, skills, and current edges",
  now: "what has my attention right now",
  blogs: "notes, build logs, and thoughts",
  resume: "career snapshot and downloadable pdf",
};
const linkIcons = {
  stack: LayersIcon,
  now: ClockIcon,
  blogs: BookOpenIcon,
  resume: BriefcaseIcon,
};
const shortcutByLink: Record<string, string> = {
  home: "h",
  projects: "p",
  about: "a",
  stack: "s",
  now: "n",
  blogs: "b",
  contact: "c",
  resume: "r",
};

export const Navbar: FC = () => {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const activeLink = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0] ?? "home";
    return segment;
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    if (href === pathname) return;

    window.dispatchEvent(
      new CustomEvent("route-loading-start", {
        detail: href,
      }),
    );
  }, [pathname]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case "h":
        case "H":
          navigate("/");
          break;

        case "p":
        case "P":
          navigate("/projects");
          break;

        case "a":
        case "A":
          navigate("/about");
          break;

        case "s":
        case "S":
          navigate("/stack");
          break;

        case "n":
        case "N":
          navigate("/now");
          break;

        case "b":
        case "B":
          navigate("/blogs");
          break;

        case "c":
        case "C":
          navigate("/contact");
          break;

        case "r":
        case "R":
          navigate("/resume");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [pathname, navigate]);

  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const renderLink = (link: string, compact = false) => {
    const href = `/${link === "home" ? "" : link}`;
    const isActive =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    const shortcut = shortcutByLink[link];

    return (
      <Link
        key={link}
        href={href}
        title={`open ${link}. shortcut: ${shortcut}`}
        className={cn(
          "group relative inline-flex h-9 items-center justify-center gap-2 px-3 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground",
          compact && "h-10 justify-between border border-border/50 bg-background/45",
          isActive && "font-medium text-primary",
        )}
      >
        <span>{link}</span>
        {shortcut && (
          <span
            className={cn(
              "grid min-w-5 place-items-center border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary",
              isActive && "border-primary/45 text-primary",
            )}
            aria-hidden="true"
          >
            {shortcut}
          </span>
        )}
        <span
          className={cn(
            "absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300",
            isActive && "scale-x-100",
            compact && "hidden",
          )}
        />
      </Link>
    );
  };

  const renderDropdownLink = (link: string) => {
    const href = `/${link}`;
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    const shortcut = shortcutByLink[link];
    const Icon = linkIcons[link as keyof typeof linkIcons];

    return (
      <Link
        key={link}
        href={href}
        title={`open ${link}. shortcut: ${shortcut}`}
        className={cn(
          "group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 border border-transparent px-3 py-3 text-left transition-colors hover:border-primary/35 hover:bg-primary/5",
          isActive && "border-primary/45 bg-primary/10",
        )}
      >
        <span
          className={cn(
            "grid size-9 place-items-center border border-border/60 bg-background/60 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary",
            isActive && "border-primary/45 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>

        <span className="min-w-0">
          <span
            className={cn(
              "block text-sm font-medium text-foreground",
              isActive && "text-primary",
            )}
          >
            {link}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {linkDescriptions[link]}
          </span>
        </span>

        <span
          className={cn(
            "grid min-w-5 place-items-center border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground",
            isActive && "border-primary/45 text-primary",
          )}
          aria-hidden="true"
        >
          {shortcut}
        </span>
      </Link>
    );
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-5 z-20 relative flex w-full flex-col gap-2 border border-border/60 bg-background/78 px-3 py-2 backdrop-blur-md before:absolute before:left-1/2 before:top-0 before:-z-10 before:h-full before:w-screen before:-translate-x-1/2 before:border-y before:border-border/60 before:bg-background/78 before:backdrop-blur-md"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground"
          title="open home. shortcut: h"
        >
          <span className="grid size-7 shrink-0 place-items-center border border-primary/45 bg-primary/10 text-xs text-primary">
            mr
          </span>
          <span className="hidden sm:inline">maarcus.dev</span>
          <span className="truncate text-xs font-medium text-muted-foreground sm:hidden">
            {activeLink}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => renderLink(link))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((current) => !current)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                secondaryLinks.includes(activeLink) && "font-medium text-primary",
              )}
              aria-expanded={moreOpen}
              title="more pages"
            >
              more
              <ChevronDownIcon
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  moreOpen && "rotate-180",
                )}
              />
            </button>

            {moreOpen && (
              <div className="animate-panel-in absolute right-0 top-11 w-80 overflow-hidden border border-border/70 bg-background/95 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur">
                <div className="border-b border-border/60 bg-card/35 px-4 py-3">
                  <p className="text-xs font-semibold text-primary">
                    more routes
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    keyboard shortcuts work from anywhere
                  </p>
                </div>

                <div className="grid gap-1 p-1.5">
                  {secondaryLinks.map((link) => renderDropdownLink(link))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CommandPalette />
          <ModeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="grid size-9 place-items-center border border-border/60 bg-background/55 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground md:hidden"
            aria-label="toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="grid gap-1 border-t border-border/60 pt-2 md:hidden">
          {NAV_LINKS.map((link) => renderLink(link, true))}
        </div>
      )}
    </nav>
  );
};
