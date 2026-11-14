"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, X, Bot, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocalePath } from "~/components/site/locale";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "⚡ 30s Pitch", prompt: "Give me a 30-second summary pitch of Maarcus." },
  { label: "🛠 Tech Stack", prompt: "What is Maarcus's primary tech stack and backend skills?" },
  { label: "🚀 Top Projects", prompt: "Tell me about his flagship projects like Nyx and Next-Kit." },
  { label: "📅 Book a Call", isLink: true, href: "/schedule" },
];

export function ZoroAvatarSvg({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dark Silhouette Head */}
      <circle cx="32" cy="32" r="30" fill="#09140e" stroke="#10b981" strokeWidth="2.5" />
      {/* Zoro Signature Emerald Green Hair */}
      <path
        d="M18 26C18 16 25 10 32 10C39 10 46 16 46 26C45 22 41 18 36 17C34 16 30 16 28 17C23 18 19 22 18 26Z"
        fill="#10b981"
      />
      <path d="M22 15L25 22L29 14L32 23L36 13L39 22L42 16" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      {/* Black Bandana */}
      <path d="M16 26H48V32H16V26Z" fill="#050505" stroke="#10b981" strokeWidth="1" />
      {/* Piercing Eye and Left Eye Scar */}
      <circle cx="26" cy="36" r="2" fill="#4ade80" />
      <line x1="37" y1="31" x2="41" y2="41" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      {/* Gold Earring Silhouette */}
      <circle cx="15" cy="37" r="1.8" fill="#fbbf24" />
      <circle cx="15" cy="41" r="1.8" fill="#fbbf24" />
    </svg>
  );
}

export function ZoroAiBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I am Zoro AI. I guard Maarcus's portfolio. Ask me about his backend systems, Go/TypeScript architecture, or schedule a technical call.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const href = useLocalePath();

  useEffect(() => {
    if (isOpen) {
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

  return (
    <>
      {/* Floating Circle Zoro Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Zoro AI Assistant"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-[#060c08] shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
          >
            {/* Status Pulse Ring */}
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#060c08]" />
            </span>
            <ZoroAvatarSvg className="h-9 w-9 transition-transform group-hover:rotate-6" />
          </button>
        )}

        {/* Expandable Zoro AI Drawer Card */}
        {isOpen && (
          <div className="flex flex-col w-[350px] sm:w-[390px] h-[520px] rounded-2xl border border-emerald-500/30 bg-[#070c09]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 overflow-hidden text-neutral-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 bg-[#050806] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <ZoroAvatarSvg className="h-8 w-8" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-white tracking-wide">Zoro AI</h3>
                    <span className="rounded bg-emerald-950/80 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Portfolio Assistant · Maarcus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                aria-label="Close Zoro AI"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed max-w-[82%] ${
                      m.role === "user"
                        ? "bg-emerald-500 text-black font-medium rounded-br-xs"
                        : "bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                  <span>Zoro is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-neutral-800/60 bg-[#050806]/60 scrollbar-none">
              {QUICK_PROMPTS.map((qp) =>
                qp.isLink ? (
                  <Link
                    key={qp.label}
                    href={href(qp.href!)}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{qp.label}</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                ) : (
                  <button
                    key={qp.label}
                    type="button"
                    onClick={() => handleSend(qp.prompt)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                  >
                    {qp.label}
                  </button>
                )
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 border-t border-neutral-800/80 bg-[#050806] p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Zoro anything about Maarcus..."
                className="flex-1 rounded-lg border border-neutral-800 bg-[#090f0c] px-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 transition-colors shadow-sm"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
