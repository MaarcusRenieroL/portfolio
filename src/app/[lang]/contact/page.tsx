import type { Metadata } from "next";
import { pageMeta } from "~/lib/seo";
import { ContactForm } from "~/components/site/contact-form";
import { SITE } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("contact", await langOf(params), "/contact");
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = DICT[await langOf(params)].contact;
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <p className="muted">{t.open}</p>
      </header>

      <div className="row" style={{ gap: "8px 12px" }}>
        {/* A file download, not a page: a plain anchor is right here. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="action" href="/api/vcard" data-track="vcard-download">
          {t.card}
        </a>
        {SITE.call && (
          <a className="action" href={SITE.call} rel="noopener noreferrer" data-track="book-call">
            {t.call}
          </a>
        )}
      </div>

      <dl className="facts">
        <div>
          <dt>{t.email}</dt>
          <dd>
            <a className="link" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            <a className="link" href={SITE.linkedin} rel="noopener noreferrer">
              maarcus-reniero-l
            </a>
          </dd>
        </div>
        <div>
          <dt>GitHub</dt>
          <dd>
            <a className="link" href={SITE.github} rel="noopener noreferrer">
              MaarcusRenieroL
            </a>
          </dd>
        </div>
      </dl>

      <ContactForm />
    </div>
  );
}
