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
  /** Optional booking link (Cal.com etc.), set NEXT_PUBLIC_CAL_URL to show it. */
  call: process.env.NEXT_PUBLIC_CAL_URL || "",
  open: "Looking for a full-time remote or hybrid role in Germany, Bangalore or Chennai. Open to freelance work too.",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/certifications", label: "Certifications" },
  { href: "/blog", label: "Writing" },
  { href: "/notes", label: "Notes" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

import { assertContent, certificateSchema, check, educationSchema, projectSchema, roleSchema, skillsSchema } from "./schema";
import type { Category, Certificate, Education, Project, Role, Skills } from "./schema";

export type { Category, Certificate, Education, Project, Role };

const GH = "https://github.com/MaarcusRenieroL";

/** Listed in the order they appear; numbers ("01"…) are assigned from the order. */
const PROJECT_DATA = [
  {
    slug: "nyx",
    cover: "03-launcher-search.webp",
    name: "nyx",
    kind: "macOS app",
    status: "v1.0 · open source",
    featured: true,
    cats: ["ai", "systems"],
    desc: "An offline-first launcher to replace Spotlight, Alfred and Raycast, with a local AI over Ollama. Around 35 MB idle, and nothing leaves the machine.",
    skills: ["Rust", "Tauri", "React", "SQLite FTS5", "Ollama"],
    site: "https://nyx.maarcus.dev",
    github: `${GH}/nyx`,
  },
  {
    slug: "next-kit",
    cover: "01-cli-summary.webp",
    name: "next-kit",
    kind: "CLI · npm",
    status: "Published",
    featured: true,
    cats: ["tooling", "frontend"],
    desc: "An interactive CLI that scaffolds a Next.js app from over twenty installers: auth, ORM, email, payments, API layer, analytics and UI. Published on npm.",
    skills: ["TypeScript", "Node.js", "tsup", "Turborepo"],
    site: "https://www.npmjs.com/package/@mxrcxs17/next-kit",
    github: `${GH}/next-kit`,
  },
  {
    slug: "dotfiles",
    hidden: true,
    cover: "01-tmux-neovim.webp",
    name: "dotfiles",
    kind: "Config",
    status: "Public",
    featured: true,
    cats: ["tooling"],
    desc: "My macOS setup in one command: zsh, Neovim, tmux, Ghostty and a yabai tiling desktop in one theme. Dry-run, backups and an uninstall make it safe to try.",
    skills: ["Shell", "Neovim", "Lua", "tmux"],
    github: `${GH}/dotfiles`,
  },
  {
    slug: "portfolio",
    hidden: true,
    name: "portfolio",
    kind: "Web",
    status: "This site",
    featured: true,
    cats: ["frontend"],
    desc: "This site: light and dark themes, CSS-first motion, a typed content source with schema checks, and keyboard navigation on lists.",
    skills: ["Next.js 16", "React 19", "Tailwind 4", "TypeScript"],
    site: "https://maarcus.dev",
    github: `${GH}/portfolio`,
  },
];

/** Plain <img> tags don't get Next's basePath, so prefix it here (empty in production). */
export const shotUrl = (slug: string, file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/projects/${slug}/${file}`;

/** Every project in the data, including hidden ones. The site shows `PROJECTS`. */
export const ALL_PROJECT_DATA = PROJECT_DATA.map((p) => check("project", p.slug, projectSchema, p));

export const PROJECTS: Project[] = ALL_PROJECT_DATA.filter((p) => !p.hidden).map((p, i) => ({
  ...p,
  num: String(i + 1).padStart(2, "0"),
}));

/** Card image per project: its `cover` file in /public/projects/<slug>/. Computed once at import. */
export const COVERS: Record<string, string> = Object.fromEntries(
  PROJECTS.filter((p) => p.cover).map((p) => [p.slug, shotUrl(p.slug, p.cover!)]),
);

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
    logo: "matlync.svg",
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
    logo: "steam-troops.png",
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

const CERTIFICATE_DATA = [
  {
    slug: "aws-cloud-foundations",
    title: "AWS Academy Cloud Foundations",
    issuer: "AWS Academy",
    date: "2022-09-24",
    hours: 20,
    about: "Core AWS services, cloud architecture and the shared responsibility model.",
    preview: "aws-cloud-foundations.jpg",
    file: "aws-cloud-foundations.pdf",
    verify: "https://www.credly.com/go/dZXGDkY7",
  },
  {
    slug: "oracle-plsql",
    title: "Database Programming with PL/SQL",
    issuer: "Oracle Academy",
    date: "2022-06-02",
    about: "Stored procedures, functions, packages and triggers in PL/SQL.",
  },
  {
    slug: "oracle-sql",
    title: "Database Programming with SQL",
    issuer: "Oracle Academy",
    date: "2022-05-15",
    about: "Relational design and SQL queries, joins and data definition.",
  },
  {
    slug: "cpp-beginner-to-beyond",
    title: "Beginning C++ Programming: From Beginner to Beyond",
    issuer: "Udemy",
    date: "2020-11-14",
    hours: 41.5,
    instructors: "Tim Buchalka's Learn Programming Academy, Frank Mitropoulos",
    about: "C++ fundamentals through object-oriented programming and the standard library.",
    preview: "cpp-beginner-to-beyond.jpg",
    file: "cpp-beginner-to-beyond.pdf",
  },
  {
    slug: "web-dev-bootcamp-2020",
    title: "The Complete 2020 Web Development Bootcamp",
    issuer: "Udemy",
    date: "2020-08-27",
    hours: 54,
    instructors: "Dr. Angela Yu",
    about: "HTML, CSS, JavaScript, Node.js, Express and databases, end to end.",
    preview: "web-dev-bootcamp-2020.jpg",
    file: "web-dev-bootcamp-2020.pdf",
  },
  {
    slug: "r-programming-az",
    title: "R Programming A-Z: R For Data Science With Real Exercises",
    issuer: "Udemy",
    date: "2021-04-17",
    hours: 10.5,
    instructors: "Kirill Eremenko, Ligency Team",
    about: "Data wrangling, visualisation and statistics in R.",
    preview: "r-programming-az.jpg",
    file: "r-programming-az.pdf",
  },
  {
    slug: "dsa-cpp-2023",
    title: "Data Structure & Algorithm using C++: Zero To Mastery 2023",
    issuer: "Udemy",
    date: "2023-02-24",
    hours: 64.5,
    instructors: "Ankit Thakran, Harsh Kajla",
    about: "Arrays, linked lists, trees, graphs, sorting, recursion and dynamic programming in C++.",
    preview: "dsa-cpp-2023.jpg",
    file: "dsa-cpp-2023.pdf",
  },
  {
    slug: "systech-internship",
    title: "Internship: Hardware and Networking",
    issuer: "Systech",
    date: "2023-01-19",
    about: "Two-week internship, 4 to 19 January 2023: hardware and network setup.",
    preview: "systech-internship.jpg",
    file: "systech-internship.jpg",
  },
  {
    slug: "google-git-github",
    title: "Introduction to Git and GitHub",
    issuer: "Google (Coursera)",
    date: "2023-06-05",
    about: "Version control with Git and collaboration on GitHub.",
    preview: "google-git-github.jpg",
    file: "google-git-github.pdf",
    verify: "https://coursera.org/verify/2LML5UAVYSE3",
  },
  {
    slug: "modern-react-redux-2023",
    title: "Modern React with Redux [2023 Update]",
    issuer: "Udemy",
    date: "2023-07-24",
    hours: 37.5,
    instructors: "Stephen Grider",
    about: "React, hooks, Redux and Redux Toolkit with real projects.",
    preview: "modern-react-redux-2023.jpg",
    file: "modern-react-redux-2023.pdf",
  },
  {
    slug: "nextjs-blog-project",
    title: "Next.js Real World Blog Project with MongoDB, Prisma, NextAuth, Tailwind and shadcn/ui",
    issuer: "Indian Coders",
    date: "2023-08-21",
    about: "A full Next.js blog: auth, database, UI components.",
    preview: "nextjs-blog-project.jpg",
    file: "nextjs-blog-project.jpg",
  },
];

/** Newest first. */
export const CERTIFICATES: Certificate[] = CERTIFICATE_DATA.map((c) => check("certificate", c.slug, certificateSchema, c)).sort((a, b) => b.date.localeCompare(a.date));

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
};

export const SKILLS: Skills = check("skills", "skills", skillsSchema, SKILLS_DATA);





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
  /** Class for a role's logo tile, so light artwork gets a dark tile. */
  logoClass: (org: string) => (ROLES.find((r) => r.org === org)?.logoOn === "dark" ? "logo logo-dark" : "logo"),
};

assertContent({ projects: PROJECTS, roles: ROLES });
