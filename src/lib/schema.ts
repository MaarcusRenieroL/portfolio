import { z } from "zod";

/**
 * The shapes every piece of site content must have. Data lives in
 * `content.ts` and is parsed through these schemas when the
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
  /** Card image: a file in /public/projects/<slug>/. Without one the card shows the project's glyph. */
  cover: z.string().regex(/^[\w.-]+$/).optional(),
  /** Kept in the data but not shown on the site. */
  hidden: z.boolean().optional(),
});

export const postSchema = z.object({
  slug,
  title: text,
  description: z.string(),
  /** YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  tags: z.array(text),
  /** Markdown. */
  body: z.string(),
});
export const skillGroupSchema = z.object({ name: text, items: z.array(text).min(1) });

export type PostContent = z.infer<typeof postSchema>;

export const roleSchema = z.object({
  date: text,
  place: text.optional(),
  org: text,
  url: url.optional(),
  /** File name under /public/logos. Without one the page shows the initials. */
  logo: z.string().regex(/^[\w.-]+$/).optional(),
  /** The tile the logo sits on. Use "dark" for artwork that is white or very light. */
  logoOn: z.enum(["light", "dark"]).optional(),
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
});


export const certificateSchema = z.object({
  slug,
  title: text,
  issuer: text,
  /** Issue date, YYYY-MM-DD. Used for sorting and display. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  /** Course length, when the certificate states one. */
  hours: z.number().positive().optional(),
  instructors: text.optional(),
  /** One line on what it covered. */
  about: text,
  /** Thumbnail in /public/certificates. Leave out when the file can't be shown publicly. */
  preview: z.string().regex(/^[\w.-]+$/).optional(),
  /** Full certificate (PDF or image) in /public/certificates. */
  file: z.string().regex(/^[\w.-]+$/).optional(),
  /** Public verification link, if the issuer has one. */
  verify: url.optional(),
});

export type Certificate = z.infer<typeof certificateSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Project = z.infer<typeof projectSchema> & { /** "01", "02"… assigned from list order. */ num: string };
export type Role = z.infer<typeof roleSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skills = z.infer<typeof skillsSchema>;

/** Parse one entry, failing with a message that says which entry and which field. */
export function check<S extends z.ZodType>(kind: string, key: string, schema: S, value: unknown): z.output<S> {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `${i.path.join(".") || "(entry)"}: ${i.message}`).join("; ");
  throw new Error(`Invalid ${kind} "${key}": ${issues}`);
}

/** Rules that span entries. Called once when content loads. */
export function assertContent(c: { projects: Project[]; roles: Role[] }) {
  const dupes = (label: string, keys: string[]) => {
    const seen = new Set<string>();
    for (const k of keys) {
      if (seen.has(k)) throw new Error(`Duplicate ${label} "${k}"`);
      seen.add(k);
    }
  };
  dupes("project slug", c.projects.map((p) => p.slug));
  dupes("role org", c.roles.map((r) => r.org));
  if (!c.projects.some((p) => p.featured)) throw new Error("At least one project must be featured");
  if (c.roles.filter((r) => r.now).length !== 1) throw new Error("Exactly one role must have now: true");
}
