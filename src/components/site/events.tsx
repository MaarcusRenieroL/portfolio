"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function beacon(k: string, t?: string) {
  try {
    const body = JSON.stringify({ k, p: location.pathname, t });
    if (!navigator.sendBeacon?.("/api/e", new Blob([body], { type: "text/plain" }))) void fetch("/api/e", { method: "POST", body, keepalive: true });
  } catch {
    /* analytics must never break the page */
  }
}

/** Reports page views and clicks on anything marked data-track="name" (optional data-track-label="…"). One listener for the whole site. */
export function Events() {
  const pathname = usePathname();
  useEffect(() => {
    beacon("view");
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const label = el.dataset.trackLabel;
      track(el.dataset.track!, label ? { label } : undefined);
      if (el.dataset.track !== "resume-download") beacon(el.dataset.track!, label); // downloads are counted by the server
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
