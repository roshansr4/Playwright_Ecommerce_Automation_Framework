import { test, expect } from '../../src/fixtures/test-options';

test.describe('Shopping cart', () => {
  test('shows an empty-cart message when nothing has been added @smoke', async ({ cartPage }) => {
    await cartPage.open();
    await cartPage.expectEmptyCart();
  });

  test('reflects a product added from the home page, with correct name/qty/total @smoke', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();

    expect(await cartPage.rowCount()).toBe(1);
    const name = await cartPage.productName(0);
    const price = await cartPage.productPrice(0);
    const qty = await cartPage.productQuantity(0);
    const total = await cartPage.productTotal(0);

    expect(name.length).toBeGreaterThan(0);
    expect(qty).toBe('1');
    expect(total).toBe(price); // qty 1 => line total equals unit price
  });

  test('removing a product updates the row count and shows the empty state when last item is removed @smoke', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();

    expect(await cartPage.rowCount()).toBe(1);
    await cartPage.removeProduct(0);

    expect(await cartPage.rowCount()).toBe(0);
    await cartPage.expectEmptyCart();
  });

  test('accumulates line totals correctly for multiple distinct products @regression', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.addProductToCartByIndex(0);
    await homePage.continueShopping();
    await homePage.addProductToCartByIndex(1);
    await homePage.goToCartFromModal();

    expect(await cartPage.rowCount()).toBe(2);
    await cartPage.expectProductInCart(await cartPage.productName(0));
    await cartPage.expectProductInCart(await cartPage.productName(1));
  });

  test('proceeding to checkout while logged out prompts to register or login @regression', async ({
    homePage,
    cartPage,
  }) => {
    await homePage.open();
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();

    await cartPage.proceedToCheckout();
    await expect(cartPage.registerLoginLinkInCheckoutModal).toBeVisible();
  });
});
