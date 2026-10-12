import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * The site header/nav bar is present on every page. Modeling it as a
 * component (not a page) lets every page object reuse the same locators
 * without duplicating them or inheriting unrelated page logic.
 */
export class HeaderComponent {
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsLabel: Locator;
  readonly contactUsLink: Locator;

  constructor(private readonly page: Page) {
    this.homeLink = page.locator('a[href="/"]').first();
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('a[href="/view_cart"]');
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.loggedInAsLabel = page.locator('a[href="/logout"]').locator('..');
    this.contactUsLink = page.locator('a[href="/contact_us"]');
  }

  async goToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async goToSignupLogin(): Promise<void> {
    await this.signupLoginLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async expectLoggedInAs(username: string): Promise<void> {
    await expect(this.page.getByText(`Logged in as ${username}`)).toBeVisible();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }
}
