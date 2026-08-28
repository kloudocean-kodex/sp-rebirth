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

    // CI/staging builds must never become an accidental second indexed website.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  });
}

test('homepage exposes the value-first diagnostic before requiring a sales conversation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const visibilityCheck = page.getByRole('link', { name: /take the 90-second check/i });
  await expect(visibilityCheck).toBeVisible();
  await expect(visibilityCheck).toHaveAttribute('href', '/property-management-visibility-check/');
});

test('confirmed 24x7 direct-access service promise remains visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 to Sana Patel', { exact: true })).toBeVisible();

  await page.goto('/rental-providers/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 direct access', { exact: true }).first()).toBeVisible();
});

test('homepage hero uses the static premium media contract', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const heroPoster = page.locator('.hero__poster');
  await expect(heroPoster).toBeVisible();
  await expect(heroPoster).toHaveAttribute('src', /home-interior_413970226\.webp$/);
  await expect(heroPoster).toHaveAttribute('srcset', /home-interior_413970226-768x432\.webp 768w/);
  await expect(heroPoster).toHaveAttribute('sizes', '100vw');
  await expect(page.locator('.hero__video')).toHaveCount(0);
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

test('legacy rental-provider URL permanently redirects to the canonical journey', async ({ request }) => {
  const response = await request.get('/for-rental-providers/', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe('/rental-providers/');
});

test('mobile navigation keeps the full customer journey accessible', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction test');

  await page.goto('/');
  const menu = page.locator('.mobile-nav');
  await expect(menu).toBeVisible();
  await menu.locator('summary').click();

  for (const label of [
    'Rental Providers',
    'Rental Appraisal',
    'Rental Position Check',
    'Switch Property Managers',
    'About Sana',
    'Resources',
    'For Renters',
    'Selling',
    'Contact',
  ]) {
    await expect(menu.getByRole('link', { name: label })).toBeVisible();
  }
});
