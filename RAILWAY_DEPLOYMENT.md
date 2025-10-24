# Railway Deployment Guide 🚂

## Why Railway?

✅ **No timeout limits** - Your 2-4 minute audits will work perfectly
✅ **Full Node.js** - Prisma works out of the box
✅ **PostgreSQL included** - Free database
✅ **Simple deployment** - Connect GitHub and go
✅ **Affordable** - $5-10/month with free trial

---

## Step 1: Sign Up for Railway

1. Go to https://railway.app/
2. Click **"Start a New Project"** or **"Login"**
3. Sign in with **GitHub** (easiest)
4. You'll get **$5 free credit** to start

---

## Step 2: Create New Project

1. Click **"+ New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Authorize Railway to access your repositories
5. Select **`web-audit-pro`** repository
6. Click **"Deploy Now"**

Railway will automatically:
- Detect it's a Next.js app
- Install dependencies
- Run the build
- Deploy the app

---

## Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway automatically:
   - Creates the database
   - Sets `DATABASE_URL` environment variable
   - Connects it to your app

---

## Step 4: Configure Environment Variables

In Railway dashboard, go to your app → **Variables** tab:

### Required Variables:

```bash
# Authentication (Generate new one)
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=https://your-app.up.railway.app

# API Keys
ANTHROPIC_API_KEY=<your-anthropic-key>
KEYWORDS_EVERYWHERE_API_KEY=<your-ke-key>
SERPER_API_KEY=<your-serper-key>
GOOGLE_PAGESPEED_API_KEY=<your-google-key>
```

**Note:** `DATABASE_URL` is automatically set by Railway when you add PostgreSQL!

### Generate NEXTAUTH_SECRET:

Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output and paste as `NEXTAUTH_SECRET` value.

---

## Step 5: Initial Migration

Railway will run `npx prisma migrate deploy` automatically on first deploy (configured in `railway.json`).

If you need to run migrations manually:

1. In Railway dashboard, click your app
2. Go to **"Deployments"** tab
3. Click **"View Logs"**
4. Check if migrations ran successfully

---

## Step 6: Get Your Deployment URL

1. In Railway dashboard, go to **"Settings"** tab
2. Scroll to **"Domains"**
3. You'll see your app URL: `https://web-audit-pro-production.up.railway.app`
4. Click **"Generate Domain"** if not already generated

**Update NEXTAUTH_URL:**
1. Go back to **Variables** tab
2. Update `NEXTAUTH_URL` to your Railway URL
3. Click **"Save"** - Railway will redeploy automatically

---

## Step 7: Test Your App

1. Visit your Railway URL
2. Try to:
   - Create an account
   - Log in
   - Run an audit
3. Check Railway logs for any errors:
   - Dashboard → **"Deployments"** → **"View Logs"**

---

## Monitoring & Debugging

### View Logs:
```
Dashboard → Your App → Deployments → View Logs
```

### Database Access:
```
Dashboard → PostgreSQL → Data → Query
```

### Restart App:
```
Dashboard → Your App → Settings → Restart
```

---

## Environment Variables Summary

Here's the complete list you need:

```bash
# Database (Auto-set by Railway)
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.up.railway.app

# API Keys
ANTHROPIC_API_KEY=<your-key>
KEYWORDS_EVERYWHERE_API_KEY=<your-key>
SERPER_API_KEY=<your-key>
GOOGLE_PAGESPEED_API_KEY=<your-key>
```

---

## Cost Estimate

**Monthly costs:**
- **App hosting:** ~$3-5/month (based on usage)
- **PostgreSQL:** ~$2-3/month (500MB storage)
- **Total:** **~$5-8/month**

**Free trial:** $5 credit (covers 1-2 weeks of testing)

---

## Automatic Deployments

Railway automatically redeploys when you:
- Push to `main` branch on GitHub
- Change environment variables
- Manually trigger redeploy

**Each deployment:**
- Pulls latest code from GitHub
- Installs dependencies
- Runs `npx prisma migrate deploy`
- Builds Next.js
- Starts the app

---

## Troubleshooting

### Build Fails:

**Check build logs:**
```
Dashboard → Deployments → View Logs
```

**Common issues:**
- Missing environment variables
- Prisma migration errors
- Dependency installation failures

### Database Connection Fails:

**Check DATABASE_URL:**
```
Dashboard → Variables → DATABASE_URL
```

Should look like:
```
postgresql://postgres:password@host:5432/railway
```

### App Crashes:

**Check runtime logs:**
```
Dashboard → Deployments → View Logs → Runtime Logs
```

Look for:
- JavaScript errors
- Prisma connection errors
- Missing API keys

---

## Railway CLI (Optional)

For advanced users:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs

# Open app in browser
railway open
```

---

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `audit.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain

---

## Scaling (If Needed)

Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

**No manual configuration needed!**

---

## Support

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **Railway Support:** support@railway.app

---

## Success Checklist

Before going live:

- [ ] App deployed successfully
- [ ] PostgreSQL database created
- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] Test user account created
- [ ] Test audit runs successfully
- [ ] Logs show no errors
- [ ] Custom domain configured (if using)

---

**You're ready to deploy!** 🚀

Follow the steps above and your app will be live in ~10 minutes.
