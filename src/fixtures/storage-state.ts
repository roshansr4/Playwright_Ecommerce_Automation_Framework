import * as path from 'path';
import * as fs from 'fs';
import type { TestUser } from '../types/user.types';

const AUTH_DIR = path.resolve(__dirname, '../../.auth');

export const STORAGE_STATE_PATH = path.join(AUTH_DIR, 'user.json');
export const USER_CREDENTIALS_PATH = path.join(AUTH_DIR, 'user-credentials.json');

export function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

export function saveUserCredentials(user: TestUser): void {
  ensureAuthDir();
  fs.writeFileSync(USER_CREDENTIALS_PATH, JSON.stringify(user, null, 2), 'utf-8');
}

export function loadUserCredentials(): TestUser {
  if (!fs.existsSync(USER_CREDENTIALS_PATH)) {
    throw new Error(
      `No persisted user credentials found at ${USER_CREDENTIALS_PATH}. ` +
        'Did the "setup" project run before this test? (see playwright.config.ts projects/dependencies)',
    );
  }
  return JSON.parse(fs.readFileSync(USER_CREDENTIALS_PATH, 'utf-8')) as TestUser;
}
