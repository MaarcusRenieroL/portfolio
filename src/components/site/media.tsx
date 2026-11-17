"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Widths Next's image optimizer allows by default (deviceSizes + imageSizes). */
const WIDTHS = [128, 256, 384, 640, 828, 1080, 1200];
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ASSETS = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/+$/, "");

/** srcset through /_next/image for same-site and assets-domain raster images; SVGs and other remote URLs are left alone. */
function responsiveSrcSet(src: string): string | undefined {
  if (/\.svg($|\?)/i.test(src)) return undefined;
  if (ASSETS && src.startsWith(`${ASSETS}/`)) return WIDTHS.map((w) => `${BASE}/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75 ${w}w`).join(", ");
  if (!src.startsWith("/") || src.startsWith("//")) return undefined;
  const path = BASE && src.startsWith(BASE) ? src.slice(BASE.length) : src;
  return WIDTHS.map((w) => `${BASE}/_next/image?url=${encodeURIComponent(path)}&w=${w}&q=75 ${w}w`).join(", ");
}

/**
 * An image from /public that degrades to a styled fallback while the file
 * doesn't exist yet, so the layout is whole before the real assets arrive.
 */
export function Pic({
  src,
  fallbackSrc,
  alt,
  className,
  fallback,
  sizes,
  priority,
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  /** CSS sizes hint. With it, local images are served resized by Next's optimizer (srcset). */
  sizes?: string;
  /** Above the fold: load now instead of lazily. */
  priority?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [bad, setBad] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setBad(false);
  }, [src]);

  // Try the fallback image once, then the styled placeholder.
  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
    else setBad(true);
  }, [fallbackSrc, currentSrc]);

  // The error can fire before hydration, so check once per source as well.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) handleError();
  }, [handleError]);

  if (bad || !currentSrc) {
    return (
      <span className={`${className ?? ""} pic-fallback`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        {fallback}
      </span>
    );
  }

  const srcSet = sizes ? responsiveSrcSet(currentSrc) : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain <img> keeps the error fallback; srcset goes through Next's optimizer
    <img
      ref={ref}
      className={className}
      src={currentSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={handleError}
    />
  );
}

/** Your photo (public/me.jpg) when it exists; a neutral placeholder until then. */
export function Portrait({ src, alt, className, sizes, priority }: { src: string; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <Pic className={className} src={src} alt={alt} sizes={sizes} priority={priority} fallback={<img src="/placeholder-portrait.svg" alt="" width={400} height={500} />} />;
}
