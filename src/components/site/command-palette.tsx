"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Compass,
  FileText,
  Sparkles,
  Award,
  Briefcase,
  User,
  Mail,
  Calendar,
  Clock,
  Code2,
  SunMoon,
  Contact,
  Keyboard,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Globe,
  Terminal,
  Volume2,
  Download,
} from "lucide-react";
import { soundEngine } from "~/lib/sound";
import { cn } from "~/lib/utils";
import { useDict } from "~/components/site/locale";
import { switchTheme } from "~/components/site/theme-toggle";
import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "~/components/ui/command";

export type PaletteGroup = "Pages" | "Actions" | "Projects" | "Skills" | "Experience" | "Certifications";

export type PaletteItem = {
  id: string;
  group: PaletteGroup;
  label: string;
  hint?: string;
  keywords?: string;
  run: "href" | "external" | "theme" | "copy" | "download" | "event" | "sound";
  value?: string;
};

import { PALETTE_EVENT as OPEN_EVENT } from "./palette-trigger";

const GROUP_ORDER: PaletteGroup[] = [
  "Pages",
  "Actions",
  "Projects",
  "Skills",
  "Experience",
  "Certifications",
];

function getItemIcon(it: PaletteItem) {
  if (it.group === "Skills") return <Sparkles className="h-3.5 w-3.5" />;
  if (it.group === "Experience") return <Briefcase className="h-3.5 w-3.5" />;
  if (it.group === "Certifications") return <Award className="h-3.5 w-3.5" />;
  if (it.group === "Projects") return <Terminal className="h-3.5 w-3.5" />;

  if (it.id.startsWith("page-")) {
    const p = it.id.replace("page-", "");
    if (p.includes("about")) return <User className="h-3.5 w-3.5" />;
    if (p.includes("experience")) return <Briefcase className="h-3.5 w-3.5" />;
    if (p.includes("projects")) return <Code2 className="h-3.5 w-3.5" />;
    if (p.includes("skills")) return <Sparkles className="h-3.5 w-3.5" />;
    if (p.includes("certifications")) return <Award className="h-3.5 w-3.5" />;
    if (p.includes("resume")) return <FileText className="h-3.5 w-3.5" />;
    if (p.includes("contact")) return <Mail className="h-3.5 w-3.5" />;
    if (p.includes("now")) return <Clock className="h-3.5 w-3.5" />;
    return <Compass className="h-3.5 w-3.5" />;
  }

  if (it.id === "resume-download") return <FileText className="h-3.5 w-3.5" />;
  if (it.id === "schedule") return <Calendar className="h-3.5 w-3.5" />;
  if (it.id === "theme") return <SunMoon className="h-3.5 w-3.5" />;
  if (it.id === "sound") return <Volume2 className="h-3.5 w-3.5" />;
  if (it.id === "vcard") return <Contact className="h-3.5 w-3.5" />;
  if (it.id === "shortcuts") return <Keyboard className="h-3.5 w-3.5" />;
  if (it.id === "call") return <PhoneCall className="h-3.5 w-3.5" />;
  if (it.id === "email") return <Mail className="h-3.5 w-3.5" />;
  if (it.id === "github") return <GitBranch className="h-3.5 w-3.5" />;
  if (it.id === "linkedin") return <Globe className="h-3.5 w-3.5" />;
  return <Sparkles className="h-3.5 w-3.5" />;
}


export function CommandPalette({ items, initialOpen = false }: { items: PaletteItem[]; initialOpen?: boolean }) {
  const router = useRouter();
  const t = useDict().palette;
  const [open, setOpen] = useState(initialOpen);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const it of items) {
      const g = it.group;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return [...map.entries()].sort((a, b) => {
      const idxA = GROUP_ORDER.indexOf(a[0] as PaletteGroup);
      const idxB = GROUP_ORDER.indexOf(b[0] as PaletteGroup);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          soundEngine?.play(prev ? "swish-close" : "swish-open");
          return !prev;
        });
      }
    };
    const onOpen = () => {
      soundEngine?.play("swish-open");
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const run = async (it: PaletteItem) => {
    if (it.run === "copy") {
      try {
        await navigator.clipboard.writeText(it.value ?? "");
        setNote(t.copied);
        soundEngine?.play("click");
        setTimeout(() => {
          setOpen(false);
          setNote("");
        }, 700);
      } catch {
        setNote(`${t.copyFail} ${it.value ?? ""}`);
      }
      return;
    }
    setOpen(false);
    if (it.run === "theme") {
      switchTheme();
      soundEngine?.play("click");
    } else if (it.run === "sound") {
      soundEngine?.toggle();
    } else if (it.run === "href") {
      soundEngine?.play("click");
      router.push(it.value ?? "/");
    } else if (it.run === "download") {
      soundEngine?.play("click");
      const link = document.createElement("a");
      link.href = it.value ?? "/";
      if (it.value?.endsWith(".pdf")) link.download = "Maarcus_Reniero_Resume.pdf";
      else if (it.value?.includes("vcard") || it.value?.endsWith(".vcf")) link.download = "maarcus-reniero.vcf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (it.run === "event") {
      soundEngine?.play("click");
      window.dispatchEvent(new Event(it.value ?? ""));
    } else {
      soundEngine?.play("click");
      window.open(it.value, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
        soundEngine?.play(v ? "swish-open" : "swish-close");
      }}
      label={t.label}
    >
      <CommandInput placeholder={t.placeholder} value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{t.empty(query)}</CommandEmpty>
        {groups.map(([groupName, groupItems], idx) => (
          <React.Fragment key={groupName}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={t.groups[groupName as keyof typeof t.groups] ?? groupName}>
              {groupItems.map((it) => (
                <CommandItem
                  key={it.id}
                  // The id keeps every item distinct; label, hint and keywords are what search matches.
                  value={it.id}
                  keywords={[it.label, it.hint ?? "", it.keywords ?? ""]}
                  onSelect={() => void run(it)}
                  className="flex items-center justify-between gap-3 group px-3 py-2.5 rounded-lg text-xs font-sans data-[selected=true]:bg-[var(--hover)] data-[selected=true]:text-[var(--green)] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0 text-[var(--fg-3)] group-hover:text-[var(--green)] group-data-[selected=true]:text-[var(--green)] transition-colors">
                      {getItemIcon(it)}
                    </span>
                    <span className="font-medium truncate text-[var(--fg)] group-data-[selected=true]:text-[var(--green)]">
                      {it.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-[var(--fg-3)]">
                    {it.hint && (
                      <span
                        className={cn(
                          "truncate max-w-[200px]",
                          it.group === "Skills" && "px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--line)] bg-[var(--hover)]/60 text-[var(--fg-3)]"
                        )}
                      >
                        {it.hint}
                      </span>
                    )}
                    {it.run === "download" && (
                      <Download className="h-3 w-3 opacity-60 group-hover:opacity-100 group-data-[selected=true]:opacity-100" />
                    )}
                    {it.run === "external" && (
                      <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 group-data-[selected=true]:opacity-100" />
                    )}
                    {it.run === "copy" && (
                      <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 group-data-[selected=true]:opacity-100" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
      <div className={`flex items-center justify-between px-4 py-2.5 border-t border-[var(--line)] bg-[var(--hover)]/30 text-[11px] font-mono text-[var(--fg-3)] ${note ? "" : "pointer-coarse:hidden"}`}>
        {note ? (
          <div className="flex items-center gap-1.5 text-[var(--green)]">
            <Check className="h-3.5 w-3.5" />
            <span>{note}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px]">↑↓</kbd>
              <span>{t.move}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px]">↵</kbd>
              <span>{t.select}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[10px]">esc</kbd>
              <span>{t.close}</span>
            </span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--fg-3)] opacity-70" aria-hidden="true">
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">⌘K</kbd>
        </div>
      </div>
    </CommandDialog>
  );
}
