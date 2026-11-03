"use client";

import { Dialog } from "radix-ui";
import { useTheme } from "next-themes";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { PROJECTS, SITE, STACK_GROUPS } from "~/lib/content";
import { go } from "~/lib/ui";
import { Mark } from "./icons";

type Line = { kind: "cmd" | "out" | "err"; node: React.ReactNode };

const KEY = "term-history";
const COMMANDS = ["help", "whoami", "ls", "ls projects", "open", "cat stack", "resume", "contact", "theme light", "theme dark", "clear", "exit"];

const INTRO: Line = {
  kind: "out",
  node: (
    <span className="m">
      Type <span className="c">help</span> for commands. Tab completes. ↑ history.
    </span>
  ),
};

export default function Terminal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { setTheme } = useTheme();
  const [lines, setLines] = useState<Line[]>([INTRO]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setHist(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [lines]);

  const slugs = PROJECTS.map((p) => p.slug);

  const run = (raw: string) => {
    const cmd = raw.trim();
    const out: Line[] = [{ kind: "cmd", node: cmd }];
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    const row = (a: string, b: string) => (
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", columnGap: 24, paddingLeft: 20 }}>
        <span className="c">{a}</span>
        <span className="m">{b}</span>
      </div>
    );
    switch (name) {
      case "":
        break;
      case "help":
        out.push({
          kind: "out",
          node: (
            <div>
              {row("whoami", "one-paragraph intro")}
              {row("ls projects", `list all ${PROJECTS.length} projects`)}
              {row("open <slug>", "jump to a case study")}
              {row("cat stack", "tools, grouped")}
              {row("resume", "download PDF")}
              {row("contact", "open the contact form")}
              {row("theme light|dark", "switch theme")}
              {row("clear / exit", "clear screen / close")}
            </div>
          ),
        });
        break;
      case "whoami":
        out.push({ kind: "out", node: <span className="w">{SITE.name}: full stack engineer, backend-leaning. Java/Spring Boot at HealthEdge, TypeScript/Next.js on the side, sharpening toward AI, cloud and security. {SITE.location}.</span> });
        break;
      case "ls":
        out.push({
          kind: "out",
          node: (
            <span style={{ display: "flex", flexWrap: "wrap", columnGap: 28, paddingLeft: 20 }}>
              {slugs.map((s) => (
                <span key={s} className="w">{s}</span>
              ))}
            </span>
          ),
        });
        break;
      case "cat":
        if (arg === "stack") {
          out.push({
            kind: "out",
            node: (
              <div style={{ paddingLeft: 20 }}>
                {STACK_GROUPS.map((g) => (
                  <div key={g.name}>
                    <span className="c">{g.name.toLowerCase()}</span> <span className="m">→</span> <span className="w">{g.items.map((i) => i.replace("*", "")).join(", ")}</span>
                  </div>
                ))}
              </div>
            ),
          });
        } else out.push({ kind: "err", node: `cat: ${arg || "?"}: no such file` });
        break;
      case "open": {
        const p = PROJECTS.find((x) => x.slug === arg || x.name === arg);
        if (!p) out.push({ kind: "err", node: `open: ${arg || "?"}: no such project (try ls projects)` });
        else {
          out.push({ kind: "out", node: <span className="m">opening {p.slug}…</span> });
          window.setTimeout(() => {
            onOpenChange(false);
            if (p.external) window.open(p.external, "_blank", "noopener");
            else go(`/projects/${p.slug}`);
          }, 220);
        }
        break;
      }
      case "resume":
        out.push({ kind: "out", node: <span className="m">downloading resume…</span> });
        { const a = document.createElement("a"); a.href = "/api/resume"; a.download = ""; a.click(); }
        break;
      case "contact":
        out.push({ kind: "out", node: <span className="m">opening contact…</span> });
        window.setTimeout(() => {
          onOpenChange(false);
          go("/contact");
        }, 220);
        break;
      case "theme":
        if (arg === "light" || arg === "dark") {
          setTheme(arg);
          out.push({ kind: "out", node: <span className="m">theme: {arg}</span> });
        } else out.push({ kind: "err", node: "usage: theme light|dark" });
        break;
      case "clear":
        setLines([INTRO]);
        return;
      case "exit":
        onOpenChange(false);
        return;
      default:
        out.push({ kind: "err", node: `${name}: command not found. Try help.` });
    }
    setLines((l) => [...l, ...out]);
    if (cmd) {
      const next = [...hist, cmd].slice(-50);
      setHist(next);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
    }
    setHi(-1);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      if (hist[i] !== undefined) {
        setHi(i);
        setValue(hist[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hi + 1;
      if (i >= hist.length) {
        setHi(-1);
        setValue("");
      } else {
        setHi(i);
        setValue(hist[i]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const pool = [...COMMANDS, ...slugs.map((s) => `open ${s}`)];
      const m = pool.find((c) => value && c.startsWith(value));
      if (m) setValue(m);
    } else if (e.key === "`" ) {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ov-scrim" />
        <Dialog.Content className="term-pos site" aria-describedby={undefined} onOpenAutoFocus={(e) => { e.preventDefault(); input.current?.focus(); }} style={{ minHeight: 0, background: "transparent", display: "block" }}>
          <Dialog.Title style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Terminal</Dialog.Title>
          <div className="term" style={{ height: "52vh", minHeight: 320, display: "flex", flexDirection: "column" }} onClick={() => input.current?.focus()}>
            <div className="term-bar">
              <Mark size={16} />
              <span>maarcus@dev: ~</span>
              <span style={{ marginLeft: "auto" }} className="row">
                <span className="m" style={{ marginRight: 10 }}>close</span>
                <span className="kbd">`</span>
                <span className="kbd" style={{ marginLeft: 6 }}>Esc</span>
              </span>
            </div>
            <div className="term-body" ref={body} style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {lines.map((l, i) => (
                <div key={i} style={{ marginTop: l.kind === "cmd" ? 10 : 0, color: l.kind === "err" ? "var(--danger)" : undefined }}>
                  {l.kind === "cmd" ? (
                    <>
                      <span className="p">~ $</span> <span className="w">{l.node}</span>
                    </>
                  ) : (
                    l.node
                  )}
                </div>
              ))}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="p">~ $</span>
                <input
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKey}
                  aria-label="Terminal input"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "#e7f1ea", font: "inherit", caretColor: "#c8f031" }}
                />
              </div>
            </div>
            <div className="term-grip" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
