"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "~/components/site/theme-toggle";
import { SITE } from "~/lib/content";
import { Logout } from "./logout";

export const ADMIN_NAV: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/content/project", label: "Projects" },
  { href: "/admin/content/role", label: "Experience" },
  { href: "/admin/content/education", label: "Education" },
  { href: "/admin/content/skillgroup", label: "Skills" },
  { href: "/admin/content/certificate", label: "Certificates" },
  { href: "/admin/content/post", label: "Blog" },
  { href: "/admin/content/note", label: "Notes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/security", label: "Security" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const isActive = (h: string) => {
    if (h === "/admin") return pathname === "/admin";
    return pathname === h || pathname.startsWith(h + "/");
  };

  return (
    <header className="header">
      <div className="wrap admin-wrap">
        <div className="header-in">
          <Link className="brand" href="/admin">
            {SITE.name}
            <span className="admin-badge">Admin</span>
          </Link>
          <div className="header-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-header-link"
              title="Open live portfolio in a new tab"
            >
              View site ↗
            </a>
            <ThemeToggle />
            <Logout />
          </div>
        </div>
        <nav className="tabs" aria-label="Admin Navigation">
          {ADMIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function AdminFooter() {
  return (
    <footer className="footer">
      <div className="wrap admin-wrap">
        <div className="footer-in">
          <span>© {new Date().getFullYear()} {SITE.name} · Admin Console</span>
          <nav className="footer-meta" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <a href="/" target="_blank" rel="noopener noreferrer">Public site ↗</a>
            <Link href="/admin/analytics">Analytics</Link>
            <Link href="/admin/security">Security</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function AuthHeader() {
  return (
    <header className="header">
      <div className="wrap">
        <div className="header-in">
          <Link className="brand" href="/">
            {SITE.name}
            <span className="admin-badge">Admin</span>
          </Link>
          <div className="header-actions">
            <Link href="/" className="admin-header-link">
              ← Public site
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AuthFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-in">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <Link href="/" className="admin-header-link" style={{ border: "none", padding: 0 }}>
            Back to portfolio
          </Link>
        </div>
      </div>
    </footer>
  );
}
