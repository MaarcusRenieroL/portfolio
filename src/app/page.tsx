import Link from "next/link";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "~/components/site/icons";
import { Pic } from "~/components/site/media";
import { ProjectIcon } from "~/components/site/project-icon";
import { MEDIA, PROJECTS, ROLES, SITE } from "~/lib/content";
import { getPosts } from "~/lib/data/blog";
import { formatShortDate } from "~/lib/utils/date";

const SOCIALS = [
  { href: SITE.github, label: "GitHub", Icon: GithubIcon, ext: true },
  { href: SITE.linkedin, label: "LinkedIn", Icon: LinkedinIcon, ext: true },
  { href: `mailto:${SITE.email}`, label: "Email", Icon: MailIcon, ext: false },
  { href: "/resume", label: "Resume", Icon: FileIcon, ext: false },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Home() {
  const posts = getPosts().filter((p) => p.featured).slice(0, 3);
  const jobs = [ROLES.find((r) => r.now) ?? ROLES[0], ROLES.find((r) => !r.now)!];

  return (
    <div className="wrap page">
      <section className="hero">
        <div className="id">
          <Pic className="avatar" src={MEDIA.photo} alt="Maarcus Reniero L" fallback="ML" />
          <span className="status">
            <span className="dot" aria-hidden="true" />
            Open to work
          </span>
        </div>
        <h1 className="hero-title">Full stack engineer, <span className="hl">backend-leaning.</span></h1>
        <p className="lead">I build healthcare data services by day and my own tools by night. Based in {SITE.location}.</p>
        <div className="socials">
          {SOCIALS.map(({ href, label, Icon, ext }) =>
            ext ? (
              <a key={label} href={href} aria-label={label} rel="noopener noreferrer">
                <Icon />
              </a>
            ) : (
              <Link key={label} href={href} aria-label={label}>
                <Icon />
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="about-h">
        <h2 id="about-h" className="h2">About</h2>
        <p className="lead">
          Right now I&apos;m a developer at HealthEdge in Chennai, building the Spring Boot and Spring Batch services that move healthcare transactions. After hours I build what I wish existed: Nyx, a launcher, Life OS, a personal OS, and Zentro, a workspace for small companies. I started in hardware and networking, which is why I like knowing how the whole thing connects. I&apos;m looking for a full-time remote or hybrid role in Germany, Bangalore or Chennai.{" "}
          <Link className="link" href="/about">More about me</Link>.
        </p>
      </section>

      <section className="section" aria-labelledby="proj-h">
        <h2 id="proj-h" className="h2">Projects</h2>
      <div className="strip" aria-label="Featured projects">
        {PROJECTS.filter((p) => p.featured).map((p) => (
          <Link key={p.slug} className="shot" href={`/projects/${p.slug}`}>
            <span className="media">
              <Pic src={MEDIA.shot(p.slug)} alt={`${p.name} screenshot`} fallback={<ProjectIcon slug={p.slug} />} />
            </span>
            <span className="cap">
              <strong>{p.name}</strong>
              <span>{p.kind}</span>
            </span>
          </Link>
        ))}
      </div>
        <Link className="action" href="/projects">All projects</Link>
      </section>

      <section className="section" aria-labelledby="work-h">
        <h2 id="work-h" className="h2">Experience</h2>
        <div className="leaders">
          {jobs.map((r, i) => (
            <div className="job" key={r.org}>
              <Pic className="logo" src={MEDIA.logos[r.org] ?? ""} alt="" fallback={initials(r.org)} />
              <div className="stack">
                <span className="item-title">
                  {r.url ? <a className="orglink" href={r.url} target="_blank" rel="noopener noreferrer">{r.org} ↗</a> : r.org}
                </span>
                <span className="muted small">{i === 0 ? "Current" : "Previous"} · {r.title}</span>
              </div>
              <span className="when">{r.date}</span>
            </div>
          ))}
        </div>
        <Link className="action" href="/experience">All experience and skills</Link>
      </section>

      {posts.length > 0 && (
        <section className="section" aria-labelledby="blog-h">
          <h2 id="blog-h" className="h2">Featured writing</h2>
          <div className="leaders">
            {posts.map((p) => (
              <Link key={p.slug} className="leader" href={`/blog/${p.slug}`}>
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
        <h2 id="cta-h" className="h2">Contact</h2>
        <div className="contact-block">
          <p className="lead">{SITE.open}</p>
          <a className="contact-mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <div className="contact-links">
            <a className="action" href={SITE.linkedin} rel="noopener noreferrer">LinkedIn</a>
            <a className="action" href={SITE.github} rel="noopener noreferrer">GitHub</a>
            <Link className="action" href="/contact">Send a message</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
