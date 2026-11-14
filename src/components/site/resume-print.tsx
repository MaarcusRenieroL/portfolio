import { SITE } from "~/lib/content";
import type { SiteContent } from "~/lib/site-content";

/**
 * A plain-HTML resume built from the site's own data. Hidden on screen (the PDF
 * viewer is shown there) and the only thing that prints on /resume, so Ctrl/⌘ P
 * gives a clean page instead of a screenshot of a PDF frame.
 */
export function ResumePrint({ content }: { content: SiteContent }) {
  const { roles: ROLES, projects: PROJECTS, skills, education: EDUCATION, certificates: CERTIFICATES } = content;
  return (
    <article className="resume-print" aria-hidden="true">
      <header>
        <h1>{SITE.name}</h1>
        <p>
          Full stack engineer · {SITE.location} · {SITE.email} · {SITE.url.replace(/^https?:\/\//, "")}
        </p>
        <p>
          {SITE.github.replace(/^https?:\/\//, "")} · {SITE.linkedin.replace(/^https?:\/\//, "")}
        </p>
      </header>

      <section>
        <h2>Experience</h2>
        {ROLES.map((r) => (
          <div key={r.org} className="rp-item">
            <p className="rp-head">
              <strong>{r.org}</strong>
              <span>{r.date}</span>
            </p>
            <p className="rp-sub">{r.title}</p>
            <ul>
              {r.points
                .filter((p) => !p.startsWith("["))
                .map((p) => (
                  <li key={p}>{p}</li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {PROJECTS.map((p) => (
          <p key={p.slug} className="rp-line">
            <strong>{p.name}</strong> ({p.kind}): {p.desc} {p.skills.slice(0, 5).join(", ")}.
          </p>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {skills.map((g) => (
          <p key={g.name} className="rp-line">
            <strong>{g.name}:</strong> {g.items.join(", ")}
          </p>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {EDUCATION.map((e) => (
          <p key={e.school} className="rp-head">
            <strong>
              {e.school}, {e.degree}
              {e.note ? ` (${e.note})` : ""}
            </strong>
            <span>{e.date}</span>
          </p>
        ))}
      </section>

      <section>
        <h2>Certifications</h2>
        {CERTIFICATES.map((c) => (
          <p key={c.slug} className="rp-head">
            <span>
              {c.title}, {c.issuer}
            </span>
            <span>{c.date.slice(0, 4)}</span>
          </p>
        ))}
      </section>
    </article>
  );
}
