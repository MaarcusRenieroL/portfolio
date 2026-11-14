"use client";

import { useMemo } from "react";
import { useQueryState } from "~/components/site/use-query-state";
import { Pic } from "~/components/site/media";
import { useDict, useLang } from "~/components/site/locale";
import type { Certificate } from "~/lib/schema";

const initials = (s: string) =>
  s
    .replace(/\(.*\)/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Certificates as cards with a preview, filtered by issuer and a text search. */
export function CertificatesClient({ items }: { items: Certificate[] }) {
  const lang = useLang();
  const t = useDict().certs;
  const fmt = useMemo(() => new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }), [lang]);
  const [q, setQ] = useQueryState("q");
  const [issuerRaw, setIssuer] = useQueryState("issuer");
  const issuer = issuerRaw || null;

  const issuers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of items) counts.set(c.issuer, (counts.get(c.issuer) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const needle = q.trim().toLowerCase();
  const shown = items.filter((c) => (!issuer || c.issuer === issuer) && (!needle || `${c.title} ${c.issuer} ${c.about} ${c.instructors ?? ""}`.toLowerCase().includes(needle)));

  return (
    <div className="stack g24">
      <div className="filters">
        <label className="search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.searchAria} />
        </label>
        <div className="chips" role="group" aria-label={t.filter}>
          <button type="button" className="chip" aria-pressed={issuer === null} onClick={() => setIssuer("")}>
            {t.all}
          </button>
          {issuers.map(([name, n]) => (
            <button key={name} type="button" className="chip" aria-pressed={issuer === name} onClick={() => setIssuer(issuer === name ? "" : name)}>
              {name} <span className="chip-n">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="muted small" role="status" aria-live="polite">
        {t.count(shown.length)}
      </p>

      <ul className="cert-grid">
        {shown.map((c) => {
          const thumb = (
            <Pic className="cert-img" src={c.preview ? `/certificates/${c.preview}` : ""} alt={t.alt(c.title)} fallback={<span className="cert-fallback">{initials(c.issuer)}</span>} />
          );
          return (
            <li className="cert" key={c.slug}>
              {c.file ? (
                <a className="cert-media" href={`/certificates/${c.file}`} target="_blank" rel="noopener noreferrer" aria-label={t.openAria(c.title)}>
                  {thumb}
                </a>
              ) : (
                <div className="cert-media">{thumb}</div>
              )}
              <div className="cert-body">
                <h2 className="cert-title">{c.title}</h2>
                <p className="cert-meta">
                  {c.issuer} · {fmt.format(new Date(`${c.date}T00:00:00Z`))}
                  {c.hours ? ` · ${c.hours} ${t.hours}` : ""}
                </p>
                <p className="muted small">{c.about}</p>
                {c.instructors && <p className="muted small">{t.instructors}: {c.instructors}</p>}
                {(c.file || c.verify) && (
                  <p className="cert-links">
                    {c.file && (
                      <a className="orglink" href={`/certificates/${c.file}`} target="_blank" rel="noopener noreferrer">
                        {t.view}
                      </a>
                    )}
                    {c.verify && (
                      <a className="orglink" href={c.verify} target="_blank" rel="noopener noreferrer">
                        {t.verify}
                      </a>
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && (
        <p className="muted">
          {t.none}{" "}
          <button type="button" className="link" onClick={() => (setQ(""), setIssuer(""))}>
            {t.clear}
          </button>
        </p>
      )}
    </div>
  );
}
