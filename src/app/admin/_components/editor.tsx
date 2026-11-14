"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteItem, publishItem, saveItem, translateItem } from "../actions";
import { deFields, SPECS } from "~/lib/cms-fields";
import type { Kind } from "~/lib/server/store";
import { FieldInput } from "./fields";

type Props = {
  kind: Kind;
  keyValue: string | null;
  data: Record<string, unknown>;
  de: Record<string, unknown>;
  machine: boolean;
  live: boolean;
  deleted: boolean;
};

type Save = "idle" | "saving" | "saved" | "error";

/** Form on the left, the real site on the right. Edits autosave as a draft and the preview reloads. */
export function Editor(p: Props) {
  const spec = SPECS[p.kind];
  const router = useRouter();
  const [data, setData] = useState(p.data);
  const [de, setDe] = useState(p.de);
  const [machine, setMachine] = useState(p.machine);
  const [tab, setTab] = useState<"en" | "de">("en");
  const [save, setSave] = useState<Save>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef<string | null>(p.keyValue);
  const [savedKey, setSavedKey] = useState<string | null>(p.keyValue);
  const frame = useRef<HTMLIFrameElement>(null);
  const saved = useRef(JSON.stringify({ d: p.data, e: p.de, m: p.machine }));
  const previewPath = spec.preview(String(data[spec.keyField] ?? p.keyValue ?? ""));

  const reload = useCallback(() => {
    try {
      frame.current?.contentWindow?.location.reload();
    } catch {
      /* cross-origin only if misconfigured */
    }
  }, []);

  const persist = useCallback(async () => {
    setSave("saving");
    const snap = JSON.stringify({ d: data, e: de, m: machine });
    const r = await saveItem(p.kind, key.current, data, de, machine);
    if (r.ok) {
      saved.current = snap;
      setErrors([]);
      setSave("saved");
      if (key.current === null) {
        key.current = r.key;
        setSavedKey(r.key);
        router.replace(`/admin/content/${p.kind}/${encodeURIComponent(r.key)}`);
      }
      reload();
    } else {
      setErrors(r.errors);
      setSave("error");
    }
    return r.ok;
  }, [p.kind, data, de, machine, router, reload]);

  // Autosave 900ms after the last change.
  useEffect(() => {
    // Nothing changed since the last save (also true on mount, including React strict mode's double run).
    if (JSON.stringify({ d: data, e: de, m: machine }) === saved.current) return;
    setSave("idle");
    const t = setTimeout(() => void persist(), 900);
    return () => clearTimeout(t);
  }, [data, de, machine, persist]);

  const setField = (name: string, v: unknown) => setData((d) => ({ ...d, [name]: v }));
  const setDeField = (name: string, v: unknown) => {
    setDe((d) => ({ ...d, [name]: v }));
    setMachine(true);
  };

  async function publish() {
    setBusy(true);
    setInfo("");
    if (!(await persist())) return setBusy(false);
    const r = await publishItem(p.kind, key.current!);
    setBusy(false);
    setInfo(r.ok ? "Published. Visitors see it within moments." : r.errors.join(" "));
    if (r.ok) router.refresh();
  }

  async function translate() {
    setBusy(true);
    setInfo("Translating…");
    const r = await translateItem(p.kind, data);
    setBusy(false);
    if (!r.ok) return setInfo(r.errors.join(" "));
    setDe((d) => ({ ...d, ...r.de }));
    setMachine(true);
    setInfo("Translated by Gemini. Read it before you publish.");
  }

  async function remove(deleted: boolean) {
    if (!key.current) return;
    if (deleted && !confirm("Remove this from the site? You can restore it later.")) return;
    setBusy(true);
    const r = await deleteItem(p.kind, key.current, deleted);
    setBusy(false);
    if (r.ok) router.push(`/admin/content/${p.kind}`);
  }

  const setLang = (lang: "en" | "de") => {
    document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
    reload();
  };

  const enSteps = (Array.isArray(data.path) ? data.path : []) as { note?: string }[];

  return (
    <div className="editor">
      <div className="form">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 style={{ margin: 0 }}>{savedKey ? String(data[spec.titleField] ?? savedKey) : `New ${spec.label.toLowerCase()}`}</h1>
          <span className="muted small" aria-live="polite">
            {save === "saving" ? "Saving…" : save === "saved" ? "Draft saved" : save === "error" ? "Not saved" : ""}
          </span>
        </div>

        <div className="row" role="tablist" aria-label="Language">
          <button type="button" role="tab" aria-selected={tab === "en"} className={tab === "en" ? "" : "ghost"} onClick={() => setTab("en")}>English</button>
          <button type="button" role="tab" aria-selected={tab === "de"} className={tab === "de" ? "" : "ghost"} onClick={() => setTab("de")}>Deutsch{machine && Object.keys(de).length ? " (machine)" : ""}</button>
        </div>

        {tab === "en" &&
          spec.fields.map((f) => {
            const isKey = f.name === spec.keyField;
            return (
              <label key={f.name}>
                {f.label}
                <FieldInput field={f} value={data[f.name]} onChange={(v) => setField(f.name, v)} locked={isKey && savedKey !== null} />
                {f.help && <span className="small">{f.help}</span>}
              </label>
            );
          })}

        {tab === "de" && (
          <>
            <div className="row">
              <button type="button" onClick={translate} disabled={busy}>Translate with Gemini</button>
              <label className="row" style={{ gap: 6 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={!machine} onChange={(e) => setMachine(!e.target.checked)} />
                I reviewed this German
              </label>
            </div>
            <p className="muted small">Anything left empty falls back to English on the site.</p>
            {deFields(p.kind).map((f) =>
              f.type === "steps" ? (
                <div key={f.name}>
                  <span className="muted">{f.label} (notes)</span>
                  {enSteps.map((s, i) => {
                    const cur = (Array.isArray(de.path) ? de.path : []) as string[];
                    return (
                      <label key={i}>
                        <span className="small">{s.note}</span>
                        <textarea rows={2} value={cur[i] ?? ""} onChange={(e) => { const next = [...cur]; next[i] = e.target.value; setDeField("path", next); }} />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <label key={f.name}>
                  {f.label}
                  <FieldInput field={f} value={de[f.name]} onChange={(v) => setDeField(f.name, v)} hint={typeof data[f.name] === "string" ? (data[f.name] as string) : undefined} />
                </label>
              ),
            )}
          </>
        )}

        {errors.length > 0 && (
          <ul className="err" role="alert">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        {info && <p className="muted" role="status">{info}</p>}

        <div className="row">
          <button type="button" onClick={publish} disabled={busy || (savedKey === null && save !== "saved")}>Publish</button>
          {savedKey && !p.deleted && <button type="button" className="danger" onClick={() => remove(true)} disabled={busy}>Remove from site</button>}
          {savedKey && p.deleted && <button type="button" className="ghost" onClick={() => remove(false)} disabled={busy}>Restore</button>}
          <span className={`pill ${p.live ? "live" : "draft"}`}>{p.live ? "published before" : "never published"}</span>
        </div>
      </div>

      <div className="preview" aria-label="Live preview">
        <div className="bar">
          <span>Preview</span>
          <button type="button" className="ghost" onClick={() => setLang("en")}>EN</button>
          <button type="button" className="ghost" onClick={() => setLang("de")}>DE</button>
          <button type="button" className="ghost" onClick={reload}>Reload</button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/admin/preview?exit=1" className="muted" style={{ marginLeft: "auto" }}>Exit preview</a>
        </div>
        <iframe ref={frame} title="Live preview of the site" src={`/api/admin/preview?path=${encodeURIComponent(previewPath)}`} />
      </div>
    </div>
  );
}
