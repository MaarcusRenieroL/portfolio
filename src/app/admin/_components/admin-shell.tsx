"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  Shield,
  Sparkles,
  StickyNote,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "~/components/site/theme-toggle";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "~/components/ui/command";
import { SITE } from "~/lib/site";
import { kindIcon } from "./admin-ui";
import { post } from "./api";

export type NavCounts = Record<string, { n: number; drafts: number }>;
export type PaletteItem = { kind: string; key: string; title: string };

type NavItem = { href: string; label: string; icon: LucideIcon; kind?: string; count?: "media" | "inbox" };



const GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, count: "inbox" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content/project", label: "Projects", icon: FolderGit2, kind: "project" },
      { href: "/admin/content/role", label: "Experience", icon: Briefcase, kind: "role" },
      { href: "/admin/content/education", label: "Education", icon: GraduationCap, kind: "education" },
      { href: "/admin/content/skillgroup", label: "Skills", icon: Sparkles, kind: "skillgroup" },
      { href: "/admin/content/certificate", label: "Certificates", icon: Award, kind: "certificate" },
      { href: "/admin/content/post", label: "Blog", icon: FileText, kind: "post" },
      { href: "/admin/content/note", label: "Notes", icon: StickyNote, kind: "note" },
    ],
  },
  { label: "Library", items: [{ href: "/admin/media", label: "Media", icon: Images, count: "media" }] },
  {
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }],
  },
  {
    label: "Account",
    items: [
      { href: "/admin/settings", label: "Site settings", icon: Settings2 },
      { href: "/admin/security", label: "Security", icon: Shield },
    ],
  },
];

const NEW_LABELS: Record<string, string> = {
  project: "project",
  role: "role",
  education: "education entry",
  skillgroup: "skill group",
  certificate: "certificate",
  post: "blog post",
  note: "note",
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The page the URL points at, for the top bar: section, then the item when editing one. */
function crumbs(pathname: string): string[] {
  for (const g of GROUPS)
    for (const it of g.items)
      if (isActive(pathname, it.href)) {
        const rest = pathname.slice(it.href.length).split("/").filter(Boolean);
        if (!rest.length || it.href === "/admin") return [it.label];
        return [it.label, rest[0] === "new" ? "New" : decodeURIComponent(rest[0])];
      }
  return ["Admin"];
}

function Sidebar({
  counts,
  media,
  unread,
  onNavigate,
  onSearch,
  inDrawer,
}: {
  counts: NavCounts;
  media: number;
  unread: number;
  onNavigate?: () => void;
  onSearch: () => void;
  /** Leaves room for the drawer's close button. */
  inDrawer?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-14 shrink-0 items-center gap-2 px-4 ${inDrawer ? "pr-12" : ""}`}>
        <Link href="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-[var(--fg)]">
          <span className="dot shrink-0" aria-hidden="true" />
          <span className="truncate">{SITE.domain}</span>
        </Link>
        <span className="ml-auto rounded-full border border-[var(--line)] px-1.5 py-px font-mono text-[10px] text-[var(--fg-3)]">admin</span>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--bg)] px-2.5 text-left text-xs text-[var(--fg-3)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg-2)]"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="flex-1">Jump to…</span>
          <kbd className="font-mono text-[10px] text-[var(--fg-3)] pointer-coarse:hidden">⌘K</kbd>
        </button>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent>
        {GROUPS.map((g, i) => (
          <div key={g.label ?? i} className={i ? "mt-5" : "mt-1"}>
            {g.label && <p className="mb-1 px-2 text-[11px] font-medium text-[var(--fg-3)]">{g.label}</p>}
            <ul className="space-y-px">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                const c = it.kind ? counts[it.kind] : undefined;
                const n = it.count === "media" ? media : it.count === "inbox" ? unread || undefined : it.kind ? (c?.n ?? 0) : undefined;
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors pointer-coarse:h-10 ${
                        active ? "bg-[var(--hover)] font-medium text-[var(--fg)]" : "text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--green)]" : "text-[var(--fg-3)] group-hover:text-[var(--fg-2)]"}`} aria-hidden="true" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {c && c.drafts > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" title={`${c.drafts} with unpublished changes`}>
                          <span className="sr-only">{c.drafts} unpublished</span>
                        </span>
                      )}
                      {n !== undefined && <span className="font-mono text-[11px] tabular-nums text-[var(--fg-3)]">{n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1 border-t border-[var(--line)] px-3 py-2.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 flex-1 items-center gap-2 rounded-md px-2 text-[13px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
        >
          <ArrowUpRight className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
          View site
        </a>
        <ThemeToggle />
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          onClick={async () => {
            await post("logout");
            router.replace("/admin/login");
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * The admin frame: a fixed sidebar on desktop, a drawer on phones, a slim top bar with the
 * current location, and a ⌘K command bar that jumps to any page or item or starts a new one.
 */
export function AdminShell({
  counts,
  media,
  unread,
  items,
  children,
}: {
  counts: NavCounts;
  media: number;
  unread: number;
  items: PaletteItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const trail = useMemo(() => crumbs(pathname), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setPalette(false);
    router.push(href);
  };

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-[var(--line)] bg-[var(--hover)]/40 lg:block">
        <Sidebar counts={counts} media={media} unread={unread} onSearch={() => setPalette(true)} />
      </aside>

      {/* Phone / tablet drawer */}
      <DialogPrimitive.Root open={drawer} onOpenChange={setDrawer}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 lg:hidden" />
          <DialogPrimitive.Content
            data-lenis-prevent
            className="fixed inset-y-0 left-0 z-50 w-[17rem] max-w-[85vw] border-r border-[var(--line)] bg-[var(--bg)] shadow-[8px_0_32px_rgb(0_0_0/0.35)] duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Admin navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Sections of the admin</DialogPrimitive.Description>
            <DialogPrimitive.Close className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-md text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]" aria-label="Close menu">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
            <Sidebar
              counts={counts}
              media={media}
              unread={unread}
              inDrawer
              onNavigate={() => setDrawer(false)}
              onSearch={() => {
                setDrawer(false);
                setPalette(true);
              }}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-[var(--line)] bg-[var(--bg)]/85 px-3 backdrop-blur-md sm:px-5">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
              {trail.map((c, i) => (
                <li key={`${c}-${i}`} className={`flex min-w-0 items-center gap-1.5 ${i === trail.length - 1 ? "text-[var(--fg)]" : "text-[var(--fg-3)]"}`}>
                  {i > 0 && <span className="text-[var(--line-2)]" aria-hidden="true">/</span>}
                  <span className="truncate">{c}</span>
                </li>
              ))}
            </ol>
          </nav>
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex h-8 items-center gap-2 rounded-md border border-[var(--line)] px-2.5 text-xs text-[var(--fg-3)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg-2)] lg:hidden"
            aria-label="Search the admin"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>

      <CommandDialog open={palette} onOpenChange={setPalette} label="Jump to anything in the admin">
        <CommandInput placeholder="Go to a page, open an item, or create one…" />
        <CommandList data-lenis-prevent>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            {GROUPS.flatMap((g) => g.items).map((it) => {
              const Icon = it.icon;
              return (
                <CommandItem key={it.href} value={it.href} keywords={[it.label]} onSelect={() => go(it.href)}>
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
                    {it.label}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading="Create">
            {Object.entries(NEW_LABELS).map(([kind, label]) => (
              <CommandItem key={kind} value={`new-${kind}`} keywords={[`New ${label}`, "create add"]} onSelect={() => go(`/admin/content/${kind}/new`)}>
                <span className="flex items-center gap-2.5">
                  <Plus className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
                  New {label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          {items.length > 0 && (
            <CommandGroup heading="Content">
              {items.map((it) => {
                const Icon = kindIcon(it.kind);
                return (
                  <CommandItem
                    key={`${it.kind}/${it.key}`}
                    value={`item-${it.kind}-${it.key}`}
                    keywords={[it.title, it.key, it.kind]}
                    onSelect={() => go(`/admin/content/${it.kind}/${encodeURIComponent(it.key)}`)}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--fg-3)]" aria-hidden="true" />
                      <span className="truncate">{it.title}</span>
                    </span>
                    <CommandShortcut>{it.kind === "skillgroup" ? "skills" : it.kind}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
