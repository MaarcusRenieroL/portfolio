"use client";

import { Loader2, Upload, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { importFromFiles, publishAll } from "../actions";

/** Collection-wide actions: import the site's current content (empty list) or publish every pending change. */
const BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[13px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] disabled:opacity-50 pointer-coarse:h-10";

export function ListTools({ kind, empty, pending }: { kind: string; empty: boolean; pending: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {empty && (
        <button
          type="button"
          className={BTN}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await importFromFiles();
            setBusy(false);
            setMsg(r.ok ? `Imported ${r.inserted} items.` : r.errors.join(" "));
            router.refresh();
          }}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Import from the site
        </button>
      )}
      {pending && (
        <button
          type="button"
          className={BTN}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await publishAll(kind);
            setBusy(false);
            setMsg(r.ok ? (r.warning ?? "Everything here is published.") : r.errors.join(" "));
            router.refresh();
          }}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Publish all changes
        </button>
      )}
      {msg && <span className="text-[12px] text-[var(--fg-3)]" role="status">{msg}</span>}
    </div>
  );
}
