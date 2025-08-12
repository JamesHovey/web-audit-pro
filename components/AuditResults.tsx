"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"

interface Audit {
  id: string
  url: string
  status: string
  sections: string[]
  results?: any
  createdAt: string
  completedAt?: string
}

interface AuditResultsProps {
  audit: Audit
}

const SECTION_LABELS = {
  traffic: "Traffic Insights",
  keywords: "Keywords",
  performance: "Website Performance", 
  backlinks: "Authority & Backlinks",
  technical: "Technical Audit",
  technology: "Technology Stack"
}

export function AuditResults({ audit: initialAudit }: AuditResultsProps) {
  const [audit, setAudit] = useState(initialAudit)
  const [isPolling, setIsPolling] = useState(audit.status === "pending" || audit.status === "running")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/audit/${audit.id}`)
        const updatedAudit = await response.json()
        
        setAudit(updatedAudit)
        
        if (updatedAudit.status === "completed" || updatedAudit.status === "failed") {
          setIsPolling(false)
        }
      } catch (error) {
        console.error("Error polling audit status:", error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [audit.id, isPolling])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "failed":
        return "text-red-600 bg-red-50"
      case "running":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Queued"
      case "running":
        return "Running"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(audit.status)}`}>
                {getStatusText(audit.status)}
              </span>
              {isPolling && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-gray-600 mt-2">
              Started: {new Date(audit.createdAt).toLocaleString()}
            </p>
            {audit.completedAt && (
              <p className="text-gray-600">
                Completed: {new Date(audit.completedAt).toLocaleString()}
              </p>
            )}
          </div>
          
          {audit.status === "completed" && (
            <div className="flex space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Export PDF
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audit.sections.map((sectionId) => (
          <div key={sectionId} className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {SECTION_LABELS[sectionId as keyof typeof SECTION_LABELS]}
              </h3>
              
              {!isHydrated ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-500 mt-2">Loading...</p>
                  </div>
                </div>
              ) : audit.status === "completed" && audit.results?.[sectionId] ? (
                <div className="space-y-4">
                  {/* Section Results */}
                  {renderSectionResults(sectionId, audit.results[sectionId])}
                </div>
              ) : audit.status === "failed" ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Failed to generate results</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-500 mt-2">Analyzing...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderSectionResults(sectionId: string, results: any) {
  switch (sectionId) {
    case "traffic":
      return (
        <div className="space-y-6">
          {/* Traffic Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.monthlyOrganicTraffic?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Organic</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.monthlyPaidTraffic?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Paid</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.brandedTraffic?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Branded Traffic</div>
            </div>
          </div>

          {/* Top Countries */}
          <div>
            <h4 className="font-semibold mb-3">Top Countries</h4>
            <div className="space-y-2">
              {results.topCountries?.slice(0, 3).map((country: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{country.country}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{country.percentage}%</span>
                    <span className="font-medium">{country.traffic?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Source Indicator */}
          {results.dataSource && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Data source: {results.dataSource === 'mcp-analysis' ? 'AI Analysis' : 
                              results.dataSource === 'web-scraping' ? 'Web Analysis' : 
                              results.dataSource === 'api' ? 'API Data' : 'Estimated'}
                </span>
                <span className={`px-2 py-1 rounded ${
                  results.confidence === 'high' ? 'bg-green-100 text-green-600' :
                  results.confidence === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {results.confidence} confidence
                </span>
              </div>
            </div>
          )}
        </div>
      )

    case "keywords":
      return (
        <div className="space-y-6">
          {/* Keywords Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.brandedKeywords}</div>
              <div className="text-sm text-gray-600">Branded Keywords</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.nonBrandedKeywords}</div>
              <div className="text-sm text-gray-600">Non-branded Keywords</div>
            </div>
          </div>

          {/* Top Keywords */}
          <div>
            <h4 className="font-semibold mb-3">Top Performing Keywords</h4>
            <div className="space-y-2">
              {results.topKeywords?.slice(0, 3).map((keyword: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 truncate">{keyword.keyword}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600"># {keyword.position}</span>
                    <span className="text-gray-500">{keyword.volume?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Competitors */}
          <div>
            <h4 className="font-semibold mb-3">Main Competitors</h4>
            <div className="space-y-1">
              {results.topCompetitors?.slice(0, 3).map((competitor: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{competitor.domain}</span>
                  <span className="text-orange-600">{competitor.overlap}% overlap</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case "performance":
      return (
        <div className="space-y-6">
          {/* Desktop vs Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Desktop</h4>
                <span className={`px-2 py-1 rounded text-xs ${results.desktop?.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {results.desktop?.status === 'pass' ? 'PASS' : 'NEEDS WORK'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">LCP:</span>
                  <span className={results.desktop?.lcp?.includes('1.') || results.desktop?.lcp?.includes('2.') ? 'text-green-600' : 'text-red-600'}>
                    {results.desktop?.lcp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CLS:</span>
                  <span className={parseFloat(results.desktop?.cls || '0') < 0.1 ? 'text-green-600' : 'text-red-600'}>
                    {results.desktop?.cls}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">INP:</span>
                  <span className={parseInt(results.desktop?.inp || '0') < 200 ? 'text-green-600' : 'text-red-600'}>
                    {results.desktop?.inp}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Mobile</h4>
                <span className={`px-2 py-1 rounded text-xs ${results.mobile?.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {results.mobile?.status === 'pass' ? 'PASS' : 'NEEDS WORK'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">LCP:</span>
                  <span className={results.mobile?.lcp?.includes('2.') ? 'text-green-600' : 'text-red-600'}>
                    {results.mobile?.lcp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CLS:</span>
                  <span className={parseFloat(results.mobile?.cls || '0') < 0.1 ? 'text-green-600' : 'text-red-600'}>
                    {results.mobile?.cls}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">INP:</span>
                  <span className={parseInt(results.mobile?.inp || '0') < 200 ? 'text-green-600' : 'text-red-600'}>
                    {results.mobile?.inp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-3">Key Recommendations</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {results.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )

    case "backlinks":
      return (
        <div className="space-y-6">
          {/* Backlink Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.domainAuthority}</div>
              <div className="text-sm text-gray-600">Domain Authority</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.totalBacklinks?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Backlinks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.referringDomains?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Referring Domains</div>
            </div>
          </div>

          {/* Top Backlinks */}
          <div>
            <h4 className="font-semibold mb-3">High Authority Backlinks</h4>
            <div className="space-y-2">
              {results.topBacklinks?.slice(0, 4).map((backlink: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <div className="font-medium text-gray-800">{backlink.domain}</div>
                    <div className="text-gray-500 text-xs truncate">{backlink.anchor}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-medium">DA {backlink.authority}</div>
                    <div className={`text-xs ${backlink.type === 'dofollow' ? 'text-green-600' : 'text-gray-500'}`}>
                      {backlink.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case "technical":
      return (
        <div className="space-y-6">
          {/* Technical Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.totalPages?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{results.largeImages}</div>
              <div className="text-sm text-gray-600">Large Images</div>
            </div>
          </div>

          {/* Issues Found */}
          <div>
            <h4 className="font-semibold mb-3">Issues Found</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Missing Meta Titles:</span>
                <span className={results.issues?.missingMetaTitles > 0 ? 'text-red-600' : 'text-green-600'}>
                  {results.issues?.missingMetaTitles || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Missing Meta Descriptions:</span>
                <span className={results.issues?.missingMetaDescriptions > 0 ? 'text-red-600' : 'text-green-600'}>
                  {results.issues?.missingMetaDescriptions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Missing H1 Tags:</span>
                <span className={results.issues?.missingH1Tags > 0 ? 'text-red-600' : 'text-green-600'}>
                  {results.issues?.missingH1Tags || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HTTP Errors:</span>
                <span className={results.issues?.httpErrors > 0 ? 'text-red-600' : 'text-green-600'}>
                  {results.issues?.httpErrors || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Site Health */}
          <div>
            <h4 className="font-semibold mb-3">Site Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sitemap:</span>
                <span className={results.sitemapStatus === 'found' ? 'text-green-600' : 'text-red-600'}>
                  {results.sitemapStatus === 'found' ? '✓ Found' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Robots.txt:</span>
                <span className={results.robotsTxtStatus === 'found' ? 'text-green-600' : 'text-red-600'}>
                  {results.robotsTxtStatus === 'found' ? '✓ Found' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HTTPS:</span>
                <span className={results.httpsStatus === 'secure' ? 'text-green-600' : 'text-red-600'}>
                  {results.httpsStatus === 'secure' ? '✓ Secure' : '✗ Insecure'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )

    case "technology":
      return (
        <div className="space-y-6">
          {/* Core Technologies */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">CMS:</span>
                <div className="font-semibold text-blue-600">{results.cms || 'Not detected'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Framework:</span>
                <div className="font-semibold text-green-600">{results.framework || 'Not detected'}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Analytics:</span>
                <div className="font-semibold text-purple-600">{results.analytics || 'Not detected'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Hosting:</span>
                <div className="font-semibold text-orange-600">{results.hosting || 'Not detected'}</div>
              </div>
            </div>
          </div>

          {results.ecommerce && (
            <div>
              <span className="text-gray-600 text-sm">E-commerce:</span>
              <div className="font-semibold text-indigo-600">{results.ecommerce}</div>
            </div>
          )}

          {/* Additional Technologies */}
          <div>
            <h4 className="font-semibold mb-3">Additional Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {results.technologies?.map((tech: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-gray-600">
          <p>Analysis completed successfully</p>
          <p className="text-sm mt-1">Detailed results are now available</p>
        </div>
      )
  }
}