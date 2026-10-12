import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class HomePage extends BasePage {
  readonly header: HeaderComponent;
  readonly featuredItemsSection: Locator;
  readonly productCards: Locator;
  readonly firstProductAddToCartButton: Locator;
  readonly addedToCartModal: Locator;
  readonly viewCartLinkInModal: Locator;
  readonly continueShoppingButton: Locator;
  readonly subscriptionEmailInput: Locator;
  readonly subscriptionSubmitButton: Locator;
  readonly subscriptionSuccessMessage: Locator;
  readonly categorySidebar: Locator;
  readonly scrollUpArrow: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.featuredItemsSection = page.locator('.features_items');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.firstProductAddToCartButton = this.productCards
      .first()
      .locator('.productinfo a:has-text("Add to cart")');
    this.addedToCartModal = page.locator('#cartModal');
    this.viewCartLinkInModal = this.addedToCartModal.getByRole('link', { name: 'View Cart' });
    this.continueShoppingButton = this.addedToCartModal.getByRole('button', {
      name: 'Continue Shopping',
    });
    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscriptionSubmitButton = page.locator('#subscribe');
    this.subscriptionSuccessMessage = page.locator('#success-subscribe');
    this.categorySidebar = page.locator('.left-sidebar');
    this.scrollUpArrow = page.locator('#scrollUp');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await this.scrollIntoView(card);
    await card.hover();
    await card.locator('.productinfo a:has-text("Add to cart")').click();
  }

  async addProductToCartByName(name: string): Promise<void> {
    const card = this.page.locator('.features_items .product-image-wrapper', {
      has: this.page.locator('p', { hasText: name }),
    });
    await this.scrollIntoView(card);
    await card.hover();
    await card.locator('.productinfo a:has-text("Add to cart")').click();
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  async goToCartFromModal(): Promise<void> {
    await this.click(this.viewCartLinkInModal);
  }

  async openCategory(category: string, subCategory: string): Promise<void> {
    // Accessible names include a leading icon glyph (e.g. " Women"), and
    // brand links include a count prefix — match by substring, not exact.
    await this.page.getByRole('link', { name: category }).first().click();
    await this.page
      .locator(`#${category}`)
      .locator('a', { hasText: subCategory })
      .first()
      .click();
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    await this.scrollIntoView(this.subscriptionEmailInput);
    await this.fill(this.subscriptionEmailInput, email);
    await this.click(this.subscriptionSubmitButton);
  }

  async expectSubscriptionSuccess(): Promise<void> {
    await expect(this.subscriptionSuccessMessage).toBeVisible();
    await expect(this.subscriptionSuccessMessage).toHaveText(
      /successfully subscribed/i,
    );
  }

  async expectOnHomePage(): Promise<void> {
    await expect(this.featuredItemsSection).toBeVisible();
  }
}
