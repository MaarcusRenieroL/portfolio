"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "~/lib/content";
import { Shot } from "./ui";

const FEATURED = PROJECTS.filter((p) => p.featured);

/** Sticky left column: counter + progress follow the card in view (IO at 50%). */
export function WorkShowcase() {
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setI(Number((en.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const n = FEATURED.length;
  return (
    <div className="wrap split" style={{ gridTemplateColumns: "minmax(0, 3fr) minmax(0, 9fr)" }}>
      <div className="stack sticky-col" style={{ gap: 24 }}>
        <div className="sec-head" data-reveal>
          <div className="eyebrow">
            <span className="kanji" aria-hidden="true">参</span>Selected work
          </div>
          <h2 id="work-h" className="h2" data-wipe>
            Built to learn, shipped to use
          </h2>
        </div>
        <div className="stack hide-t" style={{ gap: 10 }} aria-hidden="true">
          <div className="mono h3">
            <span className="blade">{String(i + 1).padStart(2, "0")}</span> <span className="fg3">/ {String(n).padStart(2, "0")}</span>
          </div>
          <div style={{ height: 2, background: "var(--line)" }}>
            <div style={{ width: `${((i + 1) / n) * 100}%`, height: "100%", background: "var(--blade)", transition: "width 220ms var(--ease-out)" }} />
          </div>
        </div>
        <Link className="link-arrow" href="/projects">
          All {PROJECTS.length} projects <span className="arr">→</span>
        </Link>
      </div>
      <div className="stack" style={{ gap: 24 }}>
        {FEATURED.map((p, idx) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            data-i={idx}
            data-tilt
            data-reveal
            className="card feat"
            style={{ color: "inherit" }}
          >
            <div className="stack" style={{ gap: 16 }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="label">
                  {p.num} · {p.kind}
                </span>
                <span className={`tag${p.slug === "zentro" ? " tag-blade" : ""}`}>{p.status}</span>
              </div>
              <div className="h1">{p.name}</div>
              <p className="body">{p.long ?? p.desc}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <span className="link-arrow">
                Read case study <span className="arr">→</span>
              </span>
            </div>
            <Shot label={p.shot} />
          </Link>
        ))}
      </div>
    </div>
  );
}
