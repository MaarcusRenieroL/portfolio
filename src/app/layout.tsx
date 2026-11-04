import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Footer, Nav } from "~/components/site/chrome";
import { Loader } from "~/components/site/loader";
import { Life } from "~/components/site/life";
import { SITE } from "~/lib/content";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const code = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-code", display: "swap" });

const DESC =
  "Full stack engineer in Chennai, backend-leaning: Java/Spring Boot and TypeScript/Next.js, sharpening toward AI, cloud and security.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : SITE.url),
  title: { default: `${SITE.name} | Full stack engineer in Chennai (Java, Spring Boot, Next.js)`, template: `%s | ${SITE.name}` },
  description: DESC,
  alternates: { canonical: "./" },
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
  themeColor: "#0b0b0b",
  colorScheme: "dark",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${code.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <div className="site">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <Loader />
        <Life />
        <Analytics />
      </body>
    </html>
  );
}
