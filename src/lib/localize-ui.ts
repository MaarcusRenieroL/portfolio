import { DICT } from "./dict";
import type { Lang } from "./i18n";
import { CATEGORIES } from "./site";
import { MAINTENANCE, NOT_FOUND, NOT_FOUND_DE, SERVER_ERROR, SERVER_ERROR_DE } from "./status";

/** Labels that client components need, without the content data (and its zod schemas) behind localize.ts. */

export const categoriesFor = (lang: Lang) => CATEGORIES.map(([id, label]) => [id, DICT[lang].projects.cats[id] ?? label] as [string, string]);

export const statusFor = (lang: Lang, kind: "404" | "500" | "503") => {
  if (kind === "503") return MAINTENANCE;
  if (kind === "404") return lang === "de" ? NOT_FOUND_DE : NOT_FOUND;
  return lang === "de" ? SERVER_ERROR_DE : SERVER_ERROR;
};
