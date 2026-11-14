import { describe, expect, it, vi } from "vitest";
import { cn } from "~/lib/utils";
import { formatLongDate, formatMonthYear, formatShortDate, getSafeTime } from "~/lib/utils/date";
import { maintenanceHtml } from "~/lib/maintenance-html";
import { MAINTENANCE } from "~/lib/status";

describe("cn", () => {
  it("merges tailwind conflicts and drops falsy", () => {
    expect(cn("p-2", false, null, undefined, "p-4")).toBe("p-4");
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });
  it("empty", () => expect(cn()).toBe(""));
});

describe("date utils", () => {
  it("formats local-time dates", () => {
    expect(formatMonthYear("2026-11-04T12:00:00")).toBe("nov 2026");
    expect(formatShortDate("2026-11-04T12:00:00")).toBe("nov 4, 2026");
    expect(formatLongDate("2026-11-04T12:00:00")).toBe("november 4, 2026");
  });
  it("returns empty string for invalid", () => {
    for (const f of [formatMonthYear, formatShortDate, formatLongDate]) {
      expect(f("")).toBe("");
      expect(f("garbage")).toBe("");
    }
  });
  it("lower-cases month names (characterization)", () => {
    expect(formatLongDate("2026-01-15T12:00:00")).toMatch(/^january/);
  });
  it("getSafeTime", () => {
    expect(getSafeTime(null)).toBe(0);
    expect(getSafeTime("")).toBe(0);
    expect(getSafeTime("nope")).toBe(0);
    expect(getSafeTime("2026-01-01T00:00:00Z")).toBe(Date.UTC(2026, 0, 1));
  });
  it("date-only ISO strings parse as UTC, so local getters can shift the day (timezone-dependent)", () => {
    const tz = process.env.TZ;
    expect(typeof tz === "string" || tz === undefined).toBe(true);
    const d = new Date("2026-11-04");
    expect(d.getUTCDate()).toBe(4);
  });
});

describe("maintenanceHtml", () => {
  it("renders status content and default retry", () => {
    const h = maintenanceHtml("/about");
    expect(h).toContain(MAINTENANCE.title);
    expect(h).toContain("GET /about");
    expect(h).toContain('var n=30');
    expect(h).toContain("animation:drain 30s");
    expect(h).toContain('content="noindex"');
  });
  it("escapes < > & and double quote in path", () => {
    const h = maintenanceHtml('/<script>alert(1)</script>&"x');
    expect(h).not.toContain("<script>alert(1)");
    expect(h).toContain("GET /&lt;script&gt;alert(1)&lt;/script&gt;&amp;&quot;x");
  });
  it("does not escape single quotes (only matters in attribute context; path is only used in text)", () => {
    expect(maintenanceHtml("/a'b")).toContain("GET /a'b");
  });
  it("custom retry seconds", () => {
    const h = maintenanceHtml("/", 5);
    expect(h).toContain("var n=5");
    expect(h).toContain("drain 5s");
  });
  it("one li per trace line plus the request line", () => {
    const h = maintenanceHtml("/");
    expect((h.match(/<li /g) ?? []).length).toBe(MAINTENANCE.trace.length + 1);
  });
  it("is a complete document", () => {
    const h = maintenanceHtml("/");
    expect(h.startsWith("<!doctype html>")).toBe(true);
    expect(h.trim().endsWith("</html>")).toBe(true);
  });
});

describe("proxy", () => {
  async function load() {
    vi.resetModules();
    return await import("~/proxy");
  }
  const req = (p: string) => ({ nextUrl: { pathname: p } }) as never;

  it("passes through when MAINTENANCE unset", async () => {
    vi.stubEnv("MAINTENANCE", "");
    const { proxy } = await load();
    const res = proxy(req("/"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    vi.unstubAllEnvs();
  });
  it.each(["0", "true", "yes", " 1", "1 "])("MAINTENANCE=%j does NOT enable maintenance (strict '1')", async (v) => {
    vi.stubEnv("MAINTENANCE", v);
    const { proxy } = await load();
    expect(proxy(req("/")).status).toBe(200);
    vi.unstubAllEnvs();
  });
  it("MAINTENANCE=1 answers 503 html with headers", async () => {
    vi.stubEnv("MAINTENANCE", "1");
    const { proxy } = await load();
    const res = proxy(req("/about"));
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("30");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await res.text()).toContain("GET /about");
    vi.unstubAllEnvs();
  });
  it("matcher excludes assets", async () => {
    const { config } = await load();
    const re = new RegExp(`^${config.matcher[0]}$`);
    for (const p of ["/_next/static/a.js", "/favicon.ico", "/icon.svg", "/projects/nyx/a.webp", "/logos/a.svg"]) {
      expect(re.test(p), p).toBe(false);
    }
    for (const p of ["/", "/about", "/api/resume", "/og", "/robots.txt", "/sitemap.xml", "/blog/x"]) {
      expect(re.test(p), p).toBe(true);
    }
  });
  it("matcher keeps /projects pages under maintenance but still skips their images", async () => {
    const { config } = await load();
    const re = new RegExp(`^${config.matcher[0]}$`);
    expect(re.test("/projects/nyx")).toBe(true);
    expect(re.test("/projects")).toBe(true);
    expect(re.test("/projects/nyx/a.webp")).toBe(false);
    expect(re.test("/projects/next-kit/02-cli-demo.mp4")).toBe(false);
  });
});
