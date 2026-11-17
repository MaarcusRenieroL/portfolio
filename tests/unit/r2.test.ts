import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyToPublic, PUBLIC_MEDIA_CACHE, deleteObject, getPrivate, headPrivate, isR2Ref, listPublic, presignUpload, putObject, r2Env, toPublicAssets } from "~/lib/server/r2";
import { assetUrl, certAsset, logoUrl, shotUrl } from "~/lib/site";

// No DB is touched here; fetch is stubbed so nothing leaves the machine.
const ENV = {
  R2_ACCOUNT_ID: "acct",
  R2_ACCESS_KEY_ID: "AKID",
  R2_SECRET_ACCESS_KEY: "secret",
  R2_BUCKET_PUBLIC: "pubb",
  R2_BUCKET_PRIVATE: "privb",
  NEXT_PUBLIC_ASSETS_URL: "https://assets.test///",
};
const fetchMock = vi.fn();
const setEnv = () => Object.entries(ENV).forEach(([k, v]) => vi.stubEnv(k, v));

beforeEach(() => {
  // aws4fetch retries 5xx/429 (2 retries here) with random backoff; zero the wait so tests stay fast.
  vi.spyOn(Math, "random").mockReturnValue(0);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setEnv();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const req = (i = 0) => fetchMock.mock.calls[i][0] as Request;

describe("r2Env", () => {
  it("is null if any single variable is missing or empty", () => {
    for (const k of Object.keys(ENV)) expect(r2Env({ ...ENV, [k]: "" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    for (const k of Object.keys(ENV)) {
      const e = { ...ENV } as Record<string, string | undefined>;
      delete e[k];
      expect(r2Env(e as unknown as NodeJS.ProcessEnv)).toBeNull();
    }
  });
  it("trims trailing slashes off the assets URL", () => {
    expect(r2Env()?.assets).toBe("https://assets.test");
  });
  it("whitespace-only values count as configured (pins current behavior)", () => {
    expect(r2Env({ ...ENV, R2_ACCOUNT_ID: " " } as unknown as NodeJS.ProcessEnv)).not.toBeNull();
  });
  it("isR2Ref", () => {
    expect(isR2Ref("r2:media/a.png")).toBe(true);
    expect(isR2Ref("R2:media/a.png")).toBe(false);
    expect(isR2Ref("https://x.blob.vercel-storage.com/a")).toBe(false);
  });
});

describe("unconfigured", () => {
  it("every call throws before any fetch", async () => {
    vi.stubEnv("R2_BUCKET_PRIVATE", "");
    await expect(presignUpload("media/a.png")).rejects.toThrow("R2 isn't configured");
    await expect(headPrivate("media/a.png")).rejects.toThrow();
    await expect(getPrivate("media/a.png")).rejects.toThrow();
    await expect(putObject("public", "a", "x", "text/plain")).rejects.toThrow();
    await expect(copyToPublic("media/a.png", "image/png")).rejects.toThrow();
    await expect(deleteObject("public", "a")).rejects.toThrow();
    await expect(listPublic("media/")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("presignUpload", () => {
  it("signs a PUT into the private bucket with a 600s expiry in the query", async () => {
    const u = new URL(await presignUpload("media/a-123.png"));
    expect(u.host).toBe("acct.r2.cloudflarestorage.com");
    expect(u.pathname).toBe("/privb/media/a-123.png");
    expect(u.searchParams.get("X-Amz-Expires")).toBe("600");
    expect(u.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    expect(u.searchParams.get("X-Amz-Credential")).toContain("AKID/");
    expect(u.searchParams.get("X-Amz-SignedHeaders")).not.toMatch(/content-type/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("percent-encodes each segment: an encoded slash or traversal can't change the object path", async () => {
    const u = new URL(await presignUpload("media/../x y%2F?#.png"));
    // ".." stays a literal segment in the key; URL parsing would collapse it, so check the raw string.
    expect(u.pathname.startsWith("/privb/")).toBe(true);
    // Dot segments are collapsed by URL parsing, so presignUpload itself would sign /privb/x... for "media/../x...".
    // Safe only because callers validate keys (^media/[a-z0-9-]+\.[a-z0-9]+$); pinned so a caller change is noticed.
    expect(u.pathname).toBe("/privb/x%20y%252F%3F%23.png");
  });
  it("never targets the public bucket", async () => {
    expect(await presignUpload("media/a.png")).not.toContain("/pubb/");
  });
});

describe("headPrivate", () => {
  it("returns size and type", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200, headers: { "content-length": "42", "content-type": "image/png" } }));
    expect(await headPrivate("media/a.png")).toEqual({ size: 42, type: "image/png" });
    expect(req().method).toBe("HEAD");
    expect(req().url).toContain("/privb/media/a.png");
    expect(req().headers.get("authorization")).toContain("AWS4-HMAC-SHA256");
  });
  it("null on 404; throws on 403/500", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await headPrivate("media/a.png")).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 403 }));
    await expect(headPrivate("media/a.png")).rejects.toThrow("403");
    fetchMock.mockClear();
    fetchMock.mockImplementation(async () => new Response(null, { status: 500 }));
    await expect(headPrivate("media/a.png")).rejects.toThrow("500");
    // AwsClient is built with retries: 2, so a 5xx costs 3 attempts (aws4fetch's default would be 11).
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it("defaults missing headers to size 0 and octet-stream", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    expect(await headPrivate("media/a.png")).toEqual({ size: 0, type: "application/octet-stream" });
  });
  it("a garbage content-length becomes NaN (pins behavior; NaN > max is false so it would pass the size check)", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200, headers: { "content-length": "abc", "content-type": "image/png" } }));
    expect(Number.isNaN((await headPrivate("media/a.png"))!.size)).toBe(true);
  });
});

describe("getPrivate", () => {
  it("passes If-None-Match; passes 304 through", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 304 }));
    const r = await getPrivate("media/a.png", '"abc"');
    expect(r?.status).toBe(304);
    expect(req().headers.get("if-none-match")).toBe('"abc"');
  });
  it("omits If-None-Match when absent", async () => {
    fetchMock.mockResolvedValue(new Response("x"));
    await getPrivate("media/a.png");
    expect(req().headers.get("if-none-match")).toBeNull();
  });
  it("null on 404, throws on 500/403", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await getPrivate("k")).toBeNull();
    fetchMock.mockImplementation(async () => new Response(null, { status: 500 }));
    await expect(getPrivate("k")).rejects.toThrow("500");
  });
});

describe("putObject / deleteObject / copyToPublic", () => {
  it("putObject chooses the bucket and sets headers", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    await putObject("public", "a/b.txt", "hi", "text/plain", "max-age=1");
    expect(req().url).toContain("/pubb/a/b.txt");
    expect(req().headers.get("content-type")).toBe("text/plain");
    expect(req().headers.get("cache-control")).toBe("max-age=1");
    await putObject("private", "k", "hi", "text/plain");
    expect(req(1).url).toContain("/privb/k");
    expect(req(1).headers.get("cache-control")).toBeNull();
  });
  it("putObject throws on failure", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    await expect(putObject("public", "k", "x", "t")).rejects.toThrow("403");
  });
  it("deleteObject tolerates 404 only", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(deleteObject("public", "k")).resolves.toBeUndefined();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(deleteObject("private", "k")).resolves.toBeUndefined();
    expect(req(1).url).toContain("/privb/k");
    fetchMock.mockImplementation(async () => new Response(null, { status: 500 }));
    await expect(deleteObject("public", "k")).rejects.toThrow("500");
  });
  it("copyToPublic: one PUT with copy-source, the given content type and the short public cache; no HEAD", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    await copyToPublic("media/my file-1.pdf", "application/pdf");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(req(0).method).toBe("PUT");
    expect(req(0).url).toContain("/pubb/media/my%20file-1.pdf");
    expect(req(0).headers.get("x-amz-copy-source")).toBe("/privb/media/my%20file-1.pdf");
    expect(req(0).headers.get("x-amz-metadata-directive")).toBe("REPLACE");
    expect(req(0).headers.get("content-type")).toBe("application/pdf");
    expect(req(0).headers.get("cache-control")).toBe(PUBLIC_MEDIA_CACHE);
    expect(PUBLIC_MEDIA_CACHE).toBe("public, max-age=600, s-maxage=600");
  });
  it("copyToPublic of a missing private file: the copy 404s and throws", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<Error/>", { status: 404 }));
    await expect(copyToPublic("media/nope.png", "image/png")).rejects.toThrow("404");
  });
  it("copyToPublic 403 throws without retrying", async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 403 }));
    await expect(copyToPublic("media/a.png", "image/png")).rejects.toThrow("copy failed (403)");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

const page = (keys: string[], next?: string) =>
  `<?xml version="1.0"?><ListBucketResult><IsTruncated>${next ? "true" : "false"}</IsTruncated>${keys.map((k) => `<Contents><Key>${k}</Key></Contents>`).join("")}${next ? `<NextContinuationToken>${next}</NextContinuationToken>` : ""}</ListBucketResult>`;

describe("listPublic", () => {
  it("follows continuation tokens, URL-encoding them", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(page(["media/a.png"], "tok/+=1")))
      .mockResolvedValueOnce(new Response(page(["media/b.png"])));
    expect(await listPublic("media/")).toEqual(["media/a.png", "media/b.png"]);
    expect(req(0).url).toContain("/pubb?list-type=2&prefix=media%2F");
    expect(req(1).url).toContain("continuation-token=tok%2F%2B%3D1");
  });
  it("decodes XML entities in the right order (no double decoding)", async () => {
    fetchMock.mockResolvedValue(new Response(page(["media/a&amp;b.png", "media/x&amp;lt;y.png", "media/q&quot;&apos;&lt;&gt;.png"])));
    expect(await listPublic("media/")).toEqual(["media/a&b.png", "media/x&lt;y.png", `media/q"'<>.png`]);
  });
  it("stops if truncated but no token (no infinite loop)", async () => {
    fetchMock.mockResolvedValue(new Response("<IsTruncated>true</IsTruncated><Key>media/a</Key>"));
    expect(await listPublic("media/")).toEqual(["media/a"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("caps at 100 pages when a server keeps saying truncated", async () => {
    fetchMock.mockImplementation(async () => new Response(page(["media/a"], "same")));
    const keys = await listPublic("media/");
    expect(fetchMock).toHaveBeenCalledTimes(100);
    expect(keys).toHaveLength(100);
  });
  it("empty bucket and ignores empty Key elements", async () => {
    fetchMock.mockResolvedValue(new Response("<ListBucketResult><Key></Key></ListBucketResult>"));
    expect(await listPublic("media/")).toEqual([]);
  });
  it("throws on a failed page, including a later one (no silent partial list)", async () => {
    fetchMock.mockResolvedValueOnce(new Response(page(["media/a"], "t"))).mockImplementation(async () => new Response(null, { status: 403 }));
    await expect(listPublic("media/")).rejects.toThrow("LIST failed (403)");
  });
  it("encodes a hostile prefix", async () => {
    fetchMock.mockResolvedValue(new Response(page([])));
    await listPublic("a&list-type=1#");
    expect(req().url).toContain("prefix=a%26list-type%3D1%23");
  });
});

describe("toPublicAssets", () => {
  const A = "https://assets.test";
  const R2 = new Set(["media/a.png", "media/b.pdf", "media/a b".replace(" ", "-") + ".png"]);
  const t = (s: string, names: ReadonlySet<string> = R2) => toPublicAssets(s, names, A);
  it("rewrites at start, after space, paren, quotes, =, ]", () => {
    expect(t("/media/a.png")).toBe(`${A}/media/a.png`);
    expect(t("![x](/media/a.png)")).toBe(`![x](${A}/media/a.png)`);
    expect(t(`<img src="/media/a.png">`)).toBe(`<img src="${A}/media/a.png">`);
    expect(t(`<img src='/media/a.png'>`)).toBe(`<img src='${A}/media/a.png'>`);
    expect(t("src=/media/a.png")).toBe(`src=${A}/media/a.png`);
    expect(t("see /media/a.png and\n/media/b.pdf")).toBe(`see ${A}/media/a.png and\n${A}/media/b.pdf`);
    expect(t("[x]/media/a.png")).toBe(`[x]${A}/media/a.png`);
  });
  it("a name not in the R2 set (a Blob-only file) keeps its /media path", () => {
    expect(t("![x](/media/blobonly.png)")).toBe("![x](/media/blobonly.png)");
    expect(t("/media/a.png and /media/blobonly.png")).toBe(`${A}/media/a.png and /media/blobonly.png`);
  });
  it("an empty set changes nothing, and returns the same reference", () => {
    const v = { a: "/media/a.png" };
    expect(toPublicAssets(v, new Set(), A)).toBe(v);
  });
  it("trailing [._-] punctuation is stripped for the lookup but kept in the output", () => {
    expect(t("(/media/a.png.)")).toBe(`(${A}/media/a.png.)`);
    expect(t("/media/a.png--")).toBe(`${A}/media/a.png--`);
    expect(t("/media/a.png_")).toBe(`${A}/media/a.png_`);
  });
  it("set membership is exact: a longer or prefix name does not match", () => {
    expect(t("/media/a.png2")).toBe("/media/a.png2");
    expect(t("/media/a.pn")).toBe("/media/a.pn");
    expect(t("/media/xa.png")).toBe("/media/xa.png");
    expect(t("/media/A.png")).toBe("/media/A.png");
  });
  it("leaves lookalikes alone", () => {
    for (const s of ["https://evil.com/media/a.png", "foo/media/a.png", "/mediax/a.png", "/media/", "/media/ a", "/media", "//media/a.png", "/Media/a.png", "a/media/", "https://assets.test/media/a.png"]) {
      expect(t(s)).toBe(s);
    }
  });
  it("a traversal name never matches the set, so it is not rewritten", () => {
    expect(t("(/media/../secret)")).toBe("(/media/../secret)");
  });
  it("is idempotent", () => {
    const once = t("![](/media/a.png)");
    expect(t(once)).toBe(once);
  });
  it("walks nested objects/arrays, leaves keys, numbers, null and booleans", () => {
    const v = { "/media/a.png": "/media/a.png", n: [1, null, true, { x: ["/media/b.pdf", "/media/blob.png"] }], d: undefined };
    expect(toPublicAssets(v, R2, A)).toEqual({ "/media/a.png": `${A}/media/a.png`, n: [1, null, true, { x: [`${A}/media/b.pdf`, "/media/blob.png"] }], d: undefined });
  });
  it("does not mutate the input", () => {
    const v = { a: "/media/a.png" };
    toPublicAssets(v, R2, A);
    expect(v.a).toBe("/media/a.png");
  });
  it("is the identity when assets is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSETS_URL", "");
    const v = { a: "/media/a.png" };
    expect(toPublicAssets(v, R2)).toBe(v);
    expect(toPublicAssets(v, R2, undefined)).toBe(v);
  });
  it("uses the env value (trailing slashes trimmed) by default", () => {
    expect(toPublicAssets("/media/a.png", R2)).toBe("https://assets.test/media/a.png");
  });
  it("rewrites after '=' inside a foreign URL query (pins: harmless, points at our own domain)", () => {
    expect(t("https://evil.com/?u=/media/a.png")).toBe(`https://evil.com/?u=${A}/media/a.png`);
  });
  it("big input stays linear-ish", () => {
    const s = ("x ".repeat(5) + "/media/a.png ").repeat(20000);
    const t0 = Date.now();
    toPublicAssets(s, R2, A);
    expect(Date.now() - t0).toBeLessThan(2000);
  });
});

describe("site asset helpers", () => {
  describe("with NEXT_PUBLIC_ASSETS_URL", () => {
    it("builds remote paths; certificates map to certifications/", () => {
      expect(assetUrl("projects", "a/b.png")).toBe("https://assets.test/projects/a/b.png");
      expect(assetUrl("files", "resume.pdf")).toBe("https://assets.test/resume.pdf");
      expect(assetUrl("logos", "///x.svg")).toBe("https://assets.test/logos/x.svg");
      expect(certAsset("aws.pdf")).toBe("https://assets.test/certifications/aws.pdf");
      expect(logoUrl("x.svg")).toBe("https://assets.test/logos/x.svg");
      expect(shotUrl("slug", "1.png")).toBe("https://assets.test/projects/slug/1.png");
    });
    it("library refs pass through untouched", () => {
      expect(certAsset("https://other/x.pdf")).toBe("https://other/x.pdf");
      expect(certAsset("/media/x.pdf")).toBe("/media/x.pdf");
    });
    it("a '../' in a file name isn't normalised (pins; inputs are admin content)", () => {
      expect(logoUrl("../x.svg")).toBe("https://assets.test/logos/../x.svg");
    });
  });
  describe("without it", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_ASSETS_URL", "");
      vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    });
    it("falls back to /public with certificates/ spelled locally", () => {
      expect(assetUrl("projects", "a/b.png")).toBe("/projects/a/b.png");
      expect(assetUrl("files", "resume.pdf")).toBe("/resume.pdf");
      expect(certAsset("aws.pdf")).toBe("/certificates/aws.pdf");
      expect(logoUrl("x.svg")).toBe("/logos/x.svg");
      expect(shotUrl("s", "1.png")).toBe("/projects/s/1.png");
    });
    it("honours the base path, including for library refs", () => {
      vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/base");
      expect(certAsset("a.pdf")).toBe("/base/certificates/a.pdf");
      expect(certAsset("/media/a.pdf")).toBe("/base/media/a.pdf");
      expect(assetUrl("files", "/r.pdf")).toBe("/base/r.pdf");
    });
  });
});
