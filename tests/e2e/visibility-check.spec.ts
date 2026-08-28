import { expect, test } from '@playwright/test';

test('Visibility Check gives value before asking for contact details', async ({ page }) => {
  await page.goto('/property-management-visibility-check/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const form = page.locator('[data-visibility-check]');
  await expect(form).toBeVisible();
  await expect(form.locator('input[type="email"]')).toHaveCount(0);
  await expect(form.locator('input[type="tel"]')).toHaveCount(0);

  const questions = form.locator('[data-question]');
  await expect(questions).toHaveCount(7);

  for (let index = 0; index < 7; index += 1) {
    const option = questions.nth(index).locator('label').first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(option.locator('input[type="radio"]')).toBeChecked();
  }

  await form.getByRole('button', { name: 'Show my visibility result' }).click();

  const result = page.locator('[data-check-result]');
  await expect(result).toBeVisible();
  await expect(page.locator('[data-overall-score]')).toContainText('%');
  await expect(page.locator('[data-rent-score]')).toContainText('%');
  await expect(page.locator('[data-protection-score]')).toContainText('%');
  await expect(page.locator('[data-visibility-score]')).toContainText('%');
});

test('Visibility Check remains staging noindex', async ({ page }) => {
  await page.goto('/property-management-visibility-check/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
});
