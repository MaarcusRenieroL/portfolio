"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { deFields, SPECS } from "~/lib/cms-fields";
import { certificateSchema, educationSchema, postSchema, projectSchema, roleSchema, skillGroupSchema } from "~/lib/schema";
import { seedFromFiles } from "~/lib/server/seed";
import { getRow, isKind, move, publishKind, publishRow, saveDraft, setDeleted, type Kind } from "~/lib/server/store";
import { extractTranslatable, translateConfigured, translateToGerman, type Translatable } from "~/lib/server/translate";
import { requireAdmin } from "~/lib/server/session";

/**
 * Every action starts with requireAdmin(). Next also checks the Origin header on server actions, and the
 * session cookie is SameSite=Strict, so a foreign page can not trigger these.
 */

const SCHEMAS: Record<Kind, z.ZodType> = {
  project: projectSchema,
  role: roleSchema,
  education: educationSchema,
  skillgroup: skillGroupSchema,
  certificate: certificateSchema,
  post: postSchema,
  note: postSchema,
};

export type Result<T = object> = ({ ok: true } & T) | { ok: false; errors: string[] };
const bad = (...errors: string[]): { ok: false; errors: string[] } => ({ ok: false, errors });

/** Empty inputs mean "not set": drop blank strings, nulls and NaN so optional fields validate. */
function clean(raw: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof raw !== "object" || raw === null) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === "" || v === null || v === undefined) continue;
    if (typeof v === "number" && Number.isNaN(v)) continue;
    if (Array.isArray(v)) {
      out[k] = v.map((x) => (typeof x === "string" ? x.trim() : x)).filter((x) => x !== "" && x !== undefined);
      continue;
    }
    out[k] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

function cleanDe(kind: Kind, raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "object" || raw === null) return null;
  const allowed = new Set(deFields(kind).map((f) => f.name));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowed.has(k)) continue;
    if (typeof v === "string" && v.trim()) out[k] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export async function saveItem(kindIn: string, originalKey: string | null, rawData: unknown, rawDe: unknown, machine: boolean): Promise<Result<{ key: string }>> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  const kind = kindIn;
  const spec = SPECS[kind];
  const parsed = SCHEMAS[kind].safeParse(clean(rawData));
  if (!parsed.success) return bad(...parsed.error.issues.map((i) => `${i.path.join(".") || spec.keyField}: ${i.message}`));
  const data = parsed.data as Record<string, unknown>;
  const key = String(data[spec.keyField]);
  if (originalKey !== null && key !== originalKey) return bad(`${spec.keyField} can not be changed. Create a new item instead.`);
  if (originalKey === null && (await getRow(kind, key))) return bad(`An item with ${spec.keyField} "${key}" already exists.`);
  await saveDraft(kind, key, data, cleanDe(kind, rawDe), machine);
  return { ok: true, key };
}

export async function publishItem(kindIn: string, key: string): Promise<Result> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  if (!(await getRow(kindIn, key))) return bad("Not found.");
  await publishRow(kindIn, key);
  revalidateTag("content", { expire: 0 });
  return { ok: true };
}

export async function publishAll(kindIn: string): Promise<Result> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  await publishKind(kindIn);
  revalidateTag("content", { expire: 0 });
  return { ok: true };
}

export async function deleteItem(kindIn: string, key: string, deleted: boolean): Promise<Result> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  await setDeleted(kindIn, key, deleted);
  // A removal only reaches visitors once published, same as an edit.
  if (deleted) await publishRow(kindIn, key);
  revalidateTag("content", { expire: 0 });
  return { ok: true };
}

export async function moveItem(kindIn: string, key: string, dir: number): Promise<Result> {
  await requireAdmin();
  if (!isKind(kindIn) || (dir !== -1 && dir !== 1)) return bad("Bad request.");
  await move(kindIn, key, dir);
  return { ok: true };
}

export async function importFromFiles(): Promise<Result<{ inserted: number; skipped: number }>> {
  await requireAdmin();
  const r = await seedFromFiles();
  revalidateTag("content", { expire: 0 });
  return { ok: true, ...r };
}

export async function translateItem(kindIn: string, rawData: unknown): Promise<Result<{ de: Translatable }>> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  if (!translateConfigured()) return bad("GEMINI_API_KEY is not set, so translation is off.");
  const source = extractTranslatable(SPECS[kindIn].fields, clean(rawData));
  const r = await translateToGerman(source);
  return r.ok ? { ok: true, de: r.de } : bad(r.message);
}
