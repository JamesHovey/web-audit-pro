"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ExternalLink, Download } from 'lucide-react'

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

function SitemapContent({ domain }: { domain: string }) {
  const [sitemapData, setSitemapData] = useState<PageDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (domain) {
      fetchSitemapData();
    } else {
      setError("No domain provided");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const fetchSitemapData = async () => {
    if (!domain) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: domain }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sitemap data');
      }

      const data = await response.json();
      setSitemapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sitemap');
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredPages = sitemapData?.pages.filter(page =>
    page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No domain provided in URL parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pages Discovered</h1>
              <p className="text-sm text-gray-600">{domain ? new URL(domain).hostname : ''}</p>
            </div>

            <div className="flex items-center space-x-2">
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
                  <span className="font-semibold">{sitemapData.totalFound}</span> pages discovered
                  {sitemapData.sources && (
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Discovering pages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
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
        ) : sitemapData && filteredPages.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-gray-500">
              {searchQuery ? 'No pages match your search.' : 'No pages discovered.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SitemapPage() {
  const searchParams = useSearchParams()
  const domain = searchParams.get('domain')

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No domain provided in URL parameters.</p>
        </div>
      </div>
    );
  }

  return <SitemapContent domain={domain} />
}
