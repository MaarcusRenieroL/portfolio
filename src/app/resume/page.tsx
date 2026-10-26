import { Download, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "~/components/misc/section-heading";

export default function ResumePage() {
  const resumeUrl = "/resume.pdf";
  const downloadUrl = "/api/resume";

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          index="08"
          eyebrow="career snapshot"
          title="resume"
          description="a downloadable pdf version of my experience, projects, and technical skills."
        />

        <div className="flex gap-2">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/50 px-4 font-mono text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <ExternalLink className="size-3.5" />
            view in tab
          </a>

          <a
            href={downloadUrl}
            download="maarcus-reniero-resume.pdf"
            className="inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-3.5" />
            download pdf
          </a>
        </div>
      </div>

      <section className="relative overflow-hidden border border-border/60 bg-card/35">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        <div className="flex items-center justify-between border-b border-border/60 bg-background/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <p className="font-mono text-xs font-semibold text-foreground">
              maarcus-reniero-resume.pdf
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
            <span>ready</span>
          </div>
        </div>

        <div className="bg-card/25 p-2 sm:p-4">
          {/* embedded pdf preview is reliable on larger screens only */}
          <div className="hidden overflow-hidden border border-border/60 bg-background sm:block">
            <iframe
              src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="h-[82vh] w-full bg-background"
              title="maarcus reniero resume pdf"
            />
          </div>

          {/* mobile: inline pdf rendering is unreliable, so offer clear actions */}
          <div className="flex flex-col items-center gap-4 border border-border/60 bg-background/45 p-8 text-center sm:hidden">
            <FileText className="size-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              open the resume in your pdf viewer for the best experience on mobile.
            </p>
            <div className="flex gap-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/45 px-4 text-xs font-mono uppercase tracking-wider font-semibold transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <ExternalLink className="size-3.5" />
                open
              </a>
              <a
                href={downloadUrl}
                download="maarcus-reniero-resume.pdf"
                className="inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 text-xs font-mono uppercase tracking-wider font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download className="size-3.5" />
                download
              </a>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
