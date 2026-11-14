"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, Bot, Calendar, ArrowRight, Minus, Swords, Terminal, Cpu } from "lucide-react";
import Link from "next/link";
import { useLocalePath } from "~/components/site/locale";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  {
    icon: Sparkles,
    title: "30-Second Pitch",
    desc: "Summary of role fit, skills & experience",
    prompt: "Give me a 30-second summary pitch of Maarcus Reniero L.",
  },
  {
    icon: Swords,
    title: "Flagship Projects",
    desc: "Nyx backend framework & next-kit starter",
    prompt: "Tell me about his flagship systems like Nyx and next-kit.",
  },
  {
    icon: Cpu,
    title: "Core Tech Stack",
    desc: "Go, TypeScript, Next.js 16, PostgreSQL & Docker",
    prompt: "What is Maarcus's primary tech stack and backend engineering experience?",
  },
  {
    icon: Calendar,
    title: "Book a Technical Call",
    desc: "Schedule a 15, 30, or 45-min discussion",
    isLink: true,
    href: "/schedule",
  },
];

const COMPACT_PROMPTS = [
  { icon: Sparkles, label: "30s Pitch", prompt: "Give me a 30-second summary pitch of Maarcus." },
  { icon: Swords, label: "Projects", prompt: "Tell me about his flagship systems like Nyx and next-kit." },
  { icon: Cpu, label: "Tech Stack", prompt: "What is Maarcus's primary tech stack and backend engineering experience?" },
  { icon: Calendar, label: "Book Call", isLink: true, href: "/schedule" },
];

/**
 * Highly stylized, iconic Roronoa Zoro vector avatar portrait.
 * Includes his signature dark-emerald hair, black bandana, closed left eye with vertical duel scar,
 * piercing emerald right eye, and triple gold dangling earrings.
 */
export function ZoroAvatarSvg({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="zoroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#040806" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id="katanaEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Ambient Katana Aura */}
      <circle cx="50" cy="50" r="48" fill="url(#zoroGlow)" />
      {/* Outer Obsidian Shield */}
      <circle cx="50" cy="50" r="46" fill="#060c08" stroke="#10b981" strokeWidth="2" strokeOpacity="0.8" />

      {/* Zoro Spiky Anime Hair (Top / Silhouette) */}
      <path
        d="M26 40C24 24 33 14 50 14C67 14 76 24 74 40C72 32 68 24 61 22C57 20 53 21 50 22C47 21 43 20 39 22C32 24 28 32 26 40Z"
        fill="url(#hairGrad)"
      />
      <path d="M34 21L37 30L42 19L47 31L53 19L58 30L63 22" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29 27L33 34L25 35L30 42" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <path d="M71 27L67 34L75 35L70 42" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      {/* Zoro Black Bandana */}
      <path
        d="M22 38C22 36 24 35 27 35H73C76 35 78 36 78 38V48H22V38Z"
        fill="#040605"
        stroke="#10b981"
        strokeWidth="1.2"
      />
      {/* Bandana Highlight Crease */}
      <path d="M24 41C34 39 66 39 76 41" stroke="#065f46" strokeWidth="1.5" />

      {/* Face & Strong Jawline */}
      <path
        d="M27 48C27 58 36 74 50 78C64 74 73 58 73 48H27Z"
        fill="#121d17"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Right Eye: Piercing Emerald Glare */}
      <path d="M34 53C37 50 43 50 46 53" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="54" r="2.2" fill="#00ff88" />
      <circle cx="40.8" cy="53.4" r="0.8" fill="#ffffff" />

      {/* Left Eye: Iconic Battle Scar (Vertical Slice) */}
      <path d="M54 53C57 52 63 52 66 53" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />
      <line x1="59" y1="43" x2="61" y2="65" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="58.5" y1="44" x2="60.5" y2="64" stroke="#4ade80" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />

      {/* Stern Mouth / Determination */}
      <path d="M43 67C47 68 53 68 57 67" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />

      {/* Zoro's 3 Gold Earrings on Left Ear */}
      <circle cx="21" cy="52" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <circle cx="21" cy="58" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
      <circle cx="21" cy="64" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
    </svg>
  );
}

export function ZoroAiBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const href = useLocalePath();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/zoro-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.reply || "He is ready. Check /schedule to book a call.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: "You can reach Maarcus directly at maarcusreniero.l@gmail.com or book a call at /schedule.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Floating Trigger Circle */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Zoro AI Assistant"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/50 bg-[#050a07] shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-95"
          >
            {/* Pulsing Status Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#050a07]" />
            </span>
            <ZoroAvatarSvg className="h-10 w-10 transition-transform duration-300 group-hover:rotate-6" />
          </button>
        )}

        {/* Zoro AI Drawer Window */}
        {isOpen && (
          <div className="flex flex-col w-[350px] sm:w-[410px] h-[550px] rounded-2xl border border-emerald-500/30 bg-[#060b08]/96 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 overflow-hidden text-neutral-100">
            {/* Katana Light Top Edge */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#050907] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ZoroAvatarSvg className="h-9 w-9" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#050907]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">Zoro AI</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                      ENMA CORE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Maarcus Reniero L · Portfolio Copilot</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-neutral-400">
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="rounded p-1.5 hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1.5 hover:bg-neutral-800 hover:text-white transition-colors"
                  aria-label="Close Zoro AI"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {/* STATE A: Fresh Hero Welcome State (No empty void!) */}
              {!hasMessages ? (
                <div className="flex flex-col items-center justify-center text-center py-2 space-y-4">
                  <div className="relative my-1">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-[#09120d] shadow-lg">
                      <ZoroAvatarSvg className="h-12 w-12" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">
                      &ldquo;What do you need to know?&rdquo;
                    </h4>
                    <p className="mt-1 text-xs text-neutral-400 max-w-xs leading-relaxed mx-auto">
                      I guard Maarcus&apos;s engineering citadel. Ask me about his Go backends, Next.js 16 systems, or book a call.
                    </p>
                  </div>

                  {/* 2x2 Bento Action Cards */}
                  <div className="grid grid-cols-2 gap-2 w-full pt-1 text-left">
                    {STARTER_PROMPTS.map((sp) => {
                      const Icon = sp.icon;
                      return sp.isLink ? (
                        <Link
                          key={sp.title}
                          href={href(sp.href!)}
                          onClick={() => setIsOpen(false)}
                          className="group flex flex-col justify-between rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-2.5 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-950/60 hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                        >
                          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                            <Icon className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{sp.title}</div>
                            <div className="text-[10px] text-neutral-400 leading-tight mt-0.5">{sp.desc}</div>
                          </div>
                        </Link>
                      ) : (
                        <button
                          key={sp.title}
                          type="button"
                          onClick={() => handleSend(sp.prompt)}
                          className="group flex flex-col justify-between rounded-xl border border-neutral-800/90 bg-[#080e0b]/90 p-2.5 text-left transition-all duration-200 hover:border-emerald-500/40 hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                        >
                          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                            <Icon className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all text-neutral-400" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{sp.title}</div>
                            <div className="text-[10px] text-neutral-400 leading-tight mt-0.5">{sp.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* STATE B: Active Conversation Stream */
                <div className="space-y-3.5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "assistant" && (
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                          m.role === "user"
                            ? "bg-emerald-500 text-black font-medium shadow-md shadow-emerald-500/10 rounded-br-xs"
                            : "bg-[#0b130e] border border-emerald-500/20 text-neutral-200 rounded-bl-xs shadow-md shadow-black/40"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono px-2 py-1">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Zoro is cutting through knowledge...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Command Input Area */}
            <div className="border-t border-neutral-800/80 bg-[#050806] p-3 space-y-2">
              {/* Quick Suggestion Pills */}
              {hasMessages && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {COMPACT_PROMPTS.map((qp) => {
                    const Icon = qp.icon;
                    return qp.isLink ? (
                      <Link
                        key={qp.label}
                        href={href(qp.href!)}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 transition-colors"
                      >
                        <Icon className="h-3 w-3 text-emerald-400" />
                        <span>{qp.label}</span>
                        <ArrowRight className="h-2.5 w-2.5 opacity-70" />
                      </Link>
                    ) : (
                      <button
                        key={qp.label}
                        type="button"
                        onClick={() => handleSend(qp.prompt)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-800 bg-[#0b120e] px-2.5 py-1 text-[11px] text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-neutral-900 transition-all"
                      >
                        <Icon className="h-3 w-3 text-emerald-400/80" />
                        <span>{qp.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Integrated Capsule Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="group relative flex items-center rounded-xl border border-neutral-800 bg-[#09110d] px-3 py-1 transition-all focus-within:border-neutral-700 shadow-inner"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Zoro anything about Maarcus..."
                  className="w-full bg-transparent py-1 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none border-none focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-20 disabled:hover:bg-emerald-500 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
