import { z } from "zod";
import { DICT } from "./dict";
import { SITE } from "./content";

/** A media-library path (`/media/<name>`) or nothing. */
const mediaPath = z.union([z.literal(""), z.string().regex(/^\/media\/[\w.-]+$/)]);
const both = z.object({ en: z.string().max(400), de: z.string().max(400) });

export const settingsSchema = z.object({
  photo: mediaPath,
  available: z.boolean(),
  availableLabel: both,
  heroTitle: both,
  heroHighlight: both,
  heroLead: both,
  homeAbout: z.object({ en: z.string().max(1500), de: z.string().max(1500) }),
  location: z.string().max(80),
  resume: mediaPath,
  /** The /now page, Markdown per language. Empty = the page doesn't exist. */
  now: z.object({ en: z.string().max(8000), de: z.string().max(8000) }),
  /** YYYY-MM-DD, set when the /now text changes. */
  nowUpdated: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

/** What the site showed before settings existed: the dictionary copy. An empty field falls back to these. */
export function defaultSettings(): SiteSettings {
  const en = DICT.en.home;
  const de = DICT.de.home;
  return {
    photo: "",
    available: true,
    availableLabel: { en: en.open, de: de.open },
    heroTitle: { en: en.title.trim(), de: de.title.trim() },
    heroHighlight: { en: en.hl, de: de.hl },
    heroLead: { en: en.lead(SITE.location), de: de.lead(SITE.location) },
    homeAbout: { en: en.about, de: de.about },
    location: SITE.location,
    resume: "",
    now: { en: "", de: "" },
    nowUpdated: "",
  };
}

/** Saved values over the defaults; blank text means "use the default". */
export function mergeSettings(saved: Partial<SiteSettings> | null): SiteSettings {
  const d = defaultSettings();
  if (!saved) return d;
  const pick = (a: { en: string; de: string } | undefined, b: { en: string; de: string }) => ({ en: a?.en?.trim() || b.en, de: a?.de?.trim() || b.de });
  return {
    photo: saved.photo ?? d.photo,
    available: saved.available ?? d.available,
    availableLabel: pick(saved.availableLabel, d.availableLabel),
    heroTitle: pick(saved.heroTitle, d.heroTitle),
    heroHighlight: pick(saved.heroHighlight, d.heroHighlight),
    heroLead: pick(saved.heroLead, d.heroLead),
    homeAbout: pick(saved.homeAbout, d.homeAbout),
    location: saved.location?.trim() || d.location,
    resume: saved.resume ?? d.resume,
    // No fallback copy for /now: an empty page simply isn't shown.
    now: { en: saved.now?.en ?? "", de: saved.now?.de ?? "" },
    nowUpdated: saved.nowUpdated ?? "",
  };
}
