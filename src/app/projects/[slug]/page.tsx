import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pic } from "~/components/site/media";
import { CASE_STUDIES, MEDIA, SITE, shotUrl } from "~/lib/content";

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

/** A stat value; plain numbers count up when scrolled into view (see Life). */
function Count({ value }: { value: string }) {
  const m = /^(~?)(\d+(?:\.(\d+))?)$/.exec(value);
  if (!m || Number(m[2]) === 0) return <>{value}</>;
  return (
    <span data-count={m[2]} data-decimals={m[3]?.length ?? 0} data-prefix={m[1]}>
      {value}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="stack g16">
      <h2 className="h2">{title}</h2>
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Projects", item: `${SITE.url}/projects` },
      { "@type": "ListItem", position: 2, name: cs.title, item: `${SITE.url}/projects/${cs.slug}` },
    ],
  };

  return (
    <article className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="stack g24">
        <Link className="back" href="/projects">
          ← Projects
        </Link>
        <h1 className="title">{cs.title}</h1>
        <p className="lead">{cs.lead}</p>
        <div className="row" style={{ gap: "8px 28px" }}>
          {cs.site && (
            <a className="action" href={cs.site.href} rel="noopener noreferrer">
              {cs.site.label} ↗
            </a>
          )}
          {cs.repo.href && (
            <a className="action" href={cs.repo.href} rel="noopener noreferrer">
              {cs.repo.label} ↗
            </a>
          )}
        </div>
        <dl className="facts" style={{ marginTop: 16 }}>
          {cs.meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <Pic className="hero-shot" src={MEDIA.shot(cs.slug)} alt={`${cs.title} screenshot`} fallback={<span className="placeholder">{cs.hero}</span>} />

      <div className="stack g40 col">
        <Section title={cs.challenge.title}>
          <p className="muted">
            <Inline text={cs.challenge.body} />
          </p>
        </Section>

        <Section title={cs.approach.title}>
          <p className="muted">
            <Inline text={cs.approach.body} />
          </p>
          {cs.approach.code && (
            <div className="prose">
              <pre>
                <code>{cs.approach.code.lines.join("\n")}</code>
              </pre>
              <span className="help">{cs.approach.code.file}</span>
            </div>
          )}
        </Section>

        <Section title="Key decisions">
          <ol className="stack g24">
            {cs.decisions.map((d) => (
              <li key={d.title} className="stack" style={{ gap: 4 }}>
                <span className="item-title">{d.title}</span>
                <span className="muted"><Inline text={d.body} /></span>
              </li>
            ))}
          </ol>
        </Section>

        {cs.sections?.map((s) => (
          <Section key={s.title} title={s.title}>
            <p className="muted">
              <Inline text={s.body} />
            </p>
          </Section>
        ))}

        <Section title={cs.outcome.title}>
          {cs.outcome.stats && (
            <dl className="stats">
              {cs.outcome.stats.map((s) => (
                <div key={s.label}>
                  <dt>
                    <Count value={s.value} />
                    {s.unit && <span className="faint" style={{ fontSize: "0.55em", fontWeight: 400 }}>{s.unit}</span>}
                  </dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="help">{cs.outcome.note}</p>
        </Section>

        <Section title="What I learned">
          <p className="muted">{cs.lessons.hardest}</p>
          {cs.lessons.quote && <blockquote className="prose">{cs.lessons.quote}</blockquote>}
          <p className="muted">{cs.lessons.body}</p>
        </Section>

        <Section title="Next">
          <p className="muted">{cs.next}</p>
        </Section>

        <div className="tags">
          {cs.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      {(cs.shots.length > 0 || cs.video) && (
        <section className="stack g24" aria-labelledby="shots-h">
          <h2 id="shots-h" className="h2">
            Screenshots
          </h2>
          {cs.video && (
            <figure className="shot-fig">
              <video className="shot-img" src={shotUrl(cs.slug, cs.video.file)} controls muted loop playsInline preload="metadata" />
              <figcaption>{cs.video.caption}</figcaption>
            </figure>
          )}
          {cs.shots.filter((s) => s.file !== cs.cover).map((s) => (
            <figure key={s.file} className={s.mobile ? "shot-fig has-mobile" : "shot-fig"}>
              <div className="shot-pair">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="shot-img" src={shotUrl(cs.slug, s.file)} alt={s.alt} decoding="async" />
                {s.mobile && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="shot-img shot-mobile" src={shotUrl(cs.slug, s.mobile)} alt={`${s.alt}, mobile`} decoding="async" />
                )}
              </div>
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}

      <nav className="pager" aria-label="More case studies">
        <Link href={`/projects/${prev.slug}`}>
          <small>← Previous</small>
          <strong>{prev.title}</strong>
        </Link>
        <Link href={`/projects/${next.slug}`}>
          <small>Next →</small>
          <strong>{next.title}</strong>
        </Link>
      </nav>
    </article>
  );
}
