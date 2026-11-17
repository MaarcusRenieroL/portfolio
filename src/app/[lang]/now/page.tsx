import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { getSiteSettings } from "~/lib/server/settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = DICT[await langOf(params)].now;
  return { title: t.title, description: t.lead, alternates: { canonical: "/now" } };
}

/** /now: written in the CMS (Site settings → Now page). Without text there is no page. */
export default async function NowPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].now;
  const { now, nowUpdated } = await getSiteSettings();
  const body = (now[lang] || now.en).trim();
  if (!body) notFound();

  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title col">{t.title}</h1>
        <p className="lead">{t.lead}</p>
        {nowUpdated && (
          <p className="muted small">
            {t.updated}{" "}
            <time dateTime={nowUpdated}>
              {new Date(nowUpdated).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}
            </time>
          </p>
        )}
      </header>
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
      <p className="help">
        <a className="link" href="https://nownownow.com/about" rel="noopener noreferrer">
          {t.about}
        </a>
      </p>
    </div>
  );
}
