import { PROJECTS, ROLES } from "./content";
import { computeSkillUsage, type SkillUsage } from "./skill-match";

export { isSkillMatch, type SkillUsage } from "./skill-match";

/** Server-side: usage from the file data. Client components use the SkillUsageProvider instead. */
export function getSkillUsage(skillName: string): SkillUsage {
  return computeSkillUsage(skillName, { roles: ROLES, projects: PROJECTS });
}
