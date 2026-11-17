import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { FILE_TYPES, MAX_UPLOAD_BYTES, slugFileName } from "~/lib/media";
import { blobConfigured } from "~/lib/server/media";
import { presignUpload, R2_PREFIX, r2Configured } from "~/lib/server/r2";
import { isAdmin } from "~/lib/server/session";

/**
 * With R2 configured, `{ type: "r2.sign", name, contentType, size }` returns a signed PUT URL into the private
 * bucket and the `r2:media/...` reference to register afterwards; without R2 it answers 409 and the client
 * uses Vercel Blob below.
 *
 * Client uploads to Vercel Blob. The browser asks here for a short-lived upload token
 * (admin session required), then sends the file straight to Blob, so large files never
 * pass through this function. The file is recorded afterwards by the `registerMedia` action:
 * Blob's completion webhook can't reach localhost, so the app doesn't depend on it.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!blobConfigured()) return NextResponse.json({ error: "File uploads aren't set up: BLOB_READ_WRITE_TOKEN is missing." }, { status: 503 });

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if ((body as { type?: string })?.type === "r2.sign") return signR2(body as unknown as Record<string, unknown>);

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Checked here, not at the top: Blob's own completion callback carries no admin cookie.
        if (!(await isAdmin())) throw new Error("Not signed in.");
        if (!/^media\/[a-z0-9-]+\.[a-z0-9]+$/.test(pathname)) throw new Error("Bad file name.");
        return {
          allowedContentTypes: [...FILE_TYPES],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: msg }, { status: msg === "Not signed in." ? 401 : 400 });
  }
}

async function signR2(b: Record<string, unknown>): Promise<NextResponse> {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: "R2 isn't configured." }, { status: 409 });
  const type = typeof b.contentType === "string" ? b.contentType : "";
  const size = typeof b.size === "number" ? b.size : NaN;
  if (!(FILE_TYPES as readonly string[]).includes(type)) return NextResponse.json({ error: "That file type isn't allowed." }, { status: 400 });
  if (!(size > 0 && size <= MAX_UPLOAD_BYTES)) return NextResponse.json({ error: "That file is too large." }, { status: 400 });
  const file = slugFileName(typeof b.name === "string" ? b.name : "file", type);
  const dot = file.lastIndexOf(".");
  // A random suffix, like Blob's: unpublished uploads can't be guessed, and names never collide.
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const key = `media/${file.slice(0, dot)}-${suffix}${file.slice(dot)}`;
  try {
    return NextResponse.json({ putUrl: await presignUpload(key), ref: `${R2_PREFIX}${key}` });
  } catch {
    return NextResponse.json({ error: "Couldn't start the upload." }, { status: 502 });
  }
}
