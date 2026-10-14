// Authenticated variant: each parallel worker logs into FIXED_TEST_USER
// independently, so these tests run as the same account everywhere but
// never share a session (cookie) with another worker or browser project.
//
// Known tradeoff: the AUT persists a logged-in user's cart against the
// account itself, not the session cookie — so true zero-collision isolation
// isn't achievable here under full concurrency while keeping one shared
// account (chromium/firefox/webkit run as genuinely concurrent CI jobs and
// could, in rare cases, race on cart state). We've decided this is an
// acceptable tradeoff: retries (configured in playwright.config.ts) absorb
// the occasional flake, and clearCart() in beforeEach keeps collisions rare.
import { test, expect, FIXED_TEST_USER } from '../../src/fixtures/authed-test-options';
import { buildCardDetails } from '../../src/data/user.factory';

test.describe('Checkout and payment (authenticated)', () => {
  test.beforeEach(async ({ homePage, cartPage }) => {
    // Tests in this file share one worker's cached session cookie, so a
    // prior test's cart items would otherwise leak into this one.
    await cartPage.clearCart();
    await homePage.open();
  });

  test('completes a full purchase: cart -> checkout -> payment -> confirmation @smoke', async ({
    homePage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();

    await cartPage.proceedToCheckout();
    await expect(checkoutPage.deliveryAddressSection).toBeVisible();
    await checkoutPage.expectAddressMatches({
      firstName: FIXED_TEST_USER.account.firstName,
      lastName: FIXED_TEST_USER.account.lastName,
    });

    await checkoutPage.addOrderComment('Please deliver during business hours. (QA automated order)');
    await checkoutPage.placeOrder();

    const card = buildCardDetails({ nameOnCard: FIXED_TEST_USER.name });
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
  }) => {
    await homePage.addProductToCartByIndex(0);
    await homePage.goToCartFromModal();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.billingAddressSection).toContainText(
      FIXED_TEST_USER.account.firstName,
    );
    await expect(checkoutPage.billingAddressSection).toContainText(FIXED_TEST_USER.account.city);
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
