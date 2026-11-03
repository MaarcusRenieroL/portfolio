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
  linkedin: "https://linkedin.com/in/maarcus-reniero-l",
  location: "Chennai, IN",
  open: "Full-time remote roles in Germany, roles in Bangalore, and freelance work.",
};

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/stack", label: "Stack" },
  { href: "/about", label: "About" },
] as const;

export type Category = "backend" | "frontend" | "ai" | "systems" | "tooling";

export type Project = {
  slug: string;
  num: string;
  name: string;
  kind: string;
  status: string;
  featured: boolean;
  cats: Category[];
  shot: string;
  desc: string;
  long?: string;
  tags: string[];
  external?: string;
  cta: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "zentro",
    num: "01",
    name: "zentro",
    kind: "SaaS",
    status: "Beta",
    featured: true,
    cats: ["frontend", "backend"],
    shot: "[zentro.maarcus.dev screenshot]",
    desc: "One workspace for everything a company runs on. Projects, tasks, docs, teams, roles and an audit log are live, with 11 more modules coming.",
    long: "One workspace for everything a company runs on. Projects, tasks, docs, teams, roles and an audit log are live, with every organization's data kept separate.",
    tags: ["Next.js", "tRPC", "Drizzle", "Better Auth"],
    cta: "Case study →",
  },
  {
    slug: "life-os",
    num: "02",
    name: "life os",
    kind: "self-hosted",
    status: "In daily use",
    featured: true,
    cats: ["backend", "ai"],
    shot: "[life os dashboard]",
    desc: "A self-hosted personal OS with ten modules, from passwords and finances to habits and workouts, in one Spring Boot service.",
    long: "My self-hosted personal OS: passwords, finances, job hunt, notes, calendar, tasks, habits, workouts, email and analytics. Ten modules in one Spring Boot service, after I learned nine microservices was overkill.",
    tags: ["Java 21", "Spring Boot", "PostgreSQL", "Docker"],
    cta: "Case study →",
  },
  {
    slug: "nyx",
    num: "03",
    name: "nyx",
    kind: "macOS · v1.0",
    status: "Open source",
    featured: true,
    cats: ["ai", "systems"],
    shot: "[nyx.maarcus.dev screenshot]",
    desc: "An offline-first launcher to replace Spotlight, Alfred and Raycast, with a local AI through Ollama. About 35 MB idle.",
    long: "An offline-first launcher to replace Spotlight, Alfred and Raycast: apps, files, commands and a local AI from one keystroke. About 35 MB idle, 6.9 MB installed.",
    tags: ["Tauri", "Rust", "Ollama"],
    cta: "Case study →",
  },
  {
    slug: "next-kit",
    num: "04",
    name: "next-kit",
    kind: "CLI · npm",
    status: "Published",
    featured: false,
    cats: ["tooling", "frontend"],
    shot: "$ npm i -g @mxrcxs17/next-kit",
    desc: "Scaffolds a Next.js app with your choice of auth, UI, ORM, database, email, payments, analytics and API layer.",
    tags: ["TypeScript", "tsup", "Turborepo"],
    cta: "Case study →",
  },
  {
    slug: "dotfiles",
    num: "05",
    name: "dotfiles",
    kind: "config",
    status: "Public",
    featured: false,
    cats: ["tooling"],
    shot: "$ ./install.sh && make doctor",
    desc: "My macOS setup in one command: zsh, Neovim, tmux, Ghostty and a yabai tiling desktop, linked with GNU stow.",
    tags: ["Shell", "Neovim", "tmux", "yabai"],
    external: "https://github.com/MaarcusRenieroL/dotfiles",
    cta: "GitHub ↗",
  },
  {
    slug: "portfolio",
    num: "06",
    name: "portfolio",
    kind: "web",
    status: "This site",
    featured: false,
    cats: ["frontend"],
    shot: "[this site]",
    desc: "This site: its own design system, plus a terminal and a command palette for keyboard users.",
    tags: ["Next.js 16", "React 19", "Tailwind 4"],
    external: "https://github.com/MaarcusRenieroL/portfolio",
    cta: "Source ↗",
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

export type Chapter = { id: string; kanji: string; label: string };

export const CHAPTERS: Chapter[] = [
  { id: "challenge", kanji: "一", label: "Challenge" },
  { id: "approach", kanji: "二", label: "Approach" },
  { id: "decisions", kanji: "三", label: "Key decisions" },
  { id: "outcome", kanji: "四", label: "Outcome" },
  { id: "lessons", kanji: "五", label: "Lessons" },
  { id: "next", kanji: "六", label: "Next steps" },
  { id: "tech", kanji: "七", label: "Tech" },
];

export type CaseStudy = {
  slug: string;
  title: string;
  lead: string;
  site?: { label: string; href: string };
  repo: { label: string; href?: string };
  meta: { label: string; value: string; learning?: boolean }[];
  hero: string;
  challenge: { title: string; body: string };
  approach: { title: string; body: string; code?: { file: string; lines: string[]; hl?: number } };
  decisions: { title: string; body: string }[];
  outcome: { title: string; stats?: { value: string; unit?: string; label: string }[]; note: string };
  lessons: { hardest: string; quote?: string; body: string };
  next: string;
  tech: string[];
};

const TBD = (what: string) => `[${what}]`;

export const CASE_STUDIES: Record<string, CaseStudy> = {
  nyx: {
    slug: "nyx",
    title: "nyx",
    lead: "One key to find, run and ask, all on your machine. An open-source launcher built to replace Spotlight, Alfred and Raycast. It works offline and asks before it goes online.",
    site: { label: "nyx.maarcus.dev", href: "https://nyx.maarcus.dev" },
    repo: { label: "Source [repo link]", href: "https://github.com/MaarcusRenieroL/nyx" },
    meta: [
      { label: "Role", value: "Solo: design, build, ship" },
      { label: "Platform", value: "macOS 12+ · Windows and Linux in beta" },
      { label: "Stack", value: "Tauri · Rust · Ollama" },
      { label: "Status", value: "v1.0 · beta testing · free", learning: true },
    ],
    hero: "[Screenshot or 8s muted loop: the launcher open over the desktop]",
    challenge: {
      title: "Three launchers, none of them mine",
      body: "Spotlight is limited, Alfred and Raycast lock the good parts behind paid tiers, and their AI features send your queries to someone else's server. I wanted one fast, free, open-source launcher that does it all, and keeps working with the Wi-Fi off.",
    },
    approach: {
      title: "A Rust core, a thin UI, a local model",
      body: "nyx is a Tauri app. The Rust core handles search ranking, the file index and the add-on sandbox; a small web layer draws the UI. Apps, files, commands, inline maths and conversions, clipboard history with secret masking, snippets, notes and QR scanning all sit behind one keystroke. The assistant runs on `Ollama` by default. It answers from your indexed files and names the files it used. Claude or OpenAI work too, with your own key.",
      code: {
        file: "src-tauri/src/assistant.rs · illustrative",
        hl: 3,
        lines: [
          "#[tauri::command]",
          "async fn ask(prompt: String, provider: Provider) -> Result<Answer, Error> {",
          "    // local by default; remote providers need explicit consent",
          "    match provider {",
          "        Provider::Ollama => ollama::generate(&prompt).await,",
          "        remote => consent::require(remote)?.generate(&prompt).await,",
          "    }",
          "}",
        ],
      },
    },
    decisions: [
      { title: "Tauri over Electron", body: "A native webview and a Rust core keep it at 6.9 MB installed and about 35 MB idle, light enough to stay running all day." },
      { title: "Local model by default", body: "Ollama needs no account and works offline. Cloud providers are opt-in, with your own key." },
      { title: "Asks before going online", body: "No telemetry, no accounts. A network audit in Settings counts every outbound request." },
      { title: "Sandboxed add-ons", body: "42 add-ons, each installed separately and run with a time limit, so one bad add-on can't freeze the launcher." },
    ],
    outcome: {
      title: "Fast where it counts",
      stats: [
        { value: "0.4", unit: " ms", label: "ranking per keystroke, 2,000 items" },
        { value: "~35", unit: " MB", label: "memory while idle" },
        { value: "6.9", unit: " MB", label: "installed size" },
        { value: "0", label: "network connections while idle" },
        { value: "0.52", unit: " s", label: "to stop a runaway add-on" },
      ],
      note: "Measured October 2026 on an Apple M1 Pro MacBook. Method on nyx.maarcus.dev.",
    },
    lessons: {
      hardest: TBD("From the Claude Code prompt: the problem, why it was hard, and how you solved it."),
      quote: "Privacy is an architecture decision. If the network is always reachable, sooner or later something will use it.",
      body: TBD("Two or three lessons in your own words."),
    },
    next: TBD("From the Claude Code prompt, e.g. notarized builds, stable Windows and Linux releases."),
    tech: ["Rust", "Tauri", "Ollama", "TypeScript", "macOS", "Windows / Linux beta"],
  },
  zentro: {
    slug: "zentro",
    title: "zentro",
    lead: "One workspace for everything a company runs on. Projects, tasks, docs, teams, roles and an audit log are live, with every organization's data kept separate.",
    site: { label: "zentro.maarcus.dev", href: "https://zentro.maarcus.dev" },
    repo: { label: "Source [repo link]", href: "https://github.com/maarcusrenierol/zentro" },
    meta: [
      { label: "Role", value: "Solo: design, build, ship" },
      { label: "Platform", value: "Web · multi-tenant SaaS" },
      { label: "Stack", value: "Next.js · tRPC · Drizzle · Better Auth" },
      { label: "Status", value: "Beta", learning: true },
    ],
    hero: "[zentro.maarcus.dev screenshot: projects list]",
    challenge: { title: TBD("Challenge headline"), body: TBD("zentro challenge: what problem it solves and for whom.") },
    approach: { title: TBD("Approach headline"), body: TBD("Multi-tenancy: how organization data is isolated (from the Claude Code prompt), and how roles and permissions work across modules.") },
    decisions: [
      { title: TBD("Decision 1"), body: TBD("Detail") },
      { title: TBD("Decision 2"), body: TBD("Detail") },
      { title: TBD("Decision 3"), body: TBD("Detail") },
      { title: TBD("Decision 4"), body: TBD("Detail") },
    ],
    outcome: { title: TBD("Outcome headline"), note: TBD("Live vs stubbed modules, per the code.") },
    lessons: { hardest: TBD("The hardest problem: problem, why it was hard, what worked."), body: TBD("One lesson, in your own words.") },
    next: TBD("Next three milestones from issues, TODOs and docs."),
    tech: ["Next.js", "tRPC", "Drizzle", "Better Auth", "PostgreSQL", "TypeScript"],
  },
  "life-os": {
    slug: "life-os",
    title: "life os",
    lead: "My self-hosted personal OS: passwords, finances, job hunt, notes, calendar, tasks, habits, workouts, email and analytics. Ten modules in one Spring Boot service, after I learned nine microservices was overkill.",
    repo: { label: "Source [repo link]", href: "https://github.com/MaarcusRenieroL/life-os" },
    meta: [
      { label: "Role", value: "Solo: design, build, run" },
      { label: "Platform", value: "Self-hosted · Docker" },
      { label: "Stack", value: "Java 21 · Spring Boot · PostgreSQL" },
      { label: "Status", value: "In daily use", learning: true },
    ],
    hero: "[life os dashboard, with fake demo data only]",
    challenge: { title: TBD("Challenge headline"), body: TBD("Why a personal OS, and why nine microservices was the wrong shape.") },
    approach: { title: TBD("Approach headline"), body: TBD("Current architecture: how modules are separated inside the monolith.") },
    decisions: [
      { title: "Simplify when it's overkill", body: "Nine Spring Boot microservices on Kafka became one modular service. Fewer moving parts won." },
      { title: TBD("Decision 2"), body: TBD("Detail") },
      { title: TBD("Decision 3"), body: TBD("Detail") },
      { title: TBD("Decision 4"), body: TBD("Detail") },
    ],
    outcome: { title: TBD("Outcome headline"), note: TBD("Migration numbers: services, containers, memory, startup time.") },
    lessons: { hardest: TBD("The hardest problem during or after the migration."), body: TBD("Two lessons, one sentence each.") },
    next: TBD("Next steps from TODOs and issues."),
    tech: ["Java 21", "Spring Boot", "PostgreSQL", "Docker", "nginx"],
  },
  "next-kit": {
    slug: "next-kit",
    title: "next-kit",
    lead: "Scaffolds a Next.js app with your choice of auth, UI, ORM, database, email, payments, analytics and API layer.",
    repo: { label: "Source [repo link]", href: "https://github.com/maarcusrenierol/next-kit" },
    meta: [
      { label: "Role", value: "Solo: design, build, publish" },
      { label: "Platform", value: "CLI · npm" },
      { label: "Stack", value: "TypeScript · tsup · Turborepo" },
      { label: "Status", value: "Published", learning: true },
    ],
    hero: "$ npm i -g @mxrcxs17/next-kit",
    challenge: { title: TBD("Challenge headline"), body: TBD("Why another scaffolder.") },
    approach: { title: TBD("Approach headline"), body: TBD("How the generators and templates compose.") },
    decisions: [
      { title: TBD("Decision 1"), body: TBD("Detail") },
      { title: TBD("Decision 2"), body: TBD("Detail") },
      { title: TBD("Decision 3"), body: TBD("Detail") },
      { title: TBD("Decision 4"), body: TBD("Detail") },
    ],
    outcome: { title: TBD("Outcome headline"), note: TBD("Which module options are fully working vs partial; CI on generated output.") },
    lessons: { hardest: TBD("The hardest problem."), body: TBD("Lessons, in your own words.") },
    next: TBD("Next steps."),
    tech: ["TypeScript", "tsup", "Turborepo", "npm"],
  },
};

export type Role = {
  date: string;
  place?: string;
  org: string;
  title: string;
  now?: boolean;
  summary: string;
  points: string[];
  tags: string[];
};

export const ROLES: Role[] = [
  {
    date: "Jan 2025 — now",
    place: "Chennai",
    org: "HealthEdge",
    title: "Developer I, Software Engineering",
    now: true,
    summary: "Spring Boot and Spring Batch microservices for healthcare transaction ETL. Two-time Shining Star Award.",
    points: [
      "Build Spring Boot and Spring Batch microservices that run ETL over healthcare transactions.",
      "One of the team's few core developers. I work across every module and fix production bugs fast.",
      "Deliver client requirements on time, with unit and integration tests in all four modules (JUnit, Mockito, MockMvc, Testcontainers).",
      "[Measurable result, e.g. volume processed, runtime cut, coverage gained]",
      "Shining Star Award, twice, for on-time delivery, meeting client expectations and reliability.",
    ],
    tags: ["Java", "Spring Boot", "Spring Batch", "PostgreSQL", "AWS S3 · CloudWatch", "Testcontainers"],
  },
  {
    date: "Jan — Feb 2024",
    org: "Matlync",
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
    title: "Intern, Hardware and Networking",
    summary: "Hardware and networking, trained on the CCNA and CCNP curriculum.",
    points: [
      "Hands-on work with computer hardware and network setup.",
      "Trained on the CCNA and CCNP curriculum: routing, switching and subnetting.",
    ],
    tags: ["Networking", "Routing and switching", "Hardware"],
  },
];

export const BEYOND = [
  {
    label: "2022 — 2023 · Designers Consortium",
    title: "Project Director, Web Technologies",
    body: "Ran FrameX, a UI development competition with 800+ participants, and led the full technical symposium (1,000+ registrations) end to end, including the event website and logistics.",
  },
  { label: "Hackathon · 3rd place", title: "HealthX", body: "Designers Consortium hackathon, Rajalakshmi Engineering College." },
  { label: "Smart India Hackathon 2023", title: "AyurSeva", body: "Built with a team for India's national hackathon." },
];

export const BRIEF = [
  { label: "Now", title: "Developer I, Software Engineering · HealthEdge", body: "Since Jan 2025 · Spring Boot / Batch microservices for healthcare transaction ETL" },
  { label: "Open to", title: "Full-time remote (Germany), Bangalore, freelance", body: "Backend or full stack", blade: true },
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
  { id: "msc", label: "Master's admissions", placeholder: "Programme and what you need from me." },
  { id: "hi", label: "Just saying hi", placeholder: "What's on your mind?" },
];

export const UPDATED = "[Nov 2026]";
