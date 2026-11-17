"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  List as ListIcon,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { useQueryState } from "~/components/site/use-query-state";
import { Pic } from "~/components/site/media";
import { useDict, useLang } from "~/components/site/locale";
import type { Certificate } from "~/lib/schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { certAsset } from "~/lib/site";

type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "hours"
  | "issuer";

const initials = (s: string) =>
  s
    .replace(/\(.*\)/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function domainFor(c: Certificate): string {
  const text = `${c.title} ${c.about} ${c.issuer}`.toLowerCase();
  if (text.includes("aws") || text.includes("cloud")) return "cloud";
  if (text.includes("sql") || text.includes("pl/sql") || text.includes("database"))
    return "database";
  if (
    text.includes("react") ||
    text.includes("web development") ||
    text.includes("blog")
  )
    return "web";
  if (
    text.includes("c++") ||
    text.includes("algorithm") ||
    text.includes("data structure")
  )
    return "programming";
  if (text.includes("r programming") || text.includes("data science"))
    return "data";
  if (
    text.includes("git") ||
    text.includes("hardware") ||
    text.includes("networking") ||
    text.includes("systech")
  )
    return "systems";
  return "other";
}

/**
 * Certificates with advanced sorting, filtering, and search suite matching Projects.
 * Cards in grid view feature uniform dimensions (identical width & height).
 * Assets served from assets.maarcus.dev/<project|certification>/file-name.file-extension.
 */
export function CertificatesClient({ items }: { items: Certificate[] }) {
  const lang = useLang();
  const dict = useDict();
  const t = dict.certs;
  const ui = dict.ui;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [lang]
  );

  // Search & Filter state
  const [q, setQ] = useQueryState("q");
  const [issuerRaw, setIssuer] = useQueryState("issuer");
  const [domain, setDomain] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const issuer = issuerRaw || "all";

  // Issuer frequency counts
  const issuers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of items) counts.set(c.issuer, (counts.get(c.issuer) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Domain counts
  const domainCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of items) {
      const d = domainFor(c);
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    return map;
  }, [items]);

  // Hotkey / to focus search, Esc to clear
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        setQ("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setQ]);

  // Filtered & Sorted items
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const filtered = items.filter((c) => {
      // 1. Issuer filter
      if (issuer !== "all" && c.issuer !== issuer) return false;

      // 2. Domain filter
      if (domain !== "all" && domainFor(c) !== domain) return false;

      // 3. Search query
      if (needle) {
        const hay = [c.title, c.issuer, c.about, c.instructors ?? ""]
          .join(" ")
          .toLowerCase();
        const words = needle.split(/\s+/).filter(Boolean);
        const matches = words.every((word) => hay.includes(word));
        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.date.localeCompare(a.date);
        case "oldest":
          return a.date.localeCompare(b.date);
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "hours":
          return (b.hours || 0) - (a.hours || 0);
        case "issuer":
          return a.issuer.localeCompare(b.issuer);
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, q, issuer, domain, sort]);

  const hasActiveFilters = Boolean(
    q || issuer !== "all" || domain !== "all" || sort !== "newest"
  );

  const resetFilters = () => {
    setQ("");
    setIssuer("");
    setDomain("all");
    setSort("newest");
  };

  return (
    <div className="stack g24">
      {/* 1. Advanced Search, Filter & Sort Controls Suite */}
      <div className="filters">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          {/* shadcn Search Input */}
          <div className="relative flex-1">
            <label className="search">
              <Search className="h-3.5 w-3.5 text-[var(--fg-3)] shrink-0" aria-hidden="true" />
              <Input
                ref={searchInputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.search}
                aria-label={t.searchAria}
              />
              {q ? (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setQ("")}
                  className="h-6 w-6 p-0 text-[var(--fg-3)] hover:text-[var(--fg)]"
                  aria-label={ui.clearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <kbd>/</kbd>
              )}
            </label>
          </div>

          {/* Controls Toolbar: shadcn Select Dropdowns + View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* shadcn Issuer Dropdown */}
            <Select
              value={issuer}
              onValueChange={(val) => setIssuer(val === "all" ? "" : val)}
            >
              <SelectTrigger
                className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${
                  issuer !== "all"
                    ? "border-[var(--green)] text-[var(--green)] font-medium"
                    : "border-[var(--line)] text-[var(--fg-2)]"
                }`}
                aria-label={t.filter}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allIssuers(items.length)}</SelectItem>
                {issuers.map(([name, n]) => (
                  <SelectItem key={name} value={name}>
                    {name} ({n})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* shadcn Domain / Category Dropdown */}
            <Select value={domain} onValueChange={(val) => setDomain(val)}>
              <SelectTrigger
                className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${
                  domain !== "all"
                    ? "border-[var(--green)] text-[var(--green)] font-medium"
                    : "border-[var(--line)] text-[var(--fg-2)]"
                }`}
                aria-label={t.domainFilter}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allDomains(items.length)}</SelectItem>
                {Object.entries(t.domains)
                  .map(([key, label]) => {
                    const count = domainCounts.get(key) ?? 0;
                    if (count === 0) return null;
                    return (
                      <SelectItem key={key} value={key}>
                        {label} ({count})
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>

            {/* shadcn Sort Dropdown */}
            <Select
              value={sort}
              onValueChange={(val) => setSort(val as SortOption)}
            >
              <SelectTrigger
                className={`min-w-0 flex-1 basis-36 pointer-coarse:h-10 lg:w-auto lg:flex-none lg:min-w-[130px] ${
                  sort !== "newest"
                    ? "border-[var(--green)] text-[var(--green)] font-medium"
                    : "border-[var(--line)] text-[var(--fg-2)]"
                }`}
                aria-label={t.sortAria}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.sorts).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle Buttons */}
            <div className="flex shrink-0 items-center gap-1 border border-[var(--line)] rounded-lg p-0.5 h-[38px] pointer-coarse:h-10 bg-[var(--bg)]">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-7 w-7 pointer-coarse:h-9 pointer-coarse:w-9 ${
                  viewMode === "grid"
                    ? "bg-[var(--hover)] text-[var(--green)]"
                    : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                }`}
                aria-label={ui.gridView}
                title={ui.gridView}
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-7 w-7 pointer-coarse:h-9 pointer-coarse:w-9 ${
                  viewMode === "list"
                    ? "bg-[var(--hover)] text-[var(--green)]"
                    : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                }`}
                aria-label={ui.listView}
                title={ui.listView}
                aria-pressed={viewMode === "list"}
              >
                <ListIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs text-[var(--fg-3)]">
          <div className="flex items-center gap-2">
            <span role="status" aria-live="polite">{ui.showing(shown.length, items.length)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {q && (
              <Badge
                variant="outline"
                className="font-mono text-[11px] gap-1 py-0 h-5 border-[var(--green)] text-[var(--green)]"
              >
                “{q}”
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="hover:opacity-80"
                  aria-label={ui.removeFilter(q)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {issuer !== "all" && (
              <Badge
                variant="outline"
                className="font-mono text-[11px] gap-1 py-0 h-5 border-[var(--green)] text-[var(--green)]"
              >
                {issuer}
                <button
                  type="button"
                  onClick={() => setIssuer("")}
                  className="hover:opacity-80"
                  aria-label={ui.removeFilter(issuer)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {domain !== "all" && (
              <Badge
                variant="outline"
                className="font-mono text-[11px] gap-1 py-0 h-5 border-[var(--green)] text-[var(--green)]"
              >
                {t.domains[domain]}
                <button
                  type="button"
                  onClick={() => setDomain("all")}
                  className="hover:opacity-80"
                  aria-label={ui.removeFilter(t.domains[domain] ?? domain)}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {hasActiveFilters && (
              <Button
                variant="link"
                type="button"
                onClick={resetFilters}
                className="h-auto p-0 font-mono text-[11px] text-[var(--green)] hover:underline ml-1"
              >
                {ui.resetFilters}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Certifications View: Uniform Cards in Grid or Compact List */}
      {viewMode === "grid" ? (
        <ul className="cert-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((c, i) => {
              const fileUrl = c.file ? certAsset(c.file) : "";
              const previewUrl = c.preview ? certAsset(c.preview) : "";

              const thumb = (
                <Pic
                  className="cert-img w-full h-full object-cover object-top"
                  src={previewUrl}
                  alt={t.alt(c.title)}
                  fallback={
                    <span className="cert-fallback flex items-center justify-center w-full h-full bg-[var(--hover)] text-2xl font-mono font-bold text-[var(--fg-3)]">
                      {initials(c.issuer)}
                    </span>
                  }
                />
              );

              return (
                <m.li
                  key={c.slug}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min(i, 6) * 0.03,
                  }}
                  className="cert group relative flex h-full flex-col justify-between w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)]/40 hover:bg-[var(--hover)]/20 transition-all duration-200 overflow-hidden shadow-sm"
                >
                  {/* Media Preview (Fixed uniform height) */}
                  {c.preview ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCert(c)}
                      className="cert-media block h-[180px] w-full shrink-0 overflow-hidden border-b border-[var(--line)] bg-[var(--hover)] relative group/media text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--green)]"
                      aria-label={t.openAria(c.title)}
                    >
                      {thumb}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-lg bg-[var(--bg)]/90 backdrop-blur-sm text-xs font-mono text-[var(--fg)] flex items-center gap-1.5 border border-[var(--line)] shadow-sm">
                          <Eye className="h-3.5 w-3.5 text-[var(--green)]" />
                          Preview certificate
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="cert-media block h-[180px] w-full shrink-0 overflow-hidden border-b border-[var(--line)] bg-[var(--hover)] relative">
                      {thumb}
                    </div>
                  )}

                  {/* Body Content (Fills remaining height evenly) */}
                  <div className="cert-body flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden min-h-0">
                    <div className="cert-content flex flex-col gap-1.5 overflow-hidden">
                      <h2 className="cert-title font-semibold text-sm sm:text-[14px] text-[var(--fg)] leading-snug line-clamp-2 group-hover:text-[var(--green)] transition-colors">
                        {c.title}
                      </h2>
                      <p className="cert-meta font-mono text-xs text-[var(--fg-3)] flex items-center gap-1.5 line-clamp-1">
                        <span>{c.issuer}</span>
                        <span>·</span>
                        <span>
                          {fmt.format(new Date(`${c.date}T00:00:00Z`))}
                        </span>
                        {c.hours && (
                          <>
                            <span>·</span>
                            <span>{c.hours} {t.hours}</span>
                          </>
                        )}
                      </p>
                      <p className="muted small cert-desc text-xs text-[var(--fg-2)] leading-relaxed line-clamp-3 mt-1">
                        {c.about}
                      </p>
                    </div>

                    {/* Bottom Action Links */}
                    <div className="cert-links mt-auto pt-4.5 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                      <div>
                        {fileUrl ? (
                          <a
                            className="orglink inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--hover)]/40 hover:bg-[var(--hover)] hover:border-[var(--green)]/40 text-[var(--fg)] hover:text-[var(--green)] transition-all font-mono text-xs group/link"
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>{t.view}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-[var(--fg-3)] flex items-center gap-1 py-1">
                            <ShieldCheck className="h-3 w-3 text-[var(--green)]/70" />
                            Verified credential
                          </span>
                        )}
                      </div>

                      {c.verify && (
                        <a
                          className="orglink inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--green)]/20 bg-[var(--green)]/5 hover:bg-[var(--green)]/15 text-[var(--green)] hover:underline transition-all font-mono text-xs"
                          href={c.verify}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{t.verify}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        /* List Mode: Clean, uniform rows */
        <ul className="space-y-3" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((c, i) => {
              const fileUrl = c.file ? certAsset(c.file) : "";
              const previewUrl = c.preview ? certAsset(c.preview) : "";

              const thumb = (
                <Pic
                  className="cert-img w-full h-full object-cover"
                  src={previewUrl}
                  alt=""
                  fallback={
                    <span className="cert-fallback text-xs font-mono font-bold text-[var(--fg-3)]">
                      {initials(c.issuer)}
                    </span>
                  }
                />
              );

              return (
                <m.li
                  key={c.slug}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min(i, 6) * 0.02,
                  }}
                  className="cert group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)]/40 hover:bg-[var(--hover)]/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                    {/* Compact Thumbnail */}
                    {c.preview ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCert(c)}
                        className="cert-media shrink-0 w-12 h-12 rounded-lg border border-[var(--line)] bg-[var(--hover)] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[var(--green)]/40 transition-colors"
                        aria-label={t.openAria(c.title)}
                      >
                        {thumb}
                      </button>
                    ) : (
                      <div className="cert-media shrink-0 w-12 h-12 rounded-lg border border-[var(--line)] bg-[var(--hover)] overflow-hidden flex items-center justify-center">
                        {thumb}
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="cert-title font-semibold text-sm text-[var(--fg)] group-hover:text-[var(--green)] transition-colors truncate">
                          {c.title}
                        </h2>
                        {c.hours && (
                          <span className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--hover)] text-[var(--fg-3)] border border-[var(--line)]">
                            {c.hours} hrs
                          </span>
                        )}
                      </div>
                      <p className="cert-meta font-mono text-xs text-[var(--fg-3)] mt-0.5 truncate">
                        {c.issuer} · {fmt.format(new Date(`${c.date}T00:00:00Z`))}
                        <span className="hidden md:inline"> · {c.about}</span>
                      </p>
                    </div>
                  </div>

                  {/* Outward Actions */}
                  <div className="cert-links shrink-0 flex items-center gap-2.5 font-mono text-xs">
                    {c.preview && (
                      <button
                        type="button"
                        onClick={() => setSelectedCert(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--line)] bg-[var(--hover)]/30 hover:bg-[var(--hover)] hover:text-[var(--fg)] text-[var(--fg-2)] transition-colors cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        <span>{ui.preview}</span>
                      </button>
                    )}
                    {fileUrl && (
                      <a
                        className="orglink inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--line)] bg-[var(--hover)]/30 hover:bg-[var(--hover)] text-[var(--fg-2)] hover:text-[var(--green)] transition-colors"
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{t.view}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    )}
                    {c.verify && (
                      <a
                        className="orglink inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--green)]/20 bg-[var(--green)]/5 hover:bg-[var(--green)]/15 text-[var(--green)] hover:underline transition-colors"
                        href={c.verify}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{t.verify}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Empty Search / Filter State */}
      {shown.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-[var(--line)] font-mono text-xs text-[var(--fg-3)] space-y-2">
          <p>{t.none}</p>
          <Button
            type="button"
            variant="link"
            className="text-[var(--green)] hover:underline text-xs"
            onClick={resetFilters}
          >
            {t.clear}
          </Button>
        </div>
      )}

      {/* 3. Certificate Full Preview Dialog Modal */}
      <Dialog
        open={!!selectedCert}
        onOpenChange={(open) => !open && setSelectedCert(null)}
      >
        <DialogContent className="max-w-2xl p-6 bg-[var(--bg)] border-[var(--line)] text-[var(--fg)]">
          {selectedCert && (
            <div className="flex flex-col gap-4">
              <DialogHeader className="space-y-1.5 text-left">
                <DialogTitle className="text-base sm:text-lg font-semibold text-[var(--fg)] leading-snug">
                  {selectedCert.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-[var(--fg-3)] flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-medium text-[var(--fg-2)]">
                    {selectedCert.issuer}
                  </span>
                  <span>·</span>
                  <span>
                    {fmt.format(new Date(`${selectedCert.date}T00:00:00Z`))}
                  </span>
                  {selectedCert.hours && (
                    <>
                      <span>·</span>
                      <span>
                        {selectedCert.hours} {t.hours}
                      </span>
                    </>
                  )}
                  {selectedCert.instructors && (
                    <>
                      <span>·</span>
                      <span>{selectedCert.instructors}</span>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Full Image Preview */}
              {selectedCert.preview && (
                <div className="relative w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--hover)]/30 max-h-[60vh] flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={certAsset(selectedCert.preview)}
                    alt={selectedCert.title}
                    className="w-full h-auto max-h-[56vh] object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-[var(--fg-2)] leading-relaxed">
                {selectedCert.about}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--line)] font-mono text-xs mt-1">
                <div className="flex items-center gap-2.5">
                  {selectedCert.file && (
                    <a
                      href={certAsset(selectedCert.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--hover)] hover:border-[var(--green)]/40 text-[var(--fg)] hover:text-[var(--green)] transition-all font-mono text-xs"
                    >
                      <span>{t.view}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selectedCert.verify && (
                    <a
                      href={selectedCert.verify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/10 hover:bg-[var(--green)]/20 text-[var(--green)] transition-all font-mono text-xs"
                    >
                      <span>{t.verify}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCert(null)}
                  className="text-xs font-mono text-[var(--fg-3)] hover:text-[var(--fg)] cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
