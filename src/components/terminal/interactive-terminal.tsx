"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "ascii";
  text: string;
}

const ZORO_ASCII_BANNER = `
      /| ________________
O|===|* >________________>  [ENMA BLADE]
      \\|
  ___                 _                 
 |_  /___  _ _ ___   /_\\  _ _ _ __ _  _ 
  / // _ \\| '_/ _ \\ / _ \\| '_| '_ \\ || |
 /___\\___/|_| \\___//_/ \\_\\_| | .__/\\_, |
                             |_|   |__/ 
`;

const INITIAL_WELCOME = `${ZORO_ASCII_BANNER}
  Host:        Next.js 16.4.2 · React 19.3 (Streaming App Router)
  Kernel:      Zoro OS x86_64 (Dark Emerald Noir)
  Engineer:    Maarcus Reniero L · Full Stack & Systems
  Location:    Chennai, IN (IST UTC+5:30)
  Core Stack:  Go, TypeScript, Next.js 16, PostgreSQL, Docker, AWS, Redis
  Shell:       zsh 5.9 (Zoro Three-Sword Prompt)

  Type 'help' for command list, or click any quick command below.
`;

const COMMAND_LIST = [
  "help",
  "neofetch",
  "projects",
  "resume",
  "skills",
  "quote",
  "matrix",
  "whoami",
  "schedule",
  "clear",
  "exit",
];

const ZORO_QUOTES = [
  "Nothing happened.",
  "Scars on the back are a swordsman's greatest shame.",
  "When the world shoves you around, you just gotta stand up and shove back.",
  "If I die here, then I'm a man that could only make it this far.",
  "I don't care what society says. I've never regretted doing anything.",
  "There is someone that I must meet again. And until that day, not even Death itself can take my life away.",
];

export function InteractiveTerminal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "welcome",
      type: "ascii",
      text: INITIAL_WELCOME,
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Global key listener: ~ or ` to toggle terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "~" || e.key === "`") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Keep input focused and scrolled to bottom on any change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
      terminalBodyRef.current?.scrollTo({
        top: terminalBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isOpen, lines, input]);

  const handleCommand = (rawCommand: string) => {
    const raw = rawCommand.trim();
    if (!raw) return;

    // Add to command history
    setHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    const cmd = raw.toLowerCase();
    const newLines: TerminalLine[] = [
      ...lines,
      { id: String(Date.now()), type: "input", text: raw },
    ];

    if (cmd === "clear") {
      setLines([]);
      setInput("");
      return;
    }

    if (cmd === "exit") {
      setIsOpen(false);
      setInput("");
      return;
    }

    let output = "";
    let type: TerminalLine["type"] = "output";

    if (cmd === "help") {
      output = `Available Shell Commands:
  neofetch     Print Zoro OS architecture and engineer specs
  projects     List flagship projects and production systems
  skills       Display primary languages, databases and tools
  resume       View formatted career achievements & ATS link
  quote        Receive an iconic blade quote from Zoro
  matrix       Activate falling green digital rain
  schedule     Open the native Mini Cal.com scheduler
  whoami       Identity & security clearance
  clear        Clear screen buffer
  exit         Close the terminal window`;
    } else if (cmd === "neofetch" || cmd === "fastfetch") {
      output = INITIAL_WELCOME;
      type = "ascii";
    } else if (cmd === "projects" || cmd === "ls" || cmd === "ls projects") {
      output = `Flagship Production Systems:
  • nyx         High-throughput modular backend framework in Go & TypeScript. Zero-trust auth & Redis caching.
  • next-kit    Production starter for Next.js 16 App Router, Tailwind v4, server components & security headers.
  • portfolio   This site: PostgreSQL CMS, Passkey/WebAuthn auth, cookieless telemetry, Zoro dark-green craft.
  
  Run 'schedule' or visit /projects to view live repositories.`;
    } else if (cmd === "skills" || cmd === "stack") {
      output = `Primary Engineering Swords:
  • Languages:  Go, TypeScript, Node.js, SQL, C++, Python
  • Frameworks: Next.js 16 (App Router), React 19, Express, Tailwind CSS v4
  • Databases:  PostgreSQL, Redis (Sliding-window rate limiting), Prisma
  • DevOps:     Docker containerization, AWS (S3, CloudFront, ECS), Linux, Git, CI/CD`;
    } else if (cmd === "resume" || cmd === "cat resume" || cmd === "cat resume.md") {
      output = `Maarcus Reniero L · Full Stack & Backend Engineer (Chennai, IN)
  Experience in distributed backends, low-latency microservices and database migrations.
  Available for full-time remote opportunities worldwide and on-site in Bangalore / Chennai.
  ATS single-page PDF generator available at /resume.`;
    } else if (cmd === "quote" || cmd === "zoro") {
      const q = ZORO_QUOTES[Math.floor(Math.random() * ZORO_QUOTES.length)];
      output = `\n  "${q}"\n  — Roronoa Zoro\n`;
    } else if (cmd === "whoami") {
      output = "guest@maarcus.dev [Role: Authorized Visitor · Permissions: Read-Only]";
    } else if (cmd === "schedule" || cmd === "call" || cmd === "book") {
      output = "Opening native Mini Cal.com scheduling engine... Navigate to /schedule or click '📅 Book Call'.";
      router.push("/schedule");
    } else if (cmd === "matrix") {
      output = "[*] Emerald Matrix protocol active: 01001101 01100001 01100001 01110010 01100011 01110101 01110011\nSystem running in optimal overclocked state.";
    } else {
      output = `zsh: command not found: ${raw}. Type 'help' for available commands.`;
      type = "error";
    }

    setLines([...newLines, { id: String(Date.now() + 1), type, text: output }]);
    setInput("");
  };

  // Keyboard navigation for history (Up/Down) & Tab autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] || "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;
      const match = COMMAND_LIST.find((c) => c.startsWith(current));
      if (match) setInput(match);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 group flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#060a08]/90 px-3.5 py-1.5 text-xs font-mono text-neutral-300 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-emerald-400 hover:bg-neutral-900 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)] active:scale-95"
        title="Open Interactive Terminal (~)"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <TerminalIcon className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline font-semibold">Ghostty Terminal</span>
        <kbd className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400 font-mono">
          ~
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-lg animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`relative flex flex-col rounded-2xl border border-emerald-500/40 bg-[#050806]/98 font-mono text-xs text-neutral-200 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(16,185,129,0.15)] transition-all duration-200 overflow-hidden ${
          isMaximized ? "w-full h-full rounded-none border-none" : "w-full max-w-3xl h-[520px] sm:h-[580px]"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.focus();
        }}
      >
        {/* Katana Glow Top Edge */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

        {/* Ghostty / macOS Authentic Title Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#070d0a] px-4 py-2.5 select-none">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-3 w-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Close"
            >
              <X className="h-2 w-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => setLines([])}
              className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Clear screen"
              title="Clear screen buffer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/40 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-3 w-3 rounded-full bg-[#27c93f] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Maximize"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/40 opacity-0 group-hover:opacity-100" />
            </button>

            {/* Active Tab Badge */}
            <div className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-neutral-800/80 bg-[#0a120e] px-2.5 py-0.5 text-[11px] text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>zsh — zoro@maarcus.dev</span>
            </div>
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span className="hidden sm:inline-block text-neutral-400">Press ~ to close</span>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:text-white transition-colors"
              title={isMaximized ? "Restore window" : "Maximize window"}
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:text-white transition-colors"
              title="Close terminal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Terminal Screen Buffer */}
        <div
          ref={terminalBodyRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 scrollbar-thin select-text text-[12px] leading-relaxed cursor-text"
        >
          {lines.map((l) => (
            <div key={l.id} className="whitespace-pre-wrap">
              {l.type === "input" ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
                  <span className="text-neutral-400">zoro@maarcus</span>
                  <span className="text-emerald-500">~</span>
                  <span className="text-neutral-400 font-normal">git:(main)</span>
                  <span className="text-emerald-400">❯</span>
                  <span className="text-white">{l.text}</span>
                </div>
              ) : l.type === "error" ? (
                <div className="text-red-400 pl-2 border-l border-red-500/40">{l.text}</div>
              ) : l.type === "ascii" ? (
                <div className="text-emerald-300/90 font-mono text-[11px] leading-tight select-text py-1">
                  {l.text}
                </div>
              ) : (
                <div className="text-neutral-300 pl-2 border-l border-neutral-800">{l.text}</div>
              )}
            </div>
          ))}

          {/* True Inline Active Prompt Line (Directly in stream, NO awkward isolated box!) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCommand(input);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <span className="text-neutral-400">zoro@maarcus</span>
            <span className="text-emerald-500">~</span>
            <span className="text-neutral-400 font-normal hidden sm:inline">git:(main)</span>
            <span className="text-emerald-400 font-bold">❯</span>
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white outline-none caret-emerald-400 font-mono text-[12px]"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </form>
        </div>

        {/* Quick Clickable Suggestions Bar (At footer of terminal) */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 bg-[#070c09] px-3.5 py-2 select-none overflow-x-auto scrollbar-none gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-mono text-neutral-400 hidden sm:inline mr-1">
              Quick:
            </span>
            {["neofetch", "projects", "skills", "resume", "quote", "matrix", "clear"].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => handleCommand(cmd)}
                className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-neutral-400 shrink-0">
            <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1">Tab</kbd> complete
            <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 ml-1">↑/↓</kbd> history
          </div>
        </div>
      </div>
    </div>
  );
}
