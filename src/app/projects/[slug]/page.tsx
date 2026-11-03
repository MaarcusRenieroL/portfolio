import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterRail, ReadingProgress } from "~/components/site/case-study-client";
import { CodeBlock } from "~/components/site/code-block";
import { External } from "~/components/site/icons";
import { Eyebrow, Shot } from "~/components/site/ui";
import { CASE_STUDIES, CHAPTERS, PROJECTS } from "~/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(CASE_STUDIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = CASE_STUDIES[slug];
  if (!cs) return {};
  return {
    title: `${cs.title} — case study`,
    description: cs.lead,
    openGraph: { images: [`/og?title=${encodeURIComponent(cs.title)}&subtitle=${encodeURIComponent(cs.lead.slice(0, 120))}`] },
  };
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : <span key={i}>{part}</span>))}
    </>
  );
}

function Chapter({ id, kanji, label, first, children }: { id: string; kanji: string; label: string; first?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className="chap" data-reveal>
      <div className="eyebrow" style={{ margin: first ? "0 0 8px" : "48px 0 8px" }}>
        <span className="kanji" aria-hidden="true">{kanji}</span>
        {label}
      </div>
      {children}
    </section>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = CASE_STUDIES[slug];
  if (!cs) notFound();

  const keys = Object.keys(CASE_STUDIES);
  const idx = keys.indexOf(slug);
  const prev = CASE_STUDIES[keys[(idx - 1 + keys.length) % keys.length]];
  const next = CASE_STUDIES[keys[(idx + 1) % keys.length]];
  const pnum = PROJECTS.find((p) => p.slug === slug)?.num ?? "00";
  const C = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

  return (
    <>
      <ReadingProgress />
      <header className="section-sm" style={{ paddingBottom: 56 }}>
        <div className="atmos" />
        <div className="wrap stack" style={{ gap: 28, position: "relative" }}>
          <Link className="link-arrow rise" href="/projects"><span className="arr" style={{ transform: "none" }}>←</span> All projects</Link>
          <Eyebrow kanji="作" className="rise">Case study · {pnum} / {String(PROJECTS.length).padStart(2, "0")}</Eyebrow>
          <h1 className="d-xl wipe" style={{ animationDelay: "100ms" }}>{cs.title}</h1>
          <p className="lead rise" style={{ maxWidth: 720, animationDelay: "260ms" }}>{cs.lead}</p>
          <div className="row stack-m rise" style={{ gap: 12, flexWrap: "wrap", animationDelay: "360ms" }}>
            {cs.site && <a className="btn btn-ghost" href={cs.site.href}>{cs.site.label} <External /></a>}
            {cs.repo.href && <a className="btn btn-quiet" href={cs.repo.href}>{cs.repo.label} ↗</a>}
          </div>
          <div className="meta" data-reveal>
            {cs.meta.map((m) => (
              <div key={m.label} className="stack" style={{ gap: 6 }}>
                <span className="label">{m.label}</span>
                {m.learning ? (
                  <span className="status s-learning"><span className="dot dot-learning" />{m.value}</span>
                ) : (
                  <span className="h4">{m.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap" data-reveal="scale">
        <Shot label={cs.hero} ratio="16-9" />
      </div>

      <section className="section-sm">
        <div className="wrap cs">
          <ChapterRail />
          <article className="prose" style={{ maxWidth: 760 }}>
            <Chapter id="challenge" kanji={C.challenge.kanji} label="Challenge" first>
              <h2 style={{ marginTop: 8 }}>{cs.challenge.title}</h2>
              <p><Inline text={cs.challenge.body} /></p>
            </Chapter>

            <Chapter id="approach" kanji={C.approach.kanji} label="Approach">
              <h2 style={{ marginTop: 8 }}>{cs.approach.title}</h2>
              <p><Inline text={cs.approach.body} /></p>
              {cs.approach.code && <CodeBlock {...cs.approach.code} />}
            </Chapter>

            <Chapter id="decisions" kanji={C.decisions.kanji} label="Key decisions">
              <h2 style={{ marginTop: 8 }}>Four calls that shaped it</h2>
              <div className="dec">
                {cs.decisions.map((d, i) => (
                  <div key={i} className="card stack" style={{ gap: 10, padding: 22, ["--d" as string]: `${i * 80}ms` }} data-reveal data-tilt>
                    <span className="label">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h4">{d.title}</span>
                    <span className="small">{d.body}</span>
                  </div>
                ))}
              </div>
            </Chapter>

            <Chapter id="outcome" kanji={C.outcome.kanji} label="Outcome">
              <h2 style={{ marginTop: 8 }}>{cs.outcome.title}</h2>
              {cs.outcome.stats && (
                <div className="stats">
                  {cs.outcome.stats.map((s) => (
                    <div key={s.label}>
                      <span className="stat">
                        <span data-count={s.value.replace("~", "")}>{s.value.replace("~", "")}</span>
                        {s.value.startsWith("~") ? "" : ""}
                        {s.unit && <span className="fg3" style={{ fontSize: 18 }}>{s.unit}</span>}
                      </span>
                      <span className="small">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="small" style={{ margin: 0 }}>{cs.outcome.note}</p>
            </Chapter>

            <Chapter id="lessons" kanji={C.lessons.kanji} label="Lessons">
              <h3 style={{ marginTop: 8 }}>The hardest problem</h3>
              <p>{cs.lessons.hardest}</p>
              {cs.lessons.quote && <blockquote>{cs.lessons.quote}</blockquote>}
              <p>{cs.lessons.body}</p>
            </Chapter>

            <Chapter id="next" kanji={C.next.kanji} label="Next steps">
              <p>{cs.next}</p>
            </Chapter>

            <Chapter id="tech" kanji={C.tech.kanji} label="Tech">
              <div className="tags">
                {cs.tech.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </Chapter>
          </article>
        </div>
      </section>

      <section className="section-sm" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap grid-2">
          <Link className="card stack" href={`/projects/${prev.slug}`} style={{ gap: 8, color: "inherit" }} data-tilt data-reveal="left">
            <span className="label">← Previous</span>
            <span className="h3">{prev.title}</span>
          </Link>
          <Link className="card stack" href={`/projects/${next.slug}`} style={{ gap: 8, color: "inherit", alignItems: "flex-end", textAlign: "right" }} data-tilt data-reveal="right">
            <span className="label">Next →</span>
            <span className="h3">{next.title}</span>
          </Link>
        </div>
      </section>
    </>
  );
}
