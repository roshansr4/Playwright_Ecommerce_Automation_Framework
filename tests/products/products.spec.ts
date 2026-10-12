import { test, expect } from '../../src/fixtures/test-options';

test.describe('Products catalog', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.open();
  });

  test('lists all products with the "All Products" heading @smoke', async ({ productsPage }) => {
    await expect(productsPage.allProductsHeading).toBeVisible();
    expect(await productsPage.productCount()).toBeGreaterThan(0);
  });

  test('searching for a known keyword returns only matching products @smoke', async ({
    productsPage,
  }) => {
    await productsPage.searchProduct('Dress');
    await productsPage.expectSearchResultsFor('Dress');
  });

  test('searching for a nonsense keyword returns zero results @regression', async ({
    productsPage,
  }) => {
    await productsPage.searchProduct('zzzznonexistentproduct9999');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    expect(await productsPage.productCount()).toBe(0);
  });

  test('opening "View Product" navigates to that product\'s detail page @smoke', async ({
    productsPage,
    productDetailPage,
    page,
  }) => {
    await productsPage.openProductByIndex(0);
    await expect(page).toHaveURL(/\/product_details\/\d+/);
    await productDetailPage.expectProductDetailsVisible();
  });

  test('adding a product directly from the listing shows the cart modal @regression', async ({
    productsPage,
  }) => {
    await productsPage.addToCartByIndex(3);
    await expect(productsPage.addedToCartModal).toBeVisible();
  });

  test('filtering by brand navigates to a brand-scoped listing @regression', async ({
    productsPage,
  }) => {
    await productsPage.filterByBrand('Polo');
    await productsPage.expectBrandPage('Polo');
  });
});
