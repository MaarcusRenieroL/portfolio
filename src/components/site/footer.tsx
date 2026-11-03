import Link from "next/link";
import { SITE } from "~/lib/content";
import { Arrow, Download } from "./icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="ichimatsu" style={{ position: "absolute", inset: 0 }} />
      <div className="wrap" style={{ position: "relative", paddingTop: 64, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 48 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 32 }}>
          <div className="stack" style={{ gap: 12, maxWidth: 560 }} data-reveal>
            <div className="h2">Let&apos;s talk shop.</div>
            <p className="body">Full-time roles, freelance work or master&apos;s admissions: one message reaches me.</p>
          </div>
          <div className="row stack-m" style={{ gap: 12, flexWrap: "wrap" }} data-reveal>
            <Link className="btn btn-blade" href="/contact">
              Contact <Arrow />
            </Link>
            <Link className="btn btn-ghost" href="/resume">
              Resume · PDF <Download />
            </Link>
          </div>
        </div>
        <div className="katana" data-reveal>
          <span className="tsuka" />
          <span className="tsuba" />
          <span className="ha" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: 32 }}>
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">Site</span>
            <Link className="small" href="/projects">Projects</Link>
            <Link className="small" href="/experience">Experience</Link>
            <Link className="small" href="/stack">Stack</Link>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">More</span>
            <Link className="small" href="/about">About</Link>
            <Link className="small" href="/resume">Resume</Link>
            <Link className="small" href="/privacy">Privacy</Link>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">Elsewhere</span>
            <a className="small" href={SITE.github}>GitHub</a>
            <a className="small" href={SITE.linkedin}>LinkedIn</a>
            <a className="small" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">Shortcuts</span>
            <span className="small row" style={{ gap: 8 }}><span className="kbd">⌘K</span> command palette</span>
            <span className="small row" style={{ gap: 8 }}><span className="kbd">`</span> terminal</span>
            <span className="small row" style={{ gap: 8 }}><span className="kbd">T</span> theme</span>
          </div>
        </div>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="label">© 2026 {SITE.name} · {SITE.location}</span>
          <span className="label">Next.js 16 · React 19 · Tailwind 4</span>
        </div>
      </div>
    </footer>
  );
}
