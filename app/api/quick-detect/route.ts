import { NextRequest, NextResponse } from "next/server"
import { BrowserService } from '@/lib/cloudflare-browser'
import { detectPluginsHybrid } from '@/lib/hybridPluginDetection'
import { detectTechStackHybrid } from '@/lib/hybridTechDetection'
import { detectHostingProvider } from '@/lib/dnsHostingDetection'

// Simple in-memory cache with 5-minute TTL
interface CacheEntry {
  data: QuickTechInfo
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

interface QuickTechInfo {
  cms?: string
  cmsVersion?: string
  hosting?: string
  ecommerce?: string
  framework?: string
  frameworkVersion?: string
  cdn?: string
  phpVersion?: string
  loading?: boolean
  plugins?: string[]
  pageBuilder?: string
}

// Comprehensive CMS detection patterns for top 50+ CMS platforms
interface CMSPattern {
  name: string
  patterns: {
    meta?: string[]
    html?: string[]
    headers?: string[]
    scripts?: string[]
    paths?: string[]
  }
}

const CMS_PATTERNS: CMSPattern[] = [
  {
    name: 'WordPress',
    patterns: {
      meta: ['wordpress'],
      html: ['/wp-content/', '/wp-includes/', 'wp-emoji', 'wp-json'],
      paths: ['/wp-admin/', '/wp-login.php']
    }
  },
  {
    name: 'Shopify',
    patterns: {
      meta: ['shopify'],
      html: ['cdn.shopify.com', 'shopify-analytics', 'shopify.theme'],
      headers: ['x-shopify-stage']
    }
  },
  {
    name: 'Wix',
    patterns: {
      meta: ['wix.com'],
      html: ['wix.com', 'wixstatic.com', 'parastorage.com', 'wix-code-public']
    }
  },
  {
    name: 'Squarespace',
    patterns: {
      meta: ['squarespace'],
      html: ['squarespace.com', 'squarespace-cdn', 'sqsp.net', 'squarespace.config']
    }
  },
  {
    name: 'Joomla',
    patterns: {
      meta: ['joomla'],
      html: ['/media/jui/', '/media/system/js/', 'joomla.javascript'],
      paths: ['/components/com_']
    }
  },
  {
    name: 'Drupal',
    patterns: {
      meta: ['drupal'],
      html: ['/sites/default/files/', 'drupal.js', 'drupal-settings-json', 'drupal.settings', '/core/misc/drupal.js'],
      paths: ['/core/themes/', '/sites/all/']
    }
  },
  {
    name: 'Magento',
    patterns: {
      meta: ['magento'],
      html: ['mage/cookies.js', '/skin/frontend/', 'magento', '/static/frontend/'],
      paths: ['/magento_version']
    }
  },
  {
    name: 'PrestaShop',
    patterns: {
      meta: ['prestashop'],
      html: ['prestashop', '/modules/'],
      paths: ['/themes/']
    }
  },
  {
    name: 'OpenCart',
    patterns: {
      meta: ['opencart'],
      html: ['catalog/view/javascript/common.js', 'route=product/product'],
      paths: ['/catalog/view/theme/']
    }
  },
  {
    name: 'Webflow',
    patterns: {
      meta: ['webflow'],
      html: ['webflow.com', 'webflow.js', 'wf-loading']
    }
  },
  {
    name: 'Ghost',
    patterns: {
      meta: ['ghost'],
      html: ['ghost-', '/ghost/api/', '/content/images/'],
      paths: ['/ghost/']
    }
  },
  {
    name: 'TYPO3',
    patterns: {
      meta: ['typo3'],
      html: ['typo3', 'typo3conf', 'typo3temp'],
      paths: ['/typo3conf/', '/typo3temp/']
    }
  },
  {
    name: 'Contentful',
    patterns: {
      html: ['contentful.com', 'cdn.contentful.com']
    }
  },
  {
    name: 'Craft CMS',
    patterns: {
      html: ['craftcms', 'craft.js'],
      paths: ['/cpresources/']
    }
  },
  {
    name: 'Kentico',
    patterns: {
      meta: ['kentico'],
      html: ['kentico', '/cmspages/', '/getattachment/']
    }
  },
  {
    name: 'Umbraco',
    patterns: {
      meta: ['umbraco'],
      html: ['umbraco', '/umbraco/'],
      paths: ['/umbraco/']
    }
  },
  {
    name: 'Concrete5',
    patterns: {
      meta: ['concrete5'],
      html: ['concrete5', '/concrete/'],
      paths: ['/concrete/']
    }
  },
  {
    name: 'DNN Platform',
    patterns: {
      meta: ['dotnetnuke', 'dnn'],
      html: ['dnnvariable', 'dotnetnuke', '/desktopmodules/']
    }
  },
  {
    name: 'Sitefinity',
    patterns: {
      html: ['sitefinity', 'telerik.sitefinity', '/sitefinity/']
    }
  },
  {
    name: 'Weebly',
    patterns: {
      html: ['weebly.com', 'weeblycloud.com', '_weeblyeditorinlinestylesheet']
    }
  },
  {
    name: 'BigCommerce',
    patterns: {
      html: ['bigcommerce.com', 'cdn.bcapp.dev'],
      headers: ['x-bc-storefront-type']
    }
  },
  {
    name: 'HubSpot CMS',
    patterns: {
      html: ['hubspot.com', 'hs-scripts.com', 'hubspot.net', '_hsp']
    }
  },
  {
    name: 'Adobe Experience Manager',
    patterns: {
      html: ['/etc/clientlibs/', '/etc.clientlibs/', 'aem-', 'cq-'],
      paths: ['/content/dam/']
    }
  },
  {
    name: 'Sitecore',
    patterns: {
      html: ['sitecore', '/sitecore/'],
      paths: ['/sitecore/']
    }
  },
  {
    name: 'ModX',
    patterns: {
      meta: ['modx'],
      html: ['modx', '/assets/components/']
    }
  },
  {
    name: 'Expression Engine',
    patterns: {
      html: ['expressionengine', '/themes/ee/']
    }
  },
  {
    name: 'SilverStripe',
    patterns: {
      meta: ['silverstripe'],
      html: ['silverstripe', '/framework/']
    }
  },
  {
    name: 'Textpattern',
    patterns: {
      meta: ['textpattern'],
      html: ['textpattern']
    }
  },
  {
    name: 'October CMS',
    patterns: {
      html: ['october', '/modules/system/assets/']
    }
  },
  {
    name: 'Grav',
    patterns: {
      meta: ['grav'],
      html: ['grav']
    }
  },
  {
    name: 'Jekyll',
    patterns: {
      meta: ['jekyll'],
      html: ['jekyll', 'jekyll-theme', '/_site/', 'powered by jekyll']
    }
  },
  {
    name: 'Hugo',
    patterns: {
      meta: ['hugo'],
      html: ['hugo', 'generated by hugo', 'hugo-']
    }
  },
  {
    name: 'Gatsby',
    patterns: {
      meta: ['gatsby'],
      html: ['gatsby', '___gatsby', 'gatsby-', 'gatsby-image', 'gatsby-link']
    }
  },
  {
    name: 'Eleventy',
    patterns: {
      meta: ['eleventy', '11ty'],
      html: ['eleventy', '11ty', 'generated by eleventy']
    }
  },
  {
    name: 'Astro',
    patterns: {
      meta: ['astro'],
      html: ['astro-', 'built with astro', 'astro.build']
    }
  },
  {
    name: 'Hexo',
    patterns: {
      meta: ['hexo'],
      html: ['hexo', 'powered by hexo', '/hexo/']
    }
  },
  {
    name: 'VuePress',
    patterns: {
      meta: ['vuepress'],
      html: ['vuepress', '__vuepress', 'powered by vuepress']
    }
  },
  {
    name: 'Docusaurus',
    patterns: {
      meta: ['docusaurus'],
      html: ['docusaurus', '__docusaurus', 'built with docusaurus']
    }
  },
  {
    name: 'MkDocs',
    patterns: {
      meta: ['mkdocs'],
      html: ['mkdocs', '/mkdocs/', 'generated by mkdocs']
    }
  },
  {
    name: 'Strapi',
    patterns: {
      html: ['strapi', '/api/']
    }
  },
  {
    name: 'Sanity',
    patterns: {
      html: ['sanity.io', 'cdn.sanity.io']
    }
  },
  {
    name: 'Prismic',
    patterns: {
      html: ['prismic.io', 'cdn.prismic.io']
    }
  },
  {
    name: 'Storyblok',
    patterns: {
      html: ['storyblok.com', 'a.storyblok.com']
    }
  },
  {
    name: 'Blogger',
    patterns: {
      html: ['blogger.com', 'blogspot.com', 'blogger-']
    }
  },
  {
    name: 'Medium',
    patterns: {
      html: ['medium.com', 'cdn-client.medium.com']
    }
  },
  {
    name: 'Webnode',
    patterns: {
      html: ['webnode.com', 'webnode.page']
    }
  },
  {
    name: 'SITE123',
    patterns: {
      html: ['site123.com', 'cdn-cms.site123.com']
    }
  },
  {
    name: 'Jimdo',
    patterns: {
      html: ['jimdo.com', 'jimdocdn.com']
    }
  },
  {
    name: 'Duda',
    patterns: {
      html: ['duda.co', 'dudaone.com', 'duda-site']
    }
  },
  {
    name: 'Bitrix',
    patterns: {
      html: ['bitrix', '/bitrix/']
    }
  },
  {
    name: '1C-Bitrix',
    patterns: {
      html: ['1c-bitrix', '/bitrix/']
    }
  },
  {
    name: 'phpBB',
    patterns: {
      html: ['phpbb', 'powered by phpbb']
    }
  },
  {
    name: 'vBulletin',
    patterns: {
      html: ['vbulletin', 'vb_']
    }
  },
  {
    name: 'Discourse',
    patterns: {
      html: ['discourse', 'discourse-'],
      paths: ['/discourse/']
    }
  },
  {
    name: 'MediaWiki',
    patterns: {
      meta: ['mediawiki'],
      html: ['mediawiki', '/wiki/']
    }
  }
]

// Detect CMS from patterns
function detectCMS(html: string, lowerHtml: string, headers: Record<string, string>): { name: string, version?: string } | undefined {
  // Check meta generator tag first
  const metaMatches = html.match(/<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)
  if (metaMatches) {
    const generator = metaMatches[1]
    const generatorLower = generator.toLowerCase()

    // Try to match against known CMS patterns
    for (const cms of CMS_PATTERNS) {
      if (cms.patterns.meta) {
        for (const pattern of cms.patterns.meta) {
          if (generatorLower.includes(pattern)) {
            // Extract version if present
            const versionMatch = generator.match(/(\d+\.[\d.]+)/i)
            return {
              name: cms.name,
              version: versionMatch ? versionMatch[1] : undefined
            }
          }
        }
      }
    }

    // If we found a generator tag but it doesn't match known patterns,
    // return it as a custom CMS with cleaned-up name
    if (generator && generator.length > 0 && generator.length < 100) {
      // Extract just the platform name (before version number or hyphen)
      const cleanName = generator.split(/[\s-]/)[0].trim()
      const versionMatch = generator.match(/(\d+\.[\d.]+)/i)
      console.log(`📌 Found generator meta tag: "${generator}" - treating as custom platform: "${cleanName}"`)
      return {
        name: cleanName,
        version: versionMatch ? versionMatch[1] : undefined
      }
    }
  }

  // Check HTML patterns
  for (const cms of CMS_PATTERNS) {
    // Check HTML content patterns
    if (cms.patterns.html) {
      const matchCount = cms.patterns.html.filter(pattern => lowerHtml.includes(pattern)).length
      // Require at least 2 matches for better accuracy (or 1 if only 1 pattern defined)
      if (matchCount >= Math.min(2, cms.patterns.html.length)) {
        // Try to extract version for specific CMS
        let version: string | undefined
        if (cms.name === 'WordPress') {
          // Look for WordPress version in HTML
          const wpVersionMatch = html.match(/wp-includes\/[^"']*ver=([0-9.]+)/i) ||
                                 html.match(/wordpress\s+([0-9.]+)/i)
          version = wpVersionMatch ? wpVersionMatch[1] : undefined
        } else if (cms.name === 'Drupal') {
          // Look for Drupal version
          const drupalVersionMatch = html.match(/drupal\.settings[^}]*version[^"']*["']([0-9.]+)/i) ||
                                     html.match(/drupal[^"']*([0-9]+\.[0-9]+)/i)
          version = drupalVersionMatch ? drupalVersionMatch[1] : undefined
        }
        return { name: cms.name, version }
      }
    }

    // Check headers
    if (cms.patterns.headers) {
      for (const headerPattern of cms.patterns.headers) {
        for (const [headerName, headerValue] of Object.entries(headers)) {
          if (headerName.toLowerCase().includes(headerPattern) ||
              (headerValue && headerValue.toLowerCase().includes(headerPattern))) {
            return { name: cms.name }
          }
        }
      }
    }
  }

  return undefined
}

// Lightweight tech detection - uses browser rendering to bypass 403/bot protection
async function quickDetectTech(url: string): Promise<QuickTechInfo> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    // Use browser rendering to bypass bot protection (403 errors)
    const browserResult = await BrowserService.withBrowser(async (browser, page) => {
      console.log(`⏳ Navigating to ${cleanUrl} for quick detection...`);

      // Navigate with increased timeout for reliable detection
      const response = await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded', // Faster than networkidle0
        timeout: 20000 // Increased from 10s to 20s for better reliability
      });

      console.log(`✅ Page loaded, status: ${response?.status()}`);

      // Wait for essential content to load (e.g., JavaScript-rendered CMS signatures and plugin scripts)
      // Increased from 500ms to 1500ms to match full audit detection accuracy
      await new Promise(resolve => setTimeout(resolve, 1500));

      const html = await page.content();
      console.log(`📄 HTML content length: ${html.length} characters`);

      // Get response headers from the main document
      const headers: Record<string, string> = {};
      if (response) {
        const responseHeaders = response.headers();
        Object.assign(headers, responseHeaders);
        console.log(`📋 Response headers:`, Object.keys(responseHeaders).join(', '));
      }

      return { html, headers };
    });

    const { html, headers } = browserResult;
    const lowerHtml = html.toLowerCase();

    // ============================================
    // LAYER 1: PATTERN-BASED DETECTION (FAST, FREE)
    // ============================================
    console.log(`🔍 Starting pattern-based detection...`);

    const patternResult: QuickTechInfo = {}

    // Detect CMS using comprehensive pattern matching
    const cmsDetection = detectCMS(html, lowerHtml, headers)
    if (cmsDetection) {
      patternResult.cms = cmsDetection.name
      patternResult.cmsVersion = cmsDetection.version
      console.log(`✅ CMS detected: ${cmsDetection.name}${cmsDetection.version ? ` v${cmsDetection.version}` : ''}`);
    } else {
      console.log(`⚠️ No CMS detected via patterns`);
    }

    // PHP Version Detection from headers
    const xPoweredBy = headers['x-powered-by']?.toLowerCase() || ''
    if (xPoweredBy.includes('php')) {
      const phpVersionMatch = xPoweredBy.match(/php\/([0-9.]+)/i)
      if (phpVersionMatch) {
        patternResult.phpVersion = phpVersionMatch[1]
      }
    }

    // E-commerce Detection (basic patterns)
    if (patternResult.cms === 'WordPress' && lowerHtml.includes('woocommerce')) {
      patternResult.ecommerce = 'WooCommerce'
    } else if (patternResult.cms === 'Shopify') {
      patternResult.ecommerce = 'Shopify'
    } else if (lowerHtml.includes('bigcommerce')) {
      patternResult.ecommerce = 'BigCommerce'
    } else if (lowerHtml.includes('magento')) {
      patternResult.ecommerce = 'Magento'
    }

    // Framework Detection with version (quick patterns)
    if (lowerHtml.includes('next.js') || lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest')) {
      patternResult.framework = 'Next.js'
      const nextVersionMatch = html.match(/next[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (nextVersionMatch) {
        patternResult.frameworkVersion = nextVersionMatch[1]
      }
    } else if (lowerHtml.includes('react') || lowerHtml.includes('_react')) {
      patternResult.framework = 'React'
      const reactVersionMatch = html.match(/react[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (reactVersionMatch) {
        patternResult.frameworkVersion = reactVersionMatch[1]
      }
    } else if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue')) {
      patternResult.framework = 'Vue.js'
      const vueVersionMatch = html.match(/vue[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (vueVersionMatch) {
        patternResult.frameworkVersion = vueVersionMatch[1]
      }
    } else if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version')) {
      patternResult.framework = 'Angular'
      const ngVersionMatch = html.match(/ng-version=["']([0-9.]+)["']/i)
      if (ngVersionMatch) {
        patternResult.frameworkVersion = ngVersionMatch[1]
      }
    } else if (lowerHtml.includes('gatsby')) {
      patternResult.framework = 'Gatsby'
      const gatsbyVersionMatch = html.match(/gatsby[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (gatsbyVersionMatch) {
        patternResult.frameworkVersion = gatsbyVersionMatch[1]
      }
    } else if (lowerHtml.includes('nuxt')) {
      patternResult.framework = 'Nuxt.js'
      const nuxtVersionMatch = html.match(/nuxt[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (nuxtVersionMatch) {
        patternResult.frameworkVersion = nuxtVersionMatch[1]
      }
    }

    // CDN Detection
    if (headers['cf-ray'] || headers['cf-cache-status']) {
      patternResult.cdn = 'Cloudflare'
    } else if (headers['x-amz-cf-id']) {
      patternResult.cdn = 'CloudFront'
    } else if (headers['x-served-by'] && headers['x-served-by'].includes('fastly')) {
      patternResult.cdn = 'Fastly'
    }

    // Hosting Detection (DNS-based + platform patterns)
    // Platform-specific hosting (where CMS = hosting provider)
    if (patternResult.cms === 'Shopify') {
      patternResult.hosting = 'Shopify'
    } else if (patternResult.cms === 'Wix') {
      patternResult.hosting = 'Wix'
    } else if (patternResult.cms === 'Squarespace') {
      patternResult.hosting = 'Squarespace'
    } else {
      // Use DNS-based detection for everything else
      try {
        console.log(`🔎 Attempting DNS-based hosting detection for ${url}...`)
        const dnsResult = await detectHostingProvider(url)

        if (dnsResult.provider && dnsResult.provider !== 'Bespoke') {
          patternResult.hosting = dnsResult.provider
          console.log(`✅ DNS hosting detection: ${dnsResult.provider} (${dnsResult.method}, ${dnsResult.confidence} confidence)`)
        } else {
          // Fallback to basic header/HTML patterns if DNS returns "Bespoke"
          const server = headers.server?.toLowerCase() || ''

          if (server.includes('cloudflare') || patternResult.cdn === 'Cloudflare') {
            patternResult.hosting = 'Cloudflare'
          } else if (lowerHtml.includes('amazonaws.com') || patternResult.cdn === 'CloudFront') {
            patternResult.hosting = 'AWS'
          } else if (headers['x-vercel-id'] || lowerHtml.includes('_vercel') || lowerHtml.includes('vercel.app')) {
            patternResult.hosting = 'Vercel'
          } else if (headers['x-nf-request-id'] || lowerHtml.includes('netlify.app') || lowerHtml.includes('netlify.com/v1/')) {
            patternResult.hosting = 'Netlify'
          } else if (lowerHtml.includes('digitaloceanspaces.com') || lowerHtml.includes('cdn.digitalocean')) {
            patternResult.hosting = 'DigitalOcean'
          } else if (lowerHtml.includes('googleusercontent.com') || lowerHtml.includes('googleapis.com')) {
            patternResult.hosting = 'Google Cloud'
          } else {
            // If everything fails, use "Bespoke" from DNS detection
            patternResult.hosting = dnsResult.provider
            console.log(`⚠️ Could not identify hosting provider - using "${dnsResult.provider}"`)
          }
        }
      } catch (error) {
        console.error(`❌ DNS hosting detection failed:`, error)
        // Fall back to basic patterns if DNS detection fails
        const server = headers.server?.toLowerCase() || ''

        if (server.includes('cloudflare') || patternResult.cdn === 'Cloudflare') {
          patternResult.hosting = 'Cloudflare'
        } else if (lowerHtml.includes('amazonaws.com') || patternResult.cdn === 'CloudFront') {
          patternResult.hosting = 'AWS'
        } else if (headers['x-vercel-id'] || lowerHtml.includes('_vercel') || lowerHtml.includes('vercel.app')) {
          patternResult.hosting = 'Vercel'
        } else if (headers['x-nf-request-id'] || lowerHtml.includes('netlify.app') || lowerHtml.includes('netlify.com/v1/')) {
          patternResult.hosting = 'Netlify'
        }
      }
    }

    // CRITICAL: Ensure hosting is always a string, never undefined or an object
    // This prevents React rendering errors when displaying the hosting value
    if (!patternResult.hosting || typeof patternResult.hosting !== 'string') {
      console.warn(`⚠️ Hosting was not a string (type: ${typeof patternResult.hosting}), setting to 'Not detected'`)
      patternResult.hosting = 'Not detected'
    }

    // ============================================
    // LAYER 2: HYBRID AI ENHANCEMENT (ONLY IF NEEDED)
    // ============================================
    let result: QuickTechInfo = patternResult;

    try {
      const hybridTechResult = await detectTechStackHybrid(
        html,
        headers,
        cleanUrl,
        {
          cms: patternResult.cms,
          cmsVersion: patternResult.cmsVersion,
          framework: patternResult.framework,
          frameworkVersion: patternResult.frameworkVersion,
          hosting: patternResult.hosting,
          ecommerce: patternResult.ecommerce,
          cdn: patternResult.cdn,
          phpVersion: patternResult.phpVersion,
          confidence: 'medium',
          matchCount: 0
        }
      );

      // Merge hybrid results back into final result
      result = {
        ...result,
        cms: hybridTechResult.cms || result.cms,
        cmsVersion: hybridTechResult.cmsVersion || result.cmsVersion,
        framework: hybridTechResult.framework || result.framework,
        frameworkVersion: hybridTechResult.frameworkVersion || result.frameworkVersion,
        hosting: hybridTechResult.hosting || result.hosting,
        ecommerce: hybridTechResult.ecommerce || result.ecommerce,
        cdn: hybridTechResult.cdn || result.cdn,
        phpVersion: hybridTechResult.phpVersion || result.phpVersion,
      };

      console.log(`🎯 Hybrid detection: ${hybridTechResult.detectionMethod}, ${hybridTechResult.confidence} confidence, AI used: ${hybridTechResult.aiUsed}, Cost: $${hybridTechResult.costIncurred.toFixed(3)}`);

    } catch (error) {
      console.error('⚠️ Hybrid tech detection failed, using pattern-only results:', error);
    }

    // ============================================
    // LAYER 3: WORDPRESS PLUGIN DETECTION (HYBRID)
    // ============================================
    if (result.cms === 'WordPress') {
      try {
        const hybridResult = await detectPluginsHybrid('WordPress', html, headers, cleanUrl);

        // Extract plugin names from the hybrid detection results
        // Filter out non-WordPress-plugins (analytics, CDNs, libraries, tracking scripts, etc.)
        const NON_PLUGIN_KEYWORDS = [
          'google analytics',
          'google analytics 4',
          'ga4',
          'gtag',
          'google tag manager',
          'gtm',
          'facebook pixel',
          'hotjar',
          'mixpanel',
          'segment',
          'amplitude',
          'heap',
          'jquery',
          'cloudfront',
          'cloudflare',
          'fastly',
          'akamai',
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

        const pluginNames: string[] = [];
        for (const plugin of hybridResult.detectedPlugins) {
          const lowerName = plugin.name.toLowerCase().trim();
          const isNonPlugin = NON_PLUGIN_KEYWORDS.some(keyword => lowerName.includes(keyword));

          if (!isNonPlugin) {
            pluginNames.push(plugin.name);
          } else {
            console.log(`⚠️ Filtered out non-plugin: ${plugin.name}`);
          }
        }

        if (pluginNames.length > 0) {
          result.plugins = pluginNames;
        }

        // Extract page builder if detected
        const pageBuilderPlugins = hybridResult.detectedPlugins.filter(p =>
          p.category === 'page-builder'
        );
        if (pageBuilderPlugins.length > 0) {
          result.pageBuilder = pageBuilderPlugins[0].name;
        }
      } catch (error) {
        console.error('Hybrid plugin detection failed, skipping:', error);
      }
    }

    // Log detection summary
    const detectedItems = Object.keys(result).filter(key => {
      const value = result[key as keyof QuickTechInfo];
      return value && (typeof value !== 'object' || (Array.isArray(value) && value.length > 0));
    });

    if (detectedItems.length > 0) {
      console.log(`✅ Quick detection complete for ${cleanUrl}:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`⚠️ Quick detection complete for ${cleanUrl} - NO TECHNOLOGIES DETECTED`);
      console.log(`   This could mean:`);
      console.log(`   - Site uses a static/custom framework not in our detection patterns`);
      console.log(`   - Site is heavily customized/obfuscated`);
      console.log(`   - Detection patterns need updating for this technology stack`);
    }

    return result

  } catch (error) {
    console.error('Quick tech detection error for', url, ':', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Return empty result but log the error details
    return {}
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = url.toLowerCase()
    const cached = cache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log('✅ Using cached tech detection for:', url)
      return NextResponse.json({
        success: true,
        techStack: cached.data,
        cached: true
      })
    }

    // Detect tech stack
    console.log('🔍 Quick tech detection for:', url)
    const techStack = await quickDetectTech(url)

    // Cache the result
    cache.set(cacheKey, {
      data: techStack,
      timestamp: now
    })

    // Clean up old cache entries (older than 10 minutes)
    const tenMinutesAgo = now - (10 * 60 * 1000)
    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < tenMinutesAgo) {
        cache.delete(key)
      }
    }

    return NextResponse.json({
      success: true,
      techStack,
      cached: false
    })

  } catch (error) {
    console.error('Quick detect API error:', error)
    return NextResponse.json(
      { error: 'Failed to detect technology stack', success: false },
      { status: 500 }
    )
  }
}
