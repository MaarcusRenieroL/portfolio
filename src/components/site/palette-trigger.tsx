"use client";

import { Search } from "lucide-react";
import { useDict } from "~/components/site/locale";
import { Button } from "~/components/ui/button";

/** Opens the command palette. Lives apart from the palette so the header doesn't ship the palette's code. */
export const PALETTE_EVENT = "palette:open";

/** The trigger in the header. The palette itself is mounted once in the layout. */
export function PaletteButton() {
  const t = useDict().chrome;
  return (
    <Button
      type="button"
      variant="ghost"
      className="palette-btn inline-flex items-center gap-2 h-[30px] px-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--hover)] hover:border-[var(--line-2)] text-[var(--fg-2)] hover:text-[var(--fg)] text-xs font-mono transition-colors"
      onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}
      aria-label={t.openPalette}
      aria-keyshortcuts="Control+K Meta+K"
    >
      <Search className="h-3.5 w-3.5 text-[var(--fg-3)]" />
      <span className="palette-label text-xs">{t.search}</span>
      <kbd
        className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--hover)] border border-[var(--line)] text-[var(--fg-3)]"
        aria-hidden="true"
      >
        ⌘K
      </kbd>
    </Button>
  );
}
