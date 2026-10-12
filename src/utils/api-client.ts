import type { APIRequestContext } from '@playwright/test';
import { config } from '../config/env.config';
import type { TestUser } from '../types/user.types';
import { createLogger } from './logger';

const logger = createLogger('ApiClient');

/**
 * Thin wrapper around AutomationExercise's public REST API
 * (https://automationexercise.com/api_list). Used to provision/clean up
 * test users directly over HTTP so UI test setup stays fast and non-flaky.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async createAccount(user: TestUser): Promise<void> {
    const { account } = user;
    const response = await this.request.post(`${config.apiBaseUrl}/createAccount`, {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: account.title,
        birth_date: account.birthDay,
        birth_month: account.birthMonth,
        birth_year: account.birthYear,
        firstname: account.firstName,
        lastname: account.lastName,
        company: account.company,
        address1: account.address1,
        address2: account.address2,
        country: account.country,
        zipcode: account.zipcode,
        state: account.state,
        city: account.city,
        mobile_number: account.mobileNumber,
      },
    });

    const body = await response.json();
    if (body.responseCode !== 201) {
      throw new Error(`Failed to create account via API: ${JSON.stringify(body)}`);
    }
    logger.info(`Created account via API for ${user.email}`);
  }

  async verifyLogin(email: string, password: string): Promise<boolean> {
    const response = await this.request.post(`${config.apiBaseUrl}/verifyLogin`, {
      form: { email, password },
    });
    const body = await response.json();
    return body.responseCode === 200;
  }

  async deleteAccount(email: string, password: string): Promise<void> {
    const response = await this.request.delete(`${config.apiBaseUrl}/deleteAccount`, {
      form: { email, password },
    });
    const body = await response.json();
    if (body.responseCode !== 200) {
      logger.warn(`Failed to delete account ${email}: ${JSON.stringify(body)}`);
      return;
    }
    logger.info(`Deleted account via API for ${email}`);
  }
}
