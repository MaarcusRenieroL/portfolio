import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 through its S3-compatible API. Two buckets:
 * - private (R2_BUCKET_PRIVATE): every upload lands here; only the admin can read it, through /media/<name>.
 * - public (R2_BUCKET_PUBLIC, custom domain NEXT_PUBLIC_ASSETS_URL, e.g. https://assets.maarcus.dev):
 *   a file is copied here once published content or site settings use it, and removed when nothing live does.
 * Unset variables keep the older Vercel Blob store and /public files working, so this is opt-in.
 */

export type R2Env = { account: string; key: string; secret: string; pub: string; priv: string; assets: string };

export function r2Env(env: NodeJS.ProcessEnv = process.env): R2Env | null {
  const e = {
    account: env.R2_ACCOUNT_ID ?? "",
    key: env.R2_ACCESS_KEY_ID ?? "",
    secret: env.R2_SECRET_ACCESS_KEY ?? "",
    pub: env.R2_BUCKET_PUBLIC ?? "",
    priv: env.R2_BUCKET_PRIVATE ?? "",
    assets: (env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/+$/, ""),
  };
  return Object.values(e).every(Boolean) ? e : null;
}

export const r2Configured = () => r2Env() !== null;

/** How media rows stored in R2 are recorded in `media.url`: "r2:media/<name>". */
export const R2_PREFIX = "r2:";
export const isR2Ref = (url: string) => url.startsWith(R2_PREFIX);

function setup() {
  const env = r2Env();
  if (!env) throw new Error("R2 isn't configured.");
  // Two retries, not aws4fetch's default ten: a struggling R2 should fail a request fast, not stall it for a minute.
  const client = new AwsClient({ accessKeyId: env.key, secretAccessKey: env.secret, service: "s3", region: "auto", retries: 2 });
  const url = (bucket: string, key = "", query = "") =>
    `https://${env.account}.r2.cloudflarestorage.com/${bucket}${key ? `/${key.split("/").map(encodeURIComponent).join("/")}` : ""}${query}`;
  return { env, client, url };
}

/** A URL the browser can PUT one file to for the next 10 minutes. Type and size are checked after, on register. */
export async function presignUpload(key: string): Promise<string> {
  const { env, client, url } = setup();
  const signed = await client.sign(new Request(`${url(env.priv, key)}?X-Amz-Expires=600`, { method: "PUT" }), { aws: { signQuery: true } });
  return signed.url;
}

/** Size and type of a private file, or null if it isn't there. */
export async function headPrivate(key: string): Promise<{ size: number; type: string } | null> {
  const { env, client, url } = setup();
  const r = await client.fetch(url(env.priv, key), { method: "HEAD" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`R2 HEAD failed (${r.status}).`);
  return { size: Number(r.headers.get("content-length") ?? 0), type: r.headers.get("content-type") ?? "application/octet-stream" };
}

/** Read a private file, passing If-None-Match through so the browser can revalidate. */
export async function getPrivate(key: string, ifNoneMatch?: string): Promise<Response | null> {
  const { env, client, url } = setup();
  const r = await client.fetch(url(env.priv, key), { headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {} });
  if (r.status === 404) return null;
  if (!r.ok && r.status !== 304) throw new Error(`R2 GET failed (${r.status}).`);
  return r;
}

export async function putObject(bucket: "public" | "private", key: string, body: BodyInit, type: string, cache?: string): Promise<void> {
  const { env, client, url } = setup();
  const headers: Record<string, string> = { "Content-Type": type };
  if (cache) headers["Cache-Control"] = cache;
  const r = await client.fetch(url(bucket === "public" ? env.pub : env.priv, key), { method: "PUT", body, headers });
  if (!r.ok) throw new Error(`R2 PUT failed (${r.status}).`);
}

/**
 * How long browsers and Cloudflare's edge keep a published library file. Short on purpose: a file taken off the
 * site disappears from the bucket at once, and from caches within this time.
 */
export const PUBLIC_MEDIA_CACHE = "public, max-age=600, s-maxage=600";

/** Publish one file: server-side copy from the private bucket to the public one, with the type checked at upload. */
export async function copyToPublic(key: string, type: string): Promise<void> {
  const { env, client, url } = setup();
  const r = await client.fetch(url(env.pub, key), {
    method: "PUT",
    headers: {
      "x-amz-copy-source": `/${env.priv}/${key.split("/").map(encodeURIComponent).join("/")}`,
      // REPLACE drops the uploaded object's own metadata, including any type it was re-uploaded with.
      "x-amz-metadata-directive": "REPLACE",
      "Cache-Control": PUBLIC_MEDIA_CACHE,
      "Content-Type": type,
      // R2 can't attach a CSP header. An SVG opened directly would run as a page with script, so make that a
      // download; <img> tags ignore this and still show it.
      ...(type === "image/svg+xml" ? { "Content-Disposition": "attachment" } : {}),
    },
  });
  if (!r.ok) throw new Error(`R2 copy failed (${r.status}).`);
}

export async function deleteObject(bucket: "public" | "private", key: string): Promise<void> {
  const { env, client, url } = setup();
  const r = await client.fetch(url(bucket === "public" ? env.pub : env.priv, key), { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw new Error(`R2 DELETE failed (${r.status}).`);
}

/** Every key under a prefix in the public bucket. */
export async function listPublic(prefix: string): Promise<string[]> {
  const { env, client, url } = setup();
  const keys: string[] = [];
  let token = "";
  for (let page = 0; page < 100; page++) {
    const q = `?list-type=2&prefix=${encodeURIComponent(prefix)}${token ? `&continuation-token=${encodeURIComponent(token)}` : ""}`;
    const r = await client.fetch(url(env.pub, "", q));
    if (!r.ok) throw new Error(`R2 LIST failed (${r.status}).`);
    const xml = await r.text();
    for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(unxml(m[1]));
    const next = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/.exec(xml);
    if (!/<IsTruncated>true<\/IsTruncated>/.test(xml) || !next) break;
    token = unxml(next[1]);
  }
  return keys;
}

const unxml = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/**
 * Published text with library paths (`/media/<name>`) pointed at the public bucket. Only for live content: drafts
 * keep `/media/...`, which serves unpublished files to the admin from the private bucket. Only names in `r2Names`
 * (files stored in R2) are rewritten; anything still in the older Blob store keeps its /media path, which works.
 */
export function toPublicAssets<T>(value: T, r2Names: ReadonlySet<string>, assets = r2Env()?.assets): T {
  if (!assets || r2Names.size === 0) return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string")
      return v.replace(/(^|[\s("'=\]])\/media\/([\w.-]+)/g, (all, pre: string, name: string) => {
        const clean = name.replace(/[._-]+$/, "");
        return r2Names.has(`media/${clean}`) ? `${pre}${assets}/media/${name}` : all;
      });
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}
