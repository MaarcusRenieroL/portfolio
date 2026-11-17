import Link from "next/link";
import {
  AnimatedGithubIcon,
  AnimatedLinkedinIcon,
  AnimatedMailIcon,
} from "~/components/site/animated-icons";
import { HeroPresence } from "~/components/presence/hero-presence";
import { ContributionHeatmap } from "~/components/github/contribution-heatmap";
import {
  AnimatedSocial,
  AnimatedActionLink,
  AnimatedContactButtons,
} from "~/components/site/motion-actions";
import { Pic, Portrait } from "~/components/site/media";
import { ProjectIcon } from "~/components/site/project-icon";
import { SITE, logoUrl, shotUrl } from "~/lib/content";
import { getPostList } from "~/lib/posts";
import { DICT } from "~/lib/dict";
import { localePath } from "~/lib/i18n";
import { langOf } from "~/lib/lang";
import { getSiteContent } from "~/lib/site-content";
import { getContributions } from "~/lib/server/github";
import { getSiteSettings, photoSrc } from "~/lib/server/settings";
import { formatShortDate } from "~/lib/utils/date";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langOf(params);
  const t = DICT[lang];
  const { projects, roles } = await getSiteContent(lang);
  const posts = (await getPostList("post", lang)).filter((p) => p.featured).slice(0, 3);
  const [contributions, settings] = await Promise.all([getContributions(), getSiteSettings()]);
  const jobs = [roles.find((r) => r.now) ?? roles[0], roles.find((r) => !r.now)!];
  const href = (h: string) => localePath(lang, h);

  const socials = [
    { href: SITE.github, label: "GitHub", Icon: AnimatedGithubIcon, ext: true, theme: "github" as const },
    { href: SITE.linkedin, label: "LinkedIn", Icon: AnimatedLinkedinIcon, ext: true, theme: "linkedin" as const },
    { href: `mailto:${SITE.email}`, label: t.chrome.email, Icon: AnimatedMailIcon, ext: true, theme: "email" as const },
  ];

  return (
    <div className="wrap page">
      <section className="hero">
        <div className="id">
          <Portrait className="avatar" src={photoSrc(settings)} alt={SITE.name} sizes="52px" priority />
          {settings.available && (
            <span className="status">
              <span className="dot" aria-hidden="true" />
              {settings.availableLabel[lang]}
            </span>
          )}
        </div>
        <h1 className="hero-title">
          {settings.heroTitle[lang]}{" "}
          <span className="hl">{settings.heroHighlight[lang]}</span>
        </h1>
        <p className="lead">{settings.heroLead[lang]}</p>
        <div className="hero-tools">
          <div className="socials">
            {socials.map(({ href, label, Icon, ext, theme }) => (
              <AnimatedSocial
                key={label}
                href={href}
                label={label}
                ext={ext}
                theme={theme}
              >
                <Icon />
              </AnimatedSocial>
            ))}
          </div>
          <HeroPresence />
        </div>
      </section>

      <section className="section" aria-labelledby="about-h">
        <h2 id="about-h" className="h2">{t.home.aboutH}</h2>
        <p className="lead">
          {settings.homeAbout[lang]}{" "}
          <Link className="link" href={href("/about")}>{t.home.more}</Link>.
        </p>
      </section>

      {contributions && (
        <section className="section" aria-labelledby="activity-h">
          <h2 id="activity-h" className="h2">{t.home.activityH}</h2>
          <ContributionHeatmap data={contributions} />
        </section>
      )}

      <section className="section" aria-labelledby="proj-h">
        <h2 id="proj-h" className="h2">{t.home.projectsH}</h2>
        <div className="strip" aria-label={t.home.featured}>
          {projects.filter((p) => p.featured).map((p) => (
            <a key={p.slug} className="shot" href={p.site ?? p.github} target="_blank" rel="noopener noreferrer" data-track="project-click" data-track-label={p.slug}>
              <span className="media">
                <Pic src={p.cover ? shotUrl(p.slug, p.cover) : ""} alt="" sizes="(min-width: 880px) 420px, calc(100vw - 40px)" fallback={<ProjectIcon slug={p.slug} />} />
              </span>
              <span className="cap">
                <strong>{p.name}</strong>
                <span>{p.kind}</span>
              </span>
            </a>
          ))}
        </div>
        <AnimatedActionLink href={href("/projects")}>
          {t.home.allProjects}
        </AnimatedActionLink>
      </section>

      <section className="section" aria-labelledby="work-h">
        <h2 id="work-h" className="h2">{t.home.experienceH}</h2>
        <div className="leaders">
          {jobs.map((r, i) => (
            <div className="job" key={r.org}>
              <Pic className={r.logoOn === "dark" ? "logo logo-dark" : "logo"} src={r.logo ? logoUrl(r.logo) : ""} alt="" fallback={initials(r.org)} />
              <div className="stack">
                <span className="item-title">
                  {r.url ? <a className="orglink" href={r.url} target="_blank" rel="noopener noreferrer">{r.org} ↗</a> : r.org}
                </span>
                <span className="muted small">{i === 0 ? t.home.current : t.home.previous} · {r.title}</span>
              </div>
              <span className="when">{r.date}</span>
            </div>
          ))}
        </div>
        <AnimatedActionLink href={href("/experience")}>
          {t.home.allExperience}
        </AnimatedActionLink>
      </section>

      {posts.length > 0 && (
        <section className="section" aria-labelledby="blog-h">
          <h2 id="blog-h" className="h2">{t.home.writingH}</h2>
          <div className="leaders">
            {posts.map((p) => (
              <Link key={p.slug} className="leader" href={href(`/blog/${p.slug}`)}>
                <span className="name">{p.title}</span>
                <span className="fill" aria-hidden="true" />
                <span className="when">{formatShortDate(p.date)}</span>
                <span className="desc">{p.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="cta-h">
        <h2 id="cta-h" className="h2">{t.home.contactH}</h2>
        <div className="contact-block">
          <p className="lead">{t.contact.open}</p>
          <a className="contact-mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <AnimatedContactButtons
            linkedin={SITE.linkedin}
            github={SITE.github}
            sendHref={href("/contact")}
            sendLabel={t.home.send}
          />
        </div>
      </section>
    </div>
  );
}
