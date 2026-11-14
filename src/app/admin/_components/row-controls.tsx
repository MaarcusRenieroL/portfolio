"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importFromFiles, moveItem, publishAll } from "../actions";

export function RowControls({ kind, k, first, last }: { kind: string; k: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async (dir: -1 | 1) => {
    setBusy(true);
    await moveItem(kind, k, dir);
    setBusy(false);
    router.refresh();
  };
  return (
    <span className="row">
      <button type="button" className="ghost" aria-label="Move up" disabled={busy || first} onClick={() => go(-1)}>↑</button>
      <button type="button" className="ghost" aria-label="Move down" disabled={busy || last} onClick={() => go(1)}>↓</button>
    </span>
  );
}

export function ListTools({ kind, empty, pending }: { kind: string; empty: boolean; pending: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="row">
      {empty && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await importFromFiles();
            setBusy(false);
            setMsg(r.ok ? `Imported ${r.inserted} items.` : r.errors.join(" "));
            router.refresh();
          }}
        >
          Import the current site content
        </button>
      )}
      {pending && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await publishAll(kind);
            setBusy(false);
            setMsg(r.ok ? "Everything here is published." : r.errors.join(" "));
            router.refresh();
          }}
        >
          Publish all changes
        </button>
      )}
      {msg && <span className="muted" role="status">{msg}</span>}
    </div>
  );
}
