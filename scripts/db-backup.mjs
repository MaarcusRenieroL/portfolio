// Writes a JSON backup of the CMS content to backups/ (same shape as Site settings → Download backup).
//   pnpm db:backup                      the database in DATABASE_URL (.env.local, then .env)
//   DATABASE_URL=postgres://… pnpm db:backup   any other one, e.g. production before a migration
// Content, publish history, site settings and media records. No messages, bookings, analytics or sign-in data.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

for (const file of [".env.local", ".env"]) {
  if (process.env.DATABASE_URL || !fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const rows = async (sql) => {
  await db.query("savepoint t");
  try {
    const r = (await db.query(sql)).rows;
    await db.query("release savepoint t");
    return r;
  } catch (e) {
    await db.query("rollback to savepoint t");
    if (e.code === "42P01") return []; // table not created yet on this database
    throw e;
  }
};
try {
  // One read-only snapshot, so a publish during the backup can't leave items and history out of step.
  await db.query("begin isolation level repeatable read read only");
  const now = new Date();
  // One client runs one query at a time.
  const content = await rows(`select kind, key, position, draft, published, draft_de, published_de, de_machine, deleted,
                 updated_at::text as updated_at, published_at::text as published_at
            from content_item order by kind, position, key`);
  const versions = await rows("select id::int as id, kind, key, data, data_de, created_at::text as created_at from content_version order by id");
  const settings = await rows("select key, value from site_setting order by key");
  const media = await rows("select id::int as id, url, pathname, content_type, size, width, height, alt, created_at::text as created_at from media order by id");
  const backup = {
    format: "portfolio-content-backup",
    version: 1,
    exportedAt: now.toISOString(),
    counts: { content: content.length, versions: versions.length, settings: settings.length, media: media.length },
    content,
    versions,
    settings,
    media,
  };
  await db.query("commit");
  fs.mkdirSync("backups", { recursive: true });
  const host = new URL(process.env.DATABASE_URL).hostname.replace(/[^a-z0-9.-]/gi, "_");
  const file = path.join("backups", `portfolio-content-${now.toISOString().slice(0, 19).replace(/:/g, "-")}-${host}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Wrote ${file}: ${content.length} items, ${versions.length} versions, ${settings.length} settings, ${media.length} media records.`);
} finally {
  await db.end();
}
