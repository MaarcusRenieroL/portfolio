"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useDict } from "~/components/site/locale";
import { switchTheme } from "~/components/site/theme-toggle";

export type PaletteItem = { id: string; group: "Pages" | "Projects" | "Actions"; label: string; hint?: string; keywords?: string; run: "href" | "external" | "theme" | "copy" | "download" | "event"; value?: string };

const OPEN_EVENT = "palette:open";

/** The trigger in the header. The palette itself is mounted once in the layout. */
export function PaletteButton() {
  const t = useDict().chrome;
  return (
    <button type="button" className="palette-btn" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} aria-label={t.openPalette} aria-keyshortcuts="Control+K Meta+K">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <span className="palette-label">{t.search}</span>
      <kbd aria-hidden="true">⌘K</kbd>
    </button>
  );
}

const score = (it: PaletteItem, q: string) => {
  if (!q) return 1;
  const label = it.label.toLowerCase();
  const hay = `${label} ${it.hint ?? ""} ${it.keywords ?? ""}`.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  return hay.includes(q) ? 1 : 0;
};

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const t = useDict().palette;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const listId = useId();

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .map((it) => ({ it, s: score(it, needle) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.it);
  }, [items, q]);

  const show = useCallback(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    setQ("");
    setActive(0);
    setNote("");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnTo.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const run = async (it: PaletteItem) => {
    if (it.run === "copy") {
      try {
        await navigator.clipboard.writeText(it.value ?? "");
        setNote(t.copied);
        setTimeout(close, 700);
      } catch {
        setNote(`${t.copyFail} ${it.value ?? ""}`);
      }
      return;
    }
    close();
    if (it.run === "theme") switchTheme();
    else if (it.run === "href") router.push(it.value ?? "/");
    else if (it.run === "download") window.location.assign(it.value ?? "/");
    else if (it.run === "event") window.dispatchEvent(new Event(it.value ?? ""));
    else window.open(it.value, "_blank", "noopener,noreferrer");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => (results.length ? (a + 1) % results.length : 0)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0)));
    else if (e.key === "Home") (e.preventDefault(), setActive(0));
    else if (e.key === "End") (e.preventDefault(), setActive(Math.max(0, results.length - 1)));
    else if (e.key === "Enter" && results[active]) (e.preventDefault(), void run(results[active]));
    else if (e.key === "Tab") e.preventDefault(); // keep focus inside the dialog
  };

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t.label} onKeyDown={onKeyDown}>
        <input
          ref={input}
          className="palette-input"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          placeholder={t.placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <ul className="palette-list" id={listId} role="listbox" aria-label={t.results}>
          {results.map((it, i) => {
            const head = i === 0 || results[i - 1].group !== it.group;
            return (
              <li key={it.id} role="presentation">
                {head && <span className="palette-group">{t.groups[it.group] ?? it.group}</span>}
                <button id={`${listId}-${i}`} type="button" role="option" aria-selected={i === active} tabIndex={-1} className="palette-item" onMouseMove={() => setActive(i)} onClick={() => void run(it)}>
                  <span>{it.label}</span>
                  {it.hint && <span className="palette-hint">{it.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        {results.length === 0 && <p className="palette-empty">{t.empty(q)}</p>}
        <p className="palette-foot" role="status" aria-live="polite">
          {note || (
            <>
              <kbd>↑</kbd> <kbd>↓</kbd> {t.move} · <kbd>Enter</kbd> {t.select} · <kbd>Esc</kbd> {t.close}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
