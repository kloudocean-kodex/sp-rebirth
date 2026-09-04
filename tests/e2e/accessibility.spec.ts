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
    // before the local CSS assets have finished loading, so wait for the browser
    // load event and assert the intended shell before running the unchanged Axe scan.
    await page.waitForLoadState('load');
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    if (path === '/') {
      // The client-approved landing page deliberately removes the old navigation maze.
      // Its responsive shell is the visible brand header plus an always-available call action.
      await expect(page.locator('.luxe-header')).toBeVisible();
      await expect(page.locator('.luxe-header__call')).toBeVisible();
      await expect(page.locator('.site-nav--desktop')).toHaveCount(0);
      await expect(page.locator('.mobile-nav')).toHaveCount(0);
    } else {
      const viewportWidth = page.viewportSize()?.width ?? 1280;
      if (viewportWidth <= 900) {
        await expect(page.locator('.site-nav--desktop')).toBeHidden();
        await expect(page.locator('.mobile-nav')).toBeVisible();
      } else {
        await expect(page.locator('.site-nav--desktop')).toBeVisible();
        await expect(page.locator('.mobile-nav')).toBeHidden();
      }
    }

    // Do not wait for networkidle: connected review/media surfaces can keep network
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
