import { PROJECTS, WORK_EXPERIENCES } from "../constants";
import { CERTS, MASTERS_LINE, ROADMAP, TRACKS } from "../data/career";
import type { Project } from "../types";

export type Chunk = { id: string; title: string; text: string };

const ABOUT = [
  "maarcus reniero l is a full-stack software engineer based in chennai, india.",
  "he works as developer 1, software engineering, at ust healthproof (healthcare systems) since 2025, using java 21, spring boot, spring batch, mysql, angular and aws.",
  "his own projects include nyx (a local-first desktop launcher), life os (a self-hosted personal operating system), scanforge (a terminal file picker), zentro (a multi-tenant collaboration platform), next-kit (a next.js scaffolding cli) and his dotfiles.",
  MASTERS_LINE,
  "contact: maarcusreniero.l@gmail.com, github.com/maarcusrenierol, linkedin.com/in/maarcus-reniero-l.",
].join(" ");

function projectText(p: Project) {
  return [
    `${p.title} (${p.category}, ${p.status}). ${p.description}`,
    `role: ${p.role}. impact: ${p.impact}`,
    `challenge: ${p.challenge}`,
    `approach: ${p.approach.join(" ")}`,
    `outcome: ${p.outcome.join(" ")}`,
    `decisions: ${p.decisions.join(" ")}`,
    `lessons: ${p.lessons.join(" ")}`,
    `built with: ${p.skills.join(", ")}.`,
    p.tracks?.length ? `evidence for tracks: ${p.tracks.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function projectChunk(id: string): Chunk | null {
  const p = PROJECTS.find((x) => x.id === id);
  return p ? { id: `project-${p.id}`, title: p.title, text: projectText(p) } : null;
}

export function buildKnowledge(): Chunk[] {
  const chunks: Chunk[] = [{ id: "about", title: "about maarcus", text: ABOUT }];

  for (const p of PROJECTS) chunks.push({ id: `project-${p.id}`, title: p.title, text: projectText(p) });

  for (const w of WORK_EXPERIENCES) {
    chunks.push({
      id: `work-${w.id}`,
      title: `${w.title} at ${w.company}`,
      text: `${w.title} at ${w.company} (${w.startDate} to ${w.endDate ?? "present"}). ${w.highlights.join(" ")} skills: ${w.skills.join(", ")}.`,
    });
  }

  for (const [id, t] of Object.entries(TRACKS)) {
    const items = ROADMAP.filter((r) => r.track === id)
      .map((r) => `${r.title} [${r.status}]`)
      .join("; ");
    chunks.push({
      id: `track-${id}`,
      title: `${t.title} track`,
      text: `${t.summary} ${t.why} roadmap, what he is studying and learning next, planned items and done items: ${items}.`,
    });
  }

  chunks.push({
    id: "certs",
    title: "certifications",
    text: "certifications, certificates and exams. " + CERTS.map((c) => `${c.name} (${c.status}, ${c.track}): ${c.note}`).join(" "),
  });

  return chunks;
}

const STOP = new Set(
  "a an and are as at be but by can do does for from has have how i in is it its me my of on or so that the this to was what when where which who why with you your about tell".split(" "),
);

const SYNONYMS: Record<string, string> = {
  certificates: "certifications",
  certificate: "certifications",
  certs: "certifications",
  cert: "certifications",
  certified: "certifications",
  studying: "learning",
  study: "learning",
  learn: "learning",
};

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.+#\- ]/g, " ")
    .split(/\s+/)
    .map((w) => SYNONYMS[w] ?? w)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Plain keyword retrieval, used when no model key is configured. */
export function retrieve(question: string, limit = 2): Chunk[] {
  const q = new Set(tokens(question));
  if (q.size === 0) return [];
  return buildKnowledge()
    .map((c) => {
      const words = tokens(`${c.title} ${c.text}`);
      let score = 0;
      for (const w of words) if (q.has(w)) score += 1;
      for (const w of tokens(c.title)) if (q.has(w)) score += 4;
      return { c, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}
