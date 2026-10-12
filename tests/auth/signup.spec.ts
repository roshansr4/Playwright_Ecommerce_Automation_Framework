import { test, expect } from '../../src/fixtures/test-options';
import { buildTestUser } from '../../src/data/user.factory';
import { HeaderComponent } from '../../src/components/header.component';

test.describe('Signup', () => {
  test('completes full account creation end-to-end and cleans up @smoke', async ({
    loginPage,
    signupPage,
    page,
  }) => {
    const user = buildTestUser();
    const header = new HeaderComponent(page);

    await loginPage.open();
    await loginPage.startSignup(user.name, user.email);

    await expect(page).toHaveURL(/\/signup$/);
    await signupPage.fillAccountDetails(user.account);
    await signupPage.submit();

    await signupPage.expectAccountCreated();
    await signupPage.continueToHome();

    await header.expectLoggedInAs(user.name);

    // Cleanup: delete the account we just created via the UI's own flow,
    // keeping this test self-contained and independent of global teardown.
    await header.deleteAccountLink.click();
    await expect(page.getByText('Account Deleted!')).toBeVisible();
  });

  test('pre-fills the account email from the initial signup step @regression', async ({
    loginPage,
    page,
  }) => {
    const user = buildTestUser();
    await loginPage.open();
    await loginPage.startSignup(user.name, user.email);
    await expect(page).toHaveURL(/\/signup$/);

    await expect(page.locator('[data-qa="name"]')).toHaveValue(user.name);
    await expect(page.locator('[data-qa="email"]')).toHaveValue(user.email);
  });

  test('requires a title, date of birth, and address before account creation @regression', async ({
    loginPage,
    signupPage,
    page,
  }) => {
    const user = buildTestUser();
    await loginPage.open();
    await loginPage.startSignup(user.name, user.email);
    await expect(page).toHaveURL(/\/signup$/);

    // Submit with only the password filled — required fields block submission.
    await signupPage.passwordInput.fill(user.password);
    await signupPage.submit();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(signupPage.accountCreatedHeading).toHaveCount(0);
  });
});
