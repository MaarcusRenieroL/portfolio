import { describe, expect, it } from "vitest";
import { readingStats, slugify } from "~/lib/writing";

describe("writer helpers", () => {
  it("turns a title into a URL slug", () => {
    expect(slugify("Why I rebuilt my site (again)!")).toBe("why-i-rebuilt-my-site-again");
    expect(slugify("Ärger über Umlaute")).toBe("arger-uber-umlaute");
    expect(slugify("  --Spaces & symbols--  ")).toBe("spaces-symbols");
    expect(slugify("")).toBe("");
  });

  it("counts words without code, images or link URLs", () => {
    const md = "Intro text here.\n\n```ts\nconst lots = of + code;\n```\n\n![alt](/media/x.png) A [link](https://example.com/long/path).";
    expect(readingStats(md).words).toBe(5);
    expect(readingStats("word ".repeat(660)).minutes).toBe(3);
    expect(readingStats("").minutes).toBe(1);
  });
});
