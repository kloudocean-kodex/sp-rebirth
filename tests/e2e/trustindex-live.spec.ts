import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('live Trustindex widget resolves the connected Google review source', async ({ page }) => {
  test.skip(
    process.env.TRUSTINDEX_LIVE_UAT !== '1',
    'Opt-in external-provider UAT; deterministic fallback and CSP contracts run in the normal CI suite.',
  );

  const diagnostics: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      diagnostics.push(`console:${message.type()}:${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('trustindex') || request.url().includes('googleusercontent')) {
      diagnostics.push(`requestfailed:${request.url()}:${request.failure()?.errorText ?? 'unknown'}`);
    }
  });
  page.on('response', (response) => {
    if (response.url().includes('trustindex')) {
      diagnostics.push(`response:${response.status()}:${response.url()}`);
    }
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const proof = page.locator('.trust-proof');
  await proof.scrollIntoViewIfNeeded();

  try {
    await expect(proof.locator('.ti-widget')).toBeVisible({ timeout: 20_000 });
    await expect(proof.locator('.ti-review-item').first()).toBeVisible();
    await expect(proof.locator('.ti-header-rating-reviews').first()).toContainText(/\d+ reviews/i);
    await expect(proof.locator('[data-platform-page-url*="google.com/maps"]').first()).toBeAttached();

    if ((page.viewportSize()?.width ?? 1280) > 800) {
      const nextReview = proof.getByRole('button', { name: 'Next review' });
      await expect(nextReview).toBeVisible();
      await nextReview.focus();
      await expect(nextReview).toBeFocused();
    }

    const accessibility = await new AxeBuilder({ page })
      .include('.trust-proof')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      accessibility.violations,
      accessibility.violations
        .map((violation) => `${violation.id}: ${violation.help} — ${violation.nodes.length} node(s)`)
        .join('\n'),
    ).toEqual([]);
  } finally {
    const runtime = await page.evaluate(() => {
      const host = document.querySelector<HTMLElement>('[data-review-provider="Trustindex"]');
      const trustindexWindow = window as typeof window & {
        Trustindex?: unknown;
        tiElementToWaitForVisibility?: unknown[];
        tiElementToWaitForActivity?: unknown[];
        tiWidgetInstances?: unknown[];
      };

      return {
        hostHtml: host?.innerHTML.slice(0, 1_000) ?? null,
        loaderScripts: document.querySelectorAll('script[src*="cdn.trustindex.io/loader.js"]').length,
        initedLoaders: document.querySelectorAll('[data-ti-widget-inited]').length,
        hasRuntime: Boolean(trustindexWindow.Trustindex),
        waitingForVisibility: trustindexWindow.tiElementToWaitForVisibility?.length ?? null,
        waitingForActivity: trustindexWindow.tiElementToWaitForActivity?.length ?? null,
        widgetInstances: trustindexWindow.tiWidgetInstances?.length ?? null,
      };
    });
    diagnostics.push(`runtime:${JSON.stringify(runtime)}`);
    if (diagnostics.length) console.info(`Trustindex live UAT diagnostics:\n${diagnostics.join('\n')}`);
  }
});
