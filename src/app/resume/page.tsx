"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "~/components/misc/section-heading";

export default function ResumePage() {
  const resumeUrl = "/resume.pdf";
  const downloadUrl = "/api/resume";

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          index="04"
          eyebrow="Career Snapshot"
          title="resume"
          description="a downloadable pdf version of my experience, projects, and technical skills."
        />

        <div className="flex gap-2">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium transition hover:bg-muted"
          >
            <ExternalLink className="size-4" />
            open
          </a>

          <a
            href={downloadUrl}
            download="maarcus-reniero-resume.pdf"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Download className="size-4" />
            download
          </a>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">maarcus-reniero-resume.pdf</p>
          </div>

          <span className="hidden text-xs text-muted-foreground sm:block">
            PDF
          </span>
        </div>

        <div className="bg-muted/30 p-2 sm:p-3">
          <div className="overflow-hidden rounded-2xl border bg-background">
            <iframe
              src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="h-[82vh] w-full bg-background"
              title="Maarcus Reniero Resume PDF"
            />
          </div>
        </div>
      </section>
    </section>
  );
}
