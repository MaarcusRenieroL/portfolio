import { query } from "~/lib/server/db";
import { AnalyticsDashboard } from "../../_components/analytics-dashboard";

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

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const rawDays = (await searchParams).days;
  const parsed = rawDays ? parseInt(rawDays, 10) : 7;
  const days = isNaN(parsed) || parsed <= 0 ? 7 : Math.min(parsed, 365);
  const since = `now() - interval '${days} days'`;

  const [totals, pages, actions, targets, daily] = await Promise.all([
    query<{ views: string; visitors: string }>(
      `select count(*) filter (where kind='view') views, count(distinct visitor) filter (where kind='view') visitors from site_event where at > ${since}`
    ),
    query<{ path: string; n: string }>(
      `select path, count(*) n from site_event where kind='view' and at > ${since} group by path order by n desc limit 15`
    ),
    query<{ kind: string; n: string }>(
      `select kind, count(*) n from site_event where kind <> 'view' and at > ${since} group by kind order by n desc`
    ),
    query<{ kind: string; target: string; n: string }>(
      `select kind, target, count(*) n from site_event where kind in ('social-click','project-click','email-click','resume-download','resume-open','book-call') and target is not null and at > ${since} group by kind, target order by n desc limit 20`
    ),
    query<{ label: string; n: string }>(
      `select to_char(d, 'Mon DD') label, n from (select date_trunc('day', at) d, count(*) n from site_event where kind='view' and at > ${since} group by 1) t order by d`
    ),
  ]);

  return (
    <AnalyticsDashboard
      days={days}
      totals={totals.rows[0] ?? { views: "0", visitors: "0" }}
      pages={pages.rows}
      actions={actions.rows}
      targets={targets.rows}
      daily={daily.rows}
      labels={LABELS}
    />
  );
}
