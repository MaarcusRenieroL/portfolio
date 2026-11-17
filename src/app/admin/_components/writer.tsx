"use client";

import { useEffect, useRef } from "react";
import type { Field } from "~/lib/cms-fields";
import { FieldInput } from "./fields";
import { MarkdownEditor } from "./markdown-editor";

import { slugify } from "~/lib/writing";

export { readingStats, slugify } from "~/lib/writing";

/** A textarea that grows with its content, for the borderless title and summary. */
function Grow({ value, onChange, className, placeholder, label, id }: { value: string; onChange: (v: string) => void; className: string; placeholder: string; label: string; id: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      id={id}
      rows={1}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        // Enter moves on to the next field instead of adding a line break.
        if (e.key === "Enter") {
          e.preventDefault();
          const next = (e.currentTarget.closest("[data-writer]")?.querySelectorAll<HTMLElement>("textarea, .ProseMirror") ?? []) as NodeListOf<HTMLElement>;
          const list = [...next];
          list[list.indexOf(e.currentTarget) + 1]?.focus();
        }
      }}
      className={`block w-full !min-h-0 !resize-none overflow-hidden !rounded-none !border-0 !bg-transparent !p-0 !shadow-none focus:!bg-transparent focus:outline-none ${className}`}
    />
  );
}

/**
 * The writing surface for posts and notes: title, summary and body on one quiet page in the
 * site's own article type, so it reads the way it will publish. Everything else lives in
 * the settings panel.
 */
export function WriterCanvas({
  title,
  description,
  body,
  onTitle,
  onDescription,
  onBody,
  placeholders,
}: {
  title: string;
  description: string;
  body: string;
  onTitle: (v: string) => void;
  onDescription: (v: string) => void;
  onBody: (v: string) => void;
  /** German tab: the English text shows through as placeholders. */
  placeholders?: { title?: string; description?: string; body?: string };
}) {
  return (
    <div data-writer className="mx-auto w-full max-w-[42rem]">
      <Grow
        id="f-title"
        label="Title"
        value={title}
        onChange={onTitle}
        placeholder={placeholders?.title || "Title"}
        className="!text-[2rem] !font-semibold !leading-[1.15] tracking-[-0.03em] !text-[var(--fg)] placeholder:text-[var(--fg-3)]/50 sm:!text-[2.4rem]"
      />
      <Grow
        id="f-description"
        label="Summary"
        value={description}
        onChange={onDescription}
        placeholder={placeholders?.description || "A one-line summary. It shows in lists, search and link previews."}
        className="mt-3 !text-[17px] !leading-relaxed !text-[var(--fg-2)] placeholder:text-[var(--fg-3)]/60"
      />
      <div className="mt-6 border-t border-[var(--line)] pt-6">
        <MarkdownEditor id="f-body" variant="bare" value={body} onChange={onBody} placeholder={placeholders?.body ? "Write the German version…" : "Write, or type / for headings, lists, code, images…"} />
      </div>
    </div>
  );
}

/** Slug, date and tags for a post or note, plus where it will live. */
export function WriterSettings({
  fields,
  data,
  setField,
  slugLocked,
  slugAuto,
  onSlugEdited,
  base,
  stats,
}: {
  fields: Field[];
  data: Record<string, unknown>;
  setField: (name: string, v: unknown) => void;
  slugLocked: boolean;
  slugAuto: boolean;
  onSlugEdited: () => void;
  base: string;
  stats: { words: number; minutes: number };
}) {
  const by = (n: string) => fields.find((f) => f.name === n);
  const slug = String(data.slug ?? "");
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-slug" className="mb-1.5 block text-[12px] font-medium text-[var(--fg-2)]" style={{ display: "block" }}>
          URL
        </label>
        <div className="flex items-center overflow-hidden rounded-md border border-[var(--line)] focus-within:border-[var(--green)]">
          <span className="shrink-0 pl-2.5 font-mono text-[12px] text-[var(--fg-3)]">{base}/</span>
          <input
            id="f-slug"
            value={slug}
            disabled={slugLocked}
            onChange={(e) => {
              onSlugEdited();
              setField("slug", slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
            }}
            placeholder="from-the-title"
            className="min-w-0 !rounded-none !border-0 !bg-transparent !px-1 font-mono !text-[12px] focus:!bg-transparent"
          />
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-3)]">
          {slugLocked ? "Fixed: it's published, and links to it must keep working." : slugAuto ? "Follows the title until you publish." : "Fixed for good once you publish."}
        </p>
      </div>

      {(["date", "tags"] as const).map((n) => {
        const f = by(n);
        if (!f) return null;
        return (
          <div key={n}>
            <label htmlFor={`f-${n}`} className="mb-1.5 block text-[12px] font-medium text-[var(--fg-2)]" style={{ display: "block" }}>
              {f.label}
            </label>
            <FieldInput field={f} value={data[n]} onChange={(v) => setField(n, v)} />
          </div>
        );
      })}

      <dl className="grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-[12px]">
        <div>
          <dt className="text-[var(--fg-3)]">Words</dt>
          <dd className="font-mono tabular-nums text-[var(--fg)]">{stats.words.toLocaleString("en")}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-3)]">Reading time</dt>
          <dd className="font-mono tabular-nums text-[var(--fg)]">{stats.minutes} min</dd>
        </div>
      </dl>
    </div>
  );
}
