# Cloudflare Migration Guide

## Overview
This guide documents the steps needed to complete the migration to Cloudflare Pages and addresses browser automation compatibility issues.

## Current Status

✅ **Completed:**
- Installed Cloudflare dependencies (@cloudflare/next-on-pages, wrangler)
- Updated next.config.ts with Cloudflare compatibility settings
- Created wrangler.toml configuration
- Added build scripts (pages:build, preview, deploy, cf:dev)

⚠️ **Pending:**
- Migrate from Puppeteer/Playwright to Cloudflare Browser Rendering API
- Update database configuration for Cloudflare D1 (optional)
- Configure environment variables in Cloudflare dashboard

## Browser Automation Migration

### Files Requiring Updates:

1. **lib/accessibilityAuditService.ts** - Uses Puppeteer and pa11y
2. **app/api/audit/viewport/route.ts** - Uses Puppeteer
3. **lib/puppeteerSerpScraper.ts** - Uses Puppeteer
4. **lib/browserBacklinkScraper.ts** - Uses Playwright

### Migration Strategy: Cloudflare Browser Rendering API

The Cloudflare Browser Rendering API provides Puppeteer-compatible bindings that work in the Workers runtime.

#### Pricing:
- **Free Tier**: 10 hours/month, 10 concurrent browsers
- **Paid**: $0.09 per browser hour
- Estimated cost: ~$0.30-0.75 per 100 audits

#### Code Migration Pattern:

**Before (Puppeteer):**
```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
const content = await page.content();
await browser.close();
```

**After (Cloudflare Browser Rendering):**
```typescript
// In wrangler.toml, you need:
// [[browser]]
// binding = "BROWSER"

export default {
  async fetch(request: Request, env: Env) {
    const browser = await env.BROWSER.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    await browser.close();

    return new Response(content);
  }
}
```

#### Environment Binding:

Update your API routes to accept the BROWSER binding:

```typescript
// app/api/audit/route.ts
export const runtime = 'edge'; // Required for Cloudflare

export async function POST(request: Request) {
  // Access browser from environment (Cloudflare provides this)
  const browser = await (globalThis as any).BROWSER?.launch();

  if (!browser) {
    throw new Error('Browser binding not available');
  }

  // Use browser normally...
}
```

### Step-by-Step Migration:

1. **Create Browser Service Abstraction** (Recommended)
   - Create `lib/cloudflare-browser.ts` to abstract browser operations
   - Allows easy switching between Puppeteer (dev) and Cloudflare (production)

2. **Update Each File:**
   - Replace `puppeteer.launch()` with `env.BROWSER.launch()`
   - Remove Playwright imports, use Puppeteer-compatible API
   - Update pa11y to use custom Puppeteer instance

3. **Add Edge Runtime Declarations:**
   ```typescript
   export const runtime = 'edge';
   export const dynamic = 'force-dynamic';
   ```

4. **Testing:**
   - Use `npm run preview` to test locally with Wrangler
   - Test browser operations work correctly

## Database Migration (Optional)

If using SQLite locally, consider migrating to:
- **Cloudflare D1** (serverless SQLite)
- **External PostgreSQL** (Neon, Supabase, etc.)

Current setup uses Prisma, which works with D1 using the appropriate adapter.

## Environment Variables

Set these in Cloudflare Dashboard or via CLI:

```bash
wrangler pages secret put ANTHROPIC_API_KEY
wrangler pages secret put DATABASE_URL
wrangler pages secret put NEXTAUTH_SECRET
wrangler pages secret put NEXTAUTH_URL
```

## Deployment Commands

```bash
# Build for Cloudflare Pages
npm run pages:build

# Preview locally
npm run preview

# Deploy to Cloudflare
npm run deploy

# Or deploy via Git integration (recommended)
# Connect your GitHub repo in Cloudflare Dashboard
```

## Alternative: OpenNext Adapter (Recommended by Cloudflare)

The `@cloudflare/next-on-pages` package is deprecated. Consider migrating to OpenNext:

```bash
npm install --save-dev opennext-cloudflare
```

Update build command to use OpenNext adapter instead.

## Cost Optimization Tips

1. **Cache Browser Results**: Use KV or Cache API to store audit results
2. **Batch Operations**: Group multiple audits when possible
3. **Smart Scheduling**: Run heavy operations during off-peak
4. **Monitor Usage**: Set up usage alerts in Cloudflare dashboard

## Testing Checklist

- [ ] Run `npm run lint` - check for errors
- [ ] Run `npm run build` - verify build succeeds
- [ ] Run `npm run pages:build` - verify Cloudflare build
- [ ] Run `npm run preview` - test locally with Wrangler
- [ ] Test browser automation features work
- [ ] Verify database connections work
- [ ] Test authentication flow
- [ ] Deploy to preview environment
- [ ] Run end-to-end tests on preview
- [ ] Deploy to production

## Resources

- [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Cloudflare D1 Database](https://developers.cloudflare.com/d1/)

## Next Steps

1. Create browser abstraction layer in `lib/cloudflare-browser.ts`
2. Update each file to use the new browser service
3. Add `export const runtime = 'edge'` to API routes
4. Test thoroughly with `npm run preview`
5. Deploy to Cloudflare Pages preview environment
6. Monitor costs and performance
7. Consider migrating to OpenNext adapter for long-term support
