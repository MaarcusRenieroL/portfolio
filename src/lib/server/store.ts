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

/** Change an item's key. Only for items that were never published, so no live link can break. */
export async function renameRow(kind: Kind, from: string, to: string): Promise<boolean> {
  // One statement: the "never published" check and the rename can't be split by a publish in between.
  const r = await query("update content_item set key = $3, updated_at = now() where kind = $1 and key = $2 and published is null returning key", [kind, from, to]);
  return (r.rowCount ?? 0) > 0;
}

/**
 * Publishing records a version of what went live, unless it is the same as the newest version
 * (publishing twice, or a removal that only re-publishes the same data). One statement, so a
 * publish and its version can't be split by another publish in between.
 */
const RECORD_VERSION = `
  insert into content_version (kind, key, data, data_de)
  select p.kind, p.key, p.published, p.published_de from p
  where p.published is not null and not exists (
    select 1 from content_version v
    where v.id = (select max(w.id) from content_version w where w.kind = p.kind and w.key = p.key)
      and v.data = p.published and v.data_de is not distinct from p.published_de
  )`;

export async function publishRow(kind: Kind, key: string) {
  await query(
    `with p as (update content_item set published = draft, published_de = draft_de, published_at = now() where kind = $1 and key = $2 returning kind, key, published, published_de) ${RECORD_VERSION}`,
    [kind, key],
  );
}

export async function publishKind(kind: Kind) {
  await query(
    `with p as (update content_item set published = draft, published_de = draft_de, published_at = now() where kind = $1 and not deleted returning kind, key, published, published_de) ${RECORD_VERSION}`,
    [kind],
  );
}

/** How many published versions of each item are kept. */
export const VERSIONS_KEPT = 30;

export type Version = { id: number; at: string; data: Record<string, unknown>; de: Record<string, unknown> | null };

/** Published versions of one item, newest first. */
export async function listVersions(kind: Kind, key: string): Promise<Version[]> {
  const r = await query<{ id: string; at: string; data: Record<string, unknown>; data_de: Record<string, unknown> | null }>(
    "select id, created_at::text at, data, data_de from content_version where kind = $1 and key = $2 order by id desc limit $3",
    [kind, key, VERSIONS_KEPT],
  );
  return r.rows.map((x) => ({ id: Number(x.id), at: x.at, data: x.data, de: x.data_de }));
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
