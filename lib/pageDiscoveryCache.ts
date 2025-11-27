/**
 * Page Discovery Cache using localStorage
 * Shares discovered pages across audit form and sitemap view
 */

interface CachedPageDiscovery {
  url: string
  pages: Array<{ url: string; title?: string }>
  totalFound: number
  timestamp: number
  excludedPaths?: string[]
}

const CACHE_KEY_PREFIX = 'page_discovery_'
const CACHE_VERSION = 'v10' // v10: Add permanent redirect (301/308) detection and reporting (v1.5.64)
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Get cache key for a URL
 */
function getCacheKey(url: string): string {
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
  return `${CACHE_KEY_PREFIX}${CACHE_VERSION}_${cleanUrl}`
}

/**
 * Save discovered pages to cache
 */
export function cachePageDiscovery(
  url: string,
  pages: Array<{ url: string; title?: string }>,
  totalFound: number
): void {
  if (typeof window === 'undefined') return

  const data: CachedPageDiscovery = {
    url,
    pages,
    totalFound,
    timestamp: Date.now(),
  }

  try {
    localStorage.setItem(getCacheKey(url), JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to cache page discovery:', error)
  }
}

/**
 * Get cached page discovery
 */
export function getCachedPageDiscovery(url: string): CachedPageDiscovery | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(getCacheKey(url))
    if (!cached) return null

    const data: CachedPageDiscovery = JSON.parse(cached)

    // Check if cache is still valid (within duration)
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(getCacheKey(url))
      return null
    }

    return data
  } catch (error) {
    console.warn('Failed to retrieve cached page discovery:', error)
    return null
  }
}

/**
 * Save excluded paths to cache
 */
export function cacheExcludedPaths(url: string, excludedPaths: string[]): void {
  if (typeof window === 'undefined') return

  try {
    const cached = getCachedPageDiscovery(url)
    if (cached) {
      cached.excludedPaths = excludedPaths
      localStorage.setItem(getCacheKey(url), JSON.stringify(cached))
    }
  } catch (error) {
    console.warn('Failed to cache excluded paths:', error)
  }
}

/**
 * Clear cache for a specific URL
 */
export function clearPageDiscoveryCache(url: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getCacheKey(url))
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

/**
 * Clear all expired caches and old version caches
 */
export function clearExpiredCaches(): void {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        // Remove old version caches (anything without the current version)
        if (!key.includes(`${CACHE_VERSION}_`)) {
          console.log(`🗑️ Removing old cache version: ${key}`)
          localStorage.removeItem(key)
          return
        }

        // Remove expired caches
        try {
          const data = JSON.parse(localStorage.getItem(key) || '')
          if (now - data.timestamp > CACHE_DURATION) {
            localStorage.removeItem(key)
          }
        } catch {
          // Invalid data, remove it
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.warn('Failed to clear expired caches:', error)
  }
}
