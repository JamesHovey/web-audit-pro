// PROFESSIONAL TECHNOLOGY DETECTION
// Using direct website analysis for cost-effective, accurate technology detection

import { detectHostingProvider } from './enhancedHostingDetection';
import { detectPluginsHybrid, generateDetectionSummary, checkMissingEssentials } from './hybridPluginDetection';
import { detectDrupalModules } from './cms-detection/drupalModuleDetection';
import { detectJoomlaExtensions } from './cms-detection/joomlaExtensionDetection';
import { detectShopifyApps } from './cms-detection/shopifyAppDetection';
import { detectMagentoExtensions } from './cms-detection/magentoExtensionDetection';
import { detectPrestashopModules } from './cms-detection/prestashopModuleDetection';
import { BrowserService } from './cloudflare-browser';
import { detectWordPressPlugins } from './pluginDetectionService';

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

      // CRITICAL: Ensure hosting is always a string, never undefined or an object
      if (result.hosting && typeof result.hosting !== 'string') {
        console.warn(`⚠️ Hosting was not a string (type: ${typeof result.hosting}), converting to string`)
        result.hosting = String(result.hosting)
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
// Uses Puppeteer to bypass bot protection (403 errors)
async function analyzeWebsiteDirectly(url: string): Promise<Omit<TechStackResult, 'source' | 'confidence'> | null> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // Use browser rendering to bypass bot protection (same as quick-detect)
    const browserResult = await BrowserService.withBrowser(async (browser, page) => {
      const response = await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Wait for JavaScript to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      const html = await page.content();

      // Get response headers
      const headers: Record<string, string> = {};
      if (response) {
        const responseHeaders = response.headers();
        Object.assign(headers, responseHeaders);
      }

      return { html, headers };
    });

    const { html, headers } = browserResult;
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

        // Filter out non-WordPress-plugins (analytics, CDNs, libraries, etc.)
        const NON_PLUGIN_KEYWORDS = [
          'google analytics',
          'google analytics 4',
          'ga4',
          'gtag',
          'jquery',
          'cloudfront',
          'cloudflare',
          'fastly',
          'akamai',
          'facebook pixel',
          'google tag manager',
          'gtm',
          'hotjar',
          'mixpanel',
          'segment',
          'amplitude',
          'heap',
          'bootstrap',
          'tailwind',
          'font awesome',
          'react',
          'vue',
          'angular',
          'next.js',
          'gatsby',
          'nuxt',
          'nginx',
          'apache',
          'litespeed',
          'iis',
          'aws',
          'azure',
          'google cloud',
          'digitalocean'
        ];

        const isActualPlugin = (pluginName: string): boolean => {
          const lowerName = pluginName.toLowerCase().trim();
          return !NON_PLUGIN_KEYWORDS.some(keyword => lowerName.includes(keyword));
        };

        // Categorize plugins for easy access (excluding non-plugins)
        const categorized: Record<string, any[]> = {};
        for (const plugin of hybridResult.detectedPlugins) {
          // Skip if not an actual WordPress plugin
          if (!isActualPlugin(plugin.name)) {
            console.log(`⚠️ Filtered out non-plugin: ${plugin.name}`);
            continue;
          }

          const category = plugin.category || 'other';
          if (!categorized[category]) {
            categorized[category] = [];
          }
          categorized[category].push(plugin);
        }

        result.plugins = categorized;

        // Update total plugin count (excluding filtered items)
        const actualPluginCount = Object.values(categorized).reduce((sum, plugins) => sum + plugins.length, 0);
        result.totalPlugins = actualPluginCount;

        // Update specific fields based on detected plugins
        const ecommercePlugins = categorized.ecommerce;
        if (ecommercePlugins && ecommercePlugins.length > 0) {
          result.ecommerce = ecommercePlugins[0].name;
        }

        const pageBuilders = categorized['page-builder'];
        if (pageBuilders && pageBuilders.length > 0) {
          result.pageBuilder = pageBuilders[0].name;
        }

        // Check for missing essential plugins (use only actual plugins)
        const actualPlugins = Object.values(categorized).flat();
        const missingEssentials = checkMissingEssentials(platform, actualPlugins);
        result.missingEssentials = missingEssentials;

        console.log(`✅ Hybrid plugin detection complete: ${actualPluginCount} actual WordPress plugins detected (${hybridResult.totalPluginsDetected - actualPluginCount} non-plugins filtered out)`);
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
      } else if (generator.toLowerCase().includes('magento')) {
        result.cms = 'Magento';
      } else if (generator.toLowerCase().includes('prestashop')) {
        result.cms = 'PrestaShop';
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
      } else if (lowerHtml.includes('mage/') || lowerHtml.includes('/skin/frontend/') || lowerHtml.includes('/media/catalog/') || lowerHtml.includes('mage.cookies') || lowerHtml.includes('var/magento')) {
        result.cms = 'Magento';
      } else if (lowerHtml.includes('prestashop') || lowerHtml.includes('/modules/blockwishlist/') || lowerHtml.includes('/modules/blockcart/') || lowerHtml.includes('/themes/classic/') || lowerHtml.includes('/modules/ps_')) {
        result.cms = 'PrestaShop';
      } else if (lowerHtml.includes('squarespace') || lowerHtml.includes('squarespace-cdn')) {
        result.cms = 'Squarespace';
      } else if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic.com')) {
        result.cms = 'Wix';
      } else if (lowerHtml.includes('webflow.com') || lowerHtml.includes('webflow-assets')) {
        result.cms = 'Webflow';
      } else if (lowerHtml.includes('hubspot') || lowerHtml.includes('hs-scripts.com')) {
        result.cms = 'HubSpot CMS';
      } else {
        // No CMS detected - mark as custom-built
        result.cms = 'Custom';
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
    
    // ANALYTICS DETECTION (enhanced for async-loaded scripts)
    if (lowerHtml.includes('google-analytics') ||
        lowerHtml.includes('gtag') ||
        lowerHtml.includes('ga(') ||
        lowerHtml.includes('googletagmanager.com/gtag/') ||
        lowerHtml.includes('ga.js') ||
        lowerHtml.includes('analytics.js') ||
        lowerHtml.includes('g-') || // GA4 measurement IDs
        lowerHtml.includes('gtm-') || // GTM IDs
        lowerHtml.includes('ua-')) { // Universal Analytics
      if (lowerHtml.includes('gtm.js') || lowerHtml.includes('googletagmanager')) {
        result.analytics = 'Google Tag Manager';
      } else {
        result.analytics = 'Google Analytics';
      }
    } else if (lowerHtml.includes('adobe-analytics') || lowerHtml.includes('omniture')) {
      result.analytics = 'Adobe Analytics';
    } else if (lowerHtml.includes('matomo') || lowerHtml.includes('piwik')) {
      result.analytics = 'Matomo';
    } else if (lowerHtml.includes('hotjar')) {
      result.analytics = 'Hotjar';
    } else if (lowerHtml.includes('mixpanel')) {
      result.analytics = 'Mixpanel';
    } else if (lowerHtml.includes('plausible')) {
      result.analytics = 'Plausible';
    } else if (lowerHtml.includes('fathom')) {
      result.analytics = 'Fathom Analytics';
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
    
    // HOSTING DETECTION from headers and patterns (Enhanced)
    // Check multiple sources for accurate detection
    if (headers['x-powered-by']?.toLowerCase().includes('wpe')) {
      result.hosting = 'WP Engine';
    } else if (headers['x-kinsta-cache'] || lowerHtml.includes('kinsta.com')) {
      result.hosting = 'Kinsta';
    } else if (headers['x-pantheon-styx-hostname'] || lowerHtml.includes('pantheon')) {
      result.hosting = 'Pantheon';
    } else if (headers['x-flywheel-site'] || lowerHtml.includes('getflywheel')) {
      result.hosting = 'Flywheel';
    } else if (headers['x-siteground-hash'] || lowerHtml.includes('siteground')) {
      result.hosting = 'SiteGround';
    } else if (headers['x-ah-environment'] || lowerHtml.includes('acquia')) {
      result.hosting = 'Acquia';
    } else if (server.includes('cloudflare') || headers['cf-ray']) {
      // Note: Cloudflare is often a CDN, not origin hosting
      result.hosting = 'Cloudflare Pages';
    } else if (headers['x-github-request-id'] || lowerHtml.includes('github.io')) {
      result.hosting = 'GitHub Pages';
    } else if (server.includes('amazonaws') || lowerHtml.includes('amazonaws.com') || lowerHtml.includes('aws')) {
      result.hosting = 'AWS';
    } else if (lowerHtml.includes('digitalocean') || lowerHtml.includes('do-spaces')) {
      result.hosting = 'DigitalOcean';
    } else if (lowerHtml.includes('googleusercontent') || lowerHtml.includes('googleapis') || lowerHtml.includes('gcp')) {
      result.hosting = 'Google Cloud';
    } else if (lowerHtml.includes('azure') || lowerHtml.includes('azurewebsites')) {
      result.hosting = 'Microsoft Azure';
    } else if (lowerHtml.includes('netlify') || headers['x-nf-request-id']) {
      result.hosting = 'Netlify';
    } else if (lowerHtml.includes('vercel') || headers['x-vercel-id']) {
      result.hosting = 'Vercel';
    } else if (headers['x-served-by']?.includes('heroku') || lowerHtml.includes('herokuapp')) {
      result.hosting = 'Heroku';
    } else if (lowerHtml.includes('railway.app') || headers['x-railway']) {
      result.hosting = 'Railway';
    } else if (lowerHtml.includes('render.com')) {
      result.hosting = 'Render';
    } else if (headers['x-drupal-cache'] || headers['x-drupal-dynamic-cache']) {
      result.hosting = 'Drupal Hosting';
    } else if (server.includes('nginx') && !result.hosting) {
      // Generic fallback for nginx without specific host
      result.hosting = 'VPS/Dedicated Server (Nginx)';
    } else if (server.includes('apache') && !result.hosting) {
      // Generic fallback for apache without specific host
      result.hosting = 'VPS/Dedicated Server (Apache)';
    } else if (server.includes('litespeed') && !result.hosting) {
      result.hosting = 'LiteSpeed Server';
    }
    
    // WordPress Plugin Detection (Sophisticated - uses shared service)
    if (result.cms === 'WordPress') {
      const wpDetection = detectWordPressPlugins(html);
      if (wpDetection.plugins && wpDetection.plugins.length > 0) {
        result.plugins = wpDetection.plugins;
      }
      if (wpDetection.pageBuilder) {
        result.pageBuilder = wpDetection.pageBuilder;
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