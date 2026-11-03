import type { Metadata } from "next";
import Link from "next/link";
import { Download, External } from "~/components/site/icons";
import { Eyebrow } from "~/components/site/ui";
import { UPDATED } from "~/lib/content";

export const metadata: Metadata = { title: "Resume", description: "One-page resume: Java/Spring Boot, TypeScript/Next.js, healthcare ETL at HealthEdge." };

export default function ResumePage() {
  return (
    <>
      <header className="section-sm" style={{ paddingBottom: 40 }}>
        <div className="atmos" />
        <div className="wrap row stack-m" style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 32, position: "relative", flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 20 }}>
            <Eyebrow kanji="履" className="rise">Resume · 1 page · PDF</Eyebrow>
            <h1 className="d-l wipe" style={{ animationDelay: "100ms" }}>Resume</h1>
            <span className="label rise">Last updated {UPDATED}</span>
          </div>
          <div className="row stack-m rise" style={{ gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="/api/resume" download>Download PDF <Download /></a>
            <a className="btn btn-ghost" href="/resume.pdf" target="_blank" rel="noopener">Open in new tab <External /></a>
          </div>
        </div>
      </header>
      <section style={{ paddingBottom: 112 }}>
        <div className="wrap split" style={{ gridTemplateColumns: "minmax(0, 9fr) minmax(0, 3fr)", gap: 32, alignItems: "start" }}>
          <div className="viewer" data-reveal="scale">
            <div className="sheet" role="img" aria-label="Resume preview">
              <div className="r" style={{ alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1, color: "#0c1a11" }}>Maarcus Reniero L</div>
                  <p style={{ marginTop: 6 }}>Full Stack Engineer · Java/Spring Boot · TypeScript/Next.js</p>
                </div>
                <p style={{ textAlign: "right" }}>Chennai, India<br />maarcus.dev · maarcusreniero.l@gmail.com<br />github.com/MaarcusRenieroL</p>
              </div>
              <div><h3>Summary</h3><p>Backend-leaning full stack engineer with ~2.5 years across Java/Spring and TypeScript/Next.js. Builds healthcare ETL services at HealthEdge and is moving toward security, cloud and AI.</p></div>
              <div>
                <h3>Experience</h3>
                <div className="r"><b>HealthEdge — Developer I, Software Engineering</b><span>Jan 2025 – present</span></div>
                <p>Spring Boot / Spring Batch microservices for healthcare transaction ETL. Core developer across all four modules, with unit and integration tests in each. Shining Star Award ×2.</p>
                <div className="r" style={{ marginTop: 6 }}><b>Matlync — Full Stack Next.js Developer</b><span>Jan – Feb 2024</span></div>
                <p>Boutique CRM: Next.js front end, Strapi back end.</p>
                <div className="r" style={{ marginTop: 6 }}><b>STEAM Troops Innovation Labs — Full Stack Next.js Developer</b><span>Sep 2023 – Jan 2024</span></div>
                <p>Learning management system: Next.js, NextAuth, REST, Docker, AWS, GitHub Actions CI/CD.</p>
                <div className="r" style={{ marginTop: 6 }}><b>Systech — Intern, Hardware and Networking</b><span>Jan 2023</span></div>
                <p>Trained on the CCNA and CCNP curriculum.</p>
              </div>
              <div><h3>Projects</h3><p><b>zentro</b>: multi-tenant workspace, Next.js/tRPC, in beta. <b>life os</b>: self-hosted personal OS, 10 modules in one Spring Boot service. <b>nyx</b>: open-source launcher, Tauri/Rust/Ollama, v1.0. <b>next-kit</b>: Next.js scaffolder on npm.</p></div>
              <div><h3>Skills</h3><p>Java 21, Spring Boot, Spring Batch, Spring Security · TypeScript, React, Next.js, tRPC · PostgreSQL, Drizzle, Redis · Docker, GitHub Actions, AWS S3/CloudWatch</p></div>
              <div><h3>Education + languages</h3><div className="r"><b>B.Tech, Computer Science and Business Systems</b><span>2020 – 2024</span></div><p>Rajalakshmi Engineering College · GPA 7.98/10 · English, Tamil (native) · German (A1)</p></div>
            </div>
          </div>
          <aside className="stack" style={{ gap: 16 }}>
            <div className="panel stack" style={{ gap: 12, padding: 24 }} data-reveal><span className="label">At a glance</span><span className="h4">~2.5 yrs · Java/Spring + TS/Next.js</span><span className="small">Current: HealthEdge, since Jan 2025</span></div>
            <div className="panel stack" style={{ gap: 12, padding: 24 }} data-reveal><span className="label">For admissions</span><span className="small">B.Tech CS &amp; Business Systems, GPA 7.98/10. Transcripts on request.</span><Link className="link-arrow" href="/contact">Request documents <span className="arr">→</span></Link></div>
            <div className="panel stack" style={{ gap: 12, padding: 24 }} data-reveal><span className="label">Shortcut</span><span className="small row" style={{ gap: 8 }}><span className="kbd">⌘</span><span className="kbd">D</span> downloads from any page</span></div>
          </aside>
        </div>
      </section>
    </>
  );
}
