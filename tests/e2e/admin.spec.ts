import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { hotp, totpStep } from "../../src/lib/server/crypto";
import { E2E_DB, LINK_FILE } from "../../playwright.config";

/**
 * The whole admin chain in a real browser, with a virtual authenticator that does user verification:
 * setup (link, passkey, authenticator, recovery codes), sign-out, login, and the ways in that must stay shut.
 */
test.skip(!E2E_DB, "needs the local portfolio database");
test.describe.configure({ mode: "serial" });

const EMAIL = "owner@example.com";
const SETUP_TOKEN = "e2e-setup-token-0123456789";
let db: pg.Pool;
let secret = "";
let recovery: string[] = [];

let saved: unknown[] = [];
let lastAuth: { cdp: Awaited<ReturnType<BrowserContext["newCDPSession"]>>; id: string } | null = null;

/** Real authenticators keep their signature counter; carry the updated credentials into the next test. */
async function persist() {
  if (lastAuth) saved = ((await lastAuth.cdp.send("WebAuthn.getCredentials", { authenticatorId: lastAuth.id })) as { credentials: unknown[] }).credentials;
}

/** A virtual device that does user verification. Credentials made in setup are re-added so later tests own the same passkey. */
async function authenticator(context: BrowserContext, page: Page) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  const { authenticatorId } = (await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: { protocol: "ctap2", transport: "internal", hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  })) as { authenticatorId: string };
  for (const credential of saved) await cdp.send("WebAuthn.addCredential", { authenticatorId, credential } as never);
  lastAuth = { cdp, id: authenticatorId };
}

async function readLink() {
  await expect.poll(() => fs.existsSync(LINK_FILE), { timeout: 15_000 }).toBe(true);
  const link = fs.readFileSync(LINK_FILE, "utf8");
  fs.rmSync(LINK_FILE);
  return link;
}

async function startLogin(page: Page, email = EMAIL) {
  fs.rmSync(LINK_FILE, { force: true });
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send me a link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
}

test.beforeAll(async () => {
  db = new pg.Pool({ connectionString: E2E_DB });
  const has = await db.query("select to_regclass('admin_user') t");
  if (!has.rows[0].t) await db.query(fs.readFileSync(path.join("db", "migrations", "001_init.sql"), "utf8"));
  await db.query("truncate admin_user, admin_passkey, admin_recovery_code, admin_attempt, admin_session, audit_log restart identity");
});
test.afterAll(async () => db?.end());
test.beforeEach(async () => {
  await db.query("truncate audit_log restart identity");
});

test("before setup: the admin redirects to setup, and a wrong token or email reveals nothing", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/setup$/);
  for (const [email, token] of [[EMAIL, "wrong-token-wrong-token"], ["intruder@example.com", SETUP_TOKEN]]) {
    fs.rmSync(LINK_FILE, { force: true });
    await page.goto("/admin/setup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Setup token").fill(token);
    await page.getByRole("button", { name: "Send me a link" }).click();
    // Identical answer whether or not anything matched...
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    // ...but no link was actually produced.
    await page.waitForTimeout(500);
    expect(fs.existsSync(LINK_FILE)).toBe(false);
  }
});

test("setup: link, passkey, authenticator, recovery codes, then the admin opens", async ({ page, context }) => {
  await authenticator(context, page);
  fs.rmSync(LINK_FILE, { force: true });
  await page.goto("/admin/setup");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Setup token").fill(SETUP_TOKEN);
  await page.getByRole("button", { name: "Send me a link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();

  await page.goto(await readLink());
  // The token is removed from the address bar once read.
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).not.toHaveURL(/#/);
  await page.getByRole("button", { name: "Create passkey" }).click();
  await expect(page.getByRole("heading", { name: "Add the authenticator" })).toBeVisible({ timeout: 15_000 });
  secret = (await page.locator("code").first().textContent())!.trim();
  await page.getByLabel("6-digit code").fill(hotp(secret, totpStep()));
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page.getByRole("heading", { name: "Save your recovery codes" })).toBeVisible();
  recovery = await page.locator(".codes code").allTextContents();
  expect(recovery).toHaveLength(10);
  await page.getByRole("button", { name: /I saved them/ }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  saved = ((await lastAuth!.cdp.send("WebAuthn.getCredentials", { authenticatorId: lastAuth!.id })) as { credentials: unknown[] }).credentials;
  expect(saved).toHaveLength(1);

  // Setup is closed for good.
  expect((await page.request.get("/admin/setup")).status()).toBe(404);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("login: link, passkey, authenticator code, then in", async ({ page, context }) => {
  await authenticator(context, page);
  await startLogin(page);
  // A wrong email shows the same screen and sends nothing.
  fs.rmSync(LINK_FILE, { force: true });
  await startLogin(page, "intruder@example.com");
  expect(fs.existsSync(LINK_FILE)).toBe(false);

  await startLogin(page);
  await page.goto(await readLink());
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Use your passkey" })).toBeVisible();
  await page.getByRole("button", { name: "Use passkey" }).click();
  await expect(page.getByRole("heading", { name: "Authenticator code" })).toBeVisible({ timeout: 15_000 });
  await page.getByLabel(/6-digit code/).fill(hotp(secret, totpStep() + 1));
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await persist();
});

test("cannot skip the passkey: a valid authenticator code alone gets no session", async ({ page }) => {
  await startLogin(page);
  await page.goto(await readLink());
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Use your passkey" })).toBeVisible();
  const res = await page.request.post("/api/admin/auth/finish", {
    headers: { origin: "http://localhost:3177" },
    data: { kind: "login", code: hotp(secret, totpStep() + 1) },
  });
  expect(res.status()).toBe(401);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("cannot skip the magic link: the passkey step is closed without it", async ({ page }) => {
  await startLogin(page);
  const res = await page.request.post("/api/admin/auth/passkey-options", { headers: { origin: "http://localhost:3177" }, data: { kind: "login" } });
  expect(res.status()).toBe(401);
});

test("the magic link does nothing in a different browser", async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  await startLogin(a);
  const link = await readLink();
  const other = await (await browser.newContext()).newPage();
  await other.goto(link);
  await other.getByRole("button", { name: "Continue" }).click();
  await expect(other.getByRole("heading", { name: "Start again" })).toBeVisible();
});

test("the API refuses foreign origins, missing origins and GET", async ({ page, request }) => {
  const body = { kind: "login", email: EMAIL };
  expect((await request.post("/api/admin/auth/start", { headers: { origin: "https://evil.example" }, data: body })).status()).toBe(403);
  expect((await request.post("/api/admin/auth/start", { data: body })).status()).toBe(403);
  expect((await page.request.get("/api/admin/auth/start")).status()).toBe(405);
  const res = await request.get("/admin/login");
  expect(res.headers()["cache-control"]).toContain("no-store");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
});

test("a recovery code replaces the authenticator code, once", async ({ page, context }) => {
  await authenticator(context, page);
  for (const attempt of [1, 2]) {
    await startLogin(page);
    await page.goto(await readLink());
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Use passkey" }).click();
    await expect(page.getByRole("heading", { name: "Authenticator code" })).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/6-digit code/).fill(recovery[0]);
    await page.getByRole("button", { name: "Sign in" }).click();
    if (attempt === 1) {
      await expect(page).toHaveURL(/\/admin$/);
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/admin\/login/);
    } else {
      await expect(page.getByText("That code was not accepted.")).toBeVisible();
      await expect(page).not.toHaveURL(/\/admin$/);
    }
  }
});

test("admin pages are not in the sitemap or robots-allowed, and the public site is unaffected", async ({ request, page }) => {
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin");
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
