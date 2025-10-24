# Cloudflare Pages Deployment Guide

## Prerequisites ✅

- [x] Code pushed to GitHub
- [x] Cloudflare account (free or paid)
- [x] Next.js app configured for Cloudflare
- [x] All environment variables ready

---

## Method 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Connect to GitHub

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**
6. Select **GitHub** as your Git provider
7. Authorize Cloudflare to access your GitHub account
8. Select your repository: `web-audit-pro`

### Step 2: Configure Build Settings

**Framework preset:** Next.js

**Build settings:**
- **Production branch:** `main` (or your default branch)
- **Build command:** `npm run build`
- **Build output directory:** `.next`
- **Root directory:** `/` (leave blank if at root)

**Advanced settings:**
- **Node version:** `20.x` (or latest LTS)

### Step 3: Add Environment Variables

Click **Environment variables** and add the following:

#### Required Variables:
```
DATABASE_URL=your-database-connection-string
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.pages.dev
ANTHROPIC_API_KEY=your-claude-api-key
```

#### API Keys:
```
KEYWORDS_EVERYWHERE_API_KEY=your-ke-api-key
SERPER_API_KEY=your-serper-api-key
GOOGLE_PAGESPEED_API_KEY=your-google-api-key
```

#### Optional:
```
NEXT_PUBLIC_BASE_URL=https://your-domain.pages.dev
```

**Important:** Set variables for **both Production and Preview environments**

### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies
   - Run the build
   - Deploy to Cloudflare Pages

**First deployment takes 5-10 minutes**

### Step 5: Monitor Deployment

Watch the build logs in real-time. Look for:
- ✓ Dependencies installed
- ✓ Build completed
- ✓ Deployment successful

You'll get a URL like: `https://web-audit-pro.pages.dev`

---

## Method 2: Deploy via Wrangler CLI

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens a browser window to authenticate.

### Step 3: Create Pages Project

```bash
wrangler pages project create web-audit-pro
```

Select:
- **Production branch:** main

### Step 4: Build and Deploy

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=web-audit-pro
```

### Step 5: Set Environment Variables

```bash
# Set production environment variables
wrangler pages secret put DATABASE_URL --project-name=web-audit-pro
wrangler pages secret put NEXTAUTH_SECRET --project-name=web-audit-pro
wrangler pages secret put ANTHROPIC_API_KEY --project-name=web-audit-pro
# ... repeat for all secrets
```

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

**In Cloudflare Dashboard:**
1. Go to your Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `audit.yourdomain.com`)
5. Follow DNS configuration instructions

Cloudflare will:
- Automatically provision SSL certificate
- Handle DNS routing
- Enable CDN caching

### 2. Database Setup

**Option A: Continue using SQLite (Development only)**
- SQLite doesn't work in production on Cloudflare
- Need to migrate to PostgreSQL or D1

**Option B: Use Cloudflare D1 (Recommended)**

```bash
# Create D1 database
wrangler d1 create web-audit-db

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "web-audit-db"
database_id = "your-database-id-from-above"

# Migrate schema
wrangler d1 execute web-audit-db --file=./prisma/schema.sql
```

**Option C: Use External PostgreSQL**
- Neon, Supabase, or PlanetScale
- Update `DATABASE_URL` environment variable
- Run migrations: `npx prisma migrate deploy`

### 3. Enable Browser Rendering API

**In Cloudflare Dashboard:**
1. Go to **Workers & Pages** → **Settings**
2. Navigate to **Bindings**
3. Click **Add binding**
4. Select **Browser Rendering**
5. Name: `BROWSER`
6. Click **Save**

**Or via Wrangler:**
Already configured in `wrangler.toml`:
```toml
[[browser]]
binding = "BROWSER"
```

### 4. Configure Caching (Optional)

**Add KV Namespace for caching:**

```bash
# Create KV namespace
wrangler kv:namespace create "AUDIT_CACHE"

# Add to wrangler.toml
[[kv_namespaces]]
binding = "AUDIT_CACHE"
id = "your-kv-namespace-id"
```

---

## Automatic Deployments

Once connected to GitHub, Cloudflare automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every pull request

**Branch deployments get unique URLs:**
- `https://branch-name.web-audit-pro.pages.dev`

---

## Monitoring & Debugging

### View Deployment Logs

**Dashboard:**
1. Go to your Pages project
2. Click **Deployments**
3. Select a deployment
4. View **Build log** and **Function log**

**CLI:**
```bash
wrangler pages deployment list --project-name=web-audit-pro
wrangler pages deployment tail
```

### Check Build Status

```bash
wrangler pages deployment list --project-name=web-audit-pro
```

### View Live Logs

```bash
wrangler pages deployment tail --project-name=web-audit-pro
```

---

## Common Issues & Solutions

### Issue 1: Build Fails

**Error:** `Module not found` or dependency issues

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Issue 2: Environment Variables Not Working

**Solution:**
- Ensure variables are set in **both** Production and Preview
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Issue 3: Database Connection Fails

**Solution:**
- For SQLite: Migrate to D1 or PostgreSQL
- For PostgreSQL: Ensure connection string includes `?sslmode=require`
- Check firewall allows Cloudflare IPs

### Issue 4: API Routes Timeout

**Solution:**
- Cloudflare has 30-second limit per request
- Optimize slow audits
- Consider background jobs for long-running tasks

---

## Performance Optimization

### Enable Edge Caching

Add caching headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300'
        }
      ]
    }
  ]
}
```

### Use Edge Functions

Cloudflare automatically runs your API routes at the edge for lowest latency.

---

## Costs

**Cloudflare Pages Free Tier:**
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ Concurrent builds: 1

**Workers Paid Plan ($5/month):**
- Required for Browser Rendering API
- 10 million requests/month
- 10 hours browser rendering/month (FREE)
- Additional usage: $0.09/hour

**Expected Monthly Cost:**
- Pages: **Free**
- Workers: **$5/month**
- Browser API: **~$0-5** (depends on usage beyond free tier)
- **Total: ~$5-10/month**

---

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Configure environment variables
3. ✅ Set up custom domain (optional)
4. ✅ Migrate database to D1 or PostgreSQL
5. ✅ Test audit functionality
6. ✅ Monitor performance and costs

---

## Useful Commands

```bash
# View all projects
wrangler pages project list

# Delete a deployment
wrangler pages deployment delete <deployment-id>

# Rollback to previous deployment
# (Use dashboard - no CLI command)

# View project settings
wrangler pages project get web-audit-pro
```

---

## Support Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/pages
- **Next.js on Cloudflare:** https://developers.cloudflare.com/pages/framework-guides/nextjs
- **Browser Rendering:** https://developers.cloudflare.com/browser-rendering
- **Community:** https://community.cloudflare.com

---

## Success Checklist

Before going live:

- [ ] Deployment successful
- [ ] All environment variables configured
- [ ] Database connected and migrated
- [ ] Browser Rendering API enabled
- [ ] Test audit runs successfully
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] Monitoring/logging set up
- [ ] Cost alerts configured

---

**You're ready to deploy!** 🚀

Start with **Method 1 (Dashboard)** for the easiest setup.
