import Link from "next/link";
import { Arrow, Download } from "~/components/site/icons";
import { HeroFx } from "~/components/site/hero";
import { Eyebrow, LinkArrow, Marquee, SecHead } from "~/components/site/ui";
import { WorkShowcase } from "~/components/site/work-showcase";
import { BRIEF, ROLES } from "~/lib/content";

const Blade = ({ transform, opacity, stroke, edge, glow }: { transform: string; opacity?: number; stroke: string; edge: string; glow?: boolean }) => (
  <g className="blade-g" transform={transform} opacity={opacity}>
    <line x1="4" y1="0" x2="92" y2="0" stroke={stroke} strokeWidth="10" strokeDasharray="5 5" />
    <rect x="96" y="-18" width="7" height="36" fill="var(--blade)" />
    <path d="M103 -5L560 -5C585 -5 605 -1 620 6L103 6Z" fill="url(#hb)" />
    <path d="M103 6L620 6" stroke={edge} strokeWidth={glow ? 1.6 : 1.2} style={glow ? { filter: "drop-shadow(0 0 6px var(--blade))" } : undefined} />
  </g>
);

export default function Home() {
  return (
    <>
      {/* 壱 HERO */}
      <section className="hero" aria-labelledby="hero-name">
        <div className="atmos" />
        <div className="grain" />
        <div className="streak anim" style={{ ["--r" as string]: "-28deg", width: "46%", right: "2%", top: "30%" }} />
        <div className="streak anim" style={{ ["--r" as string]: "-28deg", width: "28%", right: "18%", top: "52%", animationDelay: "1.8s", opacity: 0.7 }} />
        <div className="streak anim" style={{ ["--r" as string]: "-28deg", width: "18%", right: "34%", top: "18%", animationDelay: "3.1s", opacity: 0.45 }} />
        <svg className="hero-fig" viewBox="0 0 560 660" aria-hidden="true">
          <defs>
            <linearGradient id="hb" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style={{ stopColor: "var(--line-2)" }} />
              <stop offset="1" style={{ stopColor: "var(--surface-2)" }} />
            </linearGradient>
          </defs>
          <Blade transform="translate(30 640) rotate(-58)" opacity={0.75} stroke="var(--fg-3)" edge="var(--blade)" />
          <Blade transform="translate(100 650) rotate(-58)" stroke="var(--fg-2)" edge="var(--lime)" glow />
          <Blade transform="translate(170 640) rotate(-58) scale(.94)" opacity={0.75} stroke="var(--fg-3)" edge="var(--blade)" />
        </svg>
        <HeroFx />
        <div className="wrap hero-copy" style={{ position: "relative" }}>
          <div className="stack" style={{ gap: 28, maxWidth: 760 }}>
            <Eyebrow kanji="壱" className="rise">Full stack engineer · backend-leaning</Eyebrow>
            <h1 id="hero-name" className="d-xl wipe" style={{ animationDelay: "120ms" }}>
              Maarcus<br />Reniero L
            </h1>
            <p className="lead rise" style={{ animationDelay: "360ms", maxWidth: 600 }}>
              I build Java/Spring Boot and TypeScript/Next.js systems at HealthEdge — and I&apos;m sharpening toward <span className="fg">AI</span>, <span className="fg">cloud</span> and <span className="fg">security</span>.
            </p>
            <div className="row stack-m rise" style={{ gap: 12, flexWrap: "wrap", animationDelay: "480ms" }}>
              <Link className="btn btn-primary" href="/projects">View projects <Arrow /></Link>
              <Link className="btn btn-ghost" href="/resume">Resume <Download /></Link>
            </div>
            <div className="row rise" style={{ gap: 20, flexWrap: "wrap", animationDelay: "600ms" }}>
              <span className="label">Chennai, IN</span>
              <span className="label">·</span>
              <span className="label row" style={{ gap: 8 }}>
                <span className="dot dot-done" style={{ width: 8, height: 8 }} />
                Open to remote roles in Germany, Bangalore and freelance
              </span>
            </div>
          </div>
        </div>
        <div className="wrap hide-m" style={{ position: "absolute", left: 0, right: 0, bottom: 28, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
          <span className="label row" style={{ gap: 10 }}>
            <span style={{ width: 1, height: 28, background: "linear-gradient(var(--blade), transparent)" }} />
            Scroll
          </span>
          <span className="label row" style={{ gap: 8 }}>
            Press <span className="kbd">⌘K</span> to jump · <span className="kbd">`</span> for a terminal
          </span>
        </div>
      </section>

      <div className="wrap">
        <div className="slash" data-draw />
      </div>
      <Marquee />

      {/* 弐 RECRUITER BRIEF */}
      <section className="section-sm" aria-labelledby="brief-h">
        <div className="wrap split">
          <div className="stack sticky-col" style={{ gap: 20 }}>
            <SecHead kanji="弐" eyebrow="The brief" id="brief-h" title="30 seconds, everything you'd ask" />
            <p className="body" data-reveal>For recruiters, admissions readers and hiring managers. The resume has the detail.</p>
            <div className="row stack-m" style={{ gap: 12, flexWrap: "wrap" }} data-reveal>
              <Link className="btn btn-ghost" href="/resume">Resume · PDF</Link>
              <Link className="btn btn-quiet" href="/contact">Contact →</Link>
            </div>
          </div>
          <div className="brief ichimatsu">
            {BRIEF.map((b, i) => (
              <div key={b.label} className="stack" style={{ gap: 8, ["--d" as string]: `${i * 70}ms` }} data-reveal>
                <span className="label">{b.label}</span>
                <span className={`h4${b.blade ? " blade" : ""}`}>{b.title}</span>
                <span className="small">{b.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 参 FEATURED */}
      <section className="section" aria-labelledby="work-h" style={{ background: "var(--bg-1)" }}>
        <WorkShowcase />
      </section>

      {/* 肆 EXPERIENCE */}
      <section className="section" aria-labelledby="exp-h">
        <div className="wrap split">
          <div className="stack" style={{ gap: 20 }}>
            <SecHead kanji="肆" eyebrow="Work" id="exp-h" title="Where I've shipped" />
            <div data-reveal><LinkArrow href="/experience">Full experience</LinkArrow></div>
          </div>
          <div className="tl">
            {ROLES.map((r) => (
              <div className="tl-item" key={r.org}>
                <div className="tl-date label" style={{ paddingTop: 4 }}>{r.date}</div>
                <div className="tl-rail"><span className={`tl-node${r.now ? " now" : ""}`} /></div>
                <div className="stack" style={{ gap: 6 }} data-reveal="right">
                  <div className="h3">{r.org}</div>
                  <div className="small blade">{r.title}{r.place && !r.now ? ` · ${r.place}` : ""}</div>
                  <p className="small">{r.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
