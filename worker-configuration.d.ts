/**
 * Type definitions for Cloudflare Workers environment.
 * This file provides TypeScript types for Cloudflare-specific bindings and APIs.
 */

import type { Browser } from 'puppeteer';

/**
 * Cloudflare environment bindings available in Workers/Pages.
 */
interface CloudflareEnv {
  /**
   * Browser Rendering API binding.
   * Configured in wrangler.toml with [[browser]] binding.
   */
  BROWSER?: {
    launch: () => Promise<Browser>;
  };

  /**
   * KV namespace for caching audit results.
   * Optional - configure in wrangler.toml if needed.
   */
  AUDIT_CACHE?: KVNamespace;

  /**
   * D1 database binding.
   * Optional - configure in wrangler.toml if needed.
   */
  DB?: D1Database;

  /**
   * Environment variables (secrets).
   */
  ANTHROPIC_API_KEY?: string;
  DATABASE_URL?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
}

/**
 * Extend the global namespace to include Cloudflare bindings.
 */
declare global {
  // eslint-disable-next-line no-var
  var BROWSER: CloudflareEnv['BROWSER'];
  // eslint-disable-next-line no-var
  var AUDIT_CACHE: CloudflareEnv['AUDIT_CACHE'];
  // eslint-disable-next-line no-var
  var DB: CloudflareEnv['DB'];
}

/**
 * Request handler type for Cloudflare Workers.
 */
export interface CloudflareWorkerRequest {
  fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ): Promise<Response>;
}

export type { CloudflareEnv };
