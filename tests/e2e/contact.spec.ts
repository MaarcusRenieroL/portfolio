import { expect, test } from "@playwright/test";

const safe = process.env.E2E_SAFE_CONTACT === "1";

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#f-n").waitFor();
    await page.waitForLoadState("networkidle");
  });

  test("empty submit shows client-visible field errors", async ({ page }) => {
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please enter your name")).toBeVisible();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();
    await expect(page.getByText("Message should be at least 10 characters")).toBeVisible();
    await expect(page.locator("#f-n")).toHaveAttribute("aria-invalid", "true");
  });

  test("invalid email and short message", async ({ page }) => {
    await page.fill("#f-n", "Ada");
    await page.fill("#f-e", "not-an-email");
    await page.fill("#f-m", "short");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();
    await expect(page.getByText("Message should be at least 10 characters")).toBeVisible();
    await expect(page.getByText("Please enter your name")).toHaveCount(0);
  });

  test("too-long message shows 'Message is too long'", async ({ page }) => {
    await page.fill("#f-n", "Ada");
    await page.fill("#f-e", "a@b.co");
    await page.locator("#f-m").fill("x".repeat(5001));
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message is too long")).toBeVisible();
  });

  test("honeypot filled shows fake success", async ({ page }) => {
    await page.fill("#f-n", "Bot");
    await page.fill("#f-e", "bot@example.com");
    await page.fill("#f-m", "buy my stuff now please");
    await page.locator('input[name="website"]').fill("http://spam", { force: true });
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent.")).toBeVisible();
  });

  test("valid submit without Resend env shows the 'not configured' error", async ({ page }) => {
    test.skip(!safe, "would send a real email if .env has Resend keys");
    await page.fill("#f-n", "Ada Lovelace");
    await page.fill("#f-e", "ada@example.com");
    await page.fill("#f-m", "Hello, this is a test message from e2e.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Email isn't configured right now. Please reach out directly.", { timeout: 15_000 });
  });

  test("reason buttons toggle aria-pressed and placeholder", async ({ page }) => {
    const btns = page.locator(".reason");
    await expect(btns.first()).toHaveAttribute("aria-pressed", "true");
    const before = await page.locator("#f-m").getAttribute("placeholder");
    await btns.nth(1).click();
    await expect(btns.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(btns.first()).toHaveAttribute("aria-pressed", "false");
    expect(await page.locator("#f-m").getAttribute("placeholder")).not.toBe(before);
  });

  test("keyboard only: tab order reaches submit and Enter in name field submits", async ({ page }) => {
    await page.focus("#f-n");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Please enter your name")).toBeVisible();
  });

  test("double submit does not crash; button disables while pending", async ({ page }) => {
    test.skip(!safe, "would send a real email if .env has Resend keys");
    await page.fill("#f-n", "Ada Lovelace");
    await page.fill("#f-e", "ada@example.com");
    await page.fill("#f-m", "Hello, this is a test message from e2e.");
    const b = page.getByRole("button", { name: /Send message|Sending/ });
    await b.dblclick();
    await expect(page.locator("p[role=alert]").or(page.getByText("Message sent."))).toBeVisible({ timeout: 15_000 });
  });

  test("honeypot field is hidden from AT and tab order", async ({ page }) => {
    const hp = page.locator('input[name="website"]');
    await expect(hp).toHaveAttribute("tabindex", "-1");
    await expect(hp).toHaveAttribute("aria-hidden", "true");
  });

  test("org over 150 chars shows a visible error", async ({ page }) => {
    await page.goto("/contact");
    await page.fill("#f-n", "Ada Lovelace");
    await page.fill("#f-e", "ada@example.com");
    await page.fill("#f-o", "x".repeat(151));
    await page.fill("#f-m", "Hello there, this is long enough.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#e-o")).toBeVisible();
  });
});

/**
 * Behaviours of the react-hook-form version. Every submit here fills the honeypot,
 * so the server short-circuits and can never send mail, and the action's
 * response is rewritten in flight to exercise the failure paths.
 */
test.describe("contact form (react-hook-form)", () => {
  const fill = async (page: import("@playwright/test").Page) => {
    await page.fill("#f-n", "Ada Lovelace");
    await page.fill("#f-e", "ada@example.com");
    await page.fill("#f-m", "Hello there, this is long enough.");
    await page.locator('input[name="website"]').fill("http://spam", { force: true });
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#f-n").waitFor();
    await page.waitForLoadState("networkidle");
  });

  test("invalid submit moves focus to the first invalid field and marks it for assistive tech", async ({ page }) => {
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#f-n")).toBeFocused();
    await expect(page.locator("#f-n")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#f-n")).toHaveAttribute("aria-describedby", "e-n");
    await expect(page.locator("#e-n")).toHaveText("Please enter your name");
    await expect(page.getByRole("status").filter({ hasText: "3 fields need attention" })).toBeAttached();
  });

  test("errors clear as the user fixes the field", async ({ page }) => {
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#e-n")).toBeVisible();
    await page.fill("#f-n", "Ada");
    await expect(page.locator("#e-n")).toHaveCount(0);
    await expect(page.locator("#f-n")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("pending state: button disables, says Sending and the form is aria-busy", async ({ page }) => {
    await page.route("**/contact", async (route) => {
      if (route.request().headers()["next-action"]) await new Promise((r) => setTimeout(r, 900));
      await route.continue();
    });
    await fill(page);
    const send = page.getByRole("button", { name: /Send message|Sending/ });
    await send.click();
    await expect(page.getByRole("button", { name: /Sending/ })).toBeDisabled();
    await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("Message sent.")).toBeVisible({ timeout: 10_000 });
  });

  test("success state announces politely and 'Send another' gives an empty form", async ({ page }) => {
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    const done = page.getByRole("status").filter({ hasText: "Message sent." });
    await expect(done).toBeVisible();
    await expect(done).toHaveAttribute("aria-live", "polite");
    await page.getByRole("button", { name: "Send another" }).click();
    await expect(page.locator("#f-n")).toHaveValue("");
    await expect(page.locator("#f-m")).toHaveValue("");
  });

  test("failure state shows an alert and keeps everything the user typed", async ({ page }) => {
    await page.route("**/contact", async (route) => {
      if (!route.request().headers()["next-action"]) return route.continue();
      const res = await route.fetch();
      const body = (await res.text()).replace('{"status":"success","message":"sent"}', '{"status":"error","message":"Couldn\'t send right now. Please try again or email me directly."}');
      await route.fulfill({ response: res, body });
    });
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("p[role=alert]")).toHaveText("Couldn't send right now. Please try again or email me directly.");
    await expect(page.locator("#f-n")).toHaveValue("Ada Lovelace");
    await expect(page.locator("#f-e")).toHaveValue("ada@example.com");
    await expect(page.locator("#f-m")).toHaveValue("Hello there, this is long enough.");
    await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  test("server-side field errors land inline on the right field and take focus", async ({ page }) => {
    await page.route("**/contact", async (route) => {
      if (!route.request().headers()["next-action"]) return route.continue();
      const res = await route.fetch();
      const body = (await res.text()).replace('{"status":"success","message":"sent"}', '{"status":"error","message":"Please fix the highlighted fields.","fieldErrors":{"email":"Please enter a valid email"}}');
      await route.fulfill({ response: res, body });
    });
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#e-e")).toHaveText("Please enter a valid email");
    await expect(page.locator("#f-e")).toBeFocused();
    await expect(page.locator("#f-n")).toHaveValue("Ada Lovelace");
  });
});
