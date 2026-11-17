// Moves the site's files to Cloudflare R2. Safe to re-run: files already there with the same size are skipped.
//   pnpm assets:upload            do it
//   pnpm assets:upload --dry-run  only list what would happen
// 1. public/{projects,certificates,logos,resume.pdf} → public bucket as projects/, certifications/, logos/, resume.pdf
// 2. CORS on the private bucket, so the admin can upload to it straight from the browser
// 3. files that live content uses → copied to the public bucket (what every publish does from then on)
// Reads R2_* and NEXT_PUBLIC_ASSETS_URL (and DATABASE_URL for 3) from the env, .env.local or .env.
import fs from "node:fs";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import pg from "pg";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
}

const DRY = process.argv.includes("--dry-run");
const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_PUBLIC", "R2_BUCKET_PRIVATE", "NEXT_PUBLIC_ASSETS_URL"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing: ${missing.join(", ")}. Set them in .env.local first.`);
  process.exit(1);
}
const env = process.env;
const r2 = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" });
const enc = (key) => key.split("/").map(encodeURIComponent).join("/");
const url = (bucket, key = "", q = "") => `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}${key ? `/${enc(key)}` : ""}${q}`;

const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".mp4": "video/mp4" };
const CACHE = "public, max-age=86400, stale-while-revalidate=604800";

async function size(bucket, key) {
  const r = await r2.fetch(url(bucket, key), { method: "HEAD" });
  return r.ok ? Number(r.headers.get("content-length")) : null;
}

async function put(bucket, key, body, type, cache = CACHE) {
  if (DRY) return console.log(`  would upload ${bucket}/${key}`);
  const r = await r2.fetch(url(bucket, key), { method: "PUT", body, headers: { "Content-Type": type, "Cache-Control": cache } });
  if (!r.ok) throw new Error(`PUT ${key}: ${r.status} ${await r.text()}`);
  console.log(`  uploaded ${bucket}/${key}`);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}

// 1. Static files
console.log("1. Site files → public bucket");
const MAP = [
  ["public/projects", "projects"],
  ["public/certificates", "certifications"],
  ["public/logos", "logos"],
];
let skipped = 0;
for (const [from, to] of MAP) {
  if (!fs.existsSync(from)) continue;
  for (const file of walk(from)) {
    const type = TYPES[path.extname(file).toLowerCase()];
    if (!type) continue;
    const key = `${to}/${path.relative(from, file).split(path.sep).join("/")}`;
    const body = fs.readFileSync(file);
    if ((await size(env.R2_BUCKET_PUBLIC, key)) === body.length) {
      skipped++;
      continue;
    }
    await put(env.R2_BUCKET_PUBLIC, key, body, type);
  }
}
if (fs.existsSync("public/resume.pdf")) {
  const body = fs.readFileSync("public/resume.pdf");
  if ((await size(env.R2_BUCKET_PUBLIC, "resume.pdf")) !== body.length) await put(env.R2_BUCKET_PUBLIC, "resume.pdf", body, "application/pdf", "public, max-age=3600");
  else skipped++;
}
console.log(`  ${skipped} already there`);

// 2. CORS for browser uploads into the private bucket
console.log("2. CORS on the private bucket");
const origins = ["https://maarcus.dev", "https://www.maarcus.dev", "http://localhost:3000", ...(env.UPLOAD_ORIGINS ? env.UPLOAD_ORIGINS.split(",") : [])];
const cors = `<?xml version="1.0" encoding="UTF-8"?><CORSConfiguration><CORSRule>${origins.map((o) => `<AllowedOrigin>${o.trim()}</AllowedOrigin>`).join("")}<AllowedMethod>PUT</AllowedMethod><AllowedHeader>content-type</AllowedHeader><MaxAgeSeconds>3600</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
if (DRY) console.log(`  would allow PUT from ${origins.join(", ")}`);
else {
  const r = await r2.fetch(url(env.R2_BUCKET_PRIVATE, "", "?cors"), { method: "PUT", body: cors, headers: { "Content-Type": "application/xml" } });
  // An "Object Read & Write" token may not change bucket settings (403). The rule only has to exist once:
  // set it in the dashboard (bucket → Settings → CORS Policy: PUT from the origins above, header content-type).
  console.log(
    r.ok
      ? `  PUT allowed from ${origins.join(", ")}`
      : r.status === 403
        ? "  skipped: this token can't change bucket settings. Set the CORS rule once in the dashboard (or it may already be set)."
        : `  couldn't set CORS (${r.status}): ${await r.text()}`,
  );
}

// 3 needs the database
if (!env.DATABASE_URL) {
  console.log("No DATABASE_URL: skipping the media library.");
  process.exit(0);
}
const db = new pg.Client({ connectionString: env.DATABASE_URL });
await db.connect();
try {
  console.log("3. Files live content uses → public bucket");
  const texts = (
    await db.query(
      `select coalesce(published::text, '') || coalesce(published_de::text, '') t from content_item where not deleted and published is not null
       union all select value::text from site_setting`,
    )
  ).rows;
  const live = new Set();
  for (const { t } of texts) for (const m of t.matchAll(/\/media\/([\w.-]+)/g)) live.add(`media/${m[1].replace(/\.+$/, "")}`);
  const ours = new Map((await db.query("select pathname, content_type from media where url like 'r2:%'")).rows.map((r) => [r.pathname, r.content_type]));
  for (const key of live) {
    if (!ours.has(key) || (await size(env.R2_BUCKET_PUBLIC, key)) !== null) continue;
    if (DRY) {
      console.log(`  would publish ${key}`);
      continue;
    }
    const r = await r2.fetch(url(env.R2_BUCKET_PUBLIC, key), {
      method: "PUT",
      headers: { "x-amz-copy-source": `/${env.R2_BUCKET_PRIVATE}/${enc(key)}`, "x-amz-metadata-directive": "REPLACE", "Cache-Control": "public, max-age=31536000, immutable", "Content-Type": ours.get(key) },
    });
    console.log(r.ok ? `  published ${key}` : `  couldn't publish ${key} (${r.status})`);
  }
} finally {
  await db.end();
}
console.log(DRY ? "Dry run done. Nothing changed." : `Done. Files are at ${env.NEXT_PUBLIC_ASSETS_URL}/…`);
