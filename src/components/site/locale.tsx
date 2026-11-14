"use client";

import { createContext, useContext } from "react";
import { DICT, type Dict } from "~/lib/dict";
import { localePath, type Lang } from "~/lib/i18n";

const LangContext = createContext<Lang>("en");

export function LocaleProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useDict = (): Dict => DICT[useLang()];
/** Prefix an internal href for the current language. */
export function useLocalePath() {
  const lang = useLang();
  return (href: string) => localePath(lang, href);
}
