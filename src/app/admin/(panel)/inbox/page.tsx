import { requireAdmin } from "~/lib/server/session";
import Link from "next/link";
import { query } from "~/lib/server/db";
import { PageHeader } from "../../_components/admin-ui";
import { CallsList, MessagesInbox, type Booking, type Message } from "../../_components/inbox";

export const metadata = { title: "Inbox" };

type Tab = "messages" | "archived" | "calls";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  const raw = (await searchParams).tab;
  const tab: Tab = raw === "archived" || raw === "calls" ? raw : "messages";

  const [messages, counts, bookings] = await Promise.all([
    tab === "calls"
      ? Promise.resolve({ rows: [] as Message[] })
      : query<Message>(
          "select id::int as id, name, email, org, reason, message, created_at::text, read_at::text, archived from contact_message where archived = $1 order by created_at desc limit 200",
          [tab === "archived"],
        ),
    query<{ unread: number; inbox: number; archived: number; upcoming: number }>(
      `select (select count(*) from contact_message where read_at is null and not archived)::int unread,
              (select count(*) from contact_message where not archived)::int inbox,
              (select count(*) from contact_message where archived)::int archived,
              (select count(*) from meeting_booking where starts_at > now())::int upcoming`,
    ),
    tab === "calls"
      ? query<Booking>("select id, name, email, company, notes, duration, visitor_tz, starts_at::text, created_at::text from meeting_booking order by starts_at desc nulls last")
      : Promise.resolve({ rows: [] as Booking[] }),
  ]);

  const c = counts.rows[0];
  const now = Date.now();
  const upcoming = bookings.rows.filter((b) => b.starts_at && new Date(b.starts_at).getTime() > now).reverse();
  const past = bookings.rows.filter((b) => !b.starts_at || new Date(b.starts_at).getTime() <= now);

  const tabs: [Tab, string, number][] = [
    ["messages", "Messages", c.inbox],
    ["calls", "Calls", c.upcoming],
    ["archived", "Archived", c.archived],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Inbox" description={c.unread ? `${c.unread} unread ${c.unread === 1 ? "message" : "messages"}.` : "Messages from the contact form and booked calls."}>
        <nav className="inline-flex rounded-md border border-[var(--line)] p-0.5" aria-label="Inbox sections">
          {tabs.map(([id, label, n]) => (
            <Link
              key={id}
              href={id === "messages" ? "/admin/inbox" : `/admin/inbox?tab=${id}`}
              aria-current={tab === id ? "page" : undefined}
              className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12px] transition-colors pointer-coarse:h-9 ${tab === id ? "bg-[var(--hover)] text-[var(--fg)]" : "text-[var(--fg-3)] hover:text-[var(--fg)]"}`}
            >
              {label}
              <span className="font-mono text-[11px] tabular-nums text-[var(--fg-3)]">{n}</span>
            </Link>
          ))}
        </nav>
      </PageHeader>
      {tab === "calls" ? <CallsList upcoming={upcoming} past={past} /> : <MessagesInbox key={tab} messages={messages.rows} archived={tab === "archived"} />}
    </div>
  );
}
