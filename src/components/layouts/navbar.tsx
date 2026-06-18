"use client";

import { useEffect, FC, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { ModeToggle } from "../misc/theme-switcher";

export const Navbar: FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const activeLink = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0] ?? "home";
    return segment;
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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

    return (
      <Link
        key={link}
        href={href}
        title={`open ${link}`}
        className={cn(
          "group relative inline-flex h-9 items-center justify-center gap-2 px-3 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground",
          compact && "h-10 justify-between border border-border/50 bg-background/45",
          isActive && "font-medium text-primary",
        )}
      >
        <span>{link}</span>
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

  return (
    <nav
      ref={navRef}
      className="sticky top-5 z-20 relative flex w-full flex-col gap-2 border border-border/60 bg-background/78 px-3 py-2 backdrop-blur-md before:absolute before:left-1/2 before:top-0 before:-z-10 before:h-full before:w-screen before:-translate-x-1/2 before:border-y before:border-border/60 before:bg-background/78 before:backdrop-blur-md"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground"
          title="open home"
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
          {NAV_LINKS.map((link) => renderLink(link))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
