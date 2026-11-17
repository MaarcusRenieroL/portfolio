import { describe, expect, it } from "vitest";
import { ALL_PROJECT_DATA, certAsset, logoUrl, shotUrl } from "~/lib/content";
import { formatBytes, isBlobUrl, isLibraryRef, mediaSrc, slugFileName } from "~/lib/media";
import { projectSchema } from "~/lib/schema";

const BLOB = "https://abc123.public.blob.vercel-storage.com/media/nyx-search-Xy12.webp";

describe("media helpers", () => {
  it("makes safe, readable blob file names", () => {
    expect(slugFileName("My Photo (1).JPG")).toBe("my-photo-1.jpg");
    expect(slugFileName("Résumé 2026.pdf")).toBe("resume-2026.pdf");
    expect(slugFileName("???.png")).toBe("file.png");
    expect(slugFileName("noext")).toBe("noext");
    expect(slugFileName(`${"a".repeat(100)}.webp`)).toBe(`${"a".repeat(60)}.webp`);
  });

  it("only accepts Vercel Blob public URLs as uploaded media", () => {
    expect(isBlobUrl(BLOB)).toBe(true);
    expect(isBlobUrl("https://abc.private.blob.vercel-storage.com/media/x.png")).toBe(true);
    expect(isBlobUrl("http://abc.public.blob.vercel-storage.com/x.png")).toBe(false);
    expect(isBlobUrl("https://evil.com/?h=.public.blob.vercel-storage.com")).toBe(false);
    expect(isBlobUrl("https://public.blob.vercel-storage.com.evil.com/x.png")).toBe(false);
    expect(isBlobUrl("not a url")).toBe(false);
  });

  it("formats sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("asset resolution", () => {
  it("serves library files from /media on this site", () => {
    expect(mediaSrc({ pathname: "media/nyx-search-Xy12.webp" })).toBe("/media/nyx-search-Xy12.webp");
    expect(shotUrl("nyx", "/media/nyx-search-Xy12.webp")).toBe("/media/nyx-search-Xy12.webp");
    expect(logoUrl("/media/acme.png")).toBe("/media/acme.png");
    expect(certAsset("/media/aws.pdf")).toBe("/media/aws.pdf");
  });

  it("passes library URLs through and resolves legacy file names under /public", () => {
    expect(isLibraryRef(BLOB)).toBe(true);
    expect(isLibraryRef("/media/a.png")).toBe(true);
    expect(isLibraryRef("cover.webp")).toBe(false);
    expect(shotUrl("nyx", BLOB)).toBe(BLOB);
    expect(shotUrl("nyx", "cover.webp")).toMatch(/\/projects\/nyx\/cover\.webp$/);
    expect(logoUrl(BLOB)).toBe(BLOB);
    expect(logoUrl("acme.svg")).toMatch(/\/logos\/acme\.svg$/);
    expect(certAsset(BLOB)).toBe(BLOB);
    expect(certAsset("aws.pdf")).toMatch(/aws\.pdf$/);
  });

  it("schema accepts a file name or an https URL, nothing else", () => {
    const { cover: _, ...base } = ALL_PROJECT_DATA[0];
    expect(projectSchema.safeParse(base).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, cover: "cover.webp" }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, cover: BLOB }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, cover: "/media/nyx-Xy12.webp" }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, cover: "/media/../secret" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, cover: "/etc/passwd" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, cover: "http://x.com/a.png" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, cover: "../../etc/passwd" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, cover: "javascript:alert(1)" }).success).toBe(false);
  });
});
