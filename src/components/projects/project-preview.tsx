import type { ReactNode } from "react";

/**
 * A small terminal-style window per project, drawn from what the project
 * actually does (see each repository's README). Same look as the rest of the site.
 */

function Window({ title, label, children }: { title: string; label: string; children: ReactNode }) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="overflow-hidden border border-border/60 bg-card/40"
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2 font-mono text-[11px] text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        <span>{title}</span>
      </div>
      <div className="p-4 font-mono text-xs leading-6 sm:p-6 sm:text-sm sm:leading-7">{children}</div>
    </figure>
  );
}

function Row({ left, right, active }: { left: ReactNode; right?: ReactNode; active?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 px-2 ${active ? "bg-primary text-primary-foreground" : ""}`}>
      <span>{left}</span>
      {right && <span className={active ? "" : "text-muted-foreground"}>{right}</span>}
    </div>
  );
}

function Nyx() {
  return (
    <Window title="nyx — launcher" label="The Nyx launcher window with a search field and grouped results">
      <p className="px-2 text-muted-foreground">
        &gt; <span className="text-foreground">ghost</span>
        <span className="text-primary">▍</span>
      </p>
      <p className="mt-3 px-2 text-primary">applications</p>
      <Row active left="Ghostty" right="↵" />
      <Row left="Zed" />
      <p className="mt-3 px-2 text-primary">files</p>
      <Row left="ROADMAP.md" right="~/nyx" />
      <Row left="NEXT-FEATURES.md" right="~/nyx" />
      <p className="mt-4 px-2 text-muted-foreground">↵ open · ⌘K actions · esc close</p>
    </Window>
  );
}

function LifeOs() {
  const rows = [
    ["vault", "/v1/vault", "passwords"],
    ["finance", "/v1/finance", "budgets, transactions"],
    ["jobs", "/v1/jobs", "search and interviews"],
    ["habits", "/v1/habits", "streaks, reminders"],
    ["notes", "/v1/notes", "folders, attachments"],
    ["tasks", "/v1/tasks", "projects and goals"],
    ["calendar", "/v1/calendar", "events, recurrence"],
    ["workouts", "/v1/workouts", "sessions, records"],
  ];
  return (
    <Window title="life-os — modules" label="Life OS modules, their routes and what each one is for">
      <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 sm:gap-x-8">
        {rows.map(([name, route, what]) => (
          <div key={name} className="contents">
            <span>{name}</span>
            <span className="text-primary">{route}</span>
            <span className="text-muted-foreground">{what}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-muted-foreground">one process · one gateway · one schema per module</p>
    </Window>
  );
}

function ScanForge() {
  const rows = [
    ["x", ".java", "42 files"],
    ["x", ".xml", "6 files"],
    [" ", ".md", "3 files"],
  ];
  return (
    <Window title="scanforge" label="The ScanForge terminal picker, selecting files by extension">
      <p className="text-muted-foreground">mode: extensions (tab switches to files)</p>
      <p className="mt-2">
        &gt; search: ja<span className="text-primary">▍</span>
      </p>
      <div className="mt-3">
        {rows.map(([on, ext, n], i) => (
          <Row key={ext} active={i === 0} left={`[${on}] ${ext}`} right={n} />
        ))}
      </div>
      <p className="mt-4 text-muted-foreground">↑↓ move · space select · enter copy</p>
    </Window>
  );
}

function Zentro() {
  const rows: [string, string, number][] = [
    ["organization", "members, permissions", 0],
    ["workspace", "membership, permissions", 1],
    ["board", "tasks, notifications", 2],
    ["task", "activity tracking", 3],
  ];
  return (
    <Window title="zentro — tenancy" label="Zentro's tenancy model: organization, workspace, board, task">
      {rows.map(([name, note, depth]) => (
        <div key={name} style={{ paddingLeft: `${depth * 1.5}rem` }} className="flex justify-between gap-4">
          <span>{name}</span>
          <span className="text-muted-foreground">{note}</span>
        </div>
      ))}
      <p className="mt-4 text-primary">every query is scoped by organization first</p>
    </Window>
  );
}

function NextKit() {
  const rows = [
    ["auth", "next-auth · clerk · kinde"],
    ["orm", "prisma · drizzle"],
    ["api", "trpc · graphql · hono · rest"],
    ["payments", "stripe and more"],
  ];
  return (
    <Window title="next-kit" label="The next-kit command-line prompts for choosing a stack">
      <p>$ npx @mxrcxs17/next-kit@latest</p>
      <div className="mt-3">
        {rows.map(([q, opts]) => (
          <p key={q}>
            <span className="text-primary">? {q}</span> <span className="text-muted-foreground">{opts}</span>
          </p>
        ))}
      </div>
    </Window>
  );
}

function Dotfiles() {
  const rows = [
    ["nvim/", "editor, in lua"],
    ["zsh/", "shell"],
    ["tmux/", "sessions"],
    ["ghostty/", "terminal"],
  ];
  return (
    <Window title="dotfiles" label="The dotfiles repository, grouped by tool">
      {rows.map(([dir, note]) => (
        <Row key={dir} left={<span className="text-primary">{dir}</span>} right={note} />
      ))}
    </Window>
  );
}

function Portfolio() {
  return (
    <Window title="portfolio" label="This portfolio's terminal, opened with a keyboard shortcut">
      <p>$ projects</p>
      <p className="text-muted-foreground">nyx · life os · scanforge · next-kit · zentro · dotfiles · portfolio</p>
      <p className="mt-2">
        $ <span className="text-primary">▍</span>
      </p>
    </Window>
  );
}

const PREVIEWS: Record<string, () => ReactNode> = {
  nyx: Nyx,
  "life-os": LifeOs,
  "scan-forge": ScanForge,
  zentro: Zentro,
  "next-kit": NextKit,
  dotfiles: Dotfiles,
  portfolio: Portfolio,
};

export function ProjectPreview({ id }: { id: string }) {
  const Preview = PREVIEWS[id];
  return Preview ? <Preview /> : null;
}
