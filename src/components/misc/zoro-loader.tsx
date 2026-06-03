"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ZoroLoaderProps = {
  text?: string;
};

const MATRIX_CHARS = ["0", "1", "λ", "/", "_", "{", "}", "<", ">", "#"];

export function ZoroLoader({ text = "loading" }: ZoroLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] overflow-hidden bg-background text-green-500">
      <MatrixRain />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="grid size-16 place-items-center rounded-full border border-green-500/40 bg-background shadow-[0_0_40px_rgba(34,197,94,0.18)] dark:shadow-[0_0_40px_rgba(74,222,128,0.3)]">
            <span className="text-xl font-bold tracking-widest text-green-500 dark:text-green-300">
              Z
            </span>
          </div>

          <div className="relative h-8 w-40 overflow-hidden">
            <div className="z-cut absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rotate-[-18deg] bg-green-500 shadow-[0_0_14px_rgba(34,197,94,0.45)] dark:bg-green-400 dark:shadow-[0_0_18px_rgba(74,222,128,0.9)]" />

            <div className="z-cut absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rotate-[18deg] bg-green-400/80 shadow-[0_0_14px_rgba(34,197,94,0.35)] dark:bg-green-300/80 dark:shadow-[0_0_18px_rgba(74,222,128,0.7)]" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs tracking-[0.45em] text-green-700 dark:text-green-300">
              {text}
            </p>

            <p className="text-[10px] tracking-[0.4em] text-green-700/60 dark:text-green-300/50">
              stand by
            </p>
          </div>
        </div>
      </div>

      <div className="loader-vignette pointer-events-none absolute inset-0" />
    </div>,
    document.body,
  );
}

function MatrixRain() {
  const columns = Array.from({ length: 70 });

  return (
    <div className="absolute inset-0 opacity-55">
      {columns.map((_, columnIndex) => (
        <span
          key={columnIndex}
          className="matrix-column absolute top-[-140%] text-xs leading-5 text-green-500/70 dark:text-green-400/70"
          style={{
            left: `${(columnIndex / columns.length) * 100}%`,
            animationDelay: `${(columnIndex % 12) * 80}ms`,
            animationDuration: `${1500 + (columnIndex % 9) * 170}ms`,
          }}
        >
          {Array.from({ length: 60 })
            .map(
              (_, charIndex) =>
                MATRIX_CHARS[
                  (columnIndex + charIndex * 3) % MATRIX_CHARS.length
                ],
            )
            .join("\n")}
        </span>
      ))}
    </div>
  );
}
