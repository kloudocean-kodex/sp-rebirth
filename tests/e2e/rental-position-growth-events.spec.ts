import { expect, test } from '@playwright/test';

type CapturedGrowthEvent = Record<string, unknown>;

test('Rental Position Check emits only non-PII lifecycle signals', async ({ page }) => {
  await page.addInitScript(() => {
    const captured: Record<string, unknown>[] = [];
    Object.defineProperty(window, '__spRentalPositionEvents', {
      value: captured,
      configurable: true,
    });
    window.addEventListener('sp:growth-event', (event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== 'object' || event.detail === null) return;
      captured.push({ ...(event.detail as Record<string, unknown>) });
    });
  });

  await page.goto('/rental-position-check/', { waitUntil: 'domcontentloaded' });

  const questions = page.locator('[data-rental-position-check] [data-position-question]');
  for (let index = 0; index < 7; index += 1) {
    await questions.nth(index).locator('input[type="radio"]').first().check();
  }
  await page.getByRole('button', { name: 'Show my readiness result' }).click();

  const events = await page.evaluate(() =>
    (window as Window & { __spRentalPositionEvents?: Record<string, unknown>[] }).__spRentalPositionEvents ?? [],
  );

  expect(events.map((event) => event.name)).toEqual(
    expect.arrayContaining(['rental_position_check_started', 'rental_position_check_completed']),
  );

  const lifecycle = events.filter((event) =>
    event.name === 'rental_position_check_started' || event.name === 'rental_position_check_completed',
  );

  for (const event of lifecycle) {
    expect(Object.keys(event).sort()).toEqual(['name']);
    const serialized = JSON.stringify(event).toLowerCase();
    for (const forbidden of ['answer', 'score', 'email', 'phone', 'address', 'suburb', 'property']) {
      expect(serialized).not.toContain(forbidden);
    }
  }
});
