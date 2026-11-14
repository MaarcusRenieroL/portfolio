import Link from "next/link";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "~/components/site/icons";
import { Pic, Portrait } from "~/components/site/media";
import { ProjectIcon } from "~/components/site/project-icon";
import { MEDIA, SITE } from "~/lib/content";
import { getPosts } from "~/lib/data/blog";
import { DICT } from "~/lib/dict";
import { localePath } from "~/lib/i18n";
import { langOf } from "~/lib/lang";
import { getSiteContent } from "~/lib/site-content";
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
  const posts = getPosts().filter((p) => p.featured).slice(0, 3);
  const jobs = [roles.find((r) => r.now) ?? roles[0], roles.find((r) => !r.now)!];
  const href = (h: string) => localePath(lang, h);

  const socials = [
    { href: SITE.github, label: "GitHub", Icon: GithubIcon, ext: true },
    { href: SITE.linkedin, label: "LinkedIn", Icon: LinkedinIcon, ext: true },
    { href: `mailto:${SITE.email}`, label: t.chrome.email, Icon: MailIcon, ext: true },
    { href: href("/resume"), label: t.chrome.resume, Icon: FileIcon, ext: false },
  ];

  return (
    <div className="wrap page">
      <section className="hero">
        <div className="id">
          <Portrait className="avatar" src={MEDIA.photo} alt="Maarcus Reniero L" />
          <span className="status">
            <span className="dot" aria-hidden="true" />
            {t.home.open}
          </span>
        </div>
        <h1 className="hero-title">
          {t.home.title}
          <span className="hl">{t.home.hl}</span>
        </h1>
        <p className="lead">{t.home.lead(SITE.location)}</p>
        <div className="socials">
          {socials.map(({ href, label, Icon, ext }) =>
            ext ? (
              <a key={label} href={href} aria-label={label} rel="noopener noreferrer">
                <Icon />
              </a>
            ) : (
              <Link key={label} href={href} aria-label={label} data-track="resume-open">
                <Icon />
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="about-h">
        <h2 id="about-h" className="h2">{t.home.aboutH}</h2>
        <p className="lead">
          {t.home.about}{" "}
          <Link className="link" href={href("/about")}>{t.home.more}</Link>.
        </p>
      </section>

      <section className="section" aria-labelledby="proj-h">
        <h2 id="proj-h" className="h2">{t.home.projectsH}</h2>
        <div className="strip" aria-label={t.home.featured}>
          {projects.filter((p) => p.featured).map((p) => (
            <a key={p.slug} className="shot" href={p.site ?? p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name}, ${p.kind}`} data-track="project-click" data-track-label={p.slug}>
              <span className="media">
                <Pic src={MEDIA.shot(p.slug)} alt={`${p.name} screenshot`} fallback={<ProjectIcon slug={p.slug} />} />
              </span>
              <span className="cap">
                <strong>{p.name}</strong>
                <span>{p.kind}</span>
              </span>
            </a>
          ))}
        </div>
        <Link className="action" href={href("/projects")}>{t.home.allProjects}</Link>
      </section>

      <section className="section" aria-labelledby="work-h">
        <h2 id="work-h" className="h2">{t.home.experienceH}</h2>
        <div className="leaders">
          {jobs.map((r, i) => (
            <div className="job" key={r.org}>
              <Pic className={MEDIA.logoClass(r.org)} src={MEDIA.logos[r.org] ?? ""} alt="" fallback={initials(r.org)} />
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
        <Link className="action" href={href("/experience")}>{t.home.allExperience}</Link>
      </section>

      {posts.length > 0 && (
        <section className="section" aria-labelledby="blog-h">
          <h2 id="blog-h" className="h2">Featured writing</h2>
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
          <div className="contact-links">
            <a className="action" href={SITE.linkedin} rel="noopener noreferrer">LinkedIn</a>
            <a className="action" href={SITE.github} rel="noopener noreferrer">GitHub</a>
            <Link className="action" href={href("/contact")}>{t.home.send}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
