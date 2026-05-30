"use client";

import { useEffect, FC } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { ModeToggle } from "../misc/theme-switcher";
export const Navbar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        (target as HTMLInputElement).isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "h":
          router.push("/");
          break;
        case "p":
          router.push("/projects");
          break;
        case "b":
          router.push("/blogs");
          break;
        // Add more shortcuts if needed
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  return (
    <nav className="sticky top-5 z-20 flex w-full items-center justify-between gap-5 border border-border/60 bg-background/75 px-3 py-2 backdrop-blur-md">
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
                isActive && "text-primary font-medium"
              )}
            >
              {"[" + link.at(0) + "] " + link}
            </Link>
          );
        })}
      </div>

      <ModeToggle />
    </nav>

  );
};
