# D1 Database Migration - Complete

## What Was Done

### 1. Cloudflare Setup
- ✅ Logged into Cloudflare via Wrangler
- ✅ Created D1 database: `web-audit-db`
- ✅ Database ID: `c005a91a-a3c1-4e45-96f6-5a25a5cc0552`
- ✅ Database region: WEUR (Western Europe)

### 2. Schema Migration
- ✅ Exported Prisma schema to SQL format
- ✅ Converted JSONB types to TEXT (for SQLite compatibility)
- ✅ Applied schema to local D1 database
- ✅ Applied schema to remote D1 database
- ✅ Created 5 tables: Account, Session, User, VerificationToken, Audit
- ✅ Created all indexes and foreign keys

### 3. Code Updates
- ✅ Fixed `wrangler.toml` browser binding (array → object)
- ✅ Added account_id to `wrangler.toml`
- ✅ Added D1 database config to `wrangler.toml`
- ✅ Installed `@prisma/adapter-d1` package
- ✅ Updated Prisma schema with `driverAdapters` preview feature
- ✅ Updated `lib/prisma.ts` with D1 adapter support
- ✅ Regenerated Prisma client
- ✅ Build successful

## Current Configuration

### wrangler.toml
```toml
name = "web-audit-pro"
compatibility_date = "2025-01-24"
pages_build_output_dir = ".vercel/output/static"
account_id = "4950afe6869a3aafe716d9467f1d0782"

[env.production]
compatibility_date = "2025-01-24"

[browser]
binding = "BROWSER"

[[d1_databases]]
binding = "DB"
database_name = "web-audit-db"
database_id = "c005a91a-a3c1-4e45-96f6-5a25a5cc0552"

[limits]
cpu_ms = 30000
```

### Environment Variables Needed

Set these in Cloudflare Dashboard or via Wrangler:

**Required:**
```bash
DATABASE_URL=file:./prisma/dev.db  # For local dev
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.pages.dev
ANTHROPIC_API_KEY=your-claude-api-key
```

**API Keys:**
```bash
KEYWORDS_EVERYWHERE_API_KEY=your-ke-api-key
SERPER_API_KEY=your-serper-api-key
GOOGLE_PAGESPEED_API_KEY=your-google-api-key
```

**Optional:**
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.pages.dev
```

## Next Steps: Deployment

### Option 1: Dashboard Deployment (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Cloudflare D1 database migration"
   git push origin main
   ```

2. **Connect to Cloudflare:**
   - Go to https://dash.cloudflare.com/
   - Navigate to Workers & Pages
   - Click "Create application" → Pages → Connect to Git
   - Select your repository

3. **Configure build settings:**
   - Framework: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node version: 20.x

4. **Add environment variables:**
   - Click Environment variables
   - Add all variables from above
   - Set for both Production and Preview

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait 5-10 minutes for first deployment

### Option 2: Wrangler CLI Deployment

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=web-audit-pro

# Set environment variables
wrangler pages secret put DATABASE_URL --project-name=web-audit-pro
wrangler pages secret put NEXTAUTH_SECRET --project-name=web-audit-pro
wrangler pages secret put ANTHROPIC_API_KEY --project-name=web-audit-pro
# ... repeat for all secrets
```

## Database Management

### Query D1 Database

**Local:**
```bash
npx wrangler d1 execute web-audit-db --command "SELECT * FROM User"
```

**Remote:**
```bash
npx wrangler d1 execute web-audit-db --remote --command "SELECT * FROM User"
```

### View Database Info

```bash
npx wrangler d1 info web-audit-db
```

### Run SQL File

```bash
npx wrangler d1 execute web-audit-db --file=queries.sql [--remote]
```

## Important Notes

### Local Development
- Continue using local SQLite database (`prisma/dev.db`)
- Use `npm run dev` as normal
- D1 adapter will be used automatically on Cloudflare

### Production
- D1 database is serverless SQLite
- 5GB storage (free tier)
- 25M reads/month (free tier)
- Automatic replication and backups
- No connection pooling needed

### Costs
- **Cloudflare Pages:** Free (unlimited bandwidth)
- **D1 Database:** Free for first 5GB + 25M reads
- **Browser Rendering API:** $5/month + $0.09/hour (10 hours free)
- **Total estimated:** ~$5-10/month

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
# Check D1 connection
npx wrangler d1 info web-audit-db

# View tables
npx wrangler d1 execute web-audit-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Environment Variables Not Working
- Ensure variables are set in BOTH Production and Preview
- Redeploy after adding variables
- Variable names are case-sensitive

## Success Checklist

- [x] D1 database created
- [x] Schema applied to D1
- [x] Prisma configured for D1
- [x] wrangler.toml configured
- [x] Build successful
- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages connected
- [ ] Environment variables set
- [ ] First deployment complete
- [ ] Test audit runs successfully

---

**Status:** Ready for deployment! 🚀

Follow the deployment steps above to deploy your application to Cloudflare Pages.
