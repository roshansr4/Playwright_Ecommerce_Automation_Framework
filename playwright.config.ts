import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env.config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Project layout:
 *  - "setup"            runs tests/auth/auth.setup.ts once, provisioning a
 *                        test user and writing storageState to .auth/user.json.
 *  - chromium/firefox/webkit  depend on "setup" so the auth file always
 *                        exists, but each test file opts into
 *                        `test.use({ storageState: STORAGE_STATE_PATH })`
 *                        individually — unauthenticated flows (login, signup)
 *                        simply don't, and get a clean context.
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
  globalTeardown: require.resolve('./global-teardown.ts'),
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
