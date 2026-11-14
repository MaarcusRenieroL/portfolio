"use client";

import { useState } from "react";
import type { Field } from "~/lib/cms-fields";

type Step = { org: string; date: string; note: string };

/** Comma-separated input that keeps what you type (a trailing comma must not vanish while typing). */
function Tags({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

function Lines({ value, onChange, rows = 5 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

/** One control for one field, by type. `hint` is the English value shown under a German input. */
export function FieldInput({ field, value, onChange, hint, locked }: { field: Field; value: unknown; onChange: (v: unknown) => void; hint?: string; locked?: boolean }) {
  const common = { id: `f-${field.name}`, disabled: locked };
  const str = typeof value === "string" ? value : "";
  switch (field.type) {
    case "bool":
      return <input {...common} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} style={{ width: "auto" }} />;
    case "select":
      return (
        <select {...common} value={str} onChange={(e) => onChange(e.target.value)}>
          {field.options!.map((o) => <option key={o} value={o}>{o || "(none)"}</option>)}
        </select>
      );
    case "number":
      return <input {...common} type="number" step="0.5" value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />;
    case "date":
      return <input {...common} type="date" value={str} onChange={(e) => onChange(e.target.value)} />;
    case "tags":
      return <Tags value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "lines":
      return <Lines value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "cats":
      return (
        <div className="row">
          {field.options!.map((o) => {
            const cur = Array.isArray(value) ? (value as string[]) : [];
            return (
              <label key={o} className="row" style={{ gap: 6 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={cur.includes(o)} onChange={(e) => onChange(e.target.checked ? [...cur, o] : cur.filter((x) => x !== o))} />
                {o}
              </label>
            );
          })}
        </div>
      );
    case "steps": {
      const steps = (Array.isArray(value) ? value : []) as Step[];
      const set = (i: number, patch: Partial<Step>) => onChange(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
      return (
        <div className="list">
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ width: "auto", padding: 12 }}>
              <input aria-label="Company" placeholder="Company" value={s.org} onChange={(e) => set(i, { org: e.target.value })} />
              <input aria-label="Dates" placeholder="Dates" value={s.date} onChange={(e) => set(i, { date: e.target.value })} />
              <textarea aria-label="Note" placeholder="Note" rows={2} value={s.note} onChange={(e) => set(i, { note: e.target.value })} />
              <button type="button" className="ghost" onClick={() => onChange(steps.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={() => onChange([...steps, { org: "", date: "", note: "" }])}>Add a step</button>
        </div>
      );
    }
    case "markdown":
      return <textarea {...common} rows={18} spellCheck value={str} onChange={(e) => onChange(e.target.value)} style={{ fontFamily: "ui-monospace, Menlo, monospace" }} placeholder={hint ? "" : "Write in Markdown…"} />;
    case "textarea":
      return <textarea {...common} rows={4} value={str} onChange={(e) => onChange(e.target.value)} placeholder={hint ?? ""} />;
    default:
      return <input {...common} type={field.type === "url" ? "url" : "text"} value={str} onChange={(e) => onChange(e.target.value)} placeholder={hint ?? ""} />;
  }
}
