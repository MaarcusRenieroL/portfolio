import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/** German is a preference stored in a cookie, so tests set it and then visit the normal URLs. */
async function german(page: Page) {
  await page.context().addCookies([{ name: "lang", value: "de", domain: "localhost", path: "/" }]);
}

const DE_ROUTES = ["/", "/about", "/projects", "/experience", "/certifications", "/skills", "/resume", "/contact", "/changelog"];

test.describe("German site", () => {
  for (const route of DE_ROUTES) {
    test(`${route} returns 200, is lang=de, has no console errors and no mobile overflow`, async ({ page }) => {
      await german(page);
      const errors: string[] = [];
      page.on("console", (m: ConsoleMessage) => {
        if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      const res = await page.goto(route, { waitUntil: "load" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "de");
      await page.waitForTimeout(400);
      expect(errors, errors.join("\n")).toEqual([]);
      await page.setViewportSize({ width: 375, height: 800 });
      await page.waitForTimeout(200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `overflow ${over}px`).toBeLessThanOrEqual(0);
    });
  }

  test("home is German: heading, nav labels and prefixed links", async ({ page }) => {
    await german(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Full-Stack-Entwickler");
    const tabs = page.locator(".tabs");
    for (const [label, href] of [["Projekte", "/projects"], ["Erfahrung", "/experience"], ["Zertifikate", "/certifications"], ["Skills", "/skills"], ["Über mich", "/about"], ["Lebenslauf", "/resume"], ["Kontakt", "/contact"]]) {
      await expect(tabs.getByRole("link", { name: label, exact: true }), label).toHaveAttribute("href", href);
    }
    await expect(page.locator(".footer-social").getByRole("link", { name: "Lebenslauf" })).toHaveAttribute("href", "/resume");
    await expect(page.getByRole("button", { name: /Zum (hellen|dunklen) Design wechseln/ })).toBeVisible();
  });

  test("the toggle switches language on the same URL, both ways, and remembers it", async ({ page }) => {
    await page.goto("/skills");
    await page.locator(".lang-switch").click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator(".lang-switch")).toHaveText("EN");
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("große Ganze");
    await page.locator(".lang-switch").click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("German skills: translated groups, search and count", async ({ page }) => {
    await german(page);
    await page.goto("/skills");
    await expect(page.getByRole("combobox", { name: "Nach Kategorie filtern" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Skills suchen" }).fill("spring");
    await expect(page.getByRole("status")).toContainText("passen");
    await page.getByRole("searchbox", { name: "Skills suchen" }).fill("zzzz");
    await expect(page.getByText("Nichts gefunden zu")).toBeVisible();
    await page.getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(page.locator(".skill-flat li").first()).toBeVisible();
  });

  test("German certifications and experience are translated, with German dates", async ({ page }) => {
    await german(page);
    await page.goto("/certifications");
    await expect(page.locator(".cert", { hasText: "AWS Academy Cloud Foundations" })).toContainText("Zentrale AWS-Dienste");
    await expect(page.locator(".cert", { hasText: "AWS Academy Cloud Foundations" }).getByRole("link", { name: /Prüfen/ })).toBeVisible();
    await expect(page.locator(".cert-title", { hasText: "Datenbankprogrammierung mit PL/SQL" })).toBeVisible();
    await page.goto("/experience");
    // The timeline renders each date twice (desktop column, mobile row); one of them is visible.
    await expect(page.getByText("Aug 2026 — heute").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("Spring-Boot- und Spring-Batch-Microservices").first()).toBeVisible();
  });

  test("German contact form shows German validation messages", async ({ page }) => {
    await german(page);
    await page.goto("/contact");
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.getByText("Bitte geben Sie Ihren Namen ein")).toBeVisible();
    await expect(page.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein")).toBeVisible();
    await expect(page.getByText("Die Nachricht sollte mindestens 10 Zeichen lang sein")).toBeVisible();
    await expect(page.getByRole("button", { name: "einer Vollzeitstelle" })).toHaveAttribute("aria-pressed", "true");
  });

  test("German command palette navigates to German pages", async ({ page }) => {
    await german(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Befehlspalette" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("zertif");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/certifications$/);
  });

  test("German 404 and 500-style pages are German with a real 404", async ({ page }) => {
    await german(page);
    const res = await page.goto("/gibt-es-nicht");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Schon wieder verlaufen?");
    await expect(page.getByRole("link", { name: "Zur Startseite" })).toHaveAttribute("href", "/");
    await page.getByRole("searchbox", { name: "Website durchsuchen" }).fill("aws");
    await expect(page.locator(".nf-results a", { hasText: "AWS Academy Cloud Foundations" })).toBeVisible();
  });

  test("German shortcuts list", async ({ page }) => {
    await german(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("?");
    await expect(page.getByRole("dialog", { name: "Tastenkürzel" })).toBeVisible();
  });
});

test.describe("AI translation notice", () => {
  test("German pages say the translation is AI-made and the author is at A2; English pages do not", async ({ page }) => {
    await german(page);
    await page.goto("/about");
    await expect(page.locator(".footer-note")).toContainText("A2");
    await page.context().clearCookies();
    await page.goto("/about");
    await expect(page.locator(".footer-note")).toHaveCount(0);
  });
});

test.describe("page titles", () => {
  const cases: [boolean, string, RegExp][] = [
    [false, "/skills", /^Skills \| /],
    [false, "/about", /^About \| /],
    [false, "/", /Full stack engineer/],
    [true, "/skills", /^Skills \| /],
    [true, "/about", /^Über mich \| /],
    [true, "/", /Full-Stack-Entwickler/],
  ];
  for (const [de, route, title] of cases) {
    test(`${de ? "German" : "English"} ${route} has the right <title>`, async ({ page }) => {
      if (de) await german(page);
      await page.goto(route);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe("language routing", () => {
  test("the URL never carries the language: /en and /de redirect to the clean URL and set the cookie", async ({ page, request }) => {
    const r = await request.get("/de/skills", { maxRedirects: 0 });
    expect(r.status()).toBe(308);
    expect(r.headers()["location"]).toMatch(/\/skills$/);
    expect(r.headers()["set-cookie"]).toContain("lang=de");
    await page.goto("/de/skills");
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await page.goto("/en/skills");
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("no cookie means English", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("unknown paths are real 404s in both languages", async ({ page, request }) => {
    expect((await request.get("/nope/nope")).status()).toBe(404);
    expect((await request.get("/fr/skills")).status()).toBe(404);
    await german(page);
    expect((await page.goto("/nope/nope"))?.status()).toBe(404);
  });

  test("/stack redirects to /skills in both languages", async ({ page }) => {
    await page.goto("/stack");
    await expect(page).toHaveURL(/\/skills$/);
    await german(page);
    await page.goto("/stack");
    await expect(page).toHaveURL(/\/skills$/);
  });

  test("German pages keep the clean canonical and a German share image", async ({ page }) => {
    await german(page);
    await page.goto("/skills");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/skills$/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\?page=skills&lang=de$/);
  });

  test("sitemap has one URL per page and no /de entries", async ({ request }) => {
    const t = await (await request.get("/sitemap.xml")).text();
    expect(t).toContain("<loc>https://maarcus.dev/skills</loc>");
    expect(t).not.toContain("/de");
  });

  test("filters in the URL work in German too", async ({ page }) => {
    await german(page);
    await page.goto("/skills?q=spring");
    await expect(page.getByRole("searchbox", { name: "Skills suchen" })).toHaveValue("spring");
    await page.goto("/projects?cat=backend");
    await expect(page.getByRole("combobox", { name: "Nach Bereich filtern" })).toContainText("Backend");
  });
});
