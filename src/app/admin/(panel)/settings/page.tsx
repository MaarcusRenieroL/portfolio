import { requireAdmin } from "~/lib/server/session";
import { defaultSettings, settingsSchema, type SiteSettings } from "~/lib/settings";
import { readSavedSettings } from "~/lib/server/settings";
import { Download } from "lucide-react";
import { PageHeader } from "../../_components/admin-ui";
import { SettingsForm } from "../../_components/settings-form";

export const metadata = { title: "Site settings" };

/** Text fields start empty when unchanged, so the default shows as a placeholder rather than a frozen copy. */
function editable(saved: Partial<SiteSettings> | null): SiteSettings {
  const empty = { en: "", de: "" };
  const parsed = saved ? settingsSchema.partial().safeParse(saved) : null;
  const v = parsed?.success ? parsed.data : {};
  const d = defaultSettings();
  return {
    photo: v.photo ?? "",
    available: v.available ?? d.available,
    availableLabel: v.availableLabel ?? empty,
    heroTitle: v.heroTitle ?? empty,
    heroHighlight: v.heroHighlight ?? empty,
    heroLead: v.heroLead ?? empty,
    homeAbout: v.homeAbout ?? empty,
    location: v.location ?? "",
    resume: v.resume ?? "",
    now: v.now ?? { en: "", de: "" },
    nowUpdated: v.nowUpdated ?? "",
  };
}

export default async function SettingsPage() {
  // Each page checks on its own: a layout check alone does not stop this segment from rendering.
  await requireAdmin();
  let saved: Partial<SiteSettings> | null = null;
  let missing = false;
  try {
    saved = await readSavedSettings();
  } catch {
    missing = true;
  }
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Site settings" description="Your photo, availability, the home page copy and your résumé." />
      {missing ? (
        <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">
          The settings table doesn&apos;t exist yet. Run <code>pnpm db:migrate</code> and reload.
        </p>
      ) : (
        <SettingsForm saved={editable(saved)} defaults={defaultSettings()} />
      )}

      <section aria-labelledby="backup-h" className="mt-12 border-t border-[var(--line)] pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 id="backup-h" className="text-[13px] font-medium text-[var(--fg)]">
              Backup
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-3)]">
              Everything you&apos;ve written here as one JSON file: every item with its draft, live copy and German, the
              publish history, these settings and the media list. Uploaded files stay in storage. Messages, bookings and
              analytics aren&apos;t included. From a terminal, <code>pnpm db:backup</code> does the same for any database.
            </p>
          </div>
          <a
            href="/api/admin/export"
            download
            className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-md border border-[var(--line)] px-3 text-[13px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] pointer-coarse:h-10"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download backup
          </a>
        </div>
      </section>
    </div>
  );
}
