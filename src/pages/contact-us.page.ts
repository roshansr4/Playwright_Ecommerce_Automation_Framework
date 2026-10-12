import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ContactUsPage extends BasePage {
  readonly getInTouchHeading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageTextArea: Locator;
  readonly uploadFileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.getInTouchHeading = page.getByRole('heading', { name: 'Get In Touch' });
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.subjectInput = page.locator('[data-qa="subject"]');
    this.messageTextArea = page.locator('[data-qa="message"]');
    this.uploadFileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('#contact-page .status.alert-success');
    this.homeButton = page.locator('a.btn.btn-success');
  }

  async open(): Promise<void> {
    await this.goto('/contact_us');
  }

  async fillForm(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.fill(this.nameInput, params.name);
    await this.fill(this.emailInput, params.email);
    await this.fill(this.subjectInput, params.subject);
    await this.fill(this.messageTextArea, params.message);
  }

  async attachFile(filePath: string): Promise<void> {
    await this.uploadFileInput.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    // The AUT uses a native confirm() dialog before submitting.
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.click(this.submitButton);
  }

  async expectSubmissionSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  async goHome(): Promise<void> {
    await this.click(this.homeButton);
  }
}
