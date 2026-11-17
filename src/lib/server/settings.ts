import { existsSync } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { MEDIA } from "~/lib/content";
import { mergeSettings, type SiteSettings } from "~/lib/settings";
import { hasDb, query } from "./db";

export async function readSavedSettings(): Promise<Partial<SiteSettings> | null> {
  const r = await query<{ value: Partial<SiteSettings> }>("select value from site_setting where key = 'site'");
  return r.rows[0]?.value ?? null;
}

export async function writeSettings(value: SiteSettings): Promise<void> {
  await query(
    `insert into site_setting (key, value) values ('site', $1)
     on conflict (key) do update set value = $1, updated_at = now()`,
    [JSON.stringify(value)],
  );
}

const cached = unstable_cache(readSavedSettings, ["site-settings"], { tags: ["content"], revalidate: 3600 });

const LOCAL_PHOTO = existsSync(path.join(process.cwd(), "public", "me.jpg"));

/** The portrait to show: the one set in the CMS, else public/me.jpg if it exists, else "" (placeholder, no 404). */
export const photoSrc = (s: SiteSettings) => s.photo || (LOCAL_PHOTO ? MEDIA.photo : "");

/** Settings for the public site. Never throws: a database problem means the defaults. */
import { toPublicAssets } from "./r2";
import { r2Names } from "./r2-names";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasDb()) return mergeSettings(null);
  try {
    return toPublicAssets(mergeSettings(await cached()), await r2Names());
  } catch {
    return mergeSettings(null);
  }
}
