import { requireAdmin } from "~/lib/server/session";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SPECS } from "~/lib/cms-fields";
import { isKind, listRows } from "~/lib/server/store";
import { PageHeader } from "../../../_components/admin-ui";
import { AddSkillDialog } from "../../../_components/skills-manager";
import { CmsTable } from "../../../_components/table";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function isPending(r: { deleted: boolean; published: unknown; draft: unknown; draft_de: unknown; published_de: unknown }): boolean {
  if (r.deleted) return false;
  return !r.published || !same(r.draft, r.published) || !same(r.draft_de, r.published_de);
}

const DESCRIPTIONS: Record<string, string> = {
  project: "What shows on /projects and the home page. Featured ones lead.",
  role: "Jobs on /experience and the home page, newest first.",
  education: "Degrees and schools on /experience.",
  skillgroup: "Skill groups on /skills. Add or move single skills right in the list.",
  certificate: "Certificates on /certifications.",
  post: "Long-form writing on /blog.",
  note: "Short notes on /notes.",
};

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  return { title: isKind(kind) ? SPECS[kind].plural : "Content" };
}

export default async function ListPage({ params }: { params: Promise<{ kind: string }> }) {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  const spec = SPECS[kind];
  const rows = await listRows(kind);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title={spec.plural} description={DESCRIPTIONS[kind]}>
        {kind === "skillgroup" && <AddSkillDialog groups={rows.map((r) => r.key)} />}
        <Link
          href={`/admin/content/${kind}/new`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--green)] px-3 text-[13px] font-medium text-[var(--green-ink)] transition-opacity hover:opacity-90 pointer-coarse:h-10"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New {kind === "skillgroup" ? "skill group" : spec.label.toLowerCase()}
        </Link>
      </PageHeader>
      <CmsTable kind={kind} titleField={spec.titleField} label={spec.label} plural={spec.plural} rows={rows} pending={rows.some(isPending)} />
    </div>
  );
}
