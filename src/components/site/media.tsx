"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An image from /public that degrades to a styled fallback while the file
 * doesn't exist yet, so the layout is whole before the real assets arrive.
 */
export function Pic({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [bad, setBad] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The error can fire before hydration, so check once on mount as well.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBad(true);
  }, []);

  if (bad || !src) {
    return (
      <span className={`${className ?? ""} pic-fallback`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        {fallback}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} className={className} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}
