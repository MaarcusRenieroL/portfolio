"use client";

import { useEffect } from "react";
import { soundEngine } from "~/lib/sound";

/**
 * Plays the click cue for any interactive element and a soft tick while typing,
 * only when sound is on. Command palette items play their own cue (they can be
 * chosen by keyboard too), so they are skipped here to avoid a double sound.
 */
export function SoundListener() {
  useEffect(() => {
    const engine = soundEngine;
    if (!engine) return;

    const onClick = (e: MouseEvent) => {
      if (!engine.isEnabled()) return;
      const el = (e.target as Element | null)?.closest?.('button, a, [role="button"], [role="tab"], [data-sound]');
      if (el && !el.closest("[cmdk-item], .sound-toggle")) engine.play("click");
    };

    const onKey = (e: KeyboardEvent) => {
      if (!engine.isEnabled() || e.repeat || (e.key.length !== 1 && e.key !== "Backspace")) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) engine.play("tap");
    };

    window.addEventListener("click", onClick, { capture: true, passive: true });
    window.addEventListener("keydown", onKey, { passive: true });
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
