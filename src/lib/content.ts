/**
 * Single source of truth for site copy. Anything in [brackets] is a placeholder
 * waiting on real content: it stays visible on purpose (see HANDOFF.md).
 */

export const SITE = {
  name: "Maarcus Reniero L",
  domain: "maarcus.dev",
  url: "https://maarcus.dev",
  email: "maarcusreniero.l@gmail.com",
  github: "https://github.com/MaarcusRenieroL",
  linkedin: "https://linkedin.com/in/maarcusrenierol",
  location: "Chennai, IN",
  open: "Looking for a full-time remote or hybrid role in Germany, Bangalore or Chennai. Open to freelance work too.",
};

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/stack", label: "Stack" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

import { COVERS } from "./case-studies";

export { CASE_STUDIES, shotUrl } from "./case-studies";
export type { CaseStudy, Shot } from "./case-studies";

export type Category ="backend" | "frontend" | "ai" | "systems" | "tooling";

export type Project = {
  slug: string;
  num: string;
  name: string;
  kind: string;
  status: string;
  featured: boolean;
  cats: Category[];
  /** Short line for lists and cards. */
  desc: string;
  /** Skills this project leans on most, strongest first. */
  skills: string[];
  /** Deployed URL, if it is live. */
  site?: string;
  /** Public repo, if there is one. */
  github?: string;
  /** Has a full case study page. */
  study: boolean;
};

const GH = "https://github.com/MaarcusRenieroL";

export const PROJECTS: Project[] = [
  {
    slug: "zentro",
    num: "01",
    name: "zentro",
    kind: "SaaS",
    status: "Beta",
    featured: true,
    cats: ["frontend", "backend"],
    desc: "One workspace for a company: projects, docs, HR and payroll in fourteen modules, with each organization's data isolated and every action permission-checked.",
    skills: ["Next.js", "tRPC", "Drizzle", "PostgreSQL", "Better Auth"],
    site: "https://zentro.maarcus.dev",
    github: `${GH}/zentro`,
    study: true,
  },
  {
    slug: "life-os",
    num: "02",
    name: "life os",
    kind: "Self-hosted",
    status: "In daily use",
    featured: true,
    cats: ["backend", "ai"],
    desc: "My personal OS: passwords, finances, habits, workouts, mail and more. Twelve modules in one Spring Boot service, after eleven microservices proved overkill.",
    skills: ["Java 21", "Spring Boot", "PostgreSQL", "Docker", "React Native"],
    github: `${GH}/life-os`,
    study: true,
  },
  {
    slug: "nyx",
    num: "03",
    name: "nyx",
    kind: "macOS app",
    status: "v1.0 · open source",
    featured: true,
    cats: ["ai", "systems"],
    desc: "An offline-first launcher to replace Spotlight, Alfred and Raycast, with a local AI over Ollama. Around 35 MB idle, and nothing leaves the machine.",
    skills: ["Rust", "Tauri", "React", "SQLite FTS5", "Ollama"],
    site: "https://nyx.maarcus.dev",
    github: `${GH}/nyx`,
    study: true,
  },
  {
    slug: "next-kit",
    num: "04",
    name: "next-kit",
    kind: "CLI · npm",
    status: "Published",
    featured: false,
    cats: ["tooling", "frontend"],
    desc: "An interactive CLI that scaffolds a Next.js app from over twenty installers: auth, ORM, email, payments, API layer, analytics and UI. Published on npm.",
    skills: ["TypeScript", "Node.js", "tsup", "Turborepo"],
    site: "https://www.npmjs.com/package/@mxrcxs17/next-kit",
    github: `${GH}/next-kit`,
    study: true,
  },
  {
    slug: "snap-pass",
    num: "05",
    name: "snap pass",
    kind: "Web app",
    status: "Runs locally",
    featured: false,
    cats: ["ai", "backend"],
    desc: "Turns a selfie into a measured 35 × 45 mm Indian passport photo, then checks head size, centring and lighting with a fix for each problem. Photos live in memory for 15 minutes.",
    skills: ["Python", "FastAPI", "OpenCV", "MediaPipe", "Next.js"],
    study: true,
  },
  {
    slug: "gateway",
    num: "06",
    name: "gateway",
    kind: "Dev infra",
    status: "In daily use",
    featured: false,
    cats: ["tooling", "systems"],
    desc: "One nginx and one Cloudflare tunnel in front of every project on my Mac. One JSON file generates the config; a local portal starts, deploys and monitors each app.",
    skills: ["nginx", "Docker", "Cloudflare Tunnel", "Shell"],
    study: true,
  },
  {
    slug: "dotfiles",
    num: "07",
    name: "dotfiles",
    kind: "Config",
    status: "Public",
    featured: false,
    cats: ["tooling"],
    desc: "My macOS setup in one command: zsh, Neovim, tmux, Ghostty and a yabai tiling desktop in one theme. Dry-run, backups and an uninstall make it safe to try.",
    skills: ["Shell", "Neovim", "Lua", "tmux"],
    github: `${GH}/dotfiles`,
    study: true,
  },
  {
    slug: "portfolio",
    num: "08",
    name: "portfolio",
    kind: "Web",
    status: "This site",
    featured: false,
    cats: ["frontend"],
    desc: "This site: a small design system, markdown writing with tags and a table of contents, and keyboard navigation on lists.",
    skills: ["Next.js 16", "React 19", "Tailwind 4", "TypeScript"],
    site: "https://maarcus.dev",
    github: `${GH}/portfolio`,
    study: false,
  },
];

export const CATEGORIES: [string, string][] = [
  ["all", "All"],
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["ai", "AI"],
  ["systems", "Systems"],
  ["tooling", "Tooling"],
];


export type Role = {
  date: string;
  place?: string;
  org: string;
  url?: string;
  title: string;
  now?: boolean;
  /** Same job, different company name over time (acquisitions, renames). Newest first. */
  path?: { org: string; date: string; note: string }[];
  summary: string;
  points: string[];
  tags: string[];
};

export const ROLES: Role[] = [
  {
    date: "Jan 2025 — now",
    place: "Chennai",
    org: "HealthEdge",
    url: "https://healthedge.com",
    title: "Developer I, Software Engineering",
    now: true,
    path: [
      { org: "HealthEdge", date: "Aug 2026", note: "HealthProof merged with HealthEdge" },
      { org: "HealthProof Pvt Ltd", date: "Jul 2025", note: "The subsidiary became its own company" },
      { org: "UST HealthProof", date: "Jan 2025", note: "Moved into the healthcare subsidiary as a developer" },
      { org: "UST", date: "Aug 2024", note: "Four months of training before joining the team" },
    ],
    summary: "Spring Boot and Spring Batch microservices for healthcare transaction ETL, plus an Angular application. 100% test coverage. Two-time Shining Star Award.",
    points: [
      "Build Spring Boot and Spring Batch microservices that run ETL over healthcare transactions.",
      "One of the team's few core developers. I work across every module and fix production bugs fast.",
      "Deliver client requirements on time, with unit and integration tests in all four modules (JUnit, Mockito, MockMvc, Testcontainers).",
      "Took every Java service and the Angular application to 100% test coverage.",
      "Optimised the Angular application by restructuring the build and applying framework best practices.",
      "Tuned the Java services the same way and built optimised Spring Batch services for several clients.",
      "Shining Star Award, twice, for on-time delivery, meeting client expectations and reliability.",
    ],
    tags: ["Java", "Spring Boot", "Spring Batch", "Angular", "PostgreSQL", "AWS S3 · CloudWatch", "Testcontainers"],
  },
  {
    date: "Jan — Feb 2024",
    org: "Matlync",
    url: "https://matlync.com",
    title: "Full Stack Next.js Developer",
    summary: "A CRM for a boutique: Next.js front end, Strapi back end.",
    points: [
      "Built a CRM web app for a boutique, front end to back end.",
      "Next.js front end on a Strapi headless CMS, with the content model and REST APIs set up in Strapi.",
    ],
    tags: ["Next.js", "TypeScript", "Strapi"],
  },
  {
    date: "Sep 2023 — Jan 2024",
    org: "STEAM Troops Innovation Labs",
    url: "https://steamtroops.com",
    title: "Full Stack Next.js Developer",
    summary: "A complete learning management system, deployed on AWS with CI/CD.",
    points: [
      "Built a fully working learning management system with Next.js, shadcn/ui and Tailwind CSS.",
      "Added authentication with NextAuth and a REST API back end.",
      "Packaged it with Docker and deployed it to AWS through a GitHub Actions CI/CD pipeline.",
    ],
    tags: ["Next.js", "NextAuth", "Docker", "AWS", "GitHub Actions"],
  },
  {
    date: "Jan 2023",
    place: "Trichy",
    org: "Systech",
    url: "https://systechgroup.in",
    title: "Intern, Hardware and Networking",
    summary: "Hardware and networking, trained on the CCNA and CCNP curriculum.",
    points: [
      "Hands-on work with computer hardware and network setup.",
      "Trained on the CCNA and CCNP curriculum: routing, switching and subnetting.",
    ],
    tags: ["Networking", "Routing and switching", "Hardware"],
  },
];

/** Everything used on the job and on side projects, and what is still being learnt. */
export const SKILLS: { used: { name: string; items: string[] }[]; learning: string[] } = {
  used: [
    { name: "Languages", items: ["Java 21", "TypeScript", "JavaScript", "Rust", "Python", "SQL", "Shell", "Lua"] },
    { name: "Backend", items: ["Spring Boot", "Spring Batch", "Spring Security", "Spring MVC", "Node.js", "tRPC", "FastAPI", "Strapi", "REST APIs"] },
    { name: "Frontend", items: ["Angular", "React 19", "Next.js", "Tailwind CSS", "shadcn/ui", "NextAuth", "Better Auth", "React Native", "Tauri"] },
    { name: "Data", items: ["PostgreSQL", "Drizzle", "Flyway", "Redis", "MongoDB", "SQLite FTS5", "ETL pipelines"] },
    { name: "Cloud and delivery", items: ["Docker", "Docker Compose", "AWS S3", "CloudWatch", "GitHub Actions", "nginx", "Cloudflare Tunnel", "Turborepo", "Maven"] },
    { name: "Testing", items: ["JUnit", "Mockito", "MockMvc", "Testcontainers", "Integration testing"] },
    { name: "Networking", items: ["Routing and switching", "Subnetting", "TCP/IP", "CCNA / CCNP curriculum"] },
    { name: "Workflow", items: ["Neovim", "tmux", "Git", "lazygit", "Linux", "Ollama"] },
  ],
  learning: ["Core Java internals: concurrency, GC", "System design", "Spring Cloud", "Security and cloud architecture", "Production DevOps", "Local LLMs and applied AI", "Data structures and algorithms", "German (A1)"],
};

export const BRIEF = [
  { label: "Now", title: "Developer I, Software Engineering · HealthEdge", body: "Since Jan 2025 · Spring Boot / Batch microservices for healthcare transaction ETL" },
  { label: "Open to", title: "Remote or hybrid: Germany, Bangalore, Chennai", body: "Full-time, backend or full stack", blade: true },
  { label: "Experience", title: "~2.5 years", body: "Java/Spring and TypeScript/Next.js, after three internships" },
  { label: "Recognition", title: "Shining Star Award ×2", body: "For on-time delivery, production fixes and reliability across every module" },
  { label: "Languages", title: "English · Tamil · German A1", body: "Native English and Tamil · learning German at the Goethe-Institut" },
  { label: "Education", title: "B.Tech, CS & Business Systems", body: "Rajalakshmi Engineering College, 2020–24 · GPA 7.98 / 10" },
];

export const STACK_GROUPS: { name: string; why: string; items: string[] }[] = [
  { name: "Frontend", why: "Type-safe end to end, server-first React.", items: ["*TypeScript", "*React", "*Next.js", "*Tailwind CSS", "*shadcn/ui", "*tRPC", "NextAuth · Better Auth", "Zod"] },
  { name: "Backend", why: "Where I am most at home: JVM services and batch.", items: ["*Java 21", "*Spring Boot", "*Spring Batch", "Spring Security", "Spring MVC", "Node.js", "Strapi", "JUnit · Mockito · Testcontainers"] },
  { name: "Database and storage", why: "Relational first.", items: ["*PostgreSQL", "*Drizzle", "Flyway", "Redis", "MongoDB", "AWS S3"] },
  { name: "Cloud, DevOps and tooling", why: "Self-hostable by default; AWS at work.", items: ["*Docker", "Docker Compose", "nginx", "*GitHub Actions", "AWS", "*Turborepo", "*pnpm", "Maven"] },
  { name: "Daily workflow", why: "A keyboard-only macOS setup, one command to install.", items: ["*Neovim", "*tmux", "*Ghostty", "zsh · Starship", "yabai · skhd · sketchybar", "lazygit", "nyx"] },
  { name: "Systems and networking", why: "Where I started: hardware and networks.", items: ["*Routing and switching", "TCP/IP", "Linux", "Rust", "Tauri"] },
  { name: "Current edges", why: "What I am actively sharpening right now.", items: ["Core Java internals — concurrency, GC", "System design", "Spring Cloud", "Production DevOps hardening", "Local LLMs · Ollama", "DSA"] },
];

export const MARQUEE = ["Java 21", "Spring Boot", "Spring Batch", "TypeScript", "Next.js 16", "React 19", "tRPC", "Drizzle", "PostgreSQL", "Docker", "AWS", "Rust", "Tauri", "Ollama", "Neovim", "tmux"];

export const REASONS: { id: string; label: string; placeholder: string }[] = [
  { id: "role", label: "A full-time role", placeholder: "Role, team, location (remote / Bangalore) and anything I should know." },
  { id: "freelance", label: "A freelance project", placeholder: "What you need built, rough timeline and budget." },
  { id: "hi", label: "Just saying hi", placeholder: "What's on your mind?" },
];

export const UPDATED = "Nov 2026";

/**
 * Real images live in /public. Until a file exists the page shows a styled
 * fallback, so dropping files in is all it takes. See public/ASSETS.txt.
 */
export const MEDIA = {
  photo: "/me.jpg",
  logos: {
    HealthEdge: "/logos/healthedge.svg",
    Matlync: "/logos/matlync.png",
    "STEAM Troops Innovation Labs": "/logos/steam-troops.png",
    Systech: "/logos/systech.png",
  } as Record<string, string>,
  shot: (slug: string) => COVERS[slug] ?? `/projects/${slug}.png`,
};
