import Link from "next/link";
import type { ReactNode } from "react";
import { MARQUEE, type Project } from "~/lib/content";
import { Arrow } from "./icons";

export function Eyebrow({ kanji, children, className = "" }: { kanji: string; children: ReactNode; className?: string }) {
  return (
    <div className={`eyebrow ${className}`}>
      <span className="kanji" aria-hidden="true">
        {kanji}
      </span>
      {children}
    </div>
  );
}

export function SecHead({ kanji, eyebrow, id, title }: { kanji: string; eyebrow: string; id?: string; title: ReactNode }) {
  return (
    <div className="sec-head" data-reveal>
      <Eyebrow kanji={kanji}>{eyebrow}</Eyebrow>
      <h2 id={id} className="h2" data-wipe>
        {title}
      </h2>
    </div>
  );
}

export function PageHeader({ kanji, eyebrow, title, lead, children, narrow }: { kanji: string; eyebrow: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; narrow?: boolean }) {
  return (
    <header className="section-sm" style={{ paddingBottom: 48 }}>
      <div className="atmos" />
      <div className={`${narrow ? "wrap-narrow" : "wrap"} stack`} style={{ gap: 24, position: "relative" }}>
        <Eyebrow kanji={kanji} className="rise">
          {eyebrow}
        </Eyebrow>
        <h1 className={narrow ? "h1 wipe" : "d-l wipe"} style={{ animationDelay: "100ms" }}>
          {title}
        </h1>
        {lead && (
          <p className="lead rise" style={{ maxWidth: 640, animationDelay: "260ms" }}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

export function Shot({ label, ratio }: { label: string; ratio?: "16-9" }) {
  const cmd = label.startsWith("$");
  return (
    <div className={`shot${ratio ? " shot-16-9" : ""}`}>
      <span className="shot-in">
        <span className={cmd ? "mono small fg" : "label"}>{label}</span>
      </span>
      <span className="scan" aria-hidden="true" />
    </div>
  );
}

export function ProjectCard({ p, delay = 0 }: { p: Project; delay?: number }) {
  const href = p.external ?? `/projects/${p.slug}`;
  const ext = !!p.external;
  return (
    <a className="card stack" href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} data-tilt data-reveal style={{ gap: 18, color: "inherit", ["--d" as string]: `${delay}ms` }}>
      <Shot label={p.shot} ratio="16-9" />
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <span className="label">
          {p.num} · {p.kind}
        </span>
        <span className="row" style={{ gap: 8 }}>
          {p.featured && <span className="tag tag-blade">Featured</span>}
          <span className="tag">{p.status}</span>
        </span>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <div className="h3">{p.name}</div>
        <p className="small">{p.desc}</p>
      </div>
      <div className="tags">
        {p.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <span className="link-arrow" style={{ marginTop: "auto" }}>
        {p.cta.replace(/ ?[→↗]$/, "")} <span className="arr">{ext ? "↗" : "→"}</span>
      </span>
    </a>
  );
}

export function Marquee() {
  const items = MARQUEE.map((t) => <span key={t}>{t}</span>);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">{items}</div>
      <div className="marquee-track">{items}</div>
    </div>
  );
}

export function LinkArrow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="link-arrow" href={href}>
      {children} <span className="arr">→</span>
    </Link>
  );
}

export function BtnArrow() {
  return <Arrow />;
}
