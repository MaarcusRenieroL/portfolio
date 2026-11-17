import { Toc } from "~/components/site/toc";
import { DICT } from "~/lib/dict";
import type { Lang } from "~/lib/i18n";
import { LEGAL_DOCS, type LegalKind } from "~/lib/legal";

/** Privacy policy and legal notice: one reading column, sections with anchors, "On this page" on wide screens. */
export function LegalPage({ kind, lang }: { kind: LegalKind; lang: Lang }) {
  const doc = LEGAL_DOCS[kind][lang];
  const t = DICT[lang].chrome;
  return (
    <article className="wrap page">
      <header className="stack g24">
        <h1 className="title col">{doc.title}</h1>
        <p className="lead">{doc.lead}</p>
        <p className="muted small">
          {t.legalUpdated}{" "}
          <time dateTime={doc.updated}>{new Date(doc.updated).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time>
        </p>
      </header>
      <div className="article-grid">
        <div className="prose">
          {doc.sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id}>{s.h}</h2>
              {s.p.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((li) => (
                    <li key={li.slice(0, 40)}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <Toc headings={doc.sections.map((s) => ({ id: s.id, text: s.h, level: 2 as const }))} label={DICT[lang].blog.onThisPage} />
      </div>
    </article>
  );
}
