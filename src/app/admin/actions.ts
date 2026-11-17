"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deFields, SPECS } from "~/lib/cms-fields";
import { certificateSchema, educationSchema, postSchema, projectSchema, roleSchema, skillGroupSchema } from "~/lib/schema";
import { audit, revokeAllSessions } from "~/lib/server/auth";
import { afterPublish } from "~/lib/server/media";
import { seedFromFiles } from "~/lib/server/seed";
import { getRow, isKind, listVersions, move, publishKind, publishRow, renameRow, saveDraft, setDeleted, type Kind, type Version } from "~/lib/server/store";
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

/** Fields the schemas require but that a blank form leaves undefined (an unticked box, an empty list). */
const DEFAULTS: Partial<Record<Kind, Record<string, unknown>>> = {
  project: { featured: false },
  role: { points: [], tags: [] },
  post: { tags: [] },
  note: { tags: [] },
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
  const parsed = SCHEMAS[kind].safeParse({ ...DEFAULTS[kind], ...clean(rawData) });
  if (!parsed.success) return bad(...parsed.error.issues.map((i) => `${i.path.join(".") || spec.keyField}: ${i.message}`));
  const data = parsed.data as Record<string, unknown>;
  const key = String(data[spec.keyField]);
  // "/admin/content/<kind>/new" is the create page, so an item keyed "new" could never be opened again.
  if (key.toLowerCase() === "new") return bad(`${spec.keyField} can't be "new". Pick another.`);
  if (originalKey !== null && key !== originalKey) {
    // Until its first publish an item can still change its key (a post's slug follows its title).
    const current = await getRow(kind, originalKey);
    if (!current) return bad("Not found.");
    if (current.published) return bad(`${spec.keyField} can not be changed after publishing. Create a new item instead.`);
    if (await getRow(kind, key)) return bad(`An item with ${spec.keyField} "${key}" already exists.`);
    try {
      if (!(await renameRow(kind, originalKey, key))) return bad(`${spec.keyField} can not be changed after publishing. Create a new item instead.`);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return bad(`An item with ${spec.keyField} "${key}" already exists.`);
      throw e;
    }
  }
  if (originalKey === null && (await getRow(kind, key))) return bad(`An item with ${spec.keyField} "${key}" already exists.`);
  await saveDraft(kind, key, data, cleanDe(kind, rawDe), machine);
  return { ok: true, key };
}

export async function publishItem(kindIn: string, key: string): Promise<Result<{ warning?: string }>> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  if (!(await getRow(kindIn, key))) return bad("Not found.");
  await publishRow(kindIn, key);
  const warning = await afterPublish();
  revalidateTag("content", { expire: 0 });
  return warning ? { ok: true, warning } : { ok: true };
}

export async function publishAll(kindIn: string): Promise<Result<{ warning?: string }>> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  await publishKind(kindIn);
  const warning = await afterPublish();
  revalidateTag("content", { expire: 0 });
  return warning ? { ok: true, warning } : { ok: true };
}

/** What has been live for one item, newest first. Restoring happens in the editor: a version loads as unsaved edits. */
export async function getVersions(kindIn: string, key: string): Promise<Result<{ versions: Version[] }>> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  try {
    return { ok: true, versions: await listVersions(kindIn, key) };
  } catch (e) {
    return bad(e instanceof Error ? e.message : "Couldn't load the history.");
  }
}

export async function deleteItem(kindIn: string, key: string, deleted: boolean): Promise<Result> {
  await requireAdmin();
  if (!isKind(kindIn)) return bad("Unknown content type.");
  // Takes effect at once: the live site skips removed rows whatever their published copy says. Publishing the
  // draft here as well would put unreviewed edits live (and into the history) the moment the item is restored.
  await setDeleted(kindIn, key, deleted);
  await afterPublish();
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

/** Add a skill to an existing group, or create the group with this skill */
export async function addSkill(skillName: string, groupName: string): Promise<Result<{ key: string }>> {
  await requireAdmin();
  const trimmedSkill = skillName.trim();
  const trimmedGroup = groupName.trim();
  if (!trimmedSkill) return bad("Skill name cannot be empty.");
  if (!trimmedGroup) return bad("Group name cannot be empty.");

  const row = await getRow("skillgroup", trimmedGroup);
  let items: string[] = [];
  if (row && row.draft && Array.isArray((row.draft as Record<string, unknown>).items)) {
    items = [...((row.draft as Record<string, unknown>).items as string[])];
    if (items.some((it) => it.toLowerCase() === trimmedSkill.toLowerCase())) {
      return bad(`Skill "${trimmedSkill}" already exists in "${trimmedGroup}".`);
    }
    items.push(trimmedSkill);
  } else {
    items = [trimmedSkill];
  }

  const rawDe = row?.draft_de ?? null;
  const machine = row?.de_machine ?? false;
  return saveItem("skillgroup", row ? trimmedGroup : null, { name: trimmedGroup, items }, rawDe, machine);
}

/** Remove a single skill from a group */
export async function removeSkillFromGroup(skillName: string, groupName: string): Promise<Result<{ key: string }>> {
  await requireAdmin();
  const row = await getRow("skillgroup", groupName);
  if (!row || !row.draft || !Array.isArray((row.draft as Record<string, unknown>).items)) {
    return bad("Skill group not found.");
  }
  const items = ((row.draft as Record<string, unknown>).items as string[]).filter(
    (s) => s.toLowerCase() !== skillName.trim().toLowerCase(),
  );
  if (items.length === 0) {
    return bad("A group must have at least one skill. Delete the group instead if no longer needed.");
  }
  const rawDe = row.draft_de ?? null;
  const machine = row.de_machine ?? false;
  return saveItem("skillgroup", groupName, { name: groupName, items }, rawDe, machine);
}

/** Ends every admin session, including this one: the next request lands on the sign-in page. */
export async function signOutEverywhere(): Promise<void> {
  await requireAdmin();
  await revokeAllSessions();
  await audit("sessions_revoked", "admin");
  redirect("/admin/login");
}
