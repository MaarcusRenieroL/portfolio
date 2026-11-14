"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "table" | "ascii";
  text: string;
}

const ZORO_ASCII_BLADE = `
      /| __________________________________________
0|===|* >__________________________________________>  [WADO ICHIMONJI · ENMA]
      \\|
  ______                   ____   _____
 |___  /                  / __ \\ / ____|
    / / ___  _ __ ___    | |  | | (___  
   / / / _ \\| '__/ _ \\   | |  | |\\___ \\ 
  / /_| (_) | | | (_) |  | |__| |____) |
 /_____\\___/|_|  \\___/    \\____/|_____/  x86_64
`;

const TERMCAN_NEOFETCH = `
${ZORO_ASCII_BLADE}
┌───────────────────────────┬────────────────────────────────────────────────────────┐
│ SYSTEM METRICS            │ KERNEL SPECIFICATIONS                                  │
├───────────────────────────┼────────────────────────────────────────────────────────┤
│ OS                        │ Zoro OS 6.12.0-zoro-zen (Emerald Obsidian Dark)        │
│ Host                      │ Next.js 16.4.2 · React 19.3 (Streaming App Router)     │
│ Architecture              │ x86_64-pc-linux-gnu (Clang/LLVM 18.1)                  │
│ Engineer                  │ Maarcus Reniero L · Full Stack & Backend Specialist    │
│ Location                  │ Chennai, IN (IST UTC+5:30)                             │
│ Primary Swords            │ Go, TypeScript, Java (Spring), Next.js, PostgreSQL     │
│ Shell                     │ zsh 5.9 (termcn / Ghostty emulation)                   │
│ Terminal                  │ xterm-256color · 80x24 truecolor                       │
│ Uptime                    │ 99.98% (High Availability Distributed Cluster)         │
│ Memory                    │ 1.24 GiB / 16.00 GiB (7.7% Optimized Footprint)       │
├───────────────────────────┴────────────────────────────────────────────────────────┤
│ ANSI COLORS:  ███  ███  ███  ███  ███  ███  ███  ███                               │
└────────────────────────────────────────────────────────────────────────────────────┘
`;

const TERMCAN_HELP = `
┌─────────────┬──────────────────────────────────────────────────────────────────────┐
│ COMMAND     │ FUNCTION & USAGE                                                     │
├─────────────┼──────────────────────────────────────────────────────────────────────┤
│ neofetch    │ Print system architecture, kernel specs & ANSI color palette         │
│ projects    │ Display production systems, GitHub repositories and architectures    │
│ skills      │ Inspect backend languages, frameworks, databases & cloud tools       │
│ resume      │ Output career milestones, achievements and ATS PDF download link     │
│ schedule    │ Launch the native Cal.com booking engine (/schedule)                 │
│ quote       │ Receive an iconic blade philosophy quote from Roronoa Zoro           │
│ matrix      │ Stream emerald digital rain protocol                                 │
│ whoami      │ Display active session identity & clearance level                    │
│ clear       │ Flush the screen buffer                                              │
│ exit        │ Close the interactive terminal window                                │
└─────────────┴──────────────────────────────────────────────────────────────────────┘
`;

const TERMCAN_PROJECTS = `
┌───────────┬──────────────────────────────────────────┬─────────────────────────────┐
│ PROJECT   │ SYSTEM DESCRIPTION                       │ TECH STACK                  │
├───────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ nyx       │ High-throughput modular backend & CLI    │ Go · SQLite FTS5 · Redis    │
│ next-kit  │ Next.js 16 production starter framework  │ React 19 · Tailwind v4 · TS │
│ portfolio │ Zoro obsidian developer OS & booking CMS │ Next.js · PostgreSQL · Neon │
└───────────┴──────────────────────────────────────────┴─────────────────────────────┘
Run 'schedule' or open /projects to review live code and metrics.
`;

const TERMCAN_SKILLS = `
┌─────────────┬──────────────────────────────────────────────────────────────────────┐
│ CATEGORY    │ TECHNOLOGIES & TOOLS                                                 │
├─────────────┼──────────────────────────────────────────────────────────────────────┤
│ Languages   │ Go, TypeScript, Java, SQL, C++, Python, Bash                         │
│ Frameworks  │ Next.js 16 (App Router), React 19, Spring Boot, Spring Batch, Node   │
│ Databases   │ PostgreSQL, Redis (Sliding-window rate limiter), Neon, SQLite        │
│ Cloud & CI  │ Docker containerization, AWS (ECS, S3, CloudFront), Linux, Git       │
└─────────────┴──────────────────────────────────────────────────────────────────────┘
`;

const TERMCAN_RESUME = `
┌────────────────────────────────────────────────────────────────────────────────────┐
│ RESUME · MAARCUS RENIERO L                                                         │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Role:     Full Stack Software Engineer (Leaning Backend & Distributed Systems)     │
│ Current:  Software Developer at HealthEdge (Spring Boot, Spring Batch, Healthcare) │
│ Scope:    High-throughput transaction pipelines, low-latency APIs, database tuning│
│ Target:   Full-time remote engineering roles (EU / APAC / Global) or onsite BLR/MAA│
│ Download: Open /resume to generate an ATS-optimized 1-page PDF                     │
└────────────────────────────────────────────────────────────────────────────────────┘
`;

const COMMAND_LIST = [
  "help",
  "neofetch",
  "projects",
  "skills",
  "resume",
  "schedule",
  "quote",
  "matrix",
  "whoami",
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
  const [matrixActive, setMatrixActive] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "welcome",
      type: "ascii",
      text: `${TERMCAN_NEOFETCH}\nType 'help' for command manual, or click any quick badge below.`,
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

    // Add to history
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

    if (cmd === "help" || cmd === "man") {
      output = TERMCAN_HELP;
      type = "table";
    } else if (cmd === "neofetch" || cmd === "fastfetch") {
      output = TERMCAN_NEOFETCH;
      type = "ascii";
    } else if (cmd === "projects" || cmd === "ls" || cmd === "ls -la") {
      output = TERMCAN_PROJECTS;
      type = "table";
    } else if (cmd === "skills" || cmd === "stack") {
      output = TERMCAN_SKILLS;
      type = "table";
    } else if (cmd === "resume" || cmd === "cat resume" || cmd === "cat resume.md") {
      output = TERMCAN_RESUME;
      type = "table";
    } else if (cmd === "quote" || cmd === "zoro") {
      const q = ZORO_QUOTES[Math.floor(Math.random() * ZORO_QUOTES.length)];
      output = `\n  "${q}"\n  — Roronoa Zoro (Straw Hat Pirates First Mate)\n`;
    } else if (cmd === "whoami") {
      output = `┌────────────────────────────────────────────────────────┐\n│ USER: guest@maarcus.dev [Role: Authorized Visitor]      │\n│ PERMS: r-x (Public Read & Execution Clearance)          │\n└────────────────────────────────────────────────────────┘`;
    } else if (cmd === "schedule" || cmd === "call" || cmd === "book") {
      output = `[✔] Cal.com engine engaged. Launching /schedule...`;
      router.push("/schedule");
    } else if (cmd === "matrix") {
      setMatrixActive(true);
      setTimeout(() => setMatrixActive(false), 5000);
      output = `[*] INITIALIZING EMERALD DIGITAL STREAM PROTOCOL... (Running 5s Matrix Rain)`;
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
        className={`relative flex flex-col rounded-2xl border border-neutral-800 bg-[#040705]/98 font-mono text-xs text-neutral-200 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(16,185,129,0.12)] transition-all duration-200 overflow-hidden ${
          isMaximized ? "w-full h-full rounded-none border-none" : "w-full max-w-3xl h-[540px] sm:h-[600px]"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.focus();
        }}
      >
        {/* Neon Emerald Katana Top Highlight */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

        {/* Ghostty / termcn Authentic Title Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#060b08] px-4 py-2.5 select-none">
          {/* macOS Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-3 w-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Close terminal"
            >
              <X className="h-2 w-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => setLines([])}
              className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Clear screen"
              title="Clear buffer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/40 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-3 w-3 rounded-full bg-[#27c93f] hover:brightness-110 transition-all shadow-sm flex items-center justify-center group"
              aria-label="Maximize window"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black/40 opacity-0 group-hover:opacity-100" />
            </button>

            {/* termcn Active Tab Title */}
            <div className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-neutral-800/80 bg-[#0a120e] px-2.5 py-0.5 text-[11px] text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>zsh — zoro@maarcus.dev: ~</span>
            </div>
          </div>

          {/* Window Control Shortcuts */}
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span className="hidden sm:inline-block text-neutral-400">Press ~ or Esc</span>
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

        {/* Matrix Rain Banner Overlay (if active) */}
        {matrixActive && (
          <div className="absolute inset-0 z-20 pointer-events-none bg-black/70 flex items-center justify-center text-emerald-400 font-mono text-sm leading-none animate-pulse">
            <div className="text-center space-y-1">
              <div>01001101 01100001 01100001 01110010 01100011 01110101 01110011</div>
              <div className="text-emerald-300 font-bold">⚡ OVERCLOCKED KERNEL ACTIVATED ⚡</div>
              <div>01011010 01001111 01010010 01001111 00100000 01001111 01010011</div>
            </div>
          </div>
        )}

        {/* Scrollable Terminal Screen Buffer */}
        <div
          ref={terminalBodyRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 scrollbar-thin select-text text-[12px] leading-relaxed cursor-text"
        >
          {lines.map((l) => (
            <div key={l.id} className="whitespace-pre font-mono">
              {l.type === "input" ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
                  <span className="text-neutral-400">zoro@maarcus</span>
                  <span className="text-emerald-500">~</span>
                  <span className="text-neutral-400 font-normal">git:(</span>
                  <span className="text-emerald-300">main</span>
                  <span className="text-neutral-400 font-normal">)</span>
                  <span className="text-emerald-400 font-bold">❯</span>
                  <span className="text-white">{l.text}</span>
                </div>
              ) : l.type === "error" ? (
                <div className="text-red-400 pl-2 border-l-2 border-red-500/60 font-mono">{l.text}</div>
              ) : l.type === "table" || l.type === "ascii" ? (
                <div className="text-emerald-300/90 font-mono text-[11px] leading-tight select-text py-0.5 overflow-x-auto">
                  {l.text}
                </div>
              ) : (
                <div className="text-neutral-300 font-mono text-[12px]">{l.text}</div>
              )}
            </div>
          ))}

          {/* Authentic termcn Prompt Line - NO ugly box borders, pure inline terminal caret! */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCommand(input);
            }}
            className="flex items-center gap-2 pt-1 font-mono text-[12px] text-white"
          >
            <span className="text-neutral-400 select-none">zoro@maarcus</span>
            <span className="text-emerald-500 select-none">~</span>
            <span className="text-neutral-400 font-normal select-none hidden sm:inline">
              git:(<span className="text-emerald-300">main</span>)
            </span>
            <span className="text-emerald-400 font-bold select-none">❯</span>

            {/* Completely unbordered, clean input stream */}
            <div className="flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white border-0 outline-none ring-0 shadow-none p-0 m-0 focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 font-mono text-[12px] caret-emerald-400"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </form>
        </div>

        {/* termcn / tmux Style Statusline Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 bg-[#060a08] px-3.5 py-1.5 select-none overflow-x-auto scrollbar-none gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded bg-emerald-500 px-1.5 py-0.2 text-[10px] font-bold text-black uppercase">
              NORMAL
            </span>
            <span className="text-neutral-400 hidden sm:inline mr-1">Quick:</span>
            {["neofetch", "projects", "skills", "resume", "schedule", "quote", "clear"].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => handleCommand(cmd)}
                className="rounded border border-neutral-800 bg-neutral-900/90 px-1.5 py-0.5 text-[10px] text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400 shrink-0">
            <span><kbd className="rounded border border-neutral-800 bg-neutral-900 px-1">Tab</kbd> complete</span>
            <span><kbd className="rounded border border-neutral-800 bg-neutral-900 px-1">↑/↓</kbd> history</span>
          </div>
        </div>
      </div>
    </div>
  );
}
