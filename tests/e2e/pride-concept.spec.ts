import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const previewPath = '/preview/sana-pride/';
const visualProjects = new Set(['desktop-chromium', 'mobile-chromium']);

async function exercisePage(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(360, Math.round(window.innerHeight * 0.7));
    await new Promise<void>((resolve) => {
      const timer = window.setInterval(() => {
        const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
        if (atBottom) {
          window.clearInterval(timer);
          resolve();
          return;
        }
        window.scrollBy({ top: step, behavior: 'auto' });
      }, 40);
    });
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
}

test('PRIDE preview preserves Sana copy, conversion routes and noindex boundary', async ({ page }) => {
  await page.goto(previewPath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Is your property really being managed?');
  await expect(page.getByText('Property management with strategy, accountability and personal attention.')).toBeVisible();
  await expect(page.getByText('Your Property. My Priority.')).toBeVisible();

  const healthLinks = page.getByRole('link', { name: /rental health check/i });
  await expect(healthLinks.first()).toHaveAttribute('href', '/property-management-visibility-check/');
  const switchLinks = page.getByRole('link', { name: /switch property managers/i });
  await expect(switchLinks.first()).toHaveAttribute('href', '/switch-property-managers/');

  await expect(page.getByRole('heading', { name: 'Property Management with PRIDE.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Proactive Property Care' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Results Driven' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Integrity in Every Decision' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Diligent Property Management' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experience That Matters' })).toBeVisible();
  await expect(page.getByText(/supplied screenshots do not show the exact three-word R heading/i)).toBeVisible();

  await expect(page.getByRole('heading', { name: 'What PRIDE Means to Me.' })).toBeVisible();
  await expect(page.getByText('PRIDE is the standard I choose to bring to my work every day.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trusted by Rental Providers & Renters' })).toBeVisible();
  await expect(page.getByText('Real experiences. Real service.')).toBeVisible();
  await expect(page.locator('[data-review-provider="Trustindex"]')).toHaveCount(1);
  await expect(page.locator('form')).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'preview must not create horizontal page scrolling').toBeLessThanOrEqual(1);
});

test('PRIDE preview has no automatically detectable WCAG A/AA violations', async ({ page }) => {
  await page.goto(previewPath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

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

test('PRIDE preview captures client-review visual evidence', async ({ page }, testInfo) => {
  test.skip(
    !visualProjects.has(testInfo.project.name),
    'Client-review screenshots are captured on representative Chromium desktop/mobile viewports; compatibility remains covered by the full browser matrix.',
  );

  await page.goto(previewPath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await exercisePage(page);

  await page.screenshot({
    path: testInfo.outputPath(`sana-pride-full-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  });

  for (const [name, selector] of [
    ['hero', '.pride-hero'],
    ['pride', '#pride'],
    ['founder', '#sana'],
    ['reviews', '#reviews'],
    ['final-cta', '#final-cta'],
  ] as const) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await section.screenshot({
      path: testInfo.outputPath(`sana-pride-${name}-${testInfo.project.name}.png`),
      animations: 'disabled',
    });
  }
});
