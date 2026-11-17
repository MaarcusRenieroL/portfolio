import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  hasDb: true,
  cookie: undefined as string | undefined,
  valid: vi.fn(async (_v?: string) => true),
  redirect: vi.fn((to: string) => {
    throw new Error("REDIRECT:" + to);
  }),
  cookiesThrows: false,
}));
vi.mock("next/headers", () => ({
  cookies: async () => {
    if (m.cookiesThrows) throw new Error("outside request scope");
    return { get: () => (m.cookie ? { value: m.cookie } : undefined) };
  },
}));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("~/lib/server/auth", () => ({ SESSION_COOKIE: () => "sess", sessionValid: m.valid }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => m.hasDb, query: vi.fn() }));

import { isAdmin, requireAdmin } from "~/lib/server/session";

beforeEach(() => {
  vi.clearAllMocks();
  m.hasDb = true;
  m.cookie = "tok";
  m.cookiesThrows = false;
  m.valid.mockResolvedValue(true);
});

describe("isAdmin", () => {
  it("true for a valid session, passing the cookie value", async () => {
    expect(await isAdmin()).toBe(true);
    expect(m.valid).toHaveBeenCalledWith("tok");
  });
  it("false (and no DB lookup) without a database", async () => {
    m.hasDb = false;
    expect(await isAdmin()).toBe(false);
    expect(m.valid).not.toHaveBeenCalled();
  });
  it("false when the session is invalid or expired", async () => {
    m.valid.mockResolvedValue(false);
    expect(await isAdmin()).toBe(false);
  });
  it("passes undefined when there is no cookie", async () => {
    m.cookie = undefined;
    m.valid.mockResolvedValue(false);
    expect(await isAdmin()).toBe(false);
    expect(m.valid).toHaveBeenCalledWith(undefined);
  });
  it("fails closed when the DB check throws", async () => {
    m.valid.mockRejectedValue(new Error("db down"));
    expect(await isAdmin()).toBe(false);
  });
  it("fails closed when cookies() throws", async () => {
    m.cookiesThrows = true;
    expect(await isAdmin()).toBe(false);
  });
});

describe("requireAdmin", () => {
  it("returns quietly for an admin", async () => {
    await expect(requireAdmin()).resolves.toBeUndefined();
    expect(m.redirect).not.toHaveBeenCalled();
  });
  it("redirects to /admin/login otherwise", async () => {
    m.valid.mockResolvedValue(false);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });
});
