import { expect, test, type Page } from "@playwright/test";
import { CERTIFICATES, PROJECTS, ROLES, SITE, SKILLS } from "../../src/lib/content";

/** Alpha-channel summary of the particle canvas: how many pixels are painted, and how many inside the reading column. */
const paint = (page: Page) =>
  page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>("canvas.particles")!;
    const ctx = c.getContext("2d")!;
    const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
    const dpr = c.width / window.innerWidth;
    const half = 440 * dpr;
    let total = 0;
    let inColumn = 0;
    let sum = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (!a) continue;
        total++;
        sum += a * (x + 1) * (y + 1);
        if (Math.abs(x - width / 2) < half) inColumn++;
      }
    }
    return { total, inColumn, sum };
  });

test.describe("particles", () => {
  test("a canvas is painted behind the page and stays out of the reading column", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1800);
    const canvas = page.locator("canvas.particles");
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    await expect(canvas).toHaveCSS("pointer-events", "none");
    const { total, inColumn } = await paint(page);
    expect(total, "something is drawn").toBeGreaterThan(20);
    expect(inColumn, "nothing is drawn behind the text column").toBe(0);
  });

  test("page content is above the canvas and stays clickable", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Projects", exact: true }).first().click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("pauses while the tab is hidden", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(150);
    const a = await paint(page);
    await page.waitForTimeout(600);
    const b = await paint(page);
    expect(b.sum, "frame is frozen while hidden").toBe(a.sum);

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(600);
    expect((await paint(page)).sum, "moves again once visible").not.toBe(b.sum);
  });

  test("is off for reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page.locator("canvas.particles")).toBeHidden();
    await ctx.close();
  });

  test("is off on low-power devices (data saver)", async ({ browser }) => {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page.locator("canvas.particles")).toBeHidden();
    await ctx.close();
  });

  test("is capped in size on a huge screen and uses the theme colour", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(500);
    const { cw, w } = await page.evaluate(() => ({ cw: document.querySelector<HTMLCanvasElement>("canvas.particles")!.width, w: window.innerWidth }));
    expect(cw / w, "pixel ratio is capped at 1.5").toBeLessThanOrEqual(1.5);
    await ctx.close();
  });
});

test.describe("theme change animation", () => {
  test("a circular view transition runs from the toggle", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator(".theme-toggle").click();
    await expect
      .poll(() => page.evaluate(() => document.getAnimations().some((a) => String((a.effect as KeyframeEffect | null)?.pseudoElement).includes("view-transition-new"))))
      .toBe(true);
    await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
  });

  test("reduced motion switches instantly with no transition", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator(".theme-toggle").click();
    const ran = await page.evaluate(() => document.getAnimations().some((a) => String((a.effect as KeyframeEffect | null)?.pseudoElement).includes("view-transition")));
    expect(ran).toBe(false);
    await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
    await ctx.close();
  });
});

test.describe("layout and content decisions", () => {
  test("only next-kit and nyx are listed", async ({ page }) => {
    expect(PROJECTS.map((p) => p.slug).sort()).toEqual(["next-kit", "nyx"]);
    await page.goto("/projects");
    await expect(page.locator(".rows > li")).toHaveCount(2);
    for (const gone of ["life os", "snap pass", "zentro"]) await expect(page.locator(".rows"), gone).not.toContainText(gone);
  });

  test("project rows are separate cards with a gap between them", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    const boxes = await page.locator(".rows > li").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].top - boxes[i - 1].bottom, `gap before row ${i}`).toBeGreaterThanOrEqual(12);
  });

  test("skills live on their own page, in the nav", async ({ page }) => {
    await page.goto("/");
    await page.locator(".tabs").getByRole("link", { name: "Skills", exact: true }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByRole("heading", { level: 1, name: "Skills" })).toBeVisible();
  });

  test("no case study pages remain", async ({ request }) => {
    for (const slug of ["nyx", "next-kit", "dotfiles", "portfolio"]) expect((await request.get(`/projects/${slug}`)).status(), slug).toBe(404);
  });

  test("footer carries the social links on every page", async ({ page }) => {
    for (const route of ["/", "/projects", "/skills", "/contact"]) {
      await page.goto(route);
      const links = page.locator(".footer-social");
      await expect(links.getByRole("link", { name: "GitHub" }), route).toHaveAttribute("href", SITE.github);
      await expect(links.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", SITE.linkedin);
      await expect(links.getByRole("link", { name: "Email" })).toHaveAttribute("href", `mailto:${SITE.email}`);
      await expect(links.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume");
    }
  });

  test("company logos load, and light artwork sits on a dark tile", async ({ page }) => {
    await page.goto("/experience");
    await page.waitForLoadState("networkidle");
    for (const r of ROLES.filter((r) => r.logo)) {
      const img = page.locator(`img.logo[src$="/logos/${r.logo}"]`).first();
      await expect(img, r.org).toBeVisible();
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth), `${r.org} decoded`).toBeGreaterThan(0);
      if (r.logoOn === "dark") await expect(img).toHaveClass(/logo-dark/);
    }
  });
});

test.describe("nav, skills, palette, loader, placeholders", () => {
  test("Resume is a nav tab, not a header button", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".tabs").getByRole("link", { name: "Resume", exact: true })).toHaveAttribute("href", "/resume");
    await expect(page.locator(".header-actions").getByRole("link", { name: "Resume" })).toHaveCount(0);
    await expect(page.locator(".tabs").getByRole("link", { name: "Stack" })).toHaveCount(0);
  });

  test("experience has no skills-and-tools button", async ({ page }) => {
    await page.goto("/experience");
    await expect(page.getByRole("link", { name: "Skills and tools" })).toHaveCount(0);
  });

  test("skills: flat pills, search narrows them, category filter narrows them, both clear", async ({ page }) => {
    await page.goto("/skills");
    const pills = page.locator(".skill-flat li");
    await expect(page.locator(".skill-card")).toHaveCount(0);
    const all = await pills.count();
    expect(all).toBe(SKILLS.used.reduce((n, g) => n + g.items.length, 0));

    await page.getByRole("searchbox", { name: "Search skills" }).fill("spring");
    await expect(pills.filter({ hasText: "Spring Boot" })).toBeVisible();
    await expect(pills.filter({ hasText: "Angular" })).toHaveCount(0);
    expect(await pills.count()).toBeLessThan(all);

    await page.getByRole("searchbox", { name: "Search skills" }).fill("zzzz-nothing");
    await expect(page.getByText("Nothing matches")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(pills).toHaveCount(all);

    const backend = SKILLS.used.find((g) => g.name === "Backend")!;
    await page.getByRole("group", { name: "Filter by category" }).getByRole("button", { name: "Backend" }).click();
    await expect(pills).toHaveCount(backend.items.length);
    await expect(page.getByRole("button", { name: "Backend" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(pills).toHaveCount(all);
  });

  test("command palette opens with Ctrl+K, filters, navigates and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("combobox")).toBeFocused();

    await dialog.getByRole("combobox").fill("skil");
    await expect(dialog.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/skills$/);
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Open command palette" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(dialog.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("command palette can switch the theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("theme");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
  });

  test("intro loader plays on the first visit in a tab, never blocks clicks, and is skipped after", async ({ page }) => {
    await page.goto("/");
    const loader = page.locator(".zoro");
    await expect(loader).toHaveCount(1);
    await expect(loader).toHaveCSS("pointer-events", "none");
    await expect(loader).toHaveAttribute("aria-hidden", "true");
    await expect(loader).toHaveCSS("visibility", "hidden", { timeout: 4000 });
    await page.goto("/projects");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
    await expect(page.locator(".zoro")).toBeHidden();
  });

  test("intro loader is off for reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator(".zoro")).toBeHidden();
    await ctx.close();
  });

  test("home and about show a photo placeholder until me.jpg exists", async ({ page }) => {
    for (const route of ["/", "/about"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const img = page.locator('img[src="/placeholder-portrait.svg"]').first();
      await expect(img, route).toBeVisible();
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth), route).toBeGreaterThan(0);
    }
  });

  test("/og is rate limited", async ({ request }) => {
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await request.get("/og")).status());
    expect(codes).toContain(429);
    const limited = await request.get("/og");
    expect(limited.headers()["retry-after"]).toBe("60");
  });

  test("system routes: health, security.txt, manifest", async ({ request }) => {
    expect((await request.get("/api/health")).status()).toBe(200);
    const sec = await request.get("/.well-known/security.txt");
    expect(await sec.text()).toContain("Contact: mailto:");
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
    expect((await request.get("/definitely-not-a-page")).status()).toBe(404);
  });
});

test.describe("certifications", () => {
  test("every certificate is listed newest first, with a thumbnail and file that load", async ({ page, request }) => {
    await page.goto("/certifications");
    await page.waitForLoadState("networkidle");
    const titles = page.locator(".cert-title");
    await expect(titles).toHaveText(CERTIFICATES.map((c) => c.title));
    const dates = CERTIFICATES.map((c) => c.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const c of CERTIFICATES) {
      if (c.preview) expect((await request.get(`/certificates/${c.preview}`)).status(), c.preview).toBe(200);
      if (c.file) expect((await request.get(`/certificates/${c.file}`)).status(), c.file).toBe(200);
    }
  });

  test("Oracle certificates are listed without publishing the files (they print a student number)", async () => {
    for (const c of CERTIFICATES.filter((c) => c.issuer === "Oracle Academy")) {
      expect(c.file, c.slug).toBeUndefined();
      expect(c.preview, c.slug).toBeUndefined();
    }
  });

  test("search and issuer filter narrow the list and clear again", async ({ page }) => {
    await page.goto("/certifications");
    const cards = page.locator(".cert");
    const all = CERTIFICATES.length;
    await expect(cards).toHaveCount(all);
    await page.getByRole("searchbox", { name: "Search certifications" }).fill("react");
    await expect(cards).toHaveCount(CERTIFICATES.filter((c) => /react/i.test(`${c.title} ${c.issuer} ${c.about} ${c.instructors ?? ""}`)).length);
    await page.getByRole("searchbox", { name: "Search certifications" }).fill("");
    const udemy = CERTIFICATES.filter((c) => c.issuer === "Udemy").length;
    await page.getByRole("group", { name: "Filter by issuer" }).getByRole("button", { name: /^Udemy/ }).click();
    await expect(cards).toHaveCount(udemy);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(cards).toHaveCount(all);
  });

  test("the nav links to it", async ({ page }) => {
    await page.goto("/");
    await page.locator(".tabs").getByRole("link", { name: "Certifications", exact: true }).click();
    await expect(page).toHaveURL(/\/certifications$/);
    await expect(page.getByRole("heading", { level: 1, name: "Certifications" })).toBeVisible();
  });
});

test.describe("shareable filters, shortcuts, print, vcard, feed, 404 search", () => {
  test("verification links are present for the issuers that allow them", async ({ page }) => {
    await page.goto("/certifications");
    for (const c of CERTIFICATES.filter((c) => c.verify)) {
      await expect(page.locator(".cert", { hasText: c.title }).getByRole("link", { name: /Verify/ })).toHaveAttribute("href", c.verify!);
    }
    expect(CERTIFICATES.filter((c) => c.verify).length).toBeGreaterThanOrEqual(2);
  });

  test("filters read from the URL and write back to it", async ({ page }) => {
    await page.goto("/skills?q=spring");
    await expect(page.getByRole("searchbox", { name: "Search skills" })).toHaveValue("spring");
    await expect(page.locator(".skill-flat li", { hasText: "Spring Boot" })).toBeVisible();
    await expect(page.locator(".skill-flat li", { hasText: "Angular" })).toHaveCount(0);
    await page.getByRole("searchbox", { name: "Search skills" }).fill("docker");
    await expect(page).toHaveURL(/q=docker/);
    await page.getByRole("searchbox", { name: "Search skills" }).fill("");
    await expect(page).not.toHaveURL(/q=/);

    await page.goto("/projects?cat=backend");
    await expect(page.getByRole("button", { name: "Backend" })).toHaveAttribute("aria-pressed", "true");
    await page.goto("/certifications?issuer=Udemy");
    await expect(page.locator(".cert")).toHaveCount(CERTIFICATES.filter((c) => c.issuer === "Udemy").length);
  });

  test("each page has its own share image", async ({ page }) => {
    for (const key of ["skills", "projects", "certifications", "about", "contact"]) {
      await page.goto(`/${key}`);
      await expect(page.locator('meta[property="og:image"]'), key).toHaveAttribute("content", new RegExp(`/og\\?page=${key}$`));
    }
  });

  test("? opens the shortcuts list and Escape closes it; not while typing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("?");
    const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.goto("/contact");
    await page.getByLabel("Name").focus();
    await page.keyboard.type("?");
    await expect(dialog).toBeHidden();
  });

  test("contact card downloads as a valid vCard", async ({ request }) => {
    const r = await request.get("/api/vcard");
    expect(r.headers()["content-type"]).toContain("text/vcard");
    const t = await r.text();
    expect(t).toContain("BEGIN:VCARD");
    expect(t).toContain(`EMAIL;TYPE=INTERNET:${SITE.email}`);
    expect(t).toContain("END:VCARD");
    expect(t).toContain("\r\n");
  });

  test("RSS feed is valid and the changelog page loads", async ({ request, page }) => {
    const r = await request.get("/feed.xml");
    expect(r.headers()["content-type"]).toContain("rss");
    expect(await r.text()).toMatch(/^<\?xml[\s\S]*<rss version="2.0">[\s\S]*<\/rss>$/);
    await page.goto("/changelog");
    await expect(page.getByRole("heading", { level: 1, name: "Changelog" })).toBeVisible();
  });

  test("the 404 page can search the site", async ({ page }) => {
    const res = await page.goto("/definitely-missing");
    expect(res?.status()).toBe(404);
    await page.getByRole("searchbox", { name: "Search the site" }).fill("aws");
    await expect(page.locator(".nf-results a", { hasText: "AWS Academy Cloud Foundations" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Search the site" }).fill("zzzzzz");
    await expect(page.getByText("Nothing found")).toBeVisible();
  });

  test("printing the resume shows a plain text resume and hides the site chrome", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".resume-print")).toBeHidden();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".resume-print")).toBeVisible();
    await expect(page.locator(".resume-print h2", { hasText: "Experience" })).toBeVisible();
    await expect(page.locator(".header")).toBeHidden();
    await expect(page.locator(".pdf")).toBeHidden();
  });

  test("clicks marked for tracking are wired up", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator('[data-track="resume-download"]')).toHaveCount(1);
    await page.goto("/projects");
    expect(await page.locator('[data-track="project-click"]').count()).toBeGreaterThan(0);
  });
});
