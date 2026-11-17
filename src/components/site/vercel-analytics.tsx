"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics, skipped for visitors who send Global Privacy Control or Do Not Track (as /privacy promises). */
export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
        return nav.globalPrivacyControl || nav.doNotTrack === "1" ? null : event;
      }}
    />
  );
}
