import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import { SkillsClient } from "~/components/site/skills-client";
import { SkillUsageProvider } from "~/components/skills/skill-usage";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";
import { getSiteContent } from "~/lib/site-content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("skills", await langOf(params), "/skills");
}

export default async function SkillsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].skills;
  const { skills, roles, projects } = await getSiteContent(lang);
  const usage = {
    roles: roles.map((r) => ({ org: r.org, title: r.title, date: r.date, tags: r.tags })),
    projects: projects.map((p) => ({ name: p.name, slug: p.slug, kind: p.kind, skills: p.skills })),
  };
  return (
    <div className="wrap page">
      <Crumb params={params} k="skills" />
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>

      <SkillUsageProvider data={usage}>
        <SkillsClient groups={skills} />
      </SkillUsageProvider>
    </div>
  );
}
