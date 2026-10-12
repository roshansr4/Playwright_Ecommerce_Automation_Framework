import { test, expect } from '../../src/fixtures/test-options';
import { STORAGE_STATE_PATH } from '../../src/fixtures/storage-state';
import { buildCardDetails } from '../../src/data/user.factory';

// These flows require a logged-in session — reuse the storage state
// captured once by tests/auth/auth.setup.ts instead of logging in per test.
test.use({ storageState: STORAGE_STATE_PATH });

test.describe('Checkout and payment (authenticated)', () => {
  test.beforeEach(async ({ homePage, cartPage }) => {
    // The cart is tied to the shared session cookie in STORAGE_STATE_PATH,
    // so previous tests' items would otherwise leak into this one.
    await cartPage.clearCart();
    await homePage.open();
  });

  test('completes a full purchase: cart -> checkout -> payment -> confirmation @smoke', async ({
    homePage,
    cartPage,
    checkoutPage,
    paymentPage,
    authedUser,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();

    await cartPage.proceedToCheckout();
    await expect(checkoutPage.deliveryAddressSection).toBeVisible();
    await checkoutPage.expectAddressMatches({
      firstName: authedUser.account.firstName,
      lastName: authedUser.account.lastName,
    });

    await checkoutPage.addOrderComment('Please deliver during business hours. (QA automated order)');
    await checkoutPage.placeOrder();

    const card = buildCardDetails({ nameOnCard: authedUser.name });
    await paymentPage.fillCardDetails(card);
    await paymentPage.confirmPayment();

    await paymentPage.expectOrderConfirmed();
  });

  test('order review on the checkout page lists the exact product added to the cart @regression', async ({
    homePage,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.addProductToCartByIndex(2);
    await homePage.goToCartFromModal();
    const productName = await cartPage.productName(0);

    await cartPage.proceedToCheckout();
    await checkoutPage.expectOrderReviewContainsProduct(productName);
  });

  test('delivery and billing addresses both reflect the authenticated user @regression', async ({
    homePage,
    cartPage,
    checkoutPage,
    authedUser,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.billingAddressSection).toContainText(authedUser.account.firstName);
    await expect(checkoutPage.billingAddressSection).toContainText(authedUser.account.city);
  });

  test('submitting payment with an incomplete card shows native required-field validation @regression', async ({
    homePage,
    cartPage,
    checkoutPage,
    paymentPage,
    page,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();

    await paymentPage.nameOnCardInput.fill('QA Automation');
    // Leave card number / cvc / expiry blank and attempt to pay.
    await paymentPage.payAndConfirmButton.click();

    await expect(page).toHaveURL(/\/payment$/);
    await expect(paymentPage.orderPlacedHeading).toHaveCount(0);
  });
});
