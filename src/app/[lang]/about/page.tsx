import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import Link from "next/link";
import { Portrait } from "~/components/site/media";
import { DICT } from "~/lib/dict";
import { localePath } from "~/lib/i18n";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";
import { getSiteSettings, photoSrc } from "~/lib/server/settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("about", await langOf(params), "/about");
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].about;
  const settings = await getSiteSettings();
  const href = (h: string) => localePath(lang, h);

  return (
    <div className="wrap page">
      <Crumb params={params} k="about" />
      <header className="stack g24">
        <h1 className="title col">{t.title}</h1>
      </header>

      <div className="about-hero">
        <div className="prose about-prose">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>{t.p3}</p>
          <p>
            <Link href={href("/resume")}>{DICT[lang].nav.resume}</Link> · <Link href={href("/experience")}>{DICT[lang].nav.experience}</Link> · <Link href={href("/contact")}>{t.getInTouch}</Link>
          </p>
        </div>

        <figure className="portrait about-portrait">
          <Portrait src={photoSrc(settings)} alt={t.photoAlt} sizes="(min-width: 760px) 280px, 60vw" />
        </figure>
      </div>

      <section className="stack g24">
        <h2 className="h2">{t.headedH}</h2>
        <div className="prose">
          <p>{t.h1}</p>
          <p>
            {t.h2a}
            <strong>{t.h2b}</strong>
            {t.h2c}
            <strong>{t.h2d}</strong>
            {t.h2e}
          </p>
        </div>
      </section>

      <section className="stack g24">
        <h2 className="h2">{t.langsH}</h2>
        <dl className="list">
          {t.langs.map(([n, l]) => (
            <div className="item" key={n}>
              <dt className="item-title">{n}</dt>
              <dd className="muted">{l}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
