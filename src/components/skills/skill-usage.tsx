"use client";

import { createContext, useContext } from "react";
import type { SkillUsageData } from "~/lib/skill-match";

const Ctx = createContext<SkillUsageData>({ roles: [], projects: [] });

/** Gives skill popovers the site's (CMS) roles and projects, trimmed to what they need. */
export function SkillUsageProvider({ data, children }: { data: SkillUsageData; children: React.ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useSkillUsageData = () => useContext(Ctx);
