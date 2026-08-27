import { expect, test } from '@playwright/test';

type CapturedGrowthEvent = Record<string, unknown>;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const captured: Record<string, unknown>[] = [];
    Object.defineProperty(window, '__spGrowthEvents', {
      value: captured,
      configurable: true,
    });

    window.addEventListener('sp:growth-event', (event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== 'object' || event.detail === null) return;
      captured.push({ ...(event.detail as Record<string, unknown>) });
    });
  });
});

async function capturedEvents(page: import('@playwright/test').Page): Promise<CapturedGrowthEvent[]> {
  return page.evaluate(() => {
    const candidate = (window as Window & { __spGrowthEvents?: Record<string, unknown>[] }).__spGrowthEvents;
    return candidate ?? [];
  });
}

test('Visibility Check emits lifecycle signals without answers, scores or contact data', async ({ page }) => {
  await page.goto('/property-management-visibility-check/', { waitUntil: 'domcontentloaded' });

  const questions = page.locator('[data-visibility-check] [data-question]');
  for (let index = 0; index < 7; index += 1) {
    await questions.nth(index).locator('input[type="radio"]').first().check();
  }
  await page.getByRole('button', { name: 'Show my visibility result' }).click();

  await expect.poll(async () => (await capturedEvents(page)).map((event) => event.name)).toEqual(
    expect.arrayContaining(['visibility_check_started', 'visibility_check_completed']),
  );

  const events = await capturedEvents(page);
  const visibilityEvents = events.filter((event) =>
    event.name === 'visibility_check_started' || event.name === 'visibility_check_completed',
  );

  for (const event of visibilityEvents) {
    expect(Object.keys(event).sort()).toEqual(['name']);
    const serialized = JSON.stringify(event).toLowerCase();
    for (const forbidden of ['answer', 'score', 'email', 'phone', 'address', 'name=']) {
      expect(serialized).not.toContain(forbidden);
    }
  }
});

test('lead form start signal contains only the journey type', async ({ page }) => {
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="full_name"]').fill('Test Visitor');

  await expect.poll(async () => (await capturedEvents(page)).find((event) => event.name === 'lead_started')).toEqual({
    name: 'lead_started',
    formType: 'general',
  });

  const leadStarted = (await capturedEvents(page)).find((event) => event.name === 'lead_started');
  expect(Object.keys(leadStarted ?? {}).sort()).toEqual(['formType', 'name']);
  expect(JSON.stringify(leadStarted)).not.toContain('Test Visitor');
});

test('thank-you acknowledges routing without fabricating downstream delivery or calling gtag', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__spGtagCalls', { value: [] as unknown[][], configurable: true });
    Object.defineProperty(window, 'gtag', {
      value: (...args: unknown[]) => {
        (window as Window & { __spGtagCalls?: unknown[][] }).__spGtagCalls?.push(args);
      },
      configurable: true,
    });
  });

  await page.goto('/thank-you/?type=rental_appraisal', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /received securely/i })).toBeVisible();
  await expect(page.getByText(/being routed to Sana/i)).toBeVisible();

  const events = await capturedEvents(page);
  expect(events.find((event) => event.name === 'lead_delivered')).toBeUndefined();

  const gtagCalls = await page.evaluate(
    () => (window as Window & { __spGtagCalls?: unknown[][] }).__spGtagCalls ?? [],
  );
  expect(gtagCalls).toEqual([]);
});
