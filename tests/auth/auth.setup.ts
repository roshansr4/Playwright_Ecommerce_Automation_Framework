import { test as setup } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';
import { LoginPage } from '../../src/pages/login.page';
import { HeaderComponent } from '../../src/components/header.component';
import { buildTestUser } from '../../src/data/user.factory';
import { STORAGE_STATE_PATH, saveUserCredentials } from '../../src/fixtures/storage-state';
import { createLogger } from '../../src/utils/logger';

const logger = createLogger('AuthSetup');

/**
 * Runs once before the dependent test projects. Provisions a brand-new
 * account over the AUT's public REST API (fast, deterministic — no UI
 * flakiness), then performs a single real UI login to capture the
 * authenticated session as storageState. Tests that need to run as a
 * logged-in user opt in with `test.use({ storageState: STORAGE_STATE_PATH })`;
 * tests that need to be logged out (e.g. the signup/login flows themselves)
 * simply don't, and run with a clean, unauthenticated context.
 */
setup('provision test user and authenticate', async ({ page, request }) => {
  const user = buildTestUser();
  const apiClient = new ApiClient(request);

  await apiClient.createAccount(user);
  logger.info(`Provisioned user ${user.email} for the authenticated test suite`);

  const loginPage = new LoginPage(page);
  const header = new HeaderComponent(page);

  await loginPage.open();
  await loginPage.login(user.email, user.password);
  await header.expectLoggedInAs(user.name);

  await page.context().storageState({ path: STORAGE_STATE_PATH });
  saveUserCredentials(user);

  logger.info(`Saved authenticated storage state to ${STORAGE_STATE_PATH}`);
});
