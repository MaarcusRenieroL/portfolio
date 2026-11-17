import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Real SQL against the portfolio_test database (never the dev `portfolio` one): the CMS server actions,
 * the content store, the seed and the site settings. Only auth/session/cache/translate are stubbed.
 */
const HAS_DB = Boolean(process.env.DATABASE_URL?.endsWith("/portfolio"));
const TEST_URL = (process.env.DATABASE_URL ?? "").replace(/\/portfolio$/, "/portfolio_test");

const { admin, revalidateTag, audit, revoke, tr } = vi.hoisted(() => ({
  admin: { on: true },
  revalidateTag: vi.fn(),
  audit: vi.fn(async () => {}),
  revoke: vi.fn(async () => {}),
  tr: { configured: true, result: { ok: true, de: { title: "Hallo" } } as { ok: boolean; de?: unknown; message?: string } },
}));

vi.mock("next/cache", () => ({ revalidateTag: (...a: unknown[]) => revalidateTag(...a), revalidatePath: vi.fn(), unstable_cache: (f: unknown) => f }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
vi.mock("~/lib/server/session", () => ({
  isAdmin: async () => admin.on,
  requireAdmin: async () => {
    if (!admin.on) throw new Error("REDIRECT:/admin/login");
  },
}));
vi.mock("~/lib/server/auth", () => ({ audit: (...a: unknown[]) => (audit as (...x: unknown[]) => unknown)(...a), revokeAllSessions: () => revoke() }));
vi.mock("~/lib/server/translate", () => ({
  translateConfigured: () => tr.configured,
  extractTranslatable: (_f: unknown, d: unknown) => d,
  translateToGerman: async () => tr.result,
}));

let actions: typeof import("../../src/app/admin/actions");
let store: typeof import("~/lib/server/store");
let settings: typeof import("~/lib/server/settings");
let seed: typeof import("~/lib/server/seed");
let db: pg.Pool;

const post = (slug: string, extra: Record<string, unknown> = {}) => ({ slug, title: `T ${slug}`, description: "d", date: "2026-01-02", tags: ["a"], body: "hello world", ...extra });

beforeAll(async () => {
  if (!HAS_DB) return;
  if (!TEST_URL.endsWith("portfolio_test")) throw new Error("refusing to run against a non-test database");
  process.env.DATABASE_URL = TEST_URL;
  db = new pg.Pool({ connectionString: TEST_URL });
  // Every migration is idempotent ("if not exists"), so the whole schema is applied each run.
  for (const f of fs.readdirSync(path.join("db", "migrations")).filter((x) => x.endsWith(".sql")).sort()) await db.query(fs.readFileSync(path.join("db", "migrations", f), "utf8"));
  actions = await import("../../src/app/admin/actions");
  store = await import("~/lib/server/store");
  settings = await import("~/lib/server/settings");
  seed = await import("~/lib/server/seed");
});
afterAll(async () => {
  if (!HAS_DB) return;
  await db.end();
  await (await import("~/lib/server/db")).pool().end();
});
beforeEach(async () => {
  if (!HAS_DB) return;
  admin.on = true;
  tr.configured = true;
  tr.result = { ok: true, de: { title: "Hallo" } };
  revalidateTag.mockClear();
  audit.mockClear();
  revoke.mockClear();
  await db.query("truncate content_item");
  await db.query("truncate content_version");
  await db.query("truncate site_setting");
});

describe.skipIf(!HAS_DB)("saveItem", () => {
  it("rejects unknown kinds, invalid data and a key called new", async () => {
    expect(await actions.saveItem("nope", null, {}, null, false)).toEqual({ ok: false, errors: ["Unknown content type."] });
    const invalid = await actions.saveItem("post", null, post("x", { date: "yesterday" }), null, false);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors.join()).toMatch(/date/);
    const reserved = await actions.saveItem("post", null, post("new"), null, false);
    expect(reserved).toEqual({ ok: false, errors: [`slug can't be "new". Pick another.`] });
    expect(await store.listRows("post")).toHaveLength(0);
  });

  it("fills defaults, trims strings and drops blanks/NaN/null, then stores a draft only", async () => {
    const r = await actions.saveItem("post", null, { ...post("  hi  "), title: "  Title ", tags: [" a ", "", "b"], featured: undefined, junk: null, n: Number.NaN }, null, false);
    expect(r).toEqual({ ok: true, key: "hi" });
    const row = await store.getRow("post", "hi");
    expect(row?.draft).toMatchObject({ title: "Title", tags: ["a", "b"] });
    expect(row?.published).toBeNull();
    // no "tags" given: the per-kind default applies
    expect((await actions.saveItem("note", null, { ...post("n1"), tags: undefined }, null, false)).ok).toBe(true);
    expect((await store.getRow("note", "n1"))?.draft.tags).toEqual([]);
    // a non-object payload is "no input", which fails validation instead of throwing
    expect((await actions.saveItem("post", null, "oops", null, false)).ok).toBe(false);
  });

  it("refuses a duplicate key on create, and keeps the original untouched", async () => {
    await actions.saveItem("post", null, post("dup", { title: "first" }), null, false);
    const again = await actions.saveItem("post", null, post("dup", { title: "second" }), null, false);
    expect(again).toEqual({ ok: false, errors: [`An item with slug "dup" already exists.`] });
    expect((await store.getRow("post", "dup"))?.draft.title).toBe("first");
  });

  it("updates in place when the key is unchanged and keeps German text (only whitelisted fields)", async () => {
    await actions.saveItem("post", null, post("p"), { title: "Hallo", body: "Welt", tags: ["x"], evil: "no", description: "   " }, true);
    const row = await store.getRow("post", "p");
    expect(row?.draft_de).toEqual({ title: "Hallo", body: "Welt" });
    expect(row?.de_machine).toBe(true);
    await actions.saveItem("post", "p", post("p", { title: "edited" }), null, false);
    const after = await store.getRow("post", "p");
    expect(after?.draft.title).toBe("edited");
    expect(after?.draft_de).toBeNull();
    expect(after?.de_machine).toBe(false);
    // skillgroup name is a de field: arrays of strings pass, mixed arrays do not
    await actions.saveItem("skillgroup", null, { name: "G", items: ["a"] }, { name: ["a", 1] }, false);
    expect((await store.getRow("skillgroup", "G"))?.draft_de).toBeNull();
    await actions.saveItem("skillgroup", "G", { name: "G", items: ["a"] }, { name: ["a", "b"] }, false);
    expect((await store.getRow("skillgroup", "G"))?.draft_de).toEqual({ name: ["a", "b"] });
    await actions.saveItem("skillgroup", "G", { name: "G", items: ["a"] }, 5, false);
    expect((await store.getRow("skillgroup", "G"))?.draft_de).toBeNull();
  });

  it("renames a never-published item and keeps its position", async () => {
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("old"), null, false);
    const r = await actions.saveItem("post", "old", post("fresh"), null, false);
    expect(r).toEqual({ ok: true, key: "fresh" });
    expect(await store.getRow("post", "old")).toBeNull();
    expect((await store.listRows("post")).map((x) => [x.key, x.position])).toEqual([["a", 0], ["fresh", 1]]);
  });

  it("refuses to rename a published item (live links must not break)", async () => {
    await actions.saveItem("post", null, post("live"), null, false);
    await actions.publishItem("post", "live");
    const r = await actions.saveItem("post", "live", post("other"), null, false);
    expect(r).toEqual({ ok: false, errors: ["slug can not be changed after publishing. Create a new item instead."] });
    expect(await store.getRow("post", "other")).toBeNull();
    expect(await store.getRow("post", "live")).not.toBeNull();
  });

  it("rename: unknown original is Not found, an existing target is refused", async () => {
    expect(await actions.saveItem("post", "ghost", post("x"), null, false)).toEqual({ ok: false, errors: ["Not found."] });
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("b"), null, false);
    expect(await actions.saveItem("post", "a", post("b"), null, false)).toEqual({ ok: false, errors: [`An item with slug "b" already exists.`] });
  });

  it("rename: the never-published check and the update are one statement, so a publish in between wins", async () => {
    await actions.saveItem("post", null, post("race"), null, false);
    await store.publishRow("post", "race");
    expect(await store.renameRow("post", "race", "moved")).toBe(false);
    expect(await store.getRow("post", "race")).not.toBeNull();
  });

  it("maps a unique violation (23505) from the rename to a friendly error and rethrows others", async () => {
    // Different kind-scoped rows can not collide in the pre-check, so drive renameRow itself to throw.
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("b"), null, false);
    await expect(store.renameRow("post", "a", "b")).rejects.toMatchObject({ code: "23505" });
  });

  it("throws what is not a unique violation", async () => {
    vi.resetModules();
    vi.doMock("~/lib/server/store", async (orig) => {
      const real = await orig<typeof import("~/lib/server/store")>();
      return { ...real, renameRow: async () => { throw Object.assign(new Error("boom"), { code: "XX000" }); } };
    });
    const mod = await import("../../src/app/admin/actions");
    const s = await import("~/lib/server/store");
    await s.saveDraft("post", "a", post("a"), null);
    await expect(mod.saveItem("post", "a", post("b"), null, false)).rejects.toThrow("boom");
    vi.doMock("~/lib/server/store", async (orig) => {
      const real = await orig<typeof import("~/lib/server/store")>();
      return { ...real, renameRow: async () => { throw Object.assign(new Error("dup"), { code: "23505" }); } };
    });
    vi.resetModules();
    const mod2 = await import("../../src/app/admin/actions");
    expect(await mod2.saveItem("post", "a", post("b"), null, false)).toEqual({ ok: false, errors: [`An item with slug "b" already exists.`] });
    vi.doUnmock("~/lib/server/store");
    vi.resetModules();
  });

  it("rename: renameRow returning false (publish raced in) is reported as published", async () => {
    vi.resetModules();
    vi.doMock("~/lib/server/store", async (orig) => {
      const real = await orig<typeof import("~/lib/server/store")>();
      return { ...real, renameRow: async () => false };
    });
    const mod = await import("../../src/app/admin/actions");
    const s = await import("~/lib/server/store");
    await s.saveDraft("post", "z", post("z"), null);
    expect(await mod.saveItem("post", "z", post("y"), null, false)).toEqual({ ok: false, errors: ["slug can not be changed after publishing. Create a new item instead."] });
    vi.doUnmock("~/lib/server/store");
    vi.resetModules();
  });
});

describe.skipIf(!HAS_DB)("version history", () => {
  it("each publish that changes what is live records one version; repeats don't", async () => {
    await actions.saveItem("post", null, post("v"), { title: "Hallo" }, false);
    expect((await actions.getVersions("post", "v")) ).toEqual({ ok: true, versions: [] });
    await actions.publishItem("post", "v");
    await actions.publishItem("post", "v"); // same data: no new version
    await actions.saveItem("post", "v", post("v", { title: "v2" }), { title: "Hallo" }, false);
    await actions.publishItem("post", "v");
    const r = await actions.getVersions("post", "v");
    if (!r.ok) throw new Error("expected ok");
    expect(r.versions.map((x) => x.data.title)).toEqual(["v2", "T v"]);
    expect(r.versions[1].de).toEqual({ title: "Hallo" });
    expect(typeof r.versions[0].at).toBe("string");
  });
  it("a German-only change is a new version too", async () => {
    await actions.saveItem("post", null, post("g"), null, false);
    await actions.publishItem("post", "g");
    await actions.saveItem("post", "g", post("g"), { title: "Neu" }, false);
    await actions.publishItem("post", "g");
    const r = await actions.getVersions("post", "g");
    expect(r.ok && r.versions.length).toBe(2);
  });
  it("publishAll records versions per changed row, scoped by kind", async () => {
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("b"), null, false);
    await actions.saveItem("note", null, post("a"), null, false);
    await actions.publishAll("post");
    await actions.publishAll("post");
    expect((await db.query("select kind, key from content_version order by key")).rows).toEqual([{ kind: "post", key: "a" }, { kind: "post", key: "b" }]);
    expect(await actions.getVersions("note", "a")).toEqual({ ok: true, versions: [] });
  });
  it("needs admin, a known kind, and reports db errors", async () => {
    expect(await actions.getVersions("bad", "x")).toEqual({ ok: false, errors: ["Unknown content type."] });
    admin.on = false;
    await expect(actions.getVersions("post", "x")).rejects.toThrow("REDIRECT");
    admin.on = true;
    await db.query("alter table content_version rename to content_version_x");
    try {
      const r = await actions.getVersions("post", "x");
      expect(r.ok).toBe(false);
    } finally {
      await db.query("alter table content_version_x rename to content_version");
    }
  });
  it("keeps only the newest versions per item when pruning", async () => {
    const { pruneOldData } = await import("~/lib/server/retention");
    const { VERSIONS_KEPT } = store;
    for (let i = 0; i < VERSIONS_KEPT + 3; i++) await db.query("insert into content_version (kind, key, data) values ('post', 'many', $1)", [JSON.stringify({ n: i })]);
    await db.query("insert into content_version (kind, key, data) values ('post', 'one', '{}')");
    await pruneOldData(Date.now(), true);
    const left = await db.query<{ key: string; n: string; min: number }>("select key, count(*) n, min((data->>'n')::int) min from content_version group by key order by key");
    expect(left.rows).toEqual([{ key: "many", n: String(VERSIONS_KEPT), min: 3 }, { key: "one", n: "1", min: null }]);
  });
});

describe.skipIf(!HAS_DB)("publish, delete, move", () => {
  it("publishItem copies draft to live, revalidates, and 404s a missing row", async () => {
    await actions.saveItem("post", null, post("p"), { title: "Hallo" }, false);
    expect(await actions.publishItem("post", "p")).toEqual({ ok: true });
    const row = await store.getRow("post", "p");
    expect(row?.published).toEqual(row?.draft);
    expect(row?.published_de).toEqual({ title: "Hallo" });
    expect(row?.published_at).not.toBeNull();
    expect(revalidateTag).toHaveBeenCalledWith("content", { expire: 0 });
    revalidateTag.mockClear();
    expect(await actions.publishItem("post", "missing")).toEqual({ ok: false, errors: ["Not found."] });
    expect(await actions.publishItem("bad", "p")).toEqual({ ok: false, errors: ["Unknown content type."] });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("a later edit stays a draft until published again; pendingCount tracks it", async () => {
    await actions.saveItem("post", null, post("p"), null, false);
    expect(await store.pendingCount()).toBe(1);
    await actions.publishItem("post", "p");
    expect(await store.pendingCount()).toBe(0);
    await actions.saveItem("post", "p", post("p", { title: "v2" }), null, false);
    expect(await store.pendingCount()).toBe(1);
    expect((await store.getRow("post", "p"))?.published?.title).toBe("T p");
  });

  it("publishAll publishes every non-deleted row of that kind only", async () => {
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("b"), null, false);
    await actions.saveItem("note", null, post("n"), null, false);
    await actions.deleteItem("post", "b", true); // removed: hidden at once, nothing published
    await actions.saveItem("post", "b", post("b", { title: "changed" }), null, false);
    expect(await actions.publishAll("post")).toEqual({ ok: true });
    expect((await store.getRow("post", "a"))?.published).not.toBeNull();
    expect((await store.getRow("post", "b"))?.published).toBeNull(); // deleted row skipped by publishAll
    expect((await store.getRow("note", "n"))?.published).toBeNull();
    expect(await actions.publishAll("bad")).toEqual({ ok: false, errors: ["Unknown content type."] });
  });

  it("deleteItem soft-deletes without publishing; restoring brings back what was live, not the draft", async () => {
    await actions.saveItem("post", null, post("p"), null, false);
    await actions.publishItem("post", "p");
    await actions.saveItem("post", "p", post("p", { title: "unreviewed" }), null, false);
    expect(await actions.deleteItem("post", "p", true)).toEqual({ ok: true });
    let row = await store.getRow("post", "p");
    expect(row?.deleted).toBe(true);
    expect(row?.published?.title).toBe("T p");
    expect((await store.readAll("published")).find((r) => r.key === "p")?.deleted).toBe(true);
    await actions.deleteItem("post", "p", false);
    row = await store.getRow("post", "p");
    expect(row?.deleted).toBe(false);
    expect(row?.published?.title).toBe("T p");
    const v = await actions.getVersions("post", "p");
    expect(v.ok && v.versions.map((x) => x.data.title)).toEqual(["T p"]);
    expect(await actions.deleteItem("zzz", "p", true)).toEqual({ ok: false, errors: ["Unknown content type."] });
  });

  it("deleteItem on a key that does not exist is a harmless no-op", async () => {
    expect(await actions.deleteItem("post", "ghost", true)).toEqual({ ok: true });
    expect(await store.listRows("post")).toHaveLength(0);
  });

  it("moveItem swaps neighbours and ignores out-of-range or bad input", async () => {
    for (const k of ["a", "b", "c"]) await actions.saveItem("post", null, post(k), null, false);
    const order = async () => (await store.listRows("post")).map((r) => r.key);
    expect(await actions.moveItem("post", "c", -1)).toEqual({ ok: true });
    expect(await order()).toEqual(["a", "c", "b"]);
    await actions.moveItem("post", "a", -1);
    await actions.moveItem("post", "b", 1);
    await actions.moveItem("post", "ghost", 1);
    expect(await order()).toEqual(["a", "c", "b"]);
    expect(await actions.moveItem("post", "a", 0)).toEqual({ ok: false, errors: ["Bad request."] });
    expect(await actions.moveItem("post", "a", 2)).toEqual({ ok: false, errors: ["Bad request."] });
    expect(await actions.moveItem("zzz", "a", 1)).toEqual({ ok: false, errors: ["Bad request."] });
  });

  it("readAll hides never-published rows in published mode and shows drafts in draft mode", async () => {
    await actions.saveItem("post", null, post("a"), null, false);
    await actions.saveItem("post", null, post("b"), null, false);
    await actions.publishItem("post", "a");
    const pub = await store.readAll("published");
    expect(pub.find((r) => r.key === "a")?.deleted).toBe(false);
    expect(pub.find((r) => r.key === "b")?.deleted).toBe(true);
    expect((await store.readAll("draft")).every((r) => !r.deleted)).toBe(true);
  });

  it("isKind guards the kind list", () => {
    expect(store.isKind("post")).toBe(true);
    expect(store.isKind("__proto__")).toBe(false);
  });
});

describe.skipIf(!HAS_DB)("skills", () => {
  it("addSkill creates a group, appends, and rejects empties and case-insensitive duplicates", async () => {
    expect(await actions.addSkill("  ", "G")).toEqual({ ok: false, errors: ["Skill name cannot be empty."] });
    expect(await actions.addSkill("Go", " ")).toEqual({ ok: false, errors: ["Group name cannot be empty."] });
    expect(await actions.addSkill(" Go ", " Langs ")).toEqual({ ok: true, key: "Langs" });
    expect((await store.getRow("skillgroup", "Langs"))?.draft).toEqual({ name: "Langs", items: ["Go"] });
    expect(await actions.addSkill("Rust", "Langs")).toEqual({ ok: true, key: "Langs" });
    expect((await store.getRow("skillgroup", "Langs"))?.draft.items).toEqual(["Go", "Rust"]);
    expect(await actions.addSkill("GO", "Langs")).toEqual({ ok: false, errors: [`Skill "GO" already exists in "Langs".`] });
  });

  it("addSkill preserves the German draft and the machine flag", async () => {
    await actions.saveItem("skillgroup", null, { name: "L", items: ["a"] }, { name: "Sprachen" }, true);
    await actions.addSkill("b", "L");
    const row = await store.getRow("skillgroup", "L");
    expect(row?.draft_de).toEqual({ name: "Sprachen" });
    expect(row?.de_machine).toBe(true);
  });

  it("addSkill on a row whose draft has no items array starts the list over", async () => {
    await db.query("insert into content_item (kind, key, position, draft) values ('skillgroup', 'Broken', 0, '{\"name\":\"Broken\"}')");
    expect(await actions.addSkill("x", "Broken")).toEqual({ ok: true, key: "Broken" });
    expect((await store.getRow("skillgroup", "Broken"))?.draft.items).toEqual(["x"]);
  });

  it("removeSkillFromGroup removes case-insensitively, refuses the last skill and unknown groups", async () => {
    await actions.addSkill("Go", "L");
    await actions.addSkill("Rust", "L");
    expect(await actions.removeSkillFromGroup(" go ", "L")).toEqual({ ok: true, key: "L" });
    expect((await store.getRow("skillgroup", "L"))?.draft.items).toEqual(["Rust"]);
    const last = await actions.removeSkillFromGroup("Rust", "L");
    expect(last.ok).toBe(false);
    expect((await store.getRow("skillgroup", "L"))?.draft.items).toEqual(["Rust"]);
    expect(await actions.removeSkillFromGroup("x", "Nope")).toEqual({ ok: false, errors: ["Skill group not found."] });
    await db.query("insert into content_item (kind, key, position, draft) values ('skillgroup', 'NoItems', 5, '{}')");
    expect(await actions.removeSkillFromGroup("x", "NoItems")).toEqual({ ok: false, errors: ["Skill group not found."] });
  });
});

describe.skipIf(!HAS_DB)("import, translate, sign out, auth gate", () => {
  it("importFromFiles seeds published rows once and never overwrites edits", async () => {
    const first = await actions.importFromFiles();
    expect(first.ok && first.inserted > 0 && first.skipped === 0).toBe(true);
    const some = (await store.listRows("project"))[0];
    expect(some.published).not.toBeNull();
    await db.query("update content_item set draft = '{\"edited\":true}' where kind = $1 and key = $2", [some.kind, some.key]);
    const second = await actions.importFromFiles();
    expect(second.ok && second.inserted === 0 && second.skipped === (first.ok ? first.inserted : -1)).toBe(true);
    expect((await store.getRow("project", some.key))?.draft).toEqual({ edited: true });
    expect(await seed.seedFromFiles()).toMatchObject({ inserted: 0 });
  });

  it("translateItem: unknown kind, no API key, failure and success", async () => {
    expect(await actions.translateItem("bad", {})).toEqual({ ok: false, errors: ["Unknown content type."] });
    tr.configured = false;
    expect(await actions.translateItem("post", {})).toEqual({ ok: false, errors: ["GEMINI_API_KEY is not set, so translation is off."] });
    tr.configured = true;
    tr.result = { ok: false, message: "quota" };
    expect(await actions.translateItem("post", { title: "x" })).toEqual({ ok: false, errors: ["quota"] });
    tr.result = { ok: true, de: { title: "Hallo" } };
    expect(await actions.translateItem("post", { title: "x" })).toEqual({ ok: true, de: { title: "Hallo" } });
  });

  it("signOutEverywhere revokes, audits, then redirects to login", async () => {
    await expect(actions.signOutEverywhere()).rejects.toThrow("REDIRECT:/admin/login");
    expect(revoke).toHaveBeenCalledOnce();
    expect(audit).toHaveBeenCalledWith("sessions_revoked", "admin");
  });

  it("every action refuses a visitor before touching the database", async () => {
    admin.on = false;
    const calls = [
      () => actions.saveItem("post", null, post("x"), null, false),
      () => actions.publishItem("post", "x"),
      () => actions.publishAll("post"),
      () => actions.deleteItem("post", "x", true),
      () => actions.moveItem("post", "x", 1),
      () => actions.importFromFiles(),
      () => actions.translateItem("post", {}),
      () => actions.addSkill("a", "b"),
      () => actions.removeSkillFromGroup("a", "b"),
      () => actions.signOutEverywhere(),
    ];
    for (const c of calls) await expect(c()).rejects.toThrow("REDIRECT");
    expect(await store.listRows("post")).toHaveLength(0);
    expect(revoke).not.toHaveBeenCalled();
  });
});

describe.skipIf(!HAS_DB)("site settings", () => {
  it("readSavedSettings is null before anything is saved, then round-trips and upserts", async () => {
    expect(await settings.readSavedSettings()).toBeNull();
    const { defaultSettings } = await import("~/lib/settings");
    const v = { ...defaultSettings(), location: "Berlin", resume: "/media/cv.pdf" };
    await settings.writeSettings(v);
    expect(await settings.readSavedSettings()).toMatchObject({ location: "Berlin" });
    await settings.writeSettings({ ...v, location: "Paris" });
    expect((await db.query("select count(*)::int n from site_setting")).rows[0].n).toBe(1);
    expect((await settings.getSiteSettings()).location).toBe("Paris");
  });

  it("getSiteSettings returns defaults with an empty table, and photoSrc prefers the CMS photo", async () => {
    const s = await settings.getSiteSettings();
    expect(s.location.length).toBeGreaterThan(0);
    expect(settings.photoSrc({ ...s, photo: "/media/me.png" })).toBe("/media/me.png");
    const noPhoto = settings.photoSrc({ ...s, photo: "" });
    expect(noPhoto === "" || typeof noPhoto === "string").toBe(true);
    expect(noPhoto).toBe(fs.existsSync(path.join(process.cwd(), "public", "me.jpg")) ? "/me.jpg" : "");
  });
});
