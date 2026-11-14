export const LANGS = ["en", "de"] as const;
export type Lang = (typeof LANGS)[number];

export const isLang = (s: string): s is Lang => (LANGS as readonly string[]).includes(s);

/** The cookie the language toggle writes. No cookie means English. */
export const LANG_COOKIE = "lang";

/**
 * The language is a preference, not part of the URL: a page has one address and
 * the proxy picks the version from the cookie. Kept as a function so links in
 * the pages stay language-aware if that ever changes.
 */
export function localePath(_lang: Lang, href: string) {
  return href;
}

/** Internally pages live under /en and /de; this drops that prefix from a pathname if it is there. */
export function stripLang(pathname: string): { lang: Lang; path: string } {
  for (const l of LANGS) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) return { lang: l, path: pathname.slice(l.length + 1) || "/" };
  }
  return { lang: "en", path: pathname };
}
