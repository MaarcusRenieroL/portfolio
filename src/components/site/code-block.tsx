"use client";

import { Fragment, useState } from "react";
import { Check } from "./icons";

const KW = /^(async|fn|match|await|let|pub|return|use|struct|impl|enum|mut|const|if|else|for|in|new|public|class|import|from|export|function)$/;

function tokenize(line: string) {
  const out: React.ReactNode[] = [];
  const re = /(\/\/.*$)|(#\[[^\]]*\])|("[^"]*")|([A-Za-z_][A-Za-z0-9_]*)|(\d+)|(.)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line))) {
    const [t, com, attr, str, word, num] = m;
    const k = i++;
    if (com) out.push(<span key={k} className="tk-c">{t}</span>);
    else if (attr) out.push(<span key={k} className="tk-a">{t}</span>);
    else if (str) out.push(<span key={k} className="tk-s">{t}</span>);
    else if (word) out.push(KW.test(word) ? <span key={k} className="tk-k">{t}</span> : /^[A-Z]/.test(word) ? <span key={k} className="tk-t">{t}</span> : <Fragment key={k}>{t}</Fragment>);
    else if (num) out.push(<span key={k} className="tk-n">{t}</span>);
    else out.push(<Fragment key={k}>{t}</Fragment>);
  }
  return out;
}

export function CodeBlock({ file, lines, hl }: { file: string; lines: string[]; hl?: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="code" style={{ margin: "28px 0" }} data-reveal>
      <div className="code-bar">
        <span>{file}</span>
        <button className="btn btn-quiet btn-sm" type="button" style={{ minHeight: 28 }} onClick={copy} aria-live="polite">
          {copied ? (
            <>
              <Check style={{ color: "var(--blade)" }} /> Copied
            </>
          ) : (
            "Copy"
          )}
        </button>
      </div>
      <pre>
        {lines.map((l, i) => {
          const body = (
            <>
              <span className="ln">{i + 1}</span>
              {tokenize(l)}
            </>
          );
          return i + 1 === hl ? (
            <span key={i} className="hl">{body}{"\n"}</span>
          ) : (
            <Fragment key={i}>{body}{"\n"}</Fragment>
          );
        })}
      </pre>
    </div>
  );
}
