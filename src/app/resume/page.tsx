import type { Metadata } from "next";
import Link from "next/link";
import { SITE, UPDATED } from "~/lib/content";

export const metadata: Metadata = { title: "Resume", description: "One-page resume: Java/Spring Boot, TypeScript/Next.js, healthcare ETL at HealthEdge." };

const JOBS = [
  { org: "HealthEdge", title: "Developer I, Software Engineering", date: "Jan 2025 – present", body: "Joined through UST (4-month training), then UST HealthProof, HealthProof Pvt Ltd and now HealthEdge after the August 2026 merger. Spring Boot / Spring Batch microservices for healthcare transaction ETL. Core developer across all four modules, with unit and integration tests in each. Shining Star Award ×2." },
  { org: "Matlync", title: "Full Stack Next.js Developer", date: "Jan – Feb 2024", body: "Boutique CRM: Next.js front end, Strapi back end." },
  { org: "STEAM Troops Innovation Labs", title: "Full Stack Next.js Developer", date: "Sep 2023 – Jan 2024", body: "Learning management system: Next.js, NextAuth, REST, Docker, AWS, GitHub Actions CI/CD." },
  { org: "Systech", title: "Intern, Hardware and Networking", date: "Jan 2023", body: "Trained on the CCNA and CCNP curriculum." },
];

const strong = { color: "var(--fg)" } as const;

export default function ResumePage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Resume</h1>
        <div className="row" style={{ gap: "8px 28px" }}>
          <a className="action" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/resume`} download>
            Download PDF
          </a>
          <a className="action" href="/resume.pdf" target="_blank" rel="noopener">
            Open in new tab ↗
          </a>
        </div>
        <p className="help">Last updated {UPDATED}</p>
      </header>

      <div className="stack g40 col">
        <section className="stack g8">
          <h2 className="h2">{SITE.name}</h2>
          <p className="muted">Full Stack Engineer · Java/Spring Boot · TypeScript/Next.js</p>
          <p className="muted small">
            {SITE.location} · {SITE.domain} · {SITE.email}
          </p>
        </section>

        <section className="stack g16">
          <h2 className="h2">Summary</h2>
          <p className="muted">Backend-leaning full stack engineer with ~2.5 years across Java/Spring and TypeScript/Next.js. Builds healthcare ETL services at HealthEdge and is moving toward security, cloud and AI.</p>
        </section>

        <section className="stack g24">
          <h2 className="h2">Experience</h2>
          {JOBS.map((j) => (
            <div key={j.org} className="stack" style={{ gap: 4 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: "4px 16px" }}>
                <span className="item-title">
                  {j.org} <span className="muted" style={{ fontWeight: 400 }}>· {j.title}</span>
                </span>
                <span className="faint small">{j.date}</span>
              </div>
              <p className="muted small">{j.body}</p>
            </div>
          ))}
        </section>

        <section className="stack g16">
          <h2 className="h2">Projects</h2>
          <p className="muted">
            <strong style={strong}>zentro</strong>: multi-tenant workspace, Next.js/tRPC, in beta. <strong style={strong}>life os</strong>: self-hosted personal OS, 10 modules in one Spring Boot service. <strong style={strong}>nyx</strong>: open-source
            launcher, Tauri/Rust/Ollama, v1.0. <strong style={strong}>next-kit</strong>: Next.js scaffolder on npm.
          </p>
        </section>

        <section className="stack g16">
          <h2 className="h2">Skills</h2>
          <p className="muted">Java 21, Spring Boot, Spring Batch, Spring Security · TypeScript, React, Next.js, tRPC · PostgreSQL, Drizzle, Redis · Docker, GitHub Actions, AWS S3/CloudWatch</p>
        </section>

        <section className="stack g16">
          <h2 className="h2">Education and languages</h2>
          <p className="muted">B.Tech, Computer Science and Business Systems, Rajalakshmi Engineering College, 2020 – 2024 · GPA 7.98/10. English and Tamil (native), German (A1).</p>
          <p className="help">
            Need transcripts? <Link className="link" href="/contact">Ask me</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
