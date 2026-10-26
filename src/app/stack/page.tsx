"use client";

import { useState, useMemo } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Reveal } from "~/components/misc/reveal";
import { SectionHeading } from "~/components/misc/section-heading";
import { playBlip, playThock } from "~/lib/audio";

type TechItem = {
  name: string;
  url: string;
};

type StackSection = {
  title: string;
  description: string;
  groups: {
    label: string;
    items: TechItem[];
  }[];
};

const WORK_STACK: StackSection = {
  title: "Work Stack",
  description: "Tools I use daily at UST Healthproof and professional engagements.",
  groups: [
    {
      label: "Frontend",
      items: [
        { name: "Angular", url: "https://angular.dev" },
        { name: "TypeScript", url: "https://www.typescriptlang.org" },
        { name: "HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
        { name: "CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
      ],
    },
    {
      label: "Backend",
      items: [
        { name: "Java 21", url: "https://www.java.com" },
        { name: "Spring Boot", url: "https://spring.io/projects/spring-boot" },
        { name: "Spring Batch", url: "https://spring.io/projects/spring-batch" },
        { name: "Spring Data JPA", url: "https://spring.io/projects/spring-data-jpa" },
      ],
    },
    {
      label: "Database & Infrastructure",
      items: [
        { name: "MySQL Server", url: "https://www.mysql.com" },
        { name: "AWS", url: "https://aws.amazon.com" },
        { name: "Docker", url: "https://www.docker.com" },
      ],
    },
  ],
};

const PERSONAL_STACK: StackSection = {
  title: "Personal Project Stack",
  description: "My go-to tools for side projects, open source, and personal builds.",
  groups: [
    {
      label: "AI & Security",
      items: [
        { name: "Ollama", url: "https://ollama.com" },
        { name: "Wireshark", url: "https://www.wireshark.org" },
        { name: "Linux", url: "https://www.kernel.org" },
      ],
    },
    {
      label: "Desktop & Systems",
      items: [
        { name: "Tauri", url: "https://tauri.app" },
        { name: "Rust", url: "https://www.rust-lang.org" },
        { name: "Spring Boot", url: "https://spring.io/projects/spring-boot" },
        { name: "React Native", url: "https://reactnative.dev" },
        { name: "Nginx", url: "https://nginx.org" },
      ],
    },
    {
      label: "Frontend",
      items: [
        { name: "Next.js", url: "https://nextjs.org" },
        { name: "React", url: "https://react.dev" },
        { name: "TypeScript", url: "https://www.typescriptlang.org" },
        { name: "Tailwind CSS", url: "https://tailwindcss.com" },
        { name: "shadcn/ui", url: "https://ui.shadcn.com" },
        { name: "Radix UI", url: "https://www.radix-ui.com" },
        { name: "Motion", url: "https://motion.dev" },
        { name: "React Hook Form", url: "https://react-hook-form.com" },
        { name: "Zod", url: "https://zod.dev" },
      ],
    },
    {
      label: "Backend & API",
      items: [
        { name: "Node.js", url: "https://nodejs.org" },
        { name: "tRPC", url: "https://trpc.io" },
        { name: "Server Actions", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations" },
        { name: "Next-Auth", url: "https://next-auth.js.org" },
        { name: "REST", url: "https://developer.mozilla.org/en-US/docs/Glossary/REST" },
      ],
    },
    {
      label: "Database & Storage",
      items: [
        { name: "PostgreSQL", url: "https://www.postgresql.org" },
        { name: "Drizzle ORM", url: "https://orm.drizzle.team" },
        { name: "Prisma", url: "https://www.prisma.io" },
        { name: "Upstash Redis", url: "https://upstash.com" },
        { name: "UploadThing", url: "https://uploadthing.com" },
      ],
    },
    {
      label: "Deploy & Tooling",
      items: [
        { name: "Vercel", url: "https://vercel.com" },
        { name: "Docker", url: "https://www.docker.com" },
        { name: "GitHub Actions", url: "https://github.com/features/actions" },
        { name: "Git", url: "https://git-scm.com" },
        { name: "pnpm", url: "https://pnpm.io" },
      ],
    },
  ],
};

const DEV_ENV: StackSection = {
  title: "Dev Environment",
  description: "The terminal-first rig I use every day.",
  groups: [
    {
      label: "Tools",
      items: [
        { name: "Neovim", url: "https://neovim.io" },
        { name: "tmux", url: "https://github.com/tmux/tmux" },
        { name: "Ghostty", url: "https://ghostty.org" },
        { name: "Alacritty", url: "https://alacritty.org" },
        { name: "zsh", url: "https://www.zsh.org" },
        { name: "Git CLI", url: "https://git-scm.com" },
      ],
    },
  ],
};

const SECTIONS = [WORK_STACK, PERSONAL_STACK, DEV_ENV];

export default function StackPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((section) => ({
      ...section,
      groups: section.groups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.name.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0),
    })).filter((s) => s.groups.length > 0);
  }, [query]);

  const totalCount = SECTIONS.reduce(
    (acc, s) => acc + s.groups.reduce((a, g) => a + g.items.length, 0),
    0,
  );

  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="06"
        title="stack"
        eyebrow="tools and range"
        description="the tools i use, the systems i am comfortable around, and the edges i am actively sharpening."
        action={
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {totalCount} entries
          </span>
        }
      />

      {/* Search */}
      <Reveal>
        <div className="flex items-center gap-2 border border-border/60 bg-card/40 px-3 transition-colors focus-within:border-primary/60">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              playThock();
            }}
            placeholder="filter technologies…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                playBlip();
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </Reveal>

      {/* Stack Sections */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <p className="font-mono text-xs text-primary font-semibold">[0 TOOLS MATCHED]</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No tools found matching &quot;{query}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              playBlip();
            }}
            className="mt-4 inline-flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-3 py-1 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {filtered.map((section, si) => (
            <Reveal key={section.title} delay={si * 0.05}>
              <div className="flex flex-col gap-5">
                <div className="border-b border-border/50 pb-3">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-base text-muted-foreground">{section.description}</p>
                </div>

                <div className="flex flex-col gap-6">
                  {section.groups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <a
                            key={item.name}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-1.5 border border-border/60 bg-card/40 px-3.5 py-2 font-mono text-sm text-foreground/90 transition-all hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                          >
                            {item.name}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-primary/70">↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
