import Link from "next/link";
import { query } from "~/lib/server/db";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const [c, e] = await Promise.all([
    query<{ kind: string; n: string; drafts: string }>(
      `select kind, count(*) n, count(*) filter (where published is null or draft is distinct from published) drafts from content_item where not deleted group by kind order by kind`,
    ),
    query<{ n: string }>("select count(*) n from site_event where at > now() - interval '7 days'"),
  ]);
  return (
    <>
      <h1>Overview</h1>
      <section className="grid">
        {c.rows.map((r) => (
          <Link key={r.kind} className="stat" href={`/admin/content/${r.kind}`}>
            <span className="n">{r.n}</span>
            <span>{r.kind}</span>
            {Number(r.drafts) > 0 && <span className="badge">{r.drafts} unpublished</span>}
          </Link>
        ))}
        <Link className="stat" href="/admin/analytics"><span className="n">{e.rows[0].n}</span><span>events, 7 days</span></Link>
      </section>
      {c.rows.length === 0 && <p className="muted">No content imported yet. Run the seed from the Content pages.</p>}
    </>
  );
}
