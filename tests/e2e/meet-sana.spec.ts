import { expect, test } from '@playwright/test';

test('Meet Sana page follows Sana final supplied introduction and framed photography', async ({ page }) => {
  await page.goto('/about/', { waitUntil: 'domcontentloaded' });

  const hero = page.locator('.meet-hero');
  await expect(hero.getByRole('heading', { name: 'Meet Sana Patel', exact: true })).toBeVisible();
  await expect(hero.getByText(/Licensed Estate Agent.*10\+ Years in Property Management/i)).toBeVisible();
  await expect(
    hero.getByText(/I built Sana Patel Real Estate around the way I believe property management should be approached/i),
  ).toBeVisible();

  const portrait = hero.locator('img');
  await expect(portrait).toHaveAttribute('src', '/media/sana-patel-meet-portrait.jpg');
  await expect
    .poll(() => portrait.evaluate((image: HTMLImageElement) => ({ complete: image.complete, width: image.naturalWidth })))
    .toEqual({ complete: true, width: 1264 });

  const origin = page.locator('.meet-origin');
  await expect(
    origin.getByRole('heading', { name: 'From Receptionist to Licensed Estate Agent', exact: true }),
  ).toBeVisible();
  await expect(origin.getByText(/I started my real estate career as a receptionist/i)).toBeVisible();
  await expect(origin.getByText(/day-to-day management of investment properties/i)).toBeVisible();
  await expect(origin.getByText('The details matter.', { exact: true })).toBeVisible();

  const detail = page.locator('.meet-detail');
  const desk = detail.locator('img');
  await expect(desk).toHaveAttribute('src', '/media/sana-patel-meet-desk.jpg');
  await expect
    .poll(() => desk.evaluate((image: HTMLImageElement) => ({ complete: image.complete, width: image.naturalWidth })))
    .toEqual({ complete: true, width: 1264 });
  await expect(detail.getByRole('heading', { name: 'Why Sana Patel Real Estate', exact: true })).toBeVisible();
  await expect(detail.getByText(/offer a more personal and hands-on approach to property management/i)).toBeVisible();
  await expect(detail.getByText(/who is overseeing the management of their property/i)).toBeVisible();

  const standard = page.locator('.meet-standard');
  await expect(
    standard.getByRole('heading', { name: /When Your Name Is on the Business, the Standard is personal/i }),
  ).toBeVisible();
  await expect(standard.getByText(/clear communication, careful documentation, considered advice/i)).toBeVisible();
  await expect(standard.getByText('Your Property. My Priority.', { exact: true })).toBeVisible();

  const actions = page.locator('.meet-actions');
  await expect(actions.getByRole('link', { name: 'Get a Rental Health Check', exact: true })).toHaveAttribute(
    'href',
    '/property-management-visibility-check/',
  );
  await expect(actions.getByRole('link', { name: 'Change Your Property Manager', exact: true })).toHaveAttribute(
    'href',
    '/switch-property-managers/',
  );

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});
