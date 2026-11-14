import { expect, test, type Page } from "@playwright/test";

/** WCAG relative luminance and contrast ratio for "rgb(r, g, b)" strings. */
function ratio(a: string, b: string) {
  const lum = (c: string) => {
    const [r, g, bl] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => {
      const x = Number(v) / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolve a custom property to an rgb() string by painting it on a probe element. */
const colour = (page: Page, token: string) =>
  page.evaluate((t) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${t})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, token);

const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("theme", () => {
  test("follows the system preference when nothing is stored", async ({ browser }) => {
    for (const [scheme, bg] of [
      ["dark", "rgb(11, 11, 11)"],
      ["light", "rgb(250, 250, 250)"],
    ] as const) {
      const ctx = await browser.newContext({ colorScheme: scheme });
      const page = await ctx.newPage();
      await page.goto("/");
      expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
      expect(await bodyBg(page)).toBe(bg);
      await ctx.close();
    }
  });

  test("toggle switches theme, persists across reload and is set before first paint", async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: "dark" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const toggle = page.getByRole("button", { name: /switch to light theme/i });
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bodyBg(page)).toBe("rgb(250, 250, 250)");
    await expect(page.getByRole("button", { name: /switch to dark theme/i })).toBeVisible();

    // The inline script must apply the stored theme at DOMContentLoaded, before hydration.
    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
    expect(await bodyBg(page)).toBe("rgb(250, 250, 250)");

    // Persists on another route too, and can be switched back.
    await page.goto("/projects");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: /switch to dark theme/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
    await ctx.close();
  });

  test("toggle is keyboard operable and has a visible focus ring", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const toggle = page.locator(".theme-toggle");
    await toggle.focus();
    const outline = await toggle.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
  });

  for (const theme of ["dark", "light"] as const) {
    test(`${theme}: text tokens meet WCAG AA (4.5:1) on the page background`, async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme: theme });
      const page = await ctx.newPage();
      await page.goto("/");
      const bg = await colour(page, "--bg");
      for (const token of ["--fg", "--fg-2", "--fg-3", "--green", "--danger", "--warn"]) {
        const fg = await colour(page, token);
        expect(ratio(fg, bg), `${theme} ${token} ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
      // The primary button label (ink) on its green fill.
      expect(ratio(await colour(page, "--green-ink"), await colour(page, "--green"))).toBeGreaterThanOrEqual(4.5);
      await ctx.close();
    });
  }
});
