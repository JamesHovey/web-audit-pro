'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, Settings, CheckCircle, AlertCircle } from 'lucide-react'
import { SerperService } from '@/lib/serperService'
import { ClaudeUsageService } from '@/lib/claudeUsageService'

interface CostingData {
  keywordsEverywhere: {
    creditsRemaining: number
    creditsUsed: number
    costPerCredit: number
    planType: string
  }
  serper: {
    searchesRemaining: number
    searchesUsed: number
    costPer1000: number
    planType: string
  }
  claudeApi: {
    tokensUsed: number
    totalCost: number
    requestsThisMonth: number
    avgCostPerRequest: number
    lastUpdated: string
    model: string
    businessAnalysisRequests: number
    conclusionGenerationRequests: number
  }
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [costingData, setCostingData] = useState<CostingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchCostingData()
    }
  }, [isOpen])

  const fetchCostingData = async () => {
    try {
      setLoading(true)

      // Get real Serper usage from localStorage
      const serperUsage = SerperService.getTotalUsage()

      // Get real Claude usage from localStorage
      const claudeUsage = ClaudeUsageService.getMonthlyUsage()

      // Mixed data: real tracking for Serper & Claude, mock data for Keywords Everywhere
      setCostingData({
        keywordsEverywhere: {
          creditsRemaining: 79515,
          creditsUsed: 485,
          costPerCredit: 0.00024, // 24¢ per 1000 credits
          planType: 'Bronze Package (100K/year)'
        },
        serper: {
          searchesRemaining: serperUsage.remaining,
          searchesUsed: serperUsage.used,
          costPer1000: 0.60,
          planType: `Free Tier (${serperUsage.limit} queries)`
        },
        claudeApi: {
          tokensUsed: claudeUsage.totalTokens,
          totalCost: claudeUsage.totalCost,
          requestsThisMonth: claudeUsage.totalRequests,
          avgCostPerRequest: claudeUsage.totalRequests > 0
            ? claudeUsage.totalCost / claudeUsage.totalRequests
            : 0,
          lastUpdated: claudeUsage.lastUpdated,
          model: claudeUsage.model,
          businessAnalysisRequests: claudeUsage.businessAnalysisRequests,
          conclusionGenerationRequests: claudeUsage.conclusionGenerationRequests
        }
      })
    } catch (error) {
      console.error('Error loading costing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRemainingAudits = () => {
    if (!costingData) return { ke: 0, vs: 0, limiting: 0 }
    
    const keAudits = Math.floor(costingData.keywordsEverywhere.creditsRemaining / 116)
    const vsAudits = Math.floor(costingData.serper.searchesRemaining / 75)
    
    return {
      ke: keAudits,
      vs: vsAudits,
      limiting: Math.min(keAudits, vsAudits)
    }
  }

  const formatCost = (amount: number) => {
    if (amount < 1) {
      const pence = Math.round(amount * 100)
      return `${pence}p`
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getHealthStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return { color: 'text-green-600 bg-green-50', status: 'Healthy' }
    if (percentage > 20) return { color: 'text-yellow-600 bg-yellow-50', status: 'Medium' }
    return { color: 'text-red-600 bg-red-50', status: 'Low' }
  }

  if (!isOpen) return null

  const remainingAudits = calculateRemainingAudits()

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
              <p className="text-gray-600">API configuration and status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCostingData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              title="Refresh data"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading API status...</span>
            </div>
          ) : costingData ? (
            <>
              {/* API Status */}
              <div className="grid grid-cols-1 gap-6">
                {/* Keywords Everywhere */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Keywords Everywhere</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatus(costingData.keywordsEverywhere.creditsRemaining, 100000).color}`}>
                      {getHealthStatus(costingData.keywordsEverywhere.creditsRemaining, 100000).status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{costingData.keywordsEverywhere.planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits Remaining:</span>
                      <span className="font-medium text-green-600">
                        {costingData.keywordsEverywhere.creditsRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits Used:</span>
                      <span className="font-medium">{costingData.keywordsEverywhere.creditsUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per 1K:</span>
                      <span className="font-medium">{formatCost(costingData.keywordsEverywhere.costPerCredit * 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audits Remaining:</span>
                      <span className="font-medium text-blue-600">{remainingAudits.ke.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Serper */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Serper</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatus(costingData.serper.searchesRemaining, 25000).color}`}>
                      {getHealthStatus(costingData.serper.searchesRemaining, 25000).status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{costingData.serper.planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Searches Remaining:</span>
                      <span className="font-medium text-green-600">
                        {costingData.serper.searchesRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Searches Used:</span>
                      <span className="font-medium">{costingData.serper.searchesUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per 1K:</span>
                      <span className="font-medium">{formatCost(costingData.serper.costPer1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audits Remaining:</span>
                      <span className="font-medium text-blue-600">{remainingAudits.vs.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Claude API */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Claude API</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${(costingData?.claudeApi?.requestsThisMonth || 0) < 100 ? 'text-green-600 bg-green-50' : (costingData?.claudeApi?.requestsThisMonth || 0) < 200 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'}`}>
                      {(costingData?.claudeApi?.requestsThisMonth || 0) < 100 ? 'Healthy' : (costingData?.claudeApi?.requestsThisMonth || 0) < 200 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{costingData?.claudeApi?.model || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Analysis:</span>
                      <span className="font-medium text-blue-600">
                        {costingData?.claudeApi?.businessAnalysisRequests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conclusion Generation:</span>
                      <span className="font-medium text-purple-600">
                        {costingData?.claudeApi?.conclusionGenerationRequests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokens Used:</span>
                      <span className="font-medium">{(costingData?.claudeApi?.tokensUsed || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">{formatCost(costingData?.claudeApi?.totalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Cost/Request:</span>
                      <span className="font-medium text-green-600">{formatCost(costingData?.claudeApi?.avgCostPerRequest || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="border rounded-lg">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">API Configuration</h3>
                  <p className="text-gray-600 text-sm">All API integrations (paid and free)</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {/* Paid APIs */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Paid APIs</h4>

                      <div className="flex items-center justify-between py-2 px-3 bg-blue-50 border border-blue-100 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Keywords Everywhere</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Keyword Research</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-purple-50 border border-purple-100 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Serper</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">SERP Analysis</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-indigo-50 border border-indigo-100 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Claude API (Anthropic)</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Automated Analysis</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>
                    </div>

                    {/* Free APIs */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Free APIs</h4>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Google PageSpeed Insights</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Core Web Vitals</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Companies House API</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">UK Business Data</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">OpenPageRank</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Domain Authority</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Playwright/Puppeteer</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Web Scraping</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 border border-gray-200 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Axe-core</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">Accessibility Testing</span>
                        </div>
                        <span className="text-green-600 font-medium text-sm">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Cost-Effective Architecture
                    </h4>
                    <ul className="text-blue-800 text-xs space-y-1">
                      <li>• Prioritizes free APIs (Google PageSpeed, Companies House, OpenPageRank)</li>
                      <li>• Uses paid APIs only for critical data (keywords, SERP rankings)</li>
                      <li>• Intelligent caching reduces redundant API calls</li>
                      <li>• Local processing with Playwright for content analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Unable to load API status</p>
              <p className="text-sm">Please try again later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}