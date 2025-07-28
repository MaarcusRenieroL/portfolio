"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FC } from "react";
import { ModeToggle } from "../misc/theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";

export const Navbar: FC = () => {

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        event.target instanceof HTMLInputElement
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case "h":
          router.push("/")
          break
        case "p":
          router.push("/projects")
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router])

  return (
    <nav className="w-full flex items-center justify-between gap-5">
      <div className="flex items-center gap-5">
        {NAV_LINKS.map((link) => {
          return (
            <Link key={link} href={`/${link === "home" ? "" : link}`} className={cn("text-sm hover:text-green-500 transition-colors duration-500", pathname === link ? "text-green-500" : "")}>{"[" + link.at(0) + "] " + link}</Link>
          )
        })}

      </div>

      <ModeToggle />

    </nav >
  )
}
