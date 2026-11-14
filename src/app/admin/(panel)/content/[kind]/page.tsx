import Link from "next/link";
import { notFound } from "next/navigation";
import { SPECS } from "~/lib/cms-fields";
import { isKind, listRows, type Row } from "~/lib/server/store";
import { ListTools, RowControls } from "../../../_components/row-controls";

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function status(r: Row): [string, string] {
  if (r.deleted) return ["removed", ""];
  if (!r.published) return ["never published", "draft"];
  if (!same(r.draft, r.published) || !same(r.draft_de, r.published_de)) return ["unpublished changes", "draft"];
  return ["live", "live"];
}

export default async function ListPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  const spec = SPECS[kind];
  const rows = await listRows(kind);
  const pending = rows.some((r) => !r.deleted && status(r)[1] === "draft");
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{spec.plural}</h1>
        <Link className="btn" href={`/admin/content/${kind}/new`}>New {spec.label.toLowerCase()}</Link>
      </div>
      <ListTools kind={kind} empty={rows.length === 0} pending={pending} />
      <div className="list" style={{ marginTop: 16 }}>
        {rows.map((r, i) => {
          const [label, cls] = status(r);
          return (
            <div key={r.key} className="item">
              <Link href={`/admin/content/${kind}/${encodeURIComponent(r.key)}`} style={{ flex: 1, textDecoration: "none" }}>
                <strong>{String(r.draft[spec.titleField] ?? r.key)}</strong>
                <div className="muted small">{r.key}</div>
              </Link>
              <span className={`pill ${cls}`}>{label}</span>
              {r.de_machine && r.draft_de && <span className="pill">DE machine</span>}
              <RowControls kind={kind} k={r.key} first={i === 0} last={i === rows.length - 1} />
            </div>
          );
        })}
      </div>
      {rows.length === 0 && <p className="muted">Nothing here yet.</p>}
    </>
  );
}
