import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { Navbar } from "~/components/layouts/navbar";
import { Footer } from "~/components/layouts/footer";
import { LenisProvider } from "~/components/providers/lenis-provider";
import { PageTransitionProvider } from "~/components/providers/page-transition-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Maarcus Reniero L",
    template: "%s | Maarcus Reniero L",
  },
  description: "Trying to be the jack of all trades",

  metadataBase: new URL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://maarcus.dev"
  ),

  openGraph: {
    title: "Maarcus Reniero L",
    description: "Trying to be the jack of all trades",
    url: "https://maarcus.dev",
    siteName: "Maarcus Reniero L",
    images: [
      {
        url: "/me.png",
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-mono antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LenisProvider>
            <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-border/55 bg-background/90 px-5 py-5 shadow-[0_0_80px_rgba(0,0,0,0.18)] backdrop-blur md:px-10 md:py-8">
              <Navbar />
              <main className="flex flex-1 py-12 md:py-16">
                <PageTransitionProvider>
                  {children}
                </PageTransitionProvider>
              </main>
              <Footer />
            </div>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
