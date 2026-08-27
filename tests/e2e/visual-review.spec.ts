import { expect, test } from '@playwright/test';

const reviewRoutes = [
  ['home', '/'],
  ['rental-providers', '/rental-providers/'],
  ['rental-appraisal', '/rental-appraisal/'],
  ['switch-property-managers', '/switch-property-managers/'],
  ['visibility-check', '/property-management-visibility-check/'],
  ['about', '/about/'],
] as const;

for (const [name, path] of reviewRoutes) {
  test(`${name} visual review capture`, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();

    // Give web fonts/layout a short settling window without requiring a permanently
    // media-active homepage to reach networkidle.
    await page.waitForTimeout(600);

    await page.screenshot({
      path: testInfo.outputPath(`${name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
