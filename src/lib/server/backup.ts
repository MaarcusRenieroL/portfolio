import type pg from "pg";
import { pool } from "./db";

/**
 * A copy of everything written in the CMS: every content item (draft, live copy, German), its publish history,
 * the site settings and the media library's records. The files themselves stay in storage; their records are
 * enough to relink them. Messages, bookings, analytics and sign-in data are left out on purpose: they are
 * other people's personal data or secrets, and don't belong in a file that gets downloaded and kept around.
 *
 * `scripts/db-backup.mjs` writes the same shape from the command line; keep the two in step.
 */

export const BACKUP_FORMAT = "portfolio-content-backup";
export const BACKUP_VERSION = 1;

export type Backup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  counts: Record<"content" | "versions" | "settings" | "media", number>;
  content: Record<string, unknown>[];
  versions: Record<string, unknown>[];
  settings: Record<string, unknown>[];
  media: Record<string, unknown>[];
};

/** Tables that may be missing on an older database (not migrated yet) come back empty, not as an error. */
async function rows(client: pg.PoolClient, sql: string): Promise<Record<string, unknown>[]> {
  await client.query("savepoint t");
  try {
    const r = (await client.query<Record<string, unknown>>(sql)).rows;
    await client.query("release savepoint t");
    return r;
  } catch (e) {
    await client.query("rollback to savepoint t");
    if ((e as { code?: string }).code === "42P01") return []; // undefined_table
    throw e;
  }
}

/**
 * One connection, one read-only snapshot: a publish during the export can't leave an item and its history
 * out of step in the file.
 */
export async function buildBackup(now = new Date()): Promise<Backup> {
  const client = await pool().connect();
  try {
    await client.query("begin isolation level repeatable read read only");
    const content = await rows(
      client,
      `select kind, key, position, draft, published, draft_de, published_de, de_machine, deleted,
              updated_at::text as updated_at, published_at::text as published_at
         from content_item order by kind, position, key`,
    );
    const versions = await rows(client, "select id::int as id, kind, key, data, data_de, created_at::text as created_at from content_version order by id");
    const settings = await rows(client, "select key, value from site_setting order by key");
    const media = await rows(client, "select id::int as id, url, pathname, content_type, size, width, height, alt, created_at::text as created_at from media order by id");
    await client.query("commit");
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      counts: { content: content.length, versions: versions.length, settings: settings.length, media: media.length },
      content,
      versions,
      settings,
      media,
    };
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export const backupFileName = (now = new Date()) => `portfolio-content-${now.toISOString().slice(0, 10)}.json`;
