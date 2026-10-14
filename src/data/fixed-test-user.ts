import type { TestUser } from '../types/user.types';

/**
 * A single, stable account reused across every local run and every CI job.
 * Unlike buildTestUser() (used by the signup specs, which must always
 * register a brand-new account), this identity never changes — the same
 * email logs in every time, on every browser, forever.
 *
 * It isn't a secret: AutomationExercise's signup form has no email
 * verification, nothing sensitive is stored against it, and it only ever
 * exists on a public practice site built for this exact purpose. Keeping it
 * as a committed constant means CI needs zero extra secrets to authenticate.
 */
export const FIXED_TEST_USER: TestUser = {
  name: 'QA Automation',
  email: 'qa.automation.framework.user@mailslurp-test.com',
  password: 'Test@Framework1234',
  account: {
    title: 'Mr',
    password: 'Test@Framework1234',
    birthDay: '15',
    birthMonth: 'June',
    birthYear: '1990',
    firstName: 'QA',
    lastName: 'Automation',
    company: 'Playwright Ecommerce Framework',
    address1: '123 Automation Avenue',
    address2: 'Suite 404',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    zipcode: '94105',
    mobileNumber: '4155550123',
    newsletter: true,
    specialOffers: true,
  },
};
