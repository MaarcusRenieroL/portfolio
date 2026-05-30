"use client";

import { useEffect, FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { CommandPalette } from "../misc/command-palette";
import { ModeToggle } from "../misc/theme-switcher";

export const Navbar: FC = () => {
  const pathname = usePathname();

  const navigate = (href: string) => {
    if (href === pathname) return;

    window.dispatchEvent(
      new CustomEvent("route-loading-start", {
        detail: href,
      }),
    );
  };

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

        case "b":
        case "B":
          navigate("/blogs");
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

  return (
    <nav className="sticky top-5 z-20 relative flex w-full items-center justify-between gap-5 border border-border/60 bg-background/75 px-3 py-2 backdrop-blur-md before:absolute before:left-1/2 before:top-0 before:-z-10 before:h-full before:w-screen before:-translate-x-1/2 before:border-y before:border-border/60 before:bg-background/75 before:backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {NAV_LINKS.map((link) => {
          const href = `/${link === "home" ? "" : link}`;
          const isActive = pathname === href;

          return (
            <Link
              key={link}
              href={href}
              className={cn(
                "text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground",
                isActive && "font-medium text-primary",
              )}
            >
              {"[" + link.at(0) + "] " + link}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <CommandPalette />
        <ModeToggle />
      </div>
    </nav>
  );
};
