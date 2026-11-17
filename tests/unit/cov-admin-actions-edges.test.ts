import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Failure branches of the inbox and media server actions. DB, storage, Resend and audit are all stubbed. */
const m = vi.hoisted(() => ({
  q: vi.fn(),
  send: vi.fn(),
  audit: vi.fn(async () => {}),
  reval: vi.fn(),
  admin: { on: true },
  media: { addMedia: vi.fn(), listMedia: vi.fn(), mediaUsage: vi.fn(), removeMedia: vi.fn(), setMediaAlt: vi.fn(), storageConfigured: vi.fn(() => true) },
}));
vi.mock("next/cache", () => ({ revalidatePath: m.reval, revalidateTag: vi.fn(), unstable_cache: (f: unknown) => f }));
vi.mock("resend", () => ({ Resend: class { emails = { send: m.send }; } }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => m.q(...a) }));
vi.mock("~/lib/server/session", () => ({ requireAdmin: async () => { if (!m.admin.on) throw new Error("REDIRECT:/admin/login"); } }));
vi.mock("~/lib/server/auth", () => ({ audit: (...a: unknown[]) => (m.audit as (...x: unknown[]) => unknown)(...a) }));
vi.mock("~/lib/server/media", () => ({ afterPublish: async () => {}, ...m.media }));

import { cancelBooking, deleteMessage, setMessageArchived, setMessageRead } from "~/app/admin/inbox-actions";
import { deleteMedia, getMedia, getMediaUsage, registerMedia, updateMediaAlt } from "~/app/admin/media-actions";

const GENERIC = { ok: false, errors: ["Something went wrong."] };

beforeEach(() => {
  m.q.mockReset();
  m.send.mockReset();
  m.reval.mockReset();
  m.audit.mockReset().mockResolvedValue(undefined);
  Object.values(m.media).forEach((f) => f.mockReset());
  m.media.storageConfigured.mockReturnValue(true);
  m.admin.on = true;
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_EMAIL", "");
  vi.stubEnv("MY_EMAIL", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("inbox actions: success and failure", () => {
  it("setMessageRead builds the right SQL for read and unread and revalidates", async () => {
    m.q.mockResolvedValue({ rows: [] });
    expect(await setMessageRead(5, true)).toEqual({ ok: true });
    expect(String(m.q.mock.calls[0][0])).toContain("coalesce(read_at, now())");
    expect(m.q.mock.calls[0][1]).toEqual([5]);
    await setMessageRead(5, false);
    expect(String(m.q.mock.calls[1][0])).toContain("read_at = null");
    expect(m.reval).toHaveBeenCalledWith("/admin", "layout");
  });
  it("db failures become a message (Error) or a generic message (non-Error), never a throw", async () => {
    m.q.mockRejectedValueOnce(new Error("db down"));
    expect(await setMessageRead(1, true)).toEqual({ ok: false, errors: ["db down"] });
    m.q.mockRejectedValueOnce("weird string");
    expect(await setMessageRead(1, true)).toEqual(GENERIC);
    m.q.mockRejectedValueOnce(new Error("boom"));
    expect(await setMessageArchived(1, true)).toEqual({ ok: false, errors: ["boom"] });
    m.q.mockRejectedValueOnce(null);
    expect(await setMessageArchived(1, false)).toEqual(GENERIC);
    m.q.mockRejectedValueOnce(new Error("nope"));
    expect(await deleteMessage(1)).toEqual({ ok: false, errors: ["nope"] });
    m.q.mockRejectedValueOnce(undefined);
    expect(await deleteMessage(1)).toEqual(GENERIC);
    expect(m.reval).not.toHaveBeenCalled();
  });
  it("archive passes the flag as a parameter; delete audits", async () => {
    m.q.mockResolvedValue({ rows: [] });
    expect(await setMessageArchived(2, true)).toEqual({ ok: true });
    expect(m.q.mock.calls[0][1]).toEqual([2, true]);
    expect(await deleteMessage(2)).toEqual({ ok: true });
    expect(m.audit).toHaveBeenCalledWith("message_deleted", "admin", { id: 2 });
  });
  it("a failing audit on delete is reported, the row is already gone", async () => {
    m.q.mockResolvedValue({ rows: [] });
    m.audit.mockRejectedValueOnce(new Error("audit down"));
    expect(await deleteMessage(3)).toEqual({ ok: false, errors: ["audit down"] });
  });
  it("cancelBooking: unknown id, no email config, email ok, email error, db failure", async () => {
    m.q.mockResolvedValueOnce({ rows: [] });
    expect(await cancelBooking("nope", "")).toEqual({ ok: false, errors: ["That booking no longer exists."] });
    const row = { name: "Ann", email: "ann@example.com", starts_at: "2030-01-02T10:00:00Z", meeting_date: "2030-01-02", meeting_time: "10:00" };
    m.q.mockResolvedValueOnce({ rows: [row] });
    expect(await cancelBooking("b1", "")).toEqual({ ok: true, emailed: false });
    expect(m.send).not.toHaveBeenCalled();

    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_EMAIL", "me@example.com");
    m.send.mockResolvedValue({ error: null });
    m.q.mockResolvedValueOnce({ rows: [row] });
    expect(await cancelBooking("b1", "  Sorry!  ")).toEqual({ ok: true, emailed: true });
    const mail = m.send.mock.calls[0][0];
    expect(mail.to).toBe("ann@example.com");
    expect(mail.text).toContain("Wed, 02 Jan 2030 10:00:00 UTC");
    expect(mail.text).toContain("\n\nSorry!\n\n");

    m.send.mockResolvedValue({ error: { message: "bad" } });
    m.q.mockResolvedValueOnce({ rows: [{ ...row, starts_at: null }] });
    expect(await cancelBooking("b1", "")).toEqual({ ok: true, emailed: false });
    expect(m.send.mock.calls[1][0].text).toContain("2030-01-02 10:00");
    expect(m.send.mock.calls[1][0].text).not.toContain("\n\n\n\n");

    m.q.mockRejectedValueOnce(new Error("db"));
    expect(await cancelBooking("b1", "")).toEqual({ ok: false, errors: ["db"] });
  });
  it("cancelBooking replyTo prefers MY_EMAIL", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("RESEND_EMAIL", "me@example.com");
    vi.stubEnv("MY_EMAIL", "owner@example.com");
    m.send.mockResolvedValue({ error: null });
    m.q.mockResolvedValueOnce({ rows: [{ name: "A", email: "a@example.com", starts_at: null, meeting_date: "d", meeting_time: "t" }] });
    await cancelBooking("x", "");
    expect(m.send.mock.calls[0][0].replyTo).toBe("owner@example.com");
  });
});

describe("media actions: failure branches", () => {
  it("every action turns a thrown error into an error result", async () => {
    const e = new Error("storage down");
    m.media.listMedia.mockRejectedValue(e);
    expect(await getMedia()).toEqual({ ok: false, errors: ["storage down"] });
    m.media.addMedia.mockRejectedValue("str");
    expect(await registerMedia("https://x", 1, 1)).toEqual(GENERIC);
    m.media.setMediaAlt.mockRejectedValue(e);
    expect(await updateMediaAlt(1, "a")).toEqual({ ok: false, errors: ["storage down"] });
    m.media.mediaUsage.mockRejectedValue(e);
    expect(await getMediaUsage(1)).toEqual({ ok: false, errors: ["storage down"] });
    m.media.removeMedia.mockRejectedValue(e);
    expect(await deleteMedia(1)).toEqual({ ok: false, errors: ["storage down"] });
    m.media.removeMedia.mockRejectedValue(undefined);
    expect(await deleteMedia(1)).toEqual(GENERIC);
    expect(m.audit).not.toHaveBeenCalled();
  });
  it("registerMedia only passes sane integer dimensions", async () => {
    m.media.addMedia.mockResolvedValue({ pathname: "a", size: 1 });
    for (const [w, h, ew, eh] of [[10, 20, 10, 20], [0, -1, null, null], [1.5, NaN, null, null], [50_000, 49_999, null, 49_999], [null, Infinity, null, null], ["7" as never, 3, null, 3]] as const) {
      await registerMedia("u", w as never, h as never);
      expect(m.media.addMedia).toHaveBeenLastCalledWith("u", ew, eh);
    }
  });
  it("updateMediaAlt trims; getMedia reports configured; success paths revalidate/audit", async () => {
    m.media.setMediaAlt.mockResolvedValue(undefined);
    await updateMediaAlt(4, "  hi  ");
    expect(m.media.setMediaAlt).toHaveBeenCalledWith(4, "hi");
    m.media.listMedia.mockResolvedValue([]);
    m.media.storageConfigured.mockReturnValue(false);
    expect(await getMedia()).toEqual({ ok: true, items: [], configured: false });
    m.media.mediaUsage.mockResolvedValue([{ kind: "post", key: "a" }]);
    expect(await getMediaUsage(1)).toEqual({ ok: true, usedBy: [{ kind: "post", key: "a" }] });
    m.media.removeMedia.mockResolvedValue(undefined);
    expect(await deleteMedia(9)).toEqual({ ok: true });
    expect(m.audit).toHaveBeenCalledWith("media_delete", "admin", { id: 9 });
    expect(m.reval).toHaveBeenCalledWith("/admin/media");
  });
});
