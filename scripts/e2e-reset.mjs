// Gives the end-to-end run a clean test database before the dev server starts (the server's first request caches content).
import fs from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) process.exit(0);
if (!url.endsWith("/portfolio_test")) throw new Error("refusing to reset a database that is not portfolio_test");
const db = new pg.Client({ connectionString: url });
await db.connect();
const has = await db.query("select to_regclass('admin_user') t");
if (!has.rows[0].t) await db.query(fs.readFileSync("db/migrations/001_init.sql", "utf8"));
await db.query("truncate admin_user, admin_passkey, admin_recovery_code, admin_attempt, admin_session, audit_log, site_event, content_item restart identity");
await db.end();
