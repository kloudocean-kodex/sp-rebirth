import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/rental-providers/',
  '/rental-appraisal/',
  '/switch-property-managers/',
  '/property-management-visibility-check/',
  '/rental-position-check/',
  '/about/',
  '/lease/',
  '/for-renters/',
  '/sale/',
  '/contact/',
  '/resources/',
  '/resources/victoria-rental-minimum-standards/',
  '/resources/routine-inspections-victoria/',
  '/resources/changing-property-managers-victoria/',
  '/resources/forms-and-guidance/',
  '/privacy/',
] as const;

for (const path of publicRoutes) {
  test(`${path} renders with a coherent document outline`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response, `No response for ${path}`).not.toBeNull();
    expect(response?.status(), `${path} returned an error status`).toBeLessThan(400);

    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  });
}

test('homepage makes Sana, PRIDE and direct contact obvious immediately', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.luxe-hero');
  await expect(hero.getByRole('heading', { name: /property management with pride/i })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Call Sana', exact: true })).toHaveAttribute('href', 'tel:+61416977990');
  await expect(hero.getByRole('link', { name: 'Email Sana', exact: true })).toHaveAttribute(
    'href',
    'mailto:sana@sanapatel.com.au',
  );
  await expect(hero.getByText('Passionate', { exact: true })).toBeVisible();
  await expect(hero.getByText('Results Driven', { exact: true })).toBeVisible();
  await expect(hero.getByText('Integrity', { exact: true })).toBeVisible();
  await expect(hero.getByText('Dedicated', { exact: true })).toBeVisible();
  await expect(hero.getByText('Experienced', { exact: true })).toBeVisible();
});

test('homepage explains the work without creating another navigation maze', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /your property\. my priority/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /the essentials\. clearly handled/i })).toBeVisible();
  for (const item of [
    'Leasing & renter selection',
    'Rent reviews & tenancy planning',
    'Routine inspections',
    'Maintenance coordination',
    'Rent, arrears & renewals',
    'Direct owner communication',
  ]) {
    await expect(page.getByText(item, { exact: true })).toBeVisible();
  }

  await expect(page.locator('main a[href="/property-management-visibility-check/"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/rental-position-check/"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/rental-appraisal/"]')).toHaveCount(0);
  await expect(page.locator('main form')).toHaveCount(0);
});

test('homepage review proof keeps Trustindex as the visible source if the widget is unavailable', async ({ page }) => {
  await page.route('https://cdn.trustindex.io/**', (route) => route.abort('blockedbyclient'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /trust is better read at the source/i })).toBeVisible();
  await expect(page.locator('.luxe-review-link')).toHaveAttribute(
    'href',
    'https://www.trustindex.io/reviews/www.sanapatel.com.au',
  );
  await expect(page.locator('[data-review-provider="Trustindex"]')).toHaveAttribute(
    'data-trustindex-widget-id',
    /^[a-f0-9]{24,64}$/,
  );
});

test('confirmed 24x7 direct-access service promise remains visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/24×7 direct access to Sana Patel/i)).toBeVisible();

  await page.goto('/rental-providers/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 direct access', { exact: true }).first()).toBeVisible();
});

test('homepage hero stays static and founder-led', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const portrait = page.locator('.luxe-hero__arch img');
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('alt', 'Sana Patel');
  await expect(portrait).toHaveAttribute('fetchpriority', 'high');
  await expect(portrait).toHaveAttribute('src', /Sana-headshot\.webp/);
  await expect(page.locator('.luxe-hero video')).toHaveCount(0);
});

test('homepage is deliberately one-page and contact-first', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.luxe-header')).toBeVisible();
  await expect(page.locator('.luxe-pride')).toBeVisible();
  await expect(page.locator('.luxe-service')).toBeVisible();
  await expect(page.locator('.luxe-founder')).toBeVisible();
  await expect(page.locator('#reviews')).toBeVisible();
  await expect(page.locator('.luxe-close')).toBeVisible();
  await expect(page.locator('main video')).toHaveCount(0);
  await expect(page.locator('main form')).toHaveCount(0);
  await expect(page.locator('.mobile-nav')).toHaveCount(0);
});

test('mobile landing page keeps direct contact available without opening a menu', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction test');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.luxe-header__call')).toBeVisible();
  await expect(page.locator('.luxe-header__call')).toHaveAttribute('href', 'tel:+61416977990');
  await expect(page.locator('.luxe-header summary')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /property management with pride/i })).toBeVisible();
});

test('staging robots policy blocks crawling', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Disallow: /');
});

test('staging does not publish a crawl sitemap', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(404);
});

test('forms guidance keeps official Victorian sources and legacy-document boundaries visible', async ({ page }) => {
  await page.goto('/resources/forms-and-guidance/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/general information only, not legal advice/i)).toBeVisible();
  await expect(page.getByText(/not published or submitted/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /consumer affairs victoria — forms and publications/i })).toHaveAttribute(
    'href',
    'https://www.consumer.vic.gov.au/resources-and-tools/forms-and-publications',
  );
});

test('switching journey compares observable accountability rather than generic agency claims', async ({ page }) => {
  await page.goto('/switch-property-managers/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /compare the management, not the marketing/i })).toBeVisible();
  await expect(page.getByText(/who owns the next step/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /read the current guidance/i })).toHaveAttribute(
    'href',
    'https://www.consumer.vic.gov.au/housing/renting/starting-and-changing-rental-agreements/using-a-property-manager-or-agent',
  );
});

test('legacy rental-provider URL permanently redirects to the canonical journey', async ({ request }) => {
  const response = await request.get('/for-rental-providers/', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe('/rental-providers/');
});
