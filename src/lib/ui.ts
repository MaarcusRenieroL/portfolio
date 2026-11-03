/** Tiny window-event bus so keyboard, nav, palette and terminal stay decoupled. */
export type UiEvent = "palette" | "terminal" | "theme" | "menu";

export function emit(name: UiEvent, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(`ui:${name}`, { detail }));
}

/** Navigate with the sword-slash view transition. */
export function go(href: string) {
  window.dispatchEvent(new CustomEvent("ui:go", { detail: href }));
}

export function tier(): 0 | 1 | 2 {
  if (typeof document === "undefined") return 2;
  const t = document.documentElement.dataset.tier;
  return t === "0" ? 0 : t === "1" ? 1 : 2;
}
