"use server";

import { revalidatePath } from "next/cache";
import type { MediaItem } from "~/lib/media";
import { audit } from "~/lib/server/auth";
import { addMedia, storageConfigured, listMedia, mediaUsage, removeMedia, setMediaAlt } from "~/lib/server/media";
import { requireAdmin } from "~/lib/server/session";
import type { Result } from "./actions";

const fail = (e: unknown): { ok: false; errors: string[] } => ({ ok: false, errors: [e instanceof Error ? e.message : "Something went wrong."] });

export async function getMedia(): Promise<Result<{ items: MediaItem[]; configured: boolean }>> {
  await requireAdmin();
  try {
    return { ok: true, items: await listMedia(), configured: storageConfigured() };
  } catch (e) {
    return fail(e);
  }
}

/** Called by the browser after a direct-to-Blob upload finishes. */
export async function registerMedia(url: string, width: number | null, height: number | null): Promise<Result<{ item: MediaItem }>> {
  await requireAdmin();
  const dim = (n: number | null) => (typeof n === "number" && Number.isInteger(n) && n > 0 && n < 50_000 ? n : null);
  try {
    const item = await addMedia(url, dim(width), dim(height));
    await audit("media_upload", "admin", { pathname: item.pathname, size: item.size });
    revalidatePath("/admin/media");
    return { ok: true, item };
  } catch (e) {
    return fail(e);
  }
}

export async function updateMediaAlt(id: number, alt: string): Promise<Result> {
  await requireAdmin();
  try {
    await setMediaAlt(id, alt.trim());
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function getMediaUsage(id: number): Promise<Result<{ usedBy: { kind: string; key: string }[] }>> {
  await requireAdmin();
  try {
    return { ok: true, usedBy: await mediaUsage(id) };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMedia(id: number): Promise<Result> {
  await requireAdmin();
  try {
    await removeMedia(id);
    await audit("media_delete", "admin", { id });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
