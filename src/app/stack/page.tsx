import type { Metadata } from "next";
import { STACK_GROUPS } from "~/lib/content";

export const metadata: Metadata = { title: "Stack", description: "What I reach for, grouped by job." };

export default function StackPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Stack</h1>
        <p className="lead">What I reach for, grouped by job. Items in white are what I use in production or daily.</p>
      </header>

      <div className="list">
        {STACK_GROUPS.map((g) => (
          <div className="item" key={g.name}>
            <div className="stack" style={{ gap: 4 }}>
              <h2 className="item-title">{g.name}</h2>
              <span className="item-meta">{g.why}</span>
            </div>
            <p className="tags" style={{ fontSize: "1rem", gap: "4px 18px" }}>
              {g.items.map((t) => {
                const core = t.startsWith("*");
                return (
                  <span key={t} style={core ? { color: "var(--fg)" } : undefined}>
                    {core ? t.slice(1) : t}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
