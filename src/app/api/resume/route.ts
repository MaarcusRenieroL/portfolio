import { readFile } from "fs/promises";
import path from "path";
import { record } from "~/lib/server/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "resume.pdf");
    const fileBuffer = await readFile(filePath);
    await record("resume-download", "/api/resume");

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="maarcus-reniero-resume.pdf"',
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return new Response("resume file not found", {
      status: 404,
    });
  }
}
