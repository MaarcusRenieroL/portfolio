"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { geistMono } from "~/lib/font";

type Props = {
  className?: string;
};

export const MidNav: FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        className,
        "h-20 flex items-center justify-evenly space-x-5 p-4 border-l border-b rounded-bl-3xl"
      )}
    >
      <Link
        href="/"
        className={cn(
          pathname === "/" ? "underline underline-offset-4 font-bold" : "",
          geistMono.className
        )}
      >
        About
      </Link>
      <Link
        href="/resume"
        className={cn(
          pathname === "/resume"
            ? "underline underline-offset-4 font-bold"
            : "",
          geistMono.className
        )}
      >
        Resume
      </Link>
      <Link
        href="/portfolio"
        className={cn(
          pathname === "/portfolio"
            ? "underline underline-offset-4 font-bold"
            : "",
          geistMono.className
        )}
      >
        Portfolio
      </Link>
      <Link
        href="/blog"
        className={cn(
          pathname === "/blog" ? "underline underline-offset-4 font-bold" : "",
          geistMono.className
        )}
      >
        Blog
      </Link>
      <Link
        href="/contact"
        className={cn(
          pathname === "/contact"
            ? "underline underline-offset-4 font-bold"
            : "",
          geistMono.className
        )}
      >
        Contact
      </Link>
    </div>
  );
};
