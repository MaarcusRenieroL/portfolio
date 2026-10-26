import {
  NavLink,
  Project,
  SocialLink,
  StackGroup,
  WorkExperience,
} from "./types";

export const PROJECTS: Project[] = [
  {
    id: "nyx",
    title: "nyx",
    description:
      "a local-first desktop launcher and command layer for macOS: instant file and app search, a clipboard manager, and a local ai assistant that never leaves the machine.",
    features: [
      "warm command window summoned by a global hotkey, with inline calculations and grouped results",
      "native rust search core over a full-text index of local files",
      "local ai through ollama, with source citations and streamed tokens",
      "clipboard history with automatic redaction of card numbers and api keys",
      "sandboxed plugins with a manifest format and an importer for raycast and alfred packages",
      "zero-egress log inspector that shows the app makes no outbound calls",
    ],
    githubLink: "https://github.com/MaarcusRenieroL/nyx",
    hostedLink: "",
    startDate: "2026-10-19",
    endDate: null,
    isOngoing: true,
    category: "desktop app",
    tracks: ["ai", "security"],
    skills: ["tauri", "rust", "react", "typescript", "next.js", "tailwind css", "sqlite", "ollama"],
    highlight: true,
    status: "active",
    role: "designer and sole developer",
    impact:
      "an everyday launcher built around two constraints: results appear in microseconds, and nothing is ever sent to a server.",
    challenge:
      "a launcher is judged in the first hundred milliseconds. search, the window itself and the ai side all had to stay fast and stay offline at the same time.",
    approach: [
      "kept one warm window alive in memory so opening it costs nothing.",
      "put search, telemetry and secret scanning in a rust core behind tauri 2, with a react 19 interface on top.",
      "designed the whole surface set first (launcher, action panel, clipboard, settings, plugin docs) and built the web landing page and docs from the same design tokens.",
    ],
    outcome: [
      "seventeen designed surfaces across the desktop app and the web site.",
      "a benchmark in the repo reports a 420 µs average search over 50,000 files.",
      "a monorepo with a shared types and design-token package between desktop and web.",
    ],
    decisions: [
      "treated privacy as a build constraint: no outbound network code, and a log inspector to prove it.",
      "ran the ai through a local ollama bridge instead of a hosted model.",
      "made plugin authors write against a small sandboxed api instead of full system access.",
    ],
    lessons: [
      "speed is a product decision made on day one, not an optimisation you add later.",
      "a design system pays for itself the moment a second app needs it.",
    ],
    nextSteps: [
      "ship signed installers.",
      "open the plugin registry.",
      "finish the encrypted peer-to-peer sync.",
    ],
    preview: "terminal",
  },
  {
    id: "life-os",
    title: "life os",
    description:
      "a self-hosted personal operating system: passwords, money, jobs, habits, notes, tasks, calendar and workouts in one backend, with web, phone and desktop clients.",
    features: [
      "eleven backend modules in one spring boot process, each with its own postgres schema",
      "password vault with browser-extension autofill",
      "finance tracker, job tracker, habit tracker, notes, tasks and goals, calendar, workouts",
      "react web app, react native phone app and a tauri desktop app in one monorepo",
      "one-command docker install that generates its own secrets",
      "private remote access through tailscale or a cloudflare tunnel",
    ],
    githubLink: "https://github.com/MaarcusRenieroL/life-os",
    hostedLink: "",
    startDate: "2026-07-11",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    tracks: ["security", "cloud"],
    skills: ["java", "spring boot", "postgresql", "react", "react native", "tauri", "docker", "nginx"],
    highlight: true,
    status: "active",
    role: "architect and sole developer",
    impact:
      "replaces a stack of separate apps with one system i own, run and back up myself.",
    challenge:
      "many separate services would have been simpler to draw and far harder to run. the goal was clean module boundaries without paying the cost of microservices.",
    approach: [
      "built each domain as its own library jar with its own migrations and schema, then assembled them into a single spring boot app.",
      "used in-process events and caches instead of a message broker.",
      "put nginx in front as the one gateway and wrote an installer so a fresh machine needs one command.",
    ],
    outcome: [
      "eleven modules behind one process and one database.",
      "web, phone and desktop clients over the same api.",
      "ci that tests every module and builds the web and mobile apps.",
    ],
    decisions: [
      "chose a modular monolith over microservices, for operations and for solo maintenance.",
      "gave every module its own schema and migration history so it can be split out later.",
      "kept secrets generated at install time and out of the repository.",
    ],
    lessons: [
      "module boundaries matter more than process boundaries.",
      "a project you use daily finds its own bugs faster than any test plan.",
    ],
    nextSteps: [
      "automate deploys and image publishing.",
      "add more automation rules in the core module.",
      "harden backups and restore drills.",
    ],
    preview: "system",
  },
  {
    id: "scan-forge",
    title: "scanforge",
    description:
      "an interactive terminal tool that scans a project, lets you pick files or whole extensions, and copies their contents to the clipboard, ready to paste into a prompt or a ticket.",
    features: [
      "arrow-key navigation, space to select, live fuzzy search",
      "two modes, by extension or by individual file, switched with tab",
      "respects .gitignore and skips binary files",
      "copies straight to the clipboard on macOS",
      "one-line install script",
    ],
    githubLink: "https://github.com/MaarcusRenieroL/scan-forge",
    hostedLink: "",
    startDate: "2026-04-12",
    endDate: null,
    isOngoing: false,
    category: "cli",
    skills: ["java", "cli"],
    status: "shipped",
    role: "designer and developer",
    impact:
      "turns the slow job of collecting the right files from a repository into a few keystrokes.",
    challenge:
      "a picker has to feel instant on a large repository and never offer files that don't belong, such as build output or binaries.",
    approach: [
      "read the .gitignore first so ignored folders are never walked.",
      "detected binary files up front and left them out of the list.",
      "kept the interface to a handful of keys so it can be used without looking.",
    ],
    outcome: [
      "a single command that goes from a project folder to pasted context.",
      "installs with one curl command.",
    ],
    decisions: [
      "required java 17 and macOS (it uses pbcopy) rather than half-supporting every platform.",
      "built selection by extension as the default, since most requests are 'all the java files'.",
    ],
    lessons: [
      "a small tool that does one job well gets opened more often than a big one.",
    ],
    nextSteps: [
      "support linux and windows clipboards.",
      "add output size estimates before copying.",
    ],
    preview: "terminal",
  },
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
    id: "next-kit",
    title: "next-kit",
    description:
      "an interactive cli that scaffolds production-ready next.js apps in one command — pick your auth, database, orm, api layer, payments, email, and analytics, and it wires them together into a typed, ready-to-run project.",
    features: [
      "install in one command: npx @mxrcxs17/next-kit@latest",
      "one-command interactive scaffolding for full-stack next.js apps",
      "modular stack: next-auth/clerk/kinde, prisma/drizzle, trpc/graphql/hono/rest, stripe and more",
      "generates typed projects with env, providers, and dependencies wired up",
      "ships with a marketing site covering quickstart, integrations, and faq",
    ],
    githubLink: "https://github.com/maarcusrenierol/next-kit",
    hostedLink: "https://next-kit.maarcus.dev",
    startDate: "2024-09-19",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    skills: ["next.js", "typescript", "tailwind css", "shadcn ui"],
    highlight: true,
    status: "active",
    role: "designer, developer, and cli author",
    impact:
      "the one cli that won't let you waste time on setup — auth, db, orm, api, and more, all wired up in seconds. considering your laptop's fast, of course 😉",
    challenge:
      "the cli looked finished but almost nothing it generated actually built; the real work was making every prompt produce a working, type-safe project.",
    approach: [
      "studied how other clis are built, then weighed which packages and modules next-kit actually needed to support.",
      "scaffolded the cli with all the options and prompts first, then built each integration out one by one.",
      "spent most of the work on the templates — fixing them was the real problem, since they're what has to produce a working project.",
    ],
    outcome: [
      "every option combination scaffolds a project that builds and lints cleanly.",
      "published to npm as @mxrcxs17/next-kit — one command to install and scaffold a full stack.",
      "supports a wide menu of stacks — multiple auth, database, orm, api, payments, email, and analytics providers, all wired together.",
    ],
    decisions: [
      "treated the output build as the source of truth — if a scaffolded project didn't build, the cli wasn't done, no matter what its own tests said.",
      "kept generated code type-safe under strict mode instead of hiding behind @ts-nocheck.",
      "scaffolded all the options and prompts first, then built each integration out one by one — structure before details.",
    ],
    lessons: [
      "a generator's tests are worthless if they never compile the output.",
      "compiling is not the same as working.",
    ],
    nextSteps: [
      "add more templates and stack presets.",
      "support more providers across auth, database, and payments.",
      "keep generated templates current with framework updates, backed by a ci matrix that builds every stack combo on each release.",
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
      "building modular backend workflows for boards, tasks, notifications, and collaborative activity tracking.",
    ],
    githubLink: "https://github.com/maarcusrenierol/zentro",
    hostedLink: "",
    startDate: "2024-07-18",
    endDate: null,
    isOngoing: true,
    category: "full stack",
    tracks: ["security"],
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
  "experience",
  "roadmap",
  "blog",
  "about",
  "contact",
  "resume",
];

export const STACK_GROUPS: StackGroup[] = [
  {
    eyebrow: "interfaces",
    title: "frontend",
    items: [
      "next.js",
      "react",
      "angular",
      "typescript",
      "javascript",
      "tailwind css",
      "shadcn ui",
      "radix ui",
      "motion",
      "react hook form",
      "zod",
      "html",
      "css",
    ],
  },
  {
    eyebrow: "services",
    title: "backend",
    items: [
      "java",
      "spring boot",
      "spring batch",
      "spring data jpa",
      "node.js",
      "trpc",
      "rest",
      "server actions",
      "next-auth",
    ],
  },
  {
    eyebrow: "data",
    title: "database & storage",
    items: [
      "postgresql",
      "mysql server",
      "prisma",
      "drizzle orm",
      "spring data jpa",
      "upstash redis",
      "uploadthing",
    ],
  },
  {
    eyebrow: "delivery",
    title: "cloud, devops & tooling",
    items: [
      "aws",
      "docker",
      "vercel",
      "git",
      "github actions",
      "ci / cd",
    ],
  },
  {
    eyebrow: "craft",
    title: "daily workflow",
    items: ["neovim", "vs code", "terminal", "dotfiles", "pnpm", "figma"],
  },
  {
    eyebrow: "networking",
    title: "systems & networking",
    items: ["ccna", "ccnp", "networking", "troubleshooting", "linux"],
  },
  {
    eyebrow: "learning",
    title: "current edges",
    items: [
      "angular",
      "spring batch",
      "multi-tenant systems",
      "product design",
      "distributed systems",
    ],
  },
];
