import Link from "next/link";
import { query } from "~/lib/server/db";
import {
  AwardIcon,
  BarChartIcon,
  BriefcaseIcon,
  FileTextIcon,
  FolderIcon,
  GraduationCapIcon,
  ShieldIcon,
  SparklesIcon,
  StickyNoteIcon,
} from "../_components/icons";

export const metadata = { title: "Overview" };

const KIND_META: Record<string, { label: string; icon: React.ComponentType<{ width?: number; height?: number; className?: string }> }> = {
  project: { label: "Projects", icon: FolderIcon },
  role: { label: "Experience", icon: BriefcaseIcon },
  education: { label: "Education", icon: GraduationCapIcon },
  skillgroup: { label: "Skills", icon: SparklesIcon },
  certificate: { label: "Certificates", icon: AwardIcon },
  post: { label: "Blog Posts", icon: FileTextIcon },
  note: { label: "Notes", icon: StickyNoteIcon },
};

export default async function Overview() {
  const [c, e] = await Promise.all([
    query<{ kind: string; n: string; drafts: string }>(
      `select kind, count(*) n, count(*) filter (where published is null or draft is distinct from published) drafts from content_item where not deleted group by kind order by kind`,
    ),
    query<{ n: string }>("select count(*) n from site_event where at > now() - interval '7 days'"),
  ]);

  return (
    <div className="admin-overview">
      <div className="admin-section-header">
        <div className="admin-section-header-top">
          <div className="admin-section-title-wrap">
            <h1>Overview</h1>
            <span className="badge live">Live Dashboard</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-header-link"
            title="Open live portfolio in a new tab"
          >
            Visit Portfolio ↗
          </a>
        </div>
        <p className="lead muted" style={{ margin: 0 }}>
          Manage your content collections, draft revisions, translations, and site analytics.
        </p>
      </div>

      <section className="admin-overview-section">
        <div className="admin-subheading">
          <h2>Content Collections</h2>
        </div>

        <div className="grid admin-grid">
          {c.rows.map((r) => {
            const meta = KIND_META[r.kind] ?? { label: r.kind, icon: FolderIcon };
            const Icon = meta.icon;
            const draftsCount = Number(r.drafts);

            return (
              <Link key={r.kind} className="stat admin-stat-card" href={`/admin/content/${r.kind}`}>
                <div className="admin-card-head">
                  <span className="admin-card-title">
                    <Icon width={16} height={16} className="admin-card-icon" />
                    <span>{meta.label}</span>
                  </span>
                  {draftsCount > 0 && (
                    <span className="badge">{draftsCount} unpublished</span>
                  )}
                </div>
                <div className="admin-card-body">
                  <span className="n">{r.n}</span>
                  <span className="admin-card-action">Manage collection →</span>
                </div>
              </Link>
            );
          })}

          {/* Analytics Card */}
          <Link className="stat admin-stat-card" href="/admin/analytics">
            <div className="admin-card-head">
              <span className="admin-card-title">
                <BarChartIcon width={16} height={16} className="admin-card-icon" />
                <span>Events Logged</span>
              </span>
              <span className="badge live">7 Days</span>
            </div>
            <div className="admin-card-body">
              <span className="n">{e.rows[0].n}</span>
              <span className="admin-card-action">View analytics →</span>
            </div>
          </Link>
        </div>

        {c.rows.length === 0 && (
          <div className="admin-empty-state">
            <p className="muted" style={{ margin: 0 }}>No content imported yet.</p>
            <p className="muted small" style={{ margin: "4px 0 16px" }}>
              Seed your portfolio content from any collection page or create items directly.
            </p>
            <Link className="btn" href="/admin/content/project">
              Open Projects Collection
            </Link>
          </div>
        )}
      </section>

      <section className="admin-overview-section">
        <div className="admin-subheading">
          <h2>System Quick Links</h2>
        </div>

        <div className="admin-shortcuts-grid">
          <Link href="/admin/analytics" className="admin-shortcut-card">
            <div className="admin-card-icon-box">
              <BarChartIcon width={20} height={20} />
            </div>
            <div>
              <strong>Analytics & Event Tracker</strong>
              <p className="muted small" style={{ margin: "4px 0 0" }}>
                Page views, resume downloads, outbound links
              </p>
            </div>
          </Link>

          <Link href="/admin/security" className="admin-shortcut-card">
            <div className="admin-card-icon-box">
              <ShieldIcon width={20} height={20} />
            </div>
            <div>
              <strong>Security & Access Control</strong>
              <p className="muted small" style={{ margin: "4px 0 0" }}>
                Passkeys, active sessions, audit trail, sign out
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
