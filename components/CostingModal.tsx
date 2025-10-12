'use client'

import { useState, useEffect } from 'react'
import { X, PoundSterling, TrendingUp, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'

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
  auditHistory: Array<{
    id: string
    url: string
    date: string
    keywordsEverywhereCredits: number
    valueSerpSearches: number
    claudeBusinessAnalysisCost: number
    claudeConclusionCost: number
    totalCost: number
  }>
}

interface CostingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CostingModal({ isOpen, onClose }: CostingModalProps) {
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
          },
          auditHistory: [
            {
              id: 'cmgkopno20005218s09zddqsq',
              url: 'mondeumcapital.com',
              date: new Date().toISOString(),
              keywordsEverywhereCredits: 116,
              valueSerpSearches: 75,
              claudeBusinessAnalysisCost: 0.0019,
              claudeConclusionCost: 0.00088,
              totalCost: 0.151
            },
            {
              id: 'cmgkn69tp0003218sauing9tx', 
              url: 'henryadams.co.uk',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              keywordsEverywhereCredits: 142,
              valueSerpSearches: 92,
              claudeBusinessAnalysisCost: 0.0019,
              claudeConclusionCost: 0.00088,
              totalCost: 0.182
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching costing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCostPerAudit = () => {
    if (!costingData) return 0
    
    const keAvgCost = 116 * costingData.keywordsEverywhere.costPerCredit
    const vsAvgCost = 75 * (costingData.valueSERP.costPer1000 / 1000)
    const claudeBusinessCost = 0.0019 // Average business analysis cost
    const claudeConclusionCost = 0.00088 // Average conclusion generation cost
    return keAvgCost + vsAvgCost + claudeBusinessCost + claudeConclusionCost
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatCostInPence = (amount: number) => {
    const pence = Math.round(amount * 100)
    return `${pence}p`
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getHealthStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return { color: 'text-green-600 bg-green-50', status: 'Healthy' }
    if (percentage > 20) return { color: 'text-yellow-600 bg-yellow-50', status: 'Medium' }
    return { color: 'text-red-600 bg-red-50', status: 'Low' }
  }

  if (!isOpen) return null

  const costPerAudit = calculateCostPerAudit()
  const remainingAudits = calculateRemainingAudits()

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <PoundSterling className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Costing</h2>
              <p className="text-gray-600">Real-time credit usage and audit costs</p>
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
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading costing data...</span>
            </div>
          ) : costingData ? (
            <>
              {/* Cost Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Cost per Audit</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCostInPence(costPerAudit)}
                  </div>
                  <p className="text-blue-700 text-sm">About {Math.round(costPerAudit * 100)} pence per full audit</p>
                  <p className="text-blue-600 text-xs mt-1">({formatCurrency(costPerAudit)} in decimal)</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Audits Remaining</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {remainingAudits.limiting.toLocaleString()}
                  </div>
                  <p className="text-green-700 text-sm">Based on current credits</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Monthly Budget</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(costPerAudit * 100)}
                  </div>
                  <p className="text-purple-700 text-sm">For 100 audits/month</p>
                  <p className="text-purple-600 text-xs mt-1">That's £{(costPerAudit * 100).toFixed(2)} for 100 audits</p>
                </div>
              </div>


              {/* Audit History */}
              <div className="border rounded-lg">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold">Recent Audit History</h3>
                  <p className="text-gray-600 text-sm">Credit usage and costs per audit</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Website</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Date</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">KE Credits</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">VS Searches</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">Claude AI</th>
                        <th className="px-6 py-3 text-center font-medium text-gray-700">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {costingData.auditHistory.map((audit) => (
                        <tr key={audit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">{audit.url}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(audit.date)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {audit.keywordsEverywhereCredits}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {audit.valueSerpSearches}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {formatCostInPence(audit.claudeBusinessAnalysisCost + audit.claudeConclusionCost)}
                              </span>
                              <div className="text-xs text-gray-500">
                                Bus: {formatCostInPence(audit.claudeBusinessAnalysisCost)} | Con: {formatCostInPence(audit.claudeConclusionCost)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-green-600">
                            <div>{formatCostInPence(audit.totalCost)}</div>
                            <div className="text-xs text-gray-500">({formatCurrency(audit.totalCost)})</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {costingData.auditHistory.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No audit history available</p>
                    <p className="text-sm">Run your first audit to see cost tracking here</p>
                  </div>
                )}
              </div>

              {/* Usage Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Cost Optimization Tips
                </h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Each full audit costs approximately {formatCostInPence(costPerAudit)} ({formatCurrency(costPerAudit)}) in API credits</li>
                  <li>• Keywords Everywhere: ~116 credits per audit (keyword research & volumes)</li>
                  <li>• ValueSERP: ~75 searches per audit (ranking checks & competitor analysis)</li>
                  <li>• Claude AI Business Analysis: ~{formatCostInPence(0.0019)} per audit (intelligent business detection)</li>
                  <li>• Claude AI Conclusions: ~{formatCostInPence(0.00088)} per audit (tailored recommendations)</li>
                  <li>• Consider upgrading to higher tiers for better per-credit rates if running 100+ audits/month</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Unable to load costing data</p>
              <p className="text-sm">Please try again later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}