import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import { ProjectsClient } from "~/components/site/projects-client";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";
import { getSiteContent } from "~/lib/site-content";
import { getGitHubRepos } from "~/lib/server/github-repos";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("projects", await langOf(params), "/projects");
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].projects;
  const [{ projects }, github] = await Promise.all([getSiteContent(lang), getGitHubRepos()]);
  return (
    <div className="wrap page">
      <Crumb params={params} k="projects" />
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead(projects.length)}</p>
      </header>
      <ProjectsClient projects={projects} github={github} />
    </div>
  );
}
