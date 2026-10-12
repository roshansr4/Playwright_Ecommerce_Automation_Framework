import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { SignupAccountDetails } from '../types/user.types';

export class SignupPage extends BasePage {
  readonly titleMrRadio: Locator;
  readonly titleMrsRadio: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly daySelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;
  readonly accountCreatedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleMrRadio = page.locator('#id_gender1');
    this.titleMrsRadio = page.locator('#id_gender2');
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.passwordInput = page.locator('[data-qa="password"]');
    this.daySelect = page.locator('[data-qa="days"]');
    this.monthSelect = page.locator('[data-qa="months"]');
    this.yearSelect = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');
    this.firstNameInput = page.locator('[data-qa="first_name"]');
    this.lastNameInput = page.locator('[data-qa="last_name"]');
    this.companyInput = page.locator('[data-qa="company"]');
    this.address1Input = page.locator('[data-qa="address"]');
    this.address2Input = page.locator('[data-qa="address2"]');
    this.countrySelect = page.locator('[data-qa="country"]');
    this.stateInput = page.locator('[data-qa="state"]');
    this.cityInput = page.locator('[data-qa="city"]');
    this.zipcodeInput = page.locator('[data-qa="zipcode"]');
    this.mobileNumberInput = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
    this.accountCreatedHeading = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async fillAccountDetails(details: SignupAccountDetails): Promise<void> {
    await (details.title === 'Mr' ? this.titleMrRadio : this.titleMrsRadio).check();
    await this.fill(this.passwordInput, details.password);
    await this.selectByLabel(this.daySelect, details.birthDay);
    await this.selectByLabel(this.monthSelect, details.birthMonth);
    await this.selectByLabel(this.yearSelect, details.birthYear);

    if (details.newsletter) await this.newsletterCheckbox.check();
    if (details.specialOffers) await this.specialOffersCheckbox.check();

    await this.fill(this.firstNameInput, details.firstName);
    await this.fill(this.lastNameInput, details.lastName);
    await this.fill(this.companyInput, details.company);
    await this.fill(this.address1Input, details.address1);
    await this.fill(this.address2Input, details.address2);
    await this.selectByLabel(this.countrySelect, details.country);
    await this.fill(this.stateInput, details.state);
    await this.fill(this.cityInput, details.city);
    await this.fill(this.zipcodeInput, details.zipcode);
    await this.fill(this.mobileNumberInput, details.mobileNumber);
  }

  async submit(): Promise<void> {
    await this.click(this.createAccountButton);
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.accountCreatedHeading).toBeVisible();
  }

  async continueToHome(): Promise<void> {
    await this.click(this.continueButton);
  }
}
