// Applies db/migrations/*.sql in order, once each. Usage: pnpm db:migrate  (reads DATABASE_URL from the environment or .env.local)
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("create table if not exists _migration (name text primary key, at timestamptz not null default now())");
const dir = path.join("db", "migrations");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
  const done = await client.query("select 1 from _migration where name = $1", [f]);
  if (done.rowCount) continue;
  await client.query("begin");
  try {
    await client.query(fs.readFileSync(path.join(dir, f), "utf8"));
    await client.query("insert into _migration (name) values ($1)", [f]);
    await client.query("commit");
    console.log("applied", f);
  } catch (e) {
    await client.query("rollback");
    throw e;
  }
}
await client.end();
