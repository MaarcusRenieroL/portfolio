"use server";

import { revalidateTag } from "next/cache";
import { settingsSchema, type SiteSettings } from "~/lib/settings";
import { audit } from "~/lib/server/auth";
import { afterPublish } from "~/lib/server/media";
import { readSavedSettings, writeSettings } from "~/lib/server/settings";
import { requireAdmin } from "~/lib/server/session";
import type { Result } from "./actions";

/** Saves the site settings. They go live straight away (there is no draft for settings). */
export async function saveSettings(raw: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  try {
    const next = parsed.data as SiteSettings;
    // "Last updated" on /now follows the text: stamp it whenever the text changes.
    const before = await readSavedSettings().catch(() => null);
    if (JSON.stringify(before?.now ?? { en: "", de: "" }) !== JSON.stringify(next.now)) next.nowUpdated = new Date().toISOString().slice(0, 10);
    await writeSettings(next);
    await audit("settings_saved", "admin");
    await afterPublish();
    revalidateTag("content", { expire: 0 });
    return { ok: true };
  } catch (e) {
    return { ok: false, errors: [e instanceof Error ? e.message : "Couldn't save."] };
  }
}
