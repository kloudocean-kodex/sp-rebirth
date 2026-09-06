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
  '/resources/',
  '/resources/victoria-rental-minimum-standards/',
  '/resources/routine-inspections-victoria/',
  '/resources/changing-property-managers-victoria/',
  '/resources/forms-and-guidance/',
  '/privacy/',
  '/lease/',
  '/for-renters/',
  '/sale/',
] as const;

for (const path of criticalRoutes) {
  test(`${path} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    // Axe must inspect the styled, responsive DOM. `domcontentloaded` can fire
    // before the local Astro stylesheets are ready, which briefly exposes the
    // desktop navigation at mobile dimensions and creates a false target-size
    // violation. Wait explicitly for the local CSS contract instead of the
    // browser-wide `load` event: legacy/third-party images are not prerequisites
    // for accessibility analysis and must not be allowed to block the WCAG gate.
    await expect
      .poll(() =>
        page
          .locator('link[rel="stylesheet"][href*="/_astro/"]')
          .evaluateAll((links) => links.length > 0 && links.every((link) => Boolean((link as HTMLLinkElement).sheet))),
      )
      .toBe(true);

    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    const viewportWidth = page.viewportSize()?.width ?? 1280;
    if (viewportWidth <= 900) {
      await expect(page.locator('.site-nav--desktop')).toBeHidden();
      await expect(page.locator('.mobile-nav')).toBeVisible();
    } else {
      await expect(page.locator('.site-nav--desktop')).toBeVisible();
      await expect(page.locator('.mobile-nav')).toBeHidden();
    }

    // Do not wait for networkidle: the site intentionally contains external media
    // and review integrations. Accessibility analysis needs a usable styled DOM,
    // not an artificially idle network.
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
