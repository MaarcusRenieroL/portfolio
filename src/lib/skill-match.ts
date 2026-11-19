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
  roles: { org: string; title: string; date?: string; tags?: string[]; points?: string[] }[];
  projects: { name: string; slug: string; kind: string; skills?: string[]; description?: string }[];
};

/** A tag can hold several technologies ("AWS S3 · CloudWatch"): each counts on its own. */
const splitTags = (tags: string[] = []) => tags.flatMap((t) => t.split(/\s*[·,]\s*/)).filter(Boolean);

/**
 * Does running text name this skill? Whole words only and without the version ("Java 21" is found as
 * "Java"), so "SQL" isn't found inside "PostgreSQL" and "Java" isn't found in "JavaScript".
 */
export function mentions(text: string, skill: string): boolean {
  const base = skill.trim().replace(/\s+v?\d+(\.\d+)*$/, "");
  if (base.length < 2) return false;
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^\\p{L}\\p{N}.+#])${esc}(?![\\p{L}\\p{N}+#]|\\.[\\p{L}\\p{N}])`, "iu").test(text);
}

/**
 * The roles and projects that use a skill: listed in their tags or skills, or named in a role's own
 * bullet points (the timeline says "JUnit, Mockito" in a bullet without tagging them).
 */
export function computeSkillUsage(skillName: string, data: SkillUsageData): SkillUsage {
  return {
    skill: skillName,
    normalizedSkill: normalizeSkill(skillName),
    roles: data.roles
      .filter((r) => splitTags(r.tags).some((t) => isSkillMatch(skillName, t)) || (r.points ?? []).some((p) => mentions(p, skillName)))
      .map((r) => ({ org: r.org, title: r.title, date: r.date })),
    projects: data.projects
      .filter((p) => splitTags(p.skills).some((s) => isSkillMatch(skillName, s)))
      .map((p) => ({ name: p.name, slug: p.slug, kind: p.kind })),
  };
}
