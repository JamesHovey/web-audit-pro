"use client"

import React from 'react'
import { PremiumTrafficData } from '@/lib/premiumTrafficAnalysis'
import Tooltip from './Tooltip'
import { Globe } from 'lucide-react'

interface PremiumTrafficInsightsProps {
  data: PremiumTrafficData
}

export default function PremiumTrafficInsights({ data }: PremiumTrafficInsightsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Traffic Analysis Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Monthly Organic Traffic</div>
              <Tooltip
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Organic Traffic Estimation</p>
                    <p className="mb-2">Estimated from multiple signals:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Content volume and quality analysis</li>
                      <li>Domain authority correlation</li>
                      <li>SERP visibility assessment</li>
                      <li>Industry benchmarking</li>
                    </ul>
                    <p className="text-sm"><strong>Reasoning:</strong> {data.monthlyOrganicTraffic.reasoning}</p>
                  </div>
                }
                position="top"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.monthlyOrganicTraffic.estimate)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(data.monthlyOrganicTraffic.confidence)}`}>
                {data.monthlyOrganicTraffic.confidence} confidence
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Monthly Paid Traffic</div>
              <Tooltip
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Paid Traffic Estimation</p>
                    <p className="mb-2">Estimated based on:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Industry advertising patterns</li>
                      <li>Competitive intelligence</li>
                      <li>Brand strength indicators</li>
                    </ul>
                  </div>
                }
                position="top"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.monthlyPaidTraffic.estimate)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(data.monthlyPaidTraffic.confidence)}`}>
                {data.monthlyPaidTraffic.confidence} confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Breakdown & Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📈 Traffic Breakdown & Analysis
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Traffic Sources */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
              Traffic Sources
              <Tooltip
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Traffic Source Distribution</p>
                    <p className="text-sm">Analysis of how visitors find and access your website across different channels.</p>
                  </div>
                }
                position="top"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Visitors</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Organic Search</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(data.trafficSources.organic.visitors)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{data.trafficSources.organic.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Direct/Branded</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(data.trafficSources.direct.visitors)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{data.trafficSources.direct.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Paid Search</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(data.trafficSources.paid.visitors)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{data.trafficSources.paid.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Social Media</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(data.trafficSources.social.visitors)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{data.trafficSources.social.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Geographic Distribution
              <Tooltip
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Traffic by Country</p>
                    <p className="text-sm">Geographic breakdown of your website visitors and market opportunities.</p>
                  </div>
                }
                position="top"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.topCountries.map((country, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium text-gray-900">{country.country}</span>
                    </div>
                    <span className="text-sm text-gray-600">{country.percentage}%</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatNumber(country.traffic)} visitors/month
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {country.marketOpportunity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}