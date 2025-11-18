/**
 * PrestaShop Module Detection Service
 * Detects PrestaShop modules from HTML content
 */

export interface DetectedPrestashopModule {
  name: string;
  displayName: string;
  category: 'seo' | 'payment' | 'analytics' | 'marketing' | 'social' | 'shipping' | 'other';
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description?: string;
}

export interface PrestashopModuleAnalysis {
  totalModules: number;
  modulesByCategory: Record<string, DetectedPrestashopModule[]>;
  recommendations: string[];
}

// PrestaShop module signatures
interface PrestashopModuleSignature {
  name: string;
  displayName: string;
  category: DetectedPrestashopModule['category'];
  patterns: {
    html?: string[];
    js?: string[];
    css?: string[];
    paths?: string[];
  };
  description: string;
}

const PRESTASHOP_MODULE_SIGNATURES: PrestashopModuleSignature[] = [
  // SEO Modules
  {
    name: 'seo_expert',
    displayName: 'SEO Expert',
    category: 'seo',
    patterns: {
      html: ['seo-expert', 'seoexpert'],
      paths: ['/modules/seoexpert/'],
    },
    description: 'SEO optimization module'
  },
  {
    name: 'pretty_urls',
    displayName: 'Pretty URLs',
    category: 'seo',
    patterns: {
      html: ['pretty-urls'],
      paths: ['/modules/prettyurls/'],
    },
    description: 'Clean URL generation'
  },

  // Payment Modules
  {
    name: 'stripe_official',
    displayName: 'Stripe Official',
    category: 'payment',
    patterns: {
      html: ['stripe'],
      js: ['Stripe'],
      paths: ['/modules/stripe_official/'],
    },
    description: 'Stripe payment gateway'
  },
  {
    name: 'paypal_official',
    displayName: 'PayPal Official',
    category: 'payment',
    patterns: {
      html: ['paypal'],
      paths: ['/modules/paypal/'],
    },
    description: 'Official PayPal integration'
  },

  // Analytics
  {
    name: 'ganalytics',
    displayName: 'Google Analytics Enhanced',
    category: 'analytics',
    patterns: {
      html: ['ganalytics', 'google-analytics'],
      js: ['ga(', 'gtag('],
      paths: ['/modules/ganalytics/'],
    },
    description: 'Google Analytics tracking'
  },

  // Marketing
  {
    name: 'newsletter',
    displayName: 'Newsletter',
    category: 'marketing',
    patterns: {
      paths: ['/modules/ps_emailsubscription/'],
      html: ['newsletter'],
    },
    description: 'Newsletter subscription module'
  },
  {
    name: 'mailchimp_module',
    displayName: 'Mailchimp Sync',
    category: 'marketing',
    patterns: {
      html: ['mailchimp'],
      paths: ['/modules/mailchimp/'],
    },
    description: 'Mailchimp integration'
  },

  // Social Media
  {
    name: 'social_media_share',
    displayName: 'Social Media Share',
    category: 'social',
    patterns: {
      html: ['social-share', 'social-media'],
      paths: ['/modules/ps_sharebuttons/'],
    },
    description: 'Social sharing buttons'
  },
  {
    name: 'facebook_pixel',
    displayName: 'Facebook Pixel',
    category: 'social',
    patterns: {
      html: ['facebook-pixel', 'fbevents'],
      js: ['fbq('],
    },
    description: 'Facebook pixel tracking'
  },
];

export function detectPrestashopModules(html: string, headers: Record<string, string>): PrestashopModuleAnalysis {
  const detectedModules: DetectedPrestashopModule[] = [];
  const lowerHtml = html.toLowerCase();

  console.log('🔍 Analyzing PrestaShop modules...');

  for (const signature of PRESTASHOP_MODULE_SIGNATURES) {
    let detected = false;
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (signature.patterns.paths) {
      for (const path of signature.patterns.paths) {
        if (lowerHtml.includes(path.toLowerCase())) {
          detected = true;
          confidence = 'high';
          break;
        }
      }
    }

    if (!detected && signature.patterns.html) {
      const htmlMatches = signature.patterns.html.filter(p => lowerHtml.includes(p.toLowerCase())).length;
      if (htmlMatches > 0) {
        detected = true;
        confidence = 'medium';
      }
    }

    if (!detected && signature.patterns.js) {
      const jsMatches = signature.patterns.js.filter(p => html.includes(p)).length;
      if (jsMatches > 0) {
        detected = true;
        confidence = 'low';
      }
    }

    if (detected) {
      detectedModules.push({
        name: signature.name,
        displayName: signature.displayName,
        category: signature.category,
        confidence,
        description: signature.description
      });
    }
  }

  const modulesByCategory: Record<string, DetectedPrestashopModule[]> = {};
  for (const mod of detectedModules) {
    if (!modulesByCategory[mod.category]) {
      modulesByCategory[mod.category] = [];
    }
    modulesByCategory[mod.category].push(mod);
  }

  const recommendations = generatePrestashopRecommendations(detectedModules, modulesByCategory);

  console.log(`📊 PrestaShop module analysis complete: ${detectedModules.length} modules detected`);

  return {
    totalModules: detectedModules.length,
    modulesByCategory,
    recommendations
  };
}

function generatePrestashopRecommendations(
  modules: DetectedPrestashopModule[],
  categoryMap: Record<string, DetectedPrestashopModule[]>
): string[] {
  const recommendations: string[] = [];

  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push('📈 Install SEO Expert module for better search visibility');
  }

  if (!categoryMap.payment || categoryMap.payment.length < 2) {
    recommendations.push('💳 Add multiple payment options (Stripe, PayPal) for customers');
  }

  if (!categoryMap.analytics || categoryMap.analytics.length === 0) {
    recommendations.push('📊 Install Google Analytics Enhanced for visitor tracking');
  }

  if (!categoryMap.social || categoryMap.social.length === 0) {
    recommendations.push('📱 Add social media sharing buttons to increase reach');
  }

  return recommendations;
}

export function isPrestashop(html: string, headers: Record<string, string>): boolean {
  const lowerHtml = html.toLowerCase();
  return (
    lowerHtml.includes('prestashop') ||
    lowerHtml.includes('/modules/') && lowerHtml.includes('prestashop.urls') ||
    lowerHtml.includes('prestashop.page') ||
    headers['x-powered-by']?.toLowerCase().includes('prestashop')
  );
}
