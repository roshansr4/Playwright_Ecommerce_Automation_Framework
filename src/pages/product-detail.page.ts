import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartModal: Locator;
  readonly viewCartLinkInModal: Locator;
  readonly reviewNameInput: Locator;
  readonly reviewEmailInput: Locator;
  readonly reviewTextArea: Locator;
  readonly reviewSubmitButton: Locator;
  readonly reviewSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p', { hasText: 'Category' });
    this.productPrice = page.locator('.product-information span span');
    this.productAvailability = page.locator('.product-information p', {
      hasText: 'Availability',
    });
    this.productCondition = page.locator('.product-information p', { hasText: 'Condition' });
    this.productBrand = page.locator('.product-information p', { hasText: 'Brand' });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.cart');
    this.addedToCartModal = page.locator('#cartModal');
    this.viewCartLinkInModal = this.addedToCartModal.getByRole('link', { name: 'View Cart' });
    this.reviewNameInput = page.locator('#name');
    this.reviewEmailInput = page.locator('#email');
    this.reviewTextArea = page.locator('#review');
    this.reviewSubmitButton = page.locator('#button-review');
    this.reviewSuccessMessage = page.getByText('Thank you for your review.');
  }

  async openById(productId: string | number): Promise<void> {
    await this.goto(`/product_details/${productId}`);
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.fill(this.quantityInput, String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.click(this.addToCartButton);
  }

  async goToCartFromModal(): Promise<void> {
    await this.viewCartLinkInModal.click();
  }

  async submitReview(name: string, email: string, review: string): Promise<void> {
    await this.fill(this.reviewNameInput, name);
    await this.fill(this.reviewEmailInput, email);
    await this.fill(this.reviewTextArea, review);
    await this.click(this.reviewSubmitButton);
  }

  async expectReviewSubmitted(): Promise<void> {
    await expect(this.reviewSuccessMessage).toBeVisible();
  }

  async expectProductDetailsVisible(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice).toBeVisible();
  }
}
