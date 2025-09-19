# ValueSerp Integration Setup

The application now includes **real Google ranking data** via ValueSerp API integration. This provides accurate keyword position data instead of fake estimates.

## Quick Setup (Free Tier)

1. **Get Free API Key**
   - Visit: https://app.valueserp.com/
   - Sign up for free account
   - Get your API key from dashboard
   - **Free tier includes:** 1,000 searches/month

2. **Add API Key to Environment**
   ```bash
   # Edit .env.local
   VALUESERP_API_KEY="your_api_key_here"
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

## How It Works

### With API Key (Real Data)
- ✅ **Real Google rankings** for pmwcom.co.uk
- ✅ **Accurate position data** (1-100)
- ✅ **Actual search results** verification
- ✅ **Data source indicator** shows "Real Google Ranking Data"

### Without API Key (Fallback)
- ⚠️ **Estimated data only**
- ⚠️ **No position claims** (shows 0 for unknown)
- ⚠️ **Keyword suggestions** based on content analysis
- ⚠️ **Data source indicator** shows "Estimated Data Only"

## What Changes

### Before (Fake Data)
```
❌ "pmwcom.co.uk ranks #3 for 'latest blogs'"
❌ Generic keywords like "follow us"
❌ Misleading position claims
```

### After (Real Data)
```
✅ Real Google search results
✅ Actual ranking positions (or 0 if not ranking)
✅ Business-relevant keywords only
✅ Clear data source labeling
```

## Usage Limits

- **Free tier:** 1,000 searches/month
- **Smart usage:** App checks 15 keywords per domain analysis
- **Rate limiting:** 2-second delays between API calls
- **Fallback:** Gracefully handles API failures

## Cost Consideration

- **Free tier:** Perfect for testing and light usage
- **Paid plans:** Start at $30/month for 10,000 searches
- **ROI:** Real ranking data much more valuable than fake estimates

## Example Output

With API key configured, you'll see:
- Green badge: "✓ Real Google Ranking Data (15 searches)"
- Actual keyword positions for domains that rank
- Position 0 for keywords not ranking in top 100
- Business-relevant keyword suggestions based on content analysis

The system will automatically fall back to estimation if API fails or key is missing.