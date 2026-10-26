"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

const LEVELS = [
  { id: "recruiter", label: "for a recruiter" },
  { id: "engineer", label: "for an engineer" },
  { id: "beginner", label: "in plain words" },
] as const;

type Level = (typeof LEVELS)[number]["id"];

export function ProjectExplainer({ projectId }: { projectId: string }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [text, setText] = useState("");
  const [source, setSource] = useState<"model" | "local">("local");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const explain = async (next: Level) => {
    if (pending) return;
    setLevel(next);
    setPending(true);
    setError("");
    setText("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "explain", projectId, level: next }),
      });
      const data = (await response.json()) as { answer?: string; source?: "model" | "local"; error?: string };
      if (!response.ok || !data.answer) setError(data.error ?? "something went wrong, try again.");
      else {
        setText(data.answer);
        setSource(data.source ?? "local");
      }
    } catch {
      setError("couldn't reach the server, try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="border border-border/60 bg-card/40 p-5 sm:p-6">
      <h2 className="text-xl font-semibold">explain this project</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="choose how to explain this project">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={level === l.id}
            onClick={() => void explain(l.id)}
            className={cn(
              "inline-flex h-10 items-center gap-2 border px-4 font-mono text-xs transition-colors",
              level === l.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-primary",
            )}
          >
            {pending && level === l.id && <Loader2Icon className="size-3.5 animate-spin" />}
            {l.label}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-4">
        {error && <p className="text-base text-destructive">{error}</p>}
        {text && (
          <div className="border-l-2 border-primary/60 pl-4">
            <p className="whitespace-pre-line text-base leading-7 text-foreground/90">{text}</p>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {source === "model" ? "written by an ai model from this project's page." : "demo mode: assembled from this project's page, no model involved."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
