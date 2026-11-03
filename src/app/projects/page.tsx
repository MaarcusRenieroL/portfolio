import type { Metadata } from "next";
import { ProjectGrid } from "~/components/site/project-grid";
import { PageHeader } from "~/components/site/ui";
import { PROJECTS } from "~/lib/content";

export const metadata: Metadata = { title: "Projects", description: "A multi-tenant SaaS, a self-hosted personal OS, a launcher, a CLI and more." };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        kanji="作"
        eyebrow={`Projects · ${PROJECTS.length}`}
        title="Projects"
        lead="Each one exists because I wanted to understand something end to end: a multi-tenant SaaS, a self-hosted personal OS, a launcher, a CLI."
      />
      <ProjectGrid />
    </>
  );
}
