/**
 * Joomla Extension Detection Service
 * Detects Joomla extensions (components, modules, plugins) from HTML content
 */

export interface DetectedJoomlaExtension {
  name: string;
  displayName: string;
  type: 'component' | 'module' | 'plugin' | 'template';
  category: 'seo' | 'performance' | 'security' | 'forms' | 'ecommerce' | 'admin' | 'social' | 'media' | 'gallery' | 'builder' | 'other';
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  description?: string;
  security?: {
    hasKnownVulnerabilities: boolean;
    severity?: 'critical' | 'high' | 'medium' | 'low';
  };
}

export interface JoomlaExtensionAnalysis {
  totalExtensions: number;
  extensionsByCategory: Record<string, DetectedJoomlaExtension[]>;
  extensionsByType: Record<string, DetectedJoomlaExtension[]>;
  securityRisks: DetectedJoomlaExtension[];
  performanceImpact: DetectedJoomlaExtension[];
  recommendations: string[];
}

// Joomla extension signatures with detection patterns
interface JoomlaExtensionSignature {
  name: string;
  displayName: string;
  type: DetectedJoomlaExtension['type'];
  category: DetectedJoomlaExtension['category'];
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

const JOOMLA_EXTENSION_SIGNATURES: JoomlaExtensionSignature[] = [
  // SEO Extensions
  {
    name: 'sh404sef',
    displayName: 'SH404SEF',
    type: 'component',
    category: 'seo',
    patterns: {
      paths: ['/components/com_sh404sef/', '/administrator/components/com_sh404sef/'],
      html: ['sh404sef', 'sh404-'],
    },
    description: 'SEO and URL management extension'
  },
  {
    name: 'joomsef',
    displayName: 'JoomSEF',
    type: 'component',
    category: 'seo',
    patterns: {
      paths: ['/components/com_joomsef/', '/components/com_sef/'],
      html: ['joomsef', 'artio-joomsef'],
    },
    description: 'SEO extension for URLs and meta data'
  },
  {
    name: 'efseo',
    displayName: 'EFSEO',
    type: 'component',
    category: 'seo',
    patterns: {
      paths: ['/components/com_efseo/'],
      html: ['efseo'],
    },
    description: 'Easy Frontend SEO'
  },
  {
    name: 'osmap',
    displayName: 'OSMap',
    type: 'component',
    category: 'seo',
    patterns: {
      paths: ['/components/com_osmap/'],
      html: ['osmap', 'sitemap'],
    },
    description: 'Sitemap generator for Joomla'
  },

  // Form Extensions
  {
    name: 'rsform',
    displayName: 'RSForm Pro',
    type: 'component',
    category: 'forms',
    patterns: {
      paths: ['/components/com_rsform/', '/media/com_rsform/'],
      html: ['rsform', 'formId'],
      css: ['rsform', 'formBody'],
    },
    description: 'Advanced form builder'
  },
  {
    name: 'breezingforms',
    displayName: 'BreezingForms',
    type: 'component',
    category: 'forms',
    patterns: {
      paths: ['/components/com_breezingforms/'],
      html: ['breezingforms', 'bfQuickMode'],
    },
    description: 'Form management and builder'
  },
  {
    name: 'chronoforms',
    displayName: 'ChronoForms',
    type: 'component',
    category: 'forms',
    patterns: {
      paths: ['/components/com_chronoforms/', '/media/com_chronoforms/'],
      html: ['chronoforms', 'chrono-'],
      css: ['chronoforms'],
    },
    description: 'Form creation and management'
  },
  {
    name: 'fabrik',
    displayName: 'Fabrik',
    type: 'component',
    category: 'forms',
    patterns: {
      paths: ['/components/com_fabrik/', '/media/com_fabrik/'],
      html: ['fabrik', 'fabrikForm'],
      css: ['fabrikForm', 'fabrikList'],
    },
    description: 'Application builder and forms'
  },

  // E-commerce Extensions
  {
    name: 'virtuemart',
    displayName: 'VirtueMart',
    type: 'component',
    category: 'ecommerce',
    patterns: {
      paths: ['/components/com_virtuemart/', '/media/com_virtuemart/'],
      html: ['virtuemart', 'vm-', 'addtocart'],
      css: ['virtuemart', 'vm-product'],
    },
    description: 'E-commerce solution for Joomla'
  },
  {
    name: 'hikashop',
    displayName: 'HikaShop',
    type: 'component',
    category: 'ecommerce',
    patterns: {
      paths: ['/components/com_hikashop/', '/media/com_hikashop/'],
      html: ['hikashop', 'hika-'],
      css: ['hikashop'],
    },
    description: 'E-commerce extension'
  },
  {
    name: 'j2store',
    displayName: 'J2Store',
    type: 'component',
    category: 'ecommerce',
    patterns: {
      paths: ['/components/com_j2store/', '/media/com_j2store/'],
      html: ['j2store', 'j2-'],
      css: ['j2store'],
    },
    description: 'Shopping cart extension'
  },

  // Gallery Extensions
  {
    name: 'phocagallery',
    displayName: 'Phoca Gallery',
    type: 'component',
    category: 'gallery',
    patterns: {
      paths: ['/components/com_phocagallery/', '/media/com_phocagallery/'],
      html: ['phocagallery', 'phoca-'],
      css: ['phocagallery'],
    },
    description: 'Image gallery extension'
  },
  {
    name: 'sigplus',
    displayName: 'sigplus Image Gallery',
    type: 'plugin',
    category: 'gallery',
    patterns: {
      paths: ['/plugins/content/sigplus/'],
      html: ['sigplus'],
    },
    description: 'Lightweight image gallery'
  },
  {
    name: 'rsgallery2',
    displayName: 'RSGallery2',
    type: 'component',
    category: 'gallery',
    patterns: {
      paths: ['/components/com_rsgallery2/'],
      html: ['rsgallery2'],
    },
    description: 'Photo gallery component'
  },

  // Security Extensions
  {
    name: 'admintools',
    displayName: 'Admin Tools',
    type: 'component',
    category: 'security',
    patterns: {
      paths: ['/components/com_admintools/', '/plugins/system/admintools/'],
      html: ['admintools'],
    },
    description: 'Security and maintenance toolkit',
    securityConcerns: false
  },
  {
    name: 'rsfirewall',
    displayName: 'RSFirewall',
    type: 'component',
    category: 'security',
    patterns: {
      paths: ['/components/com_rsfirewall/', '/administrator/components/com_rsfirewall/'],
      html: ['rsfirewall'],
    },
    description: 'Security firewall extension',
    securityConcerns: false
  },
  {
    name: 'akeebabackup',
    displayName: 'Akeeba Backup',
    type: 'component',
    category: 'security',
    patterns: {
      paths: ['/components/com_akeeba/', '/administrator/components/com_akeeba/'],
      html: ['akeeba'],
    },
    description: 'Backup and restoration tool',
    securityConcerns: false
  },

  // Page Builder Extensions
  {
    name: 'sppagebuilder',
    displayName: 'SP Page Builder',
    type: 'component',
    category: 'builder',
    patterns: {
      paths: ['/components/com_sppagebuilder/', '/media/com_sppagebuilder/'],
      html: ['sppagebuilder', 'sp-page-builder'],
      css: ['sppb-', 'sp-page-builder'],
    },
    description: 'Drag and drop page builder',
    performanceImpact: 'medium'
  },
  {
    name: 'quix',
    displayName: 'Quix Page Builder',
    type: 'component',
    category: 'builder',
    patterns: {
      paths: ['/components/com_quix/', '/media/com_quix/'],
      html: ['quix', 'qx-'],
      css: ['quix-', 'qx-element'],
    },
    description: 'Visual page builder',
    performanceImpact: 'medium'
  },

  // Performance Extensions
  {
    name: 'jch_optimize',
    displayName: 'JCH Optimize',
    type: 'plugin',
    category: 'performance',
    patterns: {
      paths: ['/plugins/system/jch_optimize/'],
      html: ['jch-optimize', 'jch_optimize'],
    },
    description: 'Performance optimization plugin',
    performanceImpact: 'low'
  },
  {
    name: 'jotcache',
    displayName: 'JotCache',
    type: 'plugin',
    category: 'performance',
    patterns: {
      paths: ['/plugins/system/jotcache/'],
      html: ['jotcache'],
    },
    description: 'Advanced caching system',
    performanceImpact: 'low'
  },

  // Social Media Extensions
  {
    name: 'jfbconnect',
    displayName: 'JFBConnect',
    type: 'component',
    category: 'social',
    patterns: {
      paths: ['/components/com_jfbconnect/'],
      html: ['jfbconnect'],
    },
    description: 'Facebook integration'
  },
  {
    name: 'sociallogin',
    displayName: 'Social Login',
    type: 'plugin',
    category: 'social',
    patterns: {
      paths: ['/plugins/system/sociallogin/'],
      html: ['sociallogin'],
    },
    description: 'Social media login integration'
  },

  // Admin Extensions
  {
    name: 'akeeba_strapper',
    displayName: 'Akeeba Strapper',
    type: 'plugin',
    category: 'admin',
    patterns: {
      paths: ['/plugins/system/akeeba_strapper/'],
      html: ['akeeba_strapper'],
    },
    description: 'Bootstrap framework loader'
  },
  {
    name: 'jce',
    displayName: 'JCE Editor',
    type: 'component',
    category: 'admin',
    patterns: {
      paths: ['/components/com_jce/', '/media/com_jce/'],
      html: ['jce', 'wf-editor'],
      js: ['WFEditor'],
    },
    description: 'Advanced WYSIWYG editor'
  },

  // Media Extensions
  {
    name: 'allvideos',
    displayName: 'AllVideos',
    type: 'plugin',
    category: 'media',
    patterns: {
      paths: ['/plugins/content/allvideos/'],
      html: ['allvideos'],
    },
    description: 'Video embedding plugin'
  },
  {
    name: 'sigpro',
    displayName: 'Simple Image Gallery Pro',
    type: 'plugin',
    category: 'media',
    patterns: {
      paths: ['/plugins/content/sigpro/'],
      html: ['sigpro'],
    },
    description: 'Simple gallery solution'
  },
];

export function detectJoomlaExtensions(html: string, headers: Record<string, string>): JoomlaExtensionAnalysis {
  const detectedExtensions: DetectedJoomlaExtension[] = [];
  const lowerHtml = html.toLowerCase();

  console.log('🔍 Analyzing Joomla extensions...');

  // Detect extensions based on signatures
  for (const signature of JOOMLA_EXTENSION_SIGNATURES) {
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
      detectedExtensions.push({
        name: signature.name,
        displayName: signature.displayName,
        type: signature.type,
        category: signature.category,
        confidence,
        description: signature.description,
        security: signature.securityConcerns ? {
          hasKnownVulnerabilities: false,
          severity: 'low'
        } : undefined
      });
    }
  }

  // Categorize extensions by category
  const extensionsByCategory: Record<string, DetectedJoomlaExtension[]> = {};
  for (const ext of detectedExtensions) {
    if (!extensionsByCategory[ext.category]) {
      extensionsByCategory[ext.category] = [];
    }
    extensionsByCategory[ext.category].push(ext);
  }

  // Categorize extensions by type
  const extensionsByType: Record<string, DetectedJoomlaExtension[]> = {};
  for (const ext of detectedExtensions) {
    if (!extensionsByType[ext.type]) {
      extensionsByType[ext.type] = [];
    }
    extensionsByType[ext.type].push(ext);
  }

  // Identify security risks
  const securityRisks = detectedExtensions.filter(e =>
    e.security?.hasKnownVulnerabilities
  );

  // Identify performance heavy extensions
  const performanceImpact = detectedExtensions.filter(e => {
    const sig = JOOMLA_EXTENSION_SIGNATURES.find(s => s.name === e.name);
    return sig?.performanceImpact === 'high' || sig?.performanceImpact === 'medium';
  });

  // Generate recommendations
  const recommendations = generateJoomlaRecommendations(detectedExtensions, extensionsByCategory);

  console.log(`📊 Joomla extension analysis complete: ${detectedExtensions.length} extensions detected`);

  return {
    totalExtensions: detectedExtensions.length,
    extensionsByCategory,
    extensionsByType,
    securityRisks,
    performanceImpact,
    recommendations
  };
}

function generateJoomlaRecommendations(
  extensions: DetectedJoomlaExtension[],
  categoryMap: Record<string, DetectedJoomlaExtension[]>
): string[] {
  const recommendations: string[] = [];

  // SEO recommendations
  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push(
      '📈 Install SH404SEF or JoomSEF for comprehensive SEO management',
      '🗺️ Add OSMap extension to generate XML sitemaps for search engines'
    );
  }

  // Security recommendations
  if (!categoryMap.security || categoryMap.security.length === 0) {
    recommendations.push(
      '🔒 Install Admin Tools for enhanced security and site protection',
      '💾 Add Akeeba Backup for regular site backups and disaster recovery'
    );
  } else if (categoryMap.security.length === 1) {
    const hasBackup = extensions.some(e => e.name === 'akeebabackup');
    const hasSecurity = extensions.some(e => e.name === 'admintools' || e.name === 'rsfirewall');

    if (!hasBackup) {
      recommendations.push('💾 Add Akeeba Backup for site backup protection');
    }
    if (!hasSecurity) {
      recommendations.push('🛡️ Install Admin Tools or RSFirewall for security hardening');
    }
  }

  // Performance recommendations
  if (!categoryMap.performance || categoryMap.performance.length === 0) {
    recommendations.push(
      '⚡ Install JCH Optimize for CSS/JS optimization and faster loading',
      '🚀 Add JotCache for advanced page caching'
    );
  }

  // Forms recommendations
  if (!categoryMap.forms || categoryMap.forms.length === 0) {
    recommendations.push(
      '📝 Install RSForm Pro or ChronoForms for advanced form capabilities'
    );
  }

  // Page builder check
  if (categoryMap.builder && categoryMap.builder.length > 0) {
    recommendations.push(
      '⚠️ Page builder detected - ensure it\'s optimized to prevent performance issues'
    );
  }

  return recommendations;
}

// Export function to check if site is Joomla
export function isJoomla(html: string, headers: Record<string, string>): boolean {
  const lowerHtml = html.toLowerCase();

  return (
    lowerHtml.includes('joomla') ||
    lowerHtml.includes('/media/jui/') ||
    lowerHtml.includes('/components/com_') ||
    lowerHtml.includes('/modules/mod_') ||
    lowerHtml.includes('/plugins/') ||
    lowerHtml.includes('joomla.jtext') ||
    lowerHtml.includes('option=com_') ||
    headers['x-content-encoded-by']?.toLowerCase().includes('joomla')
  );
}
