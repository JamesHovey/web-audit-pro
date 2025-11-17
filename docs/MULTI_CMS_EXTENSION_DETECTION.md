# Multi-CMS Extension Detection Specification

## Overview
This document outlines the extension/plugin/module detection system for the top 50 CMS platforms, extending beyond WordPress to provide comprehensive technology stack analysis.

## CMS Extension Terminology

| CMS Platform | Extension Term | Market Share (2025) | Detection Priority |
|--------------|----------------|---------------------|-------------------|
| **WordPress** | Plugins | 62.7% | ✅ IMPLEMENTED |
| **Shopify** | Apps | 6.4% | 🔥 HIGH |
| **Wix** | Apps | 4.8% | 🔥 HIGH |
| **Squarespace** | Extensions | 3.2% | 🔥 HIGH |
| **Joomla** | Extensions/Components | 2.4% | 🔥 HIGH |
| **Drupal** | Modules | 1.2% | 🔥 HIGH |
| **PrestaShop** | Modules/Addons | 1.0% | 🟡 MEDIUM |
| **Magento** | Extensions | 0.9% | 🟡 MEDIUM |
| **OpenCart** | Extensions | 0.5% | 🟡 MEDIUM |
| **TYPO3** | Extensions | 0.3% | 🟡 MEDIUM |
| **Ghost** | Integrations/Themes | 0.2% | 🟢 LOW |
| **Webflow** | Apps/Integrations | 0.2% | 🟢 LOW |
| **Adobe Experience Manager** | Components | 0.1% | 🟢 LOW |
| **Contentful** | Apps/Extensions | 0.1% | 🟢 LOW |
| **DNN (DotNetNuke)** | Modules | <0.1% | 🟢 LOW |
| **Umbraco** | Packages | <0.1% | 🟢 LOW |
| **Concrete CMS** | Add-ons | <0.1% | 🟢 LOW |
| **Sitefinity** | Modules | <0.1% | 🟢 LOW |
| **Kentico** | Modules | <0.1% | 🟢 LOW |
| **Sitecore** | Modules | <0.1% | 🟢 LOW |

## Detection Patterns by Platform

### 1. Drupal (Modules)

**HTML Detection Patterns:**
```javascript
// Drupal 7
/sites/all/modules/contrib/{module-name}/
/sites/default/modules/{module-name}/

// Drupal 8/9/10
/modules/contrib/{module-name}/
/core/modules/{module-name}/

// JavaScript/CSS patterns
drupal.settings
Drupal.behaviors
```

**Popular Modules to Detect:**
- **SEO**: Metatag, Pathauto, Redirect, XML Sitemap
- **Performance**: Views, Panels, Advanced CSS/JS Aggregation
- **Forms**: Webform, Contact Form
- **Security**: Security Kit, Shield, Captcha
- **E-commerce**: Commerce, Ubercart
- **Admin**: Admin Toolbar, Module Filter

**Detection Example:**
```typescript
// Drupal module detection
if (lowerHtml.includes('/modules/contrib/') || lowerHtml.includes('/sites/all/modules/')) {
  // Extract module name from path
  const moduleMatches = html.match(/\/modules\/contrib\/([^\/]+)\//g);
}
```

### 2. Joomla (Extensions/Components)

**HTML Detection Patterns:**
```javascript
// Joomla paths
/components/com_{extension}/
/plugins/{type}/{plugin}/
/modules/mod_{module}/
/templates/{template}/

// JavaScript patterns
Joomla.JText
joomla-script-options
```

**Popular Extensions to Detect:**
- **SEO**: SH404SEF, JoomSEF, EFSEO
- **Forms**: RSForm Pro, BreezingForms, ChronoForms
- **E-commerce**: VirtueMart, HikaShop, J2Store
- **Galleries**: Phoca Gallery, Simple Image Gallery
- **Security**: Admin Tools, RSFirewall, Akeeba Backup
- **Page Builders**: SP Page Builder, Quix Page Builder

**Detection Example:**
```typescript
// Joomla component detection
if (lowerHtml.includes('/components/com_')) {
  const componentMatches = html.match(/\/components\/com_([^\/]+)\//g);
}
```

### 3. Shopify (Apps)

**HTML Detection Patterns:**
```javascript
// Shopify CDN patterns
cdn.shopify.com/s/files/
shopify-app-store
/apps/{app-name}/

// JavaScript patterns
Shopify.theme
ShopifyApp
```

**Popular Apps to Detect:**
- **SEO**: SEO Manager, Plug in SEO, Smart SEO
- **Marketing**: Klaviyo, Omnisend, Privy
- **Reviews**: Judge.me, Loox, Yotpo
- **Upsell**: Bold Upsell, ReConvert, Candy Rack
- **Shipping**: ShipStation, Easyship, AfterShip
- **Analytics**: Lucky Orange, Hotjar, Better Reports

**Detection Example:**
```typescript
// Shopify app detection via script tags
if (lowerHtml.includes('cdn.shopify.com')) {
  const appMatches = html.match(/cdn\.shopify\.com\/s\/files\/\d+\/\d+\/\d+\/files\/([^\/\.]+)/g);
}
```

### 4. Magento (Extensions)

**HTML Detection Patterns:**
```javascript
// Magento paths
/app/code/{vendor}/{module}/
Mage.Cookies
Magento_

// JavaScript patterns
require(['jquery'], function($)
```

**Popular Extensions to Detect:**
- **SEO**: Magento SEO Suite, SEO Toolkit
- **Payment**: Stripe, PayPal, Authorize.net
- **Shipping**: ShipperHQ, Temando
- **Analytics**: Google Tag Manager, Enhanced Ecommerce
- **Marketing**: Dotdigital, Mailchimp
- **Security**: MageFirewall, Security Suite

### 5. PrestaShop (Modules/Addons)

**HTML Detection Patterns:**
```javascript
// PrestaShop paths
/modules/{module-name}/
prestashop.
ps_

// JavaScript patterns
prestashop.urls
prestashop.page
```

**Popular Modules to Detect:**
- **SEO**: SEO Expert, Pretty URLs
- **Payment**: Stripe, PayPal Official
- **Analytics**: Google Analytics Enhanced
- **Marketing**: Newsletter, Mailchimp Sync
- **Social**: Social Media Share, Facebook Pixel

### 6. Wix (Apps)

**HTML Detection Patterns:**
```javascript
// Wix patterns
static.wixstatic.com
wix-code-public
wix-bookings
wix-stores
```

**Note:** Wix is a closed platform, so app detection is limited to first-party integrations visible in HTML.

### 7. Squarespace (Extensions)

**HTML Detection Patterns:**
```javascript
// Squarespace patterns
static1.squarespace.com
squarespace-cdn
sqs-block-
```

**Note:** Similar to Wix, Squarespace is a closed platform with limited extension visibility.

## Recommendations System

### SEO Extensions/Modules

**If Missing:**
```markdown
### Install SEO Extension
Your {CMS} site could benefit from an SEO extension to improve search visibility.

**Recommended Extensions:**
- {Platform-specific SEO extension recommendations}

**How to Install:**
1. {Platform-specific installation steps}
2. Configure meta tags and descriptions
3. Set up XML sitemap generation
4. Enable redirect management

**Expected Impact:** Improved search engine rankings and visibility
```

### Performance Extensions/Modules

**If Missing:**
```markdown
### Add Caching Extension
Installing a caching extension can significantly improve site speed.

**Recommended Extensions:**
- {Platform-specific caching extension recommendations}

**How to Install:**
1. {Platform-specific installation steps}
2. Enable page caching
3. Configure browser caching
4. Enable CSS/JS minification

**Expected Impact:** 40-60% faster page load times
```

### Security Extensions/Modules

**If Outdated/Vulnerable:**
```markdown
### Update Security Extension
{Extension Name} has known security vulnerabilities.

**Action Required:**
1. Update to version {safe_version} immediately
2. Review security logs for suspicious activity
3. Change admin passwords if compromised

**Risk Level:** HIGH
**CVE:** {cve_id if available}
```

## Implementation Plan

### Phase 1: High Priority CMS (Drupal, Joomla, Shopify)
1. Create detection patterns for each platform
2. Build module/extension signature database
3. Implement HTML pattern matching
4. Add platform-specific recommendations

### Phase 2: Medium Priority CMS (Magento, PrestaShop, OpenCart)
1. Extend detection system
2. Add e-commerce specific recommendations
3. Implement payment/shipping extension detection

### Phase 3: Polish & AI Enhancement
1. Use Claude AI for unknown extension detection
2. Add version detection for all platforms
3. Implement security vulnerability database
4. Create unified recommendation engine

## File Structure

```
lib/
  cms-detection/
    drupalModuleDetection.ts      # Drupal modules
    joomlaExtensionDetection.ts   # Joomla extensions
    shopifyAppDetection.ts        # Shopify apps
    magentoExtensionDetection.ts  # Magento extensions
    prestashopModuleDetection.ts  # PrestaShop modules
    universalCMSDetection.ts      # Unified detection system
  cms-recommendations/
    drupalRecommendations.ts      # Drupal-specific fixes
    joomlaRecommendations.ts      # Joomla-specific fixes
    shopifyRecommendations.ts     # Shopify-specific fixes
    universalRecommendations.ts   # Cross-platform recommendations
```

## Benefits

1. **Comprehensive Coverage**: Detect extensions across all major CMS platforms
2. **Platform-Specific Guidance**: Tailored recommendations for each CMS
3. **Better Insights**: Understand the full technology stack regardless of CMS
4. **Security Alerts**: Identify vulnerable extensions across all platforms
5. **Performance Optimization**: Platform-specific performance recommendations

## Next Steps

1. ✅ Document CMS extension terminology (COMPLETED)
2. 🔄 Implement Drupal module detection (IN PROGRESS)
3. ⏳ Implement Joomla extension detection (PENDING)
4. ⏳ Implement Shopify app detection (PENDING)
5. ⏳ Create unified recommendation system (PENDING)
6. ⏳ Update UI to show platform-specific terminology (PENDING)
