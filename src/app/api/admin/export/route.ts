import { audit } from "~/lib/server/auth";
import { backupFileName, buildBackup } from "~/lib/server/backup";
import { isAdmin } from "~/lib/server/session";

export const dynamic = "force-dynamic";

/** Download a JSON backup of the CMS content (see src/lib/server/backup.ts for what is and isn't in it). Admin only. */
export async function GET() {
  // 404, not 401: the URL shouldn't confirm there is anything here.
  if (!(await isAdmin())) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const now = new Date();
    const backup = await buildBackup(now);
    await audit("content_exported", "admin", backup.counts);
    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${backupFileName(now)}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[export] failed:", e instanceof Error ? e.message : e);
    return new Response("Couldn't build the backup. Is the database reachable?", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
