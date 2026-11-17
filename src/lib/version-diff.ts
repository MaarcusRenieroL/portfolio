/** Field-by-field differences between a saved version of a content item and the editor's current state. */

export type Change = { name: string; label: string; then: string; now: string };

/** Shown text for a field value: lists joined, objects as JSON, long text cut. */
export function show(v: unknown, max = 240): string {
  if (v === undefined || v === null || v === "") return "";
  let s: string;
  if (typeof v === "string") s = v;
  else if (Array.isArray(v) && v.every((x) => typeof x === "string")) s = v.join(", ");
  else if (typeof v === "number" || typeof v === "boolean") s = String(v);
  else s = JSON.stringify(v);
  s = s.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Empty and missing are the same thing to the editor (a blank field is dropped on save). */
const same = (a: unknown, b: unknown) => {
  const norm = (v: unknown) => (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) ? null : v);
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
};

export function changes(
  fields: readonly { name: string; label: string }[],
  then: Record<string, unknown>,
  now: Record<string, unknown>,
  thenDe: Record<string, unknown> | null,
  nowDe: Record<string, unknown> | null,
): Change[] {
  const out: Change[] = [];
  for (const f of fields) {
    if (!same(then[f.name], now[f.name])) out.push({ name: f.name, label: f.label, then: show(then[f.name]), now: show(now[f.name]) });
  }
  const de = (x: Record<string, unknown> | null) => Object.fromEntries(Object.entries(x ?? {}).filter(([, v]) => !same(v, null)));
  if (!same(de(thenDe), de(nowDe))) out.push({ name: "de", label: "German", then: show(de(thenDe)), now: show(de(nowDe)) });
  return out;
}

/** Postgres `timestamptz::text` ("2026-11-17 08:30:00.123+00") or ISO, to epoch ms (NaN if unreadable). */
export function parseAt(at: string): number {
  return Date.parse(at.includes("T") ? at : at.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00"));
}

/** "5 minutes ago", "3 days ago", from a timestamp. */
export function ago(at: string, now = Date.now()): string {
  const t = parseAt(at);
  if (Number.isNaN(t)) return at;
  const s = Math.round((t - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) if (Math.abs(s) >= size) return rtf.format(Math.trunc(s / size), unit);
  return "just now";
}
