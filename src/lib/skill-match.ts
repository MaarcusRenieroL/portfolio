/** Skill matching and "where I used this", from data passed in (the CMS content), with no imports. */

export interface SkillUsage {
  skill: string;
  normalizedSkill: string;
  roles: Array<{
    org: string;
    title: string;
    date?: string;
  }>;
  projects: Array<{
    name: string;
    slug: string;
    kind: string;
  }>;
}

/**
 * Comparable form of a skill name: case, spaces, dots and a trailing version
 * number are ignored, so "Next.js 16" equals "Next.js" and "Spring Boot 3"
 * equals "Spring Boot".
 */
function normalizeSkill(s: string): string {
  return s
    .toLowerCase()
    // A version needs a space before it ("Next.js 16", "Java 21"): "Web3" and "S3" are names, not versions.
    .replace(/\s+v?\d+(\.\d+)*$/, "")
    .replace(/[\s.]+/g, "");
}

/**
 * Same technology only. Deliberately not a substring match: that made "Java"
 * match "JavaScript" and "Go" match "Django" or "MongoDB".
 */
export function isSkillMatch(query: string, target: string): boolean {
  return normalizeSkill(query) === normalizeSkill(target);
}

export type SkillUsageData = {
  roles: { org: string; title: string; date?: string; tags?: string[] }[];
  projects: { name: string; slug: string; kind: string; skills?: string[] }[];
};

/** The roles and projects that list a skill. */
export function computeSkillUsage(skillName: string, data: SkillUsageData): SkillUsage {
  return {
    skill: skillName,
    normalizedSkill: normalizeSkill(skillName),
    roles: data.roles.filter((r) => r.tags?.some((t) => isSkillMatch(skillName, t))).map((r) => ({ org: r.org, title: r.title, date: r.date })),
    projects: data.projects.filter((p) => p.skills?.some((s) => isSkillMatch(skillName, s))).map((p) => ({ name: p.name, slug: p.slug, kind: p.kind })),
  };
}
