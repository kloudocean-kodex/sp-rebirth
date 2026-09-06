import { expect, test, type Page } from '@playwright/test';

const reviewRoutes = [
  ['rental-providers', '/rental-providers/'],
  ['rental-appraisal', '/rental-appraisal/'],
  ['switch-property-managers', '/switch-property-managers/'],
  ['visibility-check', '/property-management-visibility-check/'],
  ['about', '/about/'],
] as const;

const homeReviewSections = [
  ['01-hero', '.sana-hero'],
  ['02-pride', '.sana-pride'],
  ['03-reviews', '.trust-proof'],
  ['04-final-action', '.sana-final-cta'],
] as const;

const visualCaptureProjects = new Set(['desktop-chromium', 'mobile-chromium']);

function skipNonVisualProject(projectName: string) {
  test.skip(
    !visualCaptureProjects.has(projectName),
    'Human visual-review evidence is captured on representative Chromium desktop/mobile viewports; cross-engine correctness is covered by functional and accessibility suites.',
  );
}

async function expectBrandReady(page: Page) {
  const brand = page.getByRole('link', { name: 'Sana Patel Real Estate home' });
  const logo = brand.locator('.brand__logo');
  await expect(brand).toBeVisible();
  await expect(logo).toHaveAttribute('alt', 'Sana Patel Real Estate');
  await expect(logo).toHaveAttribute('src', /\/media\/sana-patel-logo\.webp$/);
  await page.evaluate(() => document.fonts.ready);
}

async function suppressOffscreenSkipLinkArtifact(page: Page) {
  const skipLink = page.locator('.skip-link');
  await expect(skipLink).not.toBeFocused();
  const isAboveViewport = await skipLink.evaluate((element) => element.getBoundingClientRect().bottom <= 0);
  expect(isAboveViewport).toBe(true);

  await skipLink.evaluate((element: HTMLElement) => {
    element.style.visibility = 'hidden';
  });
}

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

for (const [sectionName, selector] of homeReviewSections) {
  test(`home ${sectionName} visual review capture`, async ({ page }, testInfo) => {
    skipNonVisualProject(testInfo.project.name);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();

    if (sectionName === '01-hero') await expectBrandReady(page);

    const section = page.locator(selector);
    await expect(section).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    await suppressOffscreenSkipLinkArtifact(page);

    await section.screenshot({
      path: testInfo.outputPath(`home-${sectionName}-${testInfo.project.name}.png`),
      animations: 'disabled',
    });
  });
}

for (const [name, path] of reviewRoutes) {
  test(`${name} visual review capture`, async ({ page }, testInfo) => {
    skipNonVisualProject(testInfo.project.name);

    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();

    await hydrateLazyMedia(page);

    await page.screenshot({
      path: testInfo.outputPath(`${name}-${testInfo.project.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
