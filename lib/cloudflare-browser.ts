/**
 * Browser Abstraction Layer for Cloudflare Migration
 *
 * This module provides a unified interface for browser automation that works
 * both locally (using Puppeteer) and on Cloudflare Pages (using Browser Rendering API).
 */

import type { Browser, Page } from 'puppeteer';

// Type for Cloudflare environment with Browser binding
interface CloudflareEnv {
  BROWSER?: {
    launch: () => Promise<Browser>;
  };
}

/**
 * Browser service that abstracts the underlying browser implementation.
 * Automatically detects if running on Cloudflare or locally.
 */
export class BrowserService {
  private static isCloudflare(): boolean {
    // Check if running in Cloudflare Workers/Pages environment
    return typeof (globalThis as any).BROWSER !== 'undefined';
  }

  /**
   * Launch a browser instance.
   * Uses Cloudflare Browser Rendering API in production, Puppeteer locally.
   */
  static async launch(): Promise<Browser> {
    if (this.isCloudflare()) {
      // Cloudflare Pages environment
      const env = globalThis as any;
      if (!env.BROWSER) {
        throw new Error(
          'BROWSER binding not found. Ensure wrangler.toml has [[browser]] binding configured.'
        );
      }
      return await env.BROWSER.launch();
    } else {
      // Local development with Puppeteer
      const puppeteer = await import('puppeteer');
      return await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  /**
   * Create a new page with common settings applied.
   */
  static async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();

    // Set viewport to common desktop size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Set reasonable timeout
    page.setDefaultTimeout(30000);

    return page;
  }

  /**
   * Safely close browser and handle errors.
   */
  static async close(browser: Browser): Promise<void> {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }

  /**
   * Execute a browser task with automatic cleanup.
   * Recommended way to use the browser service.
   */
  static async withBrowser<T>(
    task: (browser: Browser, page: Page) => Promise<T>
  ): Promise<T> {
    const browser = await this.launch();
    let page: Page | null = null;

    try {
      page = await this.createPage(browser);
      return await task(browser, page);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.error('Error closing page:', error);
        }
      }
      await this.close(browser);
    }
  }

  /**
   * Take a screenshot with error handling.
   */
  static async screenshot(
    page: Page,
    options?: Parameters<Page['screenshot']>[0]
  ): Promise<Buffer | string> {
    return await page.screenshot({
      type: 'png',
      fullPage: false,
      ...options,
    }) as Buffer;
  }

  /**
   * Navigate to URL with retry logic.
   */
  static async goto(
    page: Page,
    url: string,
    options?: Parameters<Page['goto']>[1]
  ): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 30000,
          ...options,
        });
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Navigation attempt ${i + 1} failed:`, error);

        if (i < maxRetries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Navigation failed');
  }
}

/**
 * Usage Example:
 *
 * // Simple usage
 * const browser = await BrowserService.launch();
 * const page = await BrowserService.createPage(browser);
 * await BrowserService.goto(page, 'https://example.com');
 * const screenshot = await BrowserService.screenshot(page);
 * await BrowserService.close(browser);
 *
 * // Recommended usage with automatic cleanup
 * const result = await BrowserService.withBrowser(async (browser, page) => {
 *   await BrowserService.goto(page, 'https://example.com');
 *   const content = await page.content();
 *   return content;
 * });
 */
