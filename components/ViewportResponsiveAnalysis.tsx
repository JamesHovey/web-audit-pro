"use client"

import React, { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'

interface ViewportIssue {
  viewport: string
  type: 'critical' | 'warning' | 'info'
  issue: string
  element?: string
  recommendation: string
  impact: string
}

interface ViewportResult {
  viewport: string
  width: number
  height: number
  issues: ViewportIssue[]
  score: number
  hasHorizontalScroll: boolean
  hasBrokenLayout: boolean
  hasTextOverflow: boolean
  hasImageOverflow: boolean
  hasNavigationIssues: boolean
  fontSizeIssues: boolean
  touchTargetIssues: boolean
  screenshot?: string
}

interface ViewportAnalysisData {
  url: string
  timestamp: string
  overallScore: number
  viewports: ViewportResult[]
  recommendations: any[]
  summary: {
    status: string
    score: number
    message: string
    criticalIssues: number
    warnings: number
    testedViewports: number
  }
}

interface ViewportResponsiveAnalysisProps {
  url: string
  data?: ViewportAnalysisData | null
}

export default function ViewportResponsiveAnalysis({ url, data }: ViewportResponsiveAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<ViewportAnalysisData | null>(data || null)
  const [error, setError] = useState<string | null>(null)
  const [expandedViewport, setExpandedViewport] = useState<string | null>(null)
  const [allExpanded, setAllExpanded] = useState<boolean>(false)
  const [fullscreenScreenshot, setFullscreenScreenshot] = useState<{ url: string; viewport: string } | null>(null)

  useEffect(() => {
    // Auto-run analysis on mount if no data was provided
    if (!data && !analysisData) {
      runAnalysis()
    }
    // Automatically expand first viewport with issues if data was provided
    if (data && data.viewports) {
      const firstWithIssues = data.viewports.find((v: ViewportResult) => v.issues.length > 0)
      if (firstWithIssues) {
        setExpandedViewport(firstWithIssues.viewport)
        setAllExpanded(true)
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/audit/viewport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze viewports')
      }

      const data = await response.json()
      setAnalysisData(data)
      // Automatically expand the first viewport with issues
      const firstWithIssues = data.viewports.find((v: ViewportResult) => v.issues.length > 0)
      if (firstWithIssues) {
        setExpandedViewport(firstWithIssues.viewport)
        setAllExpanded(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getViewportIcon = (viewportName: string) => {
    switch (viewportName) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4" />
      case 'Tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    if (score >= 50) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing responsive design across viewports...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    )
  }

  if (!analysisData) return null

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg">Viewport Responsiveness Analysis</h4>
            <Tooltip 
              content={
                <div>
                  <p className="font-semibold mb-2">Viewport Analysis Results</p>
                  <p className="mb-2">Shows how well your site adapts to different screen sizes.</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Score:</strong> Overall responsive design score (0-100)</p>
                    <p><strong>Critical:</strong> Issues that break layout or usability</p>
                    <p><strong>Warnings:</strong> Problems that affect user experience</p>
                    <p><strong>Mobile-First:</strong> Google uses mobile version for ranking</p>
                  </div>
                </div>
              }
              position="top"
            >
              <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className={`px-4 py-2 rounded-full ${getScoreColor(analysisData.summary.score)}`}>
            <span className="font-bold text-lg">{analysisData.summary.score}/100</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{analysisData.summary.message}</p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${analysisData.summary.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {analysisData.summary.criticalIssues}
            </div>
            <div className="text-xs text-gray-600 mt-1">Critical Issues</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${analysisData.summary.warnings > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {analysisData.summary.warnings}
            </div>
            <div className="text-xs text-gray-600 mt-1">Warnings</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analysisData.summary.testedViewports}
            </div>
            <div className="text-xs text-gray-600 mt-1">Viewports</div>
          </div>
        </div>
      </div>

      {/* Viewport Results Grid */}
      <div className="space-y-4">
        {/* Toggle for showing all issues */}
        {analysisData.viewports.some(v => v.issues.length > 0) && (
          <div className="flex justify-end">
            <button
              onClick={() => setAllExpanded(!allExpanded)}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {allExpanded ? 'Hide All Issues' : 'Show All Issues'}
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisData.viewports.map((viewport) => (
          <div key={viewport.viewport} className="bg-white rounded-lg border overflow-hidden">
            {/* Screenshot */}
            {viewport.screenshot && (
              <div
                className="relative bg-gray-100 cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation()
                  setFullscreenScreenshot({ url: viewport.screenshot!, viewport: viewport.viewport })
                }}
              >
                <img
                  src={viewport.screenshot}
                  alt={`${viewport.viewport} screenshot`}
                  className="w-full h-auto transition-opacity group-hover:opacity-90"
                />
                {/* Horizontal scroll indicator */}
                {viewport.hasHorizontalScroll && (
                  <div className="absolute inset-0 border-4 border-red-500 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Horizontal Scroll Detected
                    </div>
                  </div>
                )}
                {/* Click to expand hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                    Click to enlarge
                  </div>
                </div>
                {/* Viewport badge overlay */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                  {getViewportIcon(viewport.viewport)}
                  <span>{viewport.width}px</span>
                </div>
                {/* Score badge overlay */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${getScoreColor(viewport.score)}`}>
                  {viewport.score}/100
                </div>
              </div>
            )}

            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedViewport(expandedViewport === viewport.viewport ? null : viewport.viewport)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getViewportIcon(viewport.viewport)}
                  <span className="font-medium">{viewport.viewport}</span>
                  {!viewport.screenshot && <span className="text-xs text-gray-500">({viewport.width}px)</span>}
                </div>

                <div className="flex items-center gap-2">
                  {!viewport.screenshot && (
                    <div className={`px-2 py-1 rounded text-sm ${getScoreColor(viewport.score)}`}>
                      {viewport.score}/100
                    </div>
                  )}
                  {expandedViewport === viewport.viewport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Issue Summary */}
              {viewport.issues.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {viewport.issues.filter(i => i.type === 'critical').length > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      {viewport.issues.filter(i => i.type === 'critical').length} critical
                    </span>
                  )}
                  {viewport.issues.filter(i => i.type === 'warning').length > 0 && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      {viewport.issues.filter(i => i.type === 'warning').length} warnings
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Expanded Issues */}
            {(expandedViewport === viewport.viewport || allExpanded) && viewport.issues.length > 0 && (
              <div className="border-t p-4 space-y-2">
                {viewport.issues.map((issue, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="mt-0.5">{getIssueIcon(issue.type)}</div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900">{issue.issue}</p>
                      <p className="text-gray-600 mt-1">{issue.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Recommendations */}
      {analysisData.recommendations.length > 0 && analysisData.recommendations.some(r => r.priority === 'high' || r.priority === 'medium') && (
        <div className="bg-white rounded-lg border p-6">
          <h5 className="font-semibold text-gray-900 mb-4">Priority Improvements</h5>
          
          <div className="space-y-3">
            {analysisData.recommendations
              .filter(rec => rec.priority === 'high' || rec.priority === 'medium')
              .map((rec, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{rec.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {rec.items.slice(0, 3).map((item: string, itemIdx: number) => (
                      <li key={itemIdx} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Re-run Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={runAnalysis}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Re-run Analysis
        </button>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {fullscreenScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenScreenshot(null)}
        >
          <button
            onClick={() => setFullscreenScreenshot(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-6xl w-full">
            <div className="bg-white rounded-lg p-2 mb-3">
              <h3 className="text-lg font-semibold text-center">{fullscreenScreenshot.viewport} View</h3>
            </div>
            <img
              src={fullscreenScreenshot.url}
              alt={`${fullscreenScreenshot.viewport} fullscreen`}
              className="w-full h-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}