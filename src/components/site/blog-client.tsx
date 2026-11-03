"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "./icons";

export function PostProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <div style={{ position: "sticky", top: 0, height: 2, background: "var(--line)", zIndex: 41 }} aria-hidden="true">
      <div ref={ref} style={{ height: "100%", background: "var(--blade)", transformOrigin: "left", transform: "scaleX(0)" }} />
    </div>
  );
}

export function Toc({ items }: { items: { id: string; text: string; depth: number }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" });
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="toc" aria-label="On this page">
      <span className="label" style={{ marginBottom: 10 }}>On this page</span>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} className={active === i.id ? "on" : ""} style={i.depth > 2 ? { paddingLeft: 12 } : undefined}>{i.text}</a>
      ))}
    </nav>
  );
}

export function CopyLink() {
  const [ok, setOk] = useState(false);
  return (
    <button className="btn btn-ghost btn-sm" type="button" onClick={async () => { await navigator.clipboard?.writeText(location.href); setOk(true); setTimeout(() => setOk(false), 1600); }}>
      {ok ? (<><Check style={{ color: "var(--blade)" }} /> Copied</>) : "Copy link"}
    </button>
  );
}

export function PostSearch({ posts }: { posts: { slug: string; title: string; description: string; date: string; tag: string }[] }) {
  const [q, setQ] = useState("");
  const list = posts.filter((p) => (p.title + p.description + p.tag).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="field" style={{ width: 320, maxWidth: "100%" }}>
        <label htmlFor="b-s">Search posts</label>
        <input className="input" id="b-s" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Spring Batch, Rust, AWS…" />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        {list.map((p) => (
          <Link key={p.slug} className="post" href={`/blog/${p.slug}`}>
            <span className="label">{p.date}</span>
            <div className="stack" style={{ gap: 8 }}>
              <span className="pt h3" style={{ transition: "color var(--dur-2)" }}>{p.title}</span>
              <span className="small">{p.description}</span>
            </div>
            <span className="label" style={{ textAlign: "right" }}>{p.tag}</span>
          </Link>
        ))}
        {list.length === 0 && <p className="small" style={{ padding: "32px 0" }}>Nothing matches “{q}”.</p>}
      </div>
    </>
  );
}
