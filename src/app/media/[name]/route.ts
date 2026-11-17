import { mediaForServing } from "~/lib/server/media";
import { getPrivate, isR2Ref, R2_PREFIX, r2Env } from "~/lib/server/r2";
import { isAdmin } from "~/lib/server/session";

/**
 * `/media/<name>`: a media-library file.
 * - Published content uses it: redirect to its copy on the public assets domain.
 * - Otherwise (unused uploads, images only in drafts): streamed from the private R2 bucket, admin only, never cached.
 * Anything else is a 404, so the URL doesn't reveal whether a file exists.
 */
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!/^[\w.-]+$/.test(name)) return notFound();

  const file = await mediaForServing(name).catch(() => null);
  if (!file) return notFound();
  const admin = file.published ? false : await isAdmin();
  if (!file.published && !admin) return notFound();

  // Only R2 files can be served; anything else (an old record) is treated as missing.
  if (!isR2Ref(file.url)) return notFound();
  return serveR2(req, name, file, admin);
}

/**
 * R2: a published file lives on the assets domain, so old `/media/...` links redirect there. An unpublished
 * one streams from the private bucket, admin only, never cached.
 */
async function serveR2(req: Request, name: string, file: { url: string; content_type: string; published: boolean }, admin: boolean): Promise<Response> {
  const env = r2Env();
  if (!env) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (file.published && !admin) return Response.redirect(`${env.assets}/media/${name}`, 308);
  const obj = await getPrivate(file.url.slice(R2_PREFIX.length), req.headers.get("if-none-match") ?? undefined).catch(() => null);
  if (!obj) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const headers = new Headers({ "Content-Type": file.content_type, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" });
  const etag = obj.headers.get("etag");
  if (etag) headers.set("ETag", etag);
  if (file.content_type === "image/svg+xml") headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  if (file.content_type === "application/pdf") headers.set("Content-Disposition", `inline; filename="${name}"`);
  if (obj.status === 304) return new Response(null, { status: 304, headers });
  return new Response(obj.body, { status: 200, headers });
}
