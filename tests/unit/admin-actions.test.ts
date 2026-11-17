import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { admin, dbq, send, media, writeSettings, readSavedSettings, audit, revalidatePath, revalidateTag } = vi.hoisted(() => ({
  admin: { on: true },
  dbq: vi.fn(),
  send: vi.fn(),
  media: { addMedia: vi.fn(), listMedia: vi.fn(), mediaUsage: vi.fn(), removeMedia: vi.fn(), setMediaAlt: vi.fn() },
  writeSettings: vi.fn(),
  readSavedSettings: vi.fn(async () => null as unknown),
  audit: vi.fn(async () => {}),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a), revalidateTag: (...a: unknown[]) => revalidateTag(...a), unstable_cache: (f: unknown) => f }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => dbq(...a) }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => admin.on, requireAdmin: async () => { if (!admin.on) throw new Error("REDIRECT"); } }));
vi.mock("~/lib/server/auth", () => ({ audit: (...a: unknown[]) => (audit as (...x: unknown[]) => unknown)(...a) }));
vi.mock("~/lib/server/media", () => ({ storageConfigured: () => true, afterPublish: async () => {}, ...media }));
vi.mock("~/lib/server/settings", () => ({ writeSettings: (...a: unknown[]) => writeSettings(...a), readSavedSettings: () => readSavedSettings() }));

import { deleteMedia, getMedia, getMediaUsage, registerMedia, updateMediaAlt } from "../../src/app/admin/media-actions";
import { saveSettings } from "../../src/app/admin/settings-actions";
import { cancelBooking, deleteMessage, setMessageArchived, setMessageRead } from "../../src/app/admin/inbox-actions";
import { defaultSettings } from "~/lib/settings";

beforeEach(() => {
  admin.on = true;
  for (const f of [dbq, send, writeSettings, audit, revalidatePath, revalidateTag, ...Object.values(media)]) f.mockReset();
  audit.mockResolvedValue(undefined);
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_EMAIL", "");
  vi.stubEnv("MY_EMAIL", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("requireAdmin is enforced everywhere", () => {
  it("every action rejects when not signed in and touches nothing", async () => {
    admin.on = false;
    const calls: Array<() => Promise<unknown>> = [
      () => getMedia(), () => registerMedia("r2:media/x-0123456789ab.png", 1, 1), () => updateMediaAlt(1, "a"), () => getMediaUsage(1), () => deleteMedia(1),
      () => saveSettings(defaultSettings()), () => setMessageRead(1, true), () => setMessageArchived(1, true), () => deleteMessage(1), () => cancelBooking("x", ""),
    ];
    for (const c of calls) await expect(c()).rejects.toThrow("REDIRECT");
    expect(dbq).not.toHaveBeenCalled();
    expect(writeSettings).not.toHaveBeenCalled();
    for (const f of Object.values(media)) expect(f).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});

describe("media actions", () => {
  it("clamps dimensions to positive integers under 50000", async () => {
    media.addMedia.mockResolvedValue({ pathname: "media/a.png", size: 5 });
    for (const [w, h, ew, eh] of [[100, 200, 100, 200], [-1, 0, null, null], [1.5, 50_000, null, null], [NaN, 49_999, null, 49_999]] as const) {
      media.addMedia.mockClear();
      await registerMedia("u", w, h);
      expect(media.addMedia).toHaveBeenCalledWith("u", ew, eh);
    }
    expect(audit).toHaveBeenCalledWith("media_upload", "admin", { pathname: "media/a.png", size: 5 });
  });
  it("returns errors instead of throwing", async () => {
    media.addMedia.mockRejectedValue(new Error("Not an upload reference."));
    expect(await registerMedia("https://evil", null, null)).toEqual({ ok: false, errors: ["Not an upload reference."] });
    media.listMedia.mockRejectedValue("str");
    expect(await getMedia()).toEqual({ ok: false, errors: ["Something went wrong."] });
    media.removeMedia.mockRejectedValue(new Error("storage down"));
    expect(await deleteMedia(1)).toMatchObject({ ok: false });
    expect(audit).not.toHaveBeenCalledWith("media_delete", expect.anything(), expect.anything());
  });
  it("trims alt, reports usage, deletes with audit", async () => {
    await updateMediaAlt(2, "  hi  ");
    expect(media.setMediaAlt).toHaveBeenCalledWith(2, "hi");
    media.mediaUsage.mockResolvedValue([{ kind: "project", key: "nyx" }]);
    expect(await getMediaUsage(2)).toEqual({ ok: true, usedBy: [{ kind: "project", key: "nyx" }] });
    expect(await deleteMedia(2)).toEqual({ ok: true });
    expect(audit).toHaveBeenCalledWith("media_delete", "admin", { id: 2 });
  });
});

describe("saveSettings", () => {
  it("returns validation errors and does not write", async () => {
    const r = await saveSettings({ ...defaultSettings(), photo: "https://evil.com/x.png" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/^photo:/);
    expect((await saveSettings(null)).ok).toBe(false);
    expect((await saveSettings({})).ok).toBe(false);
    expect(writeSettings).not.toHaveBeenCalled();
  });
  it("strips unknown keys, writes, audits, expires cache", async () => {
    expect(await saveSettings({ ...defaultSettings(), extra: "x" })).toEqual({ ok: true });
    expect(writeSettings.mock.calls[0][0]).not.toHaveProperty("extra");
    expect(revalidateTag).toHaveBeenCalledWith("content", { expire: 0 });
    expect(audit).toHaveBeenCalledWith("settings_saved", "admin");
  });
  it("stamps nowUpdated when the /now text changes, and only then", async () => {
    readSavedSettings.mockResolvedValueOnce({ now: { en: "", de: "" }, nowUpdated: "" });
    await saveSettings({ ...defaultSettings(), now: { en: "Building nyx.", de: "" } });
    expect(writeSettings.mock.calls[0][0].nowUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    readSavedSettings.mockResolvedValueOnce({ now: { en: "Building nyx.", de: "" }, nowUpdated: "2026-01-01" });
    await saveSettings({ ...defaultSettings(), now: { en: "Building nyx.", de: "" }, nowUpdated: "2026-01-01" });
    expect(writeSettings.mock.calls[1][0].nowUpdated).toBe("2026-01-01");
  });
  it("surfaces db failures", async () => {
    writeSettings.mockRejectedValue(new Error("db down"));
    expect(await saveSettings(defaultSettings())).toEqual({ ok: false, errors: ["db down"] });
    expect(audit).not.toHaveBeenCalled();
  });
});

describe("inbox actions", () => {
  it("use parameterised queries and handle db errors", async () => {
    dbq.mockResolvedValue({ rows: [] });
    expect(await setMessageRead(1, true)).toEqual({ ok: true });
    expect(await setMessageRead(1, false)).toEqual({ ok: true });
    expect(dbq.mock.calls[0][0]).toContain("coalesce(read_at, now())");
    expect(dbq.mock.calls[1][0]).toContain("= null");
    await setMessageArchived(3, true);
    expect(dbq.mock.calls[2][1]).toEqual([3, true]);
    await deleteMessage(4);
    expect(audit).toHaveBeenCalledWith("message_deleted", "admin", { id: 4 });
    dbq.mockRejectedValue(new Error("down"));
    expect(await deleteMessage(4)).toEqual({ ok: false, errors: ["down"] });
  });
  const row = { name: "Ada", email: "ada@x.dev", starts_at: "2030-01-02T10:00:00Z", meeting_date: "2030-01-02", meeting_time: "10:00" };
  it("cancelBooking: missing booking", async () => {
    dbq.mockResolvedValue({ rows: [] });
    expect(await cancelBooking("nope", "")).toEqual({ ok: false, errors: ["That booking no longer exists."] });
    expect(audit).not.toHaveBeenCalled();
  });
  it("cancelBooking: no email when Resend is not configured", async () => {
    dbq.mockResolvedValue({ rows: [row] });
    expect(await cancelBooking("b1", "sorry")).toEqual({ ok: true, emailed: false });
    expect(send).not.toHaveBeenCalled();
    vi.stubEnv("RESEND_API_KEY", "k");
    expect(await cancelBooking("b1", "sorry")).toEqual({ ok: true, emailed: false });
    expect(send).not.toHaveBeenCalled();
  });
  it("cancelBooking: emails the guest when configured, includes the note", async () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("RESEND_EMAIL", "from@x.dev");
    dbq.mockResolvedValue({ rows: [row] });
    send.mockResolvedValue({ error: null });
    expect(await cancelBooking("b1", " Feeling ill ")).toEqual({ ok: true, emailed: true });
    const m = send.mock.calls[0][0];
    expect(m.to).toBe("ada@x.dev");
    expect(m.text).toContain("Wed, 02 Jan 2030 10:00:00 UTC");
    expect(m.text).toContain("Feeling ill");
    send.mockResolvedValue({ error: { message: "bad" } });
    expect(await cancelBooking("b1", "")).toEqual({ ok: true, emailed: false });
  });
  it("cancelBooking: falls back to date/time strings for legacy rows and reports send throw", async () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("RESEND_EMAIL", "from@x.dev");
    dbq.mockResolvedValue({ rows: [{ ...row, starts_at: null }] });
    send.mockResolvedValue({ error: null });
    await cancelBooking("b1", "");
    expect(send.mock.calls[0][0].text).toContain("2030-01-02 10:00");
    send.mockRejectedValue(new Error("net"));
    const r = await cancelBooking("b1", "");
    expect(r).toEqual({ ok: false, errors: ["net"] });
  });
});
