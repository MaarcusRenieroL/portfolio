"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, Bot, Calendar, ArrowRight, Minus, Swords, Cpu } from "lucide-react";
import Link from "next/link";
import { useLocalePath } from "~/components/site/locale";
import { useTheme } from "~/components/site/theme-toggle";

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
      </defs>

      {/* Aura background */}
      <circle cx="50" cy="50" r="46" fill="url(#zoroGlow)" />
      <circle cx="50" cy="50" r="44" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Bandana (signature black wrap) */}
      <path
        d="M24 38 C28 24, 72 24, 76 38 C76 43, 24 43, 24 38 Z"
        fill="#0a0e0b"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      {/* Bandana Knot Tie */}
      <path d="M74 38 C80 37, 83 41, 80 46 C77 44, 75 41, 74 38 Z" fill="#040705" />

      {/* Spiky Zoro Emerald Hair Burst (Three tiers) */}
      <path
        d="M26 36 L30 20 L35 34 L42 16 L48 32 L54 14 L60 32 L66 18 L70 34 L74 36 Z"
        fill="url(#hairGrad)"
      />

      {/* Face Contour */}
      <path
        d="M28 40 C28 40, 30 68, 50 78 C70 68, 72 40, 72 40 Z"
        fill="#d4a373"
        stroke="#1b3024"
        strokeWidth="1.5"
      />

      {/* Zoro Closed Left Eye with Vertical Duel Scar (Mihawk training battle) */}
      <path d="M36 50 C38 52, 42 52, 44 50" stroke="#5c3d2e" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="42" x2="40" y2="60" stroke="#7f1d1d" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="40" y1="44" x2="40" y2="58" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />

      {/* Zoro Piercing Emerald Right Eye */}
      <path d="M56 50 C58 48, 62 48, 64 50" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="60" cy="51" r="2.8" fill="#10b981" />
      <circle cx="60" cy="51" r="1.2" fill="#022c22" />
      <circle cx="60.8" cy="50.2" r="0.6" fill="#ffffff" />

      {/* Eyebrows (Determined swordsman slant) */}
      <line x1="34" y1="46" x2="44" y2="48" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="56" y1="48" x2="66" y2="46" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />

      {/* Nose */}
      <path d="M50 51 L48 58 L52 58" stroke="#8c583e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Smirking swordsman mouth with Wado Ichimonji blade grit */}
      <path d="M42 66 C46 68, 54 68, 58 65" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

      {/* Zoro Triple Gold Earrings on Left Ear */}
      <g>
        <ellipse cx="26" cy="52" rx="1.2" ry="4" fill="#fbbf24" stroke="#78350f" strokeWidth="0.5" />
        <ellipse cx="24.2" cy="54" rx="1.2" ry="4" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
        <ellipse cx="22.5" cy="56" rx="1.2" ry="4" fill="#d97706" stroke="#78350f" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

export function ZoroAiBubble() {
  const href = useLocalePath();
  const theme = useTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll chat stream
  useEffect(() => {
    if (isOpen && messages.length > 0) {
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
            className={`group relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "border-emerald-500/50 bg-[#050a07] shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]"
                : "border-emerald-600/40 bg-[#f0fdf4] shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:border-emerald-600 hover:shadow-[0_6px_25px_rgba(16,185,129,0.35)]"
            }`}
          >
            {/* Pulsing Status Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span
                className={`relative h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ${
                  isDark ? "ring-[#050a07]" : "ring-[#f0fdf4]"
                }`}
              />
            </span>
            <ZoroAvatarSvg className="h-10 w-10 transition-transform duration-300 group-hover:rotate-6" />
          </button>
        )}

        {/* Zoro AI Drawer Window */}
        {isOpen && (
          <div
            className={`flex flex-col w-[350px] sm:w-[410px] h-[550px] rounded-2xl border backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 overflow-hidden ${
              isDark
                ? "border-emerald-500/30 bg-[#060b08]/96 text-neutral-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)]"
                : "border-emerald-600/25 bg-[#ffffff] text-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_25px_rgba(16,185,129,0.1)]"
            }`}
          >
            {/* Katana Light Top Edge */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

            {/* Header */}
            <div
              className={`flex items-center justify-between border-b px-4 py-3 ${
                isDark ? "border-neutral-800/80 bg-[#050907]" : "border-neutral-200 bg-[#f4f8f5]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ZoroAvatarSvg className="h-9 w-9" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ${
                      isDark ? "ring-[#050907]" : "ring-[#f4f8f5]"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold tracking-wide ${isDark ? "text-white" : "text-neutral-900"}`}>
                      Zoro AI
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono border ${
                        isDark
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      ENMA CORE
                    </span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Maarcus Reniero L · Portfolio Copilot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className={`rounded p-1.5 transition-colors ${
                    isDark
                      ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
                  title="Reset conversation"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`rounded p-1.5 transition-colors ${
                    isDark
                      ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
                  aria-label="Close Zoro AI"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {/* STATE A: Fresh Hero Welcome State */}
              {!hasMessages ? (
                <div className="flex flex-col items-center justify-center text-center py-2 space-y-4">
                  <div className="relative my-1">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                    <div
                      className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg ${
                        isDark
                          ? "border-emerald-500/40 bg-[#09120d]"
                          : "border-emerald-500/30 bg-[#ecfdf5]"
                      }`}
                    >
                      <ZoroAvatarSvg className="h-12 w-12" />
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                      &ldquo;What do you need to know?&rdquo;
                    </h4>
                    <p className={`mt-1 text-xs max-w-xs leading-relaxed mx-auto ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
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
                          className={`group flex flex-col justify-between rounded-xl border p-2.5 transition-all duration-200 ${
                            isDark
                              ? "border-emerald-500/25 bg-emerald-950/30 hover:border-emerald-400 hover:bg-emerald-950/60"
                              : "border-emerald-400/40 bg-emerald-50/80 hover:border-emerald-500 hover:bg-emerald-100/70 shadow-xs"
                          }`}
                        >
                          <div className={`flex items-center justify-between mb-1.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                            <Icon className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>{sp.title}</div>
                            <div className={`text-[10px] leading-tight mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{sp.desc}</div>
                          </div>
                        </Link>
                      ) : (
                        <button
                          key={sp.title}
                          type="button"
                          onClick={() => handleSend(sp.prompt)}
                          className={`group flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 ${
                            isDark
                              ? "border-neutral-800/90 bg-[#080e0b]/90 hover:border-emerald-500/40 hover:bg-neutral-900"
                              : "border-neutral-200 bg-[#f9fbf9] hover:border-emerald-500/50 hover:bg-emerald-50/40 shadow-xs"
                          }`}
                        >
                          <div className={`flex items-center justify-between mb-1.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                            <Icon className="h-4 w-4" />
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all text-neutral-400" />
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>{sp.title}</div>
                            <div className={`text-[10px] leading-tight mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{sp.desc}</div>
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
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                            isDark
                              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                              : "bg-emerald-100 border-emerald-300 text-emerald-800"
                          }`}
                        >
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                          m.role === "user"
                            ? isDark
                              ? "bg-emerald-500 text-black font-medium shadow-md shadow-emerald-500/10 rounded-br-xs"
                              : "bg-emerald-600 text-white font-medium shadow-sm rounded-br-xs"
                            : isDark
                            ? "bg-[#0b130e] border border-emerald-500/20 text-neutral-200 rounded-bl-xs shadow-md shadow-black/40"
                            : "bg-[#f4f7f5] border border-neutral-200 text-neutral-800 rounded-bl-xs shadow-xs"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className={`flex items-center gap-2 text-xs font-mono px-2 py-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Zoro is cutting through knowledge...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Command Input Area */}
            <div
              className={`border-t p-3 space-y-2 ${
                isDark ? "border-neutral-800/80 bg-[#050806]" : "border-neutral-200 bg-[#f4f8f5]"
              }`}
            >
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
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          isDark
                            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400"
                            : "border-emerald-300 bg-emerald-100/60 text-emerald-800 hover:bg-emerald-200/60 hover:border-emerald-500"
                        }`}
                      >
                        <Icon className={`h-3 w-3 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
                        <span>{qp.label}</span>
                        <ArrowRight className="h-2.5 w-2.5 opacity-70" />
                      </Link>
                    ) : (
                      <button
                        key={qp.label}
                        type="button"
                        onClick={() => handleSend(qp.prompt)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                          isDark
                            ? "border-neutral-800 bg-[#0b120e] text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-neutral-900"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-emerald-500/50 hover:text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        <Icon className={`h-3 w-3 ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`} />
                        <span>{qp.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Integrated Capsule Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className={`group relative flex items-center rounded-xl border px-3 py-1 transition-all shadow-inner ${
                  isDark
                    ? "border-neutral-800 bg-[#09110d] focus-within:border-neutral-700"
                    : "border-neutral-300 bg-white focus-within:border-emerald-600/60"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Zoro anything about Maarcus..."
                  className={`w-full bg-transparent py-1 text-xs outline-none border-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none no-focus-ring ${
                    isDark ? "text-neutral-100 placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"
                  }`}
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-20 disabled:pointer-events-none ${
                    isDark
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
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
