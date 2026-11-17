"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Particles = dynamic(() => import("./particles").then((m) => m.Particles), { ssr: false });
const Motion = dynamic(() => import("./motion").then((m) => m.Motion), { ssr: false });
const ZoroCyberCursor = dynamic(() => import("~/components/cursor/zoro-cyber-cursor").then((m) => m.ZoroCyberCursor), { ssr: false });
const Scramble = dynamic(() => import("./scramble").then((m) => m.Scramble), { ssr: false });
const Life = dynamic(() => import("./life").then((m) => m.Life), { ssr: false });
const Events = dynamic(() => import("./events").then((m) => m.Events), { ssr: false });
const ShortcutsHelp = dynamic(() => import("./shortcuts").then((m) => m.ShortcutsHelp), { ssr: false });
const SoundListener = dynamic(() => import("~/components/sound/sound-listener").then((m) => m.SoundListener), { ssr: false });

/**
 * The site's extras (particles, smooth scroll, cursor, title scramble, count-ups, analytics,
 * shortcuts, sounds), mounted once the browser is idle after the page has painted. The page's
 * text never waits for them, so it reads instantly even on a slow phone; they arrive a moment later.
 */
export function IdleEffects() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(go, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(go, 400);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return null;
  return (
    <>
      <Particles />
      <Motion />
      <ZoroCyberCursor />
      <Scramble />
      <Life />
      <Events />
      <ShortcutsHelp />
      <SoundListener />
    </>
  );
}
