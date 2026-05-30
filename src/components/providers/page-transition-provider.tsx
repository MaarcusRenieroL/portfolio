"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  MouseEvent,
  ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ZoroLoader } from "~/components/misc/zoro-loader";
import { cn } from "~/lib/utils";

const INITIAL_LOAD_TIME = 900;
const ROUTE_LOADER_MIN_TIME = 650;
const REVEAL_TIME = 650;

type PageTransitionProviderProps = {
  children: ReactNode;
};

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const previousPathname = useRef(pathname);
  const routeStartedAt = useRef<number | null>(null);

  const initialTimerRef = useRef<number | null>(null);
  const loaderTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const clearTimer = (timer: React.MutableRefObject<number | null>) => {
    if (!timer.current) return;

    window.clearTimeout(timer.current);
    timer.current = null;
  };

  const startReveal = useCallback(() => {
    clearTimer(revealTimerRef);

    setIsRevealing(true);

    revealTimerRef.current = window.setTimeout(() => {
      setIsRevealing(false);
    }, REVEAL_TIME);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (initialLoading || routeLoading) return;

      const url = new URL(href, window.location.origin);

      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }

      const nextPath = url.pathname + url.search + url.hash;
      const currentPath =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      if (nextPath === currentPath) return;

      clearTimer(loaderTimerRef);
      clearTimer(revealTimerRef);

      routeStartedAt.current = Date.now();
      setIsRevealing(false);
      setRouteLoading(true);

      window.setTimeout(() => {
        startTransition(() => {
          router.push(nextPath);
        });
      }, 120);
    },
    [initialLoading, routeLoading, router],
  );

  useEffect(() => {
    initialTimerRef.current = window.setTimeout(() => {
      setInitialLoading(false);
      startReveal();
    }, INITIAL_LOAD_TIME);

    return () => {
      clearTimer(initialTimerRef);
      clearTimer(loaderTimerRef);
      clearTimer(revealTimerRef);
    };
  }, [startReveal]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;

    if (!routeLoading) {
      startReveal();
      return;
    }

    const elapsed = routeStartedAt.current
      ? Date.now() - routeStartedAt.current
      : ROUTE_LOADER_MIN_TIME;

    const remaining = Math.max(ROUTE_LOADER_MIN_TIME - elapsed, 0);

    clearTimer(loaderTimerRef);

    loaderTimerRef.current = window.setTimeout(() => {
      setRouteLoading(false);
      startReveal();
    }, remaining);

    return () => {
      clearTimer(loaderTimerRef);
    };
  }, [pathname, routeLoading, startReveal]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a");

    if (!anchor) return;

    const href = anchor.getAttribute("href");

    if (!href) return;
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:")) return;
    if (href.startsWith("tel:")) return;
    if (anchor.target === "_blank") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    event.preventDefault();
    navigate(href);
  };

  useEffect(() => {
    const handleManualRouteStart = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (!customEvent.detail) return;

      navigate(customEvent.detail);
    };

    window.addEventListener("route-loading-start", handleManualRouteStart);

    return () => {
      window.removeEventListener("route-loading-start", handleManualRouteStart);
    };
  }, [navigate]);

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "w-full transition-all duration-700 ease-out",
          initialLoading || routeLoading
            ? "pointer-events-none opacity-0 blur-sm"
            : "opacity-100 blur-0",
          isRevealing && "animate-page-reveal",
        )}
      >
        {children}
      </div>

      {initialLoading && <ZoroLoader text="booting" />}
      {routeLoading && !initialLoading && <ZoroLoader text="loading" />}
    </>
  );
}
