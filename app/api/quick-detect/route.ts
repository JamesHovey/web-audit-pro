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

    // CMS Detection (quick patterns only)
    const metaMatches = html.match(/<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i)
    if (metaMatches) {
      const generator = metaMatches[1].toLowerCase()
      if (generator.includes('wordpress')) result.cms = 'WordPress'
      else if (generator.includes('shopify')) result.cms = 'Shopify'
      else if (generator.includes('wix')) result.cms = 'Wix'
      else if (generator.includes('squarespace')) result.cms = 'Squarespace'
      else if (generator.includes('drupal')) result.cms = 'Drupal'
      else if (generator.includes('joomla')) result.cms = 'Joomla'
    }

    if (!result.cms) {
      if (lowerHtml.includes('/wp-content/') || lowerHtml.includes('/wp-includes/')) {
        result.cms = 'WordPress'
      } else if (lowerHtml.includes('shopify') && lowerHtml.includes('cdn.shopify.com')) {
        result.cms = 'Shopify'
      } else if (lowerHtml.includes('squarespace') || lowerHtml.includes('squarespace-cdn')) {
        result.cms = 'Squarespace'
      } else if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixstatic.com')) {
        result.cms = 'Wix'
      } else if (lowerHtml.includes('webflow.com')) {
        result.cms = 'Webflow'
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
    } else if (lowerHtml.includes('amazonaws') || result.cdn === 'CloudFront') {
      result.hosting = 'AWS'
    } else if (lowerHtml.includes('vercel') || headers['x-vercel-id']) {
      result.hosting = 'Vercel'
    } else if (lowerHtml.includes('netlify') || headers['x-nf-request-id']) {
      result.hosting = 'Netlify'
    } else if (lowerHtml.includes('digitalocean')) {
      result.hosting = 'DigitalOcean'
    } else if (lowerHtml.includes('googleusercontent') || lowerHtml.includes('googleapis')) {
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
