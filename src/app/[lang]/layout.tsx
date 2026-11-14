import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { Events } from "~/components/site/events";
import { Scramble } from "~/components/site/scramble";
import { Loader } from "~/components/site/loader";
import { Footer, Nav } from "~/components/site/chrome";
import { CommandPalette, type PaletteItem } from "~/components/site/command-palette";
import { Life } from "~/components/site/life";
import { LocaleProvider } from "~/components/site/locale";
import { Motion } from "~/components/site/motion";
import { Particles } from "~/components/site/particles";
import { ShortcutsHelp } from "~/components/site/shortcuts";
import { ZoroAiBubble } from "~/components/zoro-ai/zoro-bubble";
import { InteractiveTerminal } from "~/components/terminal/interactive-terminal";
import { DevModeHud } from "~/components/dev-mode/dev-hud";
import { NAV_LINKS, SITE } from "~/lib/content";
import { getPostList } from "~/lib/posts";
import { DICT } from "~/lib/dict";
import { LANGS, isLang, localePath, type Lang } from "~/lib/i18n";
import { getSiteContent } from "~/lib/site-content";
import type { Project } from "~/lib/schema";
import { jsonLdString } from "~/lib/utils";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const code = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-code", display: "swap" });

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "en";
  const d = DICT[l].meta;
  return {
    metadataBase: new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : SITE.url),
    title: { default: `${SITE.name} | ${d.title}`, template: `%s | ${SITE.name}` },
    description: d.desc,
    alternates: { canonical: "./", types: { "application/rss+xml": "/feed.xml" } },
    openGraph: {
      title: SITE.name,
      description: d.desc,
      url: SITE.url,
      siteName: SITE.domain,
      images: [{ url: "/og", width: 1200, height: 630 }],
      type: "website",
      locale: l === "de" ? "de_DE" : "en_US",
    },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  colorScheme: "dark light",
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

/** First visit in a tab plays the intro; later pages in the same tab skip it. */
const INTRO_SCRIPT = `try{var s=window.sessionStorage;if(s.getItem("intro")){document.documentElement.dataset.intro="seen"}else{s.setItem("intro","1")}}catch(e){}`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: "Full stack engineer",
  url: SITE.url,
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  sameAs: [SITE.github, SITE.linkedin],
};

function paletteItems(lang: Lang, showWriting: boolean, showNotes: boolean, projects: Project[]): PaletteItem[] {
  const d = DICT[lang];
  const navLabel = (href: string) => d.nav[(href === "/" ? "home" : href === "/blog" ? "writing" : href.slice(1)) as keyof typeof d.nav];
  return [
    ...NAV_LINKS.filter((l) => (showWriting || l.href !== "/blog") && (showNotes || l.href !== "/notes")).map((l): PaletteItem => ({ id: `page-${l.href}`, group: "Pages", label: navLabel(l.href), hint: localePath(lang, l.href), run: "href", value: localePath(lang, l.href) })),
    { id: "page-now", group: "Pages", label: "Now", hint: localePath(lang, "/now"), run: "href", value: localePath(lang, "/now") },
    { id: "page-schedule", group: "Pages", label: "Schedule Call", hint: localePath(lang, "/schedule"), run: "href", value: localePath(lang, "/schedule") },
    ...projects
      .filter((p) => p.site ?? p.github)
      .map((p): PaletteItem => ({ id: `project-${p.slug}`, group: "Projects", label: p.name, hint: p.kind, keywords: p.skills.join(" "), run: "external", value: p.site ?? p.github })),
    { id: "theme", group: "Actions", label: d.palette.items.theme, keywords: "dark light mode hell dunkel", run: "theme" },
    { id: "vcard", group: "Actions", label: d.palette.items.vcard, keywords: "save contact vcard", run: "download", value: "/api/vcard" },
    { id: "shortcuts", group: "Actions", label: d.palette.items.shortcuts, keywords: "keys help ?", run: "event", value: "shortcuts:open" },
    ...(SITE.call ? [{ id: "call", group: "Actions", label: d.palette.items.call, run: "external", value: SITE.call } as PaletteItem] : []),
    { id: "email", group: "Actions", label: d.palette.items.email, hint: SITE.email, run: "copy", value: SITE.email },
    { id: "github", group: "Actions", label: d.palette.items.github, run: "external", value: SITE.github },
    { id: "linkedin", group: "Actions", label: d.palette.items.linkedin, run: "external", value: SITE.linkedin },
  ];
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { projects } = await getSiteContent(lang);
  const showWriting = (await getPostList("post", lang)).length > 0;
  const showNotes = (await getPostList("note", lang)).length > 0;

  return (
    <html lang={lang} className={`${sans.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint so a stored theme never flashes the wrong one. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + INTRO_SCRIPT }} />
      </head>
      <body>
        <LocaleProvider lang={lang}>
          <Loader />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(personJsonLd) }} />
          <div className="site">
            <a className="skip-link" href="#main">
              {DICT[lang].chrome.skip}
            </a>
            <Nav showWriting={showWriting} showNotes={showNotes} />
            <main id="main">{children}</main>
            <Footer />
          </div>
          <Particles />
          <Motion />
          <Scramble />
          <Life />
          <CommandPalette items={paletteItems(lang, showWriting, showNotes, projects)} />
          <Analytics />
          <Events />
          <ShortcutsHelp />
          <ZoroAiBubble />
          <InteractiveTerminal />
          <DevModeHud />
        </LocaleProvider>
      </body>
    </html>
  );
}
