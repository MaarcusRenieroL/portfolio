import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getContributions } from "~/lib/server/github";

let fetchMock: ReturnType<typeof vi.fn>;
const cal = (weeks: unknown[]) => ({ ok: true, json: async () => ({ data: { user: { contributionsCollection: { contributionCalendar: { totalContributions: 7, weeks } } } } }) });

beforeEach(() => {
  process.env.GITHUB_TOKEN = "tok";
  process.env.GITHUB_USERNAME = "me";
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_USERNAME;
});

describe("getContributions", () => {
  it("null without token or username, no network", async () => {
    delete process.env.GITHUB_TOKEN;
    expect(await getContributions()).toBeNull();
    process.env.GITHUB_TOKEN = "t";
    delete process.env.GITHUB_USERNAME;
    expect(await getContributions()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("maps weeks, levels and counts; sends auth and login", async () => {
    fetchMock.mockResolvedValue(
      cal([
        { contributionDays: [{ date: "2026-01-01", contributionCount: 0, contributionLevel: "NONE" }, { date: "2026-01-02", contributionCount: 9, contributionLevel: "FOURTH_QUARTILE" }] },
        { contributionDays: [{ date: "2026-01-03", contributionCount: 2, contributionLevel: "SECOND_QUARTILE" }] },
      ]),
    );
    const r = await getContributions();
    expect(r).toEqual({
      total: 7,
      weeks: [
        [{ date: "2026-01-01", count: 0, level: 0 }, { date: "2026-01-02", count: 9, level: 4 }],
        [{ date: "2026-01-03", count: 2, level: 2 }],
      ],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/graphql");
    expect(init.headers.Authorization).toBe("bearer tok");
    expect(JSON.parse(init.body).variables).toEqual({ login: "me" });
  });
  it("unknown level falls back to 0", async () => {
    fetchMock.mockResolvedValue(cal([{ contributionDays: [{ date: "d", contributionCount: 1, contributionLevel: "WEIRD" }] }]));
    expect((await getContributions())!.weeks[0][0].level).toBe(0);
  });
  it("null on non-ok, missing user, empty weeks, bad JSON, network error", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    expect(await getContributions()).toBeNull();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: null } }) });
    expect(await getContributions()).toBeNull();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ errors: [{ message: "x" }] }) });
    expect(await getContributions()).toBeNull();
    fetchMock.mockResolvedValueOnce(cal([]));
    expect(await getContributions()).toBeNull();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => { throw new Error("bad json"); } });
    expect(await getContributions()).toBeNull();
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await getContributions()).toBeNull();
  });
});
