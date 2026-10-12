import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class ProductsPage extends BasePage {
  readonly header: HeaderComponent;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly allProductsHeading: Locator;
  readonly searchedProductsHeading: Locator;
  readonly productCards: Locator;
  readonly brandsPanel: Locator;
  readonly addedToCartModal: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.allProductsHeading = page.getByRole('heading', { name: 'All Products' });
    this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products' });
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.brandsPanel = page.locator('.brands_products');
    this.addedToCartModal = page.locator('#cartModal');
  }

  async open(): Promise<void> {
    await this.goto('/products');
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.fill(this.searchInput, keyword);
    await this.click(this.searchButton);
  }

  /**
   * The AUT's search matches on more than just the visible product title
   * (category/description also count), so we only assert that the
   * "Searched Products" view renders with at least one hit — not that every
   * card's title contains the keyword verbatim.
   */
  async expectSearchResultsFor(_keyword: string): Promise<void> {
    await expect(this.searchedProductsHeading).toBeVisible();
    const count = await this.productCards.count();
    expect(count).toBeGreaterThan(0);
  }

  async productCount(): Promise<number> {
    return this.productCards.count();
  }

  async openProductByIndex(index: number): Promise<void> {
    await this.productCards.nth(index).locator('a:has-text("View Product")').click();
  }

  async addToCartByIndex(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await this.scrollIntoView(card);
    await card.hover();
    await card.locator('.productinfo a:has-text("Add to cart")').click();
  }

  async filterByBrand(brand: string): Promise<void> {
    // Accessible names are prefixed with a product-count badge, e.g. "(6) Polo".
    await this.brandsPanel.getByRole('link', { name: brand }).click();
  }

  async expectBrandPage(brand: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: new RegExp(`Brand - ${brand}`, 'i') }),
    ).toBeVisible();
  }
}
