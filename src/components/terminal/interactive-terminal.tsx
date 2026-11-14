"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "ascii";
  text: string;
}

const ZORO_ASCII = `
      /| ________________
O|===|* >________________> (Enma)
      \\|
  ___                 _                 
 |_  /___  _ _ ___   /_\\  _ _ _ __ _  _ 
  / // _ \\| '_/ _ \\ / _ \\| '_| '_ \\ || |
 /___\\___/|_| \\___//_/ \\_\\_| | .__/\\_, |
                             |_|   |__/ 
`;

const HELP_TEXT = `Available commands:
  neofetch     Show system architecture & engineer specs
  ls           List projects & public routes
  cat resume   Display engineering summary
  quote        Receive a blade philosophy quote from Zoro
  matrix       Toggle green digital rain
  whoami       Identity verification
  clear        Clear the terminal display
  exit         Close the terminal window`;

const NEOFETCH_TEXT = `
  OS:        Zoro Linux x86_64 (Dark Emerald Noir)
  Host:      Next.js 16.4.2 (App Router & React 19)
  Engineer:  Maarcus Reniero L (Full Stack & Systems)
  Location:  Chennai, IN (IST UTC+5:30)
  Uptime:    99.98%
  Languages: Go, TypeScript, Node.js, SQL, C++
  Swords:    PostgreSQL, Docker, AWS, Redis, Tailwind v4
  Editor:    Neovim / VS Code (Zoro Dark Theme)
  Terminal:  Ghostty (xterm-256color)
`;

const ZORO_QUOTES = [
  "Nothing happened.",
  "Scars on the back are a swordsman's greatest shame.",
  "When the world shoves you around, you just gotta stand up and shove back.",
  "If I die here, then I'm a man that could only make it this far.",
  "I don't care what the society says. I've never regretted doing anything.",
];

export function InteractiveTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "init",
      type: "output",
      text: "Zoro OS Terminal v2.5 (x86_64-pc-linux-gnu)\nType 'help' for available commands or 'neofetch' for system specs.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Global key listener: ~ or Ctrl+` to toggle terminal
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, lines]);

  const handleCommand = (cmd: string) => {
    const raw = cmd.trim();
    if (!raw) return;

    const trimmed = raw.toLowerCase();
    const newLines: TerminalLine[] = [
      ...lines,
      { id: String(Date.now()), type: "input", text: `zoro@maarcus.dev:~$ ${raw}` },
    ];

    if (trimmed === "clear") {
      setLines([]);
      setInput("");
      return;
    }

    if (trimmed === "exit") {
      setIsOpen(false);
      setInput("");
      return;
    }

    let output = "";
    let type: TerminalLine["type"] = "output";

    if (trimmed === "help") {
      output = HELP_TEXT;
    } else if (trimmed === "neofetch" || trimmed === "fastfetch") {
      output = `${ZORO_ASCII}\n${NEOFETCH_TEXT}`;
      type = "ascii";
    } else if (trimmed === "quote" || trimmed === "zoro") {
      const q = ZORO_QUOTES[Math.floor(Math.random() * ZORO_QUOTES.length)];
      output = `"${q}" — Roronoa Zoro`;
    } else if (trimmed === "ls" || trimmed === "ls projects") {
      output = "projects/   experience/   skills/   certifications/   blog/   notes/   schedule/";
    } else if (trimmed === "cat resume" || trimmed === "cat resume.md") {
      output = "Maarcus Reniero L · Full Stack & Backend Engineer\nSpecialized in Go, TypeScript, Next.js 16, PostgreSQL, and Docker.\nVisit /resume for ATS-optimized printable layout.";
    } else if (trimmed === "whoami") {
      output = "visitor (authorized guest on maarcus.dev)";
    } else if (trimmed === "matrix") {
      output = "[*] Activating Emerald Matrix Rain... Access granted.";
    } else {
      output = `bash: ${raw}: command not found. Type 'help' for available commands.`;
      type = "error";
    }

    setLines([...newLines, { id: String(Date.now() + 1), type, text: output }]);
    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-neutral-800 bg-[#070b09]/90 px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-lg backdrop-blur-md transition-all hover:border-emerald-500/40 hover:text-emerald-300 active:scale-95"
        title="Open Interactive Terminal (~)"
      >
        <TerminalIcon className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Terminal</span>
        <kbd className="rounded bg-neutral-900 border border-neutral-800 px-1 text-[10px] text-neutral-400">~</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`flex flex-col rounded-xl border border-emerald-500/30 bg-[#050806]/98 font-mono text-xs text-neutral-200 shadow-2xl transition-all duration-200 overflow-hidden ${
          isMaximized
            ? "w-full h-full"
            : "w-full max-w-2xl h-[460px] sm:h-[500px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#090f0c] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80 cursor-pointer" onClick={() => setIsOpen(false)} />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 cursor-pointer" onClick={() => setLines([])} />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
            <span className="ml-2 text-xs font-semibold text-neutral-400">
              zoro@maarcus.dev:~
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:text-white transition-colors"
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin select-text">
          {lines.map((l) => (
            <div
              key={l.id}
              className={`whitespace-pre-wrap leading-relaxed ${
                l.type === "input"
                  ? "text-emerald-400 font-semibold"
                  : l.type === "error"
                  ? "text-red-400"
                  : l.type === "ascii"
                  ? "text-emerald-300 font-mono text-[11px]"
                  : "text-neutral-300"
              }`}
            >
              {l.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="flex items-center gap-2 border-t border-neutral-800/80 bg-[#070c09] px-4 py-2.5"
        >
          <span className="text-emerald-400 font-semibold shrink-0">zoro@maarcus.dev:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-neutral-100 outline-none caret-emerald-400 text-xs font-mono"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
