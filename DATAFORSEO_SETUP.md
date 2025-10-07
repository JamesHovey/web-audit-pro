# DataForSEO API Setup Guide

## Overview
DataForSEO provides cost-effective backlink analysis at $0.02 per 1000 backlinks (pay-per-use model).

## Setup Steps

### 1. Create DataForSEO Account
1. Go to https://dataforseo.com/
2. Sign up for an account
3. Add funds (minimum $50 deposit)

### 2. Get Your API Credentials
1. Log into your DataForSEO dashboard
2. Go to API Dashboard
3. Find your login email and API password

### 3. Add to Environment Variables
Add these to your `.env.local` file:

```env
# DataForSEO API Credentials
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=your-api-password
```

## API Features Implemented

### Backlink Analysis
- **Domain Authority**: 0-100 score
- **Total Backlinks**: Complete count
- **Referring Domains**: Unique domains linking to site
- **Dofollow/Nofollow**: Link type breakdown
- **New/Lost Links**: 30-day changes
- **Top Backlinks**: Highest authority links
- **Anchor Text Distribution**: Common anchor texts
- **Referring Domains**: Top linking domains
- **Link Types**: Text, image, redirect, canonical

## Cost Breakdown

### Per Analysis Costs
- Basic audit (100 backlinks): ~$0.002
- Standard audit (1,000 backlinks): ~$0.02
- Comprehensive audit (10,000 backlinks): ~$0.20
- Enterprise audit (50,000 backlinks): ~$1.00

### Cost Optimization
The service is configured to:
1. Fetch up to 100 high-quality backlinks by default
2. Cache results for 30 days
3. Only analyze dofollow links for efficiency
4. Use summary endpoints to minimize API calls

## API Endpoints Used

1. **Summary** (`/backlinks/summary/live`)
   - Most cost-effective
   - Overall metrics

2. **Domain Metrics** (`/backlinks/domain_metrics/live`)
   - Domain rank and authority

3. **Backlinks** (`/backlinks/backlinks/live`)
   - Actual backlink list
   - Filtered by quality

4. **Anchors** (`/backlinks/anchors/live`)
   - Anchor text distribution

5. **Referring Domains** (`/backlinks/referring_domains/live`)
   - Top linking domains

## Testing

Test the integration:
```bash
# Check if credentials are loaded
npm run dev
# Visit your audit page and test backlink analysis
```

## Monitoring Usage

Track your API usage at:
https://app.dataforseo.com/api-dashboard

## Support

- Documentation: https://docs.dataforseo.com/v3/backlinks
- Support: support@dataforseo.com

## Fallback Options

If DataForSEO is not configured, the app will fall back to:
1. Majestic API (if configured)
2. OpenPageRank for domain authority only
3. Mock data with clear messaging

## Benefits Over Alternatives

| Service | Monthly Cost | Per-Request Cost | Backlink Quality |
|---------|-------------|------------------|------------------|
| DataForSEO | $0 (pay-per-use) | $0.02/1000 | Excellent |
| Ahrefs | $500+ | Included | Best |
| Semrush | $500+ | Included | Excellent |
| Majestic | $50-400 | Included | Very Good |
| Moz | $99-599 | Included | Good |

DataForSEO offers the best value for occasional use and small-to-medium scale operations.