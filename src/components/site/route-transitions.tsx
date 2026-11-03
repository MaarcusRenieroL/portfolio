"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sword-slash page transition: View Transitions API clip-path wipe plus a lime
 * cut line that rides the wipe edge. Falls back to a plain Next navigation.
 */
export function RouteTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  useEffect(() => {
    const go = (path: string) => {
      const d = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { ready: Promise<void>; finished: Promise<void> } };
      const root = document.documentElement;
      if (!d.startViewTransition) {
        router.push(path);
        return;
      }
      root.dataset.vt = "route";
      const vt = d.startViewTransition(
        () =>
          new Promise<void>((res) => {
            resolveRef.current = res;
            router.push(path);
            window.setTimeout(res, 1500);
          }),
      );
      if (root.dataset.tier !== "0") {
        vt.ready.then(() => drawLine()).catch(() => {});
      }
      vt.finished.finally(() => {
        delete root.dataset.vt;
      });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download") || href.startsWith("#") || /^(mailto:|tel:)/.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.startsWith("/api") || /\.\w+$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      go(url.pathname + url.search + url.hash);
    };

    const onGo = (e: Event) => go((e as CustomEvent<string>).detail);

    document.addEventListener("click", onClick, true);
    window.addEventListener("ui:go", onGo);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("ui:go", onGo);
    };
  }, [router]);

  return null;
}

function drawLine() {
  const W = innerWidth;
  const H = innerHeight;
  const dx = W * 0.2;
  const angle = (Math.atan(dx / H) * 180) / Math.PI;
  const el = document.createElement("div");
  el.className = "vt-line";
  el.style.height = `${Math.hypot(dx, H)}px`;
  el.style.viewTransitionName = "slash";
  document.body.appendChild(el);
  const anim = el.animate(
    [
      { transform: `translateX(0px) rotate(${angle}deg)`, opacity: 1 },
      { transform: `translateX(${W * 1.2}px) rotate(${angle}deg)`, opacity: 1 },
    ],
    { duration: 700, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" },
  );
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}
