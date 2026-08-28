import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
  outputDir: 'test-results',
  use: {
    baseURL: 'https://127.0.0.1:8788',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Exercise the same secure-context behavior as production. The site's CSP includes
    // upgrade-insecure-requests; serving browser QA over plain HTTP causes WebKit to
    // upgrade local CSS/JS to HTTPS while the dev server is still HTTP, which correctly
    // fails TLS and produces a false picture of the rendered application.
    command: 'npx wrangler dev --port 8788 --local-protocol=https',
    url: 'https://127.0.0.1:8788',
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 15'] },
    },
  ],
});
