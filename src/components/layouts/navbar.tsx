"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FC } from "react";
import { ModeToggle } from "../misc/theme-switcher";
import { useRouter } from "next/navigation";
import { NAV_LINKS } from "~/lib/constants";

export const Navbar: FC = () => {

  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if any input elements are focused or if event target is an input
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
            <Link key={link} href={`/${link === "home" ? "" : link}`} className="text-sm hover:text-green-500 transition-colors duration-500">{"[" + link.at(0) + "] " + link}</Link>
          )
        })}

      </div>

      <ModeToggle />

    </nav >
  )
}
