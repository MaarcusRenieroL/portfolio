import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, SecHead } from "~/components/site/ui";
import { UPDATED } from "~/lib/content";

export const metadata: Metadata = { title: "About", description: "A full stack engineer who leans backend and likes knowing how the whole thing works." };

const NOW = [
  ["Applying", "Master's programmes in Germany for Winter 2027/28: IELTS, GRE and dMAT this winter."],
  ["Learning", "German at A1. Ich lerne jeden Tag."],
  ["Building", "zentro in beta, nyx v1.0 on macOS, and new modules for life os."],
  ["Open to", "Full-time remote roles in Germany, roles in Bangalore, and freelance work."],
];
const LANGS = [["English", "Native", 6], ["Tamil", "Native", 6], ["Deutsch", "A1 · Goethe-Institut, working toward B1", 1]] as const;
const HABITS = [
  ["Type-safe end to end", "TypeScript, tRPC, Drizzle and Zod on the web. Strong typing and tests on the JVM."],
  ["Self-hostable by default", "Open source, Docker and my own server before a managed bill."],
  ["Simplify when it's overkill", "life os went from nine microservices to one modular service. Fewer moving parts won."],
];

export default function AboutPage() {
  return (
    <>
      <section className="section-sm">
        <div className="atmos" />
        <div className="wrap split" style={{ gap: 80, position: "relative" }}>
          <div className="stack" style={{ gap: 20 }} data-reveal="left">
            <div className="portrait"><span className="label">[Your photo · 4:5 · green duotone on hover reveals full colour]</span></div>
            <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span className="label">Chennai, IN</span>
              <span className="label">Open to Germany · Bangalore · remote</span>
            </div>
          </div>
          <div className="stack" style={{ gap: 28 }}>
            <Eyebrow kanji="人" className="rise">About</Eyebrow>
            <h1 className="h1 wipe" style={{ animationDelay: "100ms" }}>I like knowing how the whole thing works.</h1>
            <div className="prose rise" style={{ animationDelay: "260ms" }}>
              <p>I&apos;m Maarcus, a full stack engineer who leans backend. At HealthEdge I build Spring Boot and Spring Batch services that move healthcare transactions. Outside work I build the tools I want to use: a launcher, a personal OS, a workspace for small companies.</p>
              <p>I started out in hardware and networking, training on the CCNA and CCNP curriculum, and that&apos;s still how I think about software: how the pieces connect, and where they break.</p>
              <p>Away from the keyboard I ride motorcycles, play badminton and keep music on, usually while planning the next project.</p>
            </div>
            <div className="row stack-m" style={{ gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-ghost" href="/resume">Resume</Link>
              <Link className="btn btn-quiet" href="/contact">Get in touch →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--line)" }}>
        <div className="ichimatsu" style={{ position: "absolute", inset: 0 }} />
        <div className="wrap split" style={{ position: "relative" }}>
          <SecHead kanji="志" eyebrow="Where I'm headed" title="The engineer who can run the whole stack" />
          <div className="prose" data-reveal>
            <p>Most teams split the work: someone builds it, someone runs it in the cloud, someone secures it, someone adds the AI. I want to be the engineer who can do all four well enough to own a company&apos;s systems end to end.</p>
            <p>Full stack is where I am today. <strong>Security and cloud</strong> come next, because that&apos;s where my gaps are and where a master&apos;s in Germany adds the most depth. <strong>AI and ML</strong> follow, built into products like nyx and life os, not bolted on.</p>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap split">
          <SecHead kanji="語" eyebrow="Languages" title="Speaking" />
          <div className="lang">
            {LANGS.map(([name, lvl, n]) => (
              <div key={name} data-reveal>
                <span className="h4">{name}</span>
                <span className="small">{lvl}</span>
                <span className="meter" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => <i key={i} className={i < n ? "on" : ""} style={{ ["--i" as string]: i }} />)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap split">
          <div className="sec-head" data-reveal>
            <Eyebrow kanji="今">Now</Eyebrow>
            <h2 className="h2">What I&apos;m on</h2>
            <span className="label">Updated {UPDATED}</span>
          </div>
          <ul className="now" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {NOW.map(([k, v], i) => (
              <li key={k} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="label blade">{k}</span>
                <span className="body">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap stack" style={{ gap: 40 }}>
          <SecHead kanji="道" eyebrow="How I work" title="Three habits" />
          <div className="grid-auto">
            {HABITS.map(([t, d], i) => (
              <div key={t} className="card stack" style={{ gap: 10, ["--d" as string]: `${i * 90}ms` }} data-reveal data-tilt>
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <span className="h4">{t}</span>
                <span className="small">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
