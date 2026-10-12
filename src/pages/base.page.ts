import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { config } from '../config/env.config';
import { createLogger } from '../utils/logger';

/**
 * Common functionality shared by every page object: navigation, waits,
 * and resilient interaction helpers. Concrete page objects extend this
 * and expose only their own locators + business actions.
 */
export abstract class BasePage {
  protected readonly logger = createLogger(this.constructor.name);

  constructor(protected readonly page: Page) {}

  protected get baseUrl(): string {
    return config.baseUrl;
  }

  async goto(path = '/'): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    this.logger.debug(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForUrl(pathContains: string | RegExp): Promise<void> {
    await this.page.waitForURL(
      typeof pathContains === 'string' ? new RegExp(pathContains) : pathContains,
    );
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Scrolls an element into view before interacting — guards against sticky headers / lazy content. */
  protected async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  protected async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectUrlContains(fragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }
}
