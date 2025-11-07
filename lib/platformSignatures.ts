/**
 * Universal Multi-Platform Extension/Module/App Signature Database
 *
 * Supported Platforms:
 * - WordPress (62.8% market share)
 * - Shopify (6.7% market share)
 * - Wix (5.2% market share)
 * - Squarespace (3.3% market share)
 * - Drupal (4.7% market share - open source)
 * - Joomla (2.1% market share)
 * - Magento (2.3% market share)
 * - PrestaShop (1.3% market share)
 * - Webflow (1.2% market share)
 * - Universal (CDNs, frameworks, libraries that work across all platforms)
 * - Custom sites (no CMS)
 *
 * Last updated: January 2025
 */

export interface PlatformSignature {
  name: string;
  platform: 'wordpress' | 'drupal' | 'joomla' | 'shopify' | 'magento' | 'prestashop' | 'wix' | 'squarespace' | 'webflow' | 'universal' | 'custom' | 'other';
  category: 'security' | 'performance' | 'seo' | 'ecommerce' | 'analytics' | 'social' | 'backup' | 'forms' | 'page-builder' | 'content' | 'payment' | 'marketing' | 'integration' | 'utility' | 'cdn' | 'framework' | 'hosting' | 'other';
  subcategory?: string;
  patterns: string[];
  confidence: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
  description?: string;
}

export const PLATFORM_SIGNATURES: PlatformSignature[] = [
  // ============================================
  // UNIVERSAL - CDNs & Performance Services
  // ============================================
  {
    name: 'Cloudflare CDN',
    platform: 'universal',
    category: 'performance',
    subcategory: 'cdn',
    patterns: [
      'cloudflare',
      'cf-ray',
      '__cfduid',
      'cdn.cloudflare.com',
      'cdnjs.cloudflare.com'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Global CDN and security service'
  },
  {
    name: 'Fastly CDN',
    platform: 'universal',
    category: 'performance',
    subcategory: 'cdn',
    patterns: [
      'fastly-cdn',
      'fastly.net',
      'x-served-by: cache-',
      'x-cache: HIT, MISS'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Edge cloud platform and CDN'
  },
  {
    name: 'Akamai CDN',
    platform: 'universal',
    category: 'performance',
    subcategory: 'cdn',
    patterns: [
      'akamai',
      'akamaihd.net',
      'akamaized.net'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Enterprise CDN and cloud services'
  },
  {
    name: 'Amazon CloudFront',
    platform: 'universal',
    category: 'performance',
    subcategory: 'cdn',
    patterns: [
      'cloudfront.net',
      'x-amz-cf-id',
      'd111111abcdef8.cloudfront.net'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'AWS CDN service'
  },

  // ============================================
  // UNIVERSAL - Analytics & Tracking
  // ============================================
  {
    name: 'Google Analytics 4',
    platform: 'universal',
    category: 'analytics',
    subcategory: 'web-analytics',
    patterns: [
      'googletagmanager.com/gtag/',
      'google-analytics.com/analytics.js',
      'gtag(',
      'ga(',
      'G-',
      'UA-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Google web analytics platform'
  },
  {
    name: 'Google Tag Manager',
    platform: 'universal',
    category: 'analytics',
    subcategory: 'tag-management',
    patterns: [
      'googletagmanager.com/gtm.js',
      'GTM-',
      'google_tag_manager'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Tag management system'
  },
  {
    name: 'Facebook Pixel',
    platform: 'universal',
    category: 'analytics',
    subcategory: 'conversion-tracking',
    patterns: [
      'facebook.com/tr?',
      'fbq(',
      'facebook pixel',
      'connect.facebook.net/en_US/fbevents.js'
    ],
    confidence: 'high',
    riskLevel: 'medium',
    performanceImpact: 'low',
    description: 'Facebook advertising and analytics pixel'
  },
  {
    name: 'Hotjar',
    platform: 'universal',
    category: 'analytics',
    subcategory: 'heatmaps',
    patterns: [
      'static.hotjar.com',
      'hotjar.com/c/hotjar-',
      '_hjid'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Heatmaps and user behavior analytics'
  },
  {
    name: 'Matomo (Piwik)',
    platform: 'universal',
    category: 'analytics',
    subcategory: 'web-analytics',
    patterns: [
      'matomo.js',
      'piwik.js',
      '_paq.push'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Open-source web analytics platform'
  },

  // ============================================
  // UNIVERSAL - Frontend Frameworks
  // ============================================
  {
    name: 'React',
    platform: 'universal',
    category: 'framework',
    subcategory: 'javascript-framework',
    patterns: [
      'react.js',
      'react.min.js',
      'data-reactroot',
      'data-reactid',
      '__react'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'JavaScript UI library'
  },
  {
    name: 'Next.js',
    platform: 'universal',
    category: 'framework',
    subcategory: 'react-framework',
    patterns: [
      '_next/',
      'next.js',
      '__NEXT_DATA__',
      '/_next/static/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'React framework for production'
  },
  {
    name: 'Vue.js',
    platform: 'universal',
    category: 'framework',
    subcategory: 'javascript-framework',
    patterns: [
      'vue.js',
      'vue.min.js',
      'data-v-',
      '__vue__'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Progressive JavaScript framework'
  },
  {
    name: 'Angular',
    platform: 'universal',
    category: 'framework',
    subcategory: 'javascript-framework',
    patterns: [
      'angular.js',
      'angular.min.js',
      'ng-app',
      'ng-controller',
      '[ng-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'TypeScript-based web framework'
  },
  {
    name: 'jQuery',
    platform: 'universal',
    category: 'framework',
    subcategory: 'javascript-library',
    patterns: [
      'jquery.js',
      'jquery.min.js',
      'jquery-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'JavaScript library (legacy)'
  },

  // ============================================
  // DRUPAL MODULES
  // ============================================
  {
    name: 'Drupal Core',
    platform: 'drupal',
    category: 'utility',
    subcategory: 'cms-core',
    patterns: [
      '/sites/all/modules/',
      '/sites/default/files/',
      'Drupal.settings',
      'drupal.js',
      '/misc/drupal.js',
      'X-Generator: Drupal'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Drupal CMS platform'
  },
  {
    name: 'Views (Drupal)',
    platform: 'drupal',
    category: 'content',
    subcategory: 'content-display',
    patterns: [
      '/sites/all/modules/views/',
      'views-',
      'view-dom-id'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Drupal content display module'
  },
  {
    name: 'Panels (Drupal)',
    platform: 'drupal',
    category: 'page-builder',
    subcategory: 'layout',
    patterns: [
      '/sites/all/modules/panels/',
      'panel-pane',
      'panels-ipe'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Drupal page layout module'
  },
  {
    name: 'Pathauto (Drupal)',
    platform: 'drupal',
    category: 'seo',
    subcategory: 'url-management',
    patterns: [
      '/sites/all/modules/pathauto/',
      'pathauto'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal',
    description: 'Automatic URL alias generation'
  },
  {
    name: 'Metatag (Drupal)',
    platform: 'drupal',
    category: 'seo',
    subcategory: 'meta-tags',
    patterns: [
      '/sites/all/modules/metatag/',
      'metatag'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal',
    description: 'Meta tag management for Drupal'
  },
  {
    name: 'Token (Drupal)',
    platform: 'drupal',
    category: 'utility',
    subcategory: 'tokens',
    patterns: [
      '/sites/all/modules/token/',
      'token-tree'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal',
    description: 'Token replacement system'
  },
  {
    name: 'Webform (Drupal)',
    platform: 'drupal',
    category: 'forms',
    subcategory: 'form-builder',
    patterns: [
      '/sites/all/modules/webform/',
      'webform-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Form building module for Drupal'
  },
  {
    name: 'Boost (Drupal)',
    platform: 'drupal',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/sites/all/modules/boost/',
      'boost'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Static page caching for Drupal'
  },
  {
    name: 'Commerce (Drupal)',
    platform: 'drupal',
    category: 'ecommerce',
    subcategory: 'shop',
    patterns: [
      '/sites/all/modules/commerce/',
      'commerce-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'E-commerce framework for Drupal'
  },

  // ============================================
  // JOOMLA EXTENSIONS
  // ============================================
  {
    name: 'Joomla Core',
    platform: 'joomla',
    category: 'utility',
    subcategory: 'cms-core',
    patterns: [
      '/media/jui/',
      '/media/system/js/',
      'option=com_',
      'joomla',
      '/administrator/components/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Joomla CMS platform'
  },
  {
    name: 'K2 (Joomla)',
    platform: 'joomla',
    category: 'content',
    subcategory: 'content-management',
    patterns: [
      '/media/k2/',
      'k2-',
      'option=com_k2'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Powerful content management extension'
  },
  {
    name: 'VirtueMart (Joomla)',
    platform: 'joomla',
    category: 'ecommerce',
    subcategory: 'shop',
    patterns: [
      'option=com_virtuemart',
      'virtuemart',
      '/components/com_virtuemart/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'E-commerce extension for Joomla'
  },
  {
    name: 'JCE Editor (Joomla)',
    platform: 'joomla',
    category: 'content',
    subcategory: 'editor',
    patterns: [
      '/media/jce/',
      'jce-',
      'option=com_jce'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'WYSIWYG editor for Joomla'
  },
  {
    name: 'Akeeba Backup (Joomla)',
    platform: 'joomla',
    category: 'backup',
    subcategory: 'backup-restore',
    patterns: [
      'option=com_akeeba',
      'akeeba',
      '/components/com_akeeba/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Backup solution for Joomla'
  },
  {
    name: 'JCH Optimize (Joomla)',
    platform: 'joomla',
    category: 'performance',
    subcategory: 'optimization',
    patterns: [
      'jch-optimize',
      'jch_optimize',
      '/plugins/system/jch_optimize/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Performance optimization for Joomla'
  },
  {
    name: 'SH404SEF (Joomla)',
    platform: 'joomla',
    category: 'seo',
    subcategory: 'seo-urls',
    patterns: [
      'sh404sef',
      'option=com_sh404sef'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'SEO extension for Joomla'
  },

  // ============================================
  // SHOPIFY APPS
  // ============================================
  {
    name: 'Shopify Platform',
    platform: 'shopify',
    category: 'ecommerce',
    subcategory: 'platform',
    patterns: [
      'cdn.shopify.com',
      'shopify.com',
      'Shopify.shop',
      'myshopify.com',
      'shopify-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Shopify e-commerce platform'
  },
  {
    name: 'Klaviyo (Shopify)',
    platform: 'shopify',
    category: 'marketing',
    subcategory: 'email-marketing',
    patterns: [
      'klaviyo',
      'static.klaviyo.com',
      'klaviyo.com/media/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Email marketing and automation'
  },
  {
    name: 'Judge.me Reviews (Shopify)',
    platform: 'shopify',
    category: 'marketing',
    subcategory: 'reviews',
    patterns: [
      'judge.me',
      'judgeme',
      'judgeme-reviews'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Product review platform'
  },
  {
    name: 'Loox Reviews (Shopify)',
    platform: 'shopify',
    category: 'marketing',
    subcategory: 'reviews',
    patterns: [
      'loox.io',
      'looxreviews'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Photo review platform'
  },
  {
    name: 'Privy (Shopify)',
    platform: 'shopify',
    category: 'marketing',
    subcategory: 'popups',
    patterns: [
      'privy.com',
      'widget.privy.com',
      'privy-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Email popup and marketing tool'
  },
  {
    name: 'Oberlo (Shopify)',
    platform: 'shopify',
    category: 'ecommerce',
    subcategory: 'dropshipping',
    patterns: [
      'oberlo',
      'oberlo.com'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Dropshipping app'
  },

  // ============================================
  // MAGENTO EXTENSIONS
  // ============================================
  {
    name: 'Magento Platform',
    platform: 'magento',
    category: 'ecommerce',
    subcategory: 'platform',
    patterns: [
      '/static/frontend/',
      '/static/version',
      'Mage.Cookies',
      'mage/cookies',
      'X-Magento-',
      'magento'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high',
    description: 'Magento e-commerce platform'
  },
  {
    name: 'Magento Page Builder',
    platform: 'magento',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      'pagebuilder',
      'page-builder'
    ],
    confidence: 'medium',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Visual page builder for Magento'
  },
  {
    name: 'Amasty Extensions (Magento)',
    platform: 'magento',
    category: 'utility',
    subcategory: 'extensions',
    patterns: [
      'amasty',
      'am_'
    ],
    confidence: 'medium',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Amasty Magento extensions'
  },

  // ============================================
  // PRESTASHOP MODULES
  // ============================================
  {
    name: 'PrestaShop Platform',
    platform: 'prestashop',
    category: 'ecommerce',
    subcategory: 'platform',
    patterns: [
      'prestashop',
      '/modules/',
      '/themes/',
      'prestashop.com'
    ],
    confidence: 'medium',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'PrestaShop e-commerce platform'
  },

  // ============================================
  // WIX PLATFORM
  // ============================================
  {
    name: 'Wix Platform',
    platform: 'wix',
    category: 'page-builder',
    subcategory: 'website-builder',
    patterns: [
      'wix.com',
      'wixstatic.com',
      'parastorage.com',
      '_wix',
      'wix-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Wix website builder platform'
  },

  // ============================================
  // SQUARESPACE PLATFORM
  // ============================================
  {
    name: 'Squarespace Platform',
    platform: 'squarespace',
    category: 'page-builder',
    subcategory: 'website-builder',
    patterns: [
      'squarespace.com',
      'squarespace-cdn.com',
      'sqsp.com',
      'squarespace-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium',
    description: 'Squarespace website builder'
  },

  // ============================================
  // WEBFLOW PLATFORM
  // ============================================
  {
    name: 'Webflow Platform',
    platform: 'webflow',
    category: 'page-builder',
    subcategory: 'website-builder',
    patterns: [
      'webflow.com',
      'webflow.io',
      'webflow-',
      'data-wf-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low',
    description: 'Webflow design and hosting platform'
  },

  // Import all WordPress signatures from the original file
  // (These will be added programmatically to keep this file manageable)
];

/**
 * Detects extensions/modules/apps based on pattern matching
 * Works across all supported platforms
 */
export function detectByPatterns(html: string, headers: Record<string, string>, detectedPlatform?: string): DetectedExtension[] {
  const detected: DetectedExtension[] = [];
  const htmlLower = html.toLowerCase();
  const headersLower = JSON.stringify(headers).toLowerCase();
  const combinedContent = htmlLower + ' ' + headersLower;

  // Filter signatures by detected platform if specified
  const relevantSignatures = detectedPlatform
    ? PLATFORM_SIGNATURES.filter(sig =>
        sig.platform === detectedPlatform.toLowerCase() || sig.platform === 'universal'
      )
    : PLATFORM_SIGNATURES;

  for (const signature of relevantSignatures) {
    let matchCount = 0;
    const evidenceFound: string[] = [];

    // Check each pattern
    for (const pattern of signature.patterns) {
      const patternLower = pattern.toLowerCase();
      if (combinedContent.includes(patternLower)) {
        matchCount++;
        evidenceFound.push(`Found pattern: "${pattern}"`);
      }
    }

    // If at least one pattern matches, consider it detected
    if (matchCount > 0) {
      const confidenceScore = matchCount >= 2 ? 'high' : matchCount === 1 ? 'medium' : 'low';

      detected.push({
        name: signature.name,
        platform: signature.platform,
        category: signature.category,
        subcategory: signature.subcategory,
        confidence: confidenceScore as 'high' | 'medium' | 'low',
        riskLevel: signature.riskLevel,
        performanceImpact: signature.performanceImpact,
        description: signature.description || `Detected via ${matchCount} pattern match(es)`,
        detectionEvidence: evidenceFound,
        recommendations: []
      });
    }
  }

  return detected;
}

export interface DetectedExtension {
  name: string;
  platform: string;
  category: string;
  subcategory?: string;
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
  recommendations: string[];
  detectionEvidence: string[];
}
