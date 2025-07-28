"use client";

import { useEffect, FC } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { ModeToggle } from "../misc/theme-switcher";
import { ScrollFadeIn } from "../misc/scroll-fade";

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
        // Add more shortcuts if needed
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  return (
    <ScrollFadeIn>
      <nav className="w-full flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          {NAV_LINKS.map((link) => {
            const href = `/${link === "home" ? "" : link}`;
            const isActive = pathname === href;

            return (
              <Link
                key={link}
                href={href}
                className={cn(
                  "text-sm transition-colors duration-300 hover:text-green-500",
                  isActive && "text-green-500 font-medium"
                )}
              >
                {"[" + link.at(0) + "] " + link}
              </Link>
            );
          })}
        </div>

        <ModeToggle />
      </nav>

    </ScrollFadeIn>
  );
};
