import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { themeColor: "#0b0b0c", colorScheme: "dark" };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="adm">{children}</body>
    </html>
  );
}
