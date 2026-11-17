"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANG_COOKIE, stripLang } from "~/lib/i18n";
import { NAV_LINKS, SITE } from "~/lib/site";
import { FileIcon, GithubIcon, LinkedinIcon, MailIcon } from "~/components/site/icons";
import { useDict, useLang, useLocalePath } from "~/components/site/locale";
import { PaletteButton } from "~/components/site/palette-trigger";
import { FooterShortcutsButton } from "~/components/site/shortcuts";
import { ThemeToggle } from "~/components/site/theme-toggle";
import { SoundToggle } from "~/components/site/sound-toggle";
import { Button } from "~/components/ui/button";

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

  const tabsRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check scroll position to toggle edge fade indicators
  const updateScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  // Update on route change & scroll active tab into view
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    updateScroll();

    // Auto-scroll the active tab into view on mount or route transition
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      const elRect = el.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      if (activeRect.left < elRect.left + 16 || activeRect.right > elRect.right - 16) {
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }

    el.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      el.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, [pathname, updateScroll]);

  // Mouse drag-to-scroll and trackpad wheel support for desktop / mobile emulation
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let draggedDistance = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      initialScrollLeft = el.scrollLeft;
      draggedDistance = 0;
      el.style.scrollBehavior = "auto";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const walk = e.clientX - startX;
      draggedDistance = Math.abs(walk);
      if (draggedDistance > 4) {
        setIsDragging(true);
        el.scrollLeft = initialScrollLeft - walk;
      }
    };

    const handleMouseUp = () => {
      if (isDown) {
        el.style.scrollBehavior = "smooth";
        if (draggedDistance > 6) {
          // Suppress accidental click navigation on dragged link
          const preventClick = (clickEvent: MouseEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            window.removeEventListener("click", preventClick, true);
          };
          window.addEventListener("click", preventClick, true);
        }
      }
      isDown = false;
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <header className="header">
      <div className="wrap">
        <div className="header-in">
          <Link className="brand" href={href("/")}>
            {SITE.name}
          </Link>
          <div className="header-actions">
            <Button
              type="button"
              variant="ghost"
              className="lang-switch"
              lang={other}
              aria-label={`${other.toUpperCase()}: ${t.chrome.otherLangAria}`}
              onClick={() => {
                try {
                  document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
                } catch {}
                window.location.reload();
              }}
            >
              {other.toUpperCase()}
            </Button>
            <PaletteButton />
            <ThemeToggle />
            <SoundToggle />
          </div>
        </div>
        <div
          className={`tabs-wrapper ${canScrollLeft ? "has-left" : ""} ${canScrollRight ? "has-right" : ""}`}
        >
          <nav
            ref={tabsRef}
            className={`tabs ${isDragging ? "is-dragging" : ""}`}
            aria-label={t.chrome.primary}
          >
            {NAV_LINKS.filter((l) => (showWriting || l.href !== "/blog") && (showNotes || l.href !== "/notes")).map(({ href: h, label: en }) => (
              <Link key={h} href={href(h)} data-tab={en.toLowerCase()} aria-current={cur(h) ? "page" : undefined}>
                {label(h)}
              </Link>
            ))}
          </nav>
        </div>
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
            <a href={SITE.github} rel="noopener noreferrer" data-track="social-click" data-track-label="github">
              <GithubIcon /> GitHub
            </a>
            <a href={SITE.linkedin} rel="noopener noreferrer" data-track="social-click" data-track-label="linkedin">
              <LinkedinIcon /> LinkedIn
            </a>
            <a href={`mailto:${SITE.email}`} data-track="email-click" data-track-label="footer">
              <MailIcon /> {t.email}
            </a>
            <Link href={href("/resume")} data-track="resume-open">
              <FileIcon /> {t.resume}
            </Link>
          </nav>
          <nav className="footer-meta" aria-label={t.site}>
            <Link href={href("/changelog")}>{t.changelog}</Link>
            <Link href={href("/privacy")}>{t.privacy}</Link>
            <Link href={href("/legal")}>{t.legal}</Link>
            <a href="/feed.xml">RSS</a>
            <FooterShortcutsButton />
          </nav>
          {t.aiNote && <p className="footer-note">{t.aiNote}</p>}
        </div>
      </div>
    </footer>
  );
}
