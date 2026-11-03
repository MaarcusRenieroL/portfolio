"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PROJECTS } from "~/lib/content";
import { Eyebrow } from "./ui";

const ROUTES = ["/", "/projects", "/experience", "/stack", "/about", "/contact", "/resume", "/privacy", ...PROJECTS.filter((p) => !p.external).map((p) => `/projects/${p.slug}`)];

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function NotFoundView() {
  const path = usePathname() || "/";
  const [typed, setTyped] = useState(path);
  const near = ROUTES.map((r) => [r, lev(path.toLowerCase(), r)] as const).filter(([, d]) => d <= 3).sort((a, b) => a[1] - b[1]).slice(0, 3);

  useEffect(() => {
    if (document.documentElement.dataset.tier === "0") return;
    setTyped("");
    const step = Math.min(40, 600 / Math.max(1, path.length));
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(path.slice(0, i));
      if (i >= path.length) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [path]);

  return (
    <section className="nf">
      <div className="atmos" />
      <span className="kanji" style={{ position: "absolute", right: "6%", top: "50%", transform: "translateY(-50%)", fontSize: 420, lineHeight: 1, opacity: 0.06 }} aria-hidden="true">迷</span>
      <div className="wrap stack" style={{ gap: 32, position: "relative" }}>
        <Eyebrow kanji="迷" className="rise">Error 404</Eyebrow>
        <div className="big" role="img" aria-label="404">
          <span className="lo" aria-hidden="true">404</span>
          <span className="hi" aria-hidden="true" style={{ animation: "vt-hi 700ms var(--ease-draw) both" }}>404</span>
          <span className="cut" />
        </div>
        <h1 className="h2 rise">This path was cut.</h1>
        <p className="mono small" style={{ color: "var(--fg-3)" }}>
          <span className="blade">~ $</span> cd {typed}
          <span className="caret" /> <span style={{ color: "var(--danger)" }}>→ no such route</span>
        </p>
        {near.length > 0 && (
          <p className="small row" style={{ gap: 10, flexWrap: "wrap" }}>
            Did you mean{" "}
            {near.map(([r]) => (
              <Link key={r} className="tag tag-blade" href={r}>{r}</Link>
            ))}
          </p>
        )}
        <div className="row stack-m" style={{ gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/">Back home</Link>
          <Link className="btn btn-ghost" href="/projects">View projects</Link>
          <span className="row small" style={{ gap: 8, marginLeft: 8 }}>or press <span className="kbd">⌘K</span> to search</span>
        </div>
      </div>
    </section>
  );
}

export function ServerErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [busy, setBusy] = useState(false);
  const [apart, setApart] = useState(false);
  useEffect(() => {
    console.error(error);
    setApart(true);
  }, [error]);

  const retry = () => {
    setBusy(true);
    setApart(false);
    setTimeout(() => {
      reset();
      setBusy(false);
    }, 600);
  };

  return (
    <section className="er">
      <div className="atmos" />
      <svg className="er-blade" viewBox="0 0 640 260" aria-hidden="true">
        <defs>
          <linearGradient id="eb" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--line-2)" }} />
            <stop offset="1" style={{ stopColor: "var(--surface-2)" }} />
          </linearGradient>
        </defs>
        <g transform="translate(10 190) rotate(-14)">
          <line x1="4" y1="0" x2="92" y2="0" stroke="var(--fg-3)" strokeWidth="10" strokeDasharray="5 5" />
          <rect x="96" y="-18" width="7" height="36" fill="var(--blade)" />
          <path d="M103 -5L340 -5L352 7L103 6Z" fill="url(#eb)" />
          <path d="M103 6L352 7" stroke="var(--blade)" strokeWidth="1.2" />
          <g style={{ transform: apart ? "translate(26px,16px) rotate(4deg)" : "none", transformOrigin: "360px 0", transition: "transform 420ms var(--ease-out)" }}>
            <path d="M362 -5L560 -5C585 -5 605 -1 620 6L372 7Z" fill="url(#eb)" />
            <path d="M372 7L620 6" stroke="var(--lime)" strokeWidth="1.4" style={{ filter: "drop-shadow(0 0 6px var(--blade))" }} />
          </g>
        </g>
      </svg>
      <div className="wrap stack" style={{ gap: 28, position: "relative" }}>
        <Eyebrow kanji="断" className="rise">Error 500</Eyebrow>
        <h1 className="d-l wipe" style={{ maxWidth: 640 }}>Something broke on my side.</h1>
        <p className="lead rise" style={{ maxWidth: 560 }}>Not your fault. The page hit an error while rendering. Trying again usually fixes it.</p>
        <div className="row stack-m" style={{ gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="button" onClick={retry} aria-live="polite" disabled={busy}>
            {busy ? (<><span className="spin" aria-hidden="true" />Retrying…</>) : "Try again"}
          </button>
          <Link className="btn btn-ghost" href="/">Back home</Link>
        </div>
        <div className="panel row stack-m" style={{ gap: 20, padding: "16px 20px", maxWidth: 560, justifyContent: "space-between" }}>
          <span className="mono small">Error ID <span className="fg">{error.digest ?? "[digest · e.g. 3842917650]"}</span></span>
          <Link className="link-arrow" href="/contact">Report it <span className="arr">→</span></Link>
        </div>
      </div>
    </section>
  );
}
