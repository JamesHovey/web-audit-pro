/**
 * Shopify App Detection Service
 * Detects Shopify apps from HTML content
 * Note: Shopify is a hosted platform, so detection relies on app-specific JavaScript/CSS footprints
 */

export interface DetectedShopifyApp {
  name: string;
  displayName: string;
  category: 'seo' | 'marketing' | 'reviews' | 'upsell' | 'shipping' | 'analytics' | 'email' | 'social' | 'conversion' | 'other';
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description?: string;
  pricing?: 'free' | 'paid' | 'freemium';
}

export interface ShopifyAppAnalysis {
  totalApps: number;
  appsByCategory: Record<string, DetectedShopifyApp[]>;
  recommendations: string[];
}

// Shopify app signatures with detection patterns
interface ShopifyAppSignature {
  name: string;
  displayName: string;
  category: DetectedShopifyApp['category'];
  patterns: {
    html?: string[];      // HTML content patterns
    js?: string[];        // JavaScript variable/function patterns
    css?: string[];       // CSS class patterns
    domains?: string[];   // Third-party domain patterns
  };
  description: string;
  pricing?: 'free' | 'paid' | 'freemium';
}

const SHOPIFY_APP_SIGNATURES: ShopifyAppSignature[] = [
  // SEO Apps
  {
    name: 'plug_in_seo',
    displayName: 'Plug in SEO',
    category: 'seo',
    patterns: {
      html: ['plug-in-seo', 'pluginseo'],
      js: ['PluginSEO'],
    },
    description: 'SEO optimization and checking tool',
    pricing: 'freemium'
  },
  {
    name: 'smart_seo',
    displayName: 'Smart SEO',
    category: 'seo',
    patterns: {
      html: ['smart-seo', 'smartseo'],
    },
    description: 'Automated SEO optimization',
    pricing: 'paid'
  },
  {
    name: 'seo_manager',
    displayName: 'SEO Manager',
    category: 'seo',
    patterns: {
      html: ['seo-manager'],
      js: ['SEOManager'],
    },
    description: 'Comprehensive SEO management',
    pricing: 'paid'
  },

  // Marketing Apps
  {
    name: 'klaviyo',
    displayName: 'Klaviyo',
    category: 'marketing',
    patterns: {
      html: ['klaviyo'],
      js: ['_learnq', 'klaviyo'],
      domains: ['static.klaviyo.com'],
    },
    description: 'Email marketing and automation',
    pricing: 'freemium'
  },
  {
    name: 'omnisend',
    displayName: 'Omnisend',
    category: 'marketing',
    patterns: {
      html: ['omnisend'],
      js: ['omnisend'],
      domains: ['omnisrc.com'],
    },
    description: 'Email & SMS marketing automation',
    pricing: 'freemium'
  },
  {
    name: 'privy',
    displayName: 'Privy',
    category: 'marketing',
    patterns: {
      html: ['privy'],
      js: ['Privy', '_privacy'],
      domains: ['widget.privy.com'],
    },
    description: 'Email popups and conversion tools',
    pricing: 'freemium'
  },
  {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    category: 'email',
    patterns: {
      html: ['mailchimp', 'mc-embedded'],
      js: ['mailchimp'],
      domains: ['chimpstatic.com'],
    },
    description: 'Email marketing platform',
    pricing: 'freemium'
  },

  // Review Apps
  {
    name: 'judge_me',
    displayName: 'Judge.me',
    category: 'reviews',
    patterns: {
      html: ['judge.me', 'judgeme', 'jdgm-'],
      css: ['jdgm-', 'judgeme'],
      domains: ['cdn.judge.me'],
    },
    description: 'Product reviews and ratings',
    pricing: 'freemium'
  },
  {
    name: 'loox',
    displayName: 'Loox',
    category: 'reviews',
    patterns: {
      html: ['loox', 'loox-'],
      css: ['loox-'],
      domains: ['loox.io'],
    },
    description: 'Photo reviews and referrals',
    pricing: 'paid'
  },
  {
    name: 'yotpo',
    displayName: 'Yotpo',
    category: 'reviews',
    patterns: {
      html: ['yotpo'],
      js: ['yotpo'],
      domains: ['staticw2.yotpo.com'],
    },
    description: 'Reviews and user-generated content',
    pricing: 'freemium'
  },
  {
    name: 'stamped',
    displayName: 'Stamped.io',
    category: 'reviews',
    patterns: {
      html: ['stamped', 'stamped-'],
      css: ['stamped-'],
      domains: ['cdn1.stamped.io'],
    },
    description: 'Product reviews and ratings',
    pricing: 'freemium'
  },

  // Upsell Apps
  {
    name: 'bold_upsell',
    displayName: 'Bold Upsell',
    category: 'upsell',
    patterns: {
      html: ['bold-upsell', 'bold_upsell'],
      js: ['BoldUpsell'],
    },
    description: 'Product upselling and cross-selling',
    pricing: 'paid'
  },
  {
    name: 'reconvert',
    displayName: 'ReConvert',
    category: 'upsell',
    patterns: {
      html: ['reconvert'],
      js: ['reconvert'],
    },
    description: 'Post-purchase upsells and thank you page',
    pricing: 'freemium'
  },
  {
    name: 'candy_rack',
    displayName: 'Candy Rack',
    category: 'upsell',
    patterns: {
      html: ['candy-rack', 'candyrack'],
    },
    description: 'All-in-one upsell bundle',
    pricing: 'paid'
  },

  // Shipping Apps
  {
    name: 'shipstation',
    displayName: 'ShipStation',
    category: 'shipping',
    patterns: {
      html: ['shipstation'],
      js: ['ShipStation'],
    },
    description: 'Multi-carrier shipping software',
    pricing: 'paid'
  },
  {
    name: 'easyship',
    displayName: 'Easyship',
    category: 'shipping',
    patterns: {
      html: ['easyship'],
    },
    description: 'Shipping rates and courier management',
    pricing: 'freemium'
  },
  {
    name: 'aftership',
    displayName: 'AfterShip',
    category: 'shipping',
    patterns: {
      html: ['aftership'],
      js: ['AfterShip'],
      domains: ['track.aftership.com'],
    },
    description: 'Shipment tracking and notifications',
    pricing: 'freemium'
  },

  // Analytics Apps
  {
    name: 'lucky_orange',
    displayName: 'Lucky Orange',
    category: 'analytics',
    patterns: {
      html: ['luckyorange'],
      js: ['__lo_site_id'],
      domains: ['cdn.luckyorange.com'],
    },
    description: 'Heatmaps and visitor recordings',
    pricing: 'paid'
  },
  {
    name: 'hotjar',
    displayName: 'Hotjar',
    category: 'analytics',
    patterns: {
      html: ['hotjar'],
      js: ['hj', 'hotjar'],
      domains: ['static.hotjar.com'],
    },
    description: 'Heatmaps and behavior analytics',
    pricing: 'freemium'
  },
  {
    name: 'better_reports',
    displayName: 'Better Reports',
    category: 'analytics',
    patterns: {
      html: ['better-reports'],
    },
    description: 'Advanced analytics and reporting',
    pricing: 'paid'
  },

  // Conversion Optimization Apps
  {
    name: 'justuno',
    displayName: 'Justuno',
    category: 'conversion',
    patterns: {
      html: ['justuno'],
      js: ['ju_num'],
      domains: ['cdn.justuno.com'],
    },
    description: 'Popups and conversion optimization',
    pricing: 'freemium'
  },
  {
    name: 'wheelio',
    displayName: 'Wheelio',
    category: 'conversion',
    patterns: {
      html: ['wheelio'],
      js: ['wheelio'],
    },
    description: 'Gamified email popup',
    pricing: 'freemium'
  },

  // Social Media Apps
  {
    name: 'instagram_feed',
    displayName: 'Instagram Feed',
    category: 'social',
    patterns: {
      html: ['instagram-feed', 'instafeed'],
      js: ['Instafeed'],
    },
    description: 'Instagram gallery integration',
    pricing: 'freemium'
  },
  {
    name: 'facebook_chat',
    displayName: 'Facebook Chat',
    category: 'social',
    patterns: {
      html: ['fb-customerchat', 'facebook-chat'],
      js: ['FB.CustomerChat'],
    },
    description: 'Facebook Messenger chat widget',
    pricing: 'free'
  },

  // Other Popular Apps
  {
    name: 'pagefly',
    displayName: 'PageFly',
    category: 'other',
    patterns: {
      html: ['pagefly', '__pf'],
      css: ['__pf'],
    },
    description: 'Landing page builder',
    pricing: 'freemium'
  },
  {
    name: 'shogun',
    displayName: 'Shogun',
    category: 'other',
    patterns: {
      html: ['shogun'],
      css: ['shg-'],
    },
    description: 'Page builder and CMS',
    pricing: 'paid'
  },
  {
    name: 'searchanise',
    displayName: 'Searchanise',
    category: 'other',
    patterns: {
      html: ['searchanise'],
      js: ['Searchanise'],
    },
    description: 'Smart search and filters',
    pricing: 'freemium'
  },
];

export function detectShopifyApps(html: string, headers: Record<string, string>): ShopifyAppAnalysis {
  const detectedApps: DetectedShopifyApp[] = [];
  const lowerHtml = html.toLowerCase();

  console.log('🔍 Analyzing Shopify apps...');

  // Detect apps based on signatures
  for (const signature of SHOPIFY_APP_SIGNATURES) {
    let detected = false;
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let matchCount = 0;

    // Check domain patterns (highest confidence)
    if (signature.patterns.domains) {
      for (const domain of signature.patterns.domains) {
        if (lowerHtml.includes(domain.toLowerCase())) {
          detected = true;
          confidence = 'high';
          matchCount++;
          break;
        }
      }
    }

    // Check HTML patterns
    if (signature.patterns.html) {
      const htmlMatches = signature.patterns.html.filter(pattern =>
        lowerHtml.includes(pattern.toLowerCase())
      ).length;
      if (htmlMatches > 0) {
        detected = true;
        matchCount += htmlMatches;
        if (confidence !== 'high') {
          confidence = htmlMatches >= 2 ? 'high' : 'medium';
        }
      }
    }

    // Check JavaScript patterns
    if (signature.patterns.js) {
      const jsMatches = signature.patterns.js.filter(pattern =>
        html.includes(pattern)
      ).length;
      if (jsMatches > 0) {
        detected = true;
        matchCount += jsMatches;
        if (confidence === 'low') {
          confidence = 'medium';
        }
      }
    }

    // Check CSS class patterns
    if (signature.patterns.css) {
      const cssMatches = signature.patterns.css.filter(pattern =>
        lowerHtml.includes(pattern.toLowerCase())
      ).length;
      if (cssMatches > 0) {
        detected = true;
        matchCount += cssMatches;
        if (confidence === 'low') {
          confidence = 'medium';
        }
      }
    }

    if (detected) {
      detectedApps.push({
        name: signature.name,
        displayName: signature.displayName,
        category: signature.category,
        confidence,
        description: signature.description,
        pricing: signature.pricing
      });
    }
  }

  // Categorize apps by category
  const appsByCategory: Record<string, DetectedShopifyApp[]> = {};
  for (const app of detectedApps) {
    if (!appsByCategory[app.category]) {
      appsByCategory[app.category] = [];
    }
    appsByCategory[app.category].push(app);
  }

  // Generate recommendations
  const recommendations = generateShopifyRecommendations(detectedApps, appsByCategory);

  console.log(`📊 Shopify app analysis complete: ${detectedApps.length} apps detected`);

  return {
    totalApps: detectedApps.length,
    appsByCategory,
    recommendations
  };
}

function generateShopifyRecommendations(
  apps: DetectedShopifyApp[],
  categoryMap: Record<string, DetectedShopifyApp[]>
): string[] {
  const recommendations: string[] = [];

  // SEO recommendations
  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push(
      '📈 Install Plug in SEO or Smart SEO for comprehensive SEO optimization',
      '🎯 Ensure meta titles and descriptions are optimized for all products'
    );
  }

  // Reviews recommendations
  if (!categoryMap.reviews || categoryMap.reviews.length === 0) {
    recommendations.push(
      '⭐ Add a review app like Judge.me or Loox to build social proof',
      '📸 Consider photo reviews to increase conversion rates'
    );
  }

  // Email marketing recommendations
  if (!categoryMap.marketing && !categoryMap.email) {
    recommendations.push(
      '📧 Install Klaviyo or Omnisend for email marketing automation',
      '💌 Set up abandoned cart recovery to recapture lost sales'
    );
  }

  // Analytics recommendations
  if (!categoryMap.analytics || categoryMap.analytics.length === 0) {
    recommendations.push(
      '📊 Add Lucky Orange or Hotjar for visitor behavior insights',
      '🎯 Use heatmaps to optimize your store layout'
    );
  }

  // Upsell recommendations
  if (!categoryMap.upsell || categoryMap.upsell.length === 0) {
    recommendations.push(
      '💰 Install ReConvert or Bold Upsell to increase average order value',
      '🛒 Add post-purchase upsells to maximize revenue'
    );
  }

  // Too many apps warning
  if (apps.length > 15) {
    recommendations.push(
      '⚠️ You have many apps installed - consider consolidating to improve site speed',
      '🚀 Review app performance impact and remove unused apps'
    );
  }

  return recommendations;
}

// Export function to check if site is Shopify
export function isShopify(html: string, headers: Record<string, string>): boolean {
  const lowerHtml = html.toLowerCase();

  return (
    lowerHtml.includes('cdn.shopify.com') ||
    lowerHtml.includes('shopify.com/s/files') ||
    lowerHtml.includes('shopify-analytics') ||
    lowerHtml.includes('shopifycloud.com') ||
    lowerHtml.includes('window.shopify') ||
    headers['x-shopify-stage']?.toLowerCase() !== undefined ||
    headers['x-shopid'] !== undefined
  );
}
