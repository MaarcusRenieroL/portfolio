import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { VercelAnalytics } from "~/components/site/vercel-analytics";
import "../globals.css";
import { Footer, Nav } from "~/components/site/chrome";
import { LazyOverlays } from "~/components/site/lazy-overlays";
import { IdleEffects } from "~/components/site/idle-effects";
import { Loader } from "~/components/site/loader";
import { SCHEDULE_EVENT } from "~/lib/booking";
import { LocaleProvider } from "~/components/site/locale";
import { NAV_LINKS, SITE } from "~/lib/content";
import { getPostList } from "~/lib/posts";
import { DICT } from "~/lib/dict";
import { LANGS, isLang, localePath, type Lang } from "~/lib/i18n";
import { getSiteContent, type SkillGroup } from "~/lib/site-content";
import type { Certificate, Project, Role } from "~/lib/schema";
import { jsonLdString } from "~/lib/utils";
import { siteGraph } from "~/lib/structured-data";
import { getSiteSettings } from "~/lib/server/settings";

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

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { projects, roles, skills, certificates, education } = await getSiteContent(lang);
  const settings = await getSiteSettings();
  const graph = siteGraph({ lang, roles, education, skills: skills.flatMap((g) => g.items), photo: settings.photo || undefined });
  const showWriting = (await getPostList("post", lang)).length > 0;
  const showNotes = (await getPostList("note", lang)).length > 0;

  return (
    <html lang={lang} className={`${sans.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        {/* Raw inline script, not next/script: beforeInteractive in the App Router is
            queued and runs after first paint, which would flash the wrong theme.
            This runs during parse. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + INTRO_SCRIPT }} />
        {/* In the HTML itself so crawlers read it without running JavaScript. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(graph) }} />
      </head>
      <body>
        <Loader />
        <LocaleProvider lang={lang}>
          <div className="site">
            <a className="skip-link" href="#main">
              {DICT[lang].chrome.skip}
            </a>
            <Nav showWriting={showWriting} showNotes={showNotes} />
            <main id="main">{children}</main>
            <Footer />
          </div>
          <LazyOverlays />
          <IdleEffects />
          {/* Only on Vercel: elsewhere its script 404s. */}
          {process.env.VERCEL ? <VercelAnalytics /> : null}
        </LocaleProvider>
      </body>
    </html>
  );
}
