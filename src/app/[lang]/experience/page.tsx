import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import Link from "next/link";
import { pageMeta } from "~/lib/seo";
import { localePath } from "~/lib/i18n";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { getSiteContent } from "~/lib/site-content";
import { ExperienceTimeline } from "~/components/site/experience-timeline";
import { SkillUsageProvider } from "~/components/skills/skill-usage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("experience", await langOf(params), "/experience");
}

export default async function ExperiencePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang].experience;
  const { roles, education, projects } = await getSiteContent(lang);
  const usage = {
    roles: roles.map((r) => ({ org: r.org, title: r.title, date: r.date, tags: r.tags })),
    projects: projects.map((p) => ({ name: p.name, slug: p.slug, kind: p.kind, skills: p.skills })),
  };

  return (
    <div className="wrap page">
      <Crumb params={params} k="experience" />
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <Link className="action" href={localePath(lang, "/resume")}>
          {DICT[lang].nav.resume}
        </Link>
      </header>

      <SkillUsageProvider data={usage}>
        <ExperienceTimeline roles={roles} lang={lang} />
      </SkillUsageProvider>

      <section className="section" aria-labelledby="edu-h">
        <h2 id="edu-h" className="h2">{t.education}</h2>
        <div>
          {education.map((e) => {
            const schoolUrl = e.url;
            return (
              <div className="skillrow" key={e.school}>
                <span>{e.date}</span>
                <span className="stack" style={{ gap: 2 }}>
                  <span>{schoolUrl ? <a className="orglink" href={schoolUrl} target="_blank" rel="noopener noreferrer">{e.school} ↗</a> : e.school}</span>
                  <span className="muted small">
                    {e.degree}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
