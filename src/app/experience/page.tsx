import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "~/components/site/icons";
import { Eyebrow, SecHead } from "~/components/site/ui";
import { BEYOND, ROLES } from "~/lib/content";

export const metadata: Metadata = { title: "Experience", description: "Networking first, then two full stack Next.js roles, then production backends for healthcare." };

export default function ExperiencePage() {
  return (
    <>
      <header className="section-sm" style={{ paddingBottom: 64 }}>
        <div className="atmos" />
        <div className="wrap row stack-m" style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 32, position: "relative" }}>
          <div className="stack" style={{ gap: 24, maxWidth: 700 }}>
            <Eyebrow kanji="歴" className="rise">Experience · {ROLES.length} roles</Eyebrow>
            <h1 className="d-l wipe" style={{ animationDelay: "100ms" }}>Experience</h1>
            <p className="lead rise" style={{ animationDelay: "260ms" }}>Networking first, then two full stack Next.js roles, then production backends for healthcare. Newest first.</p>
          </div>
          <Link className="btn btn-ghost rise" href="/resume" style={{ animationDelay: "360ms" }}>Resume · PDF <Download /></Link>
        </div>
      </header>

      <section className="section-sm" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tl">
            {ROLES.map((r) => (
              <div className="tl-item" key={r.org} style={{ paddingBottom: 64 }}>
                <div className="tl-date stack" style={{ gap: 6, paddingTop: 6 }}>
                  <span className={`label${r.now ? " blade" : ""}`}>{r.date}</span>
                  {r.place && <span className="label">{r.place}</span>}
                </div>
                <div className="tl-rail"><span className={`tl-node${r.now ? " now" : ""}`} /></div>
                <div className="card stack" style={{ gap: 18 }} data-reveal="right">
                  <div className="row stack-m" style={{ justifyContent: "space-between", gap: 12 }}>
                    <div className="stack" style={{ gap: 4 }}>
                      <span className="h2">{r.org}</span>
                      <span className="h4 blade">{r.title}</span>
                    </div>
                    {r.now && <span className="tag tag-blade">Current</span>}
                  </div>
                  <ul className="pts">
                    {r.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <div className="tags">{r.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap stack" style={{ gap: 40 }}>
          <SecHead kanji="賞" eyebrow="Beyond the job" title="Leadership and hackathons" />
          <div className="grid-auto">
            {BEYOND.map((b, i) => (
              <div key={b.title} className="panel stack" style={{ gap: 10, padding: 24, ["--d" as string]: `${i * 90}ms` }} data-reveal>
                <span className="label">{b.label}</span>
                <span className="h4">{b.title}</span>
                <span className="small">{b.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
