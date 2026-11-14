import pg from "pg";
import { expect, test, type BrowserContext } from "@playwright/test";
import { randomToken, sha256 } from "../../src/lib/server/crypto";
import { E2E_DB } from "../../playwright.config";

/**
 * The CMS against a real database. The sign-in chain has its own test (admin.spec.ts), so here a session row is
 * inserted directly and its cookie handed to the browser.
 */
test.skip(!E2E_DB, "needs the local portfolio database");
test.describe.configure({ mode: "serial" });

let db: pg.Pool;

async function signIn(context: BrowserContext) {
  const token = randomToken();
  await db.query("insert into admin_session (id, expires_at) values ($1, now() + interval '2 hours')", [sha256(token)]);
  await context.addCookies([{ name: "adm_s", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Strict" }]);
}

test.beforeAll(async () => {
  db = new pg.Pool({ connectionString: E2E_DB });
  await db.query("truncate content_item, admin_session restart identity");
});
test.afterAll(async () => db?.end());

test("signed-out visitors cannot reach the CMS, its actions or the preview switch", async ({ page, request }) => {
  await page.goto("/admin/content/project");
  await expect(page).toHaveURL(/\/admin\/(login|setup)/);
  expect((await request.get("/api/admin/preview?path=/projects")).status()).toBe(404);
});

test("with an empty database the public site still serves the file content", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator(".rows li")).toHaveCount(2);
  await expect(page.locator(".pname", { hasText: "nyx" })).toBeVisible();
  await expect(page.locator(".pname", { hasText: "dotfiles" })).toHaveCount(0);
});

test("import, edit with autosave and live preview, publish, German, hide", async ({ page, context, browser }) => {
  await signIn(context);
  await page.goto("/admin/content/project");
  await page.getByRole("button", { name: "Import the current site content" }).click();
  await expect(page.locator(".item strong", { hasText: "nyx" })).toBeVisible();
  expect(Number((await db.query("select count(*) n from content_item where kind='project'")).rows[0].n)).toBe(4);

  // Open nyx and change the description.
  await page.goto("/admin/content/project/nyx");
  await expect(page.getByRole("heading", { name: "nyx" })).toBeVisible();
  const frame = page.frameLocator('iframe[title="Live preview of the site"]');
  await expect(frame.locator(".pname", { hasText: "nyx" })).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Description").fill("EDITED-IN-CMS description");
  await expect(page.getByText("Draft saved")).toBeVisible();
  // The preview on the right shows the draft...
  await expect(frame.getByText("EDITED-IN-CMS description")).toBeVisible({ timeout: 20_000 });

  // ...while a visitor still sees the published text.
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto("/projects");
  await expect(visitor.getByText("EDITED-IN-CMS description")).toHaveCount(0);

  // Publish: now visitors see it, immediately.
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  await visitor.goto("/projects");
  await expect(visitor.getByText("EDITED-IN-CMS description")).toBeVisible();

  // German tab: type a German description, publish, and a German visitor sees it.
  await page.getByRole("tab", { name: /Deutsch/ }).click();
  await page.getByLabel("Description").fill("GERMAN-EDIT Beschreibung");
  await expect(page.getByText("Draft saved")).toBeVisible();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  await visitor.context().addCookies([{ name: "lang", value: "de", domain: "localhost", path: "/" }]);
  await visitor.goto("/projects");
  await expect(visitor.getByText("GERMAN-EDIT Beschreibung")).toBeVisible();

  // Show a hidden project: tick off "hidden" on dotfiles and publish.
  await page.goto("/admin/content/project/dotfiles");
  await page.getByLabel("Hidden from the site").uncheck();
  await expect(page.getByText("Draft saved")).toBeVisible();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  await visitor.goto("/projects");
  await expect(visitor.locator(".rows li")).toHaveCount(3);
});

test("validation errors are shown and nothing invalid is saved", async ({ page, context }) => {
  await signIn(context);
  await page.goto("/admin/content/project/new");
  await page.locator("#f-slug").fill("Bad Slug!");
  await page.locator("#f-name").fill("Broken");
  await expect(page.locator("ul.err")).toContainText("slug");
  expect(Number((await db.query("select count(*) n from content_item where key='Bad Slug!'")).rows[0].n)).toBe(0);
});

test("a new item can be created, published and removed", async ({ page, context, browser }) => {
  await signIn(context);
  await page.goto("/admin/content/skillgroup/new");
  await page.locator("#f-name").fill("Zzz Testing");
  await page.getByRole("textbox", { name: /^Skills/ }).fill("Alpha, Beta");
  // The first save moves the page to the item's own URL, which resets the indicator, so wait on the database.
  await expect.poll(async () => Number((await db.query("select count(*) n from content_item where kind='skillgroup' and key='Zzz Testing'")).rows[0].n), { timeout: 15_000 }).toBe(1);
  await expect(page).toHaveURL(/skillgroup\/Zzz%20Testing$/);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published.")).toBeVisible();
  const visitor = await (await browser.newContext()).newPage();
  await visitor.goto("/skills");
  await expect(visitor.getByText("Alpha")).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove from site" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/skillgroup$/);
  await visitor.goto("/skills");
  await expect(visitor.getByText("Alpha")).toHaveCount(0);
});

const BODY = "Intro paragraph.\n\n## First heading\n\nSome text.\n\n## Second heading\n\nMore text.\n\n```ts\nconst x = 1;\n```\n";

for (const [kind, base, tabLabel] of [["note", "/notes", "Notes"], ["post", "/blog", "Writing"]] as const) {
  test(`a ${kind} written in the CMS appears on the site with the heading navigation`, async ({ page, context, browser }) => {
    await signIn(context);
    await page.goto(`/admin/content/${kind}/new`);
    await page.locator("#f-slug").fill(`first-${kind}`);
    await page.locator("#f-title").fill(`My first ${kind}`);
    await page.locator("#f-description").fill("A short summary.");
    await page.locator("#f-date").fill("2026-11-14");
    await page.locator("#f-body").fill(BODY);
    await expect.poll(async () => Number((await db.query("select count(*) n from content_item where kind=$1 and key=$2", [kind, `first-${kind}`])).rows[0].n), { timeout: 15_000 }).toBe(1);
    await expect(page).toHaveURL(new RegExp(`${kind}/first-${kind}$`));
    // The right-hand preview renders the draft article.
    const frame = page.frameLocator('iframe[title="Live preview of the site"]');
    await expect(frame.getByRole("heading", { name: `My first ${kind}` })).toBeVisible({ timeout: 30_000 });

    // Before publishing, a visitor sees nothing.
    const visitor = await (await browser.newContext()).newPage();
    expect((await visitor.goto(`${base}/first-${kind}`))?.status()).toBe(404);

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Published.")).toBeVisible();

    await visitor.goto("/");
    await expect(visitor.locator(".tabs").getByRole("link", { name: tabLabel, exact: true })).toBeVisible();
    await visitor.goto(base);
    await expect(visitor.getByText(`My first ${kind}`)).toBeVisible();
    await visitor.goto(`${base}/first-${kind}`);
    await expect(visitor.getByRole("heading", { level: 1, name: `My first ${kind}` })).toBeVisible();
    const toc = visitor.locator("nav.toc");
    await expect(toc.getByRole("link")).toHaveCount(2);
    await toc.getByRole("link", { name: "Second heading" }).click();
    await expect(visitor).toHaveURL(/#second-heading$/);
    await expect(visitor.locator("pre code")).toContainText("const x = 1");
  });
}
