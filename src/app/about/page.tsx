import {
  ArrowUpRightIcon,
  MapPinnedIcon,
  SparklesIcon,
  CameraIcon,
  MusicIcon,
  Tv2Icon,
  ChefHatIcon,
  MilestoneIcon,
  BriefcaseIcon,
  BikeIcon,
} from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { Reveal } from "~/components/misc/reveal";
import { IdentityPanel } from "~/components/misc/identity-panel";
import { MagneticCTA } from "~/components/misc/magnetic-cta";

const principles = [
  {
    num: "01",
    title: "Master the Entire Vertical",
    tag: "HOLISTIC RANGE",
    desc: "Understand the system tradeoffs deeply, not just the ticket requirements. From database indexes, transaction isolation levels, and batch concurrency to framer motion springs, CSS repaints, and edge caching.",
  },
  {
    num: "02",
    title: "Quiet, Tactile, and Durable",
    tag: "ZERO SLOP",
    desc: "Keep user interfaces quiet, responsive, and respectful of intent. Software should feel fast, snappy, and predictable after months of heavy daily production use, devoid of gratuitous decorative fluff.",
  },
  {
    num: "03",
    title: "Side Projects as Living Proof",
    tag: "PROTOTYPE DISCIPLINE",
    desc: "Treat personal builds not as toy demos, but as rigorous testbeds to trial architecture, benchmark developer experience, and test multi-tenant models before deploying to enterprise scale.",
  },
  {
    num: "04",
    title: "Relentless Craft & Curiosity",
    tag: "LIFELONG MOMENTUM",
    desc: "Stay insatiably curious across distributed systems, compiler internals, typography, cinematography, acoustic fingerstyle music, and two-wheeled exploration across Tamil Nadu's backroads.",
  },
];

const milestones = [
  {
    year: "2020",
    badge: "FOUNDATIONS",
    title: "100 Days of Code in Python",
    detail:
      "Initiated deliberate daily practice in computer science fundamentals: algorithms, data structures, automation scripting, and API consumption.",
    deliverables: ["CLI utilities", "Scraping engines", "Automation bots"],
  },
  {
    year: "2021",
    badge: "WEB & DOM",
    title: "100 Days of Modern Web Development",
    detail:
      "Deep immersion into semantic HTML, CSS layout paradigms (Flexbox/Grid), modern ES6+ JavaScript, and component-driven architecture.",
    deliverables: ["Responsive web applications", "DOM micro-interactions", "REST integrations"],
  },
  {
    year: "2023",
    badge: "NETWORKING",
    title: "Cisco CCNA / CCNP & Systems Lab",
    detail:
      "Completed rigorous network engineering training at Systech. Configured enterprise switches, routers, VLANs, subnetting topologies, and diagnosed packet anomalies in Linux environments.",
    deliverables: ["Subnet topology design", "OSPF / BGP routing lab", "Wireshark packet analysis"],
  },
  {
    year: "2023",
    badge: "STARTUP",
    title: "Product Engineering @ Steam Troops",
    detail:
      "Spearheaded fast-turnaround web platforms and headless content systems utilizing Next.js, Strapi CMS, Prisma ORM, and PostgreSQL.",
    deliverables: ["Headless CMS architectures", "Dynamic landing pages", "Client dashboard tooling"],
  },
  {
    year: "2024",
    badge: "INDEPENDENT",
    title: "Full-Stack Architecture & Open Source",
    detail:
      "Designed and published production systems including Zentro (multi-tenant collaboration platform with tRPC) and Trackwise (privacy-conscious personal finance tracker).",
    deliverables: ["Zentro multi-tenancy", "Trackwise finance engine", "Custom dotfiles / Neovim DX"],
  },
  {
    year: "2026",
    badge: "SYSTEMS",
    title: "Nyx, Life OS & ScanForge",
    detail:
      "Built a local-first desktop launcher with a Rust core and a local AI assistant, a self-hosted personal operating system on a modular Spring Boot backend, and a terminal file picker.",
    deliverables: ["Nyx (Tauri 2 + Rust)", "Life OS (11 modules, 3 clients)", "ScanForge CLI"],
  },
  {
    year: "2025 – PRESENT",
    badge: "ENTERPRISE",
    title: "Developer 1 — Software Engineering @ UST Healthproof",
    detail:
      "Designing and developing mission-critical internal healthtech systems. Engineering robust batch data transformations with Spring Batch, enterprise microservices with Java 21 / Spring Boot, and responsive UI with Angular.",
    deliverables: [
      "High-throughput Spring Batch pipelines",
      "ACID relational schemas on MySQL Server",
      "Enterprise frontend components in Angular",
    ],
  },
];

const interests = [
  {
    name: "Motorcycle Touring",
    subtitle: "Two Wheels, Open Road",
    desc: "Chasing sunrises on ECR, carved mountain twisties in Kolli Hills and Yelagiri — the road is where I reset.",
    icon: BikeIcon,
  },
  {
    name: "Photography",
    subtitle: "Capturing Moments",
    desc: "Taking photos on rides, street scenes, light and mood — finding frames worth keeping.",
    icon: CameraIcon,
  },
  {
    name: "Music",
    subtitle: "Guitar & Keyboard",
    desc: "Learning acoustic chord melodies on guitar, exploring keyboard — sound as a way to slow down and feel something.",
    icon: MusicIcon,
  },
  {
    name: "Formula 1",
    subtitle: "Speed & Strategy",
    desc: "Following the season, the strategy battles, and the technical side of what makes these machines so absurdly fast.",
    icon: Tv2Icon,
  },
  {
    name: "Cooking",
    subtitle: "Kitchen Experiments",
    desc: "Trying new recipes, finding the right balance of ingredients — the same satisfaction as debugging a tricky system.",
    icon: ChefHatIcon,
  },
];

export default function AboutPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="05"
        title="about"
        eyebrow="person behind the repos"
        description="a full-stack developer from chennai who builds across the stack and is growing toward understanding, building, and running serious software end to end."
      />

      <Reveal>
        <IdentityPanel />
      </Reveal>

      {/* Narrative Section */}
      <Reveal>
        <article className="border border-border/60 bg-card/35 p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between font-mono text-xs text-primary">
            <div className="flex items-center gap-2">
              <MapPinnedIcon className="size-4" />
              <span>CHENNAI, INDIA // 13.0827° N, 80.2707° E</span>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
            <p>
              I am <strong className="text-primary font-semibold">Maarcus Reniero L</strong>, a 22-year-old
              software engineer currently working as{" "}
              <span className="underline decoration-primary/40 underline-offset-4 font-semibold text-foreground">
                Developer 1 — Software Engineering
              </span>{" "}
              at UST Healthproof.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              My foundational ambition is to establish and scale an engineering and technology product firm
              from the ground up. To make that ambition real, I deliberately cultivate cross-disciplinary
              range: from the physical and networking fundamentals (CCNA/CCNP, Linux system administration)
              to heavy enterprise batch pipelines (Spring Batch, Java 21, MySQL Server), modern type-safe
              web products (Next.js, TypeScript, Tailwind CSS, tRPC, Drizzle ORM), and custom developer
              workflows (Neovim, tmux, Ghostty).
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              When I build, I prefer systems that feel quiet, fast, and durable. I treat side projects as
              rigorous, living proof of architectural thinking — testing tenant isolation, caching
              topologies, and keyboard-centric design patterns before deploying them into large-scale
              production environments.
            </p>
          </div>

          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Next, I&apos;m preparing for a masters in AI, cloud, and cybersecurity. Nyx (local AI and privacy),
            Life OS (self-hosted infrastructure and secrets) and my network training are the starting evidence;
            the <a href="/roadmap" className="text-primary underline underline-offset-4">roadmap</a> shows what is
            done and what is still ahead.
          </p>

          {/* Current Station Highlight Box */}
          <div className="mt-6 border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 font-mono text-xs text-primary font-bold">
              <BriefcaseIcon className="size-4" />
              <span>CURRENT: UST HEALTHPROOF</span>
            </div>
            <p className="mt-2 text-sm sm:text-base text-foreground/90 leading-relaxed">
              At UST Healthproof, I work across healthcare IT systems designing robust batch processing
              pipelines with Spring Batch, optimizing relational transactions on MySQL, building modular
              frontend solutions in Angular, and collaborating across cross-functional teams to deliver
              high-reliability enterprise healthcare software.
            </p>
          </div>
        </article>
      </Reveal>

      {/* Engineering Principles */}
      <Reveal>
        <div className="py-2">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <h2 className="text-2xl font-bold sm:text-3xl tracking-tight">
                Engineering Principles
              </h2>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground uppercase">
              04 CORE CONVICTIONS
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {principles.map((p) => (
              <div
                key={p.num}
                className="group relative flex flex-col justify-between border border-border/60 bg-background/50 p-5 transition-all hover:border-primary/50"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity group-hover:via-primary"
                />
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-primary">{"// "}{p.num}</span>
                    <span className="text-[11px] uppercase text-muted-foreground tracking-wider">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Engineering Journey */}
      <Reveal>
        <div className="py-2">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <MilestoneIcon className="size-4 text-primary" />
              <h2 className="text-2xl font-bold sm:text-3xl tracking-tight">
                Engineering Journey
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              2020 — PRESENT
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-border/70 space-y-8">
            {milestones.map((m) => (
              <div key={m.year + m.title} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-3.5 items-center justify-center">
                  <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(74,222,128,0.7)] group-hover:scale-125 transition-transform" />
                </div>

                <div className="border border-border/60 bg-background/60 p-4 sm:p-5 transition-all hover:border-primary/50 hover:bg-background/90">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <span className="font-bold text-primary">{m.year}</span>
                    <span className="rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[11px] text-primary font-semibold uppercase">
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {m.detail}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                    {m.deliverables.map((d) => (
                      <span
                        key={d}
                        className="rounded border border-border/60 bg-card/60 px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Away From Keyboard */}
      <Reveal>
        <section className="py-2">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-4 mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl tracking-tight">
              Away from the Keyboard
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              OFFLINE
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="group relative flex flex-col gap-3 border border-border/60 bg-background/50 p-5 transition-all hover:border-primary/50 hover:bg-background/80"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-primary transition-transform group-hover:scale-110" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-[11px] font-mono text-primary/70">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </Reveal>

      <MagneticCTA href="/contact">
        start a conversation
        <ArrowUpRightIcon className="size-4" />
      </MagneticCTA>
    </section>
  );
}
