"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import LoadingMessages from "@/components/LoadingMessages"
import { HelpCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from './Tooltip'
import KeywordTable from './KeywordTable'
import BrandedKeywordTable from './BrandedKeywordTable'
import NonBrandedKeywordTable from './NonBrandedKeywordTable'
import AboveFoldKeywordTable from './AboveFoldKeywordTable'

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
  const router = useRouter()
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
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const responseText = await response.text()
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server')
        }
        
        let updatedAudit
        try {
          updatedAudit = JSON.parse(responseText)
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError)
          console.error('Response text:', responseText)
          throw new Error(`Invalid JSON response: ${parseError.message}`)
        }
        
        setAudit(updatedAudit)
        
        if (updatedAudit.status === "completed" || updatedAudit.status === "failed") {
          setIsPolling(false)
        }
      } catch (error) {
        console.error("Error polling audit status:", error)
        // Stop polling if there are persistent errors
        setIsPolling(false)
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
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

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
              Started: {new Date(audit.createdAt).toLocaleString('en-GB', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </p>
            {audit.completedAt && (
              <p className="text-gray-600">
                Completed: {new Date(audit.completedAt).toLocaleString('en-GB', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
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

      {/* Keywords Section - Full Width */}
      {audit.sections.includes('keywords') && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {SECTION_LABELS['keywords']}
              </h3>
              {audit.results?.keywords?.dataSource && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    audit.results.keywords.dataSource === 'valueserp' || audit.results.keywords.dataSource === 'mixed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.results.keywords.dataSource === 'valueserp' && '✓ Real Google Ranking Data'}
                    {audit.results.keywords.dataSource === 'mixed' && '✓ Mixed Real & Estimated Data'}
                    {audit.results.keywords.dataSource === 'estimation' && '⚠ Estimated Data Only'}
                    {audit.results.keywords.searchesUsed && ` (${audit.results.keywords.searchesUsed} searches)`}
                  </span>
                </div>
              )}
            </div>
            
            {!isHydrated ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-gray-500 mb-2">Loading section...</div>
                </div>
              </div>
            ) : audit.results?.keywords ? (
              <div className="space-y-4">
                {renderSectionResults('keywords', audit.results.keywords)}
              </div>
            ) : (
              <LoadingMessages section="keywords" />
            )}
          </div>
        </div>
      )}

      {/* Other Sections - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audit.sections.filter(section => section !== 'keywords').map((sectionId) => (
          <div key={sectionId} className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {SECTION_LABELS[sectionId as keyof typeof SECTION_LABELS]}
                {sectionId === 'traffic' && (
                  <Tooltip 
                    content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-2">How Traffic Insights Works</p>
                        <p className="mb-2">We analyze your website using publicly available data to estimate monthly organic traffic.</p>
                        <p className="mb-2"><strong>What we measure:</strong></p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Number of pages on your site</li>
                          <li>Content quality and structure</li>
                          <li>SEO indicators and rankings</li>
                          <li>Industry benchmarks</li>
                        </ul>
                        <p className="mt-2 text-sm">The data shows your 12-month average to account for seasonal variations.</p>
                      </div>
                    }
                  >
                    <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                  </Tooltip>
                )}
              </h3>
              
              {!isHydrated ? (
                <LoadingMessages />
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
                <LoadingMessages section={sectionId} />
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
          {results.estimationMethod === 'free_scraping' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 text-sm font-medium">
                  Data Confidence: {results.confidence === 'high' ? '🟢 High' : results.confidence === 'medium' ? '🟡 Medium' : '🔴 Low'}
                </span>
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Free Estimation Method</p>
                      <p className="mb-2">This data is estimated using publicly available SEO metrics and machine learning algorithms.</p>
                      <p className="mb-2"><strong>Confidence Factors:</strong></p>
                      <ul className="list-disc list-inside">
                        <li>Domain Authority: {results.metrics?.domainAuthority || 'N/A'}</li>
                        <li>Indexed Pages: {results.metrics?.indexedPages || 'N/A'}</li>
                        <li>Estimated Keywords: {results.metrics?.organicKeywords || 'N/A'}</li>
                      </ul>
                      <p className="mt-2 text-xs">For more accurate data, consider using premium APIs like SimilarWeb or SEMrush.</p>
                    </div>
                  }
                >
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                </Tooltip>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const totalTraffic = (results.monthlyOrganicTraffic || 0) + (results.monthlyPaidTraffic || 0);
              const organicPercentage = totalTraffic > 0 ? Math.round((results.monthlyOrganicTraffic / totalTraffic) * 100) : 0;
              const paidPercentage = totalTraffic > 0 ? Math.round((results.monthlyPaidTraffic / totalTraffic) * 100) : 0;
              const brandedPercentage = results.monthlyOrganicTraffic > 0 ? Math.round((results.brandedTraffic / results.monthlyOrganicTraffic) * 100) : 0;
              
              return (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.monthlyOrganicTraffic?.toLocaleString('en-GB')}</div>
                    <div className="text-xs text-blue-500 font-medium mb-1">{organicPercentage}% of total traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Organic Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Organic Traffic (12-Month Average)</p>
                      <p className="mb-2"><strong>Time Period:</strong> Average of last 12 months</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who find your website through unpaid search engine results (Google, Bing, etc.)</p>
                      <p className="mb-2"><strong>Estimation Method:</strong> {results.estimationMethod === 'free_scraping' ? 'Web scraping with SEO metrics analysis' : 'Premium API data'}</p>
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
                    <div className="text-2xl font-bold text-green-600">{results.monthlyPaidTraffic?.toLocaleString('en-GB')}</div>
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
                    <div className="text-2xl font-bold text-purple-600">{results.brandedTraffic?.toLocaleString('en-GB')}</div>
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
                    <span className="font-medium">{country.traffic?.toLocaleString('en-GB')}</span>
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
          {/* Business Context & Method Notice */}
          {(results.estimationMethod === 'free_scraping' || results.methodology) && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-sm font-medium">
                      🎯 Smart Business Analysis - Contextually Relevant Keywords for SMEs
                    </span>
                    <Tooltip 
                      content={
                        <div>
                          <p className="font-semibold mb-2">Smart Keyword Analysis</p>
                          <p className="mb-2">Advanced business context analysis that:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Identifies your specific industry and services</li>
                            <li>Extracts only business-relevant keywords</li>
                            <li>Shows realistic SME competitor landscape</li>
                            <li>Focuses on achievable ranking positions (1-10)</li>
                            <li>Provides appropriate difficulty levels for small businesses</li>
                          </ul>
                          <p className="mt-2 text-xs">Keywords are filtered for relevance and ranked by business impact.</p>
                        </div>
                      }
                    >
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                    </Tooltip>
                  </div>
                  
                  {results.businessContext && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">Industry:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.industry}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Business Size:</span>
                        <span className="ml-1 text-blue-600 capitalize">{results.businessContext.businessSize}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Target Market:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.targetMarket}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Locations:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.locations.join(', ') || 'Not specified'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Keywords Overview - Enhanced Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.aboveFoldKeywords || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Above Fold Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Above Fold Keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Keywords that appear in the immediately visible area of your pages (above the fold)</p>
                      <p className="mb-2"><strong>Includes:</strong> Title tags, H1 headings, first paragraph, meta descriptions</p>
                      <p className="mb-2"><strong>Importance:</strong> These keywords get maximum visibility and SEO weight</p>
                      <p><strong>Best Practice:</strong> Focus your most important keywords above the fold</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{(results.brandedKeywords || 0) + (results.nonBrandedKeywords || 0)}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Total Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Total Keywords Found</p>
                      <p className="mb-2"><strong>Source:</strong> All keywords extracted from your website content</p>
                      <p className="mb-2"><strong>Method:</strong> Content analysis and text processing</p>
                      <p><strong>Note:</strong> This represents keywords present in your content, not search rankings</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
            
            {/* Domain Authority */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.domainAuthority || 'N/A'}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Domain Authority
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Domain Authority Score</p>
                      <p className="mb-2"><strong>Range:</strong> 1-100 (higher is better)</p>
                      <p className="mb-2"><strong>Source:</strong> SEMrush Authority Score</p>
                      <p className="mb-2"><strong>Scoring:</strong> 1-20 (Low), 20-40 (Fair), 40-60 (Good), 60+ (Excellent)</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Keyword Intent Distribution */}
          {results.intentDistribution && (
            <div>
              <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                Keyword Intent Distribution
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Keyword Intent Types</p>
                      <p className="mb-2"><strong>Informational:</strong> "How to", "What is", "Guide" - Users seeking information</p>
                      <p className="mb-2"><strong>Commercial:</strong> "Best", "Review", "Compare" - Users researching purchases</p>
                      <p className="mb-2"><strong>Transactional:</strong> "Buy", "Price", "Order" - Users ready to purchase</p>
                      <p><strong>Navigational:</strong> Brand names, "Login" - Users looking for specific sites</p>
                    </div>
                  }
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{results.intentDistribution.informational}%</div>
                  <div className="text-xs text-gray-600">Informational</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{results.intentDistribution.commercial}%</div>
                  <div className="text-xs text-gray-600">Commercial</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{results.intentDistribution.transactional}%</div>
                  <div className="text-xs text-gray-600">Transactional</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{results.intentDistribution.navigational}%</div>
                  <div className="text-xs text-gray-600">Navigational</div>
                </div>
              </div>
            </div>
          )}


          {/* Above Fold Keywords Table */}
          {results.aboveFoldKeywordsList && results.aboveFoldKeywordsList.length > 0 && (
            <AboveFoldKeywordTable 
              keywords={results.aboveFoldKeywordsList}
              title="Above Fold Keywords"
              description="Keywords prominently placed in the immediately visible area of your website"
            />
          )}

          {/* Branded Keywords Table */}
          {results.brandedKeywordsList && (
            <BrandedKeywordTable 
              keywords={results.brandedKeywordsList}
              title="All Branded Keywords"
              description="Complete list of search terms that include your brand name or company name"
            />
          )}

          {/* Non-branded Keywords Table */}
          {results.nonBrandedKeywordsList && (
            <NonBrandedKeywordTable 
              keywords={results.nonBrandedKeywordsList}
              title="All Non-branded Keywords"
              description="Complete list of industry and service-related keywords that drive new customer acquisition"
            />
          )}

          {/* Competitors */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-black">Main Competitors</h4>
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
                <HelpCircle className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full p-1" />
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
              <div className="text-2xl font-bold text-green-600">{results.totalBacklinks?.toLocaleString('en-GB')}</div>
              <div className="text-sm text-gray-600">Total Backlinks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.referringDomains?.toLocaleString('en-GB')}</div>
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
              <div className="text-2xl font-bold text-blue-600">{results.totalPages?.toLocaleString('en-GB')}</div>
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