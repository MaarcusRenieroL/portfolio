import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Branch coverage for server helpers and API routes: presence, schedule, upload, settings, seed, store,
 * system, translate, analytics limiter, backup, db, r2, blog parser, contact validation.
 * The database, Resend, Gemini and R2 are all stubbed. No test here opens a real connection.
 */
const m = vi.hoisted(() => ({
  q: vi.fn(),
  hasDb: true,
  hdrs: new Map<string, string>(),
  after: vi.fn(),
  prune: vi.fn(async () => undefined),
  send: vi.fn(),
  presign: vi.fn(),
  admin: true,
  audit: vi.fn(async () => {}),
  slots: null as Date[] | null,
}));

vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => m.hdrs.get(k.toLowerCase()) ?? null }) }));
vi.mock("next/server", async (orig) => ({ ...(await orig<typeof import("next/server")>()), after: m.after }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn(), unstable_cache: (f: unknown) => f }));
// pool(): a client that runs transaction control itself and sends real queries to m.q, like query() does.
vi.mock("~/lib/server/db", () => ({
  hasDb: () => m.hasDb,
  query: (...a: unknown[]) => m.q(...a),
  pool: () => ({
    connect: async () => ({
      query: async (sql: string, p?: unknown[]) => (/^(begin|commit|rollback|savepoint|release)/i.test(sql) ? { rows: [] } : m.q(sql, p)),
      release: () => {},
    }),
  }),
}));
vi.mock("~/lib/server/session", () => ({ isAdmin: async () => m.admin, requireAdmin: async () => {} }));
vi.mock("~/lib/server/retention", () => ({ pruneOldData: m.prune }));
vi.mock("~/lib/server/crypto", async (orig) => ({ ...(await orig<typeof import("~/lib/server/crypto")>()), dailyHash: (ip: string, ua: string) => `h(${ip}|${ua})` }));
vi.mock("resend", () => ({ Resend: class { emails = { send: m.send }; } }));
vi.mock("~/lib/server/r2", async (orig) => ({ ...(await orig<typeof import("~/lib/server/r2")>()), presignUpload: (...a: unknown[]) => m.presign(...a) }));
vi.mock("~/lib/server/media", () => ({ storageConfigured: () => true, afterPublish: async () => {} }));
vi.mock("~/lib/server/auth", () => ({ audit: (...a: unknown[]) => (m.audit as (...x: unknown[]) => unknown)(...a) }));
vi.mock("~/lib/server/human", () => ({ humanCheckEnabled: () => false, humanOk: async () => true }));
vi.mock("~/lib/booking", async (orig) => {
  const real = await orig<typeof import("~/lib/booking")>();
  return { ...real, upcomingSlots: (...a: Parameters<typeof real.upcomingSlots>) => m.slots ?? real.upcomingSlots(...a) };
});

import { GET as presenceGET } from "~/app/api/presence/route";
import { GET as schedGET, POST as schedPOST } from "~/app/api/schedule/route";
import { POST as uploadPOST } from "~/app/api/admin/media/upload/route";
import { saveSettings } from "~/app/admin/settings-actions";
import { sendContactMessage } from "~/lib/actions/contact";
import { defaultSettings } from "~/lib/settings";
import { upcomingSlots } from "~/lib/booking";
import { record } from "~/lib/server/analytics";
import { backupFileName, buildBackup } from "~/lib/server/backup";
import { hasDb, pool, query } from "~/lib/server/db";
import { copyToPublic } from "~/lib/server/r2";
import { seedFromFiles } from "~/lib/server/seed";
import { renameRow } from "~/lib/server/store";
import { checkDatabase } from "~/lib/server/system";
import { translateToGerman } from "~/lib/server/translate";
import { ROLES_DE, PROJECTS_DE, EDUCATION_DE, SKILL_GROUPS_DE, CERTS_DE } from "~/lib/content-de";
import { ALL_PROJECT_DATA, CERTIFICATES, EDUCATION, ROLES, SKILLS } from "~/lib/content";
import { formatBytes } from "~/lib/media";
import { maintenanceHtml } from "~/lib/maintenance-html";
import { MAINTENANCE } from "~/lib/status";

beforeEach(() => {
  m.q.mockReset();
  m.hasDb = true;
  m.hdrs = new Map();
  m.after.mockReset();
  m.prune.mockClear();
  m.send.mockReset();
  m.presign.mockReset();
  m.admin = true;
  m.audit.mockClear();
  m.slots = null;
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("RESEND_EMAIL", "");
  vi.stubEnv("MY_EMAIL", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("/api/presence with sparse upstream data", () => {
  const lanyard = (data: unknown) => vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: true, data }) })));

  it("missing status, no activities and no spotify object all degrade to safe defaults", async () => {
    lanyard({});
    const b = await (await presenceGET()).json();
    expect(b).toEqual({ discord_status: "offline", listening_to_spotify: false, spotify: null, activities: [] });
  });

  it("listening with a spotify object that has no fields yields empty strings and no track id", async () => {
    lanyard({ discord_status: "online", listening_to_spotify: true, spotify: {} });
    const b = await (await presenceGET()).json();
    expect(b.listening_to_spotify).toBe(true);
    expect(b.spotify).toEqual({ song: "", artist: "" });
  });

  it("listening flag without a spotify object is not 'listening'", async () => {
    lanyard({ discord_status: "idle", listening_to_spotify: true, spotify: null });
    const b = await (await presenceGET()).json();
    expect(b.listening_to_spotify).toBe(false);
    expect(b.spotify).toBeNull();
  });

  it("activities with missing name/type become '' and 0, and keep details/state when present", async () => {
    lanyard({ activities: [{}, { name: "Code", type: 0, details: "repo", state: "editing" }] });
    const b = await (await presenceGET()).json();
    expect(b.activities[0]).toEqual({ name: "", type: 0 });
    expect(b.activities[1]).toEqual({ name: "Code", type: 0, details: "repo", state: "editing" });
  });

  it("a valid track id is passed through", async () => {
    lanyard({ listening_to_spotify: true, spotify: { song: "S", artist: "A", track_id: "4uLU6hMCjMI75M1A2tKUQC" } });
    expect((await (await presenceGET()).json()).spotify.track_id).toBe("4uLU6hMCjMI75M1A2tKUQC");
  });

  it("LANYARD_USER_ID overrides the default user in the request URL", async () => {
    vi.stubEnv("LANYARD_USER_ID", "42");
    vi.resetModules();
    const { GET } = await import("~/app/api/presence/route");
    const f = vi.fn(async () => ({ json: async () => ({ success: true, data: {} }) }));
    vi.stubGlobal("fetch", f);
    await GET();
    expect(String((f.mock.calls[0] as unknown[])[0])).toMatch(/\/users\/42$/);
  });
});

describe("/api/schedule edge paths", () => {
  const mail = () => {
    vi.stubEnv("RESEND_API_KEY", "k");
    vi.stubEnv("RESEND_EMAIL", "from@example.com");
    vi.stubEnv("MY_EMAIL", "host@example.com");
  };
  const body = (o: Record<string, unknown> = {}) => ({ name: "Ada Lovelace", email: "ada@example.com", duration: 30, start: upcomingSlots()[0].toISOString(), timezone: "Europe/Berlin", notes: "", ...o });
  const post = (b: unknown) => schedPOST(new Request("http://localhost/api/schedule", { method: "POST", body: JSON.stringify(b) }));

  it("GET returns an empty list and never queries when the booking window has no slots", async () => {
    m.slots = [];
    expect(await (await schedGET()).json()).toEqual({ taken: [] });
    expect(m.q).not.toHaveBeenCalled();
  });

  it("a failed host email without a database skips the slot release and answers 502", async () => {
    mail();
    m.hasDb = false;
    m.hdrs = new Headers({ "x-real-ip": "9.9.9.9" }) as unknown as Map<string, string>;
    m.send.mockResolvedValue({ error: { message: "nope" } });
    const r = await post(body());
    expect(r.status).toBe(502);
    expect(m.q).not.toHaveBeenCalled();
  });

  it("a failed host email with a database releases the reserved slot, and a failing release is swallowed", async () => {
    mail();
    m.hdrs = new Headers({ "x-real-ip": "9.9.9.8" }) as unknown as Map<string, string>;
    m.send.mockResolvedValue({ error: { message: "nope" } });
    m.q.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error("release failed"));
    const r = await post(body({ notes: "agenda" }));
    expect(r.status).toBe(502);
    expect(String(m.q.mock.calls[1][0])).toContain("delete from meeting_booking");
  });
});

describe("/api/admin/media/upload error mapping", () => {
  const req = (b: unknown) => new Request("http://localhost/api/admin/media/upload", { method: "POST", body: JSON.stringify(b) });
  const ENV = { R2_ACCOUNT_ID: "acct", R2_ACCESS_KEY_ID: "AKID", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_PUBLIC: "pubb", R2_BUCKET_PRIVATE: "privb", NEXT_PUBLIC_ASSETS_URL: "https://assets.test" };
  afterEach(() => vi.unstubAllEnvs());

  it("a signing failure (Error or not) becomes a 502 without leaking the message", async () => {
    m.admin = true;
    Object.entries(ENV).forEach(([k, v]) => vi.stubEnv(k, v));
    for (const err of [new Error("secret detail"), "boom"]) {
      m.presign.mockRejectedValueOnce(err);
      const r = await uploadPOST(req({ name: "a.png", contentType: "image/png", size: 5 }));
      expect(r.status).toBe(502);
      expect(await r.json()).toEqual({ error: "Couldn't start the upload." });
    }
  });

  it("a signed-out request is 401 before R2 or the body are looked at", async () => {
    m.admin = false;
    expect((await uploadPOST(req({}))).status).toBe(401);
    expect(m.presign).not.toHaveBeenCalled();
  });
});

describe("saveSettings failure shapes", () => {
  it("a non-Error thrown while writing reports the generic message", async () => {
    m.q.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce("disk full");
    const r = await saveSettings(defaultSettings());
    expect(r).toEqual({ ok: false, errors: ["Couldn't save."] });
  });
});

describe("analytics limiter", () => {
  const UA = "Mozilla/5.0 Safari";

  it("prunes expired visitors once more than 5000 distinct keys have been seen, and keeps live ones", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
      m.q.mockResolvedValue({ rows: [] });
      m.admin = false;
      m.hdrs.set("user-agent", UA);
      for (let i = 0; i < 5001; i++) {
        m.hdrs.set("x-real-ip", `10.${i >> 8}.${i & 255}.1`);
        await record("view", "/");
      }
      // 61s later every earlier key is stale; the next visitor triggers the sweep (size > 5000).
      vi.setSystemTime(new Date("2030-01-01T00:01:01Z"));
      m.hdrs.set("x-real-ip", "203.0.113.7");
      expect(await record("view", "/")).toBe(true);
      // A fresh key right after still passes: the sweep did not drop it.
      expect(await record("view", "/")).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  }, 30000);
});

describe("backup", () => {
  it("empty list for a missing table (42P01), rethrow for any other error, default timestamp used", async () => {
    m.q.mockImplementation(async () => { throw Object.assign(new Error("relation does not exist"), { code: "42P01" }); });
    const b = await buildBackup();
    expect(b.counts).toEqual({ content: 0, versions: 0, settings: 0, media: 0 });
    expect(Number.isNaN(Date.parse(b.exportedAt))).toBe(false);
    m.q.mockImplementation(async () => { throw Object.assign(new Error("permission denied"), { code: "42501" }); });
    await expect(buildBackup()).rejects.toThrow("permission denied");
    m.q.mockImplementation(async () => { throw new Error("no code"); });
    await expect(buildBackup()).rejects.toThrow("no code");
    expect(backupFileName()).toMatch(/^portfolio-content-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("db module guards", () => {
  it("pool() and query() throw a clear error when DATABASE_URL is missing, hasDb is false", async () => {
    vi.resetModules();
    vi.doUnmock("~/lib/server/db");
    vi.stubEnv("DATABASE_URL", "");
    const real = await vi.importActual<typeof import("~/lib/server/db")>("~/lib/server/db");
    expect(real.hasDb()).toBe(false);
    expect(() => real.pool()).toThrow("DATABASE_URL is not set");
    await expect(real.query("select 1")).rejects.toThrow("DATABASE_URL is not set");
    // The mocked module (the one every other test sees) is untouched.
    expect(typeof hasDb).toBe("function");
    expect(typeof pool).toBe("function");
    expect(typeof query).toBe("function");
  });
});

describe("r2.copyToPublic", () => {
  const ENV = { R2_ACCOUNT_ID: "acct", R2_ACCESS_KEY_ID: "AKID", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_PUBLIC: "pubb", R2_BUCKET_PRIVATE: "privb", NEXT_PUBLIC_ASSETS_URL: "https://assets.test" };

  it("an SVG is published as an attachment so a direct visit downloads instead of running script", async () => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v);
    const f = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", f);
    await copyToPublic("media/a.svg", "image/svg+xml");
    const req = (f.mock.calls[0] as unknown[])[0] as Request;
    expect(req.headers.get("content-disposition")).toBe("attachment");
    await copyToPublic("media/a.png", "image/png");
    expect(((f.mock.calls[1] as unknown[])[0] as Request).headers.get("content-disposition")).toBeNull();
  });
});

describe("seed: rows without a German translation", () => {
  const restore: (() => void)[] = [];
  afterEach(() => restore.splice(0).reverse().forEach((f) => f()));
  const drop = <T extends object>(obj: T, key: string) => {
    const k = key as keyof T;
    const old = obj[k];
    delete obj[k];
    restore.push(() => { obj[k] = old; });
  };

  it("inserts German as null when missing and counts skipped rows from a null rowCount", async () => {
    drop(PROJECTS_DE, ALL_PROJECT_DATA[0].slug);
    drop(ROLES_DE, ROLES[0].org);
    drop(EDUCATION_DE, EDUCATION[0].school);
    drop(SKILL_GROUPS_DE, SKILLS.used[0].name);
    drop(CERTS_DE, CERTIFICATES[0].slug);
    m.q.mockResolvedValue({ rowCount: null });
    const total = ALL_PROJECT_DATA.length + ROLES.length + EDUCATION.length + SKILLS.used.length + CERTIFICATES.length;
    expect(await seedFromFiles()).toEqual({ inserted: 0, skipped: total });
    const deParams = m.q.mock.calls.map((c) => (c[1] as unknown[])[4]);
    expect(deParams.filter((d) => d === null)).toHaveLength(5);
    expect(m.q).toHaveBeenCalledTimes(total);
  });

  it("with translations present, the German column carries JSON, and inserted rows are counted", async () => {
    m.q.mockResolvedValue({ rowCount: 1 });
    const r = await seedFromFiles();
    expect(r.skipped).toBe(0);
    expect(r.inserted).toBeGreaterThan(0);
    const roleCall = m.q.mock.calls.find((c) => (c[1] as unknown[])[0] === "role")!;
    const de = JSON.parse((roleCall[1] as string[])[4]);
    expect("place" in de).toBe(false);
  });

  it("a skill group with a German name is stored as { name }", async () => {
    m.q.mockResolvedValue({ rowCount: 1 });
    await seedFromFiles();
    const g = m.q.mock.calls.find((c) => (c[1] as unknown[])[0] === "skillgroup")!;
    expect(JSON.parse((g[1] as string[])[4])).toEqual({ name: SKILL_GROUPS_DE[SKILLS.used[0].name] });
  });
});

describe("store.renameRow", () => {
  it("is true only when a row changed; a null rowCount counts as no change", async () => {
    m.q.mockResolvedValueOnce({ rowCount: 1 });
    expect(await renameRow("project", "a", "b")).toBe(true);
    m.q.mockResolvedValueOnce({ rowCount: 0 });
    expect(await renameRow("project", "a", "b")).toBe(false);
    m.q.mockResolvedValueOnce({ rowCount: null });
    expect(await renameRow("project", "a", "b")).toBe(false);
  });
});

describe("system.checkDatabase", () => {
  it("reports a fixed reason, never the driver's text (which can name the host and user)", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://x");
    m.q.mockRejectedValueOnce("weird");
    expect((await checkDatabase()).detail).toBe("Not reachable: the connection failed.");
    m.q.mockRejectedValueOnce(Object.assign(new Error("connect ECONNREFUSED 10.0.0.5:5432"), { code: "ECONNREFUSED" }));
    expect((await checkDatabase()).detail).toBe("Not reachable: nothing is listening at that address.");
  });
});

describe("translateToGerman unusual Gemini bodies", () => {
  const body = (b: unknown) => vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => b })));
  beforeEach(() => vi.stubEnv("GEMINI_API_KEY", "k"));

  it("no candidates, no parts, or parts without text all end as a failed translation, never a throw", async () => {
    for (const b of [{}, { candidates: [] }, { candidates: [{}] }, { candidates: [{ content: { parts: [{}] } }] }]) {
      body(b);
      expect(await translateToGerman({ a: "x" })).toEqual({ ok: false, message: "Translation failed." });
    }
  });

  it("joins multi-part text before parsing", async () => {
    body({ candidates: [{ content: { parts: [{ text: '{"a":' }, { text: '"y"}' }] } }] });
    expect(await translateToGerman({ a: "x" })).toEqual({ ok: true, de: { a: "y" } });
  });
});

describe("contact validation", () => {
  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  it("keeps only the first message per field when a field has several issues", async () => {
    const r = await sendContactMessage({ status: "idle" } as never, fd({ name: "", email: "nope", message: "" }));
    expect(r.status).toBe("error");
    for (const v of Object.values(r.fieldErrors ?? {})) expect(typeof v).toBe("string");
    expect(Object.keys(r.fieldErrors ?? {}).length).toBeGreaterThan(0);
  });

  it("two issues on one field report only the first", async () => {
    const r = await sendContactMessage({ status: "idle" } as never, fd({ name: "Ada Lovelace", email: `${"a".repeat(250)}`, reason: "hi", message: "long enough message" }));
    expect(r.status).toBe("error");
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(["email"]);
    expect(r.fieldErrors?.email).toBe("Please enter a valid email");
    expect(m.send).not.toHaveBeenCalled();
  });

  it("an entirely empty form is rejected without sending", async () => {
    const r = await sendContactMessage({ status: "idle" } as never, new FormData());
    expect(r.status).toBe("error");
    expect(m.send).not.toHaveBeenCalled();
  });
});

describe("small formatters", () => {
  it("formatBytes: one decimal under 10 KB, none above, MB with one decimal", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1023)).toBe("1023 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(10 * 1024 - 1)).toBe("10.0 KB");
    expect(formatBytes(10 * 1024)).toBe("10 KB");
    expect(formatBytes(1024 * 1024 - 1)).toBe("1024 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("maintenanceHtml escapes the path and defaults every trace line's tone to 'ok'", () => {
    const html = maintenanceHtml('/<script>"x"&', 7);
    expect(html).toContain("&lt;script&gt;&quot;x&quot;&amp;");
    expect(html).not.toContain("<script>\"x\"");
    expect(html).toContain('<span id="s">7</span>');
    expect(html).toContain('class="dim"');
  });
});

describe("maintenance trace without a tone", () => {
  it("a trace line with no tone renders as ok (a check mark)", () => {
    const orig = MAINTENANCE.trace;
    (MAINTENANCE as { trace: unknown }).trace = [...orig, { text: "no tone line" }];
    try {
      const html = maintenanceHtml("/", 5);
      expect(html).toMatch(/<li class="ok"[^>]*><b>✓<\/b>no tone line<\/li>/);
    } finally {
      (MAINTENANCE as { trace: unknown }).trace = orig;
    }
  });
});

describe("blog frontmatter oddities", () => {
  it("lines without a colon, empty keys and a missing closing newline are ignored, not fatal", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-cov-"));
    fs.mkdirSync(path.join(root, "src/content/blog"), { recursive: true });
    fs.writeFileSync(path.join(root, "src/content/blog/odd.md"), '---\ntitle: "Odd"\njust some words\n: no key here\ndate: "2026-01-01"\n---\nBody');
    fs.writeFileSync(path.join(root, "src/content/blog/empty.md"), "---\ntitle: E\n---");
    try {
      vi.spyOn(process, "cwd").mockReturnValue(root);
      vi.resetModules();
      const blog = await import("~/lib/data/blog");
      const p = blog.getPost("odd")!;
      expect(p.title).toBe("Odd");
      expect(p.date).toBe("2026-01-01");
      expect(p.content).toBe("Body");
      expect(blog.getPost("empty")?.title).toBe("E");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
