import Link from "next/link";
import { requireAdmin } from "~/lib/server/session";
import { Logout } from "../_components/logout";

const NAV: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/content/project", "Projects"],
  ["/admin/content/role", "Experience"],
  ["/admin/content/education", "Education"],
  ["/admin/content/skillgroup", "Skills"],
  ["/admin/content/certificate", "Certificates"],
  ["/admin/content/post", "Blog"],
  ["/admin/content/note", "Notes"],
  ["/admin/analytics", "Analytics"],
  ["/admin/security", "Security"],
];

/** Every page below this layout is behind the session check. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="shell">
      <aside className="side">
        <strong className="brand">Admin</strong>
        <nav aria-label="Admin">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="side-foot">
          <a href="/" target="_blank" rel="noopener">View site ↗</a>
          <Logout />
        </div>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
