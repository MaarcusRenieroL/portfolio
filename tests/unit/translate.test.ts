import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Field } from "~/lib/cms-fields";
import { extractTranslatable, translateConfigured, translateToGerman, validateShape } from "~/lib/server/translate";

const fields: Field[] = [
  { name: "title", label: "T", type: "text", de: true },
  { name: "tags", label: "Tags", type: "lines", de: true },
  { name: "steps", label: "S", type: "steps", de: true },
  { name: "slug", label: "Slug", type: "text" },
  { name: "body", label: "B", type: "markdown", de: true },
];

const gemini = (text: string, status = 200) => ({ ok: status < 400, status, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  process.env.GEMINI_API_KEY = "k";
  delete process.env.GEMINI_MODEL;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete process.env.GEMINI_API_KEY;
});

describe("translateConfigured", () => {
  it("tracks GEMINI_API_KEY", () => {
    expect(translateConfigured()).toBe(true);
    delete process.env.GEMINI_API_KEY;
    expect(translateConfigured()).toBe(false);
  });
});

describe("extractTranslatable", () => {
  it("picks only de fields, trims blanks, filters non-strings", () => {
    const out = extractTranslatable(fields, {
      title: "Hello",
      tags: ["a", 3, "b", null],
      steps: [{ note: "n1" }, { note: "" }, {}, { note: "n2" }],
      slug: "skip-me",
      body: "   ",
    });
    expect(out).toEqual({ title: "Hello", tags: ["a", "b"], steps: ["n1", "n2"] });
  });
  it("ignores wrong types and missing data", () => {
    // Characterization: a bare string on a lines/steps field is passed through as a string.
    expect(extractTranslatable(fields, { title: 5, tags: "x", steps: "y" })).toEqual({ tags: "x", steps: "y" });
    expect(extractTranslatable(fields, { title: 5, body: null })).toEqual({});
    expect(extractTranslatable([], { title: "x" })).toEqual({});
  });
});

describe("validateShape", () => {
  const src = { title: "a", tags: ["x", "y"] };
  it("accepts a mirrored reply", () => {
    expect(validateShape(src, { title: "b", tags: ["1", "2"] })).toEqual({ ok: true, de: { title: "b", tags: ["1", "2"] } });
  });
  it.each([
    ["missing key", { title: "b" }],
    ["array length mismatch", { title: "b", tags: ["1"] }],
    ["string for array", { title: "b", tags: "1" }],
    ["number for string", { title: 1, tags: ["1", "2"] }],
    ["null reply", null],
    ["array reply", []],
    ["non-string in array", { title: "b", tags: ["1", 2] }],
  ])("rejects %s", (_n, reply) => {
    const r = validateShape(src, reply);
    expect(r.ok).toBe(false);
  });
  it("strips extra keys from the reply (cannot smuggle fields)", () => {
    const r = validateShape(src, { title: "b", tags: ["1", "2"], evil: "x" });
    expect(r).toEqual({ ok: true, de: { title: "b", tags: ["1", "2"] } });
  });
});

describe("translateToGerman", () => {
  it("fails without a key and never calls fetch", async () => {
    delete process.env.GEMINI_API_KEY;
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "GEMINI_API_KEY is not set." });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("empty source short-circuits with no network", async () => {
    expect(await translateToGerman({})).toEqual({ ok: true, de: {} });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sends key in header (not URL), honours GEMINI_MODEL, returns validated result", async () => {
    process.env.GEMINI_MODEL = "m-x";
    fetchMock.mockResolvedValue(gemini(JSON.stringify({ a: "Hallo" })));
    const r = await translateToGerman({ a: "Hello" });
    expect(r).toEqual({ ok: true, de: { a: "Hallo" } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("models/m-x:generateContent");
    expect(url).not.toContain("key=");
    expect(init.headers["x-goog-api-key"]).toBe("k");
    expect(JSON.parse(init.body).contents[0].parts[0].text).toBe('{"a":"Hello"}');
  });
  it("joins multi-part text", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"a":' }, { text: '"B"}' }] } }] }) });
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: true, de: { a: "B" } });
  });
  it("reports HTTP errors with status only", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "Gemini returned 429." });
  });
  it("rejects a reply of the wrong shape", async () => {
    fetchMock.mockResolvedValue(gemini(JSON.stringify({ a: ["x"] })));
    const r = await translateToGerman({ a: "x" });
    expect(r.ok).toBe(false);
  });
  it("non-JSON text, empty candidates and network errors become 'Translation failed.'", async () => {
    fetchMock.mockResolvedValueOnce(gemini("not json"));
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "Translation failed." });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "Translation failed." });
    fetchMock.mockRejectedValueOnce(new Error("ECONNRESET"));
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "Translation failed." });
  });
  it("times out after 30s via abort", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_u: string, init: { signal: AbortSignal }) => new Promise((_res, rej) => init.signal.addEventListener("abort", () => rej(Object.assign(new Error("a"), { name: "AbortError" })))));
    const p = translateToGerman({ a: "x" });
    await vi.advanceTimersByTimeAsync(30_001);
    expect(await p).toEqual({ ok: false, message: "Gemini took too long." });
  });
});
