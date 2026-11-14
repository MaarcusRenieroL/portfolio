import { expect, test } from "@playwright/test";
import { CASE_STUDIES, EDUCATION, PROJECTS, ROLES } from "../../src/lib/content";

/** The pages are built from the typed data, so the data is the spec: whatever is in it must be on screen. */
test.describe("content renders from the data source", () => {
  test("/projects lists every project, with links only where a case study exists", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    for (const p of PROJECTS) {
      const row = page.locator(".rows li", { hasText: p.desc });
      await expect(row, p.name).toHaveCount(1);
      await expect(row.locator(".pname")).toHaveText(p.name);
      expect(await row.locator('a[href^="/projects/"]').count() > 0, `${p.name} case-study link`).toBe(p.slug in CASE_STUDIES);
    }
  });

  test("home shows exactly the featured projects and the current role", async ({ page }) => {
    await page.goto("/");
    const names = await page.locator(".strip .cap strong").allTextContents();
    expect(names).toEqual(PROJECTS.filter((p) => p.featured).map((p) => p.name));
    const now = ROLES.find((r) => r.now)!;
    await expect(page.locator(".job").first()).toContainText(now.org);
  });

  test("/experience shows every role, its company renames, and every education entry", async ({ page }) => {
    await page.goto("/experience");
    for (const r of ROLES) {
      await expect(page.locator(".tl-org", { hasText: r.org }).first(), r.org).toBeVisible();
      for (const step of r.path ?? []) await expect(page.locator(".tl-org", { hasText: step.org }).first(), step.org).toBeVisible();
    }
    for (const e of EDUCATION) {
      await expect(page.locator(".skillrow", { hasText: e.school }), e.school).toBeVisible();
      await expect(page.locator(".skillrow", { hasText: e.degree })).toBeVisible();
    }
  });

  test("every case study renders its title from the data", async ({ page }) => {
    for (const c of Object.values(CASE_STUDIES)) {
      const res = await page.goto(`/projects/${c.slug}`);
      expect(res?.status(), c.slug).toBe(200);
      await expect(page.locator("h1")).toContainText(c.title);
    }
  });
});
