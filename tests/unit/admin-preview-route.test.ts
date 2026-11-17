import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ admin: true, dm: { enable: vi.fn(), disable: vi.fn() } }));
vi.mock("next/headers", () => ({ draftMode: async () => m.dm }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => m.admin }));

import { GET } from "~/app/api/admin/preview/route";

const get = (qs = "") => GET(new Request("http://site.test/api/admin/preview" + qs));
const loc = (r: Response) => r.headers.get("location");

beforeEach(() => {
  vi.clearAllMocks();
  m.admin = true;
});

describe("admin preview route", () => {
  it("404s for non-admins and does not enable draft mode", async () => {
    m.admin = false;
    const r = await get("?path=/projects");
    expect(r.status).toBe(404);
    expect(m.dm.enable).not.toHaveBeenCalled();
  });
  it("non-admin cannot use exit either", async () => {
    m.admin = false;
    expect((await get("?exit=1")).status).toBe(404);
    expect(m.dm.disable).not.toHaveBeenCalled();
  });
  it("enables draft mode and redirects to the path", async () => {
    const r = await get("?path=/projects?x=1");
    expect(m.dm.enable).toHaveBeenCalled();
    expect(loc(r)).toBe("http://site.test/projects?x=1");
  });
  it("defaults to / when no path", async () => {
    expect(loc(await get())).toBe("http://site.test/");
  });
  it("exit disables and goes to /admin", async () => {
    const r = await get("?exit=1&path=/x");
    expect(m.dm.disable).toHaveBeenCalled();
    expect(m.dm.enable).not.toHaveBeenCalled();
    expect(loc(r)).toBe("http://site.test/admin");
  });
  it.each([
    ["//evil.com"],
    ["https://evil.com"],
    ["/\\evil.com"],
    ["javascript:alert(1)"],
    ["evil.com"],
    ["/a b"],
    ["/x\nhttp://evil"],
    ["///evil.com"],
  ])("rejects unsafe path %j", async (p) => {
    const r = await get("?path=" + encodeURIComponent(p));
    const u = new URL(loc(r)!);
    expect(u.origin).toBe("http://site.test");
    expect(u.pathname).toBe("/");
  });
});
