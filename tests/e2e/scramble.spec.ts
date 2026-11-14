import { expect, test } from "@playwright/test";

test("the page title scrambles in and always ends on the real text, with no stray attributes", async ({ page }) => {
  await page.goto("/about");
  const h1 = page.locator("#main h1.title");
  const real = (await h1.textContent())!;
  await page.waitForTimeout(3500);
  await expect(h1).toHaveText(real);
  await expect(h1).not.toHaveAttribute("aria-label", /.+/);
  expect(await h1.evaluate((el) => (el as HTMLElement).style.minHeight)).toBe("");
});

test("hovering the name scrambles it and restores it", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  const brand = page.locator(".brand");
  const real = (await brand.textContent())!;
  await brand.hover();
  await page.waitForTimeout(900);
  await expect(brand).toHaveText(real);
});

test("reduced motion leaves the title alone", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/about");
  const h1 = page.locator("#main h1.title");
  const real = (await h1.textContent())!;
  for (const ms of [300, 900, 2200]) {
    await page.waitForTimeout(ms);
    await expect(h1).toHaveText(real);
  }
});
