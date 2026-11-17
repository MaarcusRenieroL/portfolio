import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Remaining branches of the CMS server actions (save cleaning, publish warnings, history errors, skill removal).
 * The content store, media and auth are stubbed: no database is touched. Nothing here concerns content export.
 */
const m = vi.hoisted(() => ({
  store: {
    getRow: vi.fn(),
    listVersions: vi.fn(),
    publishRow: vi.fn(async () => {}),
    publishKind: vi.fn(async () => {}),
    saveDraft: vi.fn(async (..._a: unknown[]) => {}),
    renameRow: vi.fn(),
    setDeleted: vi.fn(async () => {}),
    move: vi.fn(async () => {}),
  },
  warning: undefined as string | undefined,
  tag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag: (...a: unknown[]) => m.tag(...a), revalidatePath: vi.fn(), unstable_cache: (f: unknown) => f }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => true, requireAdmin: async () => {} }));
vi.mock("~/lib/server/auth", () => ({ audit: vi.fn(async () => {}), revokeAllSessions: vi.fn(async () => {}) }));
vi.mock("~/lib/server/media", () => ({ afterPublish: async () => m.warning }));
vi.mock("~/lib/server/seed", () => ({ seedFromFiles: vi.fn() }));
vi.mock("~/lib/server/store", async (orig) => ({ ...(await orig<typeof import("~/lib/server/store")>()), ...m.store }));

import { publishAll, publishItem, getVersions, removeSkillFromGroup, saveItem } from "~/app/admin/actions";

const post = (o: Record<string, unknown> = {}) => ({ slug: "hello", title: "Hello", description: "d", date: "2026-01-02", body: "text", ...o });

beforeEach(() => {
  for (const f of Object.values(m.store)) f.mockReset();
  m.store.publishRow.mockResolvedValue(undefined);
  m.store.publishKind.mockResolvedValue(undefined);
  m.store.saveDraft.mockResolvedValue(undefined);
  m.store.setDeleted.mockResolvedValue(undefined);
  m.warning = undefined;
  m.tag.mockClear();
});

describe("saveItem input cleaning", () => {
  it("keeps non-string array members and non-string scalars as-is (numbers, booleans) and trims strings", async () => {
    m.store.getRow.mockResolvedValue(null);
    const r = await saveItem("post", null, post({ title: "  Padded  ", featured: true, tags: ["  a ", "", "b"] }), null, false);
    expect(r).toEqual({ ok: true, key: "hello" });
    const saved = m.store.saveDraft.mock.calls[0] as unknown[];
    expect(saved[2]).toMatchObject({ title: "Padded", featured: true, tags: ["a", "b"] });
  });

  it("a non-string inside a string array is not silently turned into text: validation rejects it", async () => {
    const r = await saveItem("post", null, post({ tags: [1, "a"] }), null, false);
    expect(r.ok).toBe(false);
    expect(m.store.saveDraft).not.toHaveBeenCalled();
  });

  it("drops empty-string, null, undefined and NaN fields so optional ones validate", async () => {
    m.store.getRow.mockResolvedValue(null);
    const r = await saveItem("post", null, post({ description: "d", featured: undefined, readingTime: NaN, extra: null, nothing: "" }), null, false);
    expect(r.ok).toBe(true);
    expect(m.store.saveDraft.mock.calls[0][2]).not.toHaveProperty("nothing");
  });

  it("a non-object payload cannot create anything", async () => {
    for (const raw of ["str", 5, null, undefined, [1, 2]]) {
      const r = await saveItem("post", null, raw, null, false);
      expect(r.ok).toBe(false);
    }
    expect(m.store.saveDraft).not.toHaveBeenCalled();
  });
});

describe("publish warnings", () => {
  it("publishItem and publishAll pass the follow-up warning through, and omit it when there is none", async () => {
    m.store.getRow.mockResolvedValue({ key: "x" });
    m.warning = "Files didn't sync.";
    expect(await publishItem("post", "x")).toEqual({ ok: true, warning: "Files didn't sync." });
    expect(await publishAll("post")).toEqual({ ok: true, warning: "Files didn't sync." });
    m.warning = undefined;
    expect(await publishItem("post", "x")).toEqual({ ok: true });
    expect(await publishAll("post")).toEqual({ ok: true });
    expect(m.tag).toHaveBeenCalledTimes(4);
  });

  it("an unknown kind or missing row publishes nothing", async () => {
    expect(await publishItem("bogus", "x")).toEqual({ ok: false, errors: ["Unknown content type."] });
    expect(await publishAll("bogus")).toEqual({ ok: false, errors: ["Unknown content type."] });
    m.store.getRow.mockResolvedValue(null);
    expect(await publishItem("post", "ghost")).toEqual({ ok: false, errors: ["Not found."] });
    expect(m.store.publishRow).not.toHaveBeenCalled();
    expect(m.store.publishKind).not.toHaveBeenCalled();
  });
});

describe("getVersions failures", () => {
  it("a non-Error rejection gets the generic message; an Error keeps its own", async () => {
    m.store.listVersions.mockRejectedValueOnce("x");
    expect(await getVersions("post", "a")).toEqual({ ok: false, errors: ["Couldn't load the history."] });
    m.store.listVersions.mockRejectedValueOnce(new Error("relation missing"));
    expect(await getVersions("post", "a")).toEqual({ ok: false, errors: ["relation missing"] });
    m.store.listVersions.mockResolvedValueOnce([]);
    expect(await getVersions("post", "a")).toEqual({ ok: true, versions: [] });
    expect(await getVersions("nope", "a")).toEqual({ ok: false, errors: ["Unknown content type."] });
  });
});

describe("removeSkillFromGroup", () => {
  const group = (o: Record<string, unknown>) => ({ draft: { name: "Langs", items: ["Java", "Go"] }, published: null, draft_de: null, de_machine: null, ...o });

  it("keeps the German draft and treats a null de_machine as false", async () => {
    m.store.getRow.mockImplementation(async (_k: string, key: string) => (key === "Langs" ? group({ draft_de: { name: "Sprachen" } }) : null));
    const r = await removeSkillFromGroup("  go ", "Langs");
    expect(r).toEqual({ ok: true, key: "Langs" });
    const call = m.store.saveDraft.mock.calls[0] as unknown[];
    expect(call[2]).toMatchObject({ name: "Langs", items: ["Java"] });
    expect(call[3]).toEqual({ name: "Sprachen" });
    expect(call[4]).toBe(false);
  });

  it("carries a machine-translated flag through", async () => {
    m.store.getRow.mockImplementation(async (_k: string, key: string) => (key === "Langs" ? group({ de_machine: true }) : null));
    await removeSkillFromGroup("Go", "Langs");
    expect((m.store.saveDraft.mock.calls[0] as unknown[])[4]).toBe(true);
  });

  it("refuses to empty a group, and reports a missing or malformed group", async () => {
    m.store.getRow.mockResolvedValueOnce(group({ draft: { name: "Langs", items: ["Go"] } }));
    expect((await removeSkillFromGroup("Go", "Langs")).ok).toBe(false);
    m.store.getRow.mockResolvedValueOnce(null);
    expect(await removeSkillFromGroup("Go", "Ghost")).toEqual({ ok: false, errors: ["Skill group not found."] });
    m.store.getRow.mockResolvedValueOnce(group({ draft: null }));
    expect(await removeSkillFromGroup("Go", "Langs")).toEqual({ ok: false, errors: ["Skill group not found."] });
    m.store.getRow.mockResolvedValueOnce(group({ draft: { items: "not-array" } }));
    expect(await removeSkillFromGroup("Go", "Langs")).toEqual({ ok: false, errors: ["Skill group not found."] });
    expect(m.store.saveDraft).not.toHaveBeenCalled();
  });
});
