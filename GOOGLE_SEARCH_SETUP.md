# Google Custom Search API Setup Guide

This guide will help you set up Google Custom Search API for Web Audit Pro, which provides **100 free searches per day**.

## Why Google Custom Search API?

- ✅ **100 free searches/day** (no credit card required)
- ✅ Real Google search results
- ✅ Reliable and maintained by Google
- ✅ Better than ValueSerp's limited free tier
- ✅ No expiring API keys or trial periods

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Create Project"** or select an existing project
3. Give your project a name (e.g., "Web Audit Pro")

### Step 2: Enable Custom Search API

1. In your Google Cloud Project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Custom Search API"**
3. Click on it and press **"Enable"**

### Step 3: Create API Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy your API key (you'll need this later)
4. Optional: Click "Edit API key" to add restrictions:
   - Application restrictions: HTTP referrers (for production)
   - API restrictions: Restrict to Custom Search API only

### Step 4: Create a Programmable Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com)
2. Click **"Add"** to create a new search engine
3. Configure your search engine:
   - **Search settings**: Choose **"Search the entire web"**
   - **Name**: Give it a name (e.g., "Web Audit Pro Search")
4. Click **"Create"**
5. Copy your **Search Engine ID** (looks like: `017643444788157...`)

### Step 5: Configure Web Audit Pro

Add your credentials to the `.env.local` file:

```env
GOOGLE_API_KEY="your_api_key_here"
GOOGLE_SEARCH_ENGINE_ID="your_search_engine_id_here"
```

### Step 6: Restart the Development Server

```bash
npm run dev
```

## Usage Limits

- **Free Tier**: 100 searches per day
- **Paid Option**: $5 per 1,000 searches above the free tier
- **Rate Limit**: 100 requests per 100 seconds

## Testing Your Setup

Once configured, the app will automatically use Google Custom Search API for:
- Checking keyword rankings
- Getting real Google position data
- Analyzing competitor rankings

You can monitor your API usage in the [Google Cloud Console](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/metrics).

## Troubleshooting

### "API key not valid"
- Make sure you've enabled the Custom Search API in your project
- Check that your API key is correctly copied (no extra spaces)

### "Invalid search engine ID"
- Ensure your search engine is set to "Search the entire web"
- Double-check the Search Engine ID from the Programmable Search Engine control panel

### "Quota exceeded"
- You've reached the 100 searches/day limit
- Wait until the next day (resets at midnight Pacific Time)
- Or upgrade to paid tier if you need more searches

## Fallback Behavior

If the Google API is not configured or quota is exceeded, the app automatically falls back to:
- Contextual keyword analysis from page content
- Estimated search volumes
- Content-based keyword extraction

This ensures the app continues to work even without API credentials.