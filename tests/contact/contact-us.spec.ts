import * as path from 'path';
import { test, expect } from '../../src/fixtures/test-options';
import { faker } from '@faker-js/faker';

const SAMPLE_UPLOAD = path.resolve(__dirname, 'fixtures/sample-upload.txt');

test.describe('Contact Us', () => {
  test.beforeEach(async ({ contactUsPage }) => {
    await contactUsPage.open();
  });

  test('renders the "Get In Touch" form @smoke', async ({ contactUsPage }) => {
    await expect(contactUsPage.getInTouchHeading).toBeVisible();
    await expect(contactUsPage.nameInput).toBeVisible();
    await expect(contactUsPage.submitButton).toBeVisible();
  });

  test('submits successfully with valid details and no attachment @smoke', async ({
    contactUsPage,
  }) => {
    await contactUsPage.fillForm({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      subject: 'QA automated enquiry',
      message: faker.lorem.paragraph(),
    });
    await contactUsPage.submit();
    await contactUsPage.expectSubmissionSuccess();
  });

  test('submits successfully with a file attached @regression', async ({ contactUsPage }) => {
    await contactUsPage.fillForm({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      subject: 'QA automated enquiry with attachment',
      message: faker.lorem.paragraph(),
    });
    await contactUsPage.attachFile(SAMPLE_UPLOAD);
    await contactUsPage.submit();
    await contactUsPage.expectSubmissionSuccess();
  });

  test('"Home" button after submission returns to the home page @regression', async ({
    contactUsPage,
    homePage,
  }) => {
    await contactUsPage.fillForm({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      subject: 'QA navigation check',
      message: faker.lorem.sentence(),
    });
    await contactUsPage.submit();
    await contactUsPage.expectSubmissionSuccess();

    await contactUsPage.goHome();
    await homePage.expectOnHomePage();
  });

  test('blocks submission when the email field is not a valid email format @regression', async ({
    contactUsPage,
    page,
  }) => {
    await contactUsPage.fillForm({
      name: faker.person.fullName(),
      email: 'not-a-valid-email',
      subject: 'QA validation check',
      message: faker.lorem.sentence(),
    });
    await contactUsPage.submitButton.click();

    // The native type="email" constraint blocks submission client-side.
    await expect(page).toHaveURL(/\/contact_us$/);
    await expect(contactUsPage.successMessage).toBeHidden();
  });
});
