// PROFESSIONAL TECHNOLOGY DETECTION
// Using direct website analysis for cost-effective, accurate technology detection

import { detectHostingProvider } from './enhancedHostingDetection';
import { detectPluginsHybrid, generateDetectionSummary, checkMissingEssentials } from './hybridPluginDetection';
import { detectDrupalModules } from './cms-detection/drupalModuleDetection';
import { detectJoomlaExtensions } from './cms-detection/joomlaExtensionDetection';
import { detectShopifyApps } from './cms-detection/shopifyAppDetection';
import { detectMagentoExtensions } from './cms-detection/magentoExtensionDetection';
import { detectPrestashopModules } from './cms-detection/prestashopModuleDetection';

interface TechStackResult {
  cms?: string;
  framework?: string;
  pageBuilder?: string;
  plugins: string[];
  analytics?: string;
  hosting?: string;
  cdn?: string;
  organization?: string;
  other: string[];
  source: 'direct' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
}

// Enhanced technology detection using direct website analysis
export async function detectTechStack(url: string): Promise<TechStackResult> {
  try {
    console.log(`🔍 Analyzing tech stack for: ${url}`);
    
    // Primary method: Direct website analysis + Enhanced hosting detection
    const [result, hostingInfo] = await Promise.all([
      analyzeWebsiteDirectly(url),
      detectHostingProvider(url)
    ]);
    
    if (result && (result.cms || result.framework || result.analytics || result.other.length > 0)) {
      console.log('✅ Used Direct Website Analysis + Enhanced Hosting Detection');
      
      // Override hosting info with enhanced detection if available
      if (hostingInfo.provider) {
        result.hosting = hostingInfo.provider;
        result.organization = hostingInfo.organization;
        
        // Special handling for Cloudflare bypass attempts
        if (hostingInfo.method === 'cloudflare-bypass') {
          console.log(`🔍 Applied Cloudflare bypass result: ${hostingInfo.provider}`);
        }
      }
      
      
      return { ...result, source: 'direct', confidence: 'high' };
    }
    
    // Fallback to conservative analysis if direct analysis fails
    console.log('⚠️ Direct analysis failed, using conservative manual analysis');
    const manualResult = await analyzeConservatively(url);
    return { ...manualResult, source: 'fallback', confidence: 'low' };
    
  } catch (error) {
    console.error('❌ Error in tech detection:', error);
    return {
      plugins: [],
      other: [],
      source: 'fallback',
      confidence: 'low'
    };
  }
}

// Direct website analysis function that fetches and analyzes a URL
async function analyzeWebsiteDirectly(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(cleanUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      console.log(`Direct analysis failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    
    const result = await analyzeHTMLAndHeaders(html, headers, cleanUrl);
    
    // Hybrid Plugin Detection (Pattern Matching + AI) - Only for WordPress
    if (result.cms === 'WordPress') {
      console.log('🔄 Running hybrid plugin detection for WordPress (Pattern + AI)...');
      try {
        const platform = result.cms;
        const hybridResult = await detectPluginsHybrid(platform, html, headers, cleanUrl);

        // Log detection summary
        console.log(generateDetectionSummary(hybridResult));

        // Enhance the result with hybrid detection
        result.pluginAnalysis = hybridResult.platformAnalysis;
        result.detectedPlatform = hybridResult.platformAnalysis?.platform || platform;
        result.totalPlugins = hybridResult.totalPluginsDetected;

        // Categorize plugins for easy access
        const categorized: Record<string, any[]> = {};
        for (const plugin of hybridResult.detectedPlugins) {
          const category = plugin.category || 'other';
          if (!categorized[category]) {
            categorized[category] = [];
          }
          categorized[category].push(plugin);
        }

        result.plugins = categorized;

        // Update specific fields based on detected plugins
        const ecommercePlugins = categorized.ecommerce;
        if (ecommercePlugins && ecommercePlugins.length > 0) {
          result.ecommerce = ecommercePlugins[0].name;
        }

        const pageBuilders = categorized['page-builder'];
        if (pageBuilders && pageBuilders.length > 0) {
          result.pageBuilder = pageBuilders[0].name;
        }

        // Check for missing essential plugins
        const missingEssentials = checkMissingEssentials(platform, hybridResult.detectedPlugins);
        result.missingEssentials = missingEssentials;

        console.log(`✅ Hybrid plugin detection complete: ${hybridResult.totalPluginsDetected} plugins detected via ${hybridResult.detectionMethod}`);
      } catch (error) {
        console.error('Hybrid plugin detection failed, continuing with basic detection:', error);
      }
    } else if (result.cms === 'Drupal') {
      // Drupal Module Detection
      console.log('🔄 Running Drupal module detection...');
      try {
        const drupalResult = detectDrupalModules(html, headers);

        // Enhance the result with Drupal module detection
        result.pluginAnalysis = {
          platform: 'Drupal',
          totalPluginsDetected: drupalResult.totalModules,
          pluginsByCategory: drupalResult.modulesByCategory,
          securityAssessment: {
            vulnerablePlugins: drupalResult.securityRisks.map(m => ({
              name: m.displayName,
              severity: m.security?.severity || 'low',
              cve: undefined
            })),
            riskLevel: drupalResult.securityRisks.length > 0 ? 'medium' : 'low'
          },
          performanceAssessment: {
            heavyPlugins: drupalResult.performanceImpact.map(m => m.displayName),
            overallImpact: drupalResult.performanceImpact.length > 2 ? 'high' :
                           drupalResult.performanceImpact.length > 0 ? 'medium' : 'low'
          },
          recommendations: drupalResult.recommendations
        };

        result.totalPlugins = drupalResult.totalModules;
        result.plugins = drupalResult.modulesByCategory;

        console.log(`✅ Drupal module detection complete: ${drupalResult.totalModules} modules detected`);
      } catch (error) {
        console.error('Drupal module detection failed:', error);
      }
    } else if (result.cms === 'Joomla') {
      // Joomla Extension Detection
      console.log('🔄 Running Joomla extension detection...');
      try {
        const joomlaResult = detectJoomlaExtensions(html, headers);

        result.pluginAnalysis = {
          platform: 'Joomla',
          totalPluginsDetected: joomlaResult.totalExtensions,
          pluginsByCategory: joomlaResult.extensionsByCategory,
          recommendations: joomlaResult.recommendations
        };

        result.totalPlugins = joomlaResult.totalExtensions;
        result.plugins = joomlaResult.extensionsByCategory;

        console.log(`✅ Joomla extension detection complete: ${joomlaResult.totalExtensions} extensions detected`);
      } catch (error) {
        console.error('Joomla extension detection failed:', error);
      }
    } else if (result.cms === 'Shopify') {
      // Shopify App Detection
      console.log('🔄 Running Shopify app detection...');
      try {
        const shopifyResult = detectShopifyApps(html, headers);

        result.pluginAnalysis = {
          platform: 'Shopify',
          totalPluginsDetected: shopifyResult.totalApps,
          pluginsByCategory: shopifyResult.appsByCategory,
          recommendations: shopifyResult.recommendations
        };

        result.totalPlugins = shopifyResult.totalApps;
        result.plugins = shopifyResult.appsByCategory;

        console.log(`✅ Shopify app detection complete: ${shopifyResult.totalApps} apps detected`);
      } catch (error) {
        console.error('Shopify app detection failed:', error);
      }
    } else if (result.cms === 'Magento') {
      // Magento Extension Detection
      console.log('🔄 Running Magento extension detection...');
      try {
        const magentoResult = detectMagentoExtensions(html, headers);

        result.pluginAnalysis = {
          platform: 'Magento',
          totalPluginsDetected: magentoResult.totalExtensions,
          pluginsByCategory: magentoResult.extensionsByCategory,
          recommendations: magentoResult.recommendations
        };

        result.totalPlugins = magentoResult.totalExtensions;
        result.plugins = magentoResult.extensionsByCategory;

        console.log(`✅ Magento extension detection complete: ${magentoResult.totalExtensions} extensions detected`);
      } catch (error) {
        console.error('Magento extension detection failed:', error);
      }
    } else if (result.cms === 'PrestaShop') {
      // PrestaShop Module Detection
      console.log('🔄 Running PrestaShop module detection...');
      try {
        const prestashopResult = detectPrestashopModules(html, headers);

        result.pluginAnalysis = {
          platform: 'PrestaShop',
          totalPluginsDetected: prestashopResult.totalModules,
          pluginsByCategory: prestashopResult.modulesByCategory,
          recommendations: prestashopResult.recommendations
        };

        result.totalPlugins = prestashopResult.totalModules;
        result.plugins = prestashopResult.modulesByCategory;

        console.log(`✅ PrestaShop module detection complete: ${prestashopResult.totalModules} modules detected`);
      } catch (error) {
        console.error('PrestaShop module detection failed:', error);
      }
    } else {
      console.log(`⏭️  Skipping extension detection - CMS is ${result.cms || 'Unknown'} (extension detection available for WordPress, Drupal, Joomla, Shopify, Magento, PrestaShop)`);
    }
    
    return result;
    
  } catch (error) {
    console.error('Direct analysis error:', error);
    return null;
  }
}

// Professional website analysis using Wappalyzer-like patterns
async function analyzeHTMLAndHeaders(html: string, headers: Record<string, string>, url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'>> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    const lowerHtml = html.toLowerCase();
    
    // META TAG DETECTION (most reliable method)
    const metaMatches = html.match(/<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
    if (metaMatches) {
      const generator = metaMatches[1];
      if (generator.toLowerCase().includes('wordpress')) {
        result.cms = 'WordPress';
        const versionMatch = generator.match(/wordpress\s+([\d.]+)/i);
        if (versionMatch) {
          result.other.push(`WordPress ${versionMatch[1]}`);
        }
      } else if (generator.toLowerCase().includes('drupal')) {
        result.cms = 'Drupal';
      } else if (generator.toLowerCase().includes('joomla')) {
        result.cms = 'Joomla';
      } else if (generator.toLowerCase().includes('shopify')) {
        result.cms = 'Shopify';
      } else if (generator.toLowerCase().includes('wix')) {
        result.cms = 'Wix';
      } else if (generator.toLowerCase().includes('squarespace')) {
        result.cms = 'Squarespace';
      }
    }
    
    // CMS DETECTION via file paths and signatures
    if (!result.cms) {
      if (lowerHtml.includes('/wp-content/') || lowerHtml.includes('/wp-includes/') || lowerHtml.includes('wp-emoji')) {
        result.cms = 'WordPress';
      } else if (lowerHtml.includes('/sites/default/files/') || lowerHtml.includes('drupal.js')) {
        result.cms = 'Drupal';
      } else if (lowerHtml.includes('/media/jui/') || lowerHtml.includes('joomla')) {
        result.cms = 'Joomla';
      } else if (lowerHtml.includes('shopify') && (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify-analytics'))) {
        result.cms = 'Shopify';
      } else if (lowerHtml.includes('squarespace') || lowerHtml.includes('squarespace-cdn')) {
        result.cms = 'Squarespace';
      } else if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic.com')) {
        result.cms = 'Wix';
      } else if (lowerHtml.includes('webflow.com') || lowerHtml.includes('webflow-assets')) {
        result.cms = 'Webflow';
      } else if (lowerHtml.includes('hubspot') || lowerHtml.includes('hs-scripts.com')) {
        result.cms = 'HubSpot CMS';
      }
    }
    
    // FRAMEWORK DETECTION
    if (lowerHtml.includes('react') || lowerHtml.includes('_react') || lowerHtml.includes('__react')) {
      result.framework = 'React';
    } else if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue')) {
      result.framework = 'Vue.js';
    } else if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version')) {
      result.framework = 'Angular';
    } else if (lowerHtml.includes('next.js') || lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest')) {
      result.framework = 'Next.js';
    } else if (lowerHtml.includes('gatsby') || lowerHtml.includes('___gatsby')) {
      result.framework = 'Gatsby';
    } else if (lowerHtml.includes('nuxt') || lowerHtml.includes('__nuxt')) {
      result.framework = 'Nuxt.js';
    } else if (lowerHtml.includes('svelte') || lowerHtml.includes('__svelte')) {
      result.framework = 'Svelte';
    }
    
    // ANALYTICS DETECTION
    if (lowerHtml.includes('google-analytics') || lowerHtml.includes('gtag') || lowerHtml.includes('ga(')) {
      result.analytics = 'Google Analytics';
    } else if (lowerHtml.includes('gtm.js') || lowerHtml.includes('googletagmanager')) {
      result.analytics = 'Google Tag Manager';
    } else if (lowerHtml.includes('adobe-analytics') || lowerHtml.includes('omniture')) {
      result.analytics = 'Adobe Analytics';
    } else if (lowerHtml.includes('matomo') || lowerHtml.includes('piwik')) {
      result.analytics = 'Matomo';
    } else if (lowerHtml.includes('hotjar')) {
      result.analytics = 'Hotjar';
    } else if (lowerHtml.includes('mixpanel')) {
      result.analytics = 'Mixpanel';
    }
    
    // CDN DETECTION
    if (headers['cf-ray'] || headers['cf-cache-status'] || lowerHtml.includes('cloudflare')) {
      result.cdn = 'Cloudflare';
    } else if (headers['x-served-by'] && headers['x-served-by'].includes('fastly')) {
      result.cdn = 'Fastly';
    } else if (headers['x-amz-cf-id'] || lowerHtml.includes('cloudfront')) {
      result.cdn = 'Amazon CloudFront';
    } else if (headers['x-akamai-transformed']) {
      result.cdn = 'Akamai';
    }
    
    // SERVER/HOSTING DETECTION from headers
    const server = headers.server?.toLowerCase() || '';
    if (server.includes('nginx')) result.other.push('Nginx');
    if (server.includes('apache')) result.other.push('Apache');
    if (server.includes('litespeed')) result.other.push('LiteSpeed');
    if (server.includes('iis')) result.other.push('Microsoft IIS');
    
    // HOSTING DETECTION from headers and patterns
    if (server.includes('cloudflare')) {
      result.hosting = 'Cloudflare';
    } else if (server.includes('amazonaws') || lowerHtml.includes('amazonaws.com')) {
      result.hosting = 'Amazon Web Services (AWS)';
    } else if (lowerHtml.includes('digitalocean') || lowerHtml.includes('do-spaces')) {
      result.hosting = 'DigitalOcean';
    } else if (lowerHtml.includes('googleusercontent') || lowerHtml.includes('googleapis')) {
      result.hosting = 'Google Cloud Platform';
    } else if (lowerHtml.includes('azure') || lowerHtml.includes('azurewebsites')) {
      result.hosting = 'Microsoft Azure';
    } else if (lowerHtml.includes('netlify') || headers['x-nf-request-id']) {
      result.hosting = 'Netlify';
    } else if (lowerHtml.includes('vercel') || headers['x-vercel-id']) {
      result.hosting = 'Vercel';
    }
    
    // E-COMMERCE DETECTION (strict)
    if (result.cms === 'WordPress') {
      if (lowerHtml.includes('woocommerce') && 
          (lowerHtml.includes('wc-ajax') || lowerHtml.includes('/wp-content/plugins/woocommerce/'))) {
        result.plugins.push('WooCommerce');
      }
    }
    
    // WordPress Plugin Detection
    if (result.cms === 'WordPress') {
      if (lowerHtml.includes('yoast') && lowerHtml.includes('yoast_wpseo')) {
        result.plugins.push('Yoast SEO');
      }
      if (lowerHtml.includes('elementor')) {
        result.pageBuilder = 'Elementor';
      }
      if (lowerHtml.includes('divi-theme') || lowerHtml.includes('et_pb_')) {
        result.pageBuilder = 'Divi';
      }
      if (lowerHtml.includes('wpbakery') || lowerHtml.includes('js_composer')) {
        result.pageBuilder = 'WPBakery';
      }
    }
    
    // Additional Technology Detection
    if (lowerHtml.includes('jquery')) result.other.push('jQuery');
    if (lowerHtml.includes('bootstrap')) result.other.push('Bootstrap');
    if (lowerHtml.includes('tailwind')) result.other.push('Tailwind CSS');
    if (lowerHtml.includes('font-awesome') || lowerHtml.includes('fontawesome')) result.other.push('Font Awesome');
    
  } catch (error) {
    console.error('Error in direct website analysis:', error);
  }
  
  return result;
}

// Very conservative manual analysis - only when direct analysis fails
async function analyzeConservatively(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'>> {
  const result: Omit<TechStackResult, 'source' | 'confidence'> = {
    plugins: [],
    other: []
  };
  
  try {
    console.log('⚠️ Using conservative manual analysis - may be incomplete');
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const lowerHtml = html.toLowerCase();
    
    // Only detect VERY obvious cases with multiple confirmations
    if (lowerHtml.includes('/wp-content/') && 
        lowerHtml.includes('/wp-includes/') && 
        (lowerHtml.includes('wp-emoji') || lowerHtml.includes('wordpress'))) {
      result.cms = 'WordPress';
    }
    
    // Basic server detection from response headers
    const server = response.headers.get('server')?.toLowerCase() || '';
    if (server.includes('nginx')) result.other.push('Nginx');
    if (server.includes('apache')) result.other.push('Apache');
    
    // CDN detection from headers
    if (response.headers.get('cf-ray') || response.headers.get('cf-cache-status')) {
      result.cdn = 'Cloudflare';
    }
    
  } catch (error) {
    console.error('Conservative analysis failed:', error);
  }
  
  return result;
}

// Export function to get hosting organization from detected hosting
export async function getHostingOrganization(hosting: string): Promise<string | null> {
  const organizationMap: Record<string, string> = {
    'Shopify': 'Shopify Inc.',
    'WordPress.com': 'Automattic Inc.',
    'Wix': 'Wix.com Ltd.',
    'Squarespace': 'Squarespace Inc.',
    'Webflow': 'Webflow Inc.',
    'Ghost': 'Ghost Foundation',
    'WP Engine': 'WPEngine Inc.',
    'Kinsta': 'Kinsta Inc.',
    'SiteGround': 'SiteGround Hosting Ltd.',
    'Cloudflare': 'Cloudflare Inc.',
    'Amazon CloudFront': 'Amazon Web Services Inc.',
    'Google Cloud': 'Google LLC',
    'Microsoft Azure': 'Microsoft Corporation',
    'DigitalOcean': 'DigitalOcean LLC',
    'Netlify': 'Netlify Inc.',
    'Vercel': 'Vercel Inc.',
    'GitHub Pages': 'Microsoft Corporation'
  };
  
  return organizationMap[hosting] || null;
}