"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from "@/components/Tooltip"
import { ukDetectionService, UKDetectionResult } from "@/lib/ukDetectionService"

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
    label: "Performance & Technical Audit",
    description: "Core Web Vitals, technical SEO health, image optimization, and site structure analysis"
  },
  {
    id: "backlinks",
    label: "Authority & Backlinks",
    description: "Domain authority assessment and comprehensive backlink analysis"
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

// Countries supported by Keywords Everywhere API
const COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'tw', name: 'Taiwan', flag: '🇹🇼' }
]

export function AuditForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [selectedSections, setSelectedSections] = useState<string[]>([]) // Default to nothing selected
  const [auditScope, setAuditScope] = useState<AuditScope>('single')
  const [country, setCountry] = useState('gb') // Default to United Kingdom
  const [isUKCompany, setIsUKCompany] = useState(false) // New state for UK company flag
  const [ukDetection, setUkDetection] = useState<UKDetectionResult | null>(null)
  const [discoveredPages, setDiscoveredPages] = useState<PageOption[]>([])
  const [isDiscoveringPages, setIsDiscoveringPages] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showErrorTooltip, setShowErrorTooltip] = useState(false)
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
    setShowErrorTooltip(false) // Hide tooltip when user starts typing
    setIsValidUrl(validateUrl(value))
    // Reset discovered pages when URL changes
    setDiscoveredPages([])
    setAuditScope('single')
    // Reset UK detection when URL changes
    setUkDetection(null)
    
    // Auto-detect UK if URL is valid
    if (validateUrl(value)) {
      detectUKCompany(value)
    }
  }

  const detectUKCompany = async (urlToDetect: string) => {
    try {
      const detection = await ukDetectionService.detectUKCompany(urlToDetect)
      setUkDetection(detection)
      
      // Auto-set UK company flag based on detection (behind the scenes)
      setIsUKCompany(detection.isUKCompany)
      
      console.log('🔍 UK Detection (Hidden):', {
        url: urlToDetect,
        isUK: detection.isUKCompany,
        confidence: detection.confidence,
        reasoning: detection.reasoning
      })
    } catch (error) {
      console.error('UK detection failed:', error)
      setUkDetection(null)
      setIsUKCompany(false) // Default to non-UK on failure
    }
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
    // Remove automatic page discovery for 'all' scope
    // Page discovery will happen during the audit process instead
  }

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
    setShowErrorTooltip(false) // Hide tooltip when user selects sections
  }

  const handleSelectAll = () => {
    const allSelected = selectedSections.length === AUDIT_SECTIONS.length;
    setSelectedSections(allSelected ? [] : AUDIT_SECTIONS.map(section => section.id));
    setShowErrorTooltip(false) // Hide tooltip when user uses select all
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError("Please enter a website URL to analyze")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    if (!isValidUrl) {
      setError("Please enter a valid website URL (e.g., example.com)")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    if (selectedSections.length === 0) {
      setError("Please choose one or more audit sections first. Select the analyses you'd like to include in your website audit.")
      setShowErrorTooltip(true)
      setTimeout(() => setShowErrorTooltip(false), 4000)
      return
    }

    // Show loading immediately for instant feedback
    setIsLoading(true)
    setError("")
    setShowErrorTooltip(false)

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
          country: country, // Include selected country
          isUKCompany: isUKCompany, // Include UK company flag
          pages: auditScope === 'custom' 
            ? discoveredPages.filter(page => page.selected).map(page => page.url)
            : [urlToAudit] // For both 'single' and 'all' scopes, just send the main URL
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start audit')
      }

      const data = await response.json()
      
      // Use Next.js router for client-side navigation
      router.push(`/audit/${data.id}`)
      // Don't set loading to false here - let the navigation handle it
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowErrorTooltip(false) // Hide tooltip for regular errors (they use the box)
      setIsLoading(false) // Only set to false on error
    }
  }

  return (
    <div className="card-pmw">
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
                className="btn-pmw-secondary text-sm px-4 py-2"
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
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    All Discoverable Pages
                    <Tooltip 
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Comprehensive Website Analysis</p>
                          <p>This option automatically discovers and audits all pages found through:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>XML Sitemaps</li>
                            <li>Internal navigation links</li>
                            <li>Common page patterns</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900 rounded text-white">
                            <p className="font-medium">✓ You can click "Start Audit" immediately</p>
                            <p className="text-sm">Page discovery happens automatically during the audit process.</p>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </Tooltip>
                  </div>
                  <div className="text-sm text-gray-600">Scan sitemap and internal links to audit all pages</div>
                </label>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label htmlFor={section.id} className="font-medium text-gray-900 cursor-pointer">
                          {section.label}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                      
                      {/* Inline Country Selection for Keywords Section */}
                      {section.id === 'keywords' && selectedSections.includes('keywords') && (
                        <div className="ml-4 min-w-0 flex-shrink-0">
                          <label htmlFor={`${section.id}-country`} className="block text-xs font-medium text-gray-700 mb-1">
                            Target Country
                          </label>
                          <div className="relative">
                            <select
                              id={`${section.id}-country`}
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                              disabled={isLoading}
                            >
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
        <div className="relative">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full justify-center disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${
              selectedSections.length > 0 
                ? 'bg-[#42499c] hover:bg-[#353f85] text-white font-medium py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200'
                : 'btn-pmw-primary'
            }`}
            style={selectedSections.length > 0 ? { borderRadius: '20px' } : {}}
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

          {/* Error Tooltip */}
          {showErrorTooltip && error && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="relative">
                <div className="px-4 py-3 text-sm text-white bg-red-600 rounded-lg shadow-xl whitespace-nowrap max-w-sm">
                  {error}
                </div>
                {/* Arrow pointing down to button */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Website Analysis Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-lg border border-gray-200">
            <div className="mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Website
            </h3>
            <p className="text-gray-600 mb-4">
              Initializing comprehensive audit for {url.startsWith('http') ? url : `https://${url}`}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                ✓ URL validated and audit parameters configured
              </p>
              <p className="text-blue-700 text-xs mt-1">
                You'll be redirected to the live audit progress page shortly...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}