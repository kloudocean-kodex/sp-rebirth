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

test('homepage above the fold follows Sana final brief without extra sales clutter', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.sana-hero');
  await expect(hero.getByText('Melbourne Property Management · For Rental Providers.', { exact: true })).toBeVisible();
  await expect(hero.getByRole('heading', { name: 'Is your property really being managed?', exact: true })).toBeVisible();
  await expect(
    hero.getByText('Property management with strategy, accountability and personal attention.', { exact: true }),
  ).toBeVisible();
  await expect(hero.getByText('Your Property. My Priority.', { exact: true })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Get a Rental Health Check', exact: true })).toHaveAttribute(
    'href',
    '/property-management-visibility-check/',
  );
  await expect(hero.getByRole('link', { name: 'Change Property Manager', exact: true })).toHaveAttribute(
    'href',
    '/switch-property-managers/',
  );

  await expect(hero.locator('video')).toHaveCount(0);
  await expect(hero.getByText(/managing director|licensed estate agent|24×7 direct access/i)).toHaveCount(0);
});

test('homepage preserves Sana original local logo', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const brand = page.getByRole('link', { name: 'Sana Patel Real Estate home' });
  const logo = brand.locator('.brand__logo');
  await expect(brand).toBeVisible();
  await expect(logo).toHaveAttribute('alt', 'Sana Patel Real Estate');
  await expect(logo).toHaveAttribute('src', /\/media\/sana-patel-logo\.webp$/);
});

test('homepage presents Sana current PRIDE wording in the framework-led treatment', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const pride = page.locator('#pride');
  await expect(pride.getByRole('heading', { name: /property management with pride/i })).toBeVisible();
  await expect(
    pride.getByText('A clear standard for how I approach the management of every property.', { exact: true }),
  ).toBeVisible();
  await expect(pride.getByText('PRIDE is the standard I choose to bring to my work every day.', { exact: true })).toBeVisible();

  for (const heading of [
    'Proactive Property Care',
    'Responsive Communication',
    'Integrity in Every Decision',
    'Diligent Property Management',
    'Experience That Matters',
  ]) {
    await expect(pride.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }

  await expect(pride.locator('.sana-pride-card')).toHaveCount(5);
});

test('homepage keeps Sana PRIDE philosophy and consistent-standard message intact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const philosophy = page.locator('.sana-philosophy');
  await expect(philosophy.getByText('What PRIDE means to me', { exact: true })).toBeVisible();
  await expect(philosophy.getByText(/property management is not simply about collecting rent/i)).toBeVisible();
  await expect(philosophy.getByText(/not every situation in property management can be predicted or controlled/i)).toBeVisible();
  await expect(philosophy.getByText('What I can control is how I respond.', { exact: true })).toBeVisible();

  const standard = page.locator('.sana-standard');
  await expect(standard.getByText('The Standard behind the service', { exact: true })).toBeVisible();
  await expect(standard.getByText(/different properties\. different situations\. one consistent standard:/i)).toBeVisible();
  await expect(standard.getByText('Your Property. My Priority.', { exact: true })).toBeVisible();
});

test('homepage review proof stays source-driven and accessible if Trustindex is unavailable', async ({ page }) => {
  await page.route('https://cdn.trustindex.io/**', (route) => route.abort('blockedbyclient'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /trusted by rental providers & renters/i })).toBeVisible();
  await expect(page.getByText('Real experiences. Real service.', { exact: true })).toBeVisible();
  await expect(
    page.getByText(/hear directly from rental providers and renters who have shared their experience/i),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /read reviews on google/i })).toHaveAttribute(
    'href',
    /query_place_id=ChIJ56JfW3H5QQcRERAx5fE3MgM/,
  );
  await expect(page.locator('[data-review-provider="Trustindex"]')).toHaveAttribute(
    'data-trustindex-widget-id',
    /^[a-f0-9]{24,64}$/,
  );
});

test('homepage closes with Sana requested final action pair', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const cta = page.locator('.sana-final-cta');
  await expect(
    cta.getByRole('heading', { name: /ready to take a closer look at how your property is being managed/i }),
  ).toBeVisible();
  await expect(cta.getByRole('link', { name: 'Get a Rental Health Check', exact: true })).toHaveAttribute(
    'href',
    '/property-management-visibility-check/',
  );
  await expect(cta.getByRole('link', { name: 'Change Property Manager', exact: true })).toHaveAttribute(
    'href',
    '/switch-property-managers/',
  );
  await expect(cta.getByText('Your Property. My Priority.', { exact: true })).toBeVisible();
});

test('homepage follows the disciplined three-part client structure', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.sana-hero')).toBeVisible();
  await expect(page.locator('#pride')).toBeVisible();
  await expect(page.locator('#reviews')).toBeVisible();
  await expect(page.locator('.rebirth-diagnostic')).toHaveCount(0);
  await expect(page.locator('.rebirth-services')).toHaveCount(0);
  await expect(page.locator('.rebirth-switch')).toHaveCount(0);
  await expect(page.locator('.rebirth-process')).toHaveCount(0);
  await expect(page.locator('.rebirth-faq')).toHaveCount(0);
  await expect(page.locator('.rebirth-appraisal')).toHaveCount(0);
  await expect(page.locator('main video')).toHaveCount(0);

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/melbourne'?s best|guaranteed returns|maximise your returns|100% stress[- ]free/i);
});

test('confirmed 24x7 direct-access service promise remains on the detailed rental-provider journey', async ({ page }) => {
  await page.goto('/rental-providers/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('24×7 direct access', { exact: true }).first()).toBeVisible();
});

test('supporting journeys remain reachable from the footer', async ({ page }) => {
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

test('mobile navigation follows Sana final requested hierarchy', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile interaction test');

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const menu = page.locator('.mobile-nav');
  await expect(menu).toBeVisible();
  await menu.locator('summary').click();

  const expectedLinks = [
    ['Home', '/'],
    ['Meet Sana Patel', '/about/'],
    ['Property Management', '/rental-providers/'],
    ['Change Property Manager', '/switch-property-managers/'],
    ['Resources', '/resources/'],
    ['Contact', '/contact/'],
    ['Get a Rental Health Check', '/property-management-visibility-check/'],
  ] as const;

  for (const [label, href] of expectedLinks) {
    await expect(menu.getByRole('link', { name: label, exact: true })).toBeVisible();
    await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }

  await expect(menu.getByRole('link', { name: /Call Sana · 0416 977 990/i })).toHaveAttribute(
    'href',
    'tel:+61416977990',
  );
});
