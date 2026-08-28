import { expect, test } from '@playwright/test';

test('Rental Position Check gives decision value before asking for contact or property details', async ({ page }) => {
  await page.goto('/rental-position-check/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const form = page.locator('[data-rental-position-check]');
  await expect(form).toBeVisible();
  await expect(form.locator('input[type="email"]')).toHaveCount(0);
  await expect(form.locator('input[type="tel"]')).toHaveCount(0);
  await expect(form.locator('input[type="text"]')).toHaveCount(0);

  const questions = form.locator('[data-position-question]');
  await expect(questions).toHaveCount(7);

  for (let index = 0; index < 7; index += 1) {
    const option = questions.nth(index).locator('label').first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(option.locator('input[type="radio"]')).toBeChecked();
  }

  await form.getByRole('button', { name: 'Show my readiness result' }).click();

  const result = page.locator('[data-position-result]');
  await expect(result).toBeVisible();
  await expect(page.locator('[data-position-overall]')).toContainText('%');
  await expect(page.locator('[data-evidence-score]')).toContainText('%');
  await expect(page.locator('[data-context-score]')).toContainText('%');
  await expect(page.locator('[data-timing-score]')).toContainText('%');
  await expect(result).not.toContainText(/\$\s?\d/);
});

test('Rental Position Check states that it is not an instant valuation', async ({ page }) => {
  await page.goto('/rental-position-check/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/not a rental valuation/i)).toBeVisible();
  await expect(page.getByText(/does not calculate what your property should rent for/i)).toBeVisible();
});

test('Rental Position Check remains staging noindex', async ({ page }) => {
  await page.goto('/rental-position-check/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
});
