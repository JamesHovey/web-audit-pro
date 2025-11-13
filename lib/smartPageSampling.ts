/**
 * Smart Page Sampling Utility
 *
 * Intelligently selects the most important pages from a large set
 * for comprehensive yet memory-efficient audits.
 */

export interface PageInfo {
  url: string
  title?: string
  lastModified?: Date
  priority?: number
}

export interface SamplingOptions {
  maxPages: number
  includePatterns?: string[]  // Always include URLs matching these patterns
  excludePatterns?: string[]  // Never include URLs matching these patterns
}

/**
 * Calculate URL depth (number of path segments)
 */
function getUrlDepth(url: string): number {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0)
    return pathSegments.length
  } catch {
    return 999 // Invalid URLs get lowest priority
  }
}

/**
 * Calculate page importance score (higher = more important)
 */
function calculatePageScore(page: PageInfo): number {
  let score = 100
  const url = page.url.toLowerCase()
  const urlObj = new URL(url)
  const pathname = urlObj.pathname

  // 1. Homepage gets highest priority
  if (pathname === '/' || pathname === '') {
    return 1000
  }

  // 2. URL depth penalty (shorter URLs = more important)
  const depth = getUrlDepth(url)
  score -= depth * 10

  // 3. High-value page types (boost score)
  const highValuePatterns = [
    '/products', '/product/',
    '/services', '/service/',
    '/solutions', '/solution/',
    '/about', '/contact',
    '/pricing', '/plans',
    '/blog', '/news',
    '/features', '/use-cases'
  ]

  for (const pattern of highValuePatterns) {
    if (pathname.includes(pattern)) {
      score += 50
      break
    }
  }

  // 4. Low-value page types (reduce score)
  const lowValuePatterns = [
    '/tag/', '/tags/',
    '/author/', '/authors/',
    '/page/', '/pg/',
    '/archive/', '/category/',
    '/wp-admin/', '/admin/',
    '/login/', '/signup/',
    '/cart/', '/checkout/',
    '/search', '/search?',
    '?page=', '?filter=', '?sort='
  ]

  for (const pattern of lowValuePatterns) {
    if (pathname.includes(pattern) || url.includes(pattern)) {
      score -= 50
      break
    }
  }

  // 5. Sitemap priority (if provided)
  if (page.priority !== undefined) {
    score += page.priority * 100
  }

  // 6. Recency bonus (newer content = more important)
  if (page.lastModified) {
    const daysSinceModified = (Date.now() - page.lastModified.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceModified < 30) {
      score += 30
    } else if (daysSinceModified < 90) {
      score += 15
    }
  }

  return score
}

/**
 * Filter pages based on include/exclude patterns
 */
function filterPages(pages: PageInfo[], options: SamplingOptions): PageInfo[] {
  let filtered = pages

  // Apply exclude patterns
  if (options.excludePatterns && options.excludePatterns.length > 0) {
    filtered = filtered.filter(page => {
      const url = page.url.toLowerCase()
      return !options.excludePatterns!.some(pattern => url.includes(pattern.toLowerCase()))
    })
  }

  return filtered
}

/**
 * Smart page sampling algorithm
 *
 * Prioritizes pages by importance using multiple factors:
 * - URL depth (shorter = more important)
 * - Page type (products, services > tags, pagination)
 * - Sitemap priority (if available)
 * - Last modified date (newer = more important)
 */
export function selectSmartSample(pages: PageInfo[], options: SamplingOptions): PageInfo[] {
  // Step 1: Filter out excluded patterns
  let candidatePages = filterPages(pages, options)

  // Step 2: Separate pages that must be included
  const mustIncludePages: PageInfo[] = []
  const remainingPages: PageInfo[] = []

  if (options.includePatterns && options.includePatterns.length > 0) {
    for (const page of candidatePages) {
      const url = page.url.toLowerCase()
      const mustInclude = options.includePatterns.some(pattern =>
        url.includes(pattern.toLowerCase())
      )

      if (mustInclude) {
        mustIncludePages.push(page)
      } else {
        remainingPages.push(page)
      }
    }
  } else {
    remainingPages.push(...candidatePages)
  }

  // Step 3: Calculate scores for remaining pages
  const scoredPages = remainingPages.map(page => ({
    page,
    score: calculatePageScore(page)
  }))

  // Step 4: Sort by score (highest first)
  scoredPages.sort((a, b) => b.score - a.score)

  // Step 5: Select top N pages
  const remainingSlots = Math.max(0, options.maxPages - mustIncludePages.length)
  const selectedPages = scoredPages.slice(0, remainingSlots).map(item => item.page)

  // Step 6: Combine must-include pages with selected pages
  const finalSelection = [...mustIncludePages, ...selectedPages]

  console.log(`📊 Smart sampling: Selected ${finalSelection.length} of ${pages.length} pages`)
  console.log(`   - Must include: ${mustIncludePages.length}`)
  console.log(`   - Top scored: ${selectedPages.length}`)
  console.log(`   - Filtered out: ${pages.length - candidatePages.length}`)

  return finalSelection
}

/**
 * Simple helper to convert page discovery results to PageInfo format
 */
export function toPageInfo(pages: Array<{ url: string; title?: string; lastModified?: Date }>): PageInfo[] {
  return pages.map(page => ({
    url: page.url,
    title: page.title,
    lastModified: page.lastModified
  }))
}
