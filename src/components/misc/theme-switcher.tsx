"use client";

import { FC, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const ModeToggle: FC = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled aria-label="toggle theme">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    const direction = isDark ? "bottom-left" : "top-right";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    document.documentElement.dataset.themeTransition = direction;

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.finished.finally(() => {
      delete document.documentElement.dataset.themeTransition;
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      aria-label="toggle theme"
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-out",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />

      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-out",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
        )}
      />

      <span className="sr-only">toggle theme</span>
    </Button>
  );
};
