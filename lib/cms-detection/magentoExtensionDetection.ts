/**
 * Magento Extension Detection Service
 * Detects Magento extensions from HTML content
 */

export interface DetectedMagentoExtension {
  name: string;
  displayName: string;
  category: 'seo' | 'payment' | 'shipping' | 'analytics' | 'marketing' | 'security' | 'performance' | 'other';
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description?: string;
}

export interface MagentoExtensionAnalysis {
  totalExtensions: number;
  extensionsByCategory: Record<string, DetectedMagentoExtension[]>;
  recommendations: string[];
}

// Magento extension signatures
interface MagentoExtensionSignature {
  name: string;
  displayName: string;
  category: DetectedMagentoExtension['category'];
  patterns: {
    html?: string[];
    js?: string[];
    css?: string[];
    paths?: string[];
  };
  description: string;
}

const MAGENTO_EXTENSION_SIGNATURES: MagentoExtensionSignature[] = [
  // SEO Extensions
  {
    name: 'amasty_seo',
    displayName: 'Amasty SEO Toolkit',
    category: 'seo',
    patterns: {
      html: ['amasty', 'am-seo'],
      paths: ['/app/code/Amasty/Xseo/'],
    },
    description: 'Comprehensive SEO suite'
  },
  {
    name: 'mageworx_seo',
    displayName: 'MageWorx SEO Suite',
    category: 'seo',
    patterns: {
      html: ['mageworx'],
      paths: ['/app/code/MageWorx/Seo/'],
    },
    description: 'SEO optimization tools'
  },

  // Payment Extensions
  {
    name: 'stripe',
    displayName: 'Stripe Payment',
    category: 'payment',
    patterns: {
      html: ['stripe'],
      js: ['Stripe'],
      paths: ['/app/code/Magento/Stripe/'],
    },
    description: 'Stripe payment gateway'
  },
  {
    name: 'paypal',
    displayName: 'PayPal',
    category: 'payment',
    patterns: {
      html: ['paypal'],
      js: ['paypal'],
    },
    description: 'PayPal payment integration'
  },
  {
    name: 'braintree',
    displayName: 'Braintree',
    category: 'payment',
    patterns: {
      html: ['braintree'],
      js: ['braintree'],
    },
    description: 'Braintree payment gateway'
  },

  // Shipping Extensions
  {
    name: 'shipperhq',
    displayName: 'ShipperHQ',
    category: 'shipping',
    patterns: {
      html: ['shipperhq'],
      js: ['ShipperHQ'],
    },
    description: 'Advanced shipping rules'
  },

  // Analytics
  {
    name: 'google_analytics',
    displayName: 'Google Analytics',
    category: 'analytics',
    patterns: {
      html: ['google-analytics', 'googletagmanager'],
      js: ['ga(', 'gtag('],
    },
    description: 'Google Analytics integration'
  },

  // Marketing
  {
    name: 'dotdigital',
    displayName: 'Dotdigital',
    category: 'marketing',
    patterns: {
      html: ['dotdigital', 'dotmailer'],
      js: ['dmPt'],
    },
    description: 'Email marketing automation'
  },
  {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    category: 'marketing',
    patterns: {
      html: ['mailchimp'],
      js: ['mailchimp'],
    },
    description: 'Mailchimp integration'
  },
];

export function detectMagentoExtensions(html: string, headers: Record<string, string>): MagentoExtensionAnalysis {
  const detectedExtensions: DetectedMagentoExtension[] = [];
  const lowerHtml = html.toLowerCase();

  console.log('🔍 Analyzing Magento extensions...');

  for (const signature of MAGENTO_EXTENSION_SIGNATURES) {
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
      detectedExtensions.push({
        name: signature.name,
        displayName: signature.displayName,
        category: signature.category,
        confidence,
        description: signature.description
      });
    }
  }

  const extensionsByCategory: Record<string, DetectedMagentoExtension[]> = {};
  for (const ext of detectedExtensions) {
    if (!extensionsByCategory[ext.category]) {
      extensionsByCategory[ext.category] = [];
    }
    extensionsByCategory[ext.category].push(ext);
  }

  const recommendations = generateMagentoRecommendations(detectedExtensions, extensionsByCategory);

  console.log(`📊 Magento extension analysis complete: ${detectedExtensions.length} extensions detected`);

  return {
    totalExtensions: detectedExtensions.length,
    extensionsByCategory,
    recommendations
  };
}

function generateMagentoRecommendations(
  extensions: DetectedMagentoExtension[],
  categoryMap: Record<string, DetectedMagentoExtension[]>
): string[] {
  const recommendations: string[] = [];

  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push('📈 Install Amasty or MageWorx SEO Suite for better search visibility');
  }

  if (!categoryMap.payment || categoryMap.payment.length < 2) {
    recommendations.push('💳 Add multiple payment gateways (Stripe, PayPal, Braintree) for customer convenience');
  }

  if (!categoryMap.marketing || categoryMap.marketing.length === 0) {
    recommendations.push('📧 Install email marketing extension like Dotdigital or Mailchimp');
  }

  return recommendations;
}

export function isMagento(html: string, headers: Record<string, string>): boolean {
  const lowerHtml = html.toLowerCase();
  return (
    lowerHtml.includes('magento') ||
    lowerHtml.includes('mage/cookies') ||
    lowerHtml.includes('magento_') ||
    headers['x-magento-cache-debug'] !== undefined
  );
}
