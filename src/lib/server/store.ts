import { query } from "./db";

/** What the CMS can edit. `key` is the natural id: slug, org, school or group name. */
export const KINDS = ["project", "role", "education", "skillgroup", "certificate", "post", "note"] as const;
export type Kind = (typeof KINDS)[number];
export const isKind = (s: string): s is Kind => (KINDS as readonly string[]).includes(s);

export type Row = {
  kind: Kind;
  key: string;
  position: number;
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
  draft_de: Record<string, unknown> | null;
  published_de: Record<string, unknown> | null;
  de_machine: boolean;
  deleted: boolean;
  updated_at: string;
  published_at: string | null;
};

const COLS = "kind, key, position, draft, published, draft_de, published_de, de_machine, deleted, updated_at::text, published_at::text";

export async function listRows(kind: Kind): Promise<Row[]> {
  return (await query<Row>(`select ${COLS} from content_item where kind = $1 order by position, key`, [kind])).rows;
}

export async function getRow(kind: Kind, key: string): Promise<Row | null> {
  return (await query<Row>(`select ${COLS} from content_item where kind = $1 and key = $2`, [kind, key])).rows[0] ?? null;
}

/** Everything, for the public site. `mode` picks which copy of each row to expose. */
export async function readAll(mode: "published" | "draft"): Promise<{ kind: Kind; key: string; position: number; data: Record<string, unknown>; de: Record<string, unknown> | null; deleted: boolean }[]> {
  const r = await query<Row>(`select ${COLS} from content_item order by kind, position, key`);
  return r.rows
    .map((x) => ({
      kind: x.kind,
      key: x.key,
      position: x.position,
      data: (mode === "draft" ? x.draft : x.published) as Record<string, unknown>,
      de: mode === "draft" ? x.draft_de : x.published_de,
      deleted: x.deleted,
    }))
    // In published mode a row that was never published is invisible; it still counts as "seeded" via the caller's length check.
    .map((x) => ({ ...x, deleted: x.deleted || x.data === null }));
}

export async function saveDraft(kind: Kind, key: string, data: Record<string, unknown>, de: Record<string, unknown> | null, machine = false) {
  await query(
    `insert into content_item (kind, key, position, draft, draft_de, de_machine)
       values ($1, $2, coalesce((select max(position) + 1 from content_item where kind = $1), 0), $3, $4, $5)
     on conflict (kind, key) do update set draft = $3, draft_de = $4, de_machine = $5, updated_at = now()`,
    [kind, key, JSON.stringify(data), de ? JSON.stringify(de) : null, machine],
  );
}

export async function publishRow(kind: Kind, key: string) {
  await query("update content_item set published = draft, published_de = draft_de, published_at = now() where kind = $1 and key = $2", [kind, key]);
}

export async function publishKind(kind: Kind) {
  await query("update content_item set published = draft, published_de = draft_de, published_at = now() where kind = $1 and not deleted", [kind]);
}

export async function setDeleted(kind: Kind, key: string, deleted: boolean) {
  await query("update content_item set deleted = $3, updated_at = now() where kind = $1 and key = $2", [kind, key, deleted]);
}

export async function move(kind: Kind, key: string, dir: -1 | 1) {
  const rows = await listRows(kind);
  const i = rows.findIndex((r) => r.key === key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  const order = rows.map((r) => r.key);
  [order[i], order[j]] = [order[j], order[i]];
  for (let n = 0; n < order.length; n++) await query("update content_item set position = $3 where kind = $1 and key = $2", [kind, order[n], n]);
}

/** Drafts that differ from what is live. */
export async function pendingCount(): Promise<number> {
  const r = await query<{ n: string }>("select count(*) n from content_item where not deleted and (published is null or draft is distinct from published or draft_de is distinct from published_de)");
  return Number(r.rows[0].n);
}
