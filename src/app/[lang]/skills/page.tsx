import type { Metadata } from "next";
import { SkillsClient } from "~/components/site/skills-client";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("skills", await langOf(params), "/skills");
}

export default async function SkillsPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = DICT[await langOf(params)].skills;
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>

      <SkillsClient />
    </div>
  );
}
