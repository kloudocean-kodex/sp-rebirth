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

async function fillGeneralLead(page: import('@playwright/test').Page) {
  await page.locator('input[name="full_name"]').fill('Synthetic Visitor');
  await page.locator('input[name="phone"]').fill('0412 345 678');
  await page.locator('input[name="email"]').fill('synthetic@example.test');
}

test('Visibility Check emits lifecycle signals without answers, scores or contact data', async ({ page }) => {
  await page.goto('/property-management-visibility-check/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const questions = page.locator('[data-visibility-check] [data-question]');
  for (let index = 0; index < 7; index += 1) {
    const option = questions.nth(index).locator('label').first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(option.locator('input[type="radio"]')).toBeChecked();
  }
  await page.getByRole('button', { name: 'Show my visibility result' }).click();

  await expect
    .poll(async () => (await capturedEvents(page)).map((event) => event.name))
    .toEqual(expect.arrayContaining(['visibility_check_started', 'visibility_check_completed']));

  const events = await capturedEvents(page);
  const visibilityEvents = events.filter(
    (event) => event.name === 'visibility_check_started' || event.name === 'visibility_check_completed',
  );

  for (const event of visibilityEvents) {
    expect(Object.keys(event).sort()).toEqual(['name']);
    const serialized = JSON.stringify(event).toLowerCase();
    for (const forbidden of ['answer', 'score', 'email', 'phone', 'address', 'name=']) {
      expect(serialized).not.toContain(forbidden);
    }
  }
});

test('lead form preserves first-touch campaign attribution without carrying arbitrary query-string data', async ({
  page,
}) => {
  await page.goto(
    '/?utm_source=Google&utm_medium=cpc&utm_campaign=Spring&utm_content=hero&utm_term=property&email=private%40example.test#offer',
    { waitUntil: 'domcontentloaded' },
  );
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('input[name="landing_page"]')).toHaveValue('https://127.0.0.1:8788/');
  await expect(page.locator('input[name="utm_source"]')).toHaveValue('Google');
  await expect(page.locator('input[name="utm_medium"]')).toHaveValue('cpc');
  await expect(page.locator('input[name="utm_campaign"]')).toHaveValue('Spring');
  await expect(page.locator('input[name="utm_content"]')).toHaveValue('hero');
  await expect(page.locator('input[name="utm_term"]')).toHaveValue('property');

  const landingPage = await page.locator('input[name="landing_page"]').inputValue();
  expect(landingPage).not.toContain('private@example.test');
  expect(landingPage).not.toContain('?');
  expect(landingPage).not.toContain('#');
});

test('direct contact selections emit channel-only measurement without the phone number or email address', async ({
  page,
}) => {
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    const phone = document.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
    if (!phone) throw new Error('Expected a phone contact link');
    phone.addEventListener('click', (event) => event.preventDefault(), { once: true });
    phone.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const email = document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
    if (!email) throw new Error('Expected an email contact link');
    email.addEventListener('click', (event) => event.preventDefault(), { once: true });
    email.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await expect
    .poll(async () => (await capturedEvents(page)).filter((event) => event.name === 'contact_selected'))
    .toEqual([
      { name: 'contact_selected', channel: 'phone' },
      { name: 'contact_selected', channel: 'email' },
    ]);

  const contactEvents = (await capturedEvents(page)).filter((event) => event.name === 'contact_selected');
  for (const event of contactEvents) {
    expect(Object.keys(event).sort()).toEqual(['channel', 'name']);
    const serialized = JSON.stringify(event).toLowerCase();
    expect(serialized).not.toContain('0416');
    expect(serialized).not.toContain('@');
  }
});

test('lead form start signal contains only the journey type', async ({ page }) => {
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="full_name"]').fill('Test Visitor');

  await expect
    .poll(async () => (await capturedEvents(page)).find((event) => event.name === 'lead_started'))
    .toEqual({
      name: 'lead_started',
      formType: 'general',
    });

  const leadStarted = (await capturedEvents(page)).find((event) => event.name === 'lead_started');
  expect(Object.keys(leadStarted ?? {}).sort()).toEqual(['formType', 'name']);
  expect(JSON.stringify(leadStarted)).not.toContain('Test Visitor');
});

test('lead acceptance signal ignores success-like decoys and requires real durable acceptance', async ({ page }) => {
  const acrossNavigation: CapturedGrowthEvent[] = [];
  await page.exposeFunction('__captureSpGrowthEvent', (event: CapturedGrowthEvent) => {
    acrossNavigation.push(event);
  });
  await page.addInitScript(() => {
    window.addEventListener('sp:growth-event', (event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== 'object' || event.detail === null) return;
      const capture = (
        window as Window & {
          __captureSpGrowthEvent?: (detail: Record<string, unknown>) => void;
        }
      ).__captureSpGrowthEvent;
      capture?.({ ...(event.detail as Record<string, unknown>) });
    });
  });

  let responseStatus = 202;
  await page.route('**/api/leads', async (route) => {
    const realAcceptance = responseStatus === 201;
    await route.fulfill({
      status: responseStatus,
      contentType: 'application/json',
      body: JSON.stringify(realAcceptance ? { ok: true, leadId: 'synthetic-lead-id' } : { ok: true }),
    });
  });

  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });
  await fillGeneralLead(page);
  await Promise.all([
    page.waitForURL(/\/thank-you\/\?type=general$/),
    page.getByRole('button', { name: 'Send enquiry' }).click(),
  ]);

  expect(acrossNavigation.filter((event) => event.name === 'lead_accepted')).toHaveLength(0);

  responseStatus = 201;
  await page.goto('/contact/', { waitUntil: 'domcontentloaded' });
  await fillGeneralLead(page);
  await Promise.all([
    page.waitForURL(/\/thank-you\/\?type=general$/),
    page.getByRole('button', { name: 'Send enquiry' }).click(),
  ]);

  await expect.poll(() => acrossNavigation.filter((event) => event.name === 'lead_accepted').length).toBe(1);
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

  const response = await page.goto('/thank-you/?type=rental_appraisal', { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  const headers = response?.headers() ?? {};
  expect(headers['cache-control']).toContain('no-store');
  expect(headers['x-robots-tag']).toContain('noindex');
  expect(headers['strict-transport-security']).toContain('max-age=31536000');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");

  await expect(page.getByRole('heading', { name: /received securely/i })).toBeVisible();
  await expect(page.getByText(/being routed to Sana/i)).toBeVisible();

  const events = await capturedEvents(page);
  expect(events.find((event) => event.name === 'lead_delivered')).toBeUndefined();

  const gtagCalls = await page.evaluate(() => (window as Window & { __spGtagCalls?: unknown[][] }).__spGtagCalls ?? []);
  expect(gtagCalls).toEqual([]);
});
