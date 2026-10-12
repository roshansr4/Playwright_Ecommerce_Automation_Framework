import { test, expect } from '../../src/fixtures/test-options';
import { faker } from '@faker-js/faker';

const KNOWN_PRODUCT_ID = 1;

test.describe('Product detail', () => {
  test.beforeEach(async ({ productDetailPage }) => {
    await productDetailPage.openById(KNOWN_PRODUCT_ID);
  });

  test('displays name, price, availability, condition, and brand @smoke', async ({
    productDetailPage,
  }) => {
    await productDetailPage.expectProductDetailsVisible();
    await expect(productDetailPage.productAvailability).toContainText('Availability');
    await expect(productDetailPage.productCondition).toContainText('Condition');
    await expect(productDetailPage.productBrand).toContainText('Brand');
  });

  test('adding with the default quantity of 1 adds a single line item @smoke', async ({
    productDetailPage,
    cartPage,
  }) => {
    await productDetailPage.addToCart();
    await productDetailPage.goToCartFromModal();
    expect(await cartPage.rowCount()).toBe(1);
    expect(await cartPage.productQuantity(0)).toBe('1');
  });

  test('adding with an increased quantity reflects that quantity in the cart @regression', async ({
    productDetailPage,
    cartPage,
  }) => {
    await productDetailPage.setQuantity(4);
    await productDetailPage.addToCart();
    await productDetailPage.goToCartFromModal();
    expect(await cartPage.productQuantity(0)).toBe('4');
  });

  test('submitting a product review shows a thank-you confirmation @regression', async ({
    productDetailPage,
  }) => {
    await productDetailPage.submitReview(
      faker.person.fullName(),
      faker.internet.email(),
      faker.lorem.sentence(),
    );
    await productDetailPage.expectReviewSubmitted();
  });

  test('rejects a review submitted without a message @regression', async ({
    productDetailPage,
  }) => {
    await productDetailPage.reviewNameInput.fill(faker.person.fullName());
    await productDetailPage.reviewEmailInput.fill(faker.internet.email());
    await productDetailPage.reviewSubmitButton.click();
    await expect(productDetailPage.reviewSuccessMessage).toBeHidden();
  });
});
