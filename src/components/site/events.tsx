"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

/** Reports clicks on anything marked data-track="name" (optional data-track-label="…"). One listener for the whole site. */
export function Events() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const label = el.dataset.trackLabel;
      track(el.dataset.track!, label ? { label } : undefined);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
