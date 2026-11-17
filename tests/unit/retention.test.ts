import { beforeEach, describe, expect, it, vi } from "vitest";

const q = vi.fn(async (..._a: unknown[]) => ({ rows: [] }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => q(...a) }));
vi.mock("../../src/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => q(...a) }));

import { pruneOldData, RETENTION } from "~/lib/server/retention";

const g = globalThis as unknown as { __pruneAt?: number };
beforeEach(() => {
  q.mockReset();
  q.mockResolvedValue({ rows: [] });
  delete g.__pruneAt;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("pruneOldData", () => {
  it("runs seven deletes using RETENTION (six retention + content version cap)", async () => {
    await pruneOldData(1_000_000);
    expect(q).toHaveBeenCalledTimes(7);
    const sql = q.mock.calls.map((c) => String(c[0])).join("\n");
    expect(sql).toContain(`${RETENTION.analyticsMonths} months`);
    expect(sql).toContain(`${RETENTION.messageMonths} months`);
    expect(sql).toMatch(/^delete/m);
    expect(sql).not.toMatch(/\bdrop\b|\btruncate\b/i);
  });
  it("throttles to once a day", async () => {
    await pruneOldData(1_000_000);
    await pruneOldData(1_000_000 + 86_399_000);
    expect(q).toHaveBeenCalledTimes(7);
    await pruneOldData(1_000_000 + 86_400_000);
    expect(q).toHaveBeenCalledTimes(14);
  });
  it("swallows errors, and a failed run doesn't count: the next call retries", async () => {
    q.mockRejectedValue(new Error("down"));
    await expect(pruneOldData(5)).resolves.toBe(false);
    expect(q).toHaveBeenCalledTimes(1);
    await pruneOldData(6);
    expect(q).toHaveBeenCalledTimes(2);
  });

  it("force runs even inside the daily window (the cron)", async () => {
    q.mockResolvedValue({ rows: [] });
    await pruneOldData(100);
    const n = q.mock.calls.length;
    await pruneOldData(200);
    expect(q.mock.calls.length).toBe(n);
    await pruneOldData(300, true);
    expect(q.mock.calls.length).toBeGreaterThan(n);
  });
});
