/**
 * Comprehensive Plugin Signature Database
 * Pattern-based detection for top 100+ WordPress plugins
 * Last updated: January 2025
 */

export interface PluginSignature {
  name: string;
  category: 'security' | 'performance' | 'seo' | 'ecommerce' | 'analytics' | 'social' | 'backup' | 'forms' | 'page-builder' | 'content' | 'payment' | 'marketing' | 'integration' | 'utility' | 'theme' | 'other';
  subcategory?: string;
  patterns: string[];
  confidence: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
}

export const PLUGIN_SIGNATURES: PluginSignature[] = [
  // ============================================
  // SEO PLUGINS (Top Priority)
  // ============================================
  {
    name: 'Yoast SEO',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/wordpress-seo/',
      'yoast-seo',
      'yoast_seo',
      'wpseo',
      'wp-seo-meta-box',
      'schema.org/Article'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Rank Math',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/seo-by-rank-math/',
      'rank-math',
      'rank_math',
      'rankmath'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'SEOPress',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/wp-seopress/',
      '/wp-content/plugins/seopress/',
      'seopress',
      'data-seopress',
      'window.seopress',
      'seopress-social-meta',
      'wp-seopress-',
      'seopress-setup-wizard'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'SEOPress PRO',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/wp-seopress-pro/',
      'seopress-pro',
      'seopress_pro',
      'data-seopress-pro'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'All in One SEO (AIOSEO)',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/all-in-one-seo-pack/',
      'aioseo',
      'aioseop',
      'all-in-one-seo'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'The SEO Framework',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/autodescription/',
      'the-seo-framework',
      'tsf-',
      'autodescription'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },
  {
    name: 'Squirrly SEO',
    category: 'seo',
    subcategory: 'on-page-seo',
    patterns: [
      '/wp-content/plugins/squirrly-seo/',
      'squirrly',
      'sq_'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },

  // ============================================
  // CACHING PLUGINS (High Priority)
  // ============================================
  {
    name: 'WP Rocket',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/wp-rocket/',
      'wp-rocket',
      'wpr-',
      'data-rocket-',
      'window.RocketLazyLoadScripts',
      'rocket-loader'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'W3 Total Cache',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/w3-total-cache/',
      'w3tc',
      'w3-total-cache',
      'w3tc_'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'WP Super Cache',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/wp-super-cache/',
      'wp-super-cache',
      'wpsc-',
      'super-cache'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'LiteSpeed Cache',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/litespeed-cache/',
      'litespeed-cache',
      'lscache',
      'lscwp',
      'data-lazyloaded'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'WP Fastest Cache',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/wp-fastest-cache/',
      'wp-fastest-cache',
      'wpfc-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Cache Enabler',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/cache-enabler/',
      'cache-enabler'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Hummingbird',
    category: 'performance',
    subcategory: 'caching',
    patterns: [
      '/wp-content/plugins/hummingbird-performance/',
      'wphb-',
      'hummingbird'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },

  // ============================================
  // SECURITY PLUGINS
  // ============================================
  {
    name: 'Wordfence Security',
    category: 'security',
    subcategory: 'firewall',
    patterns: [
      '/wp-content/plugins/wordfence/',
      'wordfence',
      'wfwaf-',
      'wflogs'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },
  {
    name: 'Sucuri Security',
    category: 'security',
    subcategory: 'firewall',
    patterns: [
      '/wp-content/plugins/sucuri-scanner/',
      'sucuri',
      'sucuriscan'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'iThemes Security',
    category: 'security',
    subcategory: 'security-hardening',
    patterns: [
      '/wp-content/plugins/better-wp-security/',
      'itsec-',
      'ithemes-security'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'All In One WP Security',
    category: 'security',
    subcategory: 'security-hardening',
    patterns: [
      '/wp-content/plugins/all-in-one-wp-security-and-firewall/',
      'aiowps',
      'aio-wp-security'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'WP fail2ban',
    category: 'security',
    subcategory: 'brute-force-protection',
    patterns: [
      '/wp-content/plugins/wp-fail2ban/',
      'wp-fail2ban'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },

  // ============================================
  // PERFORMANCE OPTIMIZATION PLUGINS
  // ============================================
  {
    name: 'Autoptimize',
    category: 'performance',
    subcategory: 'minification',
    patterns: [
      '/wp-content/plugins/autoptimize/',
      'autoptimize',
      '/cache/autoptimize/'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },
  {
    name: 'Asset CleanUp',
    category: 'performance',
    subcategory: 'asset-management',
    patterns: [
      '/wp-content/plugins/wp-asset-clean-up/',
      'wpacu-',
      'asset-cleanup'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'WP-Optimize',
    category: 'performance',
    subcategory: 'database-optimization',
    patterns: [
      '/wp-content/plugins/wp-optimize/',
      'wp-optimize',
      'wpo_'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },
  {
    name: 'Perfmatters',
    category: 'performance',
    subcategory: 'optimization',
    patterns: [
      '/wp-content/plugins/perfmatters/',
      'perfmatters'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Query Monitor',
    category: 'utility',
    subcategory: 'debugging',
    patterns: [
      '/wp-content/plugins/query-monitor/',
      'query-monitor',
      'qm-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Smush',
    category: 'performance',
    subcategory: 'image-optimization',
    patterns: [
      '/wp-content/plugins/wp-smushit/',
      'wp-smush',
      'smush'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'EWWW Image Optimizer',
    category: 'performance',
    subcategory: 'image-optimization',
    patterns: [
      '/wp-content/plugins/ewww-image-optimizer/',
      'ewww',
      'ewwwio'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'ShortPixel',
    category: 'performance',
    subcategory: 'image-optimization',
    patterns: [
      '/wp-content/plugins/shortpixel-image-optimiser/',
      'shortpixel',
      'spai'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },

  // ============================================
  // FORM PLUGINS
  // ============================================
  {
    name: 'Contact Form 7',
    category: 'forms',
    subcategory: 'contact-forms',
    patterns: [
      '/wp-content/plugins/contact-form-7/',
      'wpcf7',
      'contact-form-7'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Gravity Forms',
    category: 'forms',
    subcategory: 'advanced-forms',
    patterns: [
      '/wp-content/plugins/gravityforms/',
      'gform',
      'gravity-forms'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },
  {
    name: 'WPForms',
    category: 'forms',
    subcategory: 'form-builder',
    patterns: [
      '/wp-content/plugins/wpforms-lite/',
      '/wp-content/plugins/wpforms/',
      'wpforms'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Ninja Forms',
    category: 'forms',
    subcategory: 'form-builder',
    patterns: [
      '/wp-content/plugins/ninja-forms/',
      'ninja-forms',
      'nf-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Formidable Forms',
    category: 'forms',
    subcategory: 'advanced-forms',
    patterns: [
      '/wp-content/plugins/formidable/',
      'frm_',
      'formidable'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },

  // ============================================
  // PAGE BUILDERS
  // ============================================
  {
    name: 'Elementor',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      '/wp-content/plugins/elementor/',
      'elementor',
      'data-elementor-type',
      'elementor-element'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Elementor Pro',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      '/wp-content/plugins/elementor-pro/',
      'elementor-pro'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Divi Builder',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      'et-db',
      'et_pb_',
      'divi-builder',
      'et-core-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'WPBakery Page Builder',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      '/wp-content/plugins/js_composer/',
      'vc_',
      'wpb-',
      'js_composer'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Beaver Builder',
    category: 'page-builder',
    subcategory: 'visual-builder',
    patterns: [
      '/wp-content/plugins/beaver-builder/',
      'fl-builder',
      'beaver-builder'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },
  {
    name: 'Gutenberg',
    category: 'page-builder',
    subcategory: 'block-editor',
    patterns: [
      'wp-block-',
      'has-text-align',
      'is-style-',
      'wp-block-group'
    ],
    confidence: 'medium',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },

  // ============================================
  // E-COMMERCE PLUGINS
  // ============================================
  {
    name: 'WooCommerce',
    category: 'ecommerce',
    subcategory: 'shop',
    patterns: [
      '/wp-content/plugins/woocommerce/',
      'woocommerce',
      'wc-',
      'product_cat',
      'add-to-cart'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Easy Digital Downloads',
    category: 'ecommerce',
    subcategory: 'digital-products',
    patterns: [
      '/wp-content/plugins/easy-digital-downloads/',
      'edd-',
      'easy-digital-downloads'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },

  // ============================================
  // ANALYTICS & TRACKING
  // ============================================
  {
    name: 'Google Analytics',
    category: 'analytics',
    subcategory: 'web-analytics',
    patterns: [
      'google-analytics.com/analytics.js',
      'googletagmanager.com/gtag/',
      'ga(',
      'gtag('
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'MonsterInsights',
    category: 'analytics',
    subcategory: 'google-analytics',
    patterns: [
      '/wp-content/plugins/google-analytics-for-wordpress/',
      'monsterinsights'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Google Site Kit',
    category: 'analytics',
    subcategory: 'google-integration',
    patterns: [
      '/wp-content/plugins/google-site-kit/',
      'googlesitekit'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'medium'
  },

  // ============================================
  // BACKUP PLUGINS
  // ============================================
  {
    name: 'UpdraftPlus',
    category: 'backup',
    subcategory: 'backup-restore',
    patterns: [
      '/wp-content/plugins/updraftplus/',
      'updraft'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'BackWPup',
    category: 'backup',
    subcategory: 'backup-restore',
    patterns: [
      '/wp-content/plugins/backwpup/',
      'backwpup'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Duplicator',
    category: 'backup',
    subcategory: 'migration',
    patterns: [
      '/wp-content/plugins/duplicator/',
      'duplicator'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },

  // ============================================
  // SOCIAL MEDIA PLUGINS
  // ============================================
  {
    name: 'Jetpack',
    category: 'utility',
    subcategory: 'multi-purpose',
    patterns: [
      '/wp-content/plugins/jetpack/',
      'jetpack',
      'jp-'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'high'
  },
  {
    name: 'Social Warfare',
    category: 'social',
    subcategory: 'social-sharing',
    patterns: [
      '/wp-content/plugins/social-warfare/',
      'social-warfare'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },

  // ============================================
  // ADDITIONAL POPULAR PLUGINS
  // ============================================
  {
    name: 'Akismet',
    category: 'security',
    subcategory: 'spam-protection',
    patterns: [
      '/wp-content/plugins/akismet/',
      'akismet'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },
  {
    name: 'Redirection',
    category: 'seo',
    subcategory: 'redirects',
    patterns: [
      '/wp-content/plugins/redirection/',
      'redirection'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Really Simple SSL',
    category: 'security',
    subcategory: 'ssl',
    patterns: [
      '/wp-content/plugins/really-simple-ssl/',
      'really-simple-ssl',
      'rsssl'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },
  {
    name: 'Advanced Custom Fields',
    category: 'content',
    subcategory: 'custom-fields',
    patterns: [
      '/wp-content/plugins/advanced-custom-fields/',
      'acf-',
      'advanced-custom-fields'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
  {
    name: 'Classic Editor',
    category: 'content',
    subcategory: 'editor',
    patterns: [
      '/wp-content/plugins/classic-editor/',
      'classic-editor'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'minimal'
  },
  {
    name: 'MailChimp',
    category: 'marketing',
    subcategory: 'email-marketing',
    patterns: [
      '/wp-content/plugins/mailchimp-for-wp/',
      'mc4wp',
      'mailchimp'
    ],
    confidence: 'high',
    riskLevel: 'low',
    performanceImpact: 'low'
  },
];

/**
 * Detects plugins based on pattern matching
 * Returns detected plugins with confidence scores
 */
export function detectPluginsByPatterns(html: string, headers: Record<string, string>): DetectedPlugin[] {
  const detectedPlugins: DetectedPlugin[] = [];
  const htmlLower = html.toLowerCase();
  const headersLower = JSON.stringify(headers).toLowerCase();
  const combinedContent = htmlLower + ' ' + headersLower;

  for (const signature of PLUGIN_SIGNATURES) {
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

      detectedPlugins.push({
        name: signature.name,
        category: signature.category,
        subcategory: signature.subcategory,
        confidence: confidenceScore as 'high' | 'medium' | 'low',
        riskLevel: signature.riskLevel,
        performanceImpact: signature.performanceImpact,
        description: `Detected via ${matchCount} pattern match(es)`,
        detectionEvidence: evidenceFound,
        recommendations: []
      });
    }
  }

  return detectedPlugins;
}

export interface DetectedPlugin {
  name: string;
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
