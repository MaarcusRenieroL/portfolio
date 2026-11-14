"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANG_COOKIE, stripLang } from "~/lib/i18n";
import { NAV_LINKS, SITE } from "~/lib/content";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "~/components/site/icons";
import { useDict, useLang, useLocalePath } from "~/components/site/locale";
import { PaletteButton } from "~/components/site/command-palette";
import { FooterShortcutsButton } from "~/components/site/shortcuts";
import { ThemeToggle } from "~/components/site/theme-toggle";

/** Header: name left, tools right, underlined tabs below. */
export function Nav({ showWriting = true, showNotes = true }: { showWriting?: boolean; showNotes?: boolean }) {
  const rawPath = usePathname();
  const lang = useLang();
  const t = useDict();
  const href = useLocalePath();
  const { path: pathname } = stripLang(rawPath);
  const cur = (h: string) => (h === "/" ? pathname === "/" : pathname === h || pathname.startsWith(h + "/"));
  const other = lang === "en" ? "de" : "en";
  const label = (h: string) => t.nav[(h === "/" ? "home" : h === "/blog" ? "writing" : h.slice(1)) as keyof typeof t.nav];

  return (
    <header className="header">
      <div className="wrap">
        <div className="header-in">
          <Link className="brand" href={href("/")}>
            {SITE.name}
          </Link>
          <div className="header-actions">
            <button
              type="button"
              className="lang-switch"
              lang={other}
              aria-label={t.chrome.otherLangAria}
              onClick={() => {
                try {
                  document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
                } catch {}
                window.location.reload();
              }}
            >
              {other.toUpperCase()}
            </button>
            <PaletteButton />
            <ThemeToggle />
          </div>
        </div>
        <nav className="tabs" aria-label={t.chrome.primary}>
          {NAV_LINKS.filter((l) => (showWriting || l.href !== "/blog") && (showNotes || l.href !== "/notes")).map(({ href: h, label: en }) => (
            <Link key={h} href={href(h)} data-tab={en.toLowerCase()} aria-current={cur(h) ? "page" : undefined}>
              {label(h)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const t = useDict().chrome;
  const href = useLocalePath();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-in">
          <span>
            © {new Date().getFullYear()} {SITE.name}. {t.nothing}
          </span>
          <nav className="footer-social" aria-label={t.social}>
            <a href={SITE.github} rel="noopener noreferrer">
              <GithubIcon /> GitHub
            </a>
            <a href={SITE.linkedin} rel="noopener noreferrer">
              <LinkedinIcon /> LinkedIn
            </a>
            <a href={`mailto:${SITE.email}`}>
              <MailIcon /> {t.email}
            </a>
            <Link href={href("/resume")} data-track="resume-open">
              <FileIcon /> {t.resume}
            </Link>
          </nav>
          <nav className="footer-meta" aria-label={t.site}>
            <Link href={href("/changelog")}>{t.changelog}</Link>
            <a href="/feed.xml">RSS</a>
            <FooterShortcutsButton />
          </nav>
          {t.aiNote && <p className="footer-note">{t.aiNote}</p>}
        </div>
      </div>
    </footer>
  );
}
