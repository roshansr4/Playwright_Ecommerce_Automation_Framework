import { request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import { ApiClient } from './src/utils/api-client';
import { USER_CREDENTIALS_PATH } from './src/fixtures/storage-state';
import { createLogger } from './src/utils/logger';

const logger = createLogger('GlobalTeardown');

/**
 * Deletes the ephemeral account created by tests/auth/auth.setup.ts so the
 * AUT's user table doesn't accumulate test accounts run after run.
 */
export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(USER_CREDENTIALS_PATH)) {
    return;
  }

  const user = JSON.parse(fs.readFileSync(USER_CREDENTIALS_PATH, 'utf-8'));
  const requestContext = await playwrightRequest.newContext();

  try {
    const apiClient = new ApiClient(requestContext);
    await apiClient.deleteAccount(user.email, user.password);
  } catch (error) {
    logger.warn('Failed to clean up test user during teardown', error);
  } finally {
    await requestContext.dispose();
    fs.rmSync(USER_CREDENTIALS_PATH, { force: true });
  }
}
