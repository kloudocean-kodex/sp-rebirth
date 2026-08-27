import { expect, test, type Page } from '@playwright/test';

const reviewRoutes = [
  ['home', '/'],
  ['rental-providers', '/rental-providers/'],
  ['rental-appraisal', '/rental-appraisal/'],
  ['switch-property-managers', '/switch-property-managers/'],
  ['visibility-check', '/property-management-visibility-check/'],
  ['about', '/about/'],
] as const;

async function hydrateLazyMedia(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const step = Math.max(420, Math.round(window.innerHeight * 0.72));
      const timer = window.setInterval(() => {
        const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
        if (atBottom) {
          window.clearInterval(timer);
          resolve();
          return;
        }
        window.scrollBy({ top: step, behavior: 'auto' });
      }, 45);
    });
  });

  await page.waitForTimeout(350);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await page.waitForTimeout(250);
}

for (const [name, path] of reviewRoutes) {
  test(`${name} visual review capture`, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();

    // Exercise the full page before capture so below-the-fold lazy images are
    // requested, while avoiding networkidle on the intentionally media-active home hero.
    await hydrateLazyMedia(page);

    await page.screenshot({
      path: testInfo.outputPath(`${name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
