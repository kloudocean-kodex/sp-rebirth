import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const coreRoutes = [
  "/",
  "/about/",
  "/contact/",
  "/rental-providers/",
  "/rental-appraisal/",
  "/switch-property-managers/",
  "/resources/",
] as const;

for (const route of coreRoutes) {
  test(`${route} renders without layout overflow`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(
      response,
      `Expected a document response for ${route}`,
    ).not.toBeNull();
    expect(
      response?.ok(),
      `Expected ${route} to return a successful status`,
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      overflow,
      `${route} should not introduce horizontal page overflow`,
    ).toBeLessThanOrEqual(1);
  });
}

test("rental appraisal exposes the required lead-capture controls without submitting data", async ({
  page,
}) => {
  await page.goto("/rental-appraisal/", { waitUntil: "domcontentloaded" });
  const form = page.locator("form[data-lead-form]");
  await expect(form).toBeVisible();
  await expect(form.locator('input[name="full_name"]')).toHaveAttribute(
    "required",
    "",
  );
  await expect(form.locator('input[name="phone"]')).toHaveAttribute(
    "required",
    "",
  );
  await expect(form.locator('input[name="email"]')).toHaveAttribute(
    "required",
    "",
  );
  await expect(form.locator('input[name="consent"]')).toHaveAttribute(
    "required",
    "",
  );
  await expect(
    form.getByRole("button", { name: /request appraisal/i }),
  ).toBeVisible();
});

test("mobile navigation opens and exposes core owner journeys", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("mobile-"),
    "Mobile navigation check applies to mobile projects only.",
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menu = page.locator(".mobile-nav");
  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await expect(
    menu.getByRole("link", { name: "Rental Appraisal" }),
  ).toBeVisible();
  await expect(
    menu.getByRole("link", { name: "Switch Property Managers" }),
  ).toBeVisible();
  await expect(menu.getByRole("link", { name: "Contact" })).toBeVisible();
});

for (const route of ["/", "/rental-appraisal/"] as const) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({
    page,
  }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
