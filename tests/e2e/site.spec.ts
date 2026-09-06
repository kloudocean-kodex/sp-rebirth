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

    // CI/staging builds must never become an accidental second indexed website.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  });
}

test('homepage leads with Sana handwritten proposition, PRIDE and direct contact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.rebirth-hero');
  await expect(hero.getByRole('heading', { name: /is your property really being managed/i })).toBeVisible();
  await expect(hero.getByText('Your Property. My Priority.', { exact: true })).toBeVisible();
  await expect(hero.getByRole('link', { name: /call sana · 0416 977 990/i })).toHaveAttribute(
    'href',
    'tel:+61416977990',
  );
  await expect(hero.getByRole('link', { name: /request a rental appraisal/i })).toHaveAttribute('href', '#appraisal');
  await expect(hero.getByText('Managing Director', { exact: true })).toBeVisible();
  await expect(hero.getByText('Licensed Estate Agent', { exact: true })).toBeVisible();
  await expect(hero.getByText('24×7 direct access', { exact: true })).toBeVisible();
  await expect(hero.locator('.rebirth-pride-mark')).toBeVisible();

  const pride = page.locator('#pride');
  await expect(pride.getByRole('heading', { name: /property management with pride/i })).toBeVisible();
  for (const heading of [
    'Proactive Property Care',
    'Results Driven',
    'Integrity in Every Decision',
    'Diligent Property Management',
    'Experience That Matters',
  ]) {
    await expect(pride.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});

test('homepage preserves Sana original logo without depending on logo image load completion', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const brand = page.getByRole('link', { name: 'Sana Patel Real Estate home' });
  const logo = brand.locator('.brand__logo');
  await expect(brand).toBeVisible();
  await expect(logo).toHaveAttribute('alt', 'Sana Patel Real Estate');
  await expect(logo).toHaveAttribute('src', /Sana-Patel-Logo\.webp$/);
});

test('homepage carries Sana owner-diagnostic questions inline instead of forcing another journey', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /five questions worth asking about your property/i })).toBeVisible();
  for (const fragment of [
    /when was the rent last reviewed/i,
    /routine inspections protecting the property/i,
    /maintenance issues being dealt with/i,
    /useful answer and a clear next step/i,
    /what decision is coming next/i,
  ]) {
    await expect(page.getByText(fragment).first()).toBeVisible();
  }

  await expect(page.locator('main a[href="/property-management-visibility-check/"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/rental-position-check/"]')).toHaveCount(0);
});

test('homepage includes full-service management detail without unsupported performance claims', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /the everyday details\. managed as one property story/i })).toBeVisible();
  for (const heading of [
    'Leasing & renter selection',
    'Routine inspections',
    'Rent & arrears',
    'Maintenance coordination',
    'Compliance coordination',
    'Renewals & tenancy communication',
  ]) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/melbourne'?s best|guaranteed returns|maximise your returns|100% stress[- ]free/i);
});

test('homepage switching section is understandable without leaving the landing page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const switching = page.locator('#switching');
  await expect(switching.getByRole('heading', { name: /changing managers can be simpler than staying frustrated/i })).toBeVisible();
  await expect(switching.getByRole('heading', { name: 'Talk', exact: true })).toBeVisible();
  await expect(switching.getByRole('heading', { name: 'Review', exact: true })).toBeVisible();
  await expect(switching.getByRole('heading', { name: /move only if it makes sense/i })).toBeVisible();
  await expect(switching.getByRole('link', { name: /talk to sana about switching/i })).toHaveAttribute(
    'href',
    'tel:+61416977990',
  );
  await expect(page.locator('main a[href="/switch-property-managers/"]')).toHaveCount(0);
});

test('homepage review proof keeps accessible independent source links if the vendor widget is unavailable', async ({
  page,
}) => {
  await page.route('https://cdn.trustindex.io/**', (route) => route.abort('blockedbyclient'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /trust should not depend on a polished promise/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /read the current reviews/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /current google reviews open source/i })).toHaveAttribute(
    'href',
    /query_place_id=ChIJ56JfW3H5QQcRERAx5fE3MgM/,
  );
  await expect(page.getByRole('link', { name: /current agency activity realestate\.com\.au/i })).toHaveAttribute(
    'href',
    'https://www.realestate.com.au/agency/sana-patel-real-estate-KRFFJV',
  );
  await expect(page.locator('[data-review-provider="Trustindex"]')).toHaveAttribute(
    'data-trustindex-widget-id',
    /^[a-f0-9]{24,64}$/,
  );
});

test('confirmed 24x7 direct-access service promise remains visible', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 direct access', { exact: true }).first()).toBeVisible();

  await page.goto('/rental-providers/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 direct access', { exact: true }).first()).toBeVisible();
});

test('homepage hero keeps a static evidence-safe PRIDE composition', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.rebirth-hero');
  await expect(hero.locator('.rebirth-pride-mark')).toBeVisible();
  await expect(hero.locator('.rebirth-pride-mark__letters')).toBeVisible();
  await expect(hero.locator('video')).toHaveCount(0);
  await expect(hero.locator('img')).toHaveCount(0);
  await expect(page.getByText(/concept composition|replace with approved sana photography/i)).toHaveCount(0);
});

test('homepage is one primary experience with embedded appraisal action', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('main video')).toHaveCount(0);
  await expect(page.locator('#pride')).toBeVisible();
  await expect(page.locator('#services')).toBeVisible();
  await expect(page.locator('#why-sana')).toBeVisible();
  await expect(page.locator('#switching')).toBeVisible();
  await expect(page.locator('#reviews')).toBeVisible();
  await expect(page.locator('#appraisal')).toBeVisible();
  await expect(page.locator('#appraisal form')).toBeVisible();
  await expect(page.locator('main a[href="/switch-property-managers/"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/rental-appraisal/"]')).toHaveCount(0);
});

test('homepage FAQ exposes direct-call and switching answers without forcing navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const callQuestion = page
    .locator('.rebirth-faq details')
    .filter({ hasText: 'Can I speak with Sana before filling in a form?' })
    .locator('summary');
  await callQuestion.click();
  await expect(page.getByText(/direct phone access is a first-class part of the service/i)).toBeVisible();

  const switchQuestion = page
    .locator('.rebirth-faq details')
    .filter({ hasText: 'Can Sana help if my property is already managed elsewhere?' })
    .locator('summary');
  await switchQuestion.click();
  await expect(page.getByText(/what an orderly handover would require/i)).toBeVisible();
  await expect(page.getByText(/do not need to cancel anything before that conversation/i)).toBeVisible();
});

test('supporting journeys remain reachable from the footer without competing in primary navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const footer = page.locator('footer.site-footer');

  await expect(footer.getByRole('link', { name: 'About Sana' })).toHaveAttribute('href', '/about/');
  await expect(footer.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/resources/');
  await expect(footer.getByRole('link', { name: 'For renters' })).toHaveAttribute('href', '/for-renters/');
  await expect(footer.getByRole('link', { name: 'Selling' })).toHaveAttribute('href', '/sale/');
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

test('mobile navigation keeps Sana primary landing experience deliberately small', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction test');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const menu = page.locator('.mobile-nav');
  await expect(menu).toBeVisible();
  await menu.locator('summary').click();

  const expectedLinks = [
    ['PRIDE', '/#pride'],
    ['Why Sana', '/#why-sana'],
    ['Services', '/#services'],
    ['Reviews', '/#reviews'],
    ['Switch Property Manager', '/#switching'],
    ['Request a Rental Appraisal', '/#appraisal'],
  ] as const;

  for (const [label, href] of expectedLinks) {
    await expect(menu.getByRole('link', { name: label })).toBeVisible();
    await expect(menu.getByRole('link', { name: label })).toHaveAttribute('href', href);
  }

  await expect(menu.getByRole('link', { name: /Call Sana · 0416 977 990/i })).toHaveAttribute(
    'href',
    'tel:+61416977990',
  );
  await expect(menu.getByRole('link', { name: 'Rental Position Check' })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Resources' })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Selling' })).toHaveCount(0);
});
