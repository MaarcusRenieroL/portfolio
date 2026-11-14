"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./icons";

export interface SelectOption {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface ShadcnSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ShadcnSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  icon,
  className = "",
}: ShadcnSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={`shadcn-select-wrapper ${className}`} ref={containerRef}>
      <button
        type="button"
        className="shadcn-select-trigger"
        data-state={open ? "open" : "closed"}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          {icon}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? selected.label : placeholder}
          </span>
          {selected?.hint && (
            <span style={{ opacity: 0.6, fontSize: 11, fontFamily: "var(--mono)" }}>
              ({selected.hint})
            </span>
          )}
        </div>
        <ChevronDownIcon
          width={12}
          height={12}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 140ms ease",
            opacity: 0.7,
            flexShrink: 0,
            marginLeft: 4,
          }}
        />
      </button>

      {open && (
        <div className="shadcn-select-content" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`shadcn-select-item ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <div className="shadcn-select-item-left">
                  <span style={{ width: 14, display: "inline-grid", placeItems: "center" }}>
                    {isSelected && <CheckIcon width={12} height={12} style={{ color: "var(--green)" }} />}
                  </span>
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {opt.hint && (
                  <span className="shadcn-select-item-route">{opt.hint}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
