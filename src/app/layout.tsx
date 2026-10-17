import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { HighlightProvider } from "~/components/providers/highlight-provider";
import { ClickRipple } from "~/components/misc/click-ripple";
import { QuakeTerminal } from "~/components/misc/quake-terminal";
import { HudTelemetry } from "~/components/misc/hud-telemetry";
import { Navbar } from "~/components/layouts/navbar";
import { Footer } from "~/components/layouts/footer";
import { LenisProvider } from "~/components/providers/lenis-provider";
import { PageTransitionProvider } from "~/components/providers/page-transition-provider";
import { ScrollProgress } from "~/components/misc/scroll-progress";
import { LINKS } from "~/lib/constants";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "maarcus reniero l",
  jobTitle: "full-stack software engineer",
  url: "https://maarcus.dev",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressCountry: "IN",
  },
  sameAs: LINKS.filter((link) => link.url.startsWith("http")).map(
    (link) => link.url,
  ),
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "maarcus reniero l",
    template: "%s | maarcus reniero l",
  },
  description:
    "full-stack software engineer building product-minded web apps across frontend, backend, data, and tooling.",

  metadataBase: new URL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://maarcus.dev",
  ),

  openGraph: {
    title: "maarcus reniero l",
    description:
      "full-stack software engineer building product-minded web apps across frontend, backend, data, and tooling.",
    url: "https://maarcus.dev",
    siteName: "maarcus reniero l",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} min-h-screen antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <HighlightProvider>
            <LenisProvider>
              <PageTransitionProvider>
                <ScrollProgress />
                <ClickRipple />
                <QuakeTerminal />
                <Navbar />

                <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col border-x border-border/55 bg-background/90 px-5 py-5 shadow-[0_0_80px_rgba(0,0,0,0.18)] backdrop-blur md:px-10 md:py-8">
                  <HudTelemetry />
                  <main className="flex flex-1 pb-12 pt-4 md:pb-16 md:pt-6">{children}</main>

                  <Footer />
                </div>
              </PageTransitionProvider>
            </LenisProvider>
          </HighlightProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
