/**
 * WordPress Plugin Detection & Categorization System
 * Detects WordPress plugins from HTML content and categorizes them by functionality
 */

export interface DetectedPlugin {
  name: string;
  category: 'security' | 'performance' | 'seo' | 'ecommerce' | 'analytics' | 'social' | 'backup' | 'forms' | 'page-builder' | 'content' | 'other';
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: 'script' | 'css' | 'html' | 'meta' | 'header';
  evidence: string;
  description?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface PluginAnalysis {
  totalPlugins: number;
  pluginsByCategory: Record<string, DetectedPlugin[]>;
  securityRisks: DetectedPlugin[];
  performanceImpact: DetectedPlugin[];
  recommendations: string[];
}

// Comprehensive plugin detection database
const PLUGIN_SIGNATURES = [
  // SECURITY PLUGINS
  {
    name: 'Wordfence Security',
    category: 'security' as const,
    patterns: ['wordfence', 'wflogs', 'wfwaf'],
    confidence: 'high' as const,
    description: 'Website firewall and malware protection',
    riskLevel: 'low' as const
  },
  {
    name: 'Sucuri Security',
    category: 'security' as const,
    patterns: ['sucuri', 'sucurisecurity'],
    confidence: 'high' as const,
    description: 'Website security and malware removal',
    riskLevel: 'low' as const
  },
  {
    name: 'iThemes Security',
    category: 'security' as const,
    patterns: ['ithemes-security', 'itsec'],
    confidence: 'high' as const,
    description: 'WordPress security hardening',
    riskLevel: 'low' as const
  },
  {
    name: 'All In One WP Security',
    category: 'security' as const,
    patterns: ['aiowps', 'all-in-one-wp-security'],
    confidence: 'high' as const,
    description: 'Comprehensive WordPress security',
    riskLevel: 'low' as const
  },

  // PERFORMANCE PLUGINS
  {
    name: 'W3 Total Cache',
    category: 'performance' as const,
    patterns: ['w3tc', 'w3-total-cache'],
    confidence: 'high' as const,
    description: 'Caching and performance optimization',
    riskLevel: 'low' as const
  },
  {
    name: 'WP Rocket',
    category: 'performance' as const,
    patterns: ['wp-rocket', 'wpr_rocket_'],
    confidence: 'high' as const,
    description: 'Premium caching and speed optimization',
    riskLevel: 'low' as const
  },
  {
    name: 'WP Super Cache',
    category: 'performance' as const,
    patterns: ['wp-super-cache', 'wpsupercache'],
    confidence: 'high' as const,
    description: 'Static caching for faster loading',
    riskLevel: 'low' as const
  },
  {
    name: 'Autoptimize',
    category: 'performance' as const,
    patterns: ['autoptimize', 'ao_optimized'],
    confidence: 'high' as const,
    description: 'CSS, JS, and HTML optimization',
    riskLevel: 'low' as const
  },
  {
    name: 'WP Optimize',
    category: 'performance' as const,
    patterns: ['wp-optimize', 'wpo_min'],
    confidence: 'high' as const,
    description: 'Database and cache optimization',
    riskLevel: 'low' as const
  },

  // SEO PLUGINS
  {
    name: 'Yoast SEO',
    category: 'seo' as const,
    patterns: ['yoast', 'yoast_wpseo', 'wpseo'],
    confidence: 'high' as const,
    description: 'Comprehensive SEO optimization',
    riskLevel: 'low' as const
  },
  {
    name: 'Rank Math',
    category: 'seo' as const,
    patterns: ['rank-math', 'rankmath'],
    confidence: 'high' as const,
    description: 'SEO plugin with advanced features',
    riskLevel: 'low' as const
  },
  {
    name: 'All in One SEO',
    category: 'seo' as const,
    patterns: ['all-in-one-seo', 'aioseop'],
    confidence: 'high' as const,
    description: 'SEO optimization and meta management',
    riskLevel: 'low' as const
  },

  // ECOMMERCE PLUGINS
  {
    name: 'WooCommerce',
    category: 'ecommerce' as const,
    patterns: ['woocommerce', 'wc-ajax', '/wp-content/plugins/woocommerce/'],
    confidence: 'high' as const,
    description: 'E-commerce platform for WordPress',
    riskLevel: 'medium' as const,
    recommendation: 'Ensure WooCommerce is updated for security'
  },
  {
    name: 'Easy Digital Downloads',
    category: 'ecommerce' as const,
    patterns: ['easy-digital-downloads', 'edd'],
    confidence: 'high' as const,
    description: 'Digital product sales platform',
    riskLevel: 'low' as const
  },

  // PAGE BUILDERS
  {
    name: 'Elementor',
    category: 'page-builder' as const,
    patterns: ['elementor', 'elementor-element'],
    confidence: 'high' as const,
    description: 'Visual page builder',
    riskLevel: 'low' as const
  },
  {
    name: 'Divi Builder',
    category: 'page-builder' as const,
    patterns: ['divi-theme', 'et_pb_', 'et-core'],
    confidence: 'high' as const,
    description: 'Elegant Themes page builder',
    riskLevel: 'low' as const
  },
  {
    name: 'WPBakery Page Builder',
    category: 'page-builder' as const,
    patterns: ['wpbakery', 'js_composer', 'vc_'],
    confidence: 'high' as const,
    description: 'Visual page builder (formerly Visual Composer)',
    riskLevel: 'medium' as const,
    recommendation: 'Consider modern alternatives like Elementor'
  },
  {
    name: 'Beaver Builder',
    category: 'page-builder' as const,
    patterns: ['beaver-builder', 'fl-builder'],
    confidence: 'high' as const,
    description: 'Drag and drop page builder',
    riskLevel: 'low' as const
  },

  // FORMS PLUGINS
  {
    name: 'Contact Form 7',
    category: 'forms' as const,
    patterns: ['contact-form-7', 'wpcf7'],
    confidence: 'high' as const,
    description: 'Contact form management',
    riskLevel: 'low' as const
  },
  {
    name: 'Gravity Forms',
    category: 'forms' as const,
    patterns: ['gravity-forms', 'gform'],
    confidence: 'high' as const,
    description: 'Advanced form builder',
    riskLevel: 'low' as const
  },
  {
    name: 'WPForms',
    category: 'forms' as const,
    patterns: ['wpforms', 'wpforms-'],
    confidence: 'high' as const,
    description: 'Drag and drop form builder',
    riskLevel: 'low' as const
  },

  // BACKUP PLUGINS
  {
    name: 'UpdraftPlus',
    category: 'backup' as const,
    patterns: ['updraftplus', 'updraft'],
    confidence: 'high' as const,
    description: 'Backup and restoration',
    riskLevel: 'low' as const
  },
  {
    name: 'BackupBuddy',
    category: 'backup' as const,
    patterns: ['backupbuddy', 'ithemes-sync'],
    confidence: 'high' as const,
    description: 'Complete backup solution',
    riskLevel: 'low' as const
  },

  // ANALYTICS PLUGINS
  {
    name: 'MonsterInsights',
    category: 'analytics' as const,
    patterns: ['monsterinsights', 'monster-insights'],
    confidence: 'high' as const,
    description: 'Google Analytics integration',
    riskLevel: 'low' as const
  },
  {
    name: 'Google Analytics Dashboard',
    category: 'analytics' as const,
    patterns: ['google-analytics-dashboard', 'gadwp'],
    confidence: 'high' as const,
    description: 'Google Analytics dashboard',
    riskLevel: 'low' as const
  },

  // SOCIAL PLUGINS
  {
    name: 'Social Warfare',
    category: 'social' as const,
    patterns: ['social-warfare', 'swp_'],
    confidence: 'high' as const,
    description: 'Social media sharing buttons',
    riskLevel: 'low' as const
  },
  {
    name: 'AddThis',
    category: 'social' as const,
    patterns: ['addthis', 'addthis.com'],
    confidence: 'high' as const,
    description: 'Social sharing and analytics',
    riskLevel: 'medium' as const,
    recommendation: 'Monitor third-party script performance'
  },

  // CONTENT PLUGINS
  {
    name: 'Advanced Custom Fields',
    category: 'content' as const,
    patterns: ['advanced-custom-fields', 'acf-'],
    confidence: 'high' as const,
    description: 'Custom fields management',
    riskLevel: 'low' as const
  },
  {
    name: 'Custom Post Type UI',
    category: 'content' as const,
    patterns: ['custom-post-type-ui', 'cptui'],
    confidence: 'high' as const,
    description: 'Custom post types and fields',
    riskLevel: 'low' as const
  },

  // OTHER COMMON PLUGINS
  {
    name: 'Akismet',
    category: 'security' as const,
    patterns: ['akismet', 'ak_js'],
    confidence: 'high' as const,
    description: 'Anti-spam protection',
    riskLevel: 'low' as const
  },
  {
    name: 'Really Simple SSL',
    category: 'security' as const,
    patterns: ['really-simple-ssl', 'rsssl'],
    confidence: 'high' as const,
    description: 'SSL certificate management',
    riskLevel: 'low' as const
  },
  {
    name: 'Redirection',
    category: 'seo' as const,
    patterns: ['redirection', 'redirect_'],
    confidence: 'high' as const,
    description: 'URL redirection management',
    riskLevel: 'low' as const
  }
];

export function detectWordPressPlugins(html: string, headers: Record<string, string>): PluginAnalysis {
  const detectedPlugins: DetectedPlugin[] = [];
  const lowerHtml = html.toLowerCase();
  
  console.log('🔍 Analyzing WordPress plugins...');
  
  for (const plugin of PLUGIN_SIGNATURES) {
    for (const pattern of plugin.patterns) {
      if (lowerHtml.includes(pattern.toLowerCase())) {
        // Determine detection method
        let detectionMethod: DetectedPlugin['detectionMethod'] = 'html';
        let evidence = pattern;
        
        if (lowerHtml.includes(`<script`) && lowerHtml.includes(pattern.toLowerCase())) {
          detectionMethod = 'script';
        } else if (lowerHtml.includes(`<link`) && lowerHtml.includes(pattern.toLowerCase())) {
          detectionMethod = 'css';
        } else if (lowerHtml.includes(`<meta`) && lowerHtml.includes(pattern.toLowerCase())) {
          detectionMethod = 'meta';
        }
        
        // Check if already detected (avoid duplicates)
        if (!detectedPlugins.find(p => p.name === plugin.name)) {
          detectedPlugins.push({
            name: plugin.name,
            category: plugin.category,
            confidence: plugin.confidence,
            detectionMethod,
            evidence,
            description: plugin.description,
            riskLevel: plugin.riskLevel,
            recommendation: plugin.recommendation
          });
          
          console.log(`✅ Detected plugin: ${plugin.name} (${plugin.category})`);
        }
        break; // Found this plugin, move to next
      }
    }
  }
  
  // Categorize plugins
  const pluginsByCategory: Record<string, DetectedPlugin[]> = {};
  for (const plugin of detectedPlugins) {
    if (!pluginsByCategory[plugin.category]) {
      pluginsByCategory[plugin.category] = [];
    }
    pluginsByCategory[plugin.category].push(plugin);
  }
  
  // Identify security risks
  const securityRisks = detectedPlugins.filter(p => 
    p.riskLevel === 'high' || 
    (p.riskLevel === 'medium' && ['ecommerce', 'social'].includes(p.category))
  );
  
  // Identify performance impact plugins
  const performanceImpact = detectedPlugins.filter(p => 
    p.category === 'page-builder' || 
    p.category === 'social' ||
    p.detectionMethod === 'script'
  );
  
  // Generate recommendations
  const recommendations = generatePluginRecommendations(detectedPlugins, pluginsByCategory);
  
  console.log(`📊 Plugin analysis complete: ${detectedPlugins.length} plugins detected`);
  
  return {
    totalPlugins: detectedPlugins.length,
    pluginsByCategory,
    securityRisks,
    performanceImpact,
    recommendations
  };
}

function generatePluginRecommendations(plugins: DetectedPlugin[], categoryMap: Record<string, DetectedPlugin[]>): string[] {
  const recommendations: string[] = [];
  
  // Security recommendations
  if (!categoryMap.security || categoryMap.security.length === 0) {
    recommendations.push('Consider installing a security plugin like Wordfence or Sucuri for website protection');
  }
  
  // Performance recommendations
  if (!categoryMap.performance || categoryMap.performance.length === 0) {
    recommendations.push('Install a caching plugin like WP Rocket or W3 Total Cache to improve performance');
  }
  
  // SEO recommendations
  if (!categoryMap.seo || categoryMap.seo.length === 0) {
    recommendations.push('Add an SEO plugin like Yoast SEO or Rank Math for better search engine visibility');
  }
  
  // Backup recommendations
  if (!categoryMap.backup || categoryMap.backup.length === 0) {
    recommendations.push('Install a backup plugin like UpdraftPlus to protect your website data');
  }
  
  // Plugin-specific recommendations
  for (const plugin of plugins) {
    if (plugin.recommendation) {
      recommendations.push(`${plugin.name}: ${plugin.recommendation}`);
    }
  }
  
  // General recommendations
  if (plugins.length > 15) {
    recommendations.push('Consider reviewing plugins for unnecessary ones - too many plugins can impact performance');
  }
  
  if (categoryMap['page-builder']?.length > 1) {
    recommendations.push('Multiple page builders detected - consider using only one for better performance');
  }
  
  return recommendations;
}

// Enhanced plugin detection for WordPress sites
export function enhanceWordPressDetection(existingResult: any, html: string, headers: Record<string, string>): any {
  if (existingResult.cms !== 'WordPress') {
    return existingResult;
  }
  
  console.log('🚀 Running enhanced WordPress plugin detection...');
  
  const pluginAnalysis = detectWordPressPlugins(html, headers);
  
  // Update the result with enhanced plugin information
  const enhancedResult = {
    ...existingResult,
    plugins: pluginAnalysis.pluginsByCategory,
    pluginAnalysis: {
      totalPlugins: pluginAnalysis.totalPlugins,
      securityPlugins: pluginAnalysis.pluginsByCategory.security?.length || 0,
      performancePlugins: pluginAnalysis.pluginsByCategory.performance?.length || 0,
      seoPlugins: pluginAnalysis.pluginsByCategory.seo?.length || 0,
      securityRisks: pluginAnalysis.securityRisks.length,
      performanceImpact: pluginAnalysis.performanceImpact.length,
      recommendations: pluginAnalysis.recommendations
    }
  };
  
  // Update page builder info if detected
  const pageBuilders = pluginAnalysis.pluginsByCategory['page-builder'];
  if (pageBuilders && pageBuilders.length > 0) {
    enhancedResult.pageBuilder = pageBuilders[0].name;
    if (pageBuilders.length > 1) {
      enhancedResult.pageBuilderWarning = `Multiple page builders detected: ${pageBuilders.map(p => p.name).join(', ')}`;
    }
  }
  
  // Add ecommerce detection
  const ecommercePlugins = pluginAnalysis.pluginsByCategory.ecommerce;
  if (ecommercePlugins && ecommercePlugins.length > 0) {
    enhancedResult.ecommerce = ecommercePlugins[0].name;
  }
  
  return enhancedResult;
}