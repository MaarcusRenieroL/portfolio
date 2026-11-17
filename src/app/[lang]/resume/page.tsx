import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import { pageMeta } from "~/lib/seo";
import { PrintButton } from "~/components/site/print-button";
import { ResumePrint } from "~/components/site/resume-print";
import { UPDATED } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { getSiteContent } from "~/lib/site-content";
import { getSiteSettings } from "~/lib/server/settings";
import { assetUrl } from "~/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("resume", await langOf(params), "/resume");
}


const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default async function ResumePage({ params }: { params: Promise<{ lang: string }> }) {
  const t = DICT[await langOf(params)].resume;
  // A résumé uploaded in the CMS (site settings) wins over the file in /public.
  const settings = await getSiteSettings();
  const pdf = settings.resume ? (settings.resume.startsWith("/") ? `${base}${settings.resume}` : settings.resume) : assetUrl("files", "resume.pdf");
  // The printable resume is English-only, like the PDF.
  const content = await getSiteContent("en");

  return (
    <div className="wrap page">
      <Crumb params={params} k="resume" />
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <div className="row" style={{ gap: "8px 12px" }}>
          <a className="action" href={`${base}/api/resume`} download data-track="resume-download">
            {t.download}
          </a>
          <a className="action" href={pdf} target="_blank" rel="noopener" data-track="resume-open">
            {t.open}
          </a>
          <PrintButton />
        </div>
        <p className="help">{t.updated(UPDATED)}</p>
      </header>

      <object className="pdf" data={`${pdf}#toolbar=0&navpanes=0`} type="application/pdf" aria-label={t.pdfAria}>
        <p className="muted">
          {t.fallback} <a className="link" href={pdf}>{t.fallbackLink}</a> {t.fallbackEnd}
        </p>
      </object>

      <ResumePrint content={content} />
    </div>
  );
}
