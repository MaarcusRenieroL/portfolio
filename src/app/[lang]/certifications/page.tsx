import type { Metadata } from "next";
import { CertificatesClient } from "~/components/site/certificates-client";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";
import { getSiteContent } from "~/lib/site-content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("certifications", await langOf(params), "/certifications");
}

export default async function CertificationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].certs;
  const { certificates } = await getSiteContent(lang);
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead(certificates.length)}</p>
      </header>
      <CertificatesClient items={certificates} />
    </div>
  );
}
