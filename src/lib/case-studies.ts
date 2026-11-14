/**
 * Case studies, one per project. Every claim here was checked against the
 * repo it describes; anything in [brackets] is still waiting on real content.
 * Screenshots live in /public/projects/<slug>/ (WebP, desktop plus mobile).
 */

import { type CaseStudy, caseStudySchema, check } from "./schema";

export type { CaseStudy, Shot } from "./schema";

const TBD = (what: string) => `[${what}]`;

/** Plain <img> tags don't get Next's basePath, so prefix it here (empty in production). */
export const shotUrl = (slug: string, file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/projects/${slug}/${file}`;

const CASE_STUDY_DATA: Record<string, unknown> = {
  nyx: {
    slug: "nyx",
    title: "nyx",
    lead: "One key to find, run and ask, all on your machine. An open-source launcher to replace Spotlight, Alfred and Raycast. It works offline and asks before it goes online.",
    site: { label: "nyx.maarcus.dev", href: "https://nyx.maarcus.dev" },
    repo: { label: "Source", href: "https://github.com/MaarcusRenieroL/nyx" },
    meta: [
      { label: "Role", value: "Solo: design, build, ship" },
      { label: "Platform", value: "macOS · Windows and Linux in beta" },
      { label: "Stack", value: "Tauri 2 · Rust · React 19 · Ollama" },
      { label: "Status", value: "v1.0 · October 2026", learning: true },
    ],
    hero: "[nyx launcher]",
    cover: "03-launcher-search.webp",
    shots: [
      { file: "03-launcher-search.webp", alt: "nyx launcher showing search results", caption: "Apps, files and commands ranked together." },
      { file: "04-inline-answer.webp", alt: "nyx answering a calculation inline", caption: "Inline maths and conversions." },
      { file: "05-ai-panel.webp", alt: "nyx AI panel answering from indexed files", caption: "The assistant names the files it used." },
      { file: "02-performance.webp", alt: "nyx performance figures", caption: "Ranking cost per keystroke." },
      { file: "01-landing.webp", mobile: "01-landing-mobile.webp", alt: "nyx marketing site", caption: "The marketing site." },
    ],
    challenge: {
      title: "Three launchers, none of them mine",
      body: "Spotlight is limited, Alfred and Raycast lock the good parts behind paid tiers, and their AI sends your queries to someone else's server. I wanted one fast, free launcher that keeps working with the Wi-Fi off.",
    },
    approach: {
      title: "A Rust core, a thin UI, a local model",
      body: "A Tauri 2 app: the Rust core owns the file index, the add-on sandbox and the AI layer, and a React UI draws the window. Ranking runs on every keystroke. The assistant uses `Ollama` over loopback and answers from your indexed files; Claude and OpenAI are optional with your own key.",
      code: {
        file: "apps/desktop/src-tauri/src/net.rs",
        hl: 3,
        lines: [
          "pub fn loopback_connect(addr: &str, timeout: Duration) -> Result<TcpStream, String> {",
          '    let sa: SocketAddr = addr.to_socket_addrs().map_err(|e| e.to_string())?.next().ok_or("no address")?;',
          "    let ip: IpAddr = sa.ip();",
          "    if !ip.is_loopback() {",
          "        BLOCKED_ATTEMPTS.fetch_add(1, Ordering::SeqCst);",
          '        return Err(format!("blocked: {ip} is not a loopback address"));',
          "    }",
          "    TcpStream::connect_timeout(&sa, timeout).map_err(|e| e.to_string())",
          "}",
        ],
      },
    },
    decisions: [
      { title: "Add-ons in a sandbox", body: "Plain .js in QuickJS with a 500 ms CPU budget, 32 MB of memory and declared permissions, so one bad add-on can't freeze the launcher." },
      { title: "Privacy enforced in code", body: "The only socket helper rejects non-loopback addresses, and a build step audits the dependency graph for HTTP and TLS crates." },
      { title: "Cloud AI is opt-in", body: "Off by default, with your own key kept in the keychain and secrets masked before text leaves the machine." },
    ],
    outcome: {
      title: "Fast where it counts",
      stats: [
        { value: "0.4", unit: " ms", label: "ranking per keystroke, 2,000 items" },
        { value: "~35", unit: " MB", label: "memory while idle" },
        { value: "6.9", unit: " MB", label: "installed size" },
        { value: "0", label: "network connections while idle" },
      ],
      note: "Benchmark in scripts/bench-rank.ts. Memory and size from the project site, on an Apple M1 Pro.",
    },
    lessons: {
      hardest:
        "Keeping search fast and the app alive on bad input. Opening the launcher took about 260 ms because regexes were recompiled on every scan, and one-letter Spotlight queries hung for about 18 seconds. I skipped Spotlight under three characters, cancelled superseded searches, and compiled the regexes once. A PDF parser that crashed on a real resume now runs in an isolated child that exits quietly.",
      quote: "Privacy is an architecture decision. If the network is always reachable, sooner or later something will use it.",
      body: "Enforce privacy in code, isolate untrusted parsers, and measure before and after.",
    },
    next: "Test the Windows and Linux builds, set up CI on all three systems, then notarization and a DMG ahead of the 1.0 installers.",
    tech: ["Rust", "Tauri 2", "React 19", "TypeScript", "SQLite FTS5", "QuickJS", "Ollama"],
  },

  "life-os": {
    slug: "life-os",
    title: "life os",
    lead: "My self-hosted personal OS: passwords, finances, job hunt, notes, tasks, habits, workouts and more. Twelve modules in one Spring Boot service, after eleven microservices turned out to be overkill.",
    repo: { label: "Source", href: "https://github.com/MaarcusRenieroL/life-os" },
    meta: [
      { label: "Role", value: "Solo: design, build, run" },
      { label: "Platform", value: "Self-hosted · web, mobile, extension" },
      { label: "Stack", value: "Java 21 · Spring Boot 4 · PostgreSQL" },
      { label: "Status", value: "In daily use", learning: true },
    ],
    hero: "[life os dashboard]",
    cover: "01-dashboard.webp",
    shots: [
      { file: "01-dashboard.webp", mobile: "01-dashboard-mobile.webp", alt: "life os dashboard", caption: "Today across every module (demo data)." },
      { file: "02-finance.webp", mobile: "02-finance-mobile.webp", alt: "life os finance tracker", caption: "Finance." },
      { file: "03-job-tracker.webp", mobile: "03-job-tracker-mobile.webp", alt: "life os job tracker", caption: "Job tracker." },
      { file: "04-habits.webp", mobile: "04-habits-mobile.webp", alt: "life os habit tracker", caption: "Habits." },
    ],
    challenge: {
      title: "One person, eleven services",
      body: "I wanted one place for the parts of my life that live in a dozen apps, on my own machine. Eleven services on Kafka, ZooKeeper and Redis used about 4.9 GB at idle, enough to get the local Ollama model OOM-killed.",
    },
    approach: {
      title: "One service, twelve modules",
      body: "One Maven project and one Spring Boot app, with a feature package per module and about 54.7k lines of Java. Each module keeps its own Postgres schema and Flyway history, and web, mobile and a browser extension sit on top.",
    },
    decisions: [
      { title: "Boundaries kept on purpose", body: "Schema per module, and modules still call each other over internal HTTP endpoints so the seams stay visible." },
      { title: "In-process events instead of Kafka", body: "Events are handled after commit, and state that must survive a restart moved into Postgres." },
      { title: "AI behind one assistant", body: "Gemini or a local Ollama model per task, for resume and job parsing, email classification and quick capture." },
    ],
    outcome: {
      title: "Less to run",
      stats: [
        { value: "17 → 2", label: "compose services" },
        { value: "400 → 90", unit: " lines", label: "compose file" },
        { value: "4.9 GB → 400", unit: " MB", label: "idle memory, my figure" },
        { value: "681", label: "tests passing" },
      ],
      note: "Memory is the figure from the migration commit, not a benchmark. Deploys are manual.",
    },
    lessons: {
      hardest:
        "Booting the merged app on a database twelve services had already migrated. Every module has its own V1 and Flyway checksums whole files, so one edited migration broke startup. Now one Flyway runs per schema, and a test pins a checksum for every migration.",
      body: "Replacing Kafka means deciding what survives a restart, and merging deploy units doesn't merge boundaries.",
    },
    next: "Vault autofill, TOTP and passkeys, native Android widgets, end-to-end tests in CI and a cross-module weekly review.",
    tech: ["Java 21", "Spring Boot 4", "PostgreSQL", "Flyway", "React", "React Native", "Docker", "Ollama"],
  },

  "next-kit": {
    slug: "next-kit",
    title: "next-kit",
    lead: "Scaffolds a Next.js app with your choice of auth, UI, ORM, database, email, payments, analytics and API layer.",
    repo: { label: "Source", href: "https://github.com/maarcusrenierol/next-kit" },
    meta: [
      { label: "Role", value: "Solo: design, build, publish" },
      { label: "Platform", value: "CLI · npm" },
      { label: "Stack", value: "TypeScript · tsup · Turborepo" },
      { label: "Status", value: "Published", learning: true },
    ],
    hero: "$ npm i -g @mxrcxs17/next-kit",
    cover: "01-cli-summary.webp",
    shots: [
      { file: "00-prompts.webp", alt: "next-kit interactive prompts", caption: "Pick auth, UI, ORM, database, email, payments, analytics and API layer." },
      { file: "01-cli-summary.webp", alt: "next-kit generation summary", caption: "A summary of what was generated." },
    ],
    video: { file: "02-cli-demo.mp4", caption: "A full run of the CLI." },
    challenge: { title: "The same setup, every project", body: "Every new Next.js app started with the same hours of work: auth, an ORM, a database, env files, email, payments, analytics. I wanted to answer a few questions once and get a project where those were already wired." },
    approach: {
      title: "One installer per option",
      body: "A commander-based CLI asks the questions, builds a base project, then runs one small installer per choice (`installers/auth/clerk.ts`, `installers/orm/drizzle.ts`, and so on). Over twenty of them cover auth, ORM, email, payments, API layer, analytics and UI. Dependencies are installed with whichever package manager the user already runs.",
    },
    decisions: [
      { title: "Every option is a promise", body: "I first listed every option so I would not forget to build it, and the CLI accepted choices whose installers were not ready. Generated projects looked complete and were not. Now an option only appears when it generates files, installs dependencies and configures the project." },
      { title: "A choice only controls its own branch", body: "Picking no database must skip database setup and nothing else. One wrong condition there used to skip the whole project." },
      { title: "Test the output, not the CLI", body: "The CLI can run perfectly and still produce a broken app. The check that matters is generating projects and building them." },
    ],
    outcome: { title: "Published on npm", note: "Version 1.0.2 of @mxrcxs17/next-kit is on npm and runs on Node 18.17 or newer." },
    lessons: { hardest: "Making the generated code correct for every combination of options, not just the default one.", body: "A scaffolder is a promise to someone who has not read your code. Fewer options that work beat more options that mostly do." },
    next: "Generate-and-build checks for each option combination, run in CI.",
    tech: ["TypeScript", "tsup", "Turborepo", "npm"],
  },
  "snap-pass": {
    slug: "snap-pass",
    title: "snap pass",
    lead: "A selfie in, a measured 35 × 45 mm Indian passport photo out, with a report that checks it before you print.",
    repo: { label: "Private repo" },
    meta: [
      { label: "Role", value: "Solo: design, build" },
      { label: "Platform", value: "Web · runs locally" },
      { label: "Stack", value: "FastAPI · OpenCV · MediaPipe · rembg · Next.js 16" },
      { label: "Status", value: "Working, no hosting yet", learning: true },
    ],
    hero: "[snap pass studio]",
    shots: [],
    challenge: { title: "Passport photos are a measurement problem", body: "Most people get a passport photo wrong by a few millimetres: head too small, off-centre, tilted, shadowed. Studios fix it by eye. I wanted software to measure it and say what is wrong in plain words." },
    approach: {
      title: "A pipeline that measures the cut-out",
      body: "The upload is validated, lit gently, then MediaPipe finds the face and rembg cuts out the person. The head is levelled, measured from the cut-out (hair or turban included) and scaled so chin to crown is 73% of the height. The background goes pure white, the JPEG is searched into the 20–48 kb window at 300 dpi, and 4 × 6 in and A4 sheets are built.",
    },
    decisions: [
      { title: "Jobs, not requests", body: "`POST /api/v1/photos` returns an id at once and `GET /api/v1/photos/{id}` reports the live stage, so the UI shows real progress and can cancel." },
      { title: "Private by construction", body: "Results live in memory under 144-bit random ids, expire after 15 minutes and can be deleted on demand. Nothing is written to disk and no personal data is logged. The API binds to loopback and the browser reaches it only through an allow-listed Next.js relay." },
      { title: "Honest about the AI jacket", body: "Outfits are painted by a local diffusion model, and if it fails or returns a blank image the app falls back to a flat template jacket and says so. Face, hair and neck are never repainted." },
    ],
    outcome: { title: "A dozen checks, each with a fix", note: "About a dozen measured checks (head size, centring, tilt, facing, eyes, mouth, focus, resolution, lighting, glasses, file size) each come with a plain-words fix. The site does not promise acceptance: published requirements vary, so it tells people to confirm with the passport office." },
    lessons: { hardest: "Measuring the head consistently when hair, turbans and glasses change the outline.", body: "Being upfront about limits (flat template jackets, a heuristic glasses check) made the tool more trustworthy than hiding them." },
    next: "Hosting and payments, both left out on purpose for now.",
    tech: ["Python", "FastAPI", "OpenCV", "MediaPipe", "rembg", "Diffusers", "Next.js 16"],
  },

  dotfiles: {
    slug: "dotfiles",
    title: "dotfiles",
    lead: "My macOS setup in one command: shell, editor, terminal and a tiling desktop, in one consistent theme.",
    repo: { label: "Source", href: "https://github.com/MaarcusRenieroL/dotfiles" },
    meta: [
      { label: "Role", value: "Solo" },
      { label: "Platform", value: "macOS 13+" },
      { label: "Stack", value: "zsh · Neovim · tmux · Ghostty · yabai · GNU stow" },
      { label: "Status", value: "Public, in daily use", learning: true },
    ],
    hero: "$ ./install.sh --dry-run",
    cover: "01-tmux-neovim.webp",
    shots: [
      { file: "01-tmux-neovim.webp", alt: "Neovim inside tmux", caption: "Neovim in tmux." },
      { file: "02-ghostty-live.webp", alt: "Ghostty terminal", caption: "Ghostty with the shared theme." },
    ],
    challenge: { title: "A setup that survives a new laptop", body: "A config that only works on the machine it grew on is not a config. I wanted a fresh Mac to match mine in minutes, and for someone else to be able to try it without risk." },
    approach: {
      title: "An installer built to be tried safely",
      body: "`./install.sh --dry-run` prints every action and changes nothing. Installs are per tool (`--only tmux`, `--skip wm`, `--minimal`), anything it would replace is backed up to `~/.dotfiles-backup/`, and `./uninstall.sh` restores the originals. It is idempotent and ends by running `make doctor`.",
    },
    decisions: [
      { title: "Three linking rules", body: "GNU stow for files that only read from `$HOME`, `XDG_CONFIG_HOME` for tools that honour it, and plain symlinks for GUI and launchd services, which cannot see shell variables." },
      { title: "Secrets stay local", body: "API keys and git identity live in gitignored local files created from templates." },
      { title: "One theme everywhere", body: "A single navy-and-emerald palette, the same as this site, runs through the shell, Neovim, tmux, Ghostty and the status bar." },
    ],
    outcome: { title: "Reproducible, reversible", note: "`make doctor` verifies links, tools, fonts and services. Packages are split into an essentials Brewfile and an optional extras one." },
    lessons: { hardest: "Making the window manager part safe, since it needs system permissions.", body: "A dry run and an uninstall made me comfortable running the installer on my own machine, and they would for anyone else." },
    next: "Linux support, which the installer currently refuses with a message.",
    tech: ["Shell", "Lua", "Neovim", "tmux", "Ghostty", "yabai", "GNU stow", "Homebrew"],
  },
};

export const CASE_STUDIES: Record<string, CaseStudy> = Object.fromEntries(
  Object.entries(CASE_STUDY_DATA).map(([key, value]) => [key, check("case study", key, caseStudySchema, value)]),
);

/** Card and hero image per project: each case study's `cover` file. Computed once at import. */
export const COVERS: Record<string, string> = Object.fromEntries(
  Object.values(CASE_STUDIES)
    .filter((c) => c.cover)
    .map((c) => [c.slug, shotUrl(c.slug, c.cover!)]),
);
