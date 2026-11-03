"use client";

import dynamic from "next/dynamic";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Fx } from "./fx";
import { Hotkeys } from "./hotkeys";
import { RouteTransitions } from "./route-transitions";

const Palette = dynamic(() => import("./command-palette"), { ssr: false });
const Terminal = dynamic(() => import("./terminal"), { ssr: false });

function ThemeBridge() {
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => {
    const toggle = () => {
      const next = resolvedTheme === "light" ? "dark" : "light";
      const d = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
      const root = document.documentElement;
      if (!d.startViewTransition || root.dataset.tier === "0") {
        setTheme(next);
        return;
      }
      root.dataset.vt = "theme";
      const vt = d.startViewTransition(() => flushSync(() => setTheme(next)));
      vt.finished.finally(() => delete root.dataset.vt);
    };
    window.addEventListener("ui:theme", toggle);
    return () => window.removeEventListener("ui:theme", toggle);
  }, [resolvedTheme, setTheme]);
  return null;
}

function Overlays() {
  const [pal, setPal] = useState<boolean | null>(null);
  const [term, setTerm] = useState<boolean | null>(null);

  useEffect(() => {
    const onPal = () => setPal((v) => !v);
    const onTerm = () => setTerm((v) => !v);
    const preload = () => {
      void import("./command-palette");
    };
    window.addEventListener("ui:palette", onPal);
    window.addEventListener("ui:terminal", onTerm);
    window.addEventListener("ui:preload", preload);
    return () => {
      window.removeEventListener("ui:palette", onPal);
      window.removeEventListener("ui:terminal", onTerm);
      window.removeEventListener("ui:preload", preload);
    };
  }, []);

  return (
    <>
      {pal !== null && <Palette open={pal} onOpenChange={setPal} onTerminal={() => { setPal(false); setTerm(true); }} />}
      {term !== null && <Terminal open={term} onOpenChange={setTerm} />}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ThemeBridge />
      <RouteTransitions />
      <Hotkeys />
      <Fx />
      {children}
      <Overlays />
    </ThemeProvider>
  );
}
