import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import type { CardDetails } from '../types/user.types';

export class PaymentPage extends BasePage {
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payAndConfirmButton: Locator;
  readonly orderPlacedHeading: Locator;
  readonly orderPlacedMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCardInput = page.locator('[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('[data-qa="card-number"]');
    this.cvcInput = page.locator('[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('[data-qa="expiry-year"]');
    this.payAndConfirmButton = page.locator('[data-qa="pay-button"]');
    this.orderPlacedHeading = page.locator('[data-qa="order-placed"]');
    this.orderPlacedMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceButton = page.getByRole('link', { name: 'Download Invoice' });
    this.continueButton = page.getByRole('link', { name: 'Continue' });
  }

  async fillCardDetails(card: CardDetails): Promise<void> {
    await this.fill(this.nameOnCardInput, card.nameOnCard);
    await this.fill(this.cardNumberInput, card.cardNumber);
    await this.fill(this.cvcInput, card.cvc);
    await this.fill(this.expiryMonthInput, card.expiryMonth);
    await this.fill(this.expiryYearInput, card.expiryYear);
  }

  async confirmPayment(): Promise<void> {
    await this.click(this.payAndConfirmButton);
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.orderPlacedHeading).toBeVisible();
    await expect(this.orderPlacedMessage).toBeVisible();
  }

  async continueAfterOrder(): Promise<void> {
    await this.click(this.continueButton);
  }
}
