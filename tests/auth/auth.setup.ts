import { test as setup } from '@playwright/test';
import { ApiClient } from '../../src/utils/api-client';
import { FIXED_TEST_USER } from '../../src/data/fixed-test-user';
import { createLogger } from '../../src/utils/logger';

const logger = createLogger('AuthSetup');

/**
 * Runs once before the dependent browser projects. Ensures the single,
 * fixed test account (FIXED_TEST_USER) exists on the AUT — idempotently,
 * via the public REST API — so every run, on every machine and every CI
 * job, authenticates as the exact same identity instead of a fresh
 * throwaway one.
 *
 * This step deliberately does NOT log in or produce a storageState file:
 * that happens independently per parallel worker (see
 * src/fixtures/authed-test-options.ts), which is what gives each worker —
 * and therefore each browser project — its own isolated session even
 * though they all share this one account.
 */
setup('ensure the fixed test account exists', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const alreadyExists = await apiClient.verifyLogin(
    FIXED_TEST_USER.email,
    FIXED_TEST_USER.password,
  );

  if (alreadyExists) {
    logger.info(`Fixed test account ${FIXED_TEST_USER.email} already exists — reusing it.`);
    return;
  }

  try {
    await apiClient.createAccount(FIXED_TEST_USER);
    logger.info(`Created the fixed test account ${FIXED_TEST_USER.email} for the first time.`);
  } catch (error) {
    // Two CI jobs (e.g. chromium + firefox matrix entries) can race to
    // create the account on its very first-ever run. If creation failed,
    // it's likely because a concurrent job just won that race — re-verify
    // before treating it as a real failure.
    const nowExists = await apiClient.verifyLogin(FIXED_TEST_USER.email, FIXED_TEST_USER.password);
    if (!nowExists) {
      throw error;
    }
    logger.info(
      `Account creation raced with another job; ${FIXED_TEST_USER.email} now exists — continuing.`,
    );
  }
});
