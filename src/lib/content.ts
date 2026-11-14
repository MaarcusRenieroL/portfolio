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

import { CASE_STUDIES, COVERS } from "./case-studies";
import { assertContent, caseStudySchema, check, educationSchema, projectSchema, roleSchema, skillsSchema, stackGroupSchema } from "./schema";
import type { Category, Education, Project, Role, Skills, StackGroup } from "./schema";

export { CASE_STUDIES, COVERS, shotUrl } from "./case-studies";
export type { CaseStudy, Shot } from "./schema";
export type { Category, Education, Project, Role };

const GH = "https://github.com/MaarcusRenieroL";

/** Listed in the order they appear; numbers ("01"…) are assigned from the order. */
const PROJECT_DATA = [
  {
    slug: "life-os",
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
    name: "next-kit",
    kind: "CLI · npm",
    status: "Published",
    featured: true,
    cats: ["tooling", "frontend"],
    desc: "An interactive CLI that scaffolds a Next.js app from over twenty installers: auth, ORM, email, payments, API layer, analytics and UI. Published on npm.",
    skills: ["TypeScript", "Node.js", "tsup", "Turborepo"],
    site: "https://www.npmjs.com/package/@mxrcxs17/next-kit",
    github: `${GH}/next-kit`,
    study: true,
  },
  {
    slug: "snap-pass",
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
    slug: "dotfiles",
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

export const PROJECTS: Project[] = PROJECT_DATA.map((p, i) => ({
  ...check("project", p.slug, projectSchema, p),
  num: String(i + 1).padStart(2, "0"),
}));

export const CATEGORIES: [string, string][] = [
  ["all", "All"],
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["ai", "AI"],
  ["systems", "Systems"],
  ["tooling", "Tooling"],
];

const ROLE_DATA = [
  {
    date: "Jan 2025 — now",
    place: "Chennai",
    org: "HealthEdge",
    logo: "healthedge.svg",
    url: "https://healthedge.com",
    title: "Developer I, Software Engineering",
    now: true,
    path: [
      {
        org: "HealthEdge",
        date: "Aug 2026",
        note: "HealthProof merged with HealthEdge",
      },
      {
        org: "HealthProof Pvt Ltd",
        date: "Jul 2025",
        note: "The subsidiary became its own company",
      },
      {
        org: "UST HealthProof",
        date: "Jan 2025",
        note: "Moved into the healthcare subsidiary as a developer",
      },
      {
        org: "UST",
        date: "Aug 2024",
        note: "Four months of training before joining the team",
      },
    ],
    summary:
      "Spring Boot and Spring Batch microservices for healthcare transaction ETL, plus an Angular application. 100% test coverage. Two-time Shining Star Award.",
    points: [
      "Build Spring Boot and Spring Batch microservices that run ETL over healthcare transactions.",
      "One of the team's few core developers. I work across every module and fix production bugs fast.",
      "Deliver client requirements on time, with unit and integration tests in all four modules (JUnit, Mockito, MockMvc, Testcontainers).",
      "Took every Java service and the Angular application to 100% test coverage.",
      "Optimised the Angular application by restructuring the build and applying framework best practices.",
      "Tuned the Java services the same way and built optimised Spring Batch services for several clients.",
      "Shining Star Award, twice, for on-time delivery, meeting client expectations and reliability.",
    ],
    tags: [
      "Java",
      "Spring Boot",
      "Spring Batch",
      "Angular",
      "PostgreSQL",
      "AWS S3 · CloudWatch",
      "Testcontainers",
    ],
  },
  {
    date: "Jan — Feb 2024",
    org: "Matlync",
    logo: "matlync.png",
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
    summary:
      "A complete learning management system, deployed on AWS with CI/CD.",
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
    logo: "systech.png",
    url: "https://systechgroup.in",
    title: "Intern, Hardware and Networking",
    summary:
      "Hardware and networking, trained on the CCNA and CCNP curriculum.",
    points: [
      "Hands-on work with computer hardware and network setup.",
      "Trained on the CCNA and CCNP curriculum: routing, switching and subnetting.",
    ],
    tags: ["Networking", "Routing and switching", "Hardware"],
  },
];

export const ROLES: Role[] = ROLE_DATA.map((r) => check("role", r.org, roleSchema, r));

export const EDUCATION: Education[] = [
  {
    school: "Rajalakshmi Engineering College",
    degree: "B.Tech, Computer Science and Business Systems",
    date: "2020 — 2024",
    note: "GPA 7.98 / 10",
  },
].map((e) => check("education", e.school, educationSchema, e));

/** Everything used on the job and on side projects, and what is still being learnt. */
const SKILLS_DATA = {
  used: [
    {
      name: "Languages",
      items: [
        "Java 21",
        "TypeScript",
        "JavaScript",
        "Rust",
        "Python",
        "SQL",
        "Shell",
        "Lua",
      ],
    },
    {
      name: "Backend",
      items: [
        "Spring Boot",
        "Spring Batch",
        "Spring Security",
        "Spring MVC",
        "Node.js",
        "tRPC",
        "FastAPI",
        "Strapi",
        "REST APIs",
      ],
    },
    {
      name: "Frontend",
      items: [
        "Angular",
        "React 19",
        "Next.js",
        "Tailwind CSS",
        "shadcn/ui",
        "NextAuth",
        "Better Auth",
        "React Native",
        "Tauri",
      ],
    },
    {
      name: "Data",
      items: [
        "PostgreSQL",
        "Drizzle",
        "Flyway",
        "Redis",
        "MongoDB",
        "SQLite FTS5",
        "ETL pipelines",
      ],
    },
    {
      name: "Cloud and delivery",
      items: [
        "Docker",
        "Docker Compose",
        "AWS S3",
        "CloudWatch",
        "GitHub Actions",
        "Turborepo",
        "Maven",
      ],
    },
    {
      name: "Testing",
      items: [
        "JUnit",
        "Mockito",
        "MockMvc",
        "Testcontainers",
        "Integration testing",
      ],
    },
    {
      name: "Networking",
      items: [
        "Routing and switching",
        "Subnetting",
        "TCP/IP",
        "CCNA / CCNP curriculum",
      ],
    },
    {
      name: "Workflow",
      items: ["Neovim", "tmux", "Git", "lazygit", "Linux", "Ollama"],
    },
  ],
  learning: [
    "Core Java internals: concurrency, GC",
    "System design",
    "Spring Cloud",
    "Security and cloud architecture",
    "Production DevOps",
    "Local LLMs and applied AI",
    "Data structures and algorithms",
    "German (A1)",
  ],
};

export const SKILLS: Skills = check("skills", "skills", skillsSchema, SKILLS_DATA);

export const BRIEF = [
  {
    label: "Now",
    title: "Developer I, Software Engineering · HealthEdge",
    body: "Since Jan 2025 · Spring Boot / Batch microservices for healthcare transaction ETL",
  },
  {
    label: "Open to",
    title: "Remote or hybrid: Germany, Bangalore, Chennai",
    body: "Full-time, backend or full stack",
    blade: true,
  },
  {
    label: "Experience",
    title: "~2.5 years",
    body: "Java/Spring and TypeScript/Next.js, after three internships",
  },
  {
    label: "Recognition",
    title: "Shining Star Award ×2",
    body: "For on-time delivery, production fixes and reliability across every module",
  },
  {
    label: "Languages",
    title: "English · Tamil · German A1",
    body: "Native English and Tamil · learning German at the Goethe-Institut",
  },
  {
    label: "Education",
    title: "B.Tech, CS & Business Systems",
    body: "Rajalakshmi Engineering College, 2020–24 · GPA 7.98 / 10",
  },
];

const STACK_DATA = [
  {
    name: "Frontend",
    why: "Type-safe end to end, server-first React.",
    items: [
      "*TypeScript",
      "*React",
      "*Next.js",
      "*Tailwind CSS",
      "*shadcn/ui",
      "*tRPC",
      "NextAuth · Better Auth",
      "Zod",
    ],
  },
  {
    name: "Backend",
    why: "Where I am most at home: JVM services and batch.",
    items: [
      "*Java 21",
      "*Spring Boot",
      "*Spring Batch",
      "Spring Security",
      "Spring MVC",
      "Node.js",
      "Strapi",
      "JUnit · Mockito · Testcontainers",
    ],
  },
  {
    name: "Database and storage",
    why: "Relational first.",
    items: ["*PostgreSQL", "*Drizzle", "Flyway", "Redis", "MongoDB", "AWS S3"],
  },
  {
    name: "Cloud, DevOps and tooling",
    why: "Self-hostable by default; AWS at work.",
    items: [
      "*Docker",
      "Docker Compose",
      "*GitHub Actions",
      "AWS",
      "*Turborepo",
      "*pnpm",
      "Maven",
    ],
  },
  {
    name: "Daily workflow",
    why: "A keyboard-only macOS setup, one command to install.",
    items: [
      "*Neovim",
      "*tmux",
      "*Ghostty",
      "zsh · Starship",
      "yabai · skhd · sketchybar",
      "lazygit",
      "nyx",
    ],
  },
  {
    name: "Systems and networking",
    why: "Where I started: hardware and networks.",
    items: ["*Routing and switching", "TCP/IP", "Linux", "Rust", "Tauri"],
  },
  {
    name: "Current edges",
    why: "What I am actively sharpening right now.",
    items: [
      "Core Java internals — concurrency, GC",
      "System design",
      "Spring Cloud",
      "Production DevOps hardening",
      "Local LLMs · Ollama",
      "DSA",
    ],
  },
];

export const STACK_GROUPS: StackGroup[] = STACK_DATA.map((g) => check("stack group", g.name, stackGroupSchema, g));

export const MARQUEE = [
  "Java 21",
  "Spring Boot",
  "Spring Batch",
  "TypeScript",
  "Next.js 16",
  "React 19",
  "tRPC",
  "Drizzle",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Rust",
  "Tauri",
  "Ollama",
  "Neovim",
  "tmux",
];

export const REASONS: { id: string; label: string; placeholder: string }[] = [
  {
    id: "role",
    label: "A full-time role",
    placeholder:
      "Role, team, location (remote / Bangalore) and anything I should know.",
  },
  {
    id: "freelance",
    label: "A freelance project",
    placeholder: "What you need built, rough timeline and budget.",
  },
  { id: "hi", label: "Just saying hi", placeholder: "What's on your mind?" },
];

export const UPDATED = "Nov 2026";

/**
 * Real images live in /public. Until a file exists the page shows a styled
 * fallback, so dropping files in is all it takes. See public/ASSETS.txt.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const MEDIA = {
  photo: `${BASE}/me.jpg`,
  /** Built from each role's `logo` field, so a new role needs no edit here. */
  logos: Object.fromEntries(ROLES.filter((r) => r.logo).map((r) => [r.org, `${BASE}/logos/${r.logo}`])) as Record<string, string>,
  shot: (slug: string) => COVERS[slug] ?? "",
};

assertContent({ projects: PROJECTS, roles: ROLES, caseStudies: CASE_STUDIES });
