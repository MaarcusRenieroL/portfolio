"use client";

import { Check, Copy, FileText, ImageIcon, Loader2, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FILE_TYPES, IMAGE_TYPES, MAX_UPLOAD_BYTES, formatBytes, isImage, mediaSrc, slugFileName, type MediaAccept, type MediaItem } from "~/lib/media";
import { deleteMedia, getMediaUsage, registerMedia, updateMediaAlt } from "../media-actions";

type Pending = { id: string; name: string; pct: number; error?: string };
type Filter = "all" | "image" | "pdf";

const fileName = (m: MediaItem) => m.pathname.replace(/^media\//, "");

/** Width and height of an image file, read in the browser before upload. SVGs and PDFs give null. */
async function dimensions(file: File): Promise<[number | null, number | null]> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return [null, null];
  try {
    const bmp = await createImageBitmap(file);
    const d: [number, number] = [bmp.width, bmp.height];
    bmp.close();
    return d;
  } catch {
    return [null, null];
  }
}

/** Upload straight to the private R2 bucket with a signed URL. Returns the `r2:` reference to register. */
async function uploadToR2(file: File, onProgress: (pct: number) => void): Promise<string> {
  const r = await fetch("/api/admin/media/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, contentType: file.type, size: file.size }),
  });
  const json = (await r.json().catch(() => ({}))) as { putUrl?: string; ref?: string; error?: string };
  if (!r.ok || !json.putUrl || !json.ref) throw new Error(json.error ?? "Upload failed.");
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", json.putUrl!);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check the bucket's CORS rules."));
    xhr.send(file);
  });
  return json.ref;
}

/**
 * The media library: drop or pick files to upload them to the private R2 bucket, browse what's there,
 * edit alt text, copy a URL, delete. In picker mode (inside a content form) it also offers
 * "Use this file" and limits what can be picked to `accept`.
 */
export function MediaLibrary({
  initial,
  configured,
  accept = "file",
  onPick,
}: {
  initial: MediaItem[];
  configured: boolean;
  accept?: MediaAccept;
  onPick?: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>(accept === "image" ? "image" : "all");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowed: readonly string[] = accept === "image" ? IMAGE_TYPES : FILE_TYPES;
  const pickable = (m: MediaItem) => allowed.includes(m.content_type);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (m) =>
        (filter === "all" || (filter === "image" ? isImage(m.content_type) : m.content_type === "application/pdf")) &&
        (!needle || fileName(m).toLowerCase().includes(needle) || m.alt.toLowerCase().includes(needle)),
    );
  }, [items, q, filter]);

  const selected = items.find((m) => m.id === selectedId) ?? null;

  const uploadFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
        const fail = (error: string) => setPending((p) => p.map((x) => (x.id === id ? { ...x, error } : x)));
        setPending((p) => [...p, { id, name: file.name, pct: 0 }]);
        if (!(FILE_TYPES as readonly string[]).includes(file.type)) {
          fail("Only images (PNG, JPG, WebP, AVIF, GIF, SVG) and PDFs.");
          continue;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          fail(`Larger than ${formatBytes(MAX_UPLOAD_BYTES)}.`);
          continue;
        }
        try {
          const [w, h] = await dimensions(file);
          const progress = (pct: number) => setPending((p) => p.map((x) => (x.id === id ? { ...x, pct } : x)));
          const url = await uploadToR2(file, progress);
          const res = await registerMedia(url, w, h);
          if (!res.ok) {
            fail(res.errors.join(" "));
            continue;
          }
          setItems((list) => [res.item, ...list.filter((m) => m.id !== res.item.id)]);
          setSelectedId(res.item.id);
          setPending((p) => p.filter((x) => x.id !== id));
        } catch (e) {
          fail(e instanceof Error ? e.message : "Upload failed.");
        }
      }
    },
    [],
  );

  // Paste an image from the clipboard straight into the library.
  useEffect(() => {
    if (!configured) return;
    const onPaste = (e: ClipboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable)) return;
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length) {
        e.preventDefault();
        void uploadFiles(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [configured, uploadFiles]);

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center space-y-2">
        <UploadCloud className="mx-auto h-6 w-6 text-[var(--fg-3)]" aria-hidden="true" />
        <p className="text-sm text-[var(--fg)]">Uploads aren&apos;t set up yet</p>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-[var(--fg-3)]">
          Set the R2 variables (<code>R2_ACCOUNT_ID</code>, <code>R2_ACCESS_KEY_ID</code>, <code>R2_SECRET_ACCESS_KEY</code>, <code>R2_BUCKET_PUBLIC</code>,{" "}
          <code>R2_BUCKET_PRIVATE</code>, <code>NEXT_PUBLIC_ASSETS_URL</code>) in <code>.env.local</code>, then restart the dev server. See <code>.env.example</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-3">
        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void uploadFiles([...e.dataTransfer.files]);
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-[var(--green)] bg-[var(--green-wash)]" : "border-[var(--line-2)]"
          }`}
        >
          <UploadCloud className={`h-6 w-6 ${dragging ? "text-[var(--green)]" : "text-[var(--fg-3)]"}`} aria-hidden="true" />
          <p className="text-sm text-[var(--fg)]">
            Drop files here, paste an image, or{" "}
            <button type="button" className="text-[var(--green)] underline underline-offset-2" onClick={() => inputRef.current?.click()}>
              browse
            </button>
          </p>
          <p className="text-[11px] text-[var(--fg-3)]">
            {accept === "image" ? "PNG, JPG, WebP, AVIF, GIF or SVG" : "Images or PDF"} · up to {formatBytes(MAX_UPLOAD_BYTES)} each
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept={allowed.join(",")}
            onChange={(e) => {
              void uploadFiles([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
        </div>

        {pending.length > 0 && (
          <ul className="space-y-1.5" aria-live="polite">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs">
                {p.error ? <X className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" /> : <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--green)]" />}
                <span className="min-w-0 flex-1 truncate text-[var(--fg)]">{p.name}</span>
                {p.error ? (
                  <>
                    <span className="text-[var(--danger)]">{p.error}</span>
                    <button type="button" className="text-[var(--fg-3)] hover:text-[var(--fg)]" onClick={() => setPending((l) => l.filter((x) => x.id !== p.id))} aria-label="Dismiss">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-[var(--fg-3)]">{Math.round(p.pct)}%</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="search min-w-0 flex-1 basis-48">
            <Search className="h-3.5 w-3.5 shrink-0 text-[var(--fg-3)]" aria-hidden="true" />
            <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text" aria-label="Search media" />
          </label>
          {accept !== "image" && (
            <div className="inline-flex items-center rounded-lg border border-[var(--line)] p-0.5" role="group" aria-label="File type">
              {(["all", "image", "pdf"] as const).map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`h-8 rounded-md px-3 text-xs ${filter === f ? "bg-[var(--hover)] text-[var(--green)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
                >
                  {f === "all" ? "All" : f === "image" ? "Images" : "PDFs"}
                </Button>
              ))}
            </div>
          )}
          <span className="font-mono text-[11px] text-[var(--fg-3)]">
            {shown.length} of {items.length}
          </span>
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] p-8 text-center text-xs text-[var(--fg-3)]">
            {items.length === 0 ? "Nothing uploaded yet." : "No files match."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" aria-label="Files">
            {shown.map((m) => {
              const active = m.id === selectedId;
              const ok = pickable(m);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    onDoubleClick={() => ok && onPick?.(m)}
                    aria-pressed={active}
                    className={`group block w-full overflow-hidden rounded-lg border text-left transition-colors ${
                      active ? "border-[var(--green)] ring-1 ring-[var(--green)]" : "border-[var(--line)] hover:border-[var(--line-2)]"
                    } ${onPick && !ok ? "opacity-40" : ""}`}
                  >
                    <span className="relative flex aspect-[4/3] items-center justify-center bg-[var(--hover)]">
                      {isImage(m.content_type) ? (
                        // eslint-disable-next-line @next/next/no-img-element -- blob URLs, thumbnails only
                        <img src={mediaSrc(m)} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <FileText className="h-8 w-8 text-[var(--fg-3)]" aria-hidden="true" />
                      )}
                      {active && (
                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--green)] text-[var(--green-ink)]">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                    <span className="block truncate px-2 py-1.5 font-mono text-[11px] text-[var(--fg-2)]">{fileName(m)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Details */}
      <aside className="lg:sticky lg:top-4 lg:self-start">
        {selected ? (
          <MediaDetails
            key={selected.id}
            item={selected}
            canPick={Boolean(onPick) && pickable(selected)}
            onPick={() => onPick?.(selected)}
            onAlt={(alt) => setItems((l) => l.map((m) => (m.id === selected.id ? { ...m, alt } : m)))}
            onDeleted={() => {
              setItems((l) => l.filter((m) => m.id !== selected.id));
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="hidden rounded-xl border border-[var(--line)] p-6 text-center text-xs text-[var(--fg-3)] lg:block">
            <ImageIcon className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
            Select a file to see its details.
          </div>
        )}
      </aside>
    </div>
  );
}

function MediaDetails({
  item,
  canPick,
  onPick,
  onAlt,
  onDeleted,
}: {
  item: MediaItem;
  canPick: boolean;
  onPick: () => void;
  onAlt: (alt: string) => void;
  onDeleted: () => void;
}) {
  const [alt, setAlt] = useState(item.alt);
  const [altState, setAltState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [usedBy, setUsedBy] = useState<{ kind: string; key: string }[] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    void getMediaUsage(item.id).then((r) => live && r.ok && setUsedBy(r.usedBy));
    return () => {
      live = false;
    };
  }, [item.id]);

  const saveAlt = async () => {
    if (alt.trim() === item.alt) return;
    setAltState("saving");
    const r = await updateMediaAlt(item.id, alt);
    setAltState(r.ok ? "saved" : "error");
    if (r.ok) onAlt(alt.trim());
  };

  const remove = async () => {
    setDeleting(true);
    const r = await deleteMedia(item.id);
    setDeleting(false);
    if (r.ok) onDeleted();
    else setError(r.errors.join(" "));
  };

  const image = isImage(item.content_type);

  return (
    <div className="space-y-3 rounded-xl border border-[var(--line)] p-3">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-[var(--hover)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL preview
          <img src={mediaSrc(item)} alt={item.alt} className="h-full w-full object-contain" />
        ) : (
          <FileText className="h-10 w-10 text-[var(--fg-3)]" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-0.5">
        <p className="break-all font-mono text-xs text-[var(--fg)]">{fileName(item)}</p>
        <p className="font-mono text-[11px] text-[var(--fg-3)]">
          {formatBytes(item.size)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""} · {new Date(item.created_at).toLocaleDateString()}
        </p>
      </div>

      {canPick && (
        <Button type="button" variant="default" className="w-full" onClick={onPick}>
          Use this file
        </Button>
      )}

      {image && (
        <label className="block space-y-1">
          <span className="text-[11px] text-[var(--fg-3)]">Alt text (describe the image for screen readers)</span>
          <Input
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              setAltState("idle");
            }}
            onBlur={() => void saveAlt()}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            placeholder="e.g. Search window of the nyx launcher"
          />
          <span className="block h-4 text-[11px] text-[var(--fg-3)]" aria-live="polite">
            {altState === "saving" ? "Saving…" : altState === "saved" ? "Saved" : altState === "error" ? "Couldn't save" : ""}
          </span>
        </label>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            void navigator.clipboard.writeText(mediaSrc(item)).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy path"}
        </Button>
        <a href={mediaSrc(item)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}>
          Open ↗
        </a>
      </div>

      <div className="text-[11px] text-[var(--fg-3)]">
        {usedBy === null ? (
          "Checking where it's used…"
        ) : usedBy.length === 0 ? (
          "Not used by any content."
        ) : (
          <>
            Used by:{" "}
            {usedBy.map((u, i) => (
              <span key={`${u.kind}/${u.key}`}>
                {i > 0 && ", "}
                <a className="text-[var(--fg-2)] underline underline-offset-2 hover:text-[var(--green)]" href={u.kind === "settings" ? "/admin/settings" : `/admin/content/${u.kind}/${encodeURIComponent(u.key)}`}>
                  {u.key}
                </a>
              </span>
            ))}
          </>
        )}
      </div>

      {confirming ? (
        <div className="space-y-2 rounded-lg border border-[var(--danger)]/40 p-2.5">
          <p className="text-xs text-[var(--fg)]">
            Delete this file for good?
            {usedBy && usedBy.length > 0 ? ` ${usedBy.length} item${usedBy.length === 1 ? "" : "s"} still use it and will show a broken image.` : ""}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="destructive" size="sm" className="flex-1" disabled={deleting} onClick={() => void remove()}>
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="w-full text-[var(--danger)] hover:text-[var(--danger)]" onClick={() => setConfirming(true)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete file
        </Button>
      )}
      {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
    </div>
  );
}
