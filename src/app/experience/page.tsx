import type { Metadata } from "next";
import Link from "next/link";
import { Pic } from "~/components/site/media";
import { MEDIA, ROLES, SKILLS } from "~/lib/content";

export const metadata: Metadata = { title: "Experience", description: "From networking to full stack Next.js to production healthcare backends in Java. Here is the work, and every skill it took." };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

type Entry = { url?: string; key: string; date: string; org: string; sub: string; logo: string; minor?: boolean; now?: boolean; points?: string[]; tags?: string[] };

/** One flat, newest-first list: a role's company renames become their own short steps. */
const entries: Entry[] = ROLES.flatMap((r): Entry[] => {
  const points = r.points.filter((p) => !p.startsWith("["));
  if (!r.path) {
    return [{ key: r.org, date: r.date, org: r.org, sub: `${r.title}${r.place ? ` · ${r.place}` : ""}`, logo: r.org, url: r.url, points, tags: r.tags }];
  }
  const [top, ...before] = r.path;
  return [
    { key: top.org, date: `${top.date} — now`, org: top.org, sub: `${r.title} · ${r.place ?? ""}`.replace(/ · $/, ""), logo: r.org, url: r.url, now: true, points, tags: r.tags },
    ...before.map((st): Entry => ({ key: st.org, date: st.date, org: st.org, sub: st.note, logo: r.org, minor: true })),
  ];
});

export default function ExperiencePage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Experience</h1>
        <p className="lead">From networking to full stack Next.js to production healthcare backends in Java. Here is the work, and every skill it took.</p>
        <Link className="action" href="/resume">
          Resume
        </Link>
      </header>

      <ol className="tl" aria-label="Career timeline">
        {entries.map((e) => (
          <li key={e.key} data-minor={e.minor ? "" : undefined} data-now={e.now ? "" : undefined}>
            <span className="tl-when">{e.date}</span>
            <div className="tl-body">
              <div className="tl-head">
                <Pic className="logo" src={MEDIA.logos[e.logo] ?? ""} alt="" fallback={initials(e.logo)} />
                <div className="stack">
                  <h2 className="tl-org">{e.url ? <a className="orglink" href={e.url} target="_blank" rel="noopener noreferrer">{e.org} ↗</a> : e.org}</h2>
                  <span className="muted small">{e.sub}</span>
                </div>
              </div>
              {e.points && e.points.length > 0 && (
                <ul className="points">
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              {e.tags && (
                <span className="tags">
                  {e.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="section" aria-labelledby="used-h">
        <h2 id="used-h" className="h2">Skills I use</h2>
        <div>
          {SKILLS.used.map((g) => (
            <div className="skillrow" key={g.name}>
              <span>{g.name}</span>
              <span className="tags" style={{ fontSize: 13, gap: "4px 16px" }}>
                {g.items.map((t) => (
                  <span key={t} style={{ color: "var(--fg-2)" }}>{t}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="learn-h">
        <h2 id="learn-h" className="h2">Currently learning</h2>
        <p className="tags" style={{ fontSize: 13, gap: "4px 16px" }}>
          {SKILLS.learning.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
      </section>
    </div>
  );
}
