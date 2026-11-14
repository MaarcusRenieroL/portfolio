import { expect, test } from "@playwright/test";
import { EDUCATION, PROJECTS, ROLES, SKILLS } from "../../src/lib/content";

/** The pages are built from the typed data, so the data is the spec: whatever is in it must be on screen. */
test.describe("content renders from the data source", () => {
  test("/projects lists every project with outward links only", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    for (const p of PROJECTS) {
      const row = page.locator(".rows li", { hasText: p.desc });
      await expect(row, p.name).toHaveCount(1);
      await expect(row.locator(".pname")).toHaveText(p.name);
      if (p.github) await expect(row.locator(`a[href="${p.github}"]`)).toHaveCount(1);
      if (p.site) await expect(row.locator(`a[href="${p.site}"]`)).toHaveCount(1);
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
    await expect(page.getByText("Skills I use")).toHaveCount(0); // skills live on /skills now
  });

  test("/skills shows every skill from the data as a pill", async ({ page }) => {
    await page.goto("/skills");
    await expect(page.locator(".skill-flat li")).toHaveText(SKILLS.used.flatMap((g) => g.items));
  });

  test("/stack redirects to /skills and Current edges is gone", async ({ page }) => {
    await page.goto("/stack");
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByRole("heading", { name: "Current edges" })).toHaveCount(0);
  });

  test("/about has no Now or How I work sections", async ({ page }) => {
    await page.goto("/about");
    for (const name of ["Now", "How I work"]) await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Languages" })).toBeVisible();
  });
});
