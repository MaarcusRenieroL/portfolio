import { FILE_TYPES, MAX_UPLOAD_BYTES, mediaSrc, type MediaItem } from "~/lib/media";
import { audit } from "./auth";
import { pool, query } from "./db";
import { copyToPublic, deleteObject, headPrivate, isR2Ref, listPublic, R2_PREFIX, r2Configured } from "./r2";

/** Uploads need the R2 buckets set up. */
export const storageConfigured = () => r2Configured();

const COLS = "id::int as id, url, pathname, content_type, size, width, height, alt, created_at::text";

export async function listMedia(): Promise<MediaItem[]> {
  return (await query<MediaItem>(`select ${COLS} from media order by created_at desc, id desc`)).rows;
}

/**
 * Record a finished upload. The client only says which `r2:` reference; size and type come from R2 itself,
 * so a forged request can't register a file that isn't there.
 */
export async function addMedia(url: string, width: number | null, height: number | null): Promise<MediaItem> {
  if (!isR2Ref(url)) throw new Error("Not an upload reference.");
  if (!r2Configured()) throw new Error("R2 isn't configured.");
  const pathname = url.slice(R2_PREFIX.length);
  if (!/^media\/[a-z0-9-]+\.[a-z0-9]+$/.test(pathname)) throw new Error("Bad file name.");
  const h = await headPrivate(pathname);
  if (!h) throw new Error("That upload isn't there.");
  // The signed upload URL can't pin type or size, so a file that breaks the rules is deleted here.
  if (!(FILE_TYPES as readonly string[]).includes(h.type) || !(h.size > 0 && h.size <= MAX_UPLOAD_BYTES)) {
    await deleteObject("private", pathname);
    throw new Error("That file type or size isn't allowed.");
  }
  const file = { url, pathname, contentType: h.type, size: h.size };
  const r = await query<MediaItem>(
    `insert into media (url, pathname, content_type, size, width, height)
       values ($1, $2, $3, $4, $5, $6)
     on conflict (url) do update set width = coalesce(excluded.width, media.width), height = coalesce(excluded.height, media.height)
     returning ${COLS}`,
    [file.url, file.pathname, file.contentType, file.size, width, height],
  );
  return r.rows[0];
}

export async function setMediaAlt(id: number, alt: string): Promise<void> {
  await query("update media set alt = $2 where id = $1", [id, alt.slice(0, 300)]);
}

export async function removeMedia(id: number): Promise<void> {
  const row = (await query<{ url: string }>("select url from media where id = $1", [id])).rows[0];
  if (!row) return;
  // An old record that isn't in R2 has no file here to delete; only the record goes.
  if (isR2Ref(row.url)) {
    const key = row.url.slice(R2_PREFIX.length);
    await deleteObject("public", key);
    await deleteObject("private", key);
  }
  await query("delete from media where id = $1", [id]);
}

/** Content rows whose draft or published copy uses this file, so deleting it doesn't silently break a page. */
export async function mediaUsage(id: number): Promise<{ kind: string; key: string }[]> {
  const row = (await query<{ pathname: string }>("select pathname from media where id = $1", [id])).rows[0];
  if (!row) return [];
  const r = await query<{ kind: string; key: string }>(
    `select kind, key from content_item
      where not deleted and (position($1 in draft::text || coalesce(draft_de::text, '')) > 0
                         or position($1 in coalesce(published::text, '') || coalesce(published_de::text, '')) > 0)
      union all
     select 'settings' as kind, 'Site settings' as key from site_setting where position($1 in value::text) > 0
      order by kind, key`,
    [mediaSrc(row)],
  );
  return r.rows;
}

/** The stored file behind `/media/<name>`, and whether live content (published items or site settings) uses it. */
export async function mediaForServing(name: string): Promise<{ url: string; content_type: string; published: boolean } | null> {
  const r = await query<{ url: string; content_type: string; published: boolean }>(
    `select m.url, m.content_type,
            (exists (select 1 from content_item c
                      where not c.deleted and c.published is not null
                        and (c.published::text || coalesce(c.published_de::text, '')) ~ $2)
             or exists (select 1 from site_setting s where s.value::text ~ $2)) as published
       from media m where m.pathname = $1`,
    // The exact path, not a prefix: "/media/a.png" must not count as used because "/media/a.png2" is.
    // Trailing punctuation after the name still counts, as it does for the public-bucket sync.
    [`media/${name}`, `/media/${name.replace(/[.]/g, "\\.")}[._-]*($|[^A-Za-z0-9_.-])`],
  );
  return r.rows[0] ?? null;
}

/** Text of everything live (published items and site settings), to find which library files it uses. */
const LIVE_TEXT = `select coalesce(published::text, '') || coalesce(published_de::text, '') t from content_item where not deleted and published is not null
   union all select value::text from site_setting`;

/** `media/<name>` keys mentioned in some text. Trailing dots, dashes or underscores are punctuation, not the name (names end in an extension). */
export function mediaKeysIn(texts: string[]): Set<string> {
  const keys = new Set<string>();
  for (const t of texts) for (const m of t.matchAll(/\/media\/([\w.-]+)/g)) keys.add(`media/${m[1].replace(/[._-]+$/, "")}`);
  return keys;
}

/** File names (`media/<name>`) that live content uses: published items and site settings. */
export async function publishedMediaKeys(): Promise<Set<string>> {
  return mediaKeysIn((await query<{ t: string }>(LIVE_TEXT)).rows.map((r) => r.t));
}

/** Library files stored in R2, by pathname. */
export async function r2MediaNames(): Promise<Set<string>> {
  return new Set((await query<{ pathname: string }>("select pathname from media where url like 'r2:%'")).rows.map((r) => r.pathname));
}

export type SyncResult = { copied: string[]; removed: string[]; failed: string[] };

/** Any constant: serializes syncs across server instances. */
const SYNC_LOCK = 7_340_551;

/**
 * Make the public bucket match what is live: remove files nothing live uses any more (the private copy stays
 * in the library), then copy in files that live content now uses. Runs after every publish and settings save;
 * a no-op without R2.
 *
 * One sync at a time (a transaction-scoped advisory lock, which also works through Neon's pooler): two syncs
 * overlapping could otherwise delete a file the other had just published. What is live is read after the lock,
 * so it includes every publish that finished before. A failed file is reported and the rest still run; the
 * next sync retries it.
 */
export async function syncPublicMedia(): Promise<SyncResult> {
  if (!r2Configured()) return { copied: [], removed: [], failed: [] };
  const client = await pool().connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1)", [SYNC_LOCK]);
    const [texts, stored, inPublic] = await Promise.all([
      client.query<{ t: string }>(LIVE_TEXT),
      client.query<{ pathname: string; content_type: string }>("select pathname, content_type from media where url like 'r2:%'"),
      listPublic("media/"),
    ]);
    const live = mediaKeysIn(texts.rows.map((r) => r.t));
    const types = new Map(stored.rows.map((r) => [r.pathname, r.content_type]));
    const there = new Set(inPublic);
    const out: SyncResult = { copied: [], removed: [], failed: [] };
    for (const k of inPublic.filter((x) => !live.has(x))) {
      try {
        await deleteObject("public", k);
        out.removed.push(k);
      } catch {
        out.failed.push(k);
      }
    }
    for (const k of [...live].filter((x) => types.has(x) && !there.has(x))) {
      try {
        // The type recorded when the upload was checked, not whatever the private object says now.
        await copyToPublic(k, types.get(k)!);
        out.copied.push(k);
      } catch {
        out.failed.push(k);
      }
    }
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/**
 * After a publish or settings save: put the files live content uses on the public assets domain and take down
 * the rest. The publish already happened, so a storage problem doesn't undo it. Returns a message for the admin
 * when some files didn't sync (the next publish retries them), else null.
 */
export async function afterPublish(): Promise<string | null> {
  try {
    const r = await syncPublicMedia();
    if (r.copied.length || r.removed.length || r.failed.length) await audit(r.failed.length ? "media_sync_failed" : "media_synced", "admin", r);
    return r.failed.length ? `Published, but ${r.failed.length} file(s) didn't update on the assets domain: ${r.failed.join(", ")}. Publishing again retries.` : null;
  } catch (e) {
    console.error("[media] public sync failed:", e instanceof Error ? e.message : e);
    return "Published, but the files on the assets domain couldn't be updated. Publishing again retries.";
  }
}
