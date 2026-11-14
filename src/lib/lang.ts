import { notFound } from "next/navigation";
import { isLang, type Lang } from "./i18n";

/** Resolve the [lang] route param, or 404 for anything that isn't a supported language. */
export async function langOf(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
}
