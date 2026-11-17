import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Upload sign route, /media/[name] and /api/resume with R2 on. DB, session, Blob and fs are mocked; fetch is stubbed. */
const m = vi.hoisted(() => ({
  admin: { on: true },
  mediaForServing: vi.fn(),
  getSiteSettings: vi.fn(),
  get: vi.fn(),
  handleUpload: vi.fn(),
  readFile: vi.fn(),
  record: vi.fn(async () => {}),
}));
vi.mock("~/lib/server/db", () => ({ query: vi.fn(async () => ({ rows: [] })), hasDb: () => true, pool: vi.fn() }));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => m.admin.on }));
vi.mock("~/lib/server/media", async () => {
  const real = await vi.importActual<typeof import("~/lib/server/media")>("~/lib/server/media");
  return { ...real, mediaForServing: m.mediaForServing };
});
vi.mock("~/lib/server/settings", () => ({ getSiteSettings: m.getSiteSettings }));
vi.mock("~/lib/server/analytics", () => ({ record: m.record }));
vi.mock("@vercel/blob", () => ({ get: m.get, head: vi.fn(), del: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ handleUpload: m.handleUpload }));
vi.mock("fs/promises", () => ({ readFile: m.readFile, default: { readFile: m.readFile } }));

import { POST } from "~/app/api/admin/media/upload/route";
import { GET as serve } from "~/app/media/[name]/route";
import { GET as resume } from "~/app/api/resume/route";

const fetchMock = vi.fn();
const ENV = { R2_ACCOUNT_ID: "a", R2_ACCESS_KEY_ID: "k", R2_SECRET_ACCESS_KEY: "s", R2_BUCKET_PUBLIC: "pubb", R2_BUCKET_PRIVATE: "privb", NEXT_PUBLIC_ASSETS_URL: "https://assets.test" };
const setEnv = () => Object.entries(ENV).forEach(([k, v]) => vi.stubEnv(k, v));

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  m.admin.on = true;
  [m.mediaForServing, m.getSiteSettings, m.get, m.handleUpload, m.readFile].forEach((f) => f.mockReset());
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  setEnv();
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  vi.stubEnv("RESEND_API_KEY", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const post = (body: unknown, raw?: string) =>
  POST(new Request("http://x/api/admin/media/upload", { method: "POST", body: raw ?? JSON.stringify(body) }));
const sign = (o: Record<string, unknown> = {}) => post({ type: "r2.sign", name: "My Photo.PNG", contentType: "image/png", size: 1000, ...o });

describe("POST r2.sign", () => {
  it("401 for non-admins, before anything else (even when R2 is off)", async () => {
    m.admin.on = false;
    expect((await sign()).status).toBe(401);
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "t");
    expect((await sign()).status).toBe(401);
    expect(m.handleUpload).not.toHaveBeenCalled();
  });
  it("409 when R2 isn't configured but Blob is (client falls back to Blob)", async () => {
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "t");
    const r = await sign();
    expect(r.status).toBe(409);
  });
  it("503 when neither store is configured", async () => {
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    expect((await sign()).status).toBe(503);
  });
  it("returns a signed PUT and a matching r2 ref with the key shape media/<slug>-<12 hex>.<ext>", async () => {
    const r = await sign();
    expect(r.status).toBe(200);
    const j = (await r.json()) as { putUrl: string; ref: string };
    expect(j.ref).toMatch(/^r2:media\/my-photo-[0-9a-f]{12}\.png$/);
    const u = new URL(j.putUrl);
    expect(u.pathname).toBe(`/privb/${j.ref.slice(3)}`);
    expect(u.searchParams.get("X-Amz-Signature")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("the ref it hands out always passes addMedia's filename rule, for hostile names", async () => {
    const rule = /^r2:media\/[a-z0-9-]+\.[a-z0-9]+$/;
    for (const name of ["../../etc/passwd", "a/b\\c.png", "%2e%2e%2fx.png", "..png", ".png", "", "日本語.png", "a".repeat(5000) + ".png", "x.p ng", "x.png\n", "COM1.", "a.PNG.exe", "<script>.svg", "x\u0000.png"]) {
      const j = (await (await sign({ name })).json()) as { ref: string };
      expect(j.ref, name).toMatch(rule);
    }
  });
  it("keys are unique across calls", async () => {
    const a = (await (await sign()).json()) as { ref: string };
    const b = (await (await sign()).json()) as { ref: string };
    expect(a.ref).not.toBe(b.ref);
  });
  it("non-string name falls back to 'file'", async () => {
    for (const name of [123, null, {}, ["a"]]) {
      const j = (await (await sign({ name })).json()) as { ref: string };
      expect(j.ref).toMatch(/^r2:media\/file-[0-9a-f]{12}\.png$/);
    }
  });
  it("the extension comes from the file name even when it disagrees with the declared type (pins; real type is checked on register)", async () => {
    const j = (await (await sign({ name: "evil.html", contentType: "image/png" })).json()) as { ref: string };
    expect(j.ref).toMatch(/\.html$/);
  });
  it.each([
    ["text/html"],
    ["image/png; charset=utf-8"],
    ["IMAGE/PNG"],
    [""],
    [undefined],
    [42],
    [null],
    [["image/png"]],
  ])("rejects content type %j", async (contentType) => {
    expect((await sign({ contentType })).status).toBe(400);
  });
  it.each([[0], [-1], [8 * 1024 * 1024 + 1], ["1000"], [null], [undefined], [Number.MAX_SAFE_INTEGER], [{}], [[100]], [true]])("rejects size %j", async (size) => {
    expect((await sign({ size })).status).toBe(400);
  });
  it("accepts the exact limit, 1 byte, and fractional sizes (pins: 0.5 passes)", async () => {
    expect((await sign({ size: 8 * 1024 * 1024 })).status).toBe(200);
    expect((await sign({ size: 1 })).status).toBe(200);
    expect((await sign({ size: 0.5 })).status).toBe(200);
  });
  it("accepts every allowed type including pdf", async () => {
    for (const t of ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/svg+xml", "application/pdf"]) {
      expect((await sign({ contentType: t, name: "x" })).status, t).toBe(200);
    }
  });
  it("extensionless names take the extension from the type", async () => {
    const j = (await (await sign({ name: "scan", contentType: "application/pdf" })).json()) as { ref: string };
    expect(j.ref).toMatch(/^r2:media\/scan-[0-9a-f]{12}\.pdf$/);
  });
  it("400 on malformed JSON, and on null/array/string bodies (falls to Blob handler which is mocked to throw)", async () => {
    expect((await post(null, "{nope")).status).toBe(400);
    m.handleUpload.mockRejectedValue(new Error("bad body"));
    for (const raw of ["null", "[]", '"r2.sign"', "123"]) expect((await post(null, raw)).status, raw).toBe(400);
  });
  it("a body with type 'r2.sign' never reaches handleUpload", async () => {
    await sign();
    expect(m.handleUpload).not.toHaveBeenCalled();
  });
  it("extra/prototype-polluting keys are ignored", async () => {
    const r = await post(null, '{"type":"r2.sign","name":"a.png","contentType":"image/png","size":5,"__proto__":{"admin":true},"constructor":"x"}');
    expect(r.status).toBe(200);
  });
});

describe("GET /media/[name]", () => {
  const call = (name: string, headers: Record<string, string> = {}) =>
    serve(new Request(`http://x/media/${name}`, { headers }), { params: Promise.resolve({ name }) });
  const pub = (o = {}) => ({ url: "r2:media/a-0123456789ab.png", content_type: "image/png", published: true, ...o });

  it.each(["../x", "a/b", "a%2Fb", "a b", "", "a\\b", "a\n", "a?x", "é.png", "a;b"])("rejects bad name %j with 404 and never queries", async (name) => {
    expect((await call(name)).status).toBe(404);
    expect(m.mediaForServing).not.toHaveBeenCalled();
  });
  it("published: 308 to the assets domain for anyone, with no R2 fetch", async () => {
    m.mediaForServing.mockResolvedValue(pub());
    for (const admin of [false, true]) {
      m.admin.on = admin;
      const r = await call("a-0123456789ab.png");
      expect(r.status).toBe(308);
      expect(r.headers.get("location")).toBe("https://assets.test/media/a-0123456789ab.png");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("published redirect target can't be steered by the name (only [\\w.-] reaches it)", async () => {
    m.mediaForServing.mockResolvedValue(pub());
    const r = await call("..");
    expect(new URL(r.headers.get("location") ?? "https://assets.test").origin).toBe("https://assets.test");
  });
  it("unpublished + anonymous: 404 no-store, and R2 is never touched", async () => {
    m.admin.on = false;
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    const r = await call("a-0123456789ab.png");
    expect(r.status).toBe(404);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("unpublished + admin: streams from the PRIVATE bucket, private no-store, nosniff, etag", async () => {
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    fetchMock.mockResolvedValue(new Response("PNGDATA", { headers: { etag: '"e1"' } }));
    const r = await call("a-0123456789ab.png", { "if-none-match": '"e1"' });
    expect(r.status).toBe(200);
    expect(await r.text()).toBe("PNGDATA");
    expect(r.headers.get("cache-control")).toBe("private, no-store");
    expect(r.headers.get("x-content-type-options")).toBe("nosniff");
    expect(r.headers.get("etag")).toBe('"e1"');
    expect(r.headers.get("content-type")).toBe("image/png");
    const sent = fetchMock.mock.calls[0][0] as Request;
    expect(sent.url).toContain("/privb/media/a-0123456789ab.png");
    expect(sent.headers.get("if-none-match")).toBe('"e1"');
  });
  it("304 passes through with no body but still no-store", async () => {
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    fetchMock.mockResolvedValue(new Response(null, { status: 304, headers: { etag: '"e1"' } }));
    const r = await call("a-0123456789ab.png", { "if-none-match": '"e1"' });
    expect(r.status).toBe(304);
    expect(r.headers.get("cache-control")).toBe("private, no-store");
    expect(await r.text()).toBe("");
  });
  it("SVG gets the sandbox CSP; PDF gets inline disposition; PNG gets neither", async () => {
    m.mediaForServing.mockResolvedValue(pub({ published: false, content_type: "image/svg+xml" }));
    fetchMock.mockResolvedValue(new Response("<svg/>"));
    const svg = await call("a.svg");
    expect(svg.headers.get("content-security-policy")).toContain("sandbox");
    expect(svg.headers.get("content-security-policy")).toContain("default-src 'none'");
    m.mediaForServing.mockResolvedValue(pub({ published: false, content_type: "application/pdf" }));
    fetchMock.mockResolvedValue(new Response("%PDF"));
    const pdf = await call("a.pdf");
    expect(pdf.headers.get("content-disposition")).toBe('inline; filename="a.pdf"');
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    fetchMock.mockResolvedValue(new Response("x"));
    const png = await call("a.png");
    expect(png.headers.get("content-security-policy")).toBeNull();
    expect(png.headers.get("content-disposition")).toBeNull();
  });
  it("object missing in R2 (404) or R2 erroring: 404 no-store, no leak of the error", async () => {
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect((await call("a.png")).status).toBe(404);
    fetchMock.mockImplementation(async () => new Response("secret detail", { status: 403 }));
    const r = await call("a.png");
    expect(r.status).toBe(404);
    expect(await r.text()).toBe("Not found");
  });
  it("R2 env removed at runtime for an r2 row: 404 (published or not)", async () => {
    m.mediaForServing.mockResolvedValue(pub({ published: false }));
    vi.stubEnv("R2_BUCKET_PUBLIC", "");
    expect((await call("a.png")).status).toBe(404);
    m.mediaForServing.mockResolvedValue(pub());
    expect((await call("a.png")).status).toBe(404);
  });
  it("DB failure: 404", async () => {
    m.mediaForServing.mockRejectedValue(new Error("db"));
    expect((await call("a.png")).status).toBe(404);
  });
  it("unknown name: 404", async () => {
    m.mediaForServing.mockResolvedValue(null);
    expect((await call("zzz.png")).status).toBe(404);
  });
  it("a legacy blob row is still served through Blob, not R2", async () => {
    m.mediaForServing.mockResolvedValue({ url: "https://s.private.blob.vercel-storage.com/media/a.png", content_type: "image/png", published: false });
    m.get.mockResolvedValue({ statusCode: 200, stream: new Response("B").body, blob: { etag: '"b"' } });
    const r = await call("a.png");
    expect(r.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/resume with R2", () => {
  const PDF = { url: "r2:media/cv-0123456789ab.pdf", content_type: "application/pdf" };
  it("rewritten absolute assets URL resolves to the file by name and streams the private copy", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "https://assets.test/media/cv-0123456789ab.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    fetchMock.mockResolvedValue(new Response("%PDF-1"));
    const r = await resume();
    expect(m.mediaForServing).toHaveBeenCalledWith("cv-0123456789ab.pdf");
    expect(await r.text()).toBe("%PDF-1");
    expect(r.headers.get("content-type")).toBe("application/pdf");
    expect(r.headers.get("content-disposition")).toContain("attachment");
    expect((fetchMock.mock.calls[0][0] as Request).url).toContain("/privb/media/cv-0123456789ab.pdf");
  });
  it("plain /media/ path works too", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/cv-0123456789ab.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    fetchMock.mockResolvedValue(new Response("x"));
    expect(await (await resume()).text()).toBe("x");
  });
  it("a non-PDF row (e.g. image) is refused and the bundled resume is served", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/a.png" });
    m.mediaForServing.mockResolvedValue({ url: "r2:media/a.png", content_type: "image/png" });
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    expect(await (await resume()).text()).toBe("LOCALPDF");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("private object missing: falls back to the bundled PDF", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/cv.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await (await resume()).text()).toBe("LOCALPDF");
  });
  it("R2 erroring falls back to the bundled PDF instead of a 404", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/cv.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    fetchMock.mockImplementation(async () => new Response(null, { status: 403 }));
    expect(await (await resume()).text()).toBe("LOCALPDF");
  });
  it("a Blob error also falls back to the bundled PDF", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/cv.pdf" });
    m.mediaForServing.mockResolvedValue({ url: "https://s.private.blob.vercel-storage.com/media/cv.pdf", content_type: "application/pdf" });
    m.get.mockRejectedValue(new Error("blob down"));
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    expect(await (await resume()).text()).toBe("LOCALPDF");
  });
  it("a 304 from R2 (obj.ok false) falls back rather than sending an empty body", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "/media/cv.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    fetchMock.mockResolvedValue(new Response(null, { status: 304 }));
    expect(await (await resume()).text()).toBe("LOCALPDF");
  });
  it.each([
    ["https://assets.test/media/cv.pdf?v=2"],
    ["https://assets.test/media/cv.pdf#x"],
    ["https://evil.com/media/../../x"],
    ["/media/"],
    ["/other/cv.pdf"],
  ])("resume setting %j does not look up a file it can't name exactly", async (resumeSetting) => {
    m.getSiteSettings.mockResolvedValue({ resume: resumeSetting });
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    m.mediaForServing.mockResolvedValue(null);
    expect(await (await resume()).text()).toBe("LOCALPDF");
  });
  it("a foreign host with a /media/<name> tail still resolves by name only (pins: host is ignored, but only our own library file is served)", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "https://evil.com/media/cv.pdf" });
    m.mediaForServing.mockResolvedValue(PDF);
    fetchMock.mockResolvedValue(new Response("ours"));
    expect(await (await resume()).text()).toBe("ours");
    expect((fetchMock.mock.calls[0][0] as Request).url).not.toContain("evil.com");
  });
  it("404 when even the bundled file is missing", async () => {
    m.getSiteSettings.mockResolvedValue({ resume: "" });
    m.readFile.mockRejectedValue(new Error("ENOENT"));
    expect((await resume()).status).toBe(404);
  });
  it("settings read failure gives 404 (pins: doesn't fall back to the bundled file)", async () => {
    m.getSiteSettings.mockRejectedValue(new Error("db"));
    m.readFile.mockResolvedValue(Buffer.from("LOCALPDF"));
    expect((await resume()).status).toBe(404);
  });
});
