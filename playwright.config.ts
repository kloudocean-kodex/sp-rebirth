import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // Keep release evidence honest: a browser assertion must pass on its first
  // attempt; environmental failures should remain visible for investigation.
  retries: 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:8788',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Keep the real Wrangler/Worker runtime, but place a tiny HTTP proxy in front of it for
    // browser QA. Wrangler's local self-signed TLS listener has terminated nondeterministically
    // after repeated WebKit certificate-alert handshakes on both Windows and Linux. The proxy
    // removes only upgrade-insecure-requests from the local response so relative assets remain
    // on the local HTTP origin. Unit tests, the production build/dry-run and live staging retain
    // and verify the complete production CSP and HTTPS contract.
    command: 'node scripts/browser-test-server.mjs',
    url: 'http://127.0.0.1:8788',
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
