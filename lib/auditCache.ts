/**
 * Smart caching service for audit results
 * Caches Lighthouse results and page metadata for 24 hours
 * Reduces redundant API calls and speeds up repeat audits
 */

interface CachedPageData {
  url: string;
  lighthouse?: {
    desktop: {
      lcp: number;
      cls: number;
      inp: number;
      score: number;
    };
    mobile: {
      lcp: number;
      cls: number;
      inp: number;
      score: number;
    };
  };
  metadata?: {
    title: string;
    description: string;
    hasH1: boolean;
    imageCount: number;
    statusCode: number;
  };
  images?: Array<{
    url: string;
    sizeKB: number;
    format: string;
  }>;
  cachedAt: string;
  expiresAt: string;
}

interface CacheStorage {
  [url: string]: CachedPageData;
}

// In-memory cache (for Railway - can be upgraded to Redis later)
const cache: CacheStorage = {};

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
  try {
    const urlObj = new URL(url);
    // Normalize URL (remove trailing slash, lowercase)
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Check if cached data is still valid
 */
function isValidCache(data: CachedPageData): boolean {
  const expiresAt = new Date(data.expiresAt);
  return expiresAt > new Date();
}

/**
 * Get cached page data if available and valid
 */
export function getCachedPageData(url: string): CachedPageData | null {
  const key = getCacheKey(url);
  const data = cache[key];

  if (!data) {
    return null;
  }

  if (!isValidCache(data)) {
    // Remove expired cache
    delete cache[key];
    return null;
  }

  console.log(`✅ Cache HIT: ${url}`);
  return data;
}

/**
 * Cache page data
 */
export function setCachedPageData(url: string, data: Partial<CachedPageData>): void {
  const key = getCacheKey(url);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  cache[key] = {
    url,
    ...data,
    cachedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  } as CachedPageData;

  console.log(`💾 Cached: ${url} (expires in 24h)`);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): number {
  let cleared = 0;
  const now = new Date();

  for (const [key, data] of Object.entries(cache)) {
    if (new Date(data.expiresAt) <= now) {
      delete cache[key];
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🗑️  Cleared ${cleared} expired cache entries`);
  }

  return cleared;
}

/**
 * Clear all cache (useful for testing)
 */
export function clearAllCache(): void {
  const count = Object.keys(cache).length;
  for (const key in cache) {
    delete cache[key];
  }
  console.log(`🗑️  Cleared all cache (${count} entries)`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  oldestEntry: string | null;
  newestEntry: string | null;
} {
  const entries = Object.values(cache);
  const now = new Date();

  const valid = entries.filter(e => new Date(e.expiresAt) > now);
  const expired = entries.filter(e => new Date(e.expiresAt) <= now);

  const oldest = entries.length > 0
    ? entries.reduce((prev, curr) => new Date(prev.cachedAt) < new Date(curr.cachedAt) ? prev : curr)
    : null;

  const newest = entries.length > 0
    ? entries.reduce((prev, curr) => new Date(prev.cachedAt) > new Date(curr.cachedAt) ? prev : curr)
    : null;

  return {
    totalEntries: entries.length,
    validEntries: valid.length,
    expiredEntries: expired.length,
    oldestEntry: oldest?.cachedAt || null,
    newestEntry: newest?.cachedAt || null,
  };
}

// Auto-cleanup expired entries every hour
setInterval(() => {
  clearExpiredCache();
}, 60 * 60 * 1000);
