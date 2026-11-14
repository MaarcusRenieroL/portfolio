import { expect, test, type ConsoleMessage } from "@playwright/test";
import { getPosts } from "../../src/lib/data/blog";

const KNOWN_MISSING = /^\/(me\.jpg|projects\/[a-z-]+\.png)$/;
const routes = ["/", "/about", "/projects", "/experience", "/certifications", "/skills", "/resume", "/contact", "/blog"];

test.describe("routes", () => {
  for (const route of routes) {
    test(`${route} returns 200, no console errors, no mobile overflow`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m: ConsoleMessage) => {
        if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text());
      });
      page.on("response", (r) => {
        if (r.status() >= 400 && !KNOWN_MISSING.test(new URL(r.url()).pathname)) errors.push(`HTTP ${r.status()} ${r.url()}`);
      });
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

      const res = await page.goto(route, { waitUntil: "load" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("main, article, body").first()).toBeVisible();
      await page.waitForTimeout(500);
      expect(errors, errors.join("\n")).toEqual([]);

      await page.setViewportSize({ width: 375, height: 800 });
      await page.waitForTimeout(300);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `horizontal overflow ${over}px at 375px`).toBeLessThanOrEqual(0);
    });
  }

  test("unknown URL gives the 404 page", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });

  test("unknown project slug and blog slug are 404", async ({ request }) => {
    expect((await request.get("/projects/nope")).status()).toBe(404);
    expect((await request.get("/blog/nope")).status()).toBe(404);
  });

  test("blog slug traversal attempts are 404, not file reads", async ({ request }) => {
    for (const p of ["/blog/..%2f..%2fREADME", "/blog/%2e%2e%2f%2e%2e%2f%2e%2e%2fAGENTS", "/blog/_template"]) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(404);
    }
  });

  test("/blog/_template is not served (template is published:false)", async ({ request }) => {
    expect((await request.get("/blog/_template")).status()).toBe(404);
  });
});

test.describe("nav", () => {
  const links: [string, RegExp][] = [
    ["Projects", /\/projects$/],
    ["Experience", /\/experience$/],
    ["Certifications", /\/certifications$/],
    ["Skills", /\/skills$/],
    ["Writing", /\/blog$/],
    ["About", /\/about$/],
    ["Resume", /\/resume$/],
    ["Contact", /\/contact$/],
  ];
  // "Writing" only appears once there is something to read (see chrome.tsx / motion.spec.ts).
  const hasPosts = getPosts().length > 0;
  for (const [label, url] of links.filter(([l]) => hasPosts || l !== "Writing")) {
    test(`nav link ${label}`, async ({ page }) => {
      await page.goto("/");
      await page.locator("header, nav").getByRole("link", { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(url);
    });
  }
});

test.describe("assets and metadata", () => {
  test("/api/resume serves pdf as attachment", async ({ request }) => {
    const r = await request.get("/api/resume");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toBe("application/pdf");
    expect(r.headers()["content-disposition"]).toContain("attachment");
    expect(r.headers()["cache-control"]).toContain("no-cache");
    expect((await r.body()).subarray(0, 4).toString()).toBe("%PDF");
  });

  test("/api/resume POST is 405", async ({ request }) => {
    expect((await request.post("/api/resume")).status()).toBe(405);
  });

  test("/og returns png, with defaults and with hostile params", async ({ request }) => {
    for (const q of ["", "?title=Hello&subtitle=World", `?title=${"x".repeat(5000)}&subtitle=${"y".repeat(5000)}`, "?title=%3Cscript%3E&subtitle=%F0%9F%98%80", "?title=&subtitle="]) {
      const r = await request.get(`/og${q}`);
      expect(r.status(), q.slice(0, 40)).toBe(200);
      expect(r.headers()["content-type"]).toContain("image/png");
      expect((await r.body()).subarray(1, 4).toString()).toBe("PNG");
    }
  });

  test("robots.txt", async ({ request }) => {
    const r = await request.get("/robots.txt");
    expect(r.status()).toBe(200);
    const t = await r.text();
    expect(t).toContain("User-Agent: *");
    expect(t).toContain("Sitemap: https://maarcus.dev/sitemap.xml");
  });

  test("sitemap.xml lists all routes, no case studies and no blog posts today", async ({ request }) => {
    const r = await request.get("/sitemap.xml");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("xml");
    const t = await r.text();
    for (const p of ["", "/projects", "/experience", "/certifications", "/skills", "/about", "/contact", "/resume"]) expect(t).toContain(`<loc>https://maarcus.dev${p}</loc>`);
    expect(t).not.toContain("/projects/"); // case studies are gone
    expect(t).not.toContain("/blog"); // the empty blog is neither linked nor in the sitemap until it has posts
  });

  test("document has title, description, lang", async ({ page }) => {
    await page.goto("/");
    expect(await page.title()).not.toBe("");
    expect(await page.locator("html").getAttribute("lang")).toBeTruthy();
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  });

  test("project pages are gone: no links to /projects/<slug> and the old URLs are 404", async ({ page, request }) => {
    await page.goto("/projects");
    expect(await page.$$eval('a[href^="/projects/"]', (as) => as.length)).toBe(0);
    for (const slug of ["nyx", "life-os", "snap-pass", "zentro"]) expect((await request.get(`/projects/${slug}`)).status(), slug).toBe(404);
  });

  test("only /me.jpg (profile photo, not supplied yet) is still requested while missing", async ({ page }) => {
    const missing = new Set<string>();
    page.on("response", (r) => {
      const p = new URL(r.url()).pathname;
      if (r.status() === 404 && /\.(png|jpe?g|webp|svg)$/.test(p)) missing.add(p);
    });
    for (const route of ["/", "/about", "/experience", "/projects", "/skills"]) await page.goto(route, { waitUntil: "load" });
    expect([...missing].sort()).toEqual(["/me.jpg"]);
  });

  test("no broken internal links or images on key pages", async ({ page, request }) => {
    const bad: string[] = [];
    for (const route of ["/", "/projects", "/experience", "/certifications", "/skills", "/about", "/contact"]) {
      await page.goto(route);
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")!).filter((h) => h.startsWith("/") && !h.startsWith("//")));
      for (const h of new Set(hrefs)) {
        const r = await request.get(h.split("#")[0] || "/");
        if (r.status() >= 400) bad.push(`${route} -> ${h} (${r.status()})`);
      }
      const imgs = await page.$$eval("img[src]", (is) => is.map((i) => i.getAttribute("src")!).filter((s) => s.startsWith("/")));
      for (const s of new Set(imgs)) {
        const r = await request.get(s);
        if (r.status() >= 400 && s !== "/me.jpg") bad.push(`${route} img ${s} (${r.status()})`);
      }
    }
    expect(bad).toEqual([]);
  });
});

test.describe("headers", () => {
  test("security headers are set (HSTS is production-only)", async ({ request }) => {
    const h = (await request.get("/")).headers();
    for (const k of ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"]) {
      expect(h[k], k).toBeTruthy();
    }
    expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(h["x-content-type-options"]).toBe("nosniff");
  });
  test("x-powered-by is not exposed", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect("x-powered-by" in h).toBe(false);
  });
});
