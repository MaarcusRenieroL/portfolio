import { describe, expect, it, vi } from "vitest";

/** Module-load-time branches: roles on a dark logo tile, and the local portrait fallback. No DB, no network. */
vi.mock("next/cache", () => ({ unstable_cache: (f: unknown) => f }));
vi.mock("~/lib/server/db", () => ({ hasDb: () => false, query: vi.fn(), pool: vi.fn() }));
vi.mock("node:fs", async (orig) => ({ ...(await orig<typeof import("node:fs")>()), existsSync: () => true }));
vi.mock("~/lib/schema", async (orig) => {
  const real = await orig<typeof import("~/lib/schema")>();
  // Mark the first role as light artwork so it needs the dark tile.
  let first = true;
  return {
    ...real,
    check: (kind: string, key: string, schema: never, value: Record<string, unknown>) => {
      const out = real.check(kind, key, schema, value) as Record<string, unknown>;
      if (kind === "role" && first) {
        first = false;
        return { ...out, logoOn: "dark" };
      }
      return out;
    },
  };
});

import { ROLES, MEDIA } from "~/lib/content";
import { photoSrc } from "~/lib/server/settings";
import { defaultSettings } from "~/lib/settings";

describe("content.logoClass", () => {
  it("returns the dark tile class only for roles marked logoOn: dark", async () => {
    expect(ROLES[0].logoOn).toBe("dark");
    expect(MEDIA.logoClass(ROLES[0].org)).toBe("logo logo-dark");
    expect(MEDIA.logoClass(ROLES[1].org)).toBe("logo");
    expect(MEDIA.logoClass("Unknown Org")).toBe("logo");
  });
});

describe("photoSrc when public/me.jpg exists", () => {
  it("prefers the CMS photo, else the local portrait", () => {
    expect(photoSrc({ ...defaultSettings(), photo: "" })).toBe(MEDIA.photo);
    expect(photoSrc({ ...defaultSettings(), photo: "/media/p.png" })).toBe("/media/p.png");
  });
});
