# UK Companies to Test with Companies House API

## Confirmed UK Companies (will work with Companies House)

### Architecture & Design
- **www.livingspacearchitects.com** - UK architecture firm
- **www.fosterandpartners.com** - Famous UK architects

### Marketing & Digital
- **www.pmwcom.co.uk** - UK marketing agency  
- **www.digitalboost.co.uk** - UK digital agency

### Legal Services
- **www.slaughterandmay.com** - Major UK law firm
- **www.cliffordchance.com** - UK legal services

### Financial Services  
- **www.brewin.co.uk** - UK wealth management
- **www.quiltercheviot.com** - UK investment management

### Manufacturing
- **www.mecmesin.com** - UK manufacturing company
- **www.chocovision.co.uk** - UK chocolate equipment

### Other UK Businesses
- **www.henryadams.co.uk** - UK estate agents
- **www.sainsburys.co.uk** - UK supermarket
- **www.johnlewis.com** - UK retail (may still have UK indicators)

## Non-UK Companies (will skip Companies House)

### US Companies
- **www.mondeumcapital.com** - US trading firm
- **www.apple.com** - US tech company
- **www.microsoft.com** - US software

### Other International
- **www.shopify.ca** - Canadian e-commerce
- **www.spotify.com** - Swedish music streaming

## What to Expect in Logs

### For UK Companies:
```
🇬🇧 UK company detected via domain: livingspacearchitects.com
✅ Registry lookup: SIC codes 71111
🧠 Business context: architecture-construction (confidence: 0.9)
```

### For Non-UK Companies:
```
🌍 Non-UK company: mondeumcapital.com (no UK indicators found)
⚠️ Companies House lookup skipped (non-UK company)
🧠 Using Google semantic analysis instead
```

## How UK Detection Works

The system checks for:
1. **Domain extensions**: .co.uk, .uk, .org.uk, .gov.uk
2. **Content indicators**: "registered in england", "companies house", "company number"
3. **UK postcodes**: Pattern like "SW1A 1AA"
4. **UK phone numbers**: +44, 01xxx, 02xxx, 07xxx

If it finds:
- UK domain = automatic UK detection
- 2+ content indicators = UK detection
- Otherwise = non-UK company