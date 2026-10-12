import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly deliveryAddressSection: Locator;
  readonly billingAddressSection: Locator;
  readonly orderCommentTextArea: Locator;
  readonly placeOrderButton: Locator;
  readonly cartItemRows: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddressSection = page.locator('#address_delivery');
    this.billingAddressSection = page.locator('#address_invoice');
    this.orderCommentTextArea = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
    // Unlike the standalone cart page, the checkout order-review rows don't
    // carry a `product-<id>` row id, so match any row and filter by content.
    this.cartItemRows = page.locator('#cart_info tbody tr');
  }

  async addOrderComment(comment: string): Promise<void> {
    await this.fill(this.orderCommentTextArea, comment);
  }

  async placeOrder(): Promise<void> {
    await this.click(this.placeOrderButton);
  }

  async expectAddressMatches(expected: { firstName: string; lastName: string }): Promise<void> {
    await expect(this.deliveryAddressSection).toContainText(expected.firstName);
    await expect(this.deliveryAddressSection).toContainText(expected.lastName);
  }

  async expectOrderReviewContainsProduct(name: string): Promise<void> {
    await expect(this.cartItemRows.filter({ hasText: name })).toHaveCount(1);
  }
}
