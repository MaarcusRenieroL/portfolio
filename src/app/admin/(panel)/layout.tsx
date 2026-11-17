import { SPECS } from "~/lib/cms-fields";
import { PENDING_SQL } from "~/lib/server/admin-queries";
import { query } from "~/lib/server/db";
import { isKind } from "~/lib/server/store";
import { requireAdmin } from "~/lib/server/session";
import { AdminShell, type NavCounts, type PaletteItem } from "../_components/admin-shell";

async function navData(): Promise<{ counts: NavCounts; media: number; unread: number; items: PaletteItem[] }> {
  const [counts, media, unread, rows] = await Promise.all([
    query<{ kind: string; n: number; drafts: number }>(
      `select kind, count(*)::int n, count(*) filter (where ${PENDING_SQL})::int drafts from content_item where not deleted group by kind`,
    ),
    query<{ n: number }>("select count(*)::int n from media").catch(() => ({ rows: [{ n: 0 }] })),
    query<{ n: number }>("select count(*)::int n from contact_message where read_at is null and not archived").catch(() => ({ rows: [{ n: 0 }] })),
    query<{ kind: string; key: string; draft: Record<string, unknown> }>("select kind, key, draft from content_item where not deleted order by kind, position"),
  ]);
  return {
    counts: Object.fromEntries(counts.rows.map((r) => [r.kind, { n: r.n, drafts: r.drafts }])),
    media: media.rows[0]?.n ?? 0,
    unread: unread.rows[0]?.n ?? 0,
    items: rows.rows.map((r) => ({
      kind: r.kind,
      key: r.key,
      title: String((isKind(r.kind) && r.draft[SPECS[r.kind].titleField]) || r.key),
    })),
  };
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const nav = await navData();
  return (
    <AdminShell counts={nav.counts} media={nav.media} unread={nav.unread} items={nav.items}>
      {children}
    </AdminShell>
  );
}
