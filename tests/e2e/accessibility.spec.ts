import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const criticalRoutes = [
  '/',
  '/rental-providers/',
  '/rental-appraisal/',
  '/switch-property-managers/',
  '/property-management-visibility-check/',
  '/about/',
  '/contact/',
] as const;

for (const path of criticalRoutes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Do not wait for networkidle: the cinematic homepage intentionally keeps media/network
    // activity alive. Accessibility analysis needs a usable DOM, not an artificially idle network.
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(
      results.violations,
      results.violations
        .map((violation) => `${violation.id}: ${violation.help} — ${violation.nodes.length} node(s)`)
        .join('\n'),
    ).toEqual([]);
  });
}
