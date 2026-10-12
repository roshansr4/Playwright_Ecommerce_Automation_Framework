import { faker } from '@faker-js/faker';
import type { CardDetails, TestUser } from '../types/user.types';

/**
 * Builds a unique, fully-populated test user on every call so parallel workers
 * never collide on email/account uniqueness constraints on the AUT.
 */
export function buildTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const uniqueSuffix = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  const email = `qa.${firstName}.${uniqueSuffix}@mailslurp-test.com`.toLowerCase();

  const user: TestUser = {
    name: `${firstName} ${lastName}`,
    email,
    password: 'Test@1234',
    account: {
      title: faker.helpers.arrayElement(['Mr', 'Mrs']),
      password: 'Test@1234',
      birthDay: String(faker.number.int({ min: 1, max: 28 })),
      birthMonth: faker.date.month(),
      birthYear: String(faker.number.int({ min: 1970, max: 2000 })),
      firstName,
      lastName,
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: 'United States',
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.phone.number({ style: 'national' }).replace(/\D/g, ''),
      newsletter: true,
      specialOffers: true,
    },
  };

  return { ...user, ...overrides };
}

export function buildCardDetails(overrides: Partial<CardDetails> = {}): CardDetails {
  const card: CardDetails = {
    nameOnCard: faker.person.fullName(),
    cardNumber: faker.finance.creditCardNumber('visa').replace(/\D/g, ''),
    cvc: faker.finance.creditCardCVV(),
    expiryMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0'),
    expiryYear: String(faker.number.int({ min: 2026, max: 2032 })),
  };

  return { ...card, ...overrides };
}
