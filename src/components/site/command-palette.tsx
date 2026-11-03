"use client";

import { Command } from "cmdk";
import { Dialog } from "radix-ui";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { PROJECTS, SITE } from "~/lib/content";
import { emit, go } from "~/lib/ui";
import { Arrow, Code, File, Mail, Moon, Search, Term } from "./icons";

type Item = { label: string; hint?: string; key?: string; icon: ReactElement; run: () => void };

export default function CommandPalette({
  open,
  onOpenChange,
  onTerminal,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onTerminal: () => void;
}) {
  const router = useRouter();
  const done = (fn: () => void) => () => {
    onOpenChange(false);
    window.setTimeout(fn, 60);
  };
  const nav = (href: string) => done(() => go(href));
  const ico = { width: 18, height: 18 };

  const groups: { name: string; items: Item[] }[] = [
    {
      name: "Navigate",
      items: [
        { label: "Projects", hint: "6 projects", key: "G P", icon: <Arrow {...ico} />, run: nav("/projects") },
        { label: "Experience", hint: "4 roles", key: "G E", icon: <Arrow {...ico} />, run: nav("/experience") },
        { label: "Stack", key: "G S", icon: <Arrow {...ico} />, run: nav("/stack") },
        { label: "About", key: "G A", icon: <Arrow {...ico} />, run: nav("/about") },
        { label: "Contact", key: "G C", icon: <Arrow {...ico} />, run: nav("/contact") },
      ],
    },
    {
      name: "Projects",
      items: PROJECTS.map((p) => ({
        label: p.name,
        hint: p.tags.slice(0, 3).join(" · "),
        icon: <Code {...ico} />,
        run: p.external ? done(() => window.open(p.external, "_blank", "noopener")) : nav(`/projects/${p.slug}`),
      })),
    },
    {
      name: "Actions",
      items: [
        { label: "Download resume", hint: "PDF", key: "⌘ D", icon: <File {...ico} />, run: done(() => router.push("/api/resume")) },
        { label: "Copy email", key: "⌘ ⇧ C", icon: <Mail {...ico} />, run: done(() => navigator.clipboard?.writeText(SITE.email)) },
        { label: "Open terminal", key: "`", icon: <Term {...ico} />, run: onTerminal },
        { label: "Toggle theme", key: "T", icon: <Moon {...ico} />, run: done(() => emit("theme")) },
      ],
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ov-scrim" />
        <Dialog.Content className="pal-pos site" aria-describedby={undefined} style={{ minHeight: 0, background: "transparent", display: "block" }}>
          <Dialog.Title style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Command palette</Dialog.Title>
          <Command className="pal" loop label="Command palette">
            <div className="pal-in">
              <Search width={20} height={20} style={{ color: "var(--blade)" }} />
              <Command.Input placeholder="Search pages, projects, actions…" autoFocus aria-label="Search commands" />
              <span className="kbd">Esc</span>
            </div>
            <Command.List style={{ maxHeight: 470, overflow: "auto" }}>
              <Command.Empty style={{ padding: "28px 20px" }}>
                <span className="small">Nothing matches. Try a project name, “resume” or “contact”.</span>
              </Command.Empty>
              {groups.map((g) => (
                <Command.Group key={g.name} heading={g.name} className="pal-grp">
                  {g.items.map((it) => (
                    <Command.Item key={g.name + it.label} value={`${it.label} ${it.hint ?? ""}`} onSelect={it.run} className="pal-item">
                      {it.icon}
                      <span>{it.label}</span>
                      {it.hint && <span className="small fg3">{it.hint}</span>}
                      {it.key && <span className="kbd">{it.key}</span>}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="pal-foot">
              <span className="row small" style={{ gap: 6 }}>
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> move
              </span>
              <span className="row small" style={{ gap: 6 }}>
                <span className="kbd">↵</span> open
              </span>
              <span className="row small" style={{ gap: 6, marginLeft: "auto" }}>
                <span className="kbd">Esc</span> close
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
