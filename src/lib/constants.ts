import {
  NavLink,
  Project,
  SocialLink,
  StackGroup,
  WorkExperience,
} from "./types";

export const PROJECTS: Project[] = [
  {
    id: "dotfiles",
    title: "dotfiles",
    description:
      "a personal development setup for keeping editor, shell, and tooling workflows fast and reproducible.",
    features: [
      "custom dev environment",
      "optimized cli workflows",
      "config automation",
    ],
    githubLink: "https://github.com/maarcusrenierol/dotfiles",
    hostedLink: "",
    startDate: "2024-06-03",
    endDate: null,
    isOngoing: true,
    category: "miscellaneous",
    skills: ["lua", "yml", "toml"],
    status: "maintained",
    role: "systems tinkerer and workflow designer",
    impact:
      "keeps my everyday development environment reproducible across machines and reduces setup friction when i move between projects.",
    challenge:
      "personal tooling can become fragile fast, especially when shell, editor, package managers, and project-specific habits drift apart.",
    approach: [
      "split editor, shell, and tool configuration into small focused modules.",
      "kept setup scripts explicit so a fresh machine can be brought close to my daily environment quickly.",
      "treated the repository as a living manual for shortcuts, aliases, and workflow choices.",
    ],
    outcome: [
      "faster onboarding on new machines.",
      "less context switching between project setups.",
      "a clearer record of the tools i actually rely on every day.",
    ],
    decisions: [
      "kept config grouped by tool so changes stay easy to reason about.",
      "favored readable setup steps over clever one-liners.",
      "used the repo as both automation and documentation.",
    ],
    lessons: [
      "developer experience compounds when the small daily actions are smooth.",
      "a personal setup is easier to maintain when every file has a clear owner.",
    ],
    nextSteps: [
      "add a fresh-machine bootstrap checklist.",
      "document the most-used aliases and editor motions.",
      "split machine-specific pieces from reusable defaults.",
    ],
    preview: "terminal",
  },
  {
    id: "next-cli",
    title: "next-cli",
    description:
      "an interactive cli that scaffolds production-ready next.js apps in one command — pick your auth, database, orm, api layer, payments, email, and analytics, and it wires them together into a typed, ready-to-run project.",
    features: [
      "one-command interactive scaffolding for full-stack next.js apps",
      "modular stack: next-auth/clerk/kinde, prisma/drizzle, trpc/graphql/hono/rest, stripe and more",
      "generates typed projects with env, providers, and dependencies wired up",
      "ships with a marketing site covering quickstart, integrations, and faq",
    ],
    githubLink: "https://github.com/maarcusrenierol/next-cli",
    hostedLink: "",
    startDate: "2024-09-19",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: ["next.js", "typescript", "tailwind css", "shadcn ui"],
    highlight: true,
    status: "active",
    role: "designer, developer, and cli author",
    impact:
      "turns repeated next.js setup into a guided flow — every supported stack combination now scaffolds a project that builds and lints clean.",
    challenge:
      "the cli looked finished but almost nothing it generated actually built; the real work was making every prompt produce a working, type-safe project.",
    approach: [
      "implemented the missing installers — next-auth, drizzle, graphql, payments, and email providers — and wired every prompt into the generator.",
      "treated the generated project's build as the real test: scaffolded many stack combinations and ran a full next build on each.",
      "fixed the scaffolding bugs that broke first builds — missing dependencies, a hardcoded path alias, a no-op installer, and swapped file arguments.",
    ],
    outcome: [
      "every option combination scaffolds a project that builds and lints cleanly.",
      "a landing page with a live quickstart, integrations showcase, and faq.",
      "a tested foundation ready to publish to npm.",
    ],
    decisions: [
      "treated the output build as the source of truth instead of the cli's own unit tests.",
      "kept generated code type-safe under strict mode rather than leaning on @ts-nocheck.",
      "made layout and stack choices first-class so generated projects stay consistent.",
    ],
    lessons: [
      "a generator's tests are worthless if they never compile the output.",
      "compiling is not the same as working.",
    ],
    nextSteps: [
      "publish the cli to npm.",
      "write the docs site.",
      "add more templates and presets.",
    ],
    preview: "terminal",
  },
  {
    id: "portfolio",
    title: "portfolio",
    description:
      "this portfolio: a minimal, keyboard-friendly space for projects, work, and proof of how i build.",
    features: [
      "terminal-inspired, keyboard-friendly interface",
      "data-driven projects and experience sections",
      "dynamic open graph image and resume download",
    ],
    githubLink: "https://github.com/maarcusrenierol/portfolio",
    hostedLink: "https://maarcus.dev",
    startDate: "2024-07-18",
    endDate: null,
    isOngoing: true,
    category: "front end",
    skills: ["next.js", "tailwind css", "shadcn ui"],
    status: "active",
    role: "designer, developer, and owner",
    impact:
      "acts as a living proof-of-work system for projects, writing, career history, and live presence.",
    challenge:
      "a personal site needs personality without becoming noisy, and it has to stay easy to update as the work changes.",
    approach: [
      "built around a minimal terminal-inspired visual system with keyboard-friendly navigation.",
      "kept core content in typed data structures so project and career updates stay simple.",
      "kept the strongest recruiter signals close to the top: projects, experience, stack, resume, and contact.",
    ],
    outcome: [
      "a compact portfolio that feels personal instead of generic.",
      "fast access to resume, links, and project proof.",
      "a foundation for deeper case studies and richer project storytelling.",
    ],
    decisions: [
      "kept navigation keyboard-friendly because the site leans into a terminal feel.",
      "kept content data-driven so pages can grow without rewriting layouts.",
      "kept the visual system consistent so spacing and hierarchy carry the design.",
    ],
    lessons: [
      "personal sites work better when they show how someone thinks, not just what they used.",
      "a strong visual system can stay simple if the spacing and hierarchy are consistent.",
    ],
    nextSteps: [
      "add a real portrait asset when available.",
      "continue turning featured projects into deeper case studies.",
      "publish more build logs from the work behind the site.",
    ],
    preview: "dashboard",
  },
  {
    id: "zentro",
    title: "zentro",
    description:
      "a multi-tenant collaboration platform exploring workspaces, boards, permissions, and activity flows.",
    features: [
      "building a multi-tenant collaboration platform.",
      "designed scalable organization, workspace, membership, and permission models to support multi-tenant access control.",
      "building a modular backend workflows for boards, tasks, notifications, and collaborative activity tracking.",
    ],
    githubLink: "https://github.com/maarcusrenierol/zentro",
    hostedLink: "",
    startDate: "2024-07-18",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: [
      "next.js",
      "tailwind css",
      "shadcn ui",
      "trpc",
      "zod",
      "resend",
      "drizzle orm",
      "typescript",
      "postgresql",
      "react hook form",
      "uploadthing",
      "upstash redis",
    ],
    highlight: true,
    status: "active",
    role: "full-stack product builder",
    impact:
      "explores the architecture behind collaborative workspaces, boards, permissions, and activity-heavy saas flows.",
    challenge:
      "multi-tenant products need clean boundaries between organizations, workspaces, members, and the actions each user can take.",
    approach: [
      "modeled organizations, workspaces, members, and permissions as first-class concepts.",
      "planned modular backend workflows for boards, tasks, notifications, and activity events.",
      "used typed validation and data access patterns to keep product flows reliable as the surface area grows.",
    ],
    outcome: [
      "stronger understanding of saas tenancy and access control.",
      "a practical playground for real-time collaboration and activity systems.",
      "a long-term project that can grow into a serious product experiment.",
    ],
    decisions: [
      "modeled tenancy first so every feature can respect organization boundaries.",
      "kept permissions close to membership and workspace concepts.",
      "planned activity flows early because collaboration products need auditability.",
    ],
    lessons: [
      "multi-tenant structure gets expensive if it is treated as an afterthought.",
      "collaboration features need product clarity before technical complexity.",
    ],
    nextSteps: [
      "ship a tighter board and task workflow.",
      "add activity feeds and notification preferences.",
      "stress-test permission paths across organization roles.",
    ],
    preview: "system",
  },
];

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    id: 1,
    title: "hardware and network engineering intern",
    company: "systech",
    href: "https://systechgroup.in",
    startDate: "2023-01-01",
    endDate: "2023-02-28",
    isOngoing: false,
    highlights: [
      "completed ccna and ccnp certifications.",
      "applied theoretical knowledge to configure and troubleshoot network devices.",
      "showcased hands-on expertise in optimizing network performance.",
    ],
    skills: [
      "networking",
      "ccna",
      "ccnp",
      "network configuration",
      "troubleshooting",
    ],
  },
  {
    id: 2,
    title: "full stack developer intern",
    company: "steam troops innovation labs",
    href: "https://steamtroops.com/",
    startDate: "2023-08-01",
    endDate: "2023-12-31",
    isOngoing: false,
    highlights: [
      "played a pivotal role in the company’s first product development using next.js, typescript, tailwind css, and strapi.",
      "managed daily sprints and collaborated closely with cross-functional teams.",
      "contributed across the full stack in a fast-paced startup environment.",
    ],
    skills: [
      "next.js",
      "typescript",
      "tailwind css",
      "strapi",
      "next-auth",
      "shadcn ui",
      "prisma",
      "postgresql",
      "aws",
      "docker",
    ],
  },
  {
    id: 3,
    title: "full stack developer intern",
    company: "matlync",
    href: "https://matlync.com/",
    startDate: "2024-01-01",
    endDate: "2024-02-29",
    isOngoing: false,
    highlights: [
      "coordinated with teams on multiple ongoing projects.",
      "worked extensively with strapi cms, postbytz, and next.js.",
      "handled iterative testing, debugging, and issue resolution across modules.",
    ],
    skills: [
      "next.js",
      "typescript",
      "tailwind css",
      "strapi",
      "postbytz",
      "three js",
    ],
  },
  {
    id: 4,
    title: "developer 1 - software engineering",
    company: "ust healthproof",
    href: "https://www.usthealthproof.com/",
    startDate: "2025-01-01",
    endDate: null,
    isOngoing: true,
    highlights: [
      "building a new internal project from the ground up.",
      "collaborating with cross-functional teams to design and implement scalable solutions.",
      "focusing on clean architecture, maintainability, and performance.",
    ],
    skills: [
      "angular",
      "typescript",
      "java",
      "spring boot",
      "mysql server",
      "aws",
      "spring batch",
      "spring data jpa",
    ],
  },
];

export const PROFILE = {
  headshot: "",
};

export const LINKS: SocialLink[] = [
  { name: "email", url: "mailto:maarcusreniero.l@gmail.com" },
  { name: "github", url: "https://github.com/maarcusrenierol" },
  { name: "linkedin", url: "https://www.linkedin.com/in/maarcus-reniero-l" },
];

export const NAV_LINKS: NavLink = [
  "home",
  "projects",
  "blog",
  "about",
  "stack",
  "contact",
  "resume",
];

export const STACK_GROUPS: StackGroup[] = [
  {
    eyebrow: "interfaces",
    title: "frontend",
    items: ["next.js", "react", "typescript", "tailwind css", "shadcn ui"],
  },
  {
    eyebrow: "services",
    title: "backend",
    items: ["java", "spring boot", "trpc", "zod", "server actions"],
  },
  {
    eyebrow: "data",
    title: "database",
    items: ["postgresql", "mysql server", "drizzle orm", "prisma", "upstash redis"],
  },
  {
    eyebrow: "delivery",
    title: "cloud and tooling",
    items: ["aws", "docker", "vercel", "git", "github actions"],
  },
  {
    eyebrow: "craft",
    title: "daily workflow",
    items: ["neovim", "terminal", "dotfiles", "pnpm", "system design notes"],
  },
  {
    eyebrow: "learning",
    title: "current edges",
    items: ["angular", "spring batch", "multi-tenant systems", "product design"],
  },
];
