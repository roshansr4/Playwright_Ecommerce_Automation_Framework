import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class CartPage extends BasePage {
  readonly header: HeaderComponent;
  readonly cartRows: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly registerLoginLinkInCheckoutModal: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.cartRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.proceedToCheckoutButton = page.locator('.check_out');
    this.emptyCartMessage = page.getByText('Cart is empty!');
    this.registerLoginLinkInCheckoutModal = page.locator('#checkoutModal a[href="/login"]');
  }

  async open(): Promise<void> {
    await this.goto('/view_cart');
  }

  private rowByIndex(index: number): Locator {
    return this.cartRows.nth(index);
  }

  async productName(index: number): Promise<string> {
    return (await this.rowByIndex(index).locator('.cart_description h4 a').innerText()).trim();
  }

  async productPrice(index: number): Promise<string> {
    return (await this.rowByIndex(index).locator('.cart_price p').innerText()).trim();
  }

  async productQuantity(index: number): Promise<string> {
    return (
      await this.rowByIndex(index).locator('.cart_quantity button').innerText()
    ).trim();
  }

  async productTotal(index: number): Promise<string> {
    return (await this.rowByIndex(index).locator('.cart_total_price').innerText()).trim();
  }

  async removeProduct(index: number): Promise<void> {
    const countBefore = await this.cartRows.count();
    await this.rowByIndex(index).locator('.cart_quantity_delete').click();
    // Row removal is animated/ajax-based — wait for the DOM to actually drop it.
    await expect(this.cartRows).toHaveCount(countBefore - 1);
  }

  async rowCount(): Promise<number> {
    // Cart rows render after an async call once the page has loaded; give
    // the table a moment to settle before counting to avoid a 0-row race.
    await this.page.waitForLoadState('networkidle');
    return this.cartRows.count();
  }

  /** Empties the cart by repeatedly removing the first row. Used to isolate
   * tests that share a server-side session/cart across the same storageState. */
  async clearCart(): Promise<void> {
    await this.open();
    while ((await this.cartRows.count()) > 0) {
      await this.removeProduct(0);
    }
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.proceedToCheckoutButton);
  }

  async expectEmptyCart(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async expectProductInCart(name: string): Promise<void> {
    await expect(this.page.locator('#cart_info').getByText(name)).toBeVisible();
  }
}
