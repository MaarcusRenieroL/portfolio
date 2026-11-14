import { expect, test } from "@playwright/test";

test.describe("motion", () => {
  test("server HTML never hides content (no inline opacity:0)", async ({ request }) => {
    for (const route of ["/", "/projects", "/experience", "/contact"]) {
      const html = await (await request.get(route)).text();
      // The contact honeypot is hidden on purpose (position:absolute, off-screen).
      const hidden = [...html.matchAll(/style="([^"]*opacity:\s*0[^"]*)"/g)].map((m) => m[1]).filter((v) => !v.includes("-9999px"));
      expect(hidden, route).toEqual([]);
    }
  });

  test("content is visible without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(1500); // longest entrance is ~0.9s
    const opacity = await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await ctx.close();
  });

  test("reduced motion turns every entrance and reveal off", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    for (const route of ["/", "/experience"]) {
      await page.goto(route);
      const animated = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("main *")]
          .filter((el) => {
            const cs = getComputedStyle(el);
            // The reduced-motion rule leaves names in place but makes them ~instant.
            const seconds = parseFloat(cs.animationDuration);
            return cs.animationName !== "none" && !/breathe|spin|blink/.test(cs.animationName) && seconds > 0.001;
          })
          .map((el) => `${el.tagName}.${el.className}`),
      );
      expect(animated, `${route}: ${animated.join(", ")}`).toEqual([]);
    }
    // And the first screen is fully opaque straight away.
    await page.goto("/");
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await ctx.close();
  });

  test("entrances and reveals cause no layout shift", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    for (const route of ["/", "/experience"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      for (let y = 0; y <= 3000; y += 600) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(120);
      }
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls, `${route} CLS`).toBeLessThan(0.02);
    }
  });

  test("mobile nav shows every tab without sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const tabs = page.locator(".tabs");
    const { sw, cw } = await tabs.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
    expect(sw, "tab bar scrolls sideways").toBeLessThanOrEqual(cw);
    for (const name of ["Projects", "Experience", "Stack", "About", "Contact"]) {
      const box = await tabs.getByRole("link", { name, exact: true }).boundingBox();
      expect(box, name).not.toBeNull();
      expect(box!.x + box!.width, `${name} is cut off`).toBeLessThanOrEqual(375);
    }
  });

  test("empty blog is not linked from the nav but still resolves", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".tabs").getByRole("link", { name: "Writing" })).toHaveCount(0);
    const res = await page.goto("/blog");
    expect(res?.status()).toBe(200);
  });
});
