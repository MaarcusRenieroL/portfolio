"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SCHEDULE_EVENT } from "~/lib/booking-event";
import { useLang } from "./locale";
import type { PaletteItem } from "./command-palette";
import { PALETTE_EVENT } from "./palette-trigger";

const loadPalette = () => import("./command-palette").then((m) => m.CommandPalette);
const loadSchedule = () => import("~/components/booking/schedule-call-dialog").then((m) => m.ScheduleCallDialog);
const Palette = dynamic(loadPalette, { ssr: false });
const Schedule = dynamic(loadSchedule, { ssr: false });

/**
 * The command palette and booking dialog, loaded on first use instead of with every page.
 * Until one is mounted, this listens for its trigger (⌘K or the open event), mounts it already
 * open, and steps aside; the component handles everything after that. Both are fetched in idle
 * time after load, so the first open is still instant.
 */
let itemsRequest: Promise<PaletteItem[]> | null = null;
const loadItems = (lang: string) =>
  (itemsRequest ??= fetch(`/api/palette?lang=${lang}`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<PaletteItem[]>;
    })
    .catch(() => {
      // Don't remember a failure: the next open tries again. The palette still opens, just empty.
      itemsRequest = null;
      return [] as PaletteItem[];
    }));

export function LazyOverlays() {
  const lang = useLang();
  const [palette, setPalette] = useState(false);
  const [items, setItems] = useState<PaletteItem[] | null>(null);
  const [schedule, setSchedule] = useState(false);

  useEffect(() => {
    const warm = () => {
      void loadPalette();
      void loadSchedule();
      void loadItems(lang);
    };
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(warm, { timeout: 4000 });
    else setTimeout(warm, 2500);
  }, [lang]);

  // The palette's entries (every page, project, skill…) come from /api/palette, not the page HTML.
  useEffect(() => {
    if (palette && !items) void loadItems(lang).then(setItems);
  }, [palette, items, lang]);

  useEffect(() => {
    if (palette) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    const onOpen = () => setPalette(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, [palette]);

  useEffect(() => {
    if (schedule) return;
    const onOpen = () => setSchedule(true);
    window.addEventListener(SCHEDULE_EVENT, onOpen);
    return () => window.removeEventListener(SCHEDULE_EVENT, onOpen);
  }, [schedule]);

  return (
    <>
      {palette && items && <Palette items={items} initialOpen />}
      {schedule && <Schedule initialOpen />}
    </>
  );
}
