import { notFound } from "next/navigation";
import { isKind, getRow, listRows } from "~/lib/server/store";
import { SPECS } from "~/lib/cms-fields";
import { Editor } from "../../../../_components/editor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ kind: string; key: string }>;
}) {
  const { kind, key: raw } = await params;
  if (!isKind(kind)) notFound();
  const key = decodeURIComponent(raw);
  const spec = SPECS[kind];

  const [row, allRows] = await Promise.all([
    key === "new" ? null : getRow(kind, key),
    listRows(kind),
  ]);

  if (key !== "new" && !row) notFound();

  const collectionItems = allRows.map((r) => ({
    key: r.key,
    title: String(
      (r.draft as Record<string, unknown>)[spec.titleField] ?? r.key
    ),
    live: Boolean(r.published),
    deleted: r.deleted,
  }));

  return (
    <Editor
      kind={kind}
      keyValue={row ? row.key : null}
      data={row ? row.draft : {}}
      de={row ? (row.draft_de ?? {}) : {}}
      machine={row ? row.de_machine : false}
      live={Boolean(row?.published)}
      deleted={Boolean(row?.deleted)}
      collectionItems={collectionItems}
    />
  );
}
