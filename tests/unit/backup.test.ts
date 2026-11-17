import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ dbq: vi.fn(), admin: { on: true }, audit: vi.fn(async () => {}) }));
const tx = vi.hoisted(() => ({ log: [] as string[], released: 0 }));
vi.mock("~/lib/server/db", () => ({
  hasDb: () => true,
  pool: () => ({
    connect: async () => ({
      query: async (sql: string, p?: unknown[]) => {
        if (/^(begin|commit|rollback|savepoint|release)/i.test(sql)) {
          tx.log.push(sql.split(" ")[0].toLowerCase());
          return { rows: [] };
        }
        return h.dbq(sql, p);
      },
      release: () => void tx.released++,
    }),
  }),
}));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => h.admin.on }));
vi.mock("~/lib/server/auth", () => ({ audit: (...a: unknown[]) => (h.audit as (...x: unknown[]) => unknown)(...a) }));

import { backupFileName, buildBackup, BACKUP_FORMAT } from "~/lib/server/backup";
import { GET } from "../../src/app/api/admin/export/route";

const byTable = (map: Record<string, unknown[] | Error>) =>
  h.dbq.mockImplementation(async (sql: string) => {
    const t = /from (\w+)/.exec(sql)![1];
    const v = map[t] ?? [];
    if (v instanceof Error) throw v;
    return { rows: v };
  });

beforeEach(() => {
  tx.log = [];
  tx.released = 0;
  h.dbq.mockReset();
  h.audit.mockClear();
  h.admin.on = true;
});

describe("buildBackup", () => {
  it("collects content, history, settings and media with counts", async () => {
    byTable({ content_item: [{ kind: "post", key: "a" }], content_version: [{ id: 1 }, { id: 2 }], site_setting: [{ key: "site" }], media: [] });
    const b = await buildBackup(new Date("2026-11-17T10:00:00Z"));
    expect(b.format).toBe(BACKUP_FORMAT);
    expect(b.version).toBe(1);
    expect(b.exportedAt).toBe("2026-11-17T10:00:00.000Z");
    expect(b.counts).toEqual({ content: 1, versions: 2, settings: 1, media: 0 });
    // One read-only snapshot on one connection, always given back.
    expect(tx.log[0]).toBe("begin");
    expect(tx.log.at(-1)).toBe("commit");
    expect(tx.released).toBe(1);
  });
  it("never reads personal data or secrets", async () => {
    byTable({});
    await buildBackup();
    const sql = h.dbq.mock.calls.map((c) => String(c[0])).join("\n");
    for (const t of ["contact_message", "meeting_booking", "site_event", "audit_log", "admin_", "_migration"]) expect(sql).not.toContain(t);
  });
  it("a table that doesn't exist yet (older database) is empty, any other error fails", async () => {
    byTable({ content_version: Object.assign(new Error("relation does not exist"), { code: "42P01" }) });
    expect((await buildBackup()).counts.versions).toBe(0);
    byTable({ content_item: Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" }) });
    await expect(buildBackup()).rejects.toThrow("connection refused");
    expect(tx.log).toContain("rollback");
    expect(tx.released).toBe(2);
  });
  it("names the file by date", () => {
    expect(backupFileName(new Date("2026-01-02T23:59:00Z"))).toBe("portfolio-content-2026-01-02.json");
  });
});

describe("GET /api/admin/export", () => {
  it("404s without an admin session and reads nothing", async () => {
    h.admin.on = false;
    const r = await GET();
    expect(r.status).toBe(404);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(h.dbq).not.toHaveBeenCalled();
    expect(h.audit).not.toHaveBeenCalled();
  });
  it("downloads the backup as a never-cached attachment and audits it", async () => {
    byTable({ content_item: [{ kind: "post", key: "a" }] });
    const r = await GET();
    expect(r.status).toBe(200);
    expect(r.headers.get("content-disposition")).toMatch(/^attachment; filename="portfolio-content-\d{4}-\d{2}-\d{2}\.json"$/);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const body = await r.json();
    expect(body.content).toEqual([{ kind: "post", key: "a" }]);
    expect(h.audit).toHaveBeenCalledWith("content_exported", "admin", { content: 1, versions: 0, settings: 0, media: 0 });
  });
  it("answers 500 without details when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    byTable({ content_item: new Error("password authentication failed for user x") });
    const r = await GET();
    expect(r.status).toBe(500);
    expect(await r.text()).not.toContain("password");
  });
});
