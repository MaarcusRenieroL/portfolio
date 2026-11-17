import Link from "next/link";
import { PageHeader } from "./admin-ui";

type Totals = { views: string; visitors: string };

const RANGES = [7, 30, 90] as const;

/** A ranked list with an inline bar per row, so the shape of the data reads at a glance. */
function Ranked({ title, rows, empty, mono }: { title: string; rows: { label: string; sub?: string; n: number }[]; empty: string; mono?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section aria-label={title} className="min-w-0">
      <h2 className="mb-2 text-[13px] font-medium text-[var(--fg)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-[var(--line)] px-4 py-6 text-center text-[13px] text-[var(--fg-3)]">{empty}</p>
      ) : (
        <ol className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
          {rows.map((r) => (
            <li key={`${r.label}-${r.sub ?? ""}`} className="relative px-4 py-2.5">
              <span className="absolute inset-y-1 left-1 rounded bg-[var(--hover)]" style={{ width: `calc(${(r.n / max) * 100}% - 0.5rem)` }} aria-hidden="true" />
              <span className="relative flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[13px] text-[var(--fg)] ${mono ? "font-mono text-[12px]" : ""}`}>{r.label}</span>
                  {r.sub && <span className="block truncate text-[11px] text-[var(--fg-3)]">{r.sub}</span>}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-[var(--fg-2)]">{r.n.toLocaleString("en")}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * First-party, cookieless analytics: views and visitors for the range, a daily chart, the
 * most viewed pages, what people clicked, and where outbound clicks went.
 */
export function AnalyticsDashboard({
  days,
  totals,
  pages,
  actions,
  targets,
  daily,
  labels,
}: {
  days: number;
  totals: Totals;
  pages: { path: string; n: string }[];
  actions: { kind: string; n: string }[];
  targets: { kind: string; target: string; n: string }[];
  daily: { label: string; n: string }[];
  labels: Record<string, string>;
}) {
  const views = Number(totals.views);
  const visitors = Number(totals.visitors);
  const clicks = actions.reduce((a, r) => a + Number(r.n), 0);
  const peak = Math.max(1, ...daily.map((d) => Number(d.n)));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Analytics" description="Cookieless and first-party. Visitors are a daily-rotating hash, never an IP.">
        <div className="inline-flex rounded-md border border-[var(--line)] p-0.5" role="tablist" aria-label="Time range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              aria-current={days === r ? "page" : undefined}
              className={`inline-flex h-7 items-center rounded px-2.5 text-[12px] transition-colors pointer-coarse:h-9 ${
                days === r ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              {r} days
            </Link>
          ))}
        </div>
      </PageHeader>

      <section aria-label="Totals" className="mb-8 grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--line)]">
        {[
          ["Page views", views],
          ["Visitors", visitors],
          ["Clicks and downloads", clicks],
        ].map(([label, n], i) => (
          <div key={label} className={`px-4 py-4 sm:px-5 ${i ? "border-l border-[var(--line)]" : ""}`}>
            <p className="text-[12px] text-[var(--fg-3)]">{label}</p>
            <p className="mt-1 font-mono text-xl tabular-nums tracking-tight text-[var(--fg)] sm:text-2xl">{Number(n).toLocaleString("en")}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="daily-h" className="mb-8">
        <h2 id="daily-h" className="mb-2 text-[13px] font-medium text-[var(--fg)]">
          Views per day
        </h2>
        <div className="rounded-xl border border-[var(--line)] px-4 pb-3 pt-6">
          {daily.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--fg-3)]">No visits in this range yet.</p>
          ) : (
            <>
              <div className="flex h-40 items-end gap-[3px]" role="img" aria-label={`Views per day: ${daily.map((d) => `${d.label} ${d.n}`).join(", ")}`}>
                {daily.map((d) => (
                  <div key={d.label} className="group relative flex h-full min-w-0 flex-1 items-end">
                    <div className="w-full rounded-sm bg-[var(--line-2)] transition-colors group-hover:bg-[var(--green)]" style={{ height: `${Math.max(2, (Number(d.n) / peak) * 100)}%` }} />
                    <span className="pointer-events-none absolute -top-6 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--fg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--bg)] group-hover:block">
                      {d.label} · {d.n}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--fg-3)]">
                <span>{daily[0]?.label}</span>
                <span>{daily[daily.length - 1]?.label}</span>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Ranked title="Top pages" mono rows={pages.map((p) => ({ label: p.path, n: Number(p.n) }))} empty="No page views yet." />
        <div className="space-y-8">
          <Ranked title="What people clicked" rows={actions.map((a) => ({ label: labels[a.kind] ?? a.kind, n: Number(a.n) }))} empty="No clicks or downloads yet." />
          <Ranked
            title="Where clicks went"
            rows={targets.map((t) => ({ label: t.target, sub: labels[t.kind] ?? t.kind, n: Number(t.n) }))}
            empty="No outbound clicks yet."
          />
        </div>
      </div>
    </div>
  );
}
