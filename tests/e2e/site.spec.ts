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

test('homepage leads with Sana, direct contact and three clear owner decisions', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.rebirth-hero');
  await expect(hero.getByRole('heading', { name: /your property should never feel like a mystery/i })).toBeVisible();
  await expect(hero.getByRole('link', { name: /call sana · 0416 977 990/i })).toHaveAttribute(
    'href',
    'tel:+61416977990',
  );
  await expect(hero.getByRole('link', { name: /request a rental appraisal/i })).toHaveAttribute('href', '#appraisal');
  await expect(hero.getByText('Managing Director', { exact: true })).toBeVisible();
  await expect(hero.getByText('Licensed Estate Agent', { exact: true })).toBeVisible();
  await expect(hero.getByText('24×7 direct access', { exact: true })).toBeVisible();

  const services = page.locator('#services');
  await expect(services.getByRole('heading', { name: /i need a property manager/i })).toBeVisible();
  await expect(services.getByRole('heading', { name: /i need a rental appraisal/i })).toBeVisible();
  await expect(services.getByRole('heading', { name: /i want to change managers/i })).toBeVisible();
});

test('homepage includes full-service management detail without unsupported performance claims', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /the everyday details\. made visible/i })).toBeVisible();
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

test('homepage switching section makes accountability observable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /a switch should feel controlled, not chaotic/i })).toBeVisible();
  await expect(page.getByText('One clear point of accountability', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Visible follow-through', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /see the switching approach/i })).toHaveAttribute(
    'href',
    '/switch-property-managers/',
  );
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

test('homepage hero keeps a static evidence-safe identity composition', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.rebirth-hero');
  await expect(hero.locator('.rebirth-identity')).toBeVisible();
  await expect(hero.locator('.rebirth-identity__arch')).toBeVisible();
  await expect(hero.locator('video')).toHaveCount(0);
  await expect(hero.locator('img')).toHaveCount(0);
  await expect(page.getByText(/concept composition|replace with approved sana photography/i)).toHaveCount(0);
});

test('homepage keeps diagnostic tools out of the primary experience and embeds the appraisal action', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('main a[href="/property-management-visibility-check/"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/rental-position-check/"]')).toHaveCount(0);
  await expect(page.locator('main video')).toHaveCount(0);
  await expect(page.locator('#why-sana')).toBeVisible();
  await expect(page.locator('#reviews')).toBeVisible();
  await expect(page.locator('#appraisal')).toBeVisible();
  await expect(page.locator('#appraisal form')).toBeVisible();
});

test('homepage FAQ exposes direct-call and switching answers without forcing navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const callQuestion = page
    .locator('.rebirth-faq details')
    .filter({ hasText: 'Can I speak with Sana before filling in a form?' })
    .locator('summary');
  await callQuestion.click();
  await expect(page.getByText(/direct phone contact is a first-class part of the service/i)).toBeVisible();

  const switchQuestion = page
    .locator('.rebirth-faq details')
    .filter({ hasText: 'Can Sana help if my property is already managed elsewhere?' })
    .locator('summary');
  await switchQuestion.click();
  await expect(page.getByText(/make the handover feel controlled rather than chaotic/i)).toBeVisible();
});

test('supporting journeys remain reachable without competing in primary navigation', async ({ page }) => {
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

test('mobile navigation keeps the primary owner journey deliberately small', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction test');

  await page.goto('/');
  const menu = page.locator('.mobile-nav');
  await expect(menu).toBeVisible();
  await menu.locator('summary').click();

  for (const label of [
    'Services',
    'Why Sana',
    'Reviews',
    'Switch Property Manager',
    /Call Sana · 0416 977 990/i,
    'Request a Rental Appraisal',
  ]) {
    await expect(menu.getByRole('link', { name: label })).toBeVisible();
  }

  await expect(menu.getByRole('link', { name: 'Rental Position Check' })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Resources' })).toHaveCount(0);
  await expect(menu.getByRole('link', { name: 'Selling' })).toHaveCount(0);
});
