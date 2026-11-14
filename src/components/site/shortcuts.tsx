"use client";

import { useDict } from "~/components/site/locale";
import { useCallback, useEffect, useRef, useState } from "react";

export const SHORTCUTS_EVENT = "shortcuts:open";

const groups = (r: ReturnType<typeof useDict>["shortcuts"]): [string, [string[], string][]][] => [
  [r.anywhere, [[["Ctrl/⌘", "K"], r.rows.palette], [["?"], r.rows.help], [["Esc"], r.rows.esc]]],
  [r.lists, [[["j", "k"], r.rows.move], [["g", "g"], r.rows.first], [["G"], r.rows.last], [["Enter"], r.rows.open], [["/"], r.rows.search]]],
];

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

export function FooterShortcutsButton() {
  const t = useDict().chrome;
  return (
    <button type="button" className="footer-keys" onClick={() => window.dispatchEvent(new Event(SHORTCUTS_EVENT))}>
      {t.shortcuts} <kbd aria-hidden="true">?</kbd>
    </button>
  );
}

export function ShortcutsHelp() {
  const t = useDict().shortcuts;
  const [open, setOpen] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    returnTo.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(SHORTCUTS_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SHORTCUTS_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={box}
        tabIndex={-1}
        className="palette shortcuts"
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Tab") e.preventDefault();
        }}
      >
        <h2 className="shortcuts-title">{t.title}</h2>
        {groups(t).map(([name, rows]) => (
          <section key={name} aria-label={name}>
            <span className="palette-group">{name}</span>
            <dl className="shortcuts-list">
              {rows.map(([keys, what]) => (
                <div key={what}>
                  <dt>
                    {keys.map((k, i) => (
                      <kbd key={`${k}-${i}`}>{k}</kbd>
                    ))}
                  </dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <p className="palette-foot">
          <kbd>Esc</kbd> {t.close}
        </p>
      </div>
    </div>
  );
}
