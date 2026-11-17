import { requireAdmin } from "~/lib/server/session";
import { ArrowUpRight, CalendarClock, CheckCircle2, ImageOff, Languages, Mail, PencilLine, Plus } from "lucide-react";
import Link from "next/link";
import { deFields, SPECS } from "~/lib/cms-fields";
import { PENDING_SQL } from "~/lib/server/admin-queries";
import { query } from "~/lib/server/db";
import { isKind, KINDS, type Kind } from "~/lib/server/store";
import { Suspense } from "react";
import { kindIcon, PageHeader } from "../_components/admin-ui";
import { SystemStatus, SystemStatusLoading } from "../_components/system-status";

export const metadata = { title: "Overview" };

type Todo = { href: string; icon: React.ReactNode; title: string; detail: string };

const safe = <T,>(p: Promise<{ rows: T[] }>): Promise<T[]> => p.then((r) => r.rows).catch(() => []);

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

const editHref = (kind: string, key: string) => `/admin/content/${kind}/${encodeURIComponent(key)}`;

export default async function Overview() {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  const [pending, rows, noAlt, bookings, week, daily, collections, unread] = await Promise.all([
    safe(query<{ kind: string; key: string; draft: Record<string, unknown>; published: boolean }>(
      `select kind, key, draft, published is not null as published from content_item where not deleted and ${PENDING_SQL} order by updated_at desc limit 8`,
    )),
    safe(query<{ kind: string; key: string; draft: Record<string, unknown>; draft_de: Record<string, unknown> | null; updated_at: string }>(
      "select kind, key, draft, draft_de, updated_at::text from content_item where not deleted order by updated_at desc",
    )),
    safe(query<{ n: number }>("select count(*)::int n from media where alt = '' and content_type like 'image/%'")),
    safe(query<{ name: string; email: string; starts_at: string; duration: number }>(
      "select name, email, starts_at::text, duration from meeting_booking where starts_at > now() order by starts_at limit 5",
    )),
    safe(query<{ views: number; visitors: number; prev: number; actions: number }>(
      `select count(*) filter (where kind = 'view' and at > now() - interval '7 days')::int views,
              count(distinct visitor) filter (where kind = 'view' and at > now() - interval '7 days')::int visitors,
              count(*) filter (where kind = 'view' and at <= now() - interval '7 days')::int prev,
              count(*) filter (where kind <> 'view' and at > now() - interval '7 days')::int actions
         from site_event where at > now() - interval '14 days'`,
    )),
    safe(query<{ day: string; n: number }>(
      `select to_char(d, 'YYYY-MM-DD') as day, coalesce(n, 0)::int n
         from generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') d
         left join (select date_trunc('day', at) t, count(*) n from site_event where kind = 'view' and at > now() - interval '14 days' group by 1) e on e.t = d
        order by d`,
    )),
    safe(query<{ kind: string; n: number; live: number; drafts: number }>(
      `select kind, count(*)::int n, count(*) filter (where published is not null)::int live, count(*) filter (where ${PENDING_SQL})::int drafts
         from content_item where not deleted group by kind`,
    )),
    safe(query<{ name: string; reason: string; n: number }>(
      `select (array_agg(name order by created_at desc))[1] as name, (array_agg(reason order by created_at desc))[1] as reason, count(*)::int n
         from contact_message where read_at is null and not archived having count(*) > 0`,
    )),
  ]);

  const title = (kind: string, key: string, draft: Record<string, unknown>) => String((isKind(kind) && draft[SPECS[kind].titleField]) || key);

  // German is missing when a translatable field has English text and no German.
  const missingDe = rows.filter((r) => {
    if (!isKind(r.kind)) return false;
    const fields = deFields(r.kind).filter((f) => f.type !== "steps");
    return fields.some((f) => {
      const en = r.draft[f.name];
      const hasEn = Array.isArray(en) ? en.length > 0 : typeof en === "string" && en.trim() !== "";
      const de = r.draft_de?.[f.name];
      const hasDe = Array.isArray(de) ? de.length > 0 : typeof de === "string" && de.trim() !== "";
      return hasEn && !hasDe;
    });
  });

  const todos: Todo[] = [
    ...(unread[0]?.n
      ? [
          {
            href: "/admin/inbox",
            icon: <Mail className="h-4 w-4 text-[var(--green)]" />,
            title: unread[0].n === 1 ? `New message from ${unread[0].name}` : `${unread[0].n} new messages`,
            detail: unread[0].n === 1 ? "Open the inbox to read and reply." : `Latest from ${unread[0].name}.`,
          },
        ]
      : []),
    ...bookings.map((b) => ({
      href: "/admin/inbox?tab=calls",
      icon: <CalendarClock className="h-4 w-4 text-[var(--green)]" />,
      title: `Call with ${b.name}`,
      detail: `${new Date(b.starts_at).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · ${b.duration} min`,
    })),
    ...pending.map((p) => ({
      href: editHref(p.kind, p.key),
      icon: <PencilLine className="h-4 w-4 text-[var(--fg-3)]" />,
      title: title(p.kind, p.key, p.draft),
      detail: `${isKind(p.kind) ? SPECS[p.kind].label : p.kind} · ${p.published ? "unpublished changes" : "never published"}`,
    })),
    ...(missingDe.length
      ? [
          {
            href: editHref(missingDe[0].kind, missingDe[0].key),
            icon: <Languages className="h-4 w-4 text-[var(--fg-3)]" />,
            title: `${missingDe.length} ${missingDe.length === 1 ? "item needs" : "items need"} German`,
            detail: missingDe
              .slice(0, 3)
              .map((r) => title(r.kind, r.key, r.draft))
              .join(", ") + (missingDe.length > 3 ? "…" : ""),
          },
        ]
      : []),
    ...(noAlt[0]?.n
      ? [
          {
            href: "/admin/media",
            icon: <ImageOff className="h-4 w-4 text-[var(--fg-3)]" />,
            title: `${noAlt[0].n} ${noAlt[0].n === 1 ? "image has" : "images have"} no alt text`,
            detail: "Screen readers and search engines need a description.",
          },
        ]
      : []),
  ];

  const w = week[0] ?? { views: 0, visitors: 0, prev: 0, actions: 0 };
  const delta = w.prev ? Math.round(((w.views - w.prev) / w.prev) * 100) : null;
  const peak = Math.max(1, ...daily.map((d) => d.n));
  const byKind = Object.fromEntries(collections.map((c) => [c.kind, c]));
  const recent = rows.slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Overview" description="What needs you, what changed, and how the site is doing.">
        <Link href="/admin/content/post/new" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--green)] px-3 text-[13px] font-medium text-[var(--green-ink)] transition-opacity hover:opacity-90 pointer-coarse:h-10">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </PageHeader>

      {/* Numbers */}
      <section aria-label="Last 7 days" className="mb-8 grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--line)] sm:grid-cols-4">
        {[
          { label: "Views, 7 days", value: w.views, extra: delta === null ? null : `${delta > 0 ? "+" : ""}${delta}% vs prior week` },
          { label: "Visitors, 7 days", value: w.visitors },
          { label: "Clicks and downloads", value: w.actions },
          { label: "Upcoming calls", value: bookings.length },
        ].map((s, i) => (
          <div key={s.label} className={`px-4 py-4 sm:px-5 ${i % 2 ? "border-l border-[var(--line)]" : ""} ${i > 1 ? "border-t border-[var(--line)] sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
            <p className="text-[12px] text-[var(--fg-3)]">{s.label}</p>
            <p className="mt-1 font-mono text-2xl tabular-nums tracking-tight text-[var(--fg)]">{s.value.toLocaleString("en")}</p>
            {s.extra && <p className={`mt-0.5 text-[11px] ${delta !== null && delta >= 0 ? "text-[var(--green)]" : "text-[var(--fg-3)]"}`}>{s.extra}</p>}
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0 space-y-8">
          {/* Needs attention */}
          <section aria-labelledby="todo-h">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 id="todo-h" className="text-[13px] font-medium text-[var(--fg)]">
                Needs your attention
              </h2>
              {todos.length > 0 && <span className="font-mono text-[11px] tabular-nums text-[var(--fg-3)]">{todos.length}</span>}
            </div>
            {todos.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--green)]" aria-hidden="true" />
                <div>
                  <p className="text-[13px] text-[var(--fg)]">All caught up</p>
                  <p className="text-[12px] text-[var(--fg-3)]">Everything is published, translated and described.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
                {todos.map((t, i) => (
                  <li key={`${t.href}-${i}`}>
                    <Link href={t.href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)] pointer-coarse:py-3.5">
                      <span className="shrink-0" aria-hidden="true">
                        {t.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-[var(--fg)]">{t.title}</span>
                        <span className="block truncate text-[12px] text-[var(--fg-3)]">{t.detail}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-3)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent edits */}
          <section aria-labelledby="recent-h">
            <h2 id="recent-h" className="mb-2 text-[13px] font-medium text-[var(--fg)]">
              Recently edited
            </h2>
            {recent.length === 0 ? (
              <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">
                No content yet. Open a collection and import the site&apos;s current content to start.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">
                {recent.map((r) => {
                  const Icon = kindIcon(r.kind);
                  return (
                    <li key={`${r.kind}/${r.key}`}>
                      <Link href={editHref(r.kind, r.key)} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--hover)] pointer-coarse:py-3.5">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--fg-3)]" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--fg)]">{title(r.kind, r.key, r.draft)}</span>
                        <span className="hidden text-[12px] text-[var(--fg-3)] sm:inline">{isKind(r.kind) ? SPECS[r.kind].label : r.kind}</span>
                        <span className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--fg-3)]">{ago(r.updated_at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-8">
          {/* Traffic */}
          <section aria-labelledby="traffic-h">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 id="traffic-h" className="text-[13px] font-medium text-[var(--fg)]">
                Page views, 14 days
              </h2>
              <Link href="/admin/analytics" className="text-[12px] text-[var(--fg-3)] hover:text-[var(--fg)]">
                Analytics →
              </Link>
            </div>
            <div className="rounded-xl border border-[var(--line)] px-4 pb-3 pt-4">
              <div className="flex h-28 items-end gap-1" role="img" aria-label={`Daily page views: ${daily.map((d) => d.n).join(", ")}`}>
                {daily.map((d, i) => (
                  <div key={d.day} className="group relative flex h-full flex-1 items-end">
                    <div
                      className={`w-full rounded-sm transition-colors ${i === daily.length - 1 ? "bg-[var(--green)]" : "bg-[var(--line-2)] group-hover:bg-[var(--fg-3)]"}`}
                      style={{ height: `${Math.max(3, (d.n / peak) * 100)}%` }}
                    />
                    <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--fg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--bg)] group-hover:block">
                      {d.n}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--fg-3)]">
                <span>{daily[0] ? new Date(daily[0].day).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</span>
                <span>Today</span>
              </div>
            </div>
          </section>

          {/* Collections */}
          <section aria-labelledby="col-h">
            <h2 id="col-h" className="mb-2 text-[13px] font-medium text-[var(--fg)]">
              Content
            </h2>
            <table className="w-full overflow-hidden rounded-xl border border-[var(--line)] text-[13px]">
              <thead className="sr-only">
                <tr>
                  <th>Collection</th>
                  <th>Items</th>
                  <th>Unpublished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {(KINDS as readonly Kind[]).map((k) => {
                  const c = byKind[k];
                  const Icon = kindIcon(k);
                  return (
                    <tr key={k} className="transition-colors hover:bg-[var(--hover)]">
                      <td className="p-0">
                        <Link href={`/admin/content/${k}`} className="flex items-center gap-2.5 px-4 py-2.5 text-[var(--fg-2)] hover:text-[var(--fg)] pointer-coarse:py-3">
                          <Icon className="h-4 w-4 text-[var(--fg-3)]" aria-hidden="true" />
                          {SPECS[k].plural}
                        </Link>
                      </td>
                      <td className="w-12 px-2 text-right font-mono text-[12px] tabular-nums text-[var(--fg-2)]">{c?.n ?? 0}</td>
                      <td className="w-24 pr-4 text-right text-[11px]">
                        {c?.drafts ? <span className="text-[var(--green)]">{c.drafts} pending</span> : <span className="text-[var(--fg-3)]">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <Suspense fallback={<SystemStatusLoading />}>
            <SystemStatus />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
