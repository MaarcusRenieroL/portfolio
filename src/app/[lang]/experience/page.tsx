import type { Metadata } from "next";
import { pageMeta } from "~/lib/seo";
import Link from "next/link";
import { Pic } from "~/components/site/media";
import { MEDIA } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { localePath, type Lang } from "~/lib/i18n";
import { langOf } from "~/lib/lang";
import { educationFor, rolesFor } from "~/lib/localize";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("experience", await langOf(params), "/experience");
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

type Entry = { url?: string; key: string; date: string; org: string; sub: string; logo: string; minor?: boolean; now?: boolean; points?: string[]; tags?: string[] };

/** One flat, newest-first list: a role's company renames become their own short steps. */
const entriesFor = (lang: Lang): Entry[] =>
  rolesFor(lang).flatMap((r): Entry[] => {
  const points = r.points.filter((p) => !p.startsWith("["));
  if (!r.path) {
    return [{ key: r.org, date: r.date, org: r.org, sub: `${r.title}${r.place ? ` · ${r.place}` : ""}`, logo: r.org, url: r.url, points, tags: r.tags }];
  }
  const [top, ...before] = r.path;
  return [
    { key: top.org, date: `${top.date} — ${DICT[lang].experience.now}`, org: top.org, sub: `${r.title} · ${r.place ?? ""}`.replace(/ · $/, ""), logo: r.org, url: r.url, now: true, points, tags: r.tags },
    ...before.map((st): Entry => ({ key: st.org, date: st.date, org: st.org, sub: st.note, logo: r.org, minor: true })),
  ];
  });

export default async function ExperiencePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].experience;
  const entries = entriesFor(lang);
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <Link className="action" href={localePath(lang, "/resume")}>
          {DICT[lang].nav.resume}
        </Link>
      </header>

      <ol className="tl" aria-label={t.timeline}>
        {entries.map((e) => (
          <li key={e.key} data-minor={e.minor ? "" : undefined} data-now={e.now ? "" : undefined}>
            <span className="tl-when">{e.date}</span>
            <div className="tl-body">
              <div className="tl-head">
                <Pic className={MEDIA.logoClass(e.logo)} src={MEDIA.logos[e.logo] ?? ""} alt="" fallback={initials(e.logo)} />
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

      <section className="section" aria-labelledby="edu-h">
        <h2 id="edu-h" className="h2">{t.education}</h2>
        <div>
          {educationFor(lang).map((e) => (
            <div className="skillrow" key={e.school}>
              <span>{e.date}</span>
              <span className="stack" style={{ gap: 2 }}>
                <span>{e.url ? <a className="orglink" href={e.url} target="_blank" rel="noopener noreferrer">{e.school} ↗</a> : e.school}</span>
                <span className="muted small">
                  {e.degree}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
