import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "resume.pdf");
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="maarcus-reniero-resume.pdf"',
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("resume file not found", {
      status: 404,
    });
  }
}
