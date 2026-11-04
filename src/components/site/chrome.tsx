"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "~/lib/content";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/stack", label: "Stack" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Gateway-style header: name left, resume right, underlined tabs below. */
export function Nav() {
  const pathname = usePathname();
  const cur = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="header">
      <div className="wrap">
        <div className="header-in">
          <Link className="brand" href="/">
            {SITE.name}
          </Link>
          <Link className="action" href="/resume">
            Resume
          </Link>
        </div>
        <nav className="tabs" aria-label="Primary">
          {TABS.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={cur(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-in">
          <span>
            © {new Date().getFullYear()} {SITE.name}. Nothing happened.
          </span>
          <span>
            <a className="link" href={`mailto:${SITE.email}`}>
              Email
            </a>{" "}
           
          </span>
        </div>
      </div>
    </footer>
  );
}
