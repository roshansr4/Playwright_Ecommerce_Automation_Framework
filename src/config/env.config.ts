import * as dotenv from 'dotenv';
import * as path from 'path';

const envName = process.env.ENV ?? 'qa';

// Load base .env first, then an env-specific override (.env.qa, .env.staging, ...) if present.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, `../../.env.${envName}`), override: true });

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true';
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface EnvConfig {
  env: string;
  baseUrl: string;
  apiBaseUrl: string;
  headless: boolean;
  workers: number;
  retries: number;
  isCI: boolean;
  trace: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  video: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  defaultTimeout: number;
  navigationTimeout: number;
}

export const config: EnvConfig = {
  env: envName,
  baseUrl: process.env.BASE_URL ?? 'https://automationexercise.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://automationexercise.com/api',
  headless: toBool(process.env.HEADLESS, true),
  workers: toInt(process.env.WORKERS, 4),
  retries: toInt(process.env.RETRIES, process.env.CI ? 2 : 0),
  isCI: toBool(process.env.CI, false),
  trace: (process.env.TRACE as EnvConfig['trace']) ?? 'on-first-retry',
  video: (process.env.VIDEO as EnvConfig['video']) ?? 'retain-on-failure',
  defaultTimeout: toInt(process.env.DEFAULT_TIMEOUT, 10_000),
  navigationTimeout: toInt(process.env.NAVIGATION_TIMEOUT, 30_000),
};
