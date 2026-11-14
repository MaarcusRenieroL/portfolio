import type { Metadata } from "next";
import { CertificatesClient } from "~/components/site/certificates-client";
import { CERTIFICATES } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("certifications", await langOf(params), "/certifications");
}

export default async function CertificationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = DICT[await langOf(params)].certs;
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead(CERTIFICATES.length)}</p>
      </header>
      <CertificatesClient />
    </div>
  );
}
