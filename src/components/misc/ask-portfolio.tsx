"use client";

import { useState } from "react";
import { Loader2Icon, SendHorizonalIcon } from "lucide-react";

const SUGGESTIONS = [
  "what has he built with local ai?",
  "what security work has he done?",
  "which cloud skills does he have?",
  "what is he studying next?",
];

type Answer = { text: string; source: "model" | "local" };

export function AskPortfolio() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const ask = async (q: string) => {
    const value = q.trim();
    if (value.length < 3 || pending) return;
    setQuestion(value);
    setPending(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "ask", question: value }),
      });
      const data = (await response.json()) as { answer?: string; source?: "model" | "local"; error?: string };
      if (!response.ok || !data.answer) {
        setError(data.error ?? "something went wrong, try again.");
      } else {
        setAnswer({ text: data.answer, source: data.source ?? "local" });
      }
    } catch {
      setError("couldn't reach the server, try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="border border-border/60 bg-card/40 p-5 sm:p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="ask-input" className="sr-only">
          ask about the work on this site
        </label>
        <input
          id="ask-input"
          value={question}
          maxLength={300}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="ask about his projects, skills or roadmap"
          className="h-11 flex-1 border border-border/60 bg-background/60 px-3 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
        <button
          type="submit"
          disabled={pending || question.trim().length < 3}
          className="inline-flex h-11 items-center justify-center gap-2 border border-primary/50 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? <Loader2Icon className="size-4 animate-spin" /> : <SendHorizonalIcon className="size-4" />}
          ask
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void ask(s)}
            className="border border-border/60 bg-background/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-5">
        {error && <p className="text-base text-destructive">{error}</p>}
        {answer && (
          <div className="border-l-2 border-primary/60 pl-4">
            <p className="whitespace-pre-line text-base leading-7 text-foreground/90">{answer.text}</p>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {answer.source === "model"
                ? "answered by an ai model, using only the content of this site."
                : "demo mode: matched text from this site, no model involved."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
