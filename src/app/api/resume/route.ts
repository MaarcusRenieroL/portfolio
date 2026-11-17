import { get } from "@vercel/blob";
import { readFile } from "fs/promises";
import path from "path";
import { record } from "~/lib/server/analytics";
import { mediaForServing } from "~/lib/server/media";
import { getPrivate, isR2Ref, R2_PREFIX } from "~/lib/server/r2";
import { getSiteSettings } from "~/lib/server/settings";

export const dynamic = "force-dynamic";

const headers = {
  "Content-Type": "application/pdf",
  "Content-Disposition": 'attachment; filename="maarcus-reniero-resume.pdf"',
  "Cache-Control": "private, no-cache",
};

/** The résumé as a download: the PDF set in site settings, or public/resume.pdf. */
export async function GET() {
  await record("resume-download", "/api/resume");
  try {
    const { resume } = await getSiteSettings();
    if (resume) {
      // Live settings may already point at the assets domain: only the file name matters here.
      const name = /\/media\/([\w.-]+)$/.exec(resume)?.[1];
      const file = name ? await mediaForServing(name) : null;
      if (file && file.content_type === "application/pdf") {
        if (isR2Ref(file.url)) {
          // Any storage error falls through to the bundled PDF below rather than failing the download.
          const obj = await getPrivate(file.url.slice(R2_PREFIX.length)).catch(() => null);
          if (obj?.ok) return new Response(obj.body, { headers });
        } else {
          const blob = await get(file.url, { access: "private" }).catch(() => null);
          if (blob && blob.statusCode === 200) return new Response(blob.stream, { headers });
        }
      }
    }
    return new Response(await readFile(path.join(process.cwd(), "public", "resume.pdf")), { headers });
  } catch {
    return new Response("Résumé not found", { status: 404 });
  }
}
