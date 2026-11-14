import { expect, test } from "@playwright/test";
import pg from "pg";
import crypto from "node:crypto";
import { E2E_DB } from "../../playwright.config";

test.skip(!E2E_DB, "needs the local test database");
test.use({ userAgent: "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15" });

const count = async (where: string) => {
  const c = new pg.Client({ connectionString: E2E_DB });
  await c.connect();
  try {
    return Number((await c.query(`select count(*) n from site_event where ${where}`)).rows[0].n);
  } finally {
    await c.end();
  }
};

test("a visit and a social click are counted; a bot and Do Not Track are not", async ({ page, browser }) => {
  const before = await count("kind='view'");
  await page.goto("/contact");
  await expect.poll(() => count("kind='view'")).toBeGreaterThan(before);

  const socials = await count("kind='social-click'");
  await page.locator('a[data-track="social-click"]').first().evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
  await page.locator('a[data-track="social-click"]').first().click();
  await expect.poll(() => count("kind='social-click'")).toBeGreaterThan(socials);

  const stable = await count("true");
  const bot = await browser.newContext({ userAgent: "Googlebot/2.1" });
  await (await bot.newPage()).goto("/");
  const dnt = await browser.newContext({ userAgent: "Mozilla/5.0 Safari/605", extraHTTPHeaders: { DNT: "1" } });
  await (await dnt.newPage()).goto("/");
  await new Promise((r) => setTimeout(r, 800));
  expect(await count("true")).toBe(stable);
  await bot.close();
  await dnt.close();
});

test("a resume download is counted by the server, and the owner is not counted", async ({ request, browser }) => {
  const before = await count("kind='resume-download'");
  expect((await request.get("/api/resume", { headers: { "user-agent": "Mozilla/5.0 Test" } })).status()).toBeLessThan(500);
  await expect.poll(() => count("kind='resume-download'")).toBeGreaterThan(before);

  const token = crypto.randomBytes(24).toString("hex");
  const c = new pg.Client({ connectionString: E2E_DB });
  await c.connect();
  await c.query("insert into admin_session (id, expires_at) values ($1, now() + interval '1 hour')", [crypto.createHash("sha256").update(token).digest("hex")]);
  await c.end();
  const owner = await browser.newContext({ baseURL: "http://localhost:3177", userAgent: "Mozilla/5.0 Owner" });
  await owner.addCookies([{ name: "adm_s", value: token, url: "http://localhost:3177" }]);
  const stable = await count("true");
  await (await owner.newPage()).goto("/skills");
  await new Promise((r) => setTimeout(r, 800));
  expect(await count("true")).toBe(stable);

  const page = await owner.newPage();
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await page.goto("/admin/security");
  await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  await owner.close();
});
