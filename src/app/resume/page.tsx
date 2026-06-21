import { Download, ExternalLink, FileText } from "lucide-react";
import { SectionHeading } from "~/components/misc/section-heading";
import { Card } from "~/components/ui/card";

const resumeSummary = [
  ["role", "developer 1 - software engineering"],
  ["base", "chennai, india"],
  ["focus", "full-stack product engineering"],
  ["current stack", "angular, java, spring boot, mysql, aws"],
];

export default function ResumePage() {
  const resumeUrl = "/resume.pdf";
  const downloadUrl = "/api/resume";

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          index="07"
          eyebrow="career snapshot"
          title="resume"
          description="a downloadable pdf version of my experience, projects, and technical skills."
        />

        <div className="flex gap-2">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/45 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <ExternalLink className="size-4" />
            open
          </a>

          <a
            href={downloadUrl}
            download="maarcus-reniero-resume.pdf"
            className="inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-4" />
            download
          </a>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {resumeSummary.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-semibold text-primary">{label}</p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">{value}</p>
          </Card>
        ))}
      </section>

      <section className="overflow-hidden border border-border/60 bg-card/35">
        <div className="flex items-center justify-between border-b border-border/60 bg-background/45 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">maarcus-reniero-resume.pdf</p>
          </div>

          <span className="hidden text-xs text-muted-foreground sm:block">
            pdf
          </span>
        </div>

        <div className="bg-card/25 p-2 sm:p-3">
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
              open the resume in your pdf viewer for the best experience on
              mobile.
            </p>
            <div className="flex gap-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/45 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <ExternalLink className="size-4" />
                open
              </a>
              <a
                href={downloadUrl}
                download="maarcus-reniero-resume.pdf"
                className="inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download className="size-4" />
                download
              </a>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
