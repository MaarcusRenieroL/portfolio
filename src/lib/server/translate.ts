import { z } from "zod";
import type { Field } from "../cms-fields";

/**
 * English -> German through the Gemini API (plain fetch, no SDK). It runs only when you press the button in
 * the CMS, never per visitor; the result is saved as a draft marked machine-translated, and you review it.
 */

const MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const translateConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const PROMPT = `You translate website content for a developer's portfolio from English to German.
Rules: use the formal address ("Sie"); keep product names, company names, programming languages, framework names, file names, URLs, numbers and code exactly as they are; keep Markdown formatting and line breaks intact; keep a natural, concise, professional tone (not literal word-for-word); never add or remove information.
You will receive a JSON object. Return ONLY a JSON object with exactly the same keys and the same shapes (string stays string, array of strings stays an array of the same length), with every value translated.`;

export type Translatable = Record<string, string | string[]>;

/** Pick only the German-capable fields out of an item, in the shape Gemini will return. */
export function extractTranslatable(fields: Field[], data: Record<string, unknown>): Translatable {
  const out: Translatable = {};
  for (const f of fields) {
    if (!f.de) continue;
    const v = data[f.name];
    if (f.type === "lines" && Array.isArray(v)) out[f.name] = v.filter((x): x is string => typeof x === "string");
    else if (f.type === "steps" && Array.isArray(v)) out[f.name] = v.map((s) => (s as { note?: string }).note ?? "").filter(Boolean);
    else if (typeof v === "string" && v.trim()) out[f.name] = v;
  }
  return out;
}

export async function translateToGerman(source: Translatable): Promise<{ ok: true; de: Translatable } | { ok: false; message: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, message: "GEMINI_API_KEY is not set." };
  if (Object.keys(source).length === 0) return { ok: true, de: {} };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30_000);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      signal: ctl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPT }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(source) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });
    if (!res.ok) return { ok: false, message: `Gemini returned ${res.status}.` };
    const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return validateShape(source, JSON.parse(text));
  } catch (e) {
    return { ok: false, message: e instanceof Error && e.name === "AbortError" ? "Gemini took too long." : "Translation failed." };
  } finally {
    clearTimeout(timer);
  }
}

/** The reply must mirror the request exactly; anything else is rejected rather than saved. */
export function validateShape(source: Translatable, reply: unknown): { ok: true; de: Translatable } | { ok: false; message: string } {
  const shape = z.object(
    Object.fromEntries(Object.entries(source).map(([k, v]) => [k, Array.isArray(v) ? z.array(z.string()).length(v.length) : z.string()])),
  );
  const p = shape.safeParse(reply);
  if (!p.success) return { ok: false, message: "Gemini returned an unexpected shape; nothing was saved." };
  return { ok: true, de: p.data as Translatable };
}
