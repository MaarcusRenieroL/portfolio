"use client";

import { Dialog } from "radix-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "~/lib/content";
import { emit } from "~/lib/ui";
import { Close, Mark, Menu, Moon, Search, Term } from "./icons";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last.current;
        setScrolled(y > 8);
        const reduce = document.documentElement.dataset.tier === "0";
        if (!reduce) {
          if (dy > 14 && y > 240) setHidden(true);
          else if (dy < -2) setHidden(false);
        }
        last.current = y;
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.current?.style.setProperty("--p", String(max > 0 ? Math.min(1, y / max) : 0));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  const cur = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "cur" : "");
  const preload = () => window.dispatchEvent(new Event("ui:preload"));

  return (
    <header className={`nav-shell${hidden ? " hide" : ""}`}>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Primary">
        <div className="wrap nav-in">
          <Link className="brand" href="/" aria-label="maarcus.dev home">
            <Mark />
            <span>
              maarcus<span className="blade">.dev</span>
            </span>
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} className={`nav-link ${cur(l.href)}`} href={l.href} aria-current={cur(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="nav-tools">
            <button className="hint hide-m" type="button" aria-label="Open command palette" onPointerEnter={preload} onFocus={preload} onClick={() => emit("palette")}>
              <Search width={14} height={14} />
              <span>Search or jump</span>
              <span className="kbd">⌘K</span>
            </button>
            <button className="hint hide-m" type="button" aria-label="Open terminal" style={{ padding: "0 8px" }} onClick={() => emit("terminal")}>
              <Term width={14} height={14} />
              <span className="kbd">`</span>
            </button>
            <button className="btn btn-quiet btn-icon" type="button" aria-label="Toggle light / dark theme" onClick={() => emit("theme")}>
              <Moon width={18} height={18} />
            </button>
            <Link className="btn btn-ghost btn-sm hide-m" href="/resume">
              Resume
            </Link>
            <button className="btn btn-quiet btn-icon only-m" type="button" aria-label="Open command palette" onClick={() => emit("palette")}>
              <Search width={20} height={20} />
            </button>
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button className="btn btn-ghost btn-icon only-m" type="button" aria-label="Open menu">
                  <Menu width={20} height={20} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Content className="sheet-pos site" aria-describedby={undefined}>
                  <Dialog.Title className="label">Menu</Dialog.Title>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 32 }}>
                    <Mark />
                    <Dialog.Close className="btn btn-ghost btn-icon" aria-label="Close menu">
                      <Close width={20} height={20} />
                    </Dialog.Close>
                  </div>
                  <div className="stack" style={{ gap: 4 }}>
                    {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/resume", label: "Resume" }, { href: "/contact", label: "Contact" }].map((l, i) => (
                      <Link key={l.href} href={l.href} className="h2" style={{ color: "var(--fg)", padding: "10px 0", borderBottom: "1px solid var(--line)", animation: `rise 500ms var(--ease-out) ${i * 50}ms both` }}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
        <div className="scroll-bar" ref={bar as React.RefObject<HTMLDivElement>} aria-hidden="true">
          <i />
        </div>
      </nav>
    </header>
  );
}
