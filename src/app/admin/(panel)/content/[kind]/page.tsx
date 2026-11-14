import Link from "next/link";
import { notFound } from "next/navigation";
import { SPECS } from "~/lib/cms-fields";
import { isKind, listRows } from "~/lib/server/store";
import { PlusIcon } from "../../../_components/icons";
import { AddSkillDialog } from "../../../_components/skills-manager";
import { CmsTable } from "../../../_components/table";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function isPendingDraft(r: { deleted: boolean; published: unknown; draft: unknown; draft_de: unknown; published_de: unknown }): boolean {
  if (r.deleted) return false;
  if (!r.published) return true;
  if (!same(r.draft, r.published) || !same(r.draft_de, r.published_de)) return true;
  return false;
}

export default async function ListPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  const spec = SPECS[kind];
  const rows = await listRows(kind);
  const pending = rows.some(isPendingDraft);

  return (
    <div className="admin-content-view">
      <div className="admin-section-header row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <h1>{spec.plural}</h1>
            <span className="badge">{rows.length}</span>
          </div>
          <p className="muted small" style={{ margin: "4px 0 0" }}>
            Manage {spec.plural.toLowerCase()} content, drafts, translations and ordering.
          </p>
        </div>

        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          {kind === "skillgroup" && (
            <AddSkillDialog groups={rows.map((r) => r.key)} />
          )}
          <Link className="btn" href={`/admin/content/${kind}/new`}>
            <PlusIcon width={14} height={14} />
            <span>New {kind === "skillgroup" ? "skill group" : spec.label.toLowerCase()}</span>
          </Link>
        </div>
      </div>

      <CmsTable
        kind={kind}
        titleField={spec.titleField}
        label={spec.label}
        plural={spec.plural}
        rows={rows}
        pending={pending}
      />
    </div>
  );
}
