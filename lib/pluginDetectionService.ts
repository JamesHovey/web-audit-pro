/**
 * WordPress Plugin Detection Service
 * Shared utility for detecting WordPress plugins from HTML content
 */

interface PluginDetectionResult {
  cms?: string;
  plugins: string[];
  pageBuilder?: string;
}

export function detectWordPressPlugins(html: string): PluginDetectionResult {
  const result: PluginDetectionResult = {
    plugins: []
  };
  
  const lowerHtml = html.toLowerCase();
  
  // WordPress detection (comprehensive)
  const isWordPress = lowerHtml.includes('wp-content') || 
                     lowerHtml.includes('wordpress') || 
                     lowerHtml.includes('wp-includes') ||
                     lowerHtml.includes('wp-admin') ||
                     lowerHtml.includes('/wp-') ||
                     lowerHtml.includes('wp_');
  
  if (!isWordPress) {
    return result; // Not WordPress, no plugins to detect
  }
  
  result.cms = 'WordPress';
  
  // WordPress Page Builder Detection
  if (lowerHtml.includes('elementor')) {
    result.pageBuilder = 'Elementor';
  } else if (lowerHtml.includes('divi-theme') || lowerHtml.includes('et_pb_') || lowerHtml.includes('et-divi')) {
    result.pageBuilder = 'Divi';
  } else if (lowerHtml.includes('beaver-builder') || lowerHtml.includes('fl-builder')) {
    result.pageBuilder = 'Beaver Builder';
  } else if (lowerHtml.includes('wpbakery') || lowerHtml.includes('js_composer')) {
    result.pageBuilder = 'WPBakery Page Builder';
  } else if (lowerHtml.includes('fusion-builder') || lowerHtml.includes('avada')) {
    result.pageBuilder = 'Fusion Builder (Avada)';
  }
  
  // WordPress Plugin Detection
  const wpPlugins = [];
  
  // SEO Plugins (strict detection)
  if (lowerHtml.includes('yoast') && 
      (lowerHtml.includes('yoast_wpseo') || lowerHtml.includes('wp-seo-main') || lowerHtml.includes('/wp-content/plugins/wordpress-seo/'))) {
    wpPlugins.push('Yoast SEO');
  }
  if ((lowerHtml.includes('rank-math') || lowerHtml.includes('rankmath')) && 
      (lowerHtml.includes('rank_math') || lowerHtml.includes('/wp-content/plugins/seo-by-rank-math/'))) {
    wpPlugins.push('RankMath SEO');
  }
  if (lowerHtml.includes('aioseo') && 
      (lowerHtml.includes('all-in-one-seo') || lowerHtml.includes('/wp-content/plugins/all-in-one-seo-pack/'))) {
    wpPlugins.push('All in One SEO');
  }
  
  // E-commerce (strict detection - only if definitive proof exists)
  if ((lowerHtml.includes('woocommerce') && 
       (lowerHtml.includes('wc-ajax') || 
        lowerHtml.includes('add-to-cart') || 
        lowerHtml.includes('woocommerce-page') ||
        lowerHtml.includes('woocommerce.js') ||
        lowerHtml.includes('class="woocommerce') ||
        lowerHtml.includes('woocommerce-cart') ||
        lowerHtml.includes('woocommerce-checkout'))) ||
      (lowerHtml.includes('/wp-content/plugins/woocommerce/'))) {
    wpPlugins.push('WooCommerce');
  }
  
  // Security (strict detection)
  if (lowerHtml.includes('wordfence') && 
      (lowerHtml.includes('wordfence_asyncInit') || lowerHtml.includes('/wp-content/plugins/wordfence/'))) {
    wpPlugins.push('Wordfence Security');
  }
  if (lowerHtml.includes('sucuri') && 
      (lowerHtml.includes('sucuri-scanner') || lowerHtml.includes('/wp-content/plugins/sucuri-scanner/'))) {
    wpPlugins.push('Sucuri Security');
  }
  
  // Performance (strict detection)
  if ((lowerHtml.includes('w3-total-cache') || lowerHtml.includes('w3tc')) && 
      (lowerHtml.includes('w3tc_config') || lowerHtml.includes('/wp-content/plugins/w3-total-cache/'))) {
    wpPlugins.push('W3 Total Cache');
  }
  if (lowerHtml.includes('wp-rocket') ||
      lowerHtml.includes('wpr_rocket_') ||
      lowerHtml.includes('/wp-content/plugins/wp-rocket/') ||
      lowerHtml.includes('rocket-loader') ||
      lowerHtml.includes('data-rocket-') ||
      lowerHtml.includes('wprocket')) {
    wpPlugins.push('WP Rocket');
  }
  if (lowerHtml.includes('autoptimize') && 
      (lowerHtml.includes('autoptimize.js') || lowerHtml.includes('/wp-content/plugins/autoptimize/'))) {
    wpPlugins.push('Autoptimize');
  }
  
  // Forms
  if (lowerHtml.includes('contact-form-7') || lowerHtml.includes('wpcf7')) wpPlugins.push('Contact Form 7');
  if (lowerHtml.includes('gravity-forms') || lowerHtml.includes('gform')) wpPlugins.push('Gravity Forms');
  if (lowerHtml.includes('wpforms')) wpPlugins.push('WPForms');
  
  // Backup
  if (lowerHtml.includes('updraftplus')) wpPlugins.push('UpdraftPlus');
  
  // Caching & Optimization
  if (lowerHtml.includes('litespeed') || lowerHtml.includes('lscache')) wpPlugins.push('LiteSpeed Cache');
  if (lowerHtml.includes('wp-super-cache')) wpPlugins.push('WP Super Cache');
  if (lowerHtml.includes('wp-fastest-cache')) wpPlugins.push('WP Fastest Cache');
  
  result.plugins = wpPlugins;
  
  return result;
}

// Enhanced plugin detection for specific optimization types
export function getPluginOptimizationCapabilities(plugins: string[], pageBuilder?: string): {
  canOptimizeCSS: boolean;
  canOptimizeJS: boolean;
  canOptimizeImages: boolean;
  canEnableCompression: boolean;
  cachePlugins: string[];
  optimizationPlugins: string[];
  pageBuilderOptimizations: PageBuilderOptimization[];
} {
  const optimizationPlugins = plugins.filter(plugin => 
    ['WP Rocket', 'Autoptimize', 'W3 Total Cache', 'LiteSpeed Cache', 'WP Super Cache', 'WP Fastest Cache'].includes(plugin)
  );
  
  const cachePlugins = plugins.filter(plugin =>
    ['WP Rocket', 'W3 Total Cache', 'LiteSpeed Cache', 'WP Super Cache', 'WP Fastest Cache'].includes(plugin)
  );
  
  const pageBuilderOptimizations = getPageBuilderOptimizations(pageBuilder);
  
  return {
    canOptimizeCSS: plugins.some(plugin => ['WP Rocket', 'Autoptimize', 'W3 Total Cache'].includes(plugin)),
    canOptimizeJS: plugins.some(plugin => ['WP Rocket', 'Autoptimize', 'W3 Total Cache'].includes(plugin)),
    canOptimizeImages: plugins.some(plugin => ['WP Rocket', 'Autoptimize'].includes(plugin)),
    canEnableCompression: plugins.some(plugin => ['WP Rocket', 'W3 Total Cache', 'LiteSpeed Cache'].includes(plugin)),
    cachePlugins,
    optimizationPlugins,
    pageBuilderOptimizations
  };
}

interface PageBuilderOptimization {
  name: string;
  category: 'css' | 'javascript' | 'images' | 'fonts' | 'general';
  title: string;
  description: string;
  instructions: string[];
  impact: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function getPageBuilderOptimizations(pageBuilder?: string): PageBuilderOptimization[] {
  if (!pageBuilder) return [];
  
  const optimizations: PageBuilderOptimization[] = [];
  
  if (pageBuilder === 'Elementor') {
    optimizations.push(
      {
        name: 'Elementor CSS Print Method',
        category: 'css',
        title: 'Optimize Elementor CSS Loading',
        description: 'Configure Elementor to load CSS more efficiently and reduce render-blocking',
        instructions: [
          'Go to Elementor → Settings → Advanced',
          'Set "CSS Print Method" to "Internal Embedding"',
          'Enable "Optimize CSS Loading" if available',
          'Consider enabling "Improved CSS Loading" for better Core Web Vitals'
        ],
        impact: 'Medium',
        difficulty: 'Easy'
      },
      {
        name: 'Elementor Font Loading',
        category: 'fonts',
        title: 'Optimize Font Loading in Elementor',
        description: 'Reduce font-related performance issues and layout shifts',
        instructions: [
          'Go to Elementor → Settings → Advanced',
          'Disable "Load Google Fonts Locally" if using a CDN',
          'Enable "Preload Local Fonts" if loading fonts locally',
          'Set "Google Fonts Display" to "swap" for better loading'
        ],
        impact: 'Medium',
        difficulty: 'Easy'
      },
      {
        name: 'Elementor Asset Optimization',
        category: 'general',
        title: 'Enable Elementor Experiments for Performance',
        description: 'Use Elementor\'s built-in performance experiments',
        instructions: [
          'Go to Elementor → Settings → Experiments',
          'Enable "Improved Asset Loading" if available',
          'Enable "Optimized DOM Output" for cleaner HTML',
          'Enable "Container" feature for better structure',
          'Test thoroughly after enabling experiments'
        ],
        impact: 'High',
        difficulty: 'Medium'
      }
    );
  }
  
  if (pageBuilder === 'Divi') {
    optimizations.push(
      {
        name: 'Divi Performance Settings',
        category: 'general',
        title: 'Configure Divi Performance Options',
        description: 'Enable Divi\'s built-in performance features',
        instructions: [
          'Go to Divi → Theme Options → Builder → Advanced',
          'Enable "Static CSS File Generation"',
          'Enable "Dynamic CSS" for better caching',
          'Enable "Divi Cache" if available',
          'Consider enabling "Critical CSS" for above-fold content'
        ],
        impact: 'High',
        difficulty: 'Easy'
      },
      {
        name: 'Divi Font Optimization',
        category: 'fonts',
        title: 'Optimize Font Loading in Divi',
        description: 'Improve font loading performance',
        instructions: [
          'Go to Divi → Theme Options → General → Performance',
          'Disable unused Google Fonts',
          'Enable "Defer jQuery And jQuery Migrate"',
          'Consider using system fonts for better performance'
        ],
        impact: 'Medium',
        difficulty: 'Easy'
      }
    );
  }
  
  if (pageBuilder === 'Beaver Builder') {
    optimizations.push(
      {
        name: 'Beaver Builder Cache Settings',
        category: 'general',
        title: 'Enable Beaver Builder Caching',
        description: 'Improve page loading with Beaver Builder cache',
        instructions: [
          'Go to Settings → Beaver Builder → Advanced',
          'Enable "CSS & JavaScript Cache"',
          'Set cache expiration appropriately',
          'Clear cache after major changes'
        ],
        impact: 'Medium',
        difficulty: 'Easy'
      }
    );
  }
  
  if (pageBuilder === 'WPBakery Page Builder') {
    optimizations.push(
      {
        name: 'WPBakery Asset Loading',
        category: 'css',
        title: 'Optimize WPBakery CSS/JS Loading',
        description: 'Reduce render-blocking resources from WPBakery',
        instructions: [
          'Go to WPBakery Page Builder → Role Manager',
          'Disable "Design Options" if not used',
          'Remove unused WPBakery elements to reduce CSS',
          'Consider using a performance plugin to defer WPBakery CSS'
        ],
        impact: 'Medium',
        difficulty: 'Medium'
      }
    );
  }
  
  if (pageBuilder === 'Fusion Builder (Avada)') {
    optimizations.push(
      {
        name: 'Avada Performance Settings',
        category: 'general',
        title: 'Configure Avada Performance Options',
        description: 'Enable Avada\'s performance features',
        instructions: [
          'Go to Avada → Theme Options → Performance',
          'Enable "CSS Compiling Method" → File',
          'Enable "JS Compiler" for better loading',
          'Enable "Disable Emojis" if not needed',
          'Configure "Dynamic CSS & JS" settings'
        ],
        impact: 'High',
        difficulty: 'Easy'
      }
    );
  }
  
  return optimizations;
}