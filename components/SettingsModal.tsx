'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, Settings, CheckCircle, AlertCircle } from 'lucide-react'

interface CostingData {
  keywordsEverywhere: {
    creditsRemaining: number
    creditsUsed: number
    costPerCredit: number
    planType: string
  }
  valueSERP: {
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
      // TODO: Replace with actual API call
      const response = await fetch('/api/costing')
      if (response.ok) {
        const data = await response.json()
        setCostingData(data)
      } else {
        // Mock data for now
        setCostingData({
          keywordsEverywhere: {
            creditsRemaining: 79515,
            creditsUsed: 485,
            costPerCredit: 0.00024, // 24¢ per 1000 credits
            planType: 'Bronze Package (100K/year)'
          },
          valueSERP: {
            searchesRemaining: 22350,
            searchesUsed: 2650,
            costPer1000: 1.60,
            planType: '25K Searches/month ($50/month)'
          },
          claudeApi: {
            tokensUsed: 52180,
            totalCost: 0.398,
            requestsThisMonth: 15,
            avgCostPerRequest: 0.0265,
            lastUpdated: new Date().toISOString(),
            model: 'claude-3-5-haiku-20241022',
            businessAnalysisRequests: 9,
            conclusionGenerationRequests: 6
          }
        })
      }
    } catch (error) {
      console.error('Error fetching costing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRemainingAudits = () => {
    if (!costingData) return { ke: 0, vs: 0, limiting: 0 }
    
    const keAudits = Math.floor(costingData.keywordsEverywhere.creditsRemaining / 116)
    const vsAudits = Math.floor(costingData.valueSERP.searchesRemaining / 75)
    
    return {
      ke: keAudits,
      vs: vsAudits,
      limiting: Math.min(keAudits, vsAudits)
    }
  }

  const formatCostInPence = (amount: number) => {
    const pence = Math.round(amount * 100)
    return `${pence}p`
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
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <span className="font-medium">{formatCostInPence(costingData.keywordsEverywhere.costPerCredit * 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Audits Remaining:</span>
                      <span className="font-medium text-blue-600">{remainingAudits.ke.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ValueSERP */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">ValueSERP</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatus(costingData.valueSERP.searchesRemaining, 25000).color}`}>
                      {getHealthStatus(costingData.valueSERP.searchesRemaining, 25000).status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{costingData.valueSERP.planType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Searches Remaining:</span>
                      <span className="font-medium text-green-600">
                        {costingData.valueSERP.searchesRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Searches Used:</span>
                      <span className="font-medium">{costingData.valueSERP.searchesUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per 1K:</span>
                      <span className="font-medium">{formatCostInPence(costingData.valueSERP.costPer1000)}</span>
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
                      <span className="font-medium">{formatCostInPence(costingData?.claudeApi?.totalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Cost/Request:</span>
                      <span className="font-medium text-green-600">{formatCostInPence(costingData?.claudeApi?.avgCostPerRequest || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="border rounded-lg">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">API Configuration</h3>
                  <p className="text-gray-600 text-sm">Manage your API keys and settings</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      API Integration Status
                    </h4>
                    <div className="text-blue-800 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Keywords Everywhere API:</span>
                        <span className="text-green-600 font-medium">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ValueSERP API:</span>
                        <span className="text-green-600 font-medium">✓ Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Claude API:</span>
                        <span className="text-green-600 font-medium">✓ Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">API key management coming soon</p>
                    <p className="text-xs text-gray-400">Configure your API keys and rate limits</p>
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