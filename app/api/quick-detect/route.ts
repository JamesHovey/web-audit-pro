import { NextRequest, NextResponse } from "next/server"
import { BrowserService } from '@/lib/cloudflare-browser'
import { detectWordPressPlugins } from '@/lib/pluginDetectionService'

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
      html: ['jekyll']
    }
  },
  {
    name: 'Hugo',
    patterns: {
      meta: ['hugo'],
      html: ['hugo']
    }
  },
  {
    name: 'Gatsby',
    patterns: {
      meta: ['gatsby'],
      html: ['gatsby', '___gatsby', 'gatsby-']
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
      // Navigate with shorter timeout for quick detection
      const response = await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded', // Faster than networkidle0
        timeout: 10000
      });

      // Wait briefly for essential content to load (e.g., JavaScript-rendered CMS signatures)
      await new Promise(resolve => setTimeout(resolve, 500));

      const html = await page.content();

      // Get response headers from the main document
      const headers: Record<string, string> = {};
      if (response) {
        const responseHeaders = response.headers();
        Object.assign(headers, responseHeaders);
      }

      return { html, headers };
    });

    const { html, headers } = browserResult;
    const lowerHtml = html.toLowerCase();

    const result: QuickTechInfo = {}

    // Detect CMS using comprehensive pattern matching
    const cmsDetection = detectCMS(html, lowerHtml, headers)
    if (cmsDetection) {
      result.cms = cmsDetection.name
      result.cmsVersion = cmsDetection.version
    }

    // WordPress Plugin Detection (sophisticated detection)
    if (result.cms === 'WordPress') {
      const wpDetection = detectWordPressPlugins(html);
      if (wpDetection.plugins && wpDetection.plugins.length > 0) {
        result.plugins = wpDetection.plugins;
      }
      if (wpDetection.pageBuilder) {
        result.pageBuilder = wpDetection.pageBuilder;
      }
    }

    // PHP Version Detection from headers
    const xPoweredBy = headers['x-powered-by']?.toLowerCase() || ''
    if (xPoweredBy.includes('php')) {
      const phpVersionMatch = xPoweredBy.match(/php\/([0-9.]+)/i)
      if (phpVersionMatch) {
        result.phpVersion = phpVersionMatch[1]
      }
    }

    // E-commerce Detection (basic patterns)
    if (result.cms === 'WordPress' && lowerHtml.includes('woocommerce')) {
      result.ecommerce = 'WooCommerce'
    } else if (result.cms === 'Shopify') {
      result.ecommerce = 'Shopify'
    } else if (lowerHtml.includes('bigcommerce')) {
      result.ecommerce = 'BigCommerce'
    } else if (lowerHtml.includes('magento')) {
      result.ecommerce = 'Magento'
    }

    // Framework Detection with version (quick patterns)
    if (lowerHtml.includes('next.js') || lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest')) {
      result.framework = 'Next.js'
      // Try to extract Next.js version from buildManifest or meta tags
      const nextVersionMatch = html.match(/next[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (nextVersionMatch) {
        result.frameworkVersion = nextVersionMatch[1]
      }
    } else if (lowerHtml.includes('react') || lowerHtml.includes('_react')) {
      result.framework = 'React'
      // Try to extract React version
      const reactVersionMatch = html.match(/react[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (reactVersionMatch) {
        result.frameworkVersion = reactVersionMatch[1]
      }
    } else if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue')) {
      result.framework = 'Vue.js'
      // Try to extract Vue version
      const vueVersionMatch = html.match(/vue[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (vueVersionMatch) {
        result.frameworkVersion = vueVersionMatch[1]
      }
    } else if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version')) {
      result.framework = 'Angular'
      // Extract Angular version from ng-version attribute
      const ngVersionMatch = html.match(/ng-version=["']([0-9.]+)["']/i)
      if (ngVersionMatch) {
        result.frameworkVersion = ngVersionMatch[1]
      }
    } else if (lowerHtml.includes('gatsby')) {
      result.framework = 'Gatsby'
      const gatsbyVersionMatch = html.match(/gatsby[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (gatsbyVersionMatch) {
        result.frameworkVersion = gatsbyVersionMatch[1]
      }
    } else if (lowerHtml.includes('nuxt')) {
      result.framework = 'Nuxt.js'
      const nuxtVersionMatch = html.match(/nuxt[^\d]*([0-9]+\.[0-9]+\.[0-9]+)/i)
      if (nuxtVersionMatch) {
        result.frameworkVersion = nuxtVersionMatch[1]
      }
    }

    // CDN Detection
    if (headers['cf-ray'] || headers['cf-cache-status']) {
      result.cdn = 'Cloudflare'
    } else if (headers['x-amz-cf-id']) {
      result.cdn = 'CloudFront'
    } else if (headers['x-served-by'] && headers['x-served-by'].includes('fastly')) {
      result.cdn = 'Fastly'
    }

    // Hosting Detection (basic patterns)
    const server = headers.server?.toLowerCase() || ''
    if (result.cms === 'Shopify') {
      result.hosting = 'Shopify'
    } else if (result.cms === 'Wix') {
      result.hosting = 'Wix'
    } else if (result.cms === 'Squarespace') {
      result.hosting = 'Squarespace'
    } else if (server.includes('cloudflare') || result.cdn === 'Cloudflare') {
      result.hosting = 'Cloudflare'
    } else if (lowerHtml.includes('amazonaws.com') || result.cdn === 'CloudFront') {
      result.hosting = 'AWS'
    } else if (headers['x-vercel-id'] || lowerHtml.includes('_vercel') || lowerHtml.includes('vercel.app')) {
      result.hosting = 'Vercel'
    } else if (headers['x-nf-request-id'] || lowerHtml.includes('netlify.app') || lowerHtml.includes('netlify.com/v1/')) {
      result.hosting = 'Netlify'
    } else if (lowerHtml.includes('digitaloceanspaces.com') || lowerHtml.includes('cdn.digitalocean')) {
      result.hosting = 'DigitalOcean'
    } else if (lowerHtml.includes('googleusercontent.com') || lowerHtml.includes('googleapis.com')) {
      result.hosting = 'Google Cloud'
    }

    return result

  } catch (error) {
    console.error('Quick tech detection error:', error)
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
