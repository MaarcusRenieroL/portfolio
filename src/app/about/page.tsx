import type { Metadata } from "next";
import Link from "next/link";
import { SITE, UPDATED } from "~/lib/content";

export const metadata: Metadata = { title: "About", description: "A full stack engineer who leans backend and likes knowing how the whole thing works." };

const NOW = [
  ["Looking for", "A full-time remote or hybrid role in Germany, Bangalore or Chennai."],
  ["Learning", "German at A1. Ich lerne jeden Tag."],
  ["Building", "zentro in beta, nyx v1.0 on macOS, snap pass, and new modules for life os."],
  ["Also open to", "Freelance projects."],
];

const HABITS = [
  ["Type-safe end to end", "TypeScript, tRPC, Drizzle and Zod on the web. Strong typing and tests on the JVM."],
  ["Self-hostable by default", "Open source, Docker and my own server before a managed bill."],
  ["Simplify when it's overkill", "life os went from nine microservices to one modular service. Fewer moving parts won."],
];

const LANGS = [
  ["English", "Native"],
  ["Tamil", "Native"],
  ["Deutsch", "A1 · Goethe-Institut, working toward B1"],
];

export default function AboutPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title col">I like knowing how the whole thing works.</h1>
      </header>

      <div className="prose">
        <p>
          I&apos;m Maarcus, a full stack engineer who leans backend. At HealthEdge I build Spring Boot and Spring Batch services that move healthcare transactions. Outside work I build the tools I want to use: a launcher, a personal OS, a workspace for small companies.
        </p>
        <p>I started out in hardware and networking, training on the CCNA and CCNP curriculum, and that&apos;s still how I think about software: how the pieces connect, and where they break.</p>
        <p>Away from the keyboard I ride motorcycles, play badminton and keep music on, usually while planning the next project.</p>
        <p>
          <Link href="/resume">Resume</Link> · <Link href="/experience">Experience</Link> · <Link href="/contact">Get in touch</Link>
        </p>
      </div>

      <section className="stack g24">
        <h2 className="h2">Where I&apos;m headed</h2>
        <div className="prose">
          <p>
            Most teams split the work: someone builds it, someone runs it in the cloud, someone secures it, someone adds the AI. I want to be the engineer who can do all four well enough to own a company&apos;s systems end to end.
          </p>
          <p>
            Full stack is where I am today. <strong>Security and cloud</strong> come next, because that&apos;s where my gaps are and the next stretch of my career should close them. <strong>AI and ML</strong> follow, built into products like nyx and life os,
            not bolted on.
          </p>
        </div>
      </section>

      <section className="stack g24">
        <div className="stack" style={{ gap: 4 }}>
          <h2 className="h2">Now</h2>
          <span className="help">Updated {UPDATED}</span>
        </div>
        <dl className="list">
          {NOW.map(([k, v]) => (
            <div className="item" key={k}>
              <dt className="item-key">{k}</dt>
              <dd className="muted">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="stack g24">
        <h2 className="h2">How I work</h2>
        <ol className="list">
          {HABITS.map(([t, d]) => (
            <li className="item" key={t}>
              <span className="item-title">{t}</span>
              <span className="muted">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack g24">
        <h2 className="h2">Languages</h2>
        <dl className="list">
          {LANGS.map(([n, l]) => (
            <div className="item" key={n}>
              <dt className="item-title">{n}</dt>
              <dd className="muted">{l}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
