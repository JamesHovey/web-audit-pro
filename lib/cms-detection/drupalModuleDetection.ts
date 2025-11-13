/**
 * Drupal Module Detection Service
 * Detects Drupal modules (equivalent to WordPress plugins) from HTML content
 */

export interface DetectedDrupalModule {
  name: string;
  displayName: string;
  category: 'seo' | 'performance' | 'security' | 'forms' | 'ecommerce' | 'admin' | 'social' | 'media' | 'analytics' | 'other';
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description?: string;
  security?: {
    hasKnownVulnerabilities: boolean;
    severity?: 'critical' | 'high' | 'medium' | 'low';
  };
}

export interface DrupalModuleAnalysis {
  totalModules: number;
  modulesByCategory: Record<string, DetectedDrupalModule[]>;
  securityRisks: DetectedDrupalModule[];
  performanceImpact: DetectedDrupalModule[];
  recommendations: string[];
}

// Drupal module signatures with detection patterns
interface DrupalModuleSignature {
  name: string;
  displayName: string;
  category: DetectedDrupalModule['category'];
  patterns: {
    html?: string[];      // HTML content patterns
    paths?: string[];     // File path patterns
    js?: string[];        // JavaScript variable patterns
    css?: string[];       // CSS class patterns
  };
  description: string;
  performanceImpact?: 'high' | 'medium' | 'low';
  securityConcerns?: boolean;
}

const DRUPAL_MODULE_SIGNATURES: DrupalModuleSignature[] = [
  // SEO Modules
  {
    name: 'metatag',
    displayName: 'Metatag',
    category: 'seo',
    patterns: {
      paths: ['/modules/contrib/metatag/', '/modules/metatag/'],
      html: ['<meta name="generator" content="drupal', 'metatag-'],
    },
    description: 'Manages meta tags for SEO optimization'
  },
  {
    name: 'pathauto',
    displayName: 'Pathauto',
    category: 'seo',
    patterns: {
      paths: ['/modules/contrib/pathauto/', '/modules/pathauto/'],
    },
    description: 'Automatically generates URL aliases'
  },
  {
    name: 'redirect',
    displayName: 'Redirect',
    category: 'seo',
    patterns: {
      paths: ['/modules/contrib/redirect/', '/modules/redirect/'],
    },
    description: 'Manages URL redirects for broken links'
  },
  {
    name: 'xmlsitemap',
    displayName: 'XML Sitemap',
    category: 'seo',
    patterns: {
      paths: ['/modules/contrib/xmlsitemap/', '/modules/xmlsitemap/'],
      html: ['<link rel="alternate" type="application/rss+xml" title="Sitemap'],
    },
    description: 'Generates XML sitemaps for search engines'
  },
  {
    name: 'seo_checklist',
    displayName: 'SEO Checklist',
    category: 'seo',
    patterns: {
      paths: ['/modules/contrib/seo_checklist/', '/modules/seo_checklist/'],
    },
    description: 'Provides SEO optimization checklist and tools'
  },

  // Performance Modules
  {
    name: 'views',
    displayName: 'Views',
    category: 'performance',
    patterns: {
      paths: ['/modules/contrib/views/', '/core/modules/views/'],
      html: ['view-id-', 'views-field-', 'views-row'],
      css: ['view-content', 'views-field'],
    },
    description: 'Creates custom lists, grids and displays',
    performanceImpact: 'high'
  },
  {
    name: 'panels',
    displayName: 'Panels',
    category: 'performance',
    patterns: {
      paths: ['/modules/contrib/panels/', '/modules/panels/'],
      html: ['panels-ipe-', 'panel-pane'],
      css: ['panel-pane', 'panels-ipe'],
    },
    description: 'Advanced layout management system',
    performanceImpact: 'medium'
  },
  {
    name: 'advagg',
    displayName: 'Advanced CSS/JS Aggregation',
    category: 'performance',
    patterns: {
      paths: ['/modules/contrib/advagg/', '/modules/advagg/'],
      html: ['advagg_css', 'advagg_js'],
    },
    description: 'Optimizes CSS and JavaScript aggregation',
    performanceImpact: 'low'
  },
  {
    name: 'boost',
    displayName: 'Boost',
    category: 'performance',
    patterns: {
      paths: ['/modules/contrib/boost/', '/modules/boost/'],
    },
    description: 'Static page caching for anonymous users',
    performanceImpact: 'low'
  },

  // Forms Modules
  {
    name: 'webform',
    displayName: 'Webform',
    category: 'forms',
    patterns: {
      paths: ['/modules/contrib/webform/', '/modules/webform/'],
      html: ['webform-', 'data-drupal-selector="edit-webform'],
      css: ['webform-submission-form'],
    },
    description: 'Advanced form building and management'
  },
  {
    name: 'contact',
    displayName: 'Contact Form',
    category: 'forms',
    patterns: {
      paths: ['/core/modules/contact/', '/modules/contact/'],
      html: ['contact-form', 'contact-message-'],
    },
    description: 'Site-wide and personal contact forms'
  },

  // Security Modules
  {
    name: 'seckit',
    displayName: 'Security Kit',
    category: 'security',
    patterns: {
      paths: ['/modules/contrib/seckit/', '/modules/seckit/'],
    },
    description: 'Hardens Drupal security',
    securityConcerns: false
  },
  {
    name: 'shield',
    displayName: 'Shield',
    category: 'security',
    patterns: {
      paths: ['/modules/contrib/shield/', '/modules/shield/'],
    },
    description: 'HTTP authentication for site protection',
    securityConcerns: false
  },
  {
    name: 'captcha',
    displayName: 'CAPTCHA',
    category: 'security',
    patterns: {
      paths: ['/modules/contrib/captcha/', '/modules/captcha/'],
      html: ['captcha-', 'g-recaptcha'],
    },
    description: 'Prevents automated spam submissions',
    securityConcerns: false
  },
  {
    name: 'recaptcha',
    displayName: 'reCAPTCHA',
    category: 'security',
    patterns: {
      paths: ['/modules/contrib/recaptcha/', '/modules/recaptcha/'],
      html: ['g-recaptcha', 'recaptcha'],
    },
    description: 'Google reCAPTCHA integration',
    securityConcerns: false
  },

  // E-commerce Modules
  {
    name: 'commerce',
    displayName: 'Drupal Commerce',
    category: 'ecommerce',
    patterns: {
      paths: ['/modules/contrib/commerce/', '/modules/commerce/'],
      html: ['commerce-product', 'commerce-cart'],
      css: ['commerce-product', 'commerce-cart-form'],
    },
    description: 'Complete e-commerce solution'
  },
  {
    name: 'ubercart',
    displayName: 'Ubercart',
    category: 'ecommerce',
    patterns: {
      paths: ['/modules/contrib/ubercart/', '/modules/ubercart/'],
      html: ['ubercart-', 'uc-product'],
    },
    description: 'E-commerce platform for Drupal'
  },

  // Admin Modules
  {
    name: 'admin_toolbar',
    displayName: 'Admin Toolbar',
    category: 'admin',
    patterns: {
      paths: ['/modules/contrib/admin_toolbar/', '/modules/admin_toolbar/'],
      css: ['admin-toolbar'],
    },
    description: 'Enhanced admin toolbar with dropdown menus'
  },
  {
    name: 'module_filter',
    displayName: 'Module Filter',
    category: 'admin',
    patterns: {
      paths: ['/modules/contrib/module_filter/', '/modules/module_filter/'],
    },
    description: 'Improved module administration interface'
  },
  {
    name: 'devel',
    displayName: 'Devel',
    category: 'admin',
    patterns: {
      paths: ['/modules/contrib/devel/', '/modules/devel/'],
      html: ['devel-', 'krumo-'],
    },
    description: 'Development and debugging tools',
    securityConcerns: true // Should not be enabled on production
  },

  // Social Media Modules
  {
    name: 'addtoany',
    displayName: 'AddToAny Share Buttons',
    category: 'social',
    patterns: {
      paths: ['/modules/contrib/addtoany/', '/modules/addtoany/'],
      html: ['addtoany', 'a2a_dd'],
    },
    description: 'Social sharing buttons'
  },
  {
    name: 'social_media',
    displayName: 'Social Media',
    category: 'social',
    patterns: {
      paths: ['/modules/contrib/social_media/', '/modules/social_media/'],
    },
    description: 'Social media integration and sharing'
  },

  // Media Modules
  {
    name: 'media',
    displayName: 'Media',
    category: 'media',
    patterns: {
      paths: ['/core/modules/media/', '/modules/contrib/media/', '/modules/media/'],
      html: ['media--type-', 'media-'],
    },
    description: 'Media management and embedding'
  },
  {
    name: 'image',
    displayName: 'Image',
    category: 'media',
    patterns: {
      paths: ['/core/modules/image/', '/modules/image/'],
    },
    description: 'Image handling and manipulation'
  },

  // Analytics Modules
  {
    name: 'google_analytics',
    displayName: 'Google Analytics',
    category: 'analytics',
    patterns: {
      paths: ['/modules/contrib/google_analytics/', '/modules/google_analytics/'],
      html: ['googletagmanager', 'google-analytics'],
      js: ['ga(', 'gtag('],
    },
    description: 'Google Analytics integration'
  },
  {
    name: 'matomo',
    displayName: 'Matomo Analytics',
    category: 'analytics',
    patterns: {
      paths: ['/modules/contrib/matomo/', '/modules/matomo/'],
      html: ['_paq.push'],
    },
    description: 'Matomo (Piwik) analytics integration'
  },
];

export function detectDrupalModules(html: string, headers: Record<string, string>): DrupalModuleAnalysis {
  const detectedModules: DetectedDrupalModule[] = [];
  const lowerHtml = html.toLowerCase();

  console.log('🔍 Analyzing Drupal modules...');

  // Detect modules based on signatures
  for (const signature of DRUPAL_MODULE_SIGNATURES) {
    let detected = false;
    let confidence: 'high' | 'medium' | 'low' = 'low';

    // Check path patterns (highest confidence)
    if (signature.patterns.paths) {
      for (const path of signature.patterns.paths) {
        if (lowerHtml.includes(path.toLowerCase())) {
          detected = true;
          confidence = 'high';
          break;
        }
      }
    }

    // Check HTML patterns
    if (!detected && signature.patterns.html) {
      const htmlMatches = signature.patterns.html.filter(pattern =>
        lowerHtml.includes(pattern.toLowerCase())
      ).length;
      if (htmlMatches >= Math.min(2, signature.patterns.html.length)) {
        detected = true;
        confidence = 'medium';
      }
    }

    // Check CSS class patterns
    if (!detected && signature.patterns.css) {
      const cssMatches = signature.patterns.css.filter(pattern =>
        lowerHtml.includes(pattern.toLowerCase())
      ).length;
      if (cssMatches >= 1) {
        detected = true;
        confidence = 'medium';
      }
    }

    // Check JavaScript patterns
    if (!detected && signature.patterns.js) {
      const jsMatches = signature.patterns.js.filter(pattern =>
        html.includes(pattern)
      ).length;
      if (jsMatches >= 1) {
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
        description: signature.description,
        security: signature.securityConcerns ? {
          hasKnownVulnerabilities: false, // Would need to check CVE database
          severity: signature.securityConcerns ? 'medium' : undefined
        } : undefined
      });
    }
  }

  // Categorize modules
  const modulesByCategory: Record<string, DetectedDrupalModule[]> = {};
  for (const module of detectedModules) {
    if (!modulesByCategory[module.category]) {
      modulesByCategory[module.category] = [];
    }
    modulesByCategory[module.category].push(module);
  }

  // Identify security risks
  const securityRisks = detectedModules.filter(m =>
    m.security?.hasKnownVulnerabilities ||
    (m.name === 'devel' && m.confidence === 'high') // Devel should not be on production
  );

  // Identify performance heavy modules
  const performanceImpact = detectedModules.filter(m => {
    const sig = DRUPAL_MODULE_SIGNATURES.find(s => s.name === m.name);
    return sig?.performanceImpact === 'high' || sig?.performanceImpact === 'medium';
  });

  // Generate recommendations
  const recommendations = generateDrupalRecommendations(detectedModules, modulesByCategory);

  console.log(`📊 Drupal module analysis complete: ${detectedModules.length} modules detected`);

  return {
    totalModules: detectedModules.length,
    modulesByCategory,
    securityRisks,
    performanceImpact,
    recommendations
  };
}

function generateDrupalRecommendations(
  modules: DetectedDrupalModule[],
  categoryMap: Record<string, DetectedDrupalModule[]>
): string[] {
  const recommendations: string[] = [];

  // SEO recommendations
  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push(
      '📈 Install Metatag module to improve SEO with custom meta tags',
      '🔗 Add Pathauto module for automatic URL alias generation',
      '🗺️ Install XML Sitemap module to help search engines index your site'
    );
  }

  // Security recommendations
  if (!categoryMap.security || categoryMap.security.length === 0) {
    recommendations.push(
      '🔒 Install Security Kit module to harden your Drupal site',
      '🛡️ Add CAPTCHA or reCAPTCHA module to prevent spam'
    );
  }

  // Check for Devel module on production
  const develModule = modules.find(m => m.name === 'devel');
  if (develModule && develModule.confidence === 'high') {
    recommendations.push(
      '⚠️ CRITICAL: Devel module detected - should be disabled on production sites'
    );
  }

  // Performance recommendations
  if (!categoryMap.performance || !modules.some(m => m.name === 'advagg')) {
    recommendations.push(
      '⚡ Install Advanced CSS/JS Aggregation module to optimize asset delivery'
    );
  }

  // Forms recommendations
  if (!categoryMap.forms || categoryMap.forms.length === 0) {
    recommendations.push(
      '📝 Install Webform module for advanced form building capabilities'
    );
  }

  return recommendations;
}

// Export function to check if site is Drupal
export function isDrupal(html: string, headers: Record<string, string>): boolean {
  const lowerHtml = html.toLowerCase();

  return (
    lowerHtml.includes('drupal') ||
    lowerHtml.includes('/modules/contrib/') ||
    lowerHtml.includes('/core/modules/') ||
    lowerHtml.includes('/sites/all/modules/') ||
    lowerHtml.includes('/sites/default/files/') ||
    lowerHtml.includes('drupal.settings') ||
    lowerHtml.includes('drupal.behaviors') ||
    headers['x-drupal-cache'] !== undefined ||
    headers['x-generator']?.toLowerCase().includes('drupal')
  );
}
