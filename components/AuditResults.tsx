"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'
import KeywordTable from './KeywordTable'

interface Audit {
  id: string
  url: string
  status: string
  sections: string[]
  results?: Record<string, unknown>
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

function renderSectionResults(sectionId: string, results: Record<string, unknown>) {
  switch (sectionId) {
    case "traffic":
      return (
        <div className="space-y-6">
          {/* Traffic Overview */}
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const totalTraffic = (results.monthlyOrganicTraffic || 0) + (results.monthlyPaidTraffic || 0);
              const organicPercentage = totalTraffic > 0 ? Math.round((results.monthlyOrganicTraffic / totalTraffic) * 100) : 0;
              const paidPercentage = totalTraffic > 0 ? Math.round((results.monthlyPaidTraffic / totalTraffic) * 100) : 0;
              const brandedPercentage = results.monthlyOrganicTraffic > 0 ? Math.round((results.brandedTraffic / results.monthlyOrganicTraffic) * 100) : 0;
              
              return (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.monthlyOrganicTraffic?.toLocaleString()}</div>
                    <div className="text-xs text-blue-500 font-medium mb-1">{organicPercentage}% of total traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Organic Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Organic Traffic</p>
                      <p className="mb-2"><strong>Time Period:</strong> Estimated monthly visitors (30-day period)</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who find your website through unpaid search engine results (Google, Bing, etc.)</p>
                      <p className="mb-2"><strong>Estimation Method:</strong> Based on business size, content quality, SEO indicators, and industry benchmarks</p>
                      <p className="mb-2"><strong>Realistic Ranges (based on actual Google Analytics data):</strong></p>
                      <ul className="list-disc list-inside mb-2 text-xs">
                        <li>Small Business: 80-300 visitors/month</li>
                        <li>Medium Business: 200-500 visitors/month</li>
                        <li>Large Business: 600-1,500 visitors/month</li>
                        <li>Enterprise: 800-2,500+ visitors/month</li>
                      </ul>
                      <p><strong>Reference:</strong> PMW Communications (UK marketing agency) = 761 visitors/month from Google Analytics. Estimates now calibrated to real data.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
                    </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.monthlyPaidTraffic?.toLocaleString()}</div>
                    <div className="text-xs text-green-500 font-medium mb-1">{paidPercentage}% of total traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Paid Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Paid Traffic</p>
                      <p className="mb-2"><strong>Time Period:</strong> Estimated monthly visitors from advertising (30-day period)</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who arrive through paid advertising (Google Ads, Facebook Ads, etc.)</p>
                      <p className="mb-2"><strong>Estimation Method:</strong> Ultra-conservative 3-4% of total traffic (based on real data)</p>
                      <p className="mb-2"><strong>Real Example:</strong> PMW Communications = 28 paid visitors/month (3.8% of 735 total)</p>
                      <p className="mb-2"><strong>Typical Range:</strong> 5-30 paid visitors/month for small businesses</p>
                      <p><strong>Reality:</strong> Many small businesses have 0 paid traffic. Only estimate non-zero if you see evidence of advertising spend.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
                    </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.brandedTraffic?.toLocaleString()}</div>
                    <div className="text-xs text-purple-500 font-medium mb-1">{brandedPercentage}% of organic traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Branded Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Branded Traffic</p>
                      <p className="mb-2"><strong>Time Period:</strong> Estimated monthly visitors from brand searches (subset of organic traffic)</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who search for your specific brand name, company name, or branded terms</p>
                      <p className="mb-2"><strong>Calculation:</strong> Estimated as 25% of organic traffic (realistic for established businesses)</p>
                      <p className="mb-2"><strong>Examples:</strong> Searches for &quot;PMW Communications&quot;, &quot;PMW marketing&quot;, or &quot;PMW agency&quot;</p>
                      <p className="mb-2"><strong>Realistic Range:</strong> 40-160 visitors/month for small businesses (20% of organic traffic)</p>
                      <p><strong>Importance:</strong> Shows brand recognition and customer loyalty. Higher numbers indicate stronger brand presence.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Top Countries */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Top Countries
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Geographic Traffic Distribution</p>
                    <p className="mb-2"><strong>Time Period:</strong> Current month estimate</p>
                    <p className="mb-2"><strong>Method:</strong> Enhanced geographic analysis using:</p>
                    <ul className="list-disc list-inside mb-2 text-xs">
                      <li>Domain extension analysis (.co.uk = UK)</li>
                      <li>Website content analysis (addresses, phone numbers, VAT numbers)</li>
                      <li>Business registration clues (Companies House, etc.)</li>
                      <li>Language and spelling patterns</li>
                      <li>Currency and legal references</li>
                    </ul>
                    <p className="mb-2"><strong>Confidence:</strong> {results.confidence || 'Medium'} - based on strength of geographic indicators found</p>
                    <p><strong>Note:</strong> This analysis provides more accurate geographic distribution than generic estimates, especially for regional businesses</p>
                  </div>
                }
                position="bottom"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h4>
            <div className="space-y-2">
              {results.topCountries?.slice(0, 3).map((country: { country: string; percentage: number; traffic?: number }, index: number) => (
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
        <div className="space-y-8">
          {/* Keywords Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.brandedKeywords || results.brandedKeywordsList?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Branded Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Branded Keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Search terms that include your brand name, company name, or specific branded products/services</p>
                      <p className="mb-2"><strong>Examples:</strong> &quot;PMW Communications&quot;, &quot;PMW marketing agency&quot;, &quot;PMW reviews&quot;</p>
                      <p className="mb-2"><strong>Importance:</strong> Shows brand recognition and customer loyalty. Easier to rank for but lower volume.</p>
                      <p><strong>Typical Range:</strong> Small businesses: 15-50 branded keywords</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.nonBrandedKeywords || results.nonBrandedKeywordsList?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Non-branded Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Non-branded Keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Search terms related to your services/products that don&apos;t include your brand name</p>
                      <p className="mb-2"><strong>Examples:</strong> &quot;marketing agency London&quot;, &quot;digital marketing services&quot;, &quot;brand strategy consultant&quot;</p>
                      <p className="mb-2"><strong>Importance:</strong> Drives new customer acquisition. Higher competition but larger market opportunity.</p>
                      <p><strong>Typical Range:</strong> Small businesses: 50-200 non-branded keywords</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Top Performing Keywords Table */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold">Top 10 Performing Keywords</h4>
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Top Performing Keywords</p>
                    <p className="mb-2"><strong>Definition:</strong> Your highest-traffic keywords ranked by monthly search volume and current position</p>
                    <p className="mb-2"><strong>Why Important:</strong> These keywords drive the most traffic to your website</p>
                    <p className="mb-2"><strong>Position Guide:</strong></p>
                    <ul className="list-disc list-inside mb-2 text-xs">
                      <li>🟢 1-3: Excellent visibility, high click-through rates</li>
                      <li>🔵 4-10: Good visibility, moderate traffic</li>  
                      <li>🟠 11-20: Low visibility, minimal traffic</li>
                      <li>🔴 21+: Very low visibility, almost no traffic</li>
                    </ul>
                    <p><strong>Focus on:</strong> Improving positions 4-10 to top 3 for maximum impact</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-5">Keyword</div>
                  <div className="col-span-2 text-center">Ranking</div>
                  <div className="col-span-2 text-center">Volume</div>
                  <div className="col-span-2 text-center">Difficulty</div>
                  <div className="col-span-1 text-center">Traffic</div>
                </div>
              </div>
              <div className="divide-y">
                {(results.topKeywords || []).slice(0, 10).map((keyword: { keyword: string; position: number; volume?: number; difficulty?: number }, index: number) => {
                  const getPositionColor = (position: number) => {
                    if (position <= 3) return 'text-green-600 bg-green-50'
                    if (position <= 10) return 'text-blue-600 bg-blue-50'  
                    if (position <= 20) return 'text-orange-600 bg-orange-50'
                    return 'text-red-600 bg-red-50'
                  }
                  
                  const getDifficultyColor = (difficulty: number) => {
                    if (difficulty <= 30) return 'text-green-600'
                    if (difficulty <= 50) return 'text-orange-600'
                    return 'text-red-600'
                  }
                  
                  const estimatedTraffic = Math.round(keyword.volume * 0.3 * (keyword.position <= 3 ? 0.6 : keyword.position <= 10 ? 0.3 : 0.1))
                  
                  return (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center text-sm">
                        <div className="col-span-5">
                          <span className="text-gray-900 font-medium">{keyword.keyword}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(keyword.position)}`}>
                            #{keyword.position}
                          </span>
                        </div>
                        <div className="col-span-2 text-center text-gray-600">
                          {keyword.volume?.toLocaleString()}/mo
                        </div>
                        <div className="col-span-2 text-center">
                          <span className={`font-medium ${getDifficultyColor(keyword.difficulty || 50)}`}>
                            {keyword.difficulty || 50}%
                          </span>
                        </div>
                        <div className="col-span-1 text-center text-gray-500 text-xs">
                          {estimatedTraffic}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Branded Keywords Table */}
          {results.brandedKeywordsList && (
            <KeywordTable 
              keywords={results.brandedKeywordsList}
              title="All Branded Keywords"
              description="Complete list of search terms that include your brand name or company name"
              type="branded"
              itemsPerPage={10}
            />
          )}

          {/* Non-branded Keywords Table */}
          {results.nonBrandedKeywordsList && (
            <KeywordTable 
              keywords={results.nonBrandedKeywordsList}
              title="All Non-branded Keywords"
              description="Complete list of industry and service-related keywords that drive new customer acquisition"
              type="non-branded"
              itemsPerPage={10}
            />
          )}

          {/* Competitors */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold">Main Competitors</h4>
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Main Competitors</p>
                    <p className="mb-2"><strong>Detection Method:</strong> Based on your industry type and business classification</p>
                    <p className="mb-2"><strong>Keyword Overlap:</strong> Percentage of keywords you both compete for</p>
                    <p className="mb-2"><strong>Authority:</strong> Domain authority score (higher = stronger competitor)</p>
                    <p className="mb-2"><strong>Why Important:</strong> Understand your competitive landscape and identify opportunities</p>
                    <p><strong>Note:</strong> These are real companies in your industry, not generic placeholders</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Competitor</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2 text-center">Authority</div>
                  <div className="col-span-2 text-center">Overlap</div>
                </div>
              </div>
              <div className="divide-y">
                {(results.topCompetitors || []).slice(0, 8).map((competitor: { domain: string; description: string; authority: number; overlap: number }, index: number) => (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                      <div className="col-span-4">
                        <span className="text-gray-900 font-medium">{competitor.domain}</span>
                      </div>
                      <div className="col-span-4 text-gray-600">
                        {competitor.description}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`font-medium ${
                          competitor.authority >= 80 ? 'text-red-600' : 
                          competitor.authority >= 60 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {competitor.authority}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-orange-600 font-medium">{competitor.overlap}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              {results.topBacklinks?.slice(0, 4).map((backlink: { domain: string; anchor: string; authority: number; type: string }, index: number) => (
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
              {results.pageBuilder && (
                <div>
                  <span className="text-gray-600 text-sm">Page Builder:</span>
                  <div className="font-semibold text-teal-600">{results.pageBuilder}</div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Analytics:</span>
                <div className="font-semibold text-purple-600">{results.analytics || 'Not detected'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Origin Hosting:</span>
                <div className="font-semibold text-orange-600">{results.hosting || 'Not detected'}</div>
              </div>
              {results.cdn && (
                <div>
                  <span className="text-gray-600 text-sm">CDN/Proxy:</span>
                  <div className="font-semibold text-cyan-600">{results.cdn}</div>
                </div>
              )}
              {results.organization && (
                <div>
                  <span className="text-gray-600 text-sm">Organization:</span>
                  <div className="font-semibold text-indigo-600">{results.organization}</div>
                </div>
              )}
            </div>
          </div>

          {results.ecommerce && (
            <div>
              <span className="text-gray-600 text-sm">E-commerce:</span>
              <div className="font-semibold text-indigo-600">{results.ecommerce}</div>
            </div>
          )}

          {/* WordPress Plugins */}
          {results.plugins && results.plugins.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">WordPress Plugins Detected</h4>
              <div className="flex flex-wrap gap-2">
                {results.plugins.map((plugin: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {plugin}
                  </span>
                ))}
              </div>
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

          {/* Detection Quality Info */}
          {results.source && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 text-sm">Detection Quality</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Source:</span>
                  <div className={`font-medium ${
                    results.source === 'direct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {results.source === 'direct' ? 'Direct Website Analysis' : 'Manual Analysis'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <div className={`font-medium ${
                    results.confidence === 'high' ? 'text-green-600' :
                    results.confidence === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {results.confidence === 'high' ? 'High' :
                     results.confidence === 'medium' ? 'Medium' :
                     'Low'}
                  </div>
                </div>
              </div>
              {results.confidence === 'low' && (
                <div className="mt-2 text-xs text-orange-600">
                  ⚠️ Results may be inaccurate. Direct analysis failed.
                </div>
              )}
              {results.confidence === 'high' && results.source === 'direct' && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ High confidence detection using professional patterns.
                </div>
              )}
            </div>
          )}
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