import { NextRequest, NextResponse } from "next/server"

// Simple in-memory cache with 5-minute TTL
interface CacheEntry {
  data: QuickTechInfo
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

interface QuickTechInfo {
  cms?: string
  hosting?: string
  ecommerce?: string
  framework?: string
  cdn?: string
  loading?: boolean
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
function detectCMS(html: string, lowerHtml: string, headers: Record<string, string>): string | undefined {
  // Check meta generator tag first
  const metaMatches = html.match(/<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)
  if (metaMatches) {
    const generator = metaMatches[1].toLowerCase()
    for (const cms of CMS_PATTERNS) {
      if (cms.patterns.meta) {
        for (const pattern of cms.patterns.meta) {
          if (generator.includes(pattern)) {
            return cms.name
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
        return cms.name
      }
    }

    // Check headers
    if (cms.patterns.headers) {
      for (const headerPattern of cms.patterns.headers) {
        for (const [headerName, headerValue] of Object.entries(headers)) {
          if (headerName.toLowerCase().includes(headerPattern) ||
              (headerValue && headerValue.toLowerCase().includes(headerPattern))) {
            return cms.name
          }
        }
      }
    }
  }

  return undefined
}

// Lightweight tech detection - only basic patterns, no AI analysis
async function quickDetectTech(url: string): Promise<QuickTechInfo> {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    })

    if (!response.ok) {
      return {}
    }

    const html = await response.text()
    const headers = Object.fromEntries(response.headers.entries())
    const lowerHtml = html.toLowerCase()

    const result: QuickTechInfo = {}

    // Detect CMS using comprehensive pattern matching
    result.cms = detectCMS(html, lowerHtml, headers)

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

    // Framework Detection (quick patterns)
    if (lowerHtml.includes('next.js') || lowerHtml.includes('__next') || lowerHtml.includes('_buildmanifest')) {
      result.framework = 'Next.js'
    } else if (lowerHtml.includes('react') || lowerHtml.includes('_react')) {
      result.framework = 'React'
    } else if (lowerHtml.includes('vue.js') || lowerHtml.includes('__vue')) {
      result.framework = 'Vue.js'
    } else if (lowerHtml.includes('angular') || lowerHtml.includes('ng-version')) {
      result.framework = 'Angular'
    } else if (lowerHtml.includes('gatsby')) {
      result.framework = 'Gatsby'
    } else if (lowerHtml.includes('nuxt')) {
      result.framework = 'Nuxt.js'
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
