"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomBar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-center justify-evenly text-sm h-14 border-t rounded-t-2xl bg-background">
      <Link
        href="/"
        className={
          pathname === "/" ? "underline underline-offset-4 font-bold" : ""
        }
      >
        About
      </Link>
      <Link
        href="/resume"
        className={
          pathname === "/resume" ? "underline underline-offset-4 font-bold" : ""
        }
      >
        Resume
      </Link>
      <Link
        href="/portfolio"
        className={
          pathname === "/portfolio"
            ? "underline underline-offset-4 font-bold"
            : ""
        }
      >
        Portfolio
      </Link>
      <Link
        href="/blog"
        className={
          pathname === "/blog" ? "underline underline-offset-4 font-bold" : ""
        }
      >
        Blog
      </Link>
      <Link
        href="/contact"
        className={
          pathname === "/contact"
            ? "underline underline-offset-4 font-bold"
            : ""
        }
      >
        Contact
      </Link>
    </div>
  );
};
