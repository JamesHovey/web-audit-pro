"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Globe } from 'lucide-react'

const AUDIT_SECTIONS = [
  {
    id: "traffic",
    label: "Traffic Insights",
    description: "Organic search performance, paid advertising metrics, and geographic distribution"
  },
  {
    id: "keywords",
    label: "Keywords",
    description: "Branded and non-branded keyword analysis with competitive intelligence"
  },
  {
    id: "performance",
    label: "Website Performance",
    description: "Core Web Vitals assessment for desktop and mobile experiences"
  },
  {
    id: "backlinks",
    label: "Authority & Backlinks",
    description: "Domain authority assessment and comprehensive backlink analysis"
  },
  {
    id: "technical",
    label: "Technical Audit",
    description: "Site structure, image optimization, and technical SEO issues"
  },
  {
    id: "technology",
    label: "Technology Stack",
    description: "Technologies, frameworks, and platforms used in website construction"
  }
]

type AuditScope = 'single' | 'all' | 'custom'

interface PageOption {
  url: string
  title: string
  selected: boolean
}

export function AuditForm() {
  const [url, setUrl] = useState("")
  const [selectedSections, setSelectedSections] = useState<string[]>([]) // Default to nothing selected
  const [auditScope, setAuditScope] = useState<AuditScope>('single')
  const [discoveredPages, setDiscoveredPages] = useState<PageOption[]>([])
  const [isDiscoveringPages, setIsDiscoveringPages] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)

  const validateUrl = (urlString: string) => {
    try {
      // Add protocol if missing
      const urlToValidate = urlString.startsWith('http') ? urlString : `https://${urlString}`
      const url = new URL(urlToValidate)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setError("")
    setIsValidUrl(validateUrl(value))
    // Reset discovered pages when URL changes
    setDiscoveredPages([])
    setAuditScope('single')
  }

  const discoverPages = async () => {
    if (!isValidUrl) return
    
    setIsDiscoveringPages(true)
    setError("")
    
    try {
      const urlToDiscover = url.startsWith('http') ? url : `https://${url}`
      
      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToDiscover }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to discover pages')
      }
      
      const data = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages: PageOption[] = data.pages.map((page: any) => ({
        url: page.url,
        title: page.title || page.url,
        selected: true
      }))
      
      setDiscoveredPages(pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover pages')
      setDiscoveredPages([])
    } finally {
      setIsDiscoveringPages(false)
    }
  }

  const handlePageToggle = (pageUrl: string) => {
    setDiscoveredPages(prev => 
      prev.map(page => 
        page.url === pageUrl 
          ? { ...page, selected: !page.selected }
          : page
      )
    )
  }

  const handleAuditScopeChange = (scope: AuditScope) => {
    setAuditScope(scope)
    if (scope === 'all' && discoveredPages.length === 0 && isValidUrl) {
      discoverPages()
    }
  }

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSelectAll = () => {
    const allSelected = selectedSections.length === AUDIT_SECTIONS.length;
    setSelectedSections(allSelected ? [] : AUDIT_SECTIONS.map(section => section.id));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!isValidUrl) {
      setError("Please enter a valid URL")
      return
    }

    if (selectedSections.length === 0) {
      setError("Please select at least one audit section")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Add protocol if missing
      const urlToAudit = url.startsWith('http') ? url : `https://${url}`
      
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToAudit,
          sections: selectedSections,
          scope: auditScope,
          pages: auditScope === 'custom' 
            ? discoveredPages.filter(page => page.selected).map(page => page.url)
            : auditScope === 'all'
            ? discoveredPages.map(page => page.url)
            : [urlToAudit]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start audit')
      }

      const data = await response.json()
      
      // Redirect to results page
      window.location.href = `/audit/${data.id}`
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="example.com or https://example.com"
              className={`w-full px-4 py-3 border rounded-lg text-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                url && !isValidUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {url && isValidUrl && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {url && !isValidUrl && (
            <p className="text-red-600 text-sm mt-1">Please enter a valid URL</p>
          )}
          
          {/* Sitemap Button */}
          {isValidUrl && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  const sitemapUrl = `/sitemap?domain=${encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)}`;
                  window.open(sitemapUrl, '_blank');
                }}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>View Sitemap</span>
              </button>
            </div>
          )}
        </div>

        {/* Audit Scope Selection */}
        {isValidUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Audit Scope
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="single-page"
                  name="auditScope"
                  value="single"
                  checked={auditScope === 'single'}
                  onChange={() => handleAuditScopeChange('single')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="single-page" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Single Page</div>
                  <div className="text-sm text-gray-600">Audit only the homepage/specified URL</div>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="all-pages"
                  name="auditScope"
                  value="all"
                  checked={auditScope === 'all'}
                  onChange={() => handleAuditScopeChange('all')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="all-pages" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">All Discoverable Pages</div>
                  <div className="text-sm text-gray-600">Scan sitemap and internal links to audit all pages</div>
                </label>
                {auditScope === 'all' && isDiscoveringPages && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="custom-pages"
                  name="auditScope"
                  value="custom"
                  checked={auditScope === 'custom'}
                  onChange={() => handleAuditScopeChange('custom')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="custom-pages" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Select Specific Pages</div>
                  <div className="text-sm text-gray-600">Choose which pages to include in the audit</div>
                </label>
                {auditScope === 'custom' && discoveredPages.length === 0 && (
                  <button
                    type="button"
                    onClick={discoverPages}
                    disabled={isDiscoveringPages}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-1"
                  >
                    {isDiscoveringPages ? <LoadingSpinner size="sm" /> : null}
                    <span>Discover Pages</span>
                  </button>
                )}
              </div>
            </div>

            {/* Page Selection for Custom Scope */}
            {auditScope === 'custom' && discoveredPages.length > 0 && (
              <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">
                    Select Pages ({discoveredPages.filter(p => p.selected).length} of {discoveredPages.length} selected)
                  </h4>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: true })))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscoveredPages(prev => prev.map(p => ({ ...p, selected: false })))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select None
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {discoveredPages.map((page) => (
                    <div key={page.url} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={page.url}
                        checked={page.selected}
                        onChange={() => handlePageToggle(page.url)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={page.url} className="text-sm font-medium text-gray-900 cursor-pointer block">
                          {page.title}
                        </label>
                        <div className="text-xs text-gray-500 truncate">{page.url}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary for All Pages */}
            {auditScope === 'all' && discoveredPages.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-blue-900">
                    {discoveredPages.length} pages discovered and will be audited
                  </div>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  This will provide comprehensive insights across your entire website
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Audit Sections ({selectedSections.length} selected)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedSections.length === AUDIT_SECTIONS.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIT_SECTIONS.map((section) => (
              <div
                key={section.id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedSections.includes(section.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer">
                      {section.label}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValidUrl || selectedSections.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Starting Audit...</span>
            </>
          ) : (
            'Start Audit'
          )}
        </button>
      </form>

    </div>
  )
}