import { test, expect } from '../../src/fixtures/test-options';
import { faker } from '@faker-js/faker';

test.describe('Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('loads with featured products visible @smoke', async ({ homePage }) => {
    await homePage.expectOnHomePage();
    expect(await homePage.productCards.count()).toBeGreaterThan(0);
  });

  test('adding a product shows the cart confirmation modal with a working "View Cart" link @smoke', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await expect(homePage.addedToCartModal).toBeVisible();

    await homePage.goToCartFromModal();
    await expect(cartPage.cartRows.first()).toBeVisible();
    expect(await cartPage.rowCount()).toBe(1);
  });

  test('"Continue Shopping" dismisses the modal and keeps the user on the home page @regression', async ({
    homePage,
  }) => {
    await homePage.addProductToCartByIndex(1);
    await homePage.continueShopping();
    await expect(homePage.addedToCartModal).toBeHidden();
    await homePage.expectOnHomePage();
  });

  test('navigating via the header Products link lands on the products catalog @regression', async ({
    homePage,
    productsPage,
    page,
  }) => {
    await homePage.header.goToProducts();
    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.allProductsHeading).toBeVisible();
  });

  test('subscribing with a valid email shows a success confirmation @regression', async ({
    homePage,
  }) => {
    const email = faker.internet.email();
    await homePage.subscribeToNewsletter(email);
    await homePage.expectSubscriptionSuccess();
  });

  test('browsing a category from the sidebar filters the catalog @regression', async ({
    homePage,
    page,
  }) => {
    await homePage.openCategory('Women', 'Dress');
    await expect(page).toHaveURL(/\/category_products\/\d+/);
    await expect(page.getByRole('heading', { name: /Women - Dress Products/i })).toBeVisible();
  });

  test('adding multiple distinct products accumulates correctly in the cart @regression', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.continueShopping();
    await homePage.addProductToCartByIndex(2);
    await homePage.continueShopping();
    await homePage.addProductToCartByIndex(4);

    await homePage.goToCartFromModal();
    await expect(cartPage.cartRows).toHaveCount(3);
  });
});
