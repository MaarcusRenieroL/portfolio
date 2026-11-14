import type { Metadata } from "next";
import { ProjectsClient } from "~/components/site/projects-client";
import { PROJECTS } from "~/lib/content";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("projects", await langOf(params), "/projects");
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = DICT[await langOf(params)].projects;
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead(PROJECTS.length)}</p>
      </header>
      <ProjectsClient />
    </div>
  );
}
