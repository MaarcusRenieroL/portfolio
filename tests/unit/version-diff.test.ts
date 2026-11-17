import { describe, expect, it } from "vitest";
import { ago, changes, parseAt, show } from "~/lib/version-diff";

const fields = [
  { name: "title", label: "Title" },
  { name: "tags", label: "Tags" },
  { name: "body", label: "Body" },
];

describe("show", () => {
  it("formats values for a side-by-side compare", () => {
    expect(show(undefined)).toBe("");
    expect(show(null)).toBe("");
    expect(show("")).toBe("");
    expect(show(["a", "b"])).toBe("a, b");
    expect(show(3)).toBe("3");
    expect(show(false)).toBe("false");
    expect(show([{ note: "x" }])).toBe('[{"note":"x"}]');
    expect(show("a\n\n  b")).toBe("a b");
    expect(show("x".repeat(300), 10)).toBe(`${"x".repeat(9)}…`);
  });
});

describe("changes", () => {
  it("lists only fields that differ, with labels", () => {
    const r = changes(fields, { title: "A", tags: ["x"], body: "old" }, { title: "A", tags: ["x"], body: "new" }, null, null);
    expect(r).toEqual([{ name: "body", label: "Body", then: "old", now: "new" }]);
  });
  it("treats empty, missing and [] as the same", () => {
    expect(changes(fields, { title: "A", tags: [] }, { title: "A", body: "" }, null, {})).toEqual([]);
  });
  it("reports German as one entry, ignoring blank German fields", () => {
    expect(changes(fields, {}, {}, { title: "Hallo" }, { title: "Hallo", body: "" })).toEqual([]);
    const r = changes(fields, {}, {}, { title: "Hallo" }, { title: "Servus" });
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ name: "de", label: "German" });
  });
});

describe("time", () => {
  it("parses postgres timestamptz text and ISO", () => {
    expect(parseAt("2026-11-17 08:30:00.123456+00")).toBe(Date.parse("2026-11-17T08:30:00.123Z"));
    expect(parseAt("2026-11-17 14:00:00+05:30")).toBe(Date.parse("2026-11-17T08:30:00Z"));
    expect(parseAt("2026-11-17T08:30:00Z")).toBe(Date.parse("2026-11-17T08:30:00Z"));
    expect(Number.isNaN(parseAt("garbage"))).toBe(true);
  });
  it("says how long ago", () => {
    const now = Date.parse("2026-11-17T12:00:00Z");
    expect(ago("2026-11-17 11:59:30+00", now)).toBe("just now");
    expect(ago("2026-11-17 11:55:00+00", now)).toBe("5 minutes ago");
    expect(ago("2026-11-16 12:00:00+00", now)).toBe("yesterday");
    expect(ago("2026-11-03 12:00:00+00", now)).toBe("2 weeks ago");
    expect(ago("nope", now)).toBe("nope");
  });
});
