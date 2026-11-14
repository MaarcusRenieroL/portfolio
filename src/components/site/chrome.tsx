"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "~/lib/content";
import { ThemeToggle } from "~/components/site/theme-toggle";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/stack", label: "Stack" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Header: name left, resume right, underlined tabs below. */
export function Nav({ showWriting = true }: { showWriting?: boolean }) {
  const pathname = usePathname();
  const cur = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="header">
      <div className="wrap">
        <div className="header-in">
          <Link className="brand" href="/">
            {SITE.name}
          </Link>
          <div className="header-actions">
            <ThemeToggle />
            <Link className="action" href="/resume">
              Resume
            </Link>
          </div>
        </div>
        <nav className="tabs" aria-label="Primary">
          {TABS.filter((t) => showWriting || t.href !== "/blog").map(({ href, label }) => (
            <Link key={href} href={href} data-tab={label.toLowerCase()} aria-current={cur(href) ? "page" : undefined}>
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
