import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Content } from "~/components/content";
import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/themes/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Maarcus Reniero L",
  description:
    "Explore my web development projects and skills. Discover my expertise in creating dynamic, responsive web applications with a focus on modern technologies and best practices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          poppins.className,
          "h-full flex justify-center items-center",
        )}
      >
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <Content>{children}</Content>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
