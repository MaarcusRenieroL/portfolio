"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MidNav: FC = () => {
  const pathname = usePathname();

  return (
    <div className="h-20 flex items-center justify-evenly space-x-5 p-4 border-l border-b rounded-bl-3xl">
      <Link
        href="/about"
        className={
          pathname === "/about"
            ? "underline underline-offset-4 text-red-500"
            : ""
        }
      >
        About
      </Link>
      <Link
        href="/resume"
        className={
          pathname === "/resume"
            ? "underline underline-offset-4 text-red-500"
            : ""
        }
      >
        Resume
      </Link>
      <Link
        href="/portfolio"
        className={
          pathname === "/portfolio"
            ? "underline underline-offset-4 text-red-500"
            : ""
        }
      >
        Portfolio
      </Link>
      <Link
        href="/blog"
        className={
          pathname === "/blog"
            ? "underline underline-offset-4 text-red-500"
            : ""
        }
      >
        Blog
      </Link>
      <Link
        href="/contact"
        className={
          pathname === "/contact"
            ? "underline underline-offset-4 text-red-500"
            : ""
        }
      >
        Contact
      </Link>
    </div>
  );
};
