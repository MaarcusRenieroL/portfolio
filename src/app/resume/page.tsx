import type { Metadata } from "next";
import { UPDATED } from "~/lib/content";

export const metadata: Metadata = { title: "Resume", description: "Resume: Java/Spring Boot, TypeScript/Next.js, healthcare ETL at HealthEdge." };

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ResumePage() {
  const pdf = `${base}/resume.pdf`;

  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Resume</h1>
        <div className="row" style={{ gap: "8px 12px" }}>
          <a className="action" href={`${base}/api/resume`} download>
            Download PDF
          </a>
          <a className="action" href={pdf} target="_blank" rel="noopener">
            Open in new tab ↗
          </a>
        </div>
        <p className="help">Last updated {UPDATED}</p>
      </header>

      <object className="pdf" data={`${pdf}#toolbar=0&navpanes=0`} type="application/pdf" aria-label="Resume PDF">
        <p className="muted">
          Your browser can&apos;t show PDFs here. <a className="link" href={pdf}>Open the resume</a> instead.
        </p>
      </object>
    </div>
  );
}
