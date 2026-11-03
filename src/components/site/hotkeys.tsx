"use client";

import { useEffect } from "react";
import { SITE } from "~/lib/content";
import { emit, go } from "~/lib/ui";

const GOTO: Record<string, string> = {
  p: "/projects",
  e: "/experience",
  s: "/stack",
  a: "/about",
  c: "/contact",
  h: "/",
};

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest?.("[cmdk-root]");
}

/** ⌘K palette · ` terminal · T theme · G then P/E/S/A/C · ⌘D resume · ⌘⇧C copy email. */
export function Hotkeys() {
  useEffect(() => {
    let g = 0;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "k") {
        e.preventDefault();
        emit("palette");
        return;
      }
      if (mod && k === "d") {
        e.preventDefault();
        const a = document.createElement("a");
        a.href = "/api/resume";
        a.download = "";
        a.click();
        return;
      }
      if (mod && e.shiftKey && k === "c") {
        e.preventDefault();
        navigator.clipboard?.writeText(SITE.email);
        return;
      }
      if (mod || e.altKey || typing(e.target)) return;
      if (e.key === "`") {
        e.preventDefault();
        emit("terminal");
        return;
      }
      if (k === "t") {
        emit("theme");
        return;
      }
      if (g && Date.now() - g < 1200 && GOTO[k]) {
        g = 0;
        go(GOTO[k]);
        return;
      }
      g = k === "g" ? Date.now() : 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
