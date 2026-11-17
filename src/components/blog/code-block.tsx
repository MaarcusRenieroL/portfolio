"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { useDict } from "~/components/site/locale";

export function CodeBlock({
  children,
  className,
  node,
  ...props
}: React.ComponentPropsWithoutRef<"pre"> & { node?: unknown }) {
  const t = useDict().ui;
  const [copied, setCopied] = useState(false);

  // Extract raw text from children for clipboard copy
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (React.isValidElement(node) && node.props && (node.props as { children?: React.ReactNode }).children) {
      return extractText((node.props as { children?: React.ReactNode }).children);
    }
    return "";
  };

  const rawCode = extractText(children).trim();

  // Robust language detection from AST node or React children
  let lang = "";

  // 1. Check hast AST node properties from rehype/react-markdown
  // react-markdown passes the hast node; it must not reach the DOM <pre>.
  const hast = node as { children?: Array<{ properties?: { className?: string | string[] } }> } | undefined;
  if (hast?.children) {
    for (const child of hast.children) {
      if (child?.properties?.className) {
        const clsArr = child.properties.className;
        const clsStr = Array.isArray(clsArr) ? clsArr.join(" ") : String(clsArr);
        const m = /language-([a-z0-9_-]+)/i.exec(clsStr);
        if (m) {
          lang = m[1];
          break;
        }
      }
    }
  }

  // 2. Fallback: Search React children tree for language-* class
  if (!lang) {
    const findClass = (el: React.ReactNode): string => {
      if (!el) return "";
      if (React.isValidElement(el)) {
        const c = String((el.props as { className?: string })?.className || "");
        if (c.includes("language-")) return c;
        if ((el.props as { children?: React.ReactNode }).children) {
          const nested = findClass((el.props as { children?: React.ReactNode }).children);
          if (nested) return nested;
        }
      }
      if (Array.isArray(el)) {
        for (const item of el) {
          const res = findClass(item);
          if (res) return res;
        }
      }
      return "";
    };

    const cls = findClass(children);
    const m = /language-([a-z0-9_-]+)/i.exec(cls);
    if (m) lang = m[1];
  }

  // 3. Fallback to outer className
  if (!lang && className) {
    const m = /language-([a-z0-9_-]+)/i.exec(className);
    if (m) lang = m[1];
  }

  const handleCopy = async () => {
    if (!rawCode) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(rawCode);
      ok = true;
    } catch {
      // Older browsers / insecure contexts: the textarea + execCommand fallback.
      const ta = document.createElement("textarea");
      ta.value = rawCode;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-xl border border-[var(--line)] bg-[var(--hover)]/35 overflow-hidden group/code transition-colors hover:border-[var(--line-2)] shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-xs select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--fg-3)]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--fg-3)] font-medium">
            {lang || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--green)]"
          aria-label={copied ? t.copied : t.copyCode}
          title={t.copyCode}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--green)]" />
              <span className="text-[var(--green)]" role="status">{t.copied}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 opacity-70 group-hover/code:opacity-100" />
              <span>{t.copy}</span>
            </>
          )}
        </button>
      </div>

      {/* Actual Pre/Code content */}
      <pre
        className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent] text-[var(--fg)] bg-transparent m-0 border-0 rounded-none"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
