import { test } from '@playwright/test';

const reviewRoutes = [
  ['home', '/'],
  ['rental-providers', '/rental-providers/'],
  ['rental-appraisal', '/rental-appraisal/'],
  ['switch-property-managers', '/switch-property-managers/'],
  ['about', '/about/'],
] as const;

for (const [name, path] of reviewRoutes) {
  test(`${name} visual review capture`, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: testInfo.outputPath(`${name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
