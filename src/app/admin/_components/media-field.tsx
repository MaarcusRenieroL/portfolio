"use client";

import { FileText, ImageIcon, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { isLibraryRef, mediaSrc, type MediaAccept, type MediaItem } from "~/lib/media";
import { getMedia } from "../media-actions";
import { MediaLibrary } from "./media-library";

const looksLikeImage = (v: string) => /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(v);

/**
 * A content field that holds an uploaded file: shows what's set, opens the media library to
 * pick or upload a replacement, and clears it. Older content stores a bare file name from
 * /public; that still works and is shown as text until it's replaced.
 */
export function MediaField({
  id,
  value,
  onChange,
  accept,
  disabled,
  legacyBase,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  accept: MediaAccept;
  disabled?: boolean;
  /** Folder under /public that an older bare file name lives in, so it can still be previewed. */
  legacyBase?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lib, setLib] = useState<{ items: MediaItem[]; configured: boolean } | null>(null);
  const [error, setError] = useState("");

  const openLibrary = async () => {
    setOpen(true);
    setError("");
    const r = await getMedia();
    if (r.ok) setLib({ items: r.items, configured: r.configured });
    else setError(r.errors.join(" "));
  };

  const uploaded = Boolean(value) && isLibraryRef(value);
  const src = uploaded ? value : value && legacyBase ? `${legacyBase}${value}` : "";
  const name = value ? decodeURIComponent(value.split("/").pop() ?? value) : "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--hover)]">
        {src && looksLikeImage(value) ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob or /public thumbnail
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : value ? (
          <FileText className="h-5 w-5 text-[var(--fg-3)]" aria-hidden="true" />
        ) : (
          <ImageIcon className="h-5 w-5 text-[var(--fg-3)]" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p id={id} className="truncate font-mono text-xs text-[var(--fg-2)]">
          {value ? name : "Nothing selected"}
          {value && !uploaded && <span className="text-[var(--fg-3)]"> · file in /public</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => void openLibrary()} aria-describedby={id}>
            {value ? "Replace" : accept === "image" ? "Choose image" : "Choose file"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange("")}>
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
            <DialogDescription>Upload a new file or pick one you already uploaded. Double-click a file to use it straight away.</DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="text-xs text-[var(--danger)]">{error}</p>
          ) : !lib ? (
            <div className="flex items-center gap-2 py-10 text-xs text-[var(--fg-3)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading files…
            </div>
          ) : (
            <MediaLibrary
              initial={lib.items}
              configured={lib.configured}
              accept={accept}
              onPick={(m) => {
                onChange(mediaSrc(m));
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
