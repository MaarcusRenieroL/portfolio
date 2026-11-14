import { notFound } from "next/navigation";
import { isKind, getRow } from "~/lib/server/store";
import { Editor } from "../../../../_components/editor";

export default async function EditPage({ params }: { params: Promise<{ kind: string; key: string }> }) {
  const { kind, key: raw } = await params;
  if (!isKind(kind)) notFound();
  const key = decodeURIComponent(raw);
  if (key === "new") return <Editor kind={kind} keyValue={null} data={{}} de={{}} machine={false} live={false} deleted={false} />;
  const row = await getRow(kind, key);
  if (!row) notFound();
  return <Editor kind={kind} keyValue={row.key} data={row.draft} de={row.draft_de ?? {}} machine={row.de_machine} live={Boolean(row.published)} deleted={row.deleted} />;
}
