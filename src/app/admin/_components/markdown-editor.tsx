"use client";

import { Image as ImageExt } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Code2, ImageIcon, Loader2, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Markdown } from "tiptap-markdown";
import { BlockEditor, SlashCommand, defaultSlashCommandItems, getSlashCommandSuggestion, type SlashCommandSuggestionItem } from "~/components/block-editor";
import "~/components/block-editor/style.css";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { mediaSrc, type MediaItem } from "~/lib/media";
import { getMedia } from "../media-actions";
import { MediaLibrary } from "./media-library";

const md = (e: Editor): string => (e.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();

/**
 * Markdown field on editorcn's Notion-style block editor: type "/" for blocks, select text
 * for the bubble menu, drag blocks by the handle; on touch screens a formatting bar sits
 * above the keyboard. Content goes in and out as Markdown, so the stored posts and the
 * public renderer stay exactly as they are. "/image" opens the media library.
 * A Source toggle shows the raw Markdown for anything the blocks can't express.
 */
export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = "Write, or type / for blocks…",
  disabled,
  variant = "boxed",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** "bare": no frame, the site's article type, for the full-page writer. */
  variant?: "boxed" | "bare";
}) {
  const bare = variant === "bare";
  const [mode, setMode] = useState<"write" | "source">("write");
  const [picker, setPicker] = useState(false);
  const [lib, setLib] = useState<{ items: MediaItem[]; configured: boolean } | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const items = useMemo<SlashCommandSuggestionItem[]>(
    () => [
      // The post title is the page's only h1, so blocks start at h2.
      ...defaultSlashCommandItems.filter((i) => i.id !== "h1"),
      {
        id: "image",
        title: "Image",
        description: "Upload or pick from the media library.",
        keywords: ["image", "img", "picture", "photo", "screenshot"],
        icon: <ImageIcon className="h-4 w-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).run();
          setInsertAt(editor.state.selection.from);
          setPicker(true);
          void getMedia().then((r) => r.ok && setLib({ items: r.items, configured: r.configured }));
        },
      },
      {
        id: "table",
        title: "Table",
        description: "A 3 × 3 table with a header row.",
        keywords: ["table", "grid", "columns"],
        icon: <Table2 className="h-4 w-4" />,
        command: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
    ],
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } } }),
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
      ImageExt,
      SlashCommand.configure({ suggestion: getSlashCommandSuggestion(items) }),
    ],
    content: value,
  });

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => onChange(md(editor));
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, onChange]);

  // Outside changes (switching language, an AI translation, source mode) flow back in.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (md(editor) !== value) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div className={bare ? "admin-md admin-md-bare relative" : "admin-md overflow-hidden rounded-lg border border-[var(--line)] focus-within:border-[var(--line-2)]"}>
      <div className={bare ? "mb-3 flex items-center justify-between gap-2" : "flex items-center justify-between gap-2 border-b border-[var(--line)] px-2 py-1.5"}>
        <p className={`truncate px-1 text-[11px] text-[var(--fg-3)] ${bare && mode === "write" ? "invisible" : ""}`}>
          {mode === "write" ? (
            <>
              Type <kbd className="rounded border border-[var(--line)] px-1 font-mono text-[10px]">/</kbd> for blocks, select text to format
            </>
          ) : (
            "Raw Markdown"
          )}
        </p>
        <div className="inline-flex shrink-0 rounded-md border border-[var(--line)] p-0.5" role="group" aria-label="Editor mode">
          {(["write", "source"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] transition-colors pointer-coarse:h-8 ${
                mode === m ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              {m === "source" && <Code2 className="h-3 w-3" aria-hidden="true" />}
              {m === "write" ? "Write" : "Source"}
            </button>
          ))}
        </div>
      </div>

      {mode === "write" ? (
        <div id={id} className={bare ? "admin-md-body prose min-h-[24rem] !max-w-none" : "admin-md-body min-h-[18rem] px-1 py-3 sm:px-6"}>
          {editor ? (
            <BlockEditor editor={editor} />
          ) : (
            <p className="flex items-center gap-2 px-2 text-xs text-[var(--fg-3)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading editor…
            </p>
          )}
        </div>
      ) : (
        <textarea
          id={id}
          value={value}
          disabled={disabled}
          spellCheck
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full resize-y font-mono text-[12.5px] leading-relaxed text-[var(--fg)] ${bare ? "min-h-[24rem] rounded-lg !p-4" : "min-h-[18rem] rounded-none border-0 bg-transparent p-4 focus:bg-transparent"}`}
        />
      )}

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Insert an image</DialogTitle>
            <DialogDescription>Upload a new image or pick one. Its alt text goes into the post.</DialogDescription>
          </DialogHeader>
          {lib ? (
            <MediaLibrary
              initial={lib.items}
              configured={lib.configured}
              accept="image"
              onPick={(m) => {
                setPicker(false);
                const at = insertAt ?? editor?.state.selection.from ?? 0;
                editor?.chain().focus().insertContentAt(at, { type: "image", attrs: { src: mediaSrc(m), alt: m.alt } }).run();
              }}
            />
          ) : (
            <p className="flex items-center gap-2 py-10 text-xs text-[var(--fg-3)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading files…
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
