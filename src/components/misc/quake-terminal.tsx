"use client";

import { useEffect, useRef, useState, FC, useMemo } from "react";
import {
  TerminalIcon,
  XIcon,
  CornerDownLeftIcon,
  SparklesIcon,
  Trash2Icon,
  Maximize2Icon,
  MinusIcon,
  CopyIcon,
  CheckIcon,
  ActivityIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { playThock, playSuccess, playShutter, playBlip, isAudioEnabled, setAudioEnabled } from "~/lib/audio";
import { PROJECTS, LINKS } from "~/lib/constants";

interface HistoryBlock {
  id: string;
  command: string;
  timestamp: string;
  executionMs: number;
  output: React.ReactNode;
  rawText?: string;
}

const ALL_COMMANDS = [
  "help",
  "neofetch",
  "bio",
  "projects",
  "ls",
  "contact",
  "matrix",
  "sfx",
  "theme",
  "sudo hire",
  "clear",
  "exit",
];

const QUICK_COMMANDS = [
  "neofetch",
  "bio",
  "projects",
  "matrix",
  "contact",
  "sudo hire",
  "help",
];

export const QuakeTerminal: FC = () => {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<"shell" | "telemetry">("shell");
  const [input, setInput] = useState("");
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initial welcome neofetch block
  const [blocks, setBlocks] = useState<HistoryBlock[]>([
    {
      id: "init",
      command: "neofetch",
      timestamp: "00:00:01",
      executionMs: 14,
      rawText: "MAARCUS_OS v2.4 (darwin24.0.0)",
      output: (
        <div className="grid gap-5 sm:grid-cols-[160px_1fr] text-sm font-mono py-1">
          <div className="text-primary font-bold leading-tight select-none">
            <pre className="text-xs sm:text-sm leading-[1.2] text-primary/90">
{`   /\_/\  
  ( o.o ) 
   > ^ <  
 MR-DEV `}
            </pre>
            <div className="mt-2 text-xs text-muted-foreground">
              [SYSTEM_ONLINE]
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 border-b border-border/50 pb-1.5 text-foreground font-bold text-base">
              <span className="text-primary">maarcus</span>
              <span className="text-muted-foreground">@</span>
              <span className="text-primary">chennai-macbook</span>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-x-2 text-xs sm:text-sm text-muted-foreground pt-1">
              <span className="text-primary/90 font-medium">OS:</span>
              <span className="text-foreground/95">Maarcus-OS / macOS Sequoia</span>
              <span className="text-primary/90 font-medium">Role:</span>
              <span className="text-foreground/95">Developer 1 @ UST Healthproof</span>
              <span className="text-primary/90 font-medium">Shell:</span>
              <span className="text-foreground/95">zsh 5.9 (warp/ghostty-style)</span>
              <span className="text-primary/90 font-medium">Stack:</span>
              <span className="text-foreground/95">TypeScript, Next.js, Spring Boot, Postgres</span>
              <span className="text-primary/90 font-medium">Location:</span>
              <span className="text-foreground/95">Chennai, Tamil Nadu, India (IST)</span>
            </div>
            <div className="flex gap-2 pt-2">
              <span className="size-3 rounded-full bg-emerald-500" />
              <span className="size-3 rounded-full bg-cyan-500" />
              <span className="size-3 rounded-full bg-indigo-500" />
              <span className="size-3 rounded-full bg-violet-500" />
              <span className="size-3 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      ),
    },
  ]);

  // Tab ghost suggestion computation
  const ghostSuggestion = useMemo(() => {
    if (!input.trim()) return "";
    const lower = input.toLowerCase();
    const match = ALL_COMMANDS.find((cmd) => cmd.startsWith(lower) && cmd !== lower);
    if (!match) return "";
    return match.slice(input.length);
  }, [input]);

  // Global backtick toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "textarea" || (tag === "input" && e.target !== inputRef.current)) {
          return;
        }
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      playSuccess();
    } else {
      setHistoryIndex(null);
      setIsMatrixActive(false);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [blocks, isMatrixActive]);

  // Matrix Canvas Animation
  useEffect(() => {
    if (!isMatrixActive || !matrixCanvasRef.current) return;
    const canvas = matrixCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 220;

    const katakana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#22c55e";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isMatrixActive]);

  const copyBlockOutput = (block: HistoryBlock) => {
    const textToCopy = block.rawText || block.command;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBlockId(block.id);
    playBlip();
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    playSuccess();
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(null);

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];
    const execMs = Math.floor(Math.random() * 15) + 6;

    let output: React.ReactNode = null;
    let rawText = "";

    switch (cmd) {
      case "help":
      case "?":
        rawText = "Available commands: neofetch, bio, projects, ls, contact, matrix, font, sfx, theme, sudo hire, clear, exit";
        output = (
          <div className="grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-2 text-sm text-muted-foreground py-1">
            <span className="text-primary font-bold">neofetch</span>
            <span>Display system specifications &amp; host stats</span>
            <span className="text-primary font-bold">bio / whoami</span>
            <span>Print bio background &amp; engineering profile</span>
            <span className="text-primary font-bold">projects / ls</span>
            <span>List active builds, GitHub repos, and status</span>
            <span className="text-primary font-bold">matrix</span>
            <span>Toggle cyber digital rain stream</span>
            <span className="text-primary font-bold">contact</span>
            <span>Reachable communication channels</span>
            <span className="text-primary font-bold">sfx &lt;on|off&gt;</span>
            <span>Toggle mechanical keyboard synthesizer</span>
            <span className="text-primary font-bold">theme &lt;dark|light&gt;</span>
            <span>Toggle dark / light color scheme</span>
            <span className="text-primary font-bold">sudo hire</span>
            <span>Execute candidate requisition protocol</span>
            <span className="text-primary font-bold">clear</span>
            <span>Wipe history buffer</span>
            <span className="text-primary font-bold">exit</span>
            <span>Close terminal dialog</span>
          </div>
        );
        break;

      case "neofetch":
      case "specs":
        rawText = "MAARCUS_OS v2.4 (darwin24.0.0)";
        output = (
          <div className="grid gap-5 sm:grid-cols-[150px_1fr] text-sm font-mono py-1">
            <div className="text-primary font-bold select-none">
              <pre className="text-xs sm:text-sm leading-[1.2] text-primary">
{`   /\_/\  
  ( o.o ) 
   > ^ <  
 MR-DEV `}
              </pre>
              <div className="mt-1 text-xs text-muted-foreground">[ONLINE]</div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="border-b border-border/50 pb-1 font-bold text-foreground text-base">
                <span className="text-primary">maarcus</span>@chennai-node
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-x-2 text-xs sm:text-sm text-muted-foreground pt-1">
                <span className="text-primary/90 font-medium">Role:</span>
                <span className="text-foreground">Developer 1 @ UST Healthproof</span>
                <span className="text-primary/90 font-medium">Uptime:</span>
                <span className="text-foreground">6+ years coding</span>
                <span className="text-primary/90 font-medium">Active Font:</span>
                <span className="text-foreground">Bricolage Grotesque</span>
                <span className="text-primary/90 font-medium">SFX Audio:</span>
                <span className="text-foreground">{isAudioEnabled() ? "ENABLED" : "MUTED"}</span>
                <span className="text-primary/90 font-medium">Memory:</span>
                <span className="text-foreground">4 Projects Active</span>
              </div>
            </div>
          </div>
        );
        break;

      case "matrix":
        setIsMatrixActive((prev) => !prev);
        rawText = "Toggling digital rain stream...";
        output = (
          <div className="space-y-2 py-1">
            <p className="text-sm text-primary font-mono font-semibold">
              ✔ {isMatrixActive ? "Matrix rain disengaged." : "Matrix rain engaged. Follow the white rabbit..."}
            </p>
            {!isMatrixActive && (
              <canvas
                ref={matrixCanvasRef}
                className="w-full h-36 rounded border border-primary/40 bg-black"
              />
            )}
          </div>
        );
        break;

      case "bio":
      case "whoami":
        rawText = "Maarcus Reniero L - Developer 1 @ UST Healthproof. Full-stack software engineer based in Chennai.";
        output = (
          <div className="space-y-2.5 text-sm sm:text-base leading-relaxed border-l-2 border-primary/70 pl-4 my-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground text-base sm:text-lg">Maarcus Reniero L</p>
              <span className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs text-primary font-semibold">
                Developer 1
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Software engineer at UST Healthproof in Chennai, India. Specializing in high-performance web applications, typed APIs, distributed internal tooling, and developer workflows.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="border border-border/80 bg-background/80 px-2.5 py-1 text-primary">Next.js 15</span>
              <span className="border border-border/80 bg-background/80 px-2.5 py-1 text-primary">TypeScript</span>
              <span className="border border-border/80 bg-background/80 px-2.5 py-1 text-primary">Spring Boot</span>
              <span className="border border-border/80 bg-background/80 px-2.5 py-1 text-primary">MySQL &amp; Postgres</span>
            </div>
          </div>
        );
        break;

      case "projects":
      case "ls":
        rawText = PROJECTS.map((p) => `${p.title} (${p.status})`).join("\n");
        output = (
          <div className="space-y-2.5 my-1 text-sm">
            <div className="grid grid-cols-[7rem_1fr_auto] gap-2 pb-1.5 border-b border-border/40 text-xs text-muted-foreground uppercase font-bold">
              <span>Permissions</span>
              <span>Project &amp; Description</span>
              <span>Links</span>
            </div>
            {PROJECTS.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_auto] gap-2 items-center p-3 rounded border border-border/60 bg-background/50 hover:border-primary/50 transition-colors"
              >
                <span className="font-mono text-xs text-muted-foreground/80 hidden sm:inline">
                  drwxr-xr-x
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-base">{p.title}</span>
                    <span className="text-xs rounded bg-primary/10 border border-primary/30 px-1.5 py-0.5 text-primary">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs sm:text-sm">
                  {p.githubLink && (
                    <a
                      href={p.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      repo ↗
                    </a>
                  )}
                  {p.hostedLink && (
                    <a
                      href={p.hostedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      live ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        break;

      case "contact":
        rawText = LINKS.map((l) => `${l.name}: ${l.url}`).join("\n");
        output = (
          <div className="grid gap-2.5 text-sm my-1 sm:grid-cols-3">
            {LINKS.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border/60 bg-background/60 p-3 font-mono text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span className="font-bold uppercase text-xs sm:text-sm">{l.name}</span>
                <span className="text-xs text-primary font-semibold">CONNECT ↗</span>
              </a>
            ))}
          </div>
        );
        break;

      case "font":
        rawText = "Typography: Bricolage Grotesque (headings & prose) + Geist Mono (terminal & instrumentation).";
        output = (
          <p className="text-sm text-primary font-mono">
            ✔ Portfolio typography: Bricolage Grotesque (headings &amp; body) + Geist Mono (code &amp; terminal).
          </p>
        );
        break;

      case "sfx":
        if (arg === "on" || arg === "off") {
          setAudioEnabled(arg === "on");
          rawText = `Audio SFX set to ${arg}`;
          output = <p className="text-sm text-primary font-mono">✔ Mechanical audio synthesizer: [{arg.toUpperCase()}]</p>;
        } else {
          rawText = `Current SFX: ${isAudioEnabled() ? "ON" : "OFF"}`;
          output = (
            <p className="text-sm text-muted-foreground font-mono">
              Current SFX state: {isAudioEnabled() ? "ENABLED" : "MUTED"}. Syntax: sfx on | sfx off
            </p>
          );
        }
        break;

      case "theme":
        if (arg === "dark" || arg === "light") {
          setTheme(arg);
          rawText = `Theme set to ${arg}`;
          output = <p className="text-sm text-primary font-mono">✔ Theme switched to [{arg}]</p>;
        } else {
          rawText = `Current theme: ${theme}`;
          output = (
            <p className="text-sm text-muted-foreground font-mono">
              Current theme: {theme}. Syntax: theme dark | theme light
            </p>
          );
        }
        break;

      case "sudo":
        if (parts[1]?.toLowerCase() === "hire") {
          rawText = "ROOT ACCESS GRANTED: Candidate Acquisition Active. Email: maarcusreniero.l@gmail.com";
          output = (
            <div className="border border-primary/70 bg-primary/10 p-5 text-sm text-primary space-y-2.5 shadow-[0_0_25px_rgba(74,222,128,0.2)]">
              <div className="flex items-center gap-2 font-bold tracking-wider text-base">
                <SparklesIcon className="size-4 animate-spin text-primary" />
                <span>ROOT PRIVILEGE GRANTED // ACCESS UNLOCKED</span>
              </div>
              <p className="text-foreground leading-relaxed text-sm sm:text-base">
                Direct channel: <strong className="text-primary font-mono">maarcusreniero.l@gmail.com</strong>
                <br />
                Ready for full-stack engineering, developer tooling, and product roles.
              </p>
              <div className="pt-1.5">
                <a
                  href="mailto:maarcusreniero.l@gmail.com?subject=Engineering%20Opportunity"
                  className="inline-flex items-center gap-2 border border-primary bg-primary px-3.5 py-1.5 font-mono text-xs sm:text-sm text-primary-foreground font-bold hover:opacity-90"
                >
                  Send Direct Dispatch ↗
                </a>
              </div>
            </div>
          );
        } else {
          rawText = "maarcus is not in the sudoers file.";
          output = (
            <p className="text-sm text-destructive font-mono">
              maarcus is not in the sudoers file. This incident will be reported.
            </p>
          );
        }
        break;

      case "clear":
        setBlocks([]);
        setInput("");
        return;

      case "exit":
      case "quit":
        setOpen(false);
        setInput("");
        return;

      default:
        rawText = `zsh: command not found: ${cmd}`;
        output = (
          <p className="text-sm text-destructive font-mono">
            zsh: command not found: {cmd}. Type <span className="underline cursor-pointer text-primary font-bold" onClick={() => executeCommand("help")}>help</span> to view commands.
          </p>
        );
    }

    const newBlock: HistoryBlock = {
      id: Math.random().toString(36).substring(7),
      command: trimmed,
      timestamp,
      executionMs: execMs,
      output,
      rawText,
    };

    setBlocks((prev) => [...prev, newBlock]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (ghostSuggestion) {
        setInput((prev) => prev + ghostSuggestion);
        playThock();
      }
    } else if (e.key === "ArrowRight" && input.length === (e.target as HTMLInputElement).selectionStart) {
      if (ghostSuggestion) {
        e.preventDefault();
        setInput((prev) => prev + ghostSuggestion);
        playThock();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(commandHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
    }
  };

  return (
    <>
      {/* Floating Cyber Launcher Badge in Bottom Right */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 border border-border/80 bg-card/90 px-3.5 py-1.5 font-mono text-xs text-foreground shadow-2xl backdrop-blur-md transition-all hover:border-primary hover:text-primary active:scale-95 group"
        title="Open Warp/Ghostty Terminal (`)"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <TerminalIcon className="size-3.5 text-primary transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline font-semibold">~/terminal</span>
        <kbd className="rounded border border-border/80 bg-background/80 px-1 text-[10px] text-muted-foreground group-hover:text-primary">
          `
        </kbd>
      </button>

      {/* Centered Modal Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
              setOpen(false);
            }
          }}
        >
          <div
            ref={modalRef}
            className={`flex flex-col border border-border/80 dark:border-primary/40 bg-card/95 font-mono text-foreground shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-200 overflow-hidden ${
              maximized
                ? "w-full h-full max-w-full max-h-full rounded-none"
                : "w-full max-w-3xl h-[620px] max-h-[90vh] rounded-xl"
            }`}
          >
            {/* Warp/Ghostty Native Style Tabs & Chrome */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5 select-none">
              {/* Left: macOS traffic lights */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="group relative size-3.5 rounded-full bg-[#ff5f56] transition-transform active:scale-90 flex items-center justify-center"
                  aria-label="Close terminal"
                  title="Close (ESC)"
                >
                  <XIcon className="size-2 text-[#4c0000] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlocks([]);
                    playSuccess();
                  }}
                  className="group relative size-3.5 rounded-full bg-[#ffbd2e] transition-transform active:scale-90 flex items-center justify-center"
                  aria-label="Clear screen"
                  title="Clear buffer"
                >
                  <MinusIcon className="size-2 text-[#5c3b00] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  type="button"
                  onClick={() => setMaximized((prev) => !prev)}
                  className="group relative size-3.5 rounded-full bg-[#27c93f] transition-transform active:scale-90 flex items-center justify-center"
                  aria-label="Maximize window"
                  title="Toggle maximize"
                >
                  <Maximize2Icon className="size-2 text-[#003808] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              {/* Center: Interactive Session Tabs */}
              <div className="flex items-center gap-1.5 bg-background/70 p-0.5 rounded border border-border/60 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("shell");
                    playShutter();
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-all ${
                    activeTab === "shell"
                      ? "bg-card text-primary font-bold shadow-xs border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TerminalIcon className="size-3.5" />
                  <span>zsh: ~/portfolio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("telemetry");
                    playShutter();
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-all ${
                    activeTab === "telemetry"
                      ? "bg-card text-primary font-bold shadow-xs border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ActivityIcon className="size-3.5" />
                  <span>sys.telemetry</span>
                </button>
              </div>

              {/* Right: Window controls and ESC badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBlocks([])}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear buffer"
                >
                  <Trash2Icon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1 rounded border border-border/80 bg-background/60 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <span>ESC</span>
                </button>
              </div>
            </div>

            {/* Quick Action Suggestion Chips Bar */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-background/50 px-4 py-2.5 overflow-x-auto palette-scroll">
              <span className="font-mono text-xs uppercase text-muted-foreground/80 shrink-0 mr-1 font-semibold">
                quick-pills:
              </span>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  className="shrink-0 rounded border border-border/60 bg-card/70 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95 font-medium"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Tab 1: Warp-Style Structured Blocks Screen */}
            {activeTab === "shell" ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 palette-scroll text-sm sm:text-base">
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    className="group relative rounded-lg border border-border/60 bg-background/50 p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-background/70"
                  >
                    {/* Block Header */}
                    <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2.5 font-mono text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-base">❯</span>
                        <span className="font-bold text-foreground text-sm sm:text-base">{b.command}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{b.timestamp}</span>
                        <span className="rounded bg-primary/15 px-1.5 py-0.2 font-mono text-primary font-semibold">
                          0 [{b.executionMs}ms]
                        </span>
                        <button
                          type="button"
                          onClick={() => copyBlockOutput(b)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors opacity-70 group-hover:opacity-100"
                          title="Copy command block"
                        >
                          {copiedBlockId === b.id ? (
                            <CheckIcon className="size-3.5 text-primary" />
                          ) : (
                            <CopyIcon className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Block Output Body */}
                    <div className="pl-1 text-foreground/95 text-sm sm:text-base leading-relaxed">{b.output}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            ) : (
              /* Tab 2: System Telemetry Monitor */
              <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm palette-scroll">
                <div className="border border-primary/50 bg-primary/10 p-4 rounded text-primary">
                  <p className="font-bold text-base">TELEMETRY_ENGINE // LIVE_METRICS</p>
                  <p className="text-muted-foreground text-sm mt-1">Real-time portfolio runtime telemetry and client manifest diagnostic</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border border-border/60 bg-background/50 p-3.5 rounded">
                    <span className="text-muted-foreground uppercase text-xs">Client Host</span>
                    <p className="text-foreground font-semibold mt-1 text-sm sm:text-base">Next.js 15.5.19 (React 19)</p>
                  </div>
                  <div className="border border-border/60 bg-background/50 p-3.5 rounded">
                    <span className="text-muted-foreground uppercase text-xs">Active Typography</span>
                    <p className="text-primary font-semibold mt-1 text-sm sm:text-base">Bricolage Grotesque</p>
                  </div>
                  <div className="border border-border/60 bg-background/50 p-3.5 rounded">
                    <span className="text-muted-foreground uppercase text-xs">Audio Synthesizer</span>
                    <p className="text-foreground font-semibold mt-1 text-sm sm:text-base">{isAudioEnabled() ? "ACTIVE (Web Audio API)" : "MUTED"}</p>
                  </div>
                  <div className="border border-border/60 bg-background/50 p-3.5 rounded">
                    <span className="text-muted-foreground uppercase text-xs">Latency Ping</span>
                    <p className="text-primary font-semibold mt-1 text-sm sm:text-base">24ms [SYS_ONLINE]</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seamless, 100% Borderless Integrated Prompt with Larger Legible Font */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(input);
              }}
              className="relative flex items-center gap-3 bg-card/90 px-5 py-4 text-sm sm:text-base"
            >
              <div className="flex items-center gap-2 text-primary font-bold font-mono text-base sm:text-lg select-none">
                <span>~/portfolio</span>
                <span className="text-primary font-extrabold">❯</span>
              </div>

              {/* Input container with ghost text overlay — Zero Border, Zero Outline, Zero Ring */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setInput(e.target.value);
                    playThock();
                  }}
                  placeholder="type a command, e.g. 'neofetch', 'projects', 'matrix', 'help'..."
                  className="relative z-10 w-full border-0 outline-none ring-0 shadow-none bg-transparent text-foreground placeholder:text-muted-foreground/50 font-mono text-sm sm:text-base focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />
                {ghostSuggestion && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 z-0 flex items-center font-mono text-sm sm:text-base"
                  >
                    <span className="opacity-0">{input}</span>
                    <span className="text-muted-foreground/50 select-none">
                      {ghostSuggestion}
                      <span className="ml-2.5 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                        TAB
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Borderless Submit Action Icon */}
              <button
                type="submit"
                className="border-0 bg-transparent p-1.5 text-primary transition-all hover:bg-primary/20 hover:text-primary rounded"
                aria-label="Execute command"
              >
                <CornerDownLeftIcon className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
