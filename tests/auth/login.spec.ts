import { test, expect } from '../../src/fixtures/test-options';
import { buildTestUser } from '../../src/data/user.factory';
import { HeaderComponent } from '../../src/components/header.component';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('renders the login and signup forms @smoke', async ({ loginPage, page }) => {
    await expect(page).toHaveTitle(/Automation Exercise/i);
    await expect(loginPage.loginEmailInput).toBeVisible();
    await expect(loginPage.loginPasswordInput).toBeVisible();
    await expect(loginPage.signupNameInput).toBeVisible();
    await expect(loginPage.signupEmailInput).toBeVisible();
  });

  test('logs in successfully with valid, previously-provisioned credentials @smoke', async ({
    loginPage,
    page,
    authedUser,
  }) => {
    const header = new HeaderComponent(page);
    await loginPage.login(authedUser.email, authedUser.password);
    await header.expectLoggedInAs(authedUser.name);
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });

  test('rejects an incorrect password @regression', async ({ loginPage }) => {
    await loginPage.login('definitely-not-registered@example.com', 'wrong-password');
    await loginPage.expectLoginError();
  });

  test('rejects a well-formed but unregistered email @regression', async ({ loginPage }) => {
    const ghost = buildTestUser();
    await loginPage.login(ghost.email, ghost.password);
    await loginPage.expectLoginError();
  });

  test('rejects an empty submission via required-field validation @regression', async ({
    loginPage,
    page,
  }) => {
    await loginPage.loginButton.click();
    // Native HTML5 required validation blocks the request — we never navigate away.
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signup with an already-registered email surfaces an inline error @regression', async ({
    loginPage,
    authedUser,
  }) => {
    await loginPage.startSignup('Someone Else', authedUser.email);
    await loginPage.expectSignupEmailExistsError();
  });

  test('logged-out header does not expose logout or delete-account links @regression', async ({
    page,
  }) => {
    const header = new HeaderComponent(page);
    await expect(header.logoutLink).toHaveCount(0);
    await expect(header.deleteAccountLink).toHaveCount(0);
    await expect(header.signupLoginLink).toBeVisible();
  });
});
