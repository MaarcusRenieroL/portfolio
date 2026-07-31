"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";

import { Reveal } from "../misc/reveal";
import { cn } from "~/lib/utils";
import { StackGroup } from "~/lib/types";

type StackExplorerProps = {
  groups: StackGroup[];
};

const belief = [
  ["frontend", "interfaces that stay usable after the first impression."],
  ["backend", "typed contracts, access boundaries, reliable workflows."],
  ["product", "small decisions that make software easier to ship and explain."],
];

export function StackExplorer({ groups }: StackExplorerProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [open, setOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const options = ["all", ...groups.map((g) => g.title)];

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => (!q ? true : item.toLowerCase().includes(q))),
      }))
      .filter((g) => (active === "all" ? true : g.title === active) && g.items.length > 0);
  }, [groups, query, active]);

  return (
    <div className="flex flex-col gap-8">
      {/* relative + z-30 so this stays above the card grid below: Reveal's
          motion transform/filter creates its own stacking context, which
          would otherwise trap the dropdown behind later DOM siblings. */}
      <div className="relative z-30">
        <Reveal>
        <div className="flex flex-col gap-3 border border-border/60 bg-card/40 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 border border-border/60 bg-background/60 px-3">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search tools, languages, edges…"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div ref={ddRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="flex h-9 w-full items-center justify-between gap-3 border border-border/60 bg-background/50 px-3 font-mono text-[11px] uppercase tracking-wider text-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary sm:w-44"
            >
              {active}
              <ChevronDownIcon
                className={cn("size-3.5 transition-transform", open && "rotate-180")}
              />
            </button>

            {open && (
              <div
                role="listbox"
                className="absolute right-0 z-20 mt-1.5 w-full min-w-40 border border-border/60 bg-background shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:w-44"
              >
                {options.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={c === active}
                    onClick={() => {
                      setActive(c);
                      setOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider outline-none transition-colors",
                      c === active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </Reveal>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
          nothing matches. try clearing the filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGroups.map((group, i) => (
            <Reveal key={group.title} delay={i * 0.05}>
              <div className="relative h-full overflow-hidden border border-border/60 bg-card/40 p-5 lift">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                />
                <div className="mb-5 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      {group.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">{group.title}</h2>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="border border-border/60 bg-background/55 px-2.5 py-1.5 text-xs text-foreground/90 transition-colors hover:border-primary/60 hover:text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <section className="grid gap-4 border border-border/60 bg-background/45 p-5 md:grid-cols-3">
        {belief.map(([label, text]) => (
          <div key={label}>
            <p className="text-xs font-semibold text-primary">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
