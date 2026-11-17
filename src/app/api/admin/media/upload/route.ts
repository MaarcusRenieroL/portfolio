import { NextResponse } from "next/server";
import { FILE_TYPES, MAX_UPLOAD_BYTES, slugFileName } from "~/lib/media";
import { presignUpload, R2_PREFIX, r2Configured } from "~/lib/server/r2";
import { isAdmin } from "~/lib/server/session";

/**
 * Starts an upload to the private R2 bucket. `{ name, contentType, size }` returns a signed PUT URL (valid for
 * 10 minutes) and the `r2:media/...` reference the browser registers once the file is up, so large files never
 * pass through this function. Type and size are checked here and again on register, against what R2 stored.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: "File uploads aren't set up: the R2 variables are missing." }, { status: 503 });

  let b: Record<string, unknown>;
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object") throw new Error("not an object");
    b = json as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const type = typeof b.contentType === "string" ? b.contentType : "";
  const size = typeof b.size === "number" ? b.size : NaN;
  if (!(FILE_TYPES as readonly string[]).includes(type)) return NextResponse.json({ error: "That file type isn't allowed." }, { status: 400 });
  if (!(size > 0 && size <= MAX_UPLOAD_BYTES)) return NextResponse.json({ error: "That file is too large." }, { status: 400 });
  const file = slugFileName(typeof b.name === "string" ? b.name : "file", type);
  const dot = file.lastIndexOf(".");
  // A random suffix: unpublished uploads can't be guessed, and names never collide.
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const key = `media/${file.slice(0, dot)}-${suffix}${file.slice(dot)}`;
  try {
    return NextResponse.json({ putUrl: await presignUpload(key), ref: `${R2_PREFIX}${key}` });
  } catch {
    return NextResponse.json({ error: "Couldn't start the upload." }, { status: 502 });
  }
}
