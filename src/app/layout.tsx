import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrains.className} suppressHydrationWarning>
      <body>
        <main className="container relative p-4 mx-auto overflow-auto scroll-my-12 print:p-12 md:p-16">
          <section className="w-full max-w-2xl mx-auto space-y-8 bg-white print:space-y-6">
            {children}
            <Analytics />
          </section>
        </main>
      </body>
    </html>
  );
}
