import * as fs from 'fs';
import * as path from 'path';
import { test as base } from './test-options';
import { LoginPage } from '../pages/login.page';
import { HeaderComponent } from '../components/header.component';
import { FIXED_TEST_USER } from '../data/fixed-test-user';
import { ensureAuthDir } from './storage-state';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthedTest');

interface WorkerAuthFixtures {
  /** Worker-scoped: logged into once per parallel worker, then cached for its remaining tests. */
  workerStorageState: string;
}

/**
 * A variant of the base `test` for specs that must run as a logged-in user.
 *
 * Every worker — and therefore every browser project, since each one gets
 * its own pool of workers — authenticates independently as the exact same
 * account (FIXED_TEST_USER). Because each login produces its own session
 * cookie, two workers (or two browsers) never share server-side cart/session
 * state even though they're the same identity: same user everywhere, fully
 * isolated sessions. This is Playwright's documented "one account per
 * parallel worker" pattern — see https://playwright.dev/docs/auth.
 */
export const test = base.extend<object, WorkerAuthFixtures>({
  // Overrides the built-in `storageState` option fixture so every test's
  // default `page`/`context` in this variant is authenticated automatically.
  storageState: async ({ workerStorageState }, use) => {
    await use(workerStorageState);
  },

  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      ensureAuthDir();
      const fileName = path.resolve(
        __dirname,
        `../../.auth/worker-${workerInfo.parallelIndex}.json`,
      );

      if (fs.existsSync(fileName)) {
        logger.debug(`Reusing cached session for worker ${workerInfo.parallelIndex}`);
        await use(fileName);
        return;
      }

      const page = await browser.newPage({ storageState: undefined });
      const loginPage = new LoginPage(page);
      const header = new HeaderComponent(page);

      await loginPage.open();
      await loginPage.login(FIXED_TEST_USER.email, FIXED_TEST_USER.password);
      await header.expectLoggedInAs(FIXED_TEST_USER.name);

      await page.context().storageState({ path: fileName });
      await page.close();
      logger.info(`Worker ${workerInfo.parallelIndex} authenticated and cached its session`);

      await use(fileName);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
export { FIXED_TEST_USER };
