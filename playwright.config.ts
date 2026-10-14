import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env.config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Project layout:
 *  - "setup"       runs tests/auth/auth.setup.ts once, idempotently ensuring
 *                   the single fixed test account (FIXED_TEST_USER) exists.
 *                   It does not log in itself.
 *  - chromium/firefox/webkit/mobile-chrome  depend on "setup" so the account
 *                   is guaranteed to exist first. Specs that need to run
 *                   logged in import `test`/`expect` from
 *                   src/fixtures/authed-test-options.ts instead of the
 *                   default src/fixtures/test-options.ts; that variant logs
 *                   each parallel worker into the SAME account independently,
 *                   so every worker — and therefore every browser project —
 *                   gets its own isolated session rather than sharing one.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: true,
  forbidOnly: config.isCI,
  retries: config.retries,
  workers: config.isCI ? 2 : config.workers,
  reporter: config.isCI
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit-report.xml' }],
        ['github'],
        ['list'],
      ]
    : [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  outputDir: 'test-results',

  use: {
    baseURL: config.baseUrl,
    headless: config.headless,
    actionTimeout: config.defaultTimeout,
    navigationTimeout: config.navigationTimeout,
    trace: config.trace,
    video: config.video,
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      dependencies: ['setup'],
    },
  ],
});
