"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface EditorCnProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EditorCn({
  id = "f-body",
  value,
  onChange,
  placeholder = "Write content in Markdown...",
  disabled = false,
}: EditorCnProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "markdown" | "preview">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Popover state: link
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Popover state: image
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Popover state: table dropdown
  const [showTableMenu, setShowTableMenu] = useState(false);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const imagePopoverRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: false,
        underline: false,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editorcn-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "editorcn-img",
        },
      }),
      TableExtension.configure({
        resizable: true,
        HTMLAttributes: {
          class: "editorcn-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: {
          class: "editorcn-task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "editorcn-task-item",
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: "editorcn-highlight",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      // @ts-expect-error tiptap-markdown storage type
      const md: string = ed.storage.markdown.getMarkdown();
      onChange(md);
    },
  });

  // Keep tiptap in sync if value changed externally (e.g. Playwright .fill or initial load)
  useEffect(() => {
    if (!editor) return;
    // @ts-expect-error tiptap-markdown storage type
    const currentMd: string = editor.storage.markdown.getMarkdown();
    if (value !== currentMd && !editor.isFocused) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showLinkPopover && linkPopoverRef.current && !linkPopoverRef.current.contains(target)) {
        setShowLinkPopover(false);
      }
      if (showImagePopover && imagePopoverRef.current && !imagePopoverRef.current.contains(target)) {
        setShowImagePopover(false);
      }
      if (showTableMenu && tableMenuRef.current && !tableMenuRef.current.contains(target)) {
        setShowTableMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLinkPopover, showImagePopover, showTableMenu]);

  // Fullscreen keyboard escape & hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showShortcuts) setShowShortcuts(false);
        else if (showLinkPopover) setShowLinkPopover(false);
        else if (showImagePopover) setShowImagePopover(false);
        else if (showTableMenu) setShowTableMenu(false);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, showShortcuts, showLinkPopover, showImagePopover, showTableMenu]);

  // Link helper
  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    setLinkUrl(previousUrl);
    setShowLinkPopover(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    }
    setShowLinkPopover(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkPopover(false);
    setLinkUrl("");
  }, [editor]);

  // Image helper
  const applyImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() }).run();
    setShowImagePopover(false);
    setImageUrl("");
    setImageAlt("");
  }, [editor, imageUrl, imageAlt]);

  const wordsCount = useMemo(() => {
    const text = value.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [value]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordsCount / 200));
  }, [wordsCount]);

  return (
    <div className={`editorcn-container ${isFullscreen ? "is-fullscreen" : ""}`}>
      {/* Editor Toolbar */}
      <div className="editorcn-toolbar" role="toolbar" aria-label="Editor formatting toolbar">
        {/* Undo / Redo */}
        <div className="editorcn-group">
          <button
            type="button"
            className="editorcn-btn"
            title="Undo (Cmd+Z)"
            disabled={disabled || !editor?.can().undo()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
          </button>
          <button
            type="button"
            className="editorcn-btn"
            title="Redo (Cmd+Shift+Z)"
            disabled={disabled || !editor?.can().redo()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
            </svg>
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Headings & Paragraph */}
        <div className="editorcn-group">
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("paragraph") ? "active" : ""}`}
            title="Paragraph / Normal Text"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            P
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("heading", { level: 1 }) ? "active" : ""}`}
            title="Heading 1"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("heading", { level: 2 }) ? "active" : ""}`}
            title="Heading 2"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("heading", { level: 3 }) ? "active" : ""}`}
            title="Heading 3"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("heading", { level: 4 }) ? "active" : ""}`}
            title="Heading 4"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
          >
            H4
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Inline Formatting (Marks) */}
        <div className="editorcn-group">
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("bold") ? "active" : ""}`}
            title="Bold (Cmd+B)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("italic") ? "active" : ""}`}
            title="Italic (Cmd+I)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("underline") ? "active" : ""}`}
            title="Underline (Cmd+U)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("strike") ? "active" : ""}`}
            title="Strikethrough"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("code") ? "active" : ""}`}
            title="Inline Code"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleCode().run()}
          >
            <code>{"</>"}</code>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("highlight") ? "active" : ""}`}
            title="Highlight Text"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("superscript") ? "active" : ""}`}
            title="Superscript (X²)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
          >
            X²
          </button>
          <button
            type="button"
            className={`editorcn-btn text-btn ${editor?.isActive("subscript") ? "active" : ""}`}
            title="Subscript (X₂)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleSubscript().run()}
          >
            X₂
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Text Alignment */}
        <div className="editorcn-group">
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive({ textAlign: "left" }) ? "active" : ""}`}
            title="Align Left"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive({ textAlign: "center" }) ? "active" : ""}`}
            title="Align Center"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive({ textAlign: "right" }) ? "active" : ""}`}
            title="Align Right"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="6" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive({ textAlign: "justify" }) ? "active" : ""}`}
            title="Align Justify"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Lists & Tasks */}
        <div className="editorcn-group">
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("bulletList") ? "active" : ""}`}
            title="Bullet List (- item)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("orderedList") ? "active" : ""}`}
            title="Numbered List (1. item)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" />
              <path d="M4 10h2" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("taskList") ? "active" : ""}`}
            title="Task List / Checklist ([ ] item)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="6" height="6" rx="1" />
              <path d="m5 8 1 1 2-2" />
              <line x1="12" y1="8" x2="21" y2="8" />
              <rect x="3" y="13" width="6" height="6" rx="1" />
              <line x1="12" y1="16" x2="21" y2="16" />
            </svg>
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Blocks & Structural Elements */}
        <div className="editorcn-group">
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("blockquote") ? "active" : ""}`}
            title="Blockquote (> quote)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${editor?.isActive("codeBlock") ? "active" : ""}`}
            title="Code Block (```)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
          <button
            type="button"
            className="editorcn-btn"
            title="Horizontal Divider (---)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>

        <span className="editorcn-divider" />

        {/* Inserts: Link, Image, Table */}
        <div className="editorcn-group" style={{ position: "relative" }}>
          {/* Link Button & Popover */}
          <div ref={linkPopoverRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`editorcn-btn ${editor?.isActive("link") ? "active" : ""}`}
              title="Insert / Edit Link (Cmd+K)"
              disabled={disabled}
              onClick={openLinkPopover}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>

            {showLinkPopover && (
              <div className="editorcn-popover link-popover">
                <div className="editorcn-popover-header">
                  <span>{editor?.isActive("link") ? "Edit Link" : "Insert Link"}</span>
                  <button
                    type="button"
                    className="editorcn-popover-close"
                    onClick={() => setShowLinkPopover(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="editorcn-popover-body">
                  <input
                    ref={linkInputRef}
                    type="url"
                    className="editorcn-popover-input"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyLink();
                      }
                    }}
                  />
                  <div className="editorcn-popover-actions">
                    {editor?.isActive("link") && (
                      <button
                        type="button"
                        className="editorcn-popover-btn danger"
                        onClick={removeLink}
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      className="editorcn-popover-btn primary"
                      onClick={applyLink}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Button & Popover */}
          <div ref={imagePopoverRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="editorcn-btn"
              title="Insert Image"
              disabled={disabled}
              onClick={() => {
                setShowImagePopover(!showImagePopover);
                setTimeout(() => imageInputRef.current?.focus(), 50);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            {showImagePopover && (
              <div className="editorcn-popover image-popover">
                <div className="editorcn-popover-header">
                  <span>Insert Image</span>
                  <button
                    type="button"
                    className="editorcn-popover-close"
                    onClick={() => setShowImagePopover(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="editorcn-popover-body">
                  <input
                    ref={imageInputRef}
                    type="url"
                    className="editorcn-popover-input"
                    placeholder="Image URL (e.g. /projects/nyx.png or https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <input
                    type="text"
                    className="editorcn-popover-input"
                    placeholder="Alt text (description for accessibility)"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyImage();
                      }
                    }}
                  />
                  <div className="editorcn-popover-actions">
                    <button
                      type="button"
                      className="editorcn-popover-btn primary"
                      disabled={!imageUrl.trim()}
                      onClick={applyImage}
                    >
                      Insert Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table Button & Dropdown Menu */}
          <div ref={tableMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`editorcn-btn ${editor?.isActive("table") ? "active" : ""}`}
              title="Table Operations"
              disabled={disabled}
              onClick={() => setShowTableMenu(!showTableMenu)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>

            {showTableMenu && (
              <div className="editorcn-popover table-popover">
                <div className="editorcn-popover-header">
                  <span>Table Options</span>
                  <button
                    type="button"
                    className="editorcn-popover-close"
                    onClick={() => setShowTableMenu(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="editorcn-menu-list">
                  {!editor?.isActive("table") ? (
                    <button
                      type="button"
                      className="editorcn-menu-item"
                      onClick={() => {
                        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                        setShowTableMenu(false);
                      }}
                    >
                      <span>Insert 3x3 Table</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="editorcn-menu-item"
                        onClick={() => {
                          editor?.chain().focus().addRowBefore().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Add Row Above</span>
                      </button>
                      <button
                        type="button"
                        className="editorcn-menu-item"
                        onClick={() => {
                          editor?.chain().focus().addRowAfter().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Add Row Below</span>
                      </button>
                      <button
                        type="button"
                        className="editorcn-menu-item danger"
                        onClick={() => {
                          editor?.chain().focus().deleteRow().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Delete Row</span>
                      </button>
                      <span className="editorcn-menu-divider" />
                      <button
                        type="button"
                        className="editorcn-menu-item"
                        onClick={() => {
                          editor?.chain().focus().addColumnBefore().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Add Column Before</span>
                      </button>
                      <button
                        type="button"
                        className="editorcn-menu-item"
                        onClick={() => {
                          editor?.chain().focus().addColumnAfter().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Add Column After</span>
                      </button>
                      <button
                        type="button"
                        className="editorcn-menu-item danger"
                        onClick={() => {
                          editor?.chain().focus().deleteColumn().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Delete Column</span>
                      </button>
                      <span className="editorcn-menu-divider" />
                      <button
                        type="button"
                        className="editorcn-menu-item danger"
                        onClick={() => {
                          editor?.chain().focus().deleteTable().run();
                          setShowTableMenu(false);
                        }}
                      >
                        <span>Delete Table</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <span className="editorcn-divider" />

        {/* Utilities: Clear Formatting, Shortcuts, Fullscreen */}
        <div className="editorcn-group">
          <button
            type="button"
            className="editorcn-btn"
            title="Clear Formatting (Remove styling)"
            disabled={disabled}
            onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
              <line x1="18" y1="18" x2="22" y2="22" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${showShortcuts ? "active" : ""}`}
            title="Keyboard Shortcuts Cheatsheet"
            onClick={() => setShowShortcuts(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <button
            type="button"
            className={`editorcn-btn ${isFullscreen ? "active" : ""}`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* View Mode Tabs: Visual (Rich Text) / Markdown / Preview */}
        <div className="editorcn-tabs">
          <button
            type="button"
            className={`editorcn-tab-pill ${activeTab === "visual" ? "active" : ""}`}
            onClick={() => setActiveTab("visual")}
          >
            Rich Text
          </button>
          <button
            type="button"
            className={`editorcn-tab-pill ${activeTab === "markdown" ? "active" : ""}`}
            onClick={() => setActiveTab("markdown")}
          >
            Markdown
          </button>
          <button
            type="button"
            className={`editorcn-tab-pill ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="editorcn-content-area">
        {/* TAB 1: Real WYSIWYG Rich Text Editor (Tiptap / Editorcn) */}
        {activeTab === "visual" && (
          <div className="editorcn-visual-wrap">
            <EditorContent editor={editor} className="editorcn-tiptap" />
          </div>
        )}

        {/* TAB 2: Markdown Source View */}
        {activeTab === "markdown" && (
          <div className="editorcn-source-wrap">
            <textarea
              className="editorcn-source-textarea"
              rows={18}
              value={value}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => {
                onChange(e.target.value);
                editor?.commands.setContent(e.target.value, { emitUpdate: false });
              }}
            />
          </div>
        )}

        {/* TAB 3: Rendered Article Preview */}
        {activeTab === "preview" && (
          <div className="editorcn-preview">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="editorcn-preview-empty">Nothing to preview yet. Switch to Rich Text to write content.</p>
            )}
          </div>
        )}

        {/* Hidden Playwright test & accessibility anchor for #f-body */}
        <textarea
          id={id}
          className="editorcn-test-anchor"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            editor?.commands.setContent(e.target.value, { emitUpdate: false });
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Status Bar */}
      <div className="editorcn-statusbar">
        <div className="editorcn-status-left">
          <span className="editorcn-badge">
            <span className="tablecn-dot live" /> WYSIWYG Synced
          </span>
          <button
            type="button"
            className="editorcn-shortcut-pill"
            onClick={() => setShowShortcuts(true)}
          >
            Shortcuts Cheatsheet
          </button>
        </div>
        <div className="editorcn-status-right">
          <span>{wordsCount} {wordsCount === 1 ? "word" : "words"}</span>
          <span>·</span>
          <span>{value.length} chars</span>
          <span>·</span>
          <span>~{readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {showShortcuts && (
        <div className="editorcn-shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="editorcn-shortcuts-card" onClick={(e) => e.stopPropagation()}>
            <div className="editorcn-shortcuts-header">
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Editor Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                className="editorcn-popover-close"
                onClick={() => setShowShortcuts(false)}
              >
                ×
              </button>
            </div>
            <div className="editorcn-shortcuts-grid">
              <div className="editorcn-shortcut-col">
                <span className="editorcn-shortcut-section">Formatting</span>
                <div className="editorcn-shortcut-row">
                  <span>Bold</span>
                  <kbd>Cmd + B</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Italic</span>
                  <kbd>Cmd + I</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Underline</span>
                  <kbd>Cmd + U</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Strikethrough</span>
                  <kbd>Cmd + Shift + X</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Inline Code</span>
                  <kbd>Cmd + E</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Insert Link</span>
                  <kbd>Cmd + K</kbd>
                </div>
              </div>
              <div className="editorcn-shortcut-col">
                <span className="editorcn-shortcut-section">Blocks & Structure</span>
                <div className="editorcn-shortcut-row">
                  <span>Paragraph</span>
                  <kbd>Cmd + Alt + 0</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Heading 1</span>
                  <kbd>Cmd + Alt + 1</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Heading 2</span>
                  <kbd>Cmd + Alt + 2</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Bullet List</span>
                  <kbd>Cmd + Shift + 8</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Numbered List</span>
                  <kbd>Cmd + Shift + 7</kbd>
                </div>
                <div className="editorcn-shortcut-row">
                  <span>Code Block</span>
                  <kbd>Cmd + Alt + C</kbd>
                </div>
              </div>
            </div>
            <div className="editorcn-shortcuts-footer">
              <span>Press <kbd>Esc</kbd> anytime to close dialogs or exit fullscreen mode.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
