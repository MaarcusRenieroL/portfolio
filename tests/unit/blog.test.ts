import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let root: string;
let blog: typeof import("~/lib/data/blog");
let missing: typeof import("~/lib/data/blog");

const write = (name: string, body: string) => fs.writeFileSync(path.join(root, "src/content/blog", name), body);
const post = (fm: string, body = "Body text here.") => `---\n${fm}\n---\n${body}`;

beforeAll(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-"));
  fs.mkdirSync(path.join(root, "src/content/blog"), { recursive: true });
  fs.writeFileSync(path.join(root, "secret.md"), post('title: "SECRET"'));

  write("old.md", post('title: "Old"\ndescription: "d"\ndate: "2025-01-01"\ntags:\n  - "a"\n  - b\nfeatured: true'));
  write("new.md", post('title: Newer\ndate: "2026-06-01"\ntags: [a, "c", ]'));
  write("hidden.md", post('title: "Hidden"\npublished: false'));
  write("_draft.md", post('title: "Draft"'));
  write("notes.txt", "x");
  write("nofm.md", "# Just text\n\nno frontmatter");
  write("baddate.md", post('title: "Bad"\ndate: "not a date"'));
  write("crlf.md", "---\r\ntitle: \"CRLF\"\r\n---\r\nBody\r\n");
  write("long.md", post('title: "Long"', "word ".repeat(1000)));

  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.resetModules();
  blog = await import("~/lib/data/blog");

  vi.spyOn(process, "cwd").mockReturnValue(path.join(root, "nonexistent"));
  vi.resetModules();
  missing = await import("~/lib/data/blog");
});
afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("getPostSlugs", () => {
  it("lists .md files, skipping _-prefixed and non-md", () => {
    expect(blog.getPostSlugs().sort()).toEqual(["baddate", "crlf", "hidden", "long", "new", "nofm", "old"]);
  });
  it("missing directory -> []", () => {
    expect(missing.getPostSlugs()).toEqual([]);
    expect(missing.getPosts()).toEqual([]);
  });
});

describe("getPost / frontmatter", () => {
  it("parses block list, scalars, booleans", () => {
    expect(blog.getPost("old")).toMatchObject({
      slug: "old", title: "Old", description: "d", date: "2025-01-01", tags: ["a", "b"], featured: true, readingTime: "1 min read",
    });
  });
  it("parses inline list, dropping empty items", () => {
    expect(blog.getPost("new")?.tags).toEqual(["a", "c"]);
  });
  it("unquoted values and missing fields fall back", () => {
    const p = blog.getPost("new")!;
    expect(p.title).toBe("Newer");
    expect(p.description).toBe("");
    expect(p.featured).toBe(false);
  });
  it("no frontmatter: title falls back to slug, body is whole file", () => {
    const p = blog.getPost("nofm")!;
    expect(p.title).toBe("nofm");
    expect(p.content).toContain("# Just text");
  });
  it("CRLF files: frontmatter regex requires \\n so CRLF still matches but values keep \\r? (characterization)", () => {
    const p = blog.getPost("crlf")!;
    expect(p.title).toBe("CRLF");
  });
  it("unpublished -> null, unknown -> null, underscore (draft) files are unreachable", () => {
    expect(blog.getPost("hidden")).toBeNull();
    expect(blog.getPost("nope")).toBeNull();
    expect(blog.getPost("_draft")).toBeNull();
  });
  it("reading time rounds words/200, min 1", () => {
    expect(blog.getPost("long")!.readingTime).toBe("5 min read");
  });
  it("published defaults to true unless exactly false", () => {
    write("pf.md", post('title: "x"\npublished: "false"'));
    expect(blog.getPost("pf")).not.toBeNull();
  });
});

describe("path traversal in slug (getPost is fed URL params)", () => {
  it("refuses slugs that are not plain kebab-case, so nothing outside the blog dir is read", () => {
    expect(blog.getPost("../../../secret")).toBeNull();
    expect(blog.getPost("..%2F..%2Fsecret")).toBeNull();
    expect(blog.getPost("a/b")).toBeNull();
    expect(blog.getPost("Upper")).toBeNull();
  });
  it("non-.md targets are unreachable (extension appended)", () => {
    expect(blog.getPost("../../../package.json")).toBeNull();
  });
  it("NUL byte in slug returns null (existsSync swallows it)", () => {
    expect(blog.getPost("a\0b")).toBeNull();
  });
});

describe("getPosts", () => {
  it("excludes unpublished, sorts newest first, undated/invalid last", () => {
    const slugs = blog.getPosts().map((p) => p.slug);
    expect(slugs.slice(0, 2)).toEqual(["new", "old"]);
    expect(slugs).not.toContain("hidden");
    expect(slugs.filter((s) => s !== "pf")).toHaveLength(6);
  });
  it("does not leak content in meta", () => {
    expect(blog.getPosts()[0]).not.toHaveProperty("content");
  });
});

describe("getRelated", () => {
  it("ranks by shared tags, excludes self, respects limit", () => {
    const r = blog.getRelated("old", 1);
    expect(r.map((p) => p.slug)).toEqual(["new"]);
  });
  it("unknown slug -> []", () => expect(blog.getRelated("zzz")).toEqual([]));
});

describe("slugify", () => {
  it.each([
    ["Hello World", "hello-world"],
    ["  --Hi!!  ", "hi"],
    ["C++ & Rust", "c-rust"],
    ["Über café", "ber-caf"],
    ["日本語", "section"],
    ["", "section"],
    ["a  b", "a-b"],
  ])("%j -> %j", (i, o) => expect(blog.slugify(i)).toBe(o));
  it("non-latin headings fall back to a non-empty id", () => {
    expect(blog.slugify("日本語")).toBe("section");
  });
});

describe("getHeadings", () => {
  it("h2/h3 only, skips fenced code, ignores h1/h4", () => {
    const md = "# T\n## One\n### Two\n#### Four\n```\n## in code\n```\n## After";
    expect(blog.getHeadings(md)).toEqual([
      { id: "one", text: "One", level: 2 },
      { id: "two", text: "Two", level: 3 },
      { id: "after", text: "After", level: 2 },
    ]);
  });
  it("duplicate headings get unique ids in document order", () => {
    const h = blog.getHeadings("## A\n## A\n### A");
    expect(h.map((x) => x.id)).toEqual(["a", "a-2", "a-3"]);
  });
  it("heading text keeps inline markdown", () => {
    expect(blog.getHeadings("## `code` here")[0].text).toBe("`code` here");
  });
  it("fence with ~~~ is not recognised", () => {
    expect(blog.getHeadings("~~~\n## x\n~~~")).toHaveLength(1);
  });
  it("indented fence (``` after spaces) is not recognised", () => {
    expect(blog.getHeadings("  ```\n## x\n  ```")).toHaveLength(1);
  });
  it("empty", () => expect(blog.getHeadings("")).toEqual([]));
});
