import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, JetBrains_Mono, Zen_Kaku_Gothic_New } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Footer } from "~/components/site/footer";
import { Nav } from "~/components/site/nav";
import { Providers } from "~/components/site/providers";
import { SITE } from "~/lib/content";

const dela = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-dela", display: "swap" });
const zen = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-zen", display: "swap" });
const jetbrains = JetBrains_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const DESC =
  "Full stack engineer in Chennai, backend-leaning: Java/Spring Boot and TypeScript/Next.js, sharpening toward AI, cloud and security.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : SITE.url),
  title: { default: `${SITE.name} — Full stack engineer`, template: `%s | ${SITE.name}` },
  description: DESC,
  openGraph: {
    title: SITE.name,
    description: DESC,
    url: SITE.url,
    siteName: SITE.domain,
    images: [{ url: "/og", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050A07" },
    { media: "(prefers-color-scheme: light)", color: "#F2F0E6" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: "Full stack engineer",
  url: SITE.url,
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  sameAs: [SITE.github, SITE.linkedin],
};

// Picks the motion tier before first paint: 0 reduced-motion, 1 lite, 2 full.
const TIER = `(function(d){var e=d.documentElement,n=navigator,c=n.connection,t=2;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)t=0;
else if((n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4||(c&&c.saveData))t=1;
e.dataset.tier=t;e.classList.add('js')})(document)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${dela.variable} ${zen.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TIER }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <Providers>
          <div className="site">
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <Nav />
            <main id="main">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
