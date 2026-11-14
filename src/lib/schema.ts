import { z } from "zod";

/**
 * The shapes every piece of site content must have. Data lives in
 * `content.ts` and `case-studies.ts`; both parse through these schemas when the
 * module loads, so a typo or a missing field fails the build with a message that
 * names the entry, instead of breaking a page. Types are inferred from here, so
 * adding an entry means adding one object and nothing else.
 */

const slug = z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, numbers and dashes");
const text = z.string().min(1);
const url = z.url();

export const categorySchema = z.enum(["backend", "frontend", "ai", "systems", "tooling"]);

export const projectSchema = z.object({
  slug,
  name: text,
  kind: text,
  status: text,
  featured: z.boolean(),
  cats: z.array(categorySchema).min(1),
  /** Short line for lists and cards. */
  desc: text,
  /** Skills this project leans on most, strongest first. */
  skills: z.array(text).min(1),
  /** Deployed URL, if it is live. */
  site: url.optional(),
  /** Public repo, if there is one. */
  github: url.optional(),
  /** Has a full case study page (an entry with the same slug in case-studies.ts). */
  study: z.boolean(),
});

export const roleSchema = z.object({
  date: text,
  place: text.optional(),
  org: text,
  url: url.optional(),
  /** File name under /public/logos. Without one the page shows the initials. */
  logo: z.string().regex(/^[\w.-]+$/).optional(),
  title: text,
  now: z.boolean().optional(),
  /** Same job, different company name over time (acquisitions, renames). Newest first. */
  path: z.array(z.object({ org: text, date: text, note: text })).optional(),
  summary: text,
  points: z.array(text),
  tags: z.array(text),
});

export const educationSchema = z.object({
  school: text,
  degree: text,
  date: text,
  place: text.optional(),
  note: text.optional(),
  url: url.optional(),
});

export const skillsSchema = z.object({
  used: z.array(z.object({ name: text, items: z.array(text).min(1) })).min(1),
  learning: z.array(text),
});

export const stackGroupSchema = z.object({ name: text, why: text, items: z.array(text).min(1) });

export const shotSchema = z.object({ file: text, mobile: z.string().optional(), alt: text, caption: text });

export const caseStudySchema = z.object({
  slug,
  title: text,
  lead: text,
  site: z.object({ label: text, href: url }).optional(),
  repo: z.object({ label: text, href: url.optional() }),
  meta: z.array(z.object({ label: text, value: text, learning: z.boolean().optional() })),
  hero: text,
  /** File in /public/projects/<slug>/ used as the card and hero image. */
  cover: z.string().optional(),
  shots: z.array(shotSchema),
  video: z.object({ file: text, caption: text }).optional(),
  challenge: z.object({ title: text, body: text }),
  approach: z.object({
    title: text,
    body: text,
    code: z.object({ file: text, lines: z.array(z.string()), hl: z.number().optional() }).optional(),
  }),
  decisions: z.array(z.object({ title: text, body: text })),
  /** Extra prose sections between decisions and outcome. */
  sections: z.array(z.object({ title: text, body: text })).optional(),
  outcome: z.object({
    title: text,
    stats: z.array(z.object({ value: text, unit: z.string().optional(), label: text })).optional(),
    note: text,
  }),
  lessons: z.object({ hardest: text, quote: z.string().optional(), body: text }),
  next: text,
  tech: z.array(text),
});

export type Category = z.infer<typeof categorySchema>;
export type Project = z.infer<typeof projectSchema> & { /** "01", "02"… assigned from list order. */ num: string };
export type Role = z.infer<typeof roleSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;

/** Parse one entry, failing with a message that says which entry and which field. */
export function check<S extends z.ZodType>(kind: string, key: string, schema: S, value: unknown): z.output<S> {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `${i.path.join(".") || "(entry)"}: ${i.message}`).join("; ");
  throw new Error(`Invalid ${kind} "${key}": ${issues}`);
}

/** Rules that span entries. Called once when content loads. */
export function assertContent(c: { projects: Project[]; roles: Role[]; caseStudies: Record<string, CaseStudy> }) {
  const dupes = (label: string, keys: string[]) => {
    const seen = new Set<string>();
    for (const k of keys) {
      if (seen.has(k)) throw new Error(`Duplicate ${label} "${k}"`);
      seen.add(k);
    }
  };
  dupes("project slug", c.projects.map((p) => p.slug));
  dupes("role org", c.roles.map((r) => r.org));
  for (const p of c.projects) {
    if (p.study && !(p.slug in c.caseStudies)) throw new Error(`Project "${p.slug}" has study: true but no case study with that slug`);
    if (!p.study && p.slug in c.caseStudies) throw new Error(`Case study "${p.slug}" exists but its project has study: false`);
  }
  for (const slug of Object.keys(c.caseStudies)) {
    if (!c.projects.some((p) => p.slug === slug)) throw new Error(`Case study "${slug}" has no matching project`);
  }
  if (!c.projects.some((p) => p.featured)) throw new Error("At least one project must be featured");
  if (c.roles.filter((r) => r.now).length !== 1) throw new Error("Exactly one role must have now: true");
}
