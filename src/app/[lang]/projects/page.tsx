import type { Metadata } from "next";
import { ProjectsClient } from "~/components/site/projects-client";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";
import { getSiteContent } from "~/lib/site-content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("projects", await langOf(params), "/projects");
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].projects;
  const { projects } = await getSiteContent(lang);
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead(projects.length)}</p>
      </header>
      <ProjectsClient projects={projects} />
    </div>
  );
}
