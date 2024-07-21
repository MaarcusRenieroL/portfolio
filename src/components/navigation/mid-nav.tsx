"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {cn} from "~/lib/utils"

type Props = {
  className?: string;
};

export const MidNav: FC<Props> = ({ className }) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        className,
        "h-20 flex items-center justify-evenly space-x-5 p-4 border-l border-b rounded-bl-3xl",
      )}
    >
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
