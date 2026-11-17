import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DICT, dict } from "~/lib/dict";
import { LANGS } from "~/lib/i18n";

/** EN and DE must have the same shape (a missing translation is a bug), and every message function must behave. */

type Leaf = { path: string; value: unknown };
function walk(v: unknown, path: string, out: Leaf[] = []): Leaf[] {
  if (typeof v === "function" || typeof v === "string" || typeof v === "number" || typeof v === "boolean") out.push({ path, value: v });
  else if (Array.isArray(v)) {
    out.push({ path: `${path}#len`, value: v.length });
    v.forEach((x, i) => walk(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const k of Object.keys(v).sort()) walk((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k, out);
  } else out.push({ path, value: v });
  return out;
}
const kind = (v: unknown) => (typeof v === "number" && true ? "number" : typeof v);

/** `errors` maps are English-message -> translation lookups (empty in EN, which passes the message through), so they are checked separately. */
const isErrMap = (path: string) => /^(booking|contact)\.errors(\.|$)/.test(path);
const en = walk(DICT.en, "").filter((l) => !isErrMap(l.path));
const de = walk(DICT.de, "").filter((l) => !isErrMap(l.path));

describe("dict shape", () => {
  it("dict(lang) returns the table for that language", () => {
    expect(dict("en")).toBe(DICT.en);
    expect(dict("de")).toBe(DICT.de);
    expect(Object.keys(DICT).sort()).toEqual([...LANGS].sort());
  });
  it("EN and DE have exactly the same keys (no untranslated or stray keys)", () => {
    const e = new Set(en.map((l) => l.path));
    const d = new Set(de.map((l) => l.path));
    expect([...e].filter((p) => !d.has(p))).toEqual([]);
    expect([...d].filter((p) => !e.has(p))).toEqual([]);
  });
  it("matching keys have the same type (string vs function vs list length)", () => {
    const d = new Map(de.map((l) => [l.path, l.value]));
    const bad = en.filter((l) => d.has(l.path) && (kind(l.value) !== kind(d.get(l.path)) || (l.path.endsWith("#len") && l.value !== d.get(l.path)))).map((l) => l.path);
    expect(bad).toEqual([]);
  });
  it("message functions take the same number of arguments in both languages", () => {
    const d = new Map(de.map((l) => [l.path, l.value]));
    const bad = en
      .filter((l) => typeof l.value === "function" && typeof d.get(l.path) === "function" && (l.value as () => void).length !== (d.get(l.path) as () => void).length)
      .map((l) => l.path);
    expect(bad).toEqual([]);
  });
  it("no empty strings and no leftover placeholders in either language", () => {
    for (const l of [...en.map((x) => ({ ...x, lang: "en" })), ...de.map((x) => ({ ...x, lang: "de" }))]) {
      if (typeof l.value !== "string") continue;
      if (l.path !== "chrome.aiNote") expect(l.value.trim(), `${l.lang}:${l.path}`).not.toBe(""); // EN has no AI note on purpose
      expect(l.value, `${l.lang}:${l.path}`).not.toMatch(/undefined|\[object|TODO|FIXME|lorem/i);
    }
  });
  it("every page has a meta entry as [title, description] in both languages", () => {
    for (const lang of LANGS) {
      for (const [page, v] of Object.entries(DICT[lang].meta.pages)) {
        expect(Array.isArray(v) && v.length === 2 && v.every((s) => typeof s === "string" && s.length > 0), `${lang}:${page}`).toBe(true);
      }
    }
    expect(Object.keys(DICT.en.meta.pages)).toEqual(Object.keys(DICT.de.meta.pages));
  });
  // BUG: src/lib/dict.ts says German uses the formal "Sie", but the booking dialog (lines 692-706) uses informal "du".
  it("German uses the formal Sie everywhere", () => {
    const informal = /\b(?:du|dir|dich|dein|deine|deinen|deiner|deinem|Dein|Wähle)\b/;
    const hits = de.filter((l) => typeof l.value === "string" && informal.test(l.value)).map((l) => l.path);
    expect(hits).toEqual([]);
  });
});

/** Probe arguments chosen by parameter name (types are erased at runtime). */
const NUMERIC = new Set(["n", "shown", "total", "own", "forks"]);
function probes(fn: (...a: never[]) => unknown): unknown[][] {
  const names = /^\(?([^)=]*?)\)?\s*=>/.exec(fn.toString())?.[1]?.split(",").map((x) => x.trim()) ?? [];
  const sets: unknown[][] = [];
  for (const num of [0, 1, 2, 42]) {
    for (const str of ["x", "Süß <b>&\"q\"</b>", "light"]) {
      sets.push(names.map((nm) => (NUMERIC.has(nm) ? num : nm === "filtered" ? num % 2 === 0 : str)));
    }
  }
  return sets;
}

describe("server error translations", () => {
  it("EN passes server messages through (empty map)", () => {
    expect(DICT.en.booking.errors).toEqual({});
    expect(DICT.en.contact.errors).toEqual({});
  });
  it("every German key is a message the server really emits (a renamed message silently loses its translation)", () => {
    const files: string[] = [];
    const walkDir = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const f = path.join(d, e.name);
        if (e.isDirectory()) walkDir(f);
        else if (/\.tsx?$/.test(e.name) && f !== path.join("src", "lib", "dict.ts")) files.push(f);
      }
    };
    walkDir("src");
    const corpus = files.map((f) => fs.readFileSync(f, "utf8")).join("\n").replace(/\\'/g, "'");
    const stale: string[] = [];
    for (const group of ["booking", "contact"] as const) {
      for (const [msg, de] of Object.entries(DICT.de[group].errors as Record<string, string>)) {
        if (!corpus.includes(msg)) stale.push(`${group}: ${msg}`);
        expect(de.trim().length).toBeGreaterThan(0);
        expect(de).not.toBe(msg);
      }
    }
    expect(stale).toEqual([]);
  });
});

describe("message functions", () => {
  for (const lang of LANGS) {
    const fns = walk(DICT[lang], "").filter((l) => typeof l.value === "function" && !isErrMap(l.path));
    it(`${lang}: ${fns.length} functions return non-empty, clean strings for all probe inputs`, () => {
      expect(fns.length).toBeGreaterThan(30);
      for (const { path, value } of fns) {
        for (const args of probes(value as never)) {
          const out = (value as (...a: unknown[]) => unknown)(...args);
          expect(typeof out, `${lang}:${path}(${JSON.stringify(args)})`).toBe("string");
          expect((out as string).trim().length, `${lang}:${path}`).toBeGreaterThan(0);
          expect(out as string, `${lang}:${path}`).not.toMatch(/NaN|undefined|\[object/);
        }
      }
    });
  }
  it("English pluralises correctly", () => {
    const e = DICT.en;
    expect(e.skills.count(1, false)).toBe("1 skill");
    expect(e.skills.count(2, false)).toBe("2 skills");
    expect(e.skills.count(0, false)).toBe("0 skills");
    expect(e.skills.count(3, true)).toBe("3 skills match");
    expect(e.certs.count(1)).toBe("1 certification");
    expect(e.certs.count(5)).toBe("5 certifications");
    expect(e.home.activityDay(0, "May 1")).toBe("No contributions on May 1");
    expect(e.home.activityDay(1, "May 1")).toBe("1 contribution on May 1");
    expect(e.home.activityDay(2, "May 1")).toBe("2 contributions on May 1");
  });
  it("German pluralises and inflects correctly", () => {
    const d = DICT.de;
    expect(d.skills.count(1, false)).toBe("1 Skill");
    expect(d.skills.count(1, true)).toBe("1 Skill passt");
    expect(d.skills.count(3, true)).toBe("3 Skills passen");
    expect(d.certs.count(1)).toBe("1 Zertifizierung");
    expect(d.certs.count(2)).toBe("2 Zertifizierungen");
    expect(d.home.activityDay(0, "1. Mai")).toBe("Keine Beiträge am 1. Mai");
    expect(d.home.activityDay(1, "1. Mai")).toBe("1 Beitrag am 1. Mai");
    expect(d.home.activityDay(7, "1. Mai")).toBe("7 Beiträge am 1. Mai");
    expect(d.chrome.themeTo("light")).toBe("Zum hellen Design wechseln");
    expect(d.chrome.themeTo("dark")).toBe("Zum dunklen Design wechseln");
  });
});
