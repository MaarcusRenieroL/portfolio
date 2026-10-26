import type { TrackId } from "../types";

/**
 * The AI, cloud and security direction, kept honest.
 * Edit statuses here as you learn: the roadmap page, home section, skills matrix,
 * the terminal and the AI demo all read from this one file.
 *
 *   "done"     = there is evidence in a project, a job or a certificate
 *   "learning" = actively studying right now
 *   "planned"  = on the list, not started
 */

export type Status = "done" | "learning" | "planned";

export const MASTERS_LINE =
  "preparing for a masters in ai, cloud, and cybersecurity — building the portfolio and the skills to match.";

export const TRACKS: Record<
  TrackId,
  { title: string; summary: string; why: string; projects: string[] }
> = {
  ai: {
    title: "ai",
    summary: "building software around models: local llms, retrieval, and tools that use them.",
    why: "nyx already runs a local assistant on ollama with source citations. the next step is the theory underneath and evaluation.",
    projects: ["nyx"],
  },
  cloud: {
    title: "cloud",
    summary: "running systems in containers and on cloud platforms, reproducibly.",
    why: "life os ships as one docker image behind nginx, and aws is part of the day job. the next step is infrastructure as code and managed services.",
    projects: ["life-os"],
  },
  security: {
    title: "security",
    summary: "designing systems that protect data, and understanding how they get attacked.",
    why: "ccna and ccnp gave the network foundations; life os and nyx taught secrets handling, auth and privacy by design. the next step is offensive practice and threat modelling.",
    projects: ["nyx", "life-os", "zentro"],
  },
};

export type RoadmapItem = {
  id: string;
  track: TrackId;
  title: string;
  detail: string;
  status: Status;
};

export const ROADMAP: RoadmapItem[] = [
  // ai
  {
    id: "ai-local-llm",
    track: "ai",
    title: "ship an app with a local llm",
    detail: "nyx connects to ollama for a local assistant with source citations and streamed tokens.",
    status: "done",
  },
  {
    id: "ai-rag",
    track: "ai",
    title: "build retrieval over my own notes and posts",
    detail: "embeddings, chunking and a small evaluation set to see whether answers are actually grounded.",
    status: "planned",
  },
  {
    id: "ai-ml-basics",
    track: "ai",
    title: "ml fundamentals",
    detail: "linear algebra, probability and a first end-to-end model, to support the masters coursework.",
    status: "planned",
  },
  {
    id: "ai-eval",
    track: "ai",
    title: "evaluate and fine-tune a small open model",
    detail: "compare a base model with a tuned one on a task from my own projects.",
    status: "planned",
  },
  // cloud
  {
    id: "cloud-containers",
    track: "cloud",
    title: "run a multi-service stack in containers",
    detail: "life os runs postgres, the backend and an nginx gateway with docker compose and a one-command installer.",
    status: "done",
  },
  {
    id: "cloud-aws-work",
    track: "cloud",
    title: "work with aws on an enterprise project",
    detail: "aws and docker are part of the stack at ust healthproof.",
    status: "done",
  },
  {
    id: "cloud-iac",
    track: "cloud",
    title: "deploy a project to aws with terraform",
    detail: "infrastructure as code, an architecture diagram and the repository to show it.",
    status: "planned",
  },
  {
    id: "cloud-cicd",
    track: "cloud",
    title: "ci/cd from push to cloud",
    detail: "github actions that test, build an image and deploy it.",
    status: "planned",
  },
  {
    id: "cloud-k8s",
    track: "cloud",
    title: "kubernetes basics",
    detail: "pods, services and a small cluster running one of my projects.",
    status: "planned",
  },
  // security
  {
    id: "sec-network",
    track: "security",
    title: "network security foundations",
    detail: "ccna and ccnp training: switching, routing, vlans, ospf and bgp labs, and packet analysis.",
    status: "done",
  },
  {
    id: "sec-secrets",
    track: "security",
    title: "secrets and auth design in a real system",
    detail: "life os generates high-entropy secrets at install time and includes a password vault module.",
    status: "done",
  },
  {
    id: "sec-privacy",
    track: "security",
    title: "privacy by design",
    detail: "nyx redacts card numbers and api keys from the clipboard and ships a zero-egress log inspector.",
    status: "done",
  },
  {
    id: "sec-owasp",
    track: "security",
    title: "owasp top 10 labs",
    detail: "work through the categories on deliberately vulnerable apps and write up each one.",
    status: "planned",
  },
  {
    id: "sec-ctf",
    track: "security",
    title: "first ctf and a guided security path",
    detail: "a beginner path on a lab platform, with notes on every room or challenge.",
    status: "planned",
  },
  {
    id: "sec-threat-model",
    track: "security",
    title: "threat-model life os",
    detail: "assets, trust boundaries and abuse cases for my own password vault and api.",
    status: "planned",
  },
];

export type Level = "planned" | "familiar" | "working";

export const SKILLS: Record<TrackId, { name: string; level: Level }[]> = {
  ai: [
    { name: "python", level: "working" },
    { name: "local llms (ollama)", level: "familiar" },
    { name: "llm apis and prompting", level: "familiar" },
    { name: "retrieval and embeddings", level: "planned" },
    { name: "ml fundamentals", level: "planned" },
  ],
  cloud: [
    { name: "docker", level: "working" },
    { name: "linux", level: "working" },
    { name: "github actions", level: "working" },
    { name: "aws", level: "familiar" },
    { name: "nginx", level: "familiar" },
    { name: "terraform", level: "planned" },
    { name: "kubernetes", level: "planned" },
  ],
  security: [
    { name: "networking (ccna / ccnp)", level: "working" },
    { name: "packet analysis (wireshark)", level: "working" },
    { name: "auth and secrets handling", level: "familiar" },
    { name: "owasp top 10", level: "planned" },
    { name: "threat modelling", level: "planned" },
    { name: "penetration testing", level: "planned" },
  ],
};

export type Cert = {
  name: string;
  track: TrackId;
  status: "earned" | "planned";
  note: string;
};

export const CERTS: Cert[] = [
  { name: "cisco ccna", track: "security", status: "earned", note: "completed during the systech internship." },
  { name: "cisco ccnp", track: "security", status: "earned", note: "completed during the systech internship." },
  { name: "aws cloud practitioner", track: "cloud", status: "planned", note: "first step on the aws path." },
  { name: "comptia security+", track: "security", status: "planned", note: "broad security baseline." },
  { name: "aws solutions architect associate", track: "cloud", status: "planned", note: "after the practitioner exam." },
];

export function roadmapProgress(track: TrackId) {
  const items = ROADMAP.filter((i) => i.track === track);
  const done = items.filter((i) => i.status === "done").length;
  return { done, total: items.length };
}
