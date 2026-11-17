import { Award, Briefcase, FileText, FolderGit2, GraduationCap, Sparkles, StickyNote, type LucideIcon } from "lucide-react";

/** Shared admin pieces that work in both server and client components. */

const KIND_ICONS: Record<string, LucideIcon> = {
  project: FolderGit2,
  role: Briefcase,
  education: GraduationCap,
  skillgroup: Sparkles,
  certificate: Award,
  post: FileText,
  note: StickyNote,
};

export const kindIcon = (kind: string): LucideIcon => KIND_ICONS[kind] ?? FileText;

/** Title row for every admin page: heading, one line of context, actions on the right. */
export function PageHeader({ title, description, children }: { title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--fg)]">{title}</h1>
        {description && <p className="mt-1 max-w-[60ch] text-[13px] leading-relaxed text-[var(--fg-3)]">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
