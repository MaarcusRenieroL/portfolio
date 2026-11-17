import { requireAdmin } from "~/lib/server/session";
import { storageConfigured, listMedia } from "~/lib/server/media";
import { PageHeader } from "../../_components/admin-ui";
import { MediaLibrary } from "../../_components/media-library";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  const configured = storageConfigured();
  let items: Awaited<ReturnType<typeof listMedia>> = [];
  let tableMissing = false;
  try {
    items = await listMedia();
  } catch {
    // Most likely the 004_media migration hasn't run yet.
    tableMissing = true;
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Media" description="Photos, screenshots, certificate images and PDFs. Upload here, then pick them from any form." />
      {tableMissing ? (
        <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">
          The media table doesn&apos;t exist yet. Run <code>pnpm db:migrate</code> and reload.
        </p>
      ) : (
        <MediaLibrary initial={items} configured={configured} />
      )}
    </div>
  );
}
