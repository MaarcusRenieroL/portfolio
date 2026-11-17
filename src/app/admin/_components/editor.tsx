"use client";

import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  Languages,
  Loader2,
  Monitor,
  SlidersHorizontal,
  RotateCw,
  Smartphone,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deFields, SPECS, type Field } from "~/lib/cms-fields";
import type { Kind } from "~/lib/server/store";
import { deleteItem, publishItem, saveItem, translateItem } from "../actions";
import { FieldInput } from "./fields";
import { HistoryPanel } from "./history-panel";
import type { Version } from "~/lib/server/store";
import { readingStats, slugify, WriterCanvas, WriterSettings } from "./writer";

export interface CollectionItemSummary {
  key: string;
  title: string;
  live: boolean;
  deleted?: boolean;
}

type Props = {
  kind: Kind;
  keyValue: string | null;
  data: Record<string, unknown>;
  de: Record<string, unknown>;
  machine: boolean;
  live: boolean;
  /** Draft differs from the live copy (or was never published). */
  pending: boolean;
  deleted: boolean;
  collectionItems?: CollectionItemSummary[];
};

type Save = "idle" | "dirty" | "saving" | "saved" | "error";

const PREVIEW_KEY = "admin_editor_preview";

/** The same content with empty strings and empty lists dropped, so a cleared field isn't "a change". */
const meaningful = (o: Record<string, unknown>) =>
  JSON.stringify(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)).sort(([a], [b]) => a.localeCompare(b)));

/** Fields render as one column; short ones (switches, selects, numbers, dates) pair up on wide screens. */
const compact = (f: Field) => f.type === "bool" || f.type === "select" || f.type === "number" || f.type === "date";

function FieldRow({ f, children, locked }: { f: Field; children: React.ReactNode; locked?: boolean }) {
  return (
    <div className={`min-w-0 ${compact(f) ? "" : "sm:col-span-2"}`}>
      {f.type !== "bool" && (
        <div className="mb-1.5 flex items-center gap-2">
          <span id={`l-${f.name}`} className="text-[12px] font-medium text-[var(--fg-2)]">
            <label htmlFor={`f-${f.name}`} style={{ display: "inline", fontSize: "inherit", color: "inherit" }}>
              {f.label}
            </label>
          </span>
          {locked && <span className="rounded border border-[var(--line)] px-1 font-mono text-[10px] text-[var(--fg-3)]">fixed</span>}
        </div>
      )}
      {children}
      {f.help && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--fg-3)]">{f.help}</p>}
    </div>
  );
}

/**
 * Edit one item. Changes save as a draft on their own (or with ⌘S); Publish copies the draft
 * to the live site. English and German are two tabs over the same item. The preview shows the
 * page this item appears on, drawn from the draft.
 */
export function Editor(p: Props) {
  const spec = SPECS[p.kind];
  const router = useRouter();
  /** Posts and notes are written on a page; everything else is a form. */
  const writer = p.kind === "post" || p.kind === "note";
  // A new post starts dated today; that default isn't an edit.
  const [initial] = useState<Record<string, unknown>>(() =>
    writer && p.keyValue === null && !p.data.date ? { ...p.data, date: new Date().toISOString().slice(0, 10) } : p.data,
  );
  const [data, setData] = useState<Record<string, unknown>>(initial);
  // A new post's slug follows its title until someone types their own (or it's published).
  const [slugAuto, setSlugAuto] = useState(() => writer && !p.live && (p.keyValue === null || p.data.slug === slugify(String(p.data.title ?? ""))));
  const [settings, setSettings] = useState(true);
  const [settingsSheet, setSettingsSheet] = useState(false);
  const [de, setDe] = useState(p.de);
  const [machine, setMachine] = useState(p.machine);
  const [lang, setLang] = useState<"en" | "de">("en");
  const [save, setSave] = useState<Save>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState<"" | "publish" | "translate" | "remove">("");
  const [preview, setPreview] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [history, setHistory] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [live, setLive] = useState(p.live);
  // Something here isn't on the live site yet: a draft, or edits saved since the last publish.
  const [unpublished, setUnpublished] = useState(p.pending);

  const key = useRef<string | null>(p.keyValue);
  const [savedKey, setSavedKey] = useState<string | null>(p.keyValue);
  const frame = useRef<HTMLIFrameElement>(null);
  const sheetFrame = useRef<HTMLIFrameElement>(null);
  const saved = useRef(JSON.stringify({ d: initial, e: p.de, m: p.machine }));

  useEffect(() => {
    try {
      setPreview(localStorage.getItem(PREVIEW_KEY) === "1");
    } catch {}
  }, []);
  const togglePreview = () => {
    if (!writer && window.matchMedia("(min-width: 1280px)").matches) {
      setPreview((v) => {
        try {
          localStorage.setItem(PREVIEW_KEY, v ? "0" : "1");
        } catch {}
        return !v;
      });
    } else setSheet(true);
  };

  const previewPath = spec.preview(String(data[spec.keyField] ?? savedKey ?? ""));
  const previewSrc = `/api/admin/preview?path=${encodeURIComponent(previewPath)}`;

  const reload = useCallback(() => {
    for (const f of [frame.current, sheetFrame.current]) {
      try {
        f?.contentWindow?.location.reload();
      } catch {}
    }
  }, []);

  // The newest edits, for a save that was queued behind another one.
  const latest = useRef({ d: data, e: de, m: machine });
  useEffect(() => {
    latest.current = { d: data, e: de, m: machine };
  }, [data, de, machine]);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const again = useRef(false);

  const saveOnce = useCallback(async () => {
    const { d, e, m } = latest.current;
    setSave("saving");
    const snap = JSON.stringify({ d, e, m });
    const r = await saveItem(p.kind, key.current, d, e, m);
    if (r.ok) {
      saved.current = snap;
      setErrors([]);
      setSave("saved");
      setUnpublished(true);
      if (key.current !== r.key) {
        // New item, or a renamed draft: update the address bar without reloading the editor.
        key.current = r.key;
        setSavedKey(r.key);
        window.history.replaceState(null, "", `/admin/content/${p.kind}/${encodeURIComponent(r.key)}`);
      }
      reload();
    } else {
      setErrors(r.errors);
      setSave("error");
    }
    return r.ok;
  }, [p.kind, reload]);

  /**
   * One save at a time. A save asked for while another runs (autosave, ⌘S, Publish) waits for
   * it and then saves the newest edits once: two overlapping saves of a new item would create
   * two rows, and an out-of-order reply would leave the editor pointing at the wrong key.
   */
  const persist = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) {
      again.current = true;
      return inFlight.current;
    }
    const run = (async () => {
      let ok = await saveOnce();
      while (ok && again.current) {
        again.current = false;
        ok = await saveOnce();
      }
      return ok;
    })();
    inFlight.current = run;
    try {
      return await run;
    } finally {
      inFlight.current = null;
    }
  }, [saveOnce]);

  // Autosave 900ms after the last change. A brand-new item waits for its key field.
  useEffect(() => {
    if (JSON.stringify({ d: data, e: de, m: machine }) === saved.current) return;
    setSave("dirty");
    if (key.current === null && !String(data[spec.keyField] ?? "").trim()) return;
    if (writer && key.current === null && !String(data.title ?? "").trim()) return;
    const t = setTimeout(() => void persist(), 900);
    return () => clearTimeout(t);
  }, [data, de, machine, persist, spec.keyField, writer]);

  // ⌘S / Ctrl+S saves now; leaving with unsaved edits asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      const before = JSON.parse(saved.current) as { d: Record<string, unknown>; e: Record<string, unknown> };
      if (meaningful(data) !== meaningful(before.d) || meaningful(de) !== meaningful(before.e)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [persist, data, de, machine]);

  const setField = (name: string, v: unknown) =>
    setData((d) => {
      const next = { ...d, [name]: v };
      if (name === "title" && slugAuto && !live) next.slug = slugify(String(v));
      return next;
    });
  const setDeField = (name: string, v: unknown) => {
    setDe((d) => ({ ...d, [name]: v }));
    setMachine(true);
  };

  async function publish() {
    setBusy("publish");
    setNotice(null);
    if (save === "dirty" || save === "error" || key.current === null) {
      if (!(await persist())) return setBusy("");
    }
    const r = await publishItem(p.kind, key.current!);
    setBusy("");
    if (r.ok) {
      setLive(true);
      setUnpublished(false);
      setNotice(r.warning ? { tone: "err", text: r.warning } : { tone: "ok", text: "Published. It's live on the site now." });
      router.refresh();
    } else setNotice({ tone: "err", text: r.errors.join(" ") });
  }

  /** Bring back a published version as unsaved edits; autosave keeps it as the draft, Publish makes it live. */
  function restore(v: Version) {
    const before = JSON.parse(saved.current) as { d: Record<string, unknown>; e: Record<string, unknown> };
    const unsaved = meaningful(data) !== meaningful(before.d) || meaningful(de) !== meaningful(before.e);
    if (unsaved && !confirm("Replace your unsaved edits with this version?")) return;
    // The key can't change once published, and every version here was published under this key.
    setData({ ...v.data, [spec.keyField]: data[spec.keyField] ?? v.data[spec.keyField] });
    setDe(v.de ?? {});
    setMachine(false);
    setHistory(false);
    setNotice({ tone: "ok", text: "Earlier version restored as a draft. The site still shows the current version until you publish." });
  }

  async function translate() {
    setBusy("translate");
    setNotice(null);
    const r = await translateItem(p.kind, data);
    setBusy("");
    if (!r.ok) return setNotice({ tone: "err", text: r.errors.join(" ") });
    setDe((d) => ({ ...d, ...r.de }));
    setMachine(true);
    setNotice({ tone: "ok", text: "Translated with Gemini. Read it through, then tick “reviewed”." });
  }

  async function remove(deleted: boolean) {
    if (!key.current) return;
    if (deleted && !confirm("Take this off the site? You can restore it later from the Removed filter.")) return;
    setBusy("remove");
    const r = await deleteItem(p.kind, key.current, deleted);
    setBusy("");
    if (r.ok) router.push(`/admin/content/${p.kind}`);
    else setNotice({ tone: "err", text: r.errors.join(" ") });
  }

  const switchLang = (l: "en" | "de") => {
    setLang(l);
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    reload();
  };

  const title = savedKey ? String(data[spec.titleField] || savedKey) : `New ${spec.label.toLowerCase()}`;
  // The tab title follows edits (a renamed draft doesn't reload the page).
  useEffect(() => {
    document.title = `${title} | Admin`;
  }, [title]);
  const pending = !live || unpublished || save === "dirty";
  const enSteps = (Array.isArray(data.path) ? data.path : []) as { note?: string }[];
  const deList = deFields(p.kind);

  const saveText =
    save === "saving" ? "Saving…" : save === "saved" ? "Draft saved" : save === "dirty" ? (savedKey === null ? "Not saved yet" : "Unsaved") : save === "error" ? "Couldn't save" : savedKey ? "Up to date" : "Not saved yet";

  const segBtn = (on: boolean) =>
    `inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12px] transition-colors pointer-coarse:h-9 ${on ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`;
  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] pointer-coarse:h-10 pointer-coarse:w-10";

  const previewBar = (onClose?: () => void) => (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--line)] px-2">
      <div className="inline-flex rounded-md border border-[var(--line)] p-0.5" role="group" aria-label="Preview width">
        <button type="button" aria-pressed={device === "desktop"} className={segBtn(device === "desktop")} onClick={() => setDevice("desktop")} aria-label="Desktop width">
          <Monitor className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-pressed={device === "mobile"} className={segBtn(device === "mobile")} onClick={() => setDevice("mobile")} aria-label="Phone width">
          <Smartphone className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="ml-1 min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--fg-3)]">{previewPath}</span>
      <button type="button" className={iconBtn} onClick={reload} aria-label="Reload preview" title="Reload">
        <RotateCw className="h-3.5 w-3.5" />
      </button>
      <a href={previewSrc} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label="Open preview in a new tab" title="Open in new tab">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {onClose && (
        <button type="button" className={iconBtn} onClick={onClose} aria-label="Close preview">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const previewFrame = (refEl: React.RefObject<HTMLIFrameElement | null>) => (
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-[var(--hover)]/50 p-0">
      <iframe
        ref={refEl}
        title={`Preview of ${previewPath}`}
        src={previewSrc}
        className={`h-full border-0 bg-[var(--bg)] ${device === "mobile" ? "my-3 w-[390px] max-w-full rounded-xl border border-[var(--line)] shadow-[0_8px_30px_rgb(0_0_0/0.25)]" : "w-full"}`}
      />
    </div>
  );

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-10 lg:-my-8">
      {/* Document bar */}
      <div className="sticky top-12 z-10 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:px-10">
          <Link href={`/admin/content/${p.kind}`} className={`${iconBtn} -ml-2`} aria-label={`Back to ${spec.plural}`} title={`Back to ${spec.plural}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--fg)]">{title}</h1>
            <p className="flex items-center gap-2 text-[12px]" aria-live="polite">
              <span className={`inline-flex items-center gap-1.5 ${p.deleted ? "text-[var(--danger)]" : live && !pending ? "text-[var(--fg-2)]" : "text-[var(--green)]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${p.deleted ? "bg-[var(--danger)]" : live ? "bg-[var(--green)]" : "border border-[var(--fg-3)]"}`} aria-hidden="true" />
                {p.deleted ? "Removed" : !live ? "Draft" : pending ? "Live, with unpublished changes" : "Live"}
              </span>
              <span className="text-[var(--line-2)]">·</span>
              <span className={`inline-flex items-center gap-1 ${save === "error" ? "text-[var(--danger)]" : "text-[var(--fg-3)]"}`}>
                {save === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : save === "saved" ? <Check className="h-3 w-3" /> : null}
                {saveText}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-[var(--line)] p-0.5" role="tablist" aria-label="Language">
              <button type="button" role="tab" aria-selected={lang === "en"} className={segBtn(lang === "en")} onClick={() => switchLang("en")}>
                EN
              </button>
              <button type="button" role="tab" aria-selected={lang === "de"} className={segBtn(lang === "de")} onClick={() => switchLang("de")}>
                DE
                {machine && Object.keys(de).length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-3)]" title="Machine translated, not reviewed" />}
              </button>
            </div>
            {savedKey && (
              <button type="button" onClick={() => setHistory(true)} className={iconBtn} aria-label="Publish history" title="Publish history">
                <History className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={togglePreview} className={`${iconBtn} ${preview && !writer ? "xl:bg-[var(--hover)] xl:text-[var(--fg)]" : ""}`} aria-label={preview && !writer ? "Hide preview" : "Show preview"} title="Preview">
              {preview && !writer ? <EyeOff className="h-4 w-4 max-xl:hidden" /> : null}
              <Eye className={`h-4 w-4 ${preview && !writer ? "xl:hidden" : ""}`} />
            </button>
            {writer && (
              <button
                type="button"
                onClick={() => (window.matchMedia("(min-width: 1280px)").matches ? setSettings((v) => !v) : setSettingsSheet(true))}
                className={`${iconBtn} ${settings ? "xl:bg-[var(--hover)] xl:text-[var(--fg)]" : ""}`}
                aria-label="Post settings"
                title="Settings: URL, date, tags"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => void publish()}
              disabled={Boolean(busy) || p.deleted || (!pending && live)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--green)] px-3.5 text-[13px] font-medium text-[var(--green-ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 pointer-coarse:h-10"
            >
              {busy === "publish" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {live && !pending ? "Published" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className={writer ? (settings ? "xl:grid xl:grid-cols-[minmax(0,1fr)_19rem]" : "") : preview ? "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}>
        {/* Form */}
        <div className={`min-w-0 px-4 sm:px-6 lg:px-10 ${writer ? "py-8 lg:py-12" : "py-6 lg:py-8"}`}>
          <div className={`mx-auto space-y-6 ${writer ? "max-w-[42rem]" : "max-w-3xl"}`}>
            {notice && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[13px] ${notice.tone === "ok" ? "border-[var(--green)]/30 text-[var(--fg)]" : "border-[var(--danger)]/40 text-[var(--danger)]"}`}
              >
                {notice.tone === "ok" && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--green)]" />}
                <span className="flex-1">{notice.text}</span>
                <button type="button" onClick={() => setNotice(null)} className="text-[var(--fg-3)] hover:text-[var(--fg)]" aria-label="Dismiss">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {errors.length > 0 && (
              <div role="alert" className="rounded-lg border border-[var(--danger)]/40 px-3 py-2.5 text-[13px] text-[var(--danger)]">
                <p className="font-medium">Not saved. Fix these first:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {lang === "en" && writer ? (
              <WriterCanvas
                title={String(data.title ?? "")}
                description={String(data.description ?? "")}
                body={String(data.body ?? "")}
                onTitle={(v) => setField("title", v)}
                onDescription={(v) => setField("description", v)}
                onBody={(v) => setField("body", v)}
              />
            ) : lang === "en" ? (
              <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                {spec.fields.map((f) => {
                  const locked = f.name === spec.keyField && savedKey !== null;
                  return (
                    <FieldRow key={f.name} f={f} locked={locked}>
                      <FieldInput field={f} value={data[f.name]} onChange={(v) => setField(f.name, v)} locked={locked} doc={data} />
                    </FieldRow>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-3 sm:flex-row sm:items-center">
                  <Languages className="hidden h-4 w-4 shrink-0 text-[var(--fg-3)] sm:block" aria-hidden="true" />
                  <p className="flex-1 text-[12px] leading-relaxed text-[var(--fg-3)]">
                    Empty fields fall back to English on the German site. The English text shows as the placeholder.
                  </p>
                  <button
                    type="button"
                    onClick={() => void translate()}
                    disabled={Boolean(busy)}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] disabled:opacity-50 pointer-coarse:h-10"
                  >
                    {busy === "translate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                    Translate with Gemini
                  </button>
                </div>

                {writer ? (
                  <WriterCanvas
                    title={String(de.title ?? "")}
                    description={String(de.description ?? "")}
                    body={String(de.body ?? "")}
                    onTitle={(v) => setDeField("title", v)}
                    onDescription={(v) => setDeField("description", v)}
                    onBody={(v) => setDeField("body", v)}
                    placeholders={{ title: String(data.title ?? ""), description: String(data.description ?? ""), body: "en" }}
                  />
                ) : (
                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                  {deList.map((f) =>
                    f.type === "steps" ? (
                      <div key={f.name} className="min-w-0 space-y-3 sm:col-span-2">
                        <p className="text-[12px] font-medium text-[var(--fg-2)]">{f.label}</p>
                        {enSteps.map((s, i) => {
                          const cur = (Array.isArray(de.path) ? de.path : []) as string[];
                          return (
                            <div key={i}>
                              <p className="mb-1 text-[12px] text-[var(--fg-3)]">{s.note}</p>
                              <textarea
                                rows={2}
                                aria-label={`${f.label}, step ${i + 1}`}
                                value={cur[i] ?? ""}
                                placeholder="German for this step"
                                onChange={(e) => {
                                  const next = [...cur];
                                  next[i] = e.target.value;
                                  setDeField("path", next);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <FieldRow key={f.name} f={{ ...f, help: undefined }}>
                        <FieldInput field={f} value={de[f.name]} onChange={(v) => setDeField(f.name, v)} hint={typeof data[f.name] === "string" ? (data[f.name] as string) : undefined} />
                      </FieldRow>
                    ),
                  )}
                </div>
                )}

                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--line)] p-3" style={{ display: "flex" }}>
                  <input type="checkbox" checked={!machine} onChange={(e) => setMachine(!e.target.checked)} className="h-4 w-4 accent-[var(--green)]" style={{ width: 16, padding: 0 }} />
                  <span className="text-[13px] text-[var(--fg)]">I read this German and it&apos;s right</span>
                </label>
              </div>
            )}

            {savedKey && (
              <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-[var(--fg-3)]">
                  {p.deleted ? "This item is off the site. Restore it to edit and publish again." : "Removing takes it off the site. It stays here under Removed."}
                </p>
                {p.deleted ? (
                  <button
                    type="button"
                    onClick={() => void remove(false)}
                    disabled={Boolean(busy)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[13px] text-[var(--fg-2)] hover:text-[var(--fg)] pointer-coarse:h-10"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void remove(true)}
                    disabled={Boolean(busy)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--danger)]/40 px-3 text-[13px] text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 pointer-coarse:h-10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove from site
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post settings, wide screens */}
        {writer && settings && (
          <aside className="sticky top-[6.5rem] hidden h-[calc(100dvh-6.5rem)] overflow-y-auto border-l border-[var(--line)] px-5 py-8 xl:block" aria-label="Post settings" data-lenis-prevent>
            <WriterSettings
              fields={spec.fields}
              data={data}
              setField={setField}
              slugLocked={live}
              slugAuto={slugAuto}
              onSlugEdited={() => setSlugAuto(false)}
              base={p.kind === "post" ? "/blog" : "/notes"}
              stats={readingStats(String(data.body ?? ""))}
            />
          </aside>
        )}

        {/* Side preview, wide screens */}
        {preview && !writer && (
          <aside className="sticky top-[6.5rem] hidden h-[calc(100dvh-6.5rem)] flex-col border-l border-[var(--line)] xl:flex" aria-label="Live preview">
            {previewBar()}
            {previewFrame(frame)}
          </aside>
        )}
      </div>

      {/* Full-screen preview, phones and tablets */}
      {/* Post settings, smaller screens */}
      {writer && settingsSheet && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Post settings">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close settings" onClick={() => setSettingsSheet(false)} />
          <div className="absolute inset-y-0 right-0 w-[20rem] max-w-[88vw] overflow-y-auto border-l border-[var(--line)] bg-[var(--bg)] px-5 py-5 shadow-[-8px_0_32px_rgb(0_0_0/0.35)]" data-lenis-prevent>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[13px] font-medium text-[var(--fg)]">Settings</p>
              <button type="button" className={iconBtn} onClick={() => setSettingsSheet(false)} aria-label="Close settings">
                <X className="h-4 w-4" />
              </button>
            </div>
            <WriterSettings
              fields={spec.fields}
              data={data}
              setField={setField}
              slugLocked={live}
              slugAuto={slugAuto}
              onSlugEdited={() => setSlugAuto(false)}
              base={p.kind === "post" ? "/blog" : "/notes"}
              stats={readingStats(String(data.body ?? ""))}
            />
          </div>
        </div>
      )}

      {history && savedKey && (
        <HistoryPanel
          kind={p.kind}
          itemKey={savedKey}
          fields={spec.fields}
          data={data}
          de={de}
          live={live && !p.deleted}
          onRestore={restore}
          onClose={() => setHistory(false)}
        />
      )}

      {sheet && (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[var(--bg)] ${writer ? "" : "xl:hidden"}`} role="dialog" aria-modal="true" aria-label="Preview">
          {previewBar(() => setSheet(false))}
          {previewFrame(sheetFrame)}
        </div>
      )}
    </div>
  );
}
