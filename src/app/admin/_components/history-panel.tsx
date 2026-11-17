"use client";

import { ChevronDown, History, Loader2, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Field } from "~/lib/cms-fields";
import type { Version } from "~/lib/server/store";
import { ago, changes, parseAt } from "~/lib/version-diff";
import { getVersions } from "../actions";

type Props = {
  kind: string;
  itemKey: string;
  fields: readonly Field[];
  /** What the editor holds right now, to compare each version against. */
  data: Record<string, unknown>;
  de: Record<string, unknown>;
  live: boolean;
  onRestore: (v: Version) => void;
  onClose: () => void;
};

const stamp = (at: string) => {
  const d = new Date(parseAt(at));
  return Number.isNaN(d.getTime()) ? at : d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/**
 * Everything that has been live for this item. Each entry lists what differs from the editor now;
 * "Restore to draft" loads it into the editor as unsaved edits, so nothing changes on the site until Publish.
 */
export function HistoryPanel(p: Props) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    void getVersions(p.kind, p.itemKey).then((r) => {
      if (!alive) return;
      if (r.ok) setVersions(r.versions);
      else setError(r.errors.join(" "));
    });
    return () => {
      alive = false;
    };
  }, [p.kind, p.itemKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && p.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close history" onClick={p.onClose} />
      <div className="absolute inset-y-0 right-0 flex w-[26rem] max-w-[92vw] flex-col border-l border-[var(--line)] bg-[var(--bg)] shadow-[-8px_0_32px_rgb(0_0_0/0.35)]">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--line)] px-5">
          <History className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
          <h2 id="history-title" className="flex-1 text-[13px] font-medium text-[var(--fg)]">
            Publish history
          </h2>
          <button
            type="button"
            onClick={p.onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] pointer-coarse:h-10 pointer-coarse:w-10"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" data-lenis-prevent>
          {error ? (
            <p role="alert" className="text-[13px] text-[var(--danger)]">
              {error}
            </p>
          ) : versions === null ? (
            <p className="flex items-center gap-2 text-[13px] text-[var(--fg-3)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
            </p>
          ) : versions.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-[var(--fg-3)]">Nothing published yet. Each publish is kept here, so you can go back to it later.</p>
          ) : (
            <ol className="relative space-y-0">
              {versions.map((v, i) => {
                const diff = changes(p.fields, v.data, p.data, v.de, p.de);
                const current = diff.length === 0;
                const expanded = open === v.id;
                return (
                  <li key={v.id} className="relative pb-6 pl-6 last:pb-0">
                    {i < versions.length - 1 && <span className="absolute top-3 bottom-0 left-[5px] w-px bg-[var(--line)]" aria-hidden="true" />}
                    <span
                      className={`absolute top-[5px] left-0 h-[11px] w-[11px] rounded-full border ${i === 0 && p.live ? "border-[var(--green)] bg-[var(--green)]" : "border-[var(--line-2)] bg-[var(--bg)]"}`}
                      aria-hidden="true"
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] text-[var(--fg)]">
                        {stamp(v.at)}
                        {i === 0 && p.live && <span className="ml-2 text-[12px] text-[var(--green)]">Live</span>}
                      </p>
                      <span className="shrink-0 text-[12px] text-[var(--fg-3)]">{ago(v.at)}</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-3)]">
                      {current ? "Same as what's in the editor." : `Differs in ${diff.map((d) => d.label.toLowerCase()).join(", ")}.`}
                    </p>
                    {!current && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => p.onRestore(v)}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--line)] px-2.5 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] pointer-coarse:h-9"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore to draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpen(expanded ? null : v.id)}
                          aria-expanded={expanded}
                          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg)] pointer-coarse:h-9"
                        >
                          Compare <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    )}
                    {expanded && (
                      <dl className="mt-3 space-y-3 border-l border-[var(--line)] pl-3">
                        {diff.map((d) => (
                          <div key={d.name} className="min-w-0">
                            <dt className="text-[11px] font-medium tracking-wide text-[var(--fg-3)] uppercase">{d.label}</dt>
                            <dd className="mt-1 space-y-1 text-[12px] leading-relaxed break-words">
                              <p className="text-[var(--fg-2)]">
                                <span className="mr-1.5 font-mono text-[11px] text-[var(--fg-3)]">then</span>
                                {d.then || <em className="text-[var(--fg-3)]">empty</em>}
                              </p>
                              <p className="text-[var(--fg)]">
                                <span className="mr-1.5 font-mono text-[11px] text-[var(--fg-3)]">now</span>
                                {d.now || <em className="text-[var(--fg-3)]">empty</em>}
                              </p>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        <p className="shrink-0 border-t border-[var(--line)] px-5 py-3 text-[11px] leading-relaxed text-[var(--fg-3)]">
          Restoring fills the editor with that version as a draft. The site changes only when you publish. The last 30 publishes are kept.
        </p>
      </div>
    </div>
  );
}
