"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ExternalLink, Download, RefreshCw } from 'lucide-react'
import { cachePageDiscovery, getCachedPageDiscovery, cacheExcludedPaths, clearExpiredCaches, clearPageDiscoveryCache } from "@/lib/pageDiscoveryCache"

interface DiscoveredPage {
  url: string;
  title: string;
  description?: string;
  lastModified?: string;
  source: 'sitemap' | 'internal-link' | 'homepage';
}

interface PageDiscoveryResult {
  pages: DiscoveredPage[];
  totalFound: number;
  sources: {
    sitemap: number;
    internalLinks: number;
    homepage: number;
  };
}

export default function SitemapContent({ domain }: { domain: string }) {
  const [sitemapData, setSitemapData] = useState<PageDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedPaths, setExcludedPaths] = useState<string[]>([]);

  useEffect(() => {
    // Clear old cache versions on mount
    clearExpiredCaches();

    if (domain) {
      fetchSitemapData();
    } else {
      setError("No domain provided");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // Save excluded paths to cache whenever they change
  useEffect(() => {
    if (domain && excludedPaths.length > 0) {
      const urlToCache = domain.startsWith('http') ? domain : `https://${domain}`
      cacheExcludedPaths(urlToCache, excludedPaths)
    }
  }, [excludedPaths, domain]);

  // Helper function to check if URL should be excluded
  const isPathExcluded = (url: string): boolean => {
    if (excludedPaths.length === 0) return false
    return excludedPaths.some(excludedPath => {
      try {
        const urlObj = new URL(url)
        return urlObj.pathname.startsWith(excludedPath)
      } catch {
        return url.includes(excludedPath)
      }
    })
  }

  // Helper function to extract path pattern for bulk exclusion
  const extractPathPattern = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const pathParts = pathname.split('/').filter(p => p.length > 0)
      if (pathParts.length === 0) return null
      return `/${pathParts[0]}/` // e.g., /property/
    } catch {
      return null
    }
  }

  const fetchSitemapData = async (forceRefresh = false) => {
    if (!domain) return;

    // Check cache first (unless force refresh)
    const urlToDiscover = domain.startsWith('http') ? domain : `https://${domain}`
    const cached = !forceRefresh ? getCachedPageDiscovery(urlToDiscover) : null

    if (cached) {
      console.log('📦 Using cached sitemap data for:', urlToDiscover)

      // Check for malformed URLs in cache and warn user
      const malformedUrls = cached.pages.filter(page =>
        page.url.includes('/http:') || page.url.includes('/https:')
      )

      if (malformedUrls.length > 0) {
        console.warn(`⚠️ Found ${malformedUrls.length} malformed URLs in cache. Click "Force Refresh" to fetch fresh data.`)
        malformedUrls.slice(0, 3).forEach(page => {
          console.warn(`  - ${page.url}`)
        })
      }

      // Use cached data
      const result: PageDiscoveryResult = {
        pages: cached.pages.map(page => ({
          url: page.url,
          title: page.title || page.url,
          source: 'sitemap' as const
        })),
        totalFound: cached.totalFound,
        sources: {
          sitemap: cached.totalFound,
          internalLinks: 0,
          homepage: 0
        }
      }
      setSitemapData(result)

      // Load excluded paths from cache
      if (cached.excludedPaths && cached.excludedPaths.length > 0) {
        setExcludedPaths(cached.excludedPaths)
      }

      setIsLoading(false)
      return // Skip API call
    }

    console.log('🔄 Fetching fresh sitemap data for:', urlToDiscover)

    // No cache, proceed with API call
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToDiscover }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sitemap data');
      }

      const data = await response.json();
      setSitemapData(data);

      // Cache the results
      cachePageDiscovery(urlToDiscover, data.pages, data.totalFound)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sitemap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRefresh = () => {
    // Clear cache for this domain
    const urlToDiscover = domain.startsWith('http') ? domain : `https://${domain}`
    clearPageDiscoveryCache(urlToDiscover)
    console.log('🗑️ Cache cleared, fetching fresh data...')

    // Fetch fresh data
    fetchSitemapData(true)
  }

  const exportToCSV = () => {
    if (!sitemapData || !sitemapData.pages) return;

    const headers = ['URL', 'Title', 'Source', 'Last Modified'];
    const csvContent = [
      headers.join(','),
      ...sitemapData.pages.map(page => [
        `"${page.url}"`,
        `"${page.title || 'N/A'}"`,
        `"${page.source}"`,
        `"${page.lastModified || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const hostname = domain ? new URL(domain).hostname : 'sitemap';
    a.download = `${hostname}-pages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredPages = sitemapData?.pages.filter(page => {
    // Filter by search query
    const matchesSearch = page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title?.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by excluded paths
    const notExcluded = !isPathExcluded(page.url)

    return matchesSearch && notExcluded
  }) || [];

  if (!domain) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">No domain provided in URL parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pages Discovered</h1>
              <p className="text-sm text-gray-600">{domain ? new URL(domain).hostname : ''}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleForceRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                title="Clear cache and fetch fresh sitemap data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Force Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                disabled={!sitemapData || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Stats and Search */}
          {sitemapData && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{filteredPages.length}</span> pages shown
                  {excludedPaths.length > 0 && (
                    <span className="ml-2 text-amber-700">
                      ({sitemapData.totalFound - filteredPages.length} excluded)
                    </span>
                  )}
                  {sitemapData.sources && excludedPaths.length === 0 && (
                    <span className="ml-2">
                      ({sitemapData.sources.sitemap} from sitemap, {sitemapData.sources.internalLinks} from internal links)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Search pages by URL or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Discovering pages...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchSitemapData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : sitemapData && filteredPages.length > 0 ? (
          <>
            {/* Common Paths Section */}
            {(() => {
              // Analyze pages to find common path patterns
              const pathCounts = new Map<string, number>()
              sitemapData.pages.forEach(page => {
                const pattern = extractPathPattern(page.url)
                if (pattern) {
                  pathCounts.set(pattern, (pathCounts.get(pattern) || 0) + 1)
                }
              })

              // Filter to only show paths with multiple pages and not already excluded
              const commonPaths = Array.from(pathCounts.entries())
                .filter(([path, count]) => count > 1 && !excludedPaths.includes(path))
                .sort((a, b) => b[1] - a[1]) // Sort by count descending

              if (commonPaths.length === 0) return null

              return (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-amber-900">Common Paths (Quick Exclude)</span>
                  </div>
                  <p className="text-xs text-amber-800 mb-2">Click a path to hide all pages under that path</p>
                  <div className="flex flex-wrap gap-2">
                    {commonPaths.map(([path, count]) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => {
                          if (!excludedPaths.includes(path)) {
                            setExcludedPaths(prev => [...prev, path])
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-amber-300 rounded text-xs text-amber-900 hover:bg-amber-100 transition-colors"
                        title={`Exclude all ${count} pages under ${path}`}
                      >
                        <span className="font-medium">{path}</span>
                        <span className="text-amber-600">({count})</span>
                        <span className="text-red-600 ml-1">✕</span>
                      </button>
                    ))}
                  </div>
                  {excludedPaths.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <div className="text-xs text-amber-900 mb-2">Excluded paths:</div>
                      <div className="flex flex-wrap gap-2">
                        {excludedPaths.map(path => (
                          <button
                            key={path}
                            type="button"
                            onClick={() => {
                              setExcludedPaths(prev => prev.filter(p => p !== path))
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-900 hover:bg-red-200 transition-colors"
                            title={`Remove exclusion for ${path}`}
                          >
                            <span>{path}</span>
                            <span className="text-red-600 ml-1">✓</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page, index) => (
                    <tr key={page.url} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="truncate" title={page.url}>
                          {page.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={page.title || 'N/A'}>
                          {page.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.source === 'sitemap' ? 'bg-green-100 text-green-800' :
                          page.source === 'internal-link' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {page.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="text-center text-gray-500">
                {searchQuery ? 'No pages match your search.' : 'No pages discovered.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
