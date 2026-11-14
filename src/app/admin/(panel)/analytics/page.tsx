import Link from "next/link";
import { query } from "~/lib/server/db";

export const metadata = { title: "Analytics" };

const LABELS: Record<string, string> = {
  "resume-download": "Resume downloads",
  "resume-open": "Resume opened",
  "resume-print": "Resume printed",
  "vcard-download": "Contact card",
  "book-call": "Book a call",
  "project-click": "Project clicks",
  "social-click": "Social clicks",
  "email-click": "Email clicks",
  "contact-sent": "Contact messages sent",
};

export default async function Analytics({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = (await searchParams).days === "30" ? 30 : 7;
  const since = `now() - interval '${days} days'`;
  const [totals, pages, actions, targets, daily] = await Promise.all([
    query<{ views: string; visitors: string }>(`select count(*) filter (where kind='view') views, count(distinct visitor) filter (where kind='view') visitors from site_event where at > ${since}`),
    query<{ path: string; n: string }>(`select path, count(*) n from site_event where kind='view' and at > ${since} group by path order by n desc limit 10`),
    query<{ kind: string; n: string }>(`select kind, count(*) n from site_event where kind <> 'view' and at > ${since} group by kind order by n desc`),
    query<{ kind: string; target: string; n: string }>(`select kind, target, count(*) n from site_event where kind in ('social-click','project-click','email-click') and target is not null and at > ${since} group by kind, target order by n desc limit 12`),
    query<{ label: string; n: string }>(`select to_char(d, 'Mon DD') label, n from (select date_trunc('day', at) d, count(*) n from site_event where kind='view' and at > ${since} group by 1) t order by d`),
  ]);
  const max = Math.max(1, ...daily.rows.map((r) => Number(r.n)));
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Analytics</h1>
        <span className="row">
          <Link className="btn" aria-current={days === 7} href="/admin/analytics?days=7">7 days</Link>
          <Link className="btn" aria-current={days === 30} href="/admin/analytics?days=30">30 days</Link>
        </span>
      </div>
      <p className="muted">Your own visits are never counted, nor are bots or anyone sending Do Not Track. No cookies and no addresses are stored; a visitor is a hash that changes every day.</p>
      <section className="grid" style={{ margin: "16px 0" }}>
        <div className="stat"><span className="n">{totals.rows[0].views}</span><span>page views</span></div>
        <div className="stat"><span className="n">{totals.rows[0].visitors}</span><span>visitors (daily)</span></div>
        {actions.rows.map((r) => (
          <div className="stat" key={r.kind}><span className="n">{r.n}</span><span>{LABELS[r.kind] ?? r.kind}</span></div>
        ))}
      </section>

      <h2>Views per day</h2>
      {daily.rows.length === 0 ? <p className="muted">Nothing yet.</p> : (
        <div className="list">
          {daily.rows.map((r) => (
            <div className="item" key={r.label}>
              <span style={{ width: 64 }}>{r.label}</span>
              <span style={{ flex: 1 }}><span style={{ display: "block", height: 8, borderRadius: 4, background: "var(--accent, currentColor)", width: `${(Number(r.n) / max) * 100}%` }} /></span>
              <span>{r.n}</span>
            </div>
          ))}
        </div>
      )}

      <h2>Top pages</h2>
      <div className="list">
        {pages.rows.length === 0 && <p className="muted">Nothing yet.</p>}
        {pages.rows.map((r) => (
          <div className="item" key={r.path}><span style={{ flex: 1 }}>{r.path}</span><span>{r.n}</span></div>
        ))}
      </div>

      <h2>Who got clicked</h2>
      <div className="list">
        {targets.rows.length === 0 && <p className="muted">Nothing yet.</p>}
        {targets.rows.map((r) => (
          <div className="item" key={r.kind + r.target}><span style={{ flex: 1 }}>{LABELS[r.kind] ?? r.kind}: {r.target}</span><span>{r.n}</span></div>
        ))}
      </div>
    </>
  );
}
