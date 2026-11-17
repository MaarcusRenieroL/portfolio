"use client";

import { useState } from "react";
import type { Field } from "~/lib/cms-fields";
import { MarkdownEditor } from "./markdown-editor";
import { MediaField } from "./media-field";
import { ShadcnDatePicker } from "./shadcn-date-picker";
import { ShadcnSelect } from "./shadcn-select";

type Step = { org: string; date: string; note: string };

/** Interactive tag input with shadcn styling and live badges */
function Tags({
  id,
  disabled,
  value,
  onChange,
}: {
  id?: string;
  disabled?: boolean;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));

  // Sync text when value changes from outside (e.g. initial load or reset)
  const currentJoined = value.join(", ");
  const [lastValueJoined, setLastValueJoined] = useState(currentJoined);
  if (currentJoined !== lastValueJoined) {
    setLastValueJoined(currentJoined);
    setText(currentJoined);
  }

  const handleTextChange = (raw: string) => {
    setText(raw);
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  const removeTag = (indexToRemove: number) => {
    const next = value.filter((_, i) => i !== indexToRemove);
    onChange(next);
    setText(next.join(", "));
  };

  return (
    <div className="shadcn-tags-wrapper">
      <input
        id={id}
        disabled={disabled}
        className="shadcn-input"
        value={text}
        placeholder="Type items separated by commas, e.g. React, TypeScript, Node.js"
        onChange={(e) => handleTextChange(e.target.value)}
      />
      {value.length > 0 && (
        <div className="shadcn-tags-list" style={{ marginTop: 8 }}>
          {value.map((tag, idx) => (
            <span key={tag + idx} className="shadcn-tag-badge">
              <span>{tag}</span>
              <button
                type="button"
                className="shadcn-tag-remove"
                onClick={() => removeTag(idx)}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Lines({ value, onChange, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <div className="shadcn-lines-field">
      <textarea
        className="shadcn-textarea"
        rows={rows}
        value={text}
        placeholder="One entry per line..."
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
        }}
      />
      <div className="shadcn-lines-footer">
        <span>{value.length} {value.length === 1 ? "entry" : "entries"}</span>
      </div>
    </div>
  );
}

/** One control for one field, by type. `hint` is the English value shown under a German input. */
export function FieldInput({
  field,
  value,
  onChange,
  hint,
  locked,
  doc,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  hint?: string;
  locked?: boolean;
  /** The whole item, for fields that depend on another field (a cover's folder is the slug). */
  doc?: Record<string, unknown>;
}) {
  const common = { id: `f-${field.name}`, disabled: locked };
  const str = typeof value === "string" ? value : "";

  switch (field.type) {
    case "bool":
      return (
        <div className="shadcn-switch-field">
          <label className="shadcn-switch-row" htmlFor={common.id}>
            <div className="shadcn-switch-track">
              <input
                {...common}
                type="checkbox"
                className="shadcn-switch-native"
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
              />
              <span className={`shadcn-switch-slider ${value ? "checked" : ""}`}>
                <span className="shadcn-switch-thumb" />
              </span>
            </div>
            <span className="shadcn-switch-label">{field.label}</span>
          </label>
        </div>
      );
    case "select":
      return (
        <ShadcnSelect
          value={str}
          onChange={(v) => onChange(v)}
          options={field.options!.map((o) => ({
            label: o || "(none)",
            value: o,
          }))}
          placeholder="Select option..."
        />
      );
    case "number":
      return (
        <input
          {...common}
          type="number"
          step="0.5"
          className="shadcn-input"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder={hint ?? "0"}
        />
      );
    case "date":
      return (
        <ShadcnDatePicker
          id={common.id}
          value={str}
          disabled={Boolean(locked)}
          onChange={(v) => onChange(v)}
          placeholder={hint ?? "YYYY-MM-DD"}
        />
      );
    case "tags":
      return (
        <Tags
          id={common.id}
          disabled={Boolean(locked)}
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      );
    case "lines":
      return <Lines value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "cats":
      return (
        <div className="shadcn-chips-group">
          {field.options!.map((o) => {
            const cur = Array.isArray(value) ? (value as string[]) : [];
            const checked = cur.includes(o);
            return (
              <button
                key={o}
                type="button"
                className={`shadcn-chip ${checked ? "active" : ""}`}
                onClick={() => onChange(checked ? cur.filter((x) => x !== o) : [...cur, o])}
                aria-pressed={checked}
              >
                <span className={`tablecn-dot ${checked ? "live" : "draft"}`} />
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      );
    case "steps": {
      const steps = (Array.isArray(value) ? value : []) as Step[];
      const set = (i: number, patch: Partial<Step>) =>
        onChange(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
      return (
        <div className="cms-steps-list">
          {steps.map((s, i) => (
            <div key={i} className="cms-step-card">
              <div className="cms-step-header">
                <span className="cms-step-number">Step {i + 1}</span>
                <button
                  type="button"
                  className="ghost danger-text"
                  onClick={() => onChange(steps.filter((_, j) => j !== i))}
                >
                  Remove step
                </button>
              </div>
              <div className="cms-step-inputs">
                <input
                  aria-label="Company"
                  placeholder="Organisation / Company"
                  className="shadcn-input"
                  value={s.org}
                  onChange={(e) => set(i, { org: e.target.value })}
                />
                <input
                  aria-label="Dates"
                  placeholder="Dates (e.g. 2021 – 2023)"
                  className="shadcn-input"
                  value={s.date}
                  onChange={(e) => set(i, { date: e.target.value })}
                />
                <textarea
                  aria-label="Note"
                  placeholder="Role description or notes..."
                  className="shadcn-textarea"
                  rows={2}
                  value={s.note}
                  onChange={(e) => set(i, { note: e.target.value })}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="ghost cms-add-step-btn"
            onClick={() => onChange([...steps, { org: "", date: "", note: "" }])}
          >
            + Add a step
          </button>
        </div>
      );
    }
    case "media":
      return (
        <MediaField
          id={common.id}
          value={str}
          onChange={onChange}
          accept={field.accept ?? "image"}
          disabled={Boolean(locked)}
          legacyBase={field.legacy?.replace("{slug}", String(doc?.slug ?? ""))}
        />
      );
    case "markdown":
      return <MarkdownEditor id={`f-${field.name}`} value={str} disabled={Boolean(locked)} onChange={(v) => onChange(v)} />;
    case "textarea":
      return (
        <textarea
          {...common}
          className="shadcn-textarea"
          rows={4}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint ?? `Enter ${field.label.toLowerCase()}...`}
        />
      );
    default:
      return (
        <input
          {...common}
          type={field.type === "url" ? "url" : "text"}
          className="shadcn-input"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint ?? `Enter ${field.label.toLowerCase()}...`}
        />
      );
  }
}
