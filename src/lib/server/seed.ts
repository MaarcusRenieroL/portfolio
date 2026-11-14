import { ALL_PROJECT_DATA, CERTIFICATES, EDUCATION, ROLES, SKILLS } from "../content";
import { CERTS_DE, EDUCATION_DE, PROJECTS_DE, ROLES_DE, SKILL_GROUPS_DE } from "../content-de";
import { query } from "./db";
import type { Kind } from "./store";

type Item = { kind: Kind; key: string; data: unknown; de: unknown };

function items(): Item[] {
  const out: Item[] = [];
  for (const p of ALL_PROJECT_DATA) out.push({ kind: "project", key: p.slug, data: p, de: PROJECTS_DE[p.slug] ?? null });
  for (const r of ROLES) {
    const { place: _p, ...de } = ROLES_DE[r.org] ?? ({} as Record<string, unknown>);
    void _p;
    out.push({ kind: "role", key: r.org, data: r, de: ROLES_DE[r.org] ? de : null });
  }
  for (const e of EDUCATION) out.push({ kind: "education", key: e.school, data: e, de: EDUCATION_DE[e.school] ?? null });
  for (const g of SKILLS.used) out.push({ kind: "skillgroup", key: g.name, data: g, de: SKILL_GROUPS_DE[g.name] ? { name: SKILL_GROUPS_DE[g.name] } : null });
  for (const c of CERTIFICATES) out.push({ kind: "certificate", key: c.slug, data: c, de: CERTS_DE[c.slug] ?? null });
  return out;
}

/**
 * Imports the file-based content into the database as already-published rows. It never overwrites
 * a row that exists, so running it twice (or after editing in the CMS) is safe.
 */
export async function seedFromFiles(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  const position: Record<string, number> = {};
  for (const it of items()) {
    const pos = (position[it.kind] = (position[it.kind] ?? -1) + 1);
    const r = await query(
      `insert into content_item (kind, key, position, draft, published, draft_de, published_de, published_at)
       values ($1, $2, $3, $4, $4, $5, $5, now()) on conflict (kind, key) do nothing`,
      [it.kind, it.key, pos, JSON.stringify(it.data), it.de ? JSON.stringify(it.de) : null],
    );
    inserted += r.rowCount ?? 0;
  }
  return { inserted, skipped: items().length - inserted };
}
