"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDict, useLang } from "~/components/site/locale";
import { NAV_LINKS } from "~/lib/content";
import { localePath, type Lang } from "~/lib/i18n";
import type { SearchData } from "~/lib/site-content";

type Entry = { label: string; hint: string; href: string; external?: boolean };

const buildIndex = (lang: Lang, t: ReturnType<typeof useDict>, data: SearchData[Lang]): Entry[] => [
  ...NAV_LINKS.filter((l) => l.href !== "/blog").map((l) => ({ label: t.nav[(l.href === "/" ? "home" : l.href.slice(1)) as keyof typeof t.nav], hint: t.notFound.page, href: localePath(lang, l.href) })),
  { label: t.chrome.changelog, hint: t.notFound.page, href: localePath(lang, "/changelog") },
  ...data.projects.map((p) => ({ label: p.name, hint: `${t.notFound.project} · ${p.kind}`, href: p.href, external: true })),
  ...data.certs.map((c) => ({ label: c.title, hint: `${t.notFound.cert} · ${c.issuer}`, href: localePath(lang, `/certifications?q=${encodeURIComponent(c.title.split(" ").slice(0, 3).join(" "))}`) })),
];

/** "Looking for something?" on the 404 page: type to find a page, project or certification. */
export function NotFoundSearch({ data }: { data: SearchData }) {
  const lang = useLang();
  const t = useDict();
  const index = useMemo(() => buildIndex(lang, t, data[lang]), [lang, t, data]);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const results = useMemo(() => (needle ? index.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(needle)).slice(0, 6) : []), [needle, index]);

  return (
    <div className="nf-search stack g16">
      <label className="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.notFound.placeholder} aria-label={t.notFound.aria} />
      </label>
      {needle && (
        <ul className="nf-results" aria-live="polite">
          {results.map((r) => (
            <li key={r.href + r.label}>
              {r.external ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer">
                  <span>{r.label}</span>
                  <span className="muted small">{r.hint}</span>
                </a>
              ) : (
                <Link href={r.href}>
                  <span>{r.label}</span>
                  <span className="muted small">{r.hint}</span>
                </Link>
              )}
            </li>
          ))}
          {results.length === 0 && <li className="muted">{t.notFound.none}</li>}
        </ul>
      )}
    </div>
  );
}
