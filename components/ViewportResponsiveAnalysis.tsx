"use client"

import React, { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, HelpCircle, Code } from 'lucide-react'
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
  recommendations: Record<string, unknown>[]
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
          <span className="ml-3 text-gray-600">Analysing responsive design across viewports...</span>
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
              onClick={() => {
                const newExpandedState = !allExpanded
                setAllExpanded(newExpandedState)
                setExpandedViewport(null) // Clear individual selection when toggling all
              }}
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
              onClick={() => {
                // If allExpanded is active, turn it off and expand this specific viewport
                if (allExpanded) {
                  setAllExpanded(false)
                  setExpandedViewport(viewport.viewport)
                } else {
                  // Normal toggle behavior for individual viewport
                  setExpandedViewport(expandedViewport === viewport.viewport ? null : viewport.viewport)
                }
              }}
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
                  {(expandedViewport === viewport.viewport || allExpanded) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
          <p className="text-sm text-gray-600 mb-4">
            Step-by-step implementation guides for fixing responsive design issues. Each recommendation includes code examples and platform-specific instructions.
          </p>

          <div className="space-y-6">
            {analysisData.recommendations
              .filter(rec => rec.priority === 'high' || rec.priority === 'medium')
              .map((rec, idx) => (
                <details key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer bg-gray-50 p-4 hover:bg-gray-100 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="font-medium text-gray-900">{rec.title}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </summary>
                  <div className="p-4 bg-white">
                    {/* Issues Found */}
                    <div className="mb-4">
                      <h6 className="font-medium text-sm text-gray-700 mb-2">Issues Found:</h6>
                      <ul className="space-y-1.5">
                        {rec.items.map((item: string, itemIdx: number) => (
                          <li key={itemIdx} className="text-sm text-gray-600 flex items-start">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation Guide */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h6 className="font-medium text-sm text-blue-900 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        How to Fix This
                      </h6>

                      {/* WordPress / CMS Instructions */}
                      {rec.title.toLowerCase().includes('viewport') || rec.title.toLowerCase().includes('meta') ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3 border-l-4 border-blue-400">
                            <p className="font-medium text-sm text-gray-900 mb-2">For WordPress Users:</p>
                            <ol className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-blue-600">1.</span>
                                <span>
                                  <strong>Check your theme:</strong> Most modern WordPress themes already include the viewport meta tag. Go to Appearance → Customize to verify.
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-blue-600">2.</span>
                                <span>
                                  <strong>If missing:</strong> Install a plugin like &quot;Insert Headers and Footers&quot; or &quot;Head, Footer and Post Injections&quot;
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-blue-600">3.</span>
                                <span>
                                  <strong>Add this code</strong> in the header section:
                                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
                                    {'<meta name="viewport" content="width=device-width, initial-scale=1.0">'}
                                  </code>
                                </span>
                              </li>
                            </ol>
                          </div>

                          <div className="bg-white rounded p-3 border-l-4 border-green-400">
                            <p className="font-medium text-sm text-gray-900 mb-2">For Custom HTML/Developers:</p>
                            <ol className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-green-600">1.</span>
                                <span>
                                  <strong>Open your HTML file</strong> or theme&apos;s header.php file
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-green-600">2.</span>
                                <span>
                                  <strong>Add this in the {'<head>'} section:</strong>
                                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono whitespace-pre">
{`<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="mobile-web-app-capable" content="yes">`}
                                  </code>
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-green-600">3.</span>
                                <span>
                                  <strong>Test on mobile devices</strong> using browser DevTools (F12 → Toggle Device Toolbar)
                                </span>
                              </li>
                            </ol>
                          </div>
                        </div>
                      ) : rec.title.toLowerCase().includes('horizontal scroll') ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3 border-l-4 border-red-400">
                            <p className="font-medium text-sm text-gray-900 mb-2">Quick CSS Fix:</p>
                            <ol className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-red-600">1.</span>
                                <span>
                                  <strong>Add this CSS</strong> to prevent horizontal scrolling:
                                  <code className="block mt-1 bg-gray-900 text-green-400 p-3 rounded text-xs font-mono whitespace-pre">
{`/* Prevent horizontal scroll */
html, body {
  overflow-x: hidden;
  max-width: 100%;
}

/* Make images responsive */
img {
  max-width: 100%;
  height: auto;
}

/* Prevent content overflow */
* {
  box-sizing: border-box;
}`}
                                  </code>
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-red-600">2.</span>
                                <span>
                                  <strong>For WordPress:</strong> Add this CSS in Appearance → Customize → Additional CSS
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-red-600">3.</span>
                                <span>
                                  <strong>For custom sites:</strong> Add to your main CSS file (usually style.css or main.css)
                                </span>
                              </li>
                            </ol>
                          </div>

                          <div className="bg-white rounded p-3 border-l-4 border-orange-400">
                            <p className="font-medium text-sm text-gray-900 mb-2">Finding the Culprit:</p>
                            <ol className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-orange-600">1.</span>
                                <span>
                                  <strong>Open browser DevTools</strong> (F12) and toggle device mode
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-orange-600">2.</span>
                                <span>
                                  <strong>Run this in Console</strong> to find wide elements:
                                  <code className="block mt-1 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono whitespace-pre">
{`document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > document.body.clientWidth) {
    console.log('Wide element:', el);
  }
});`}
                                  </code>
                                </span>
                              </li>
                              <li className="flex items-start">
                                <span className="font-semibold mr-2 text-orange-600">3.</span>
                                <span>
                                  <strong>Fix the identified elements</strong> by setting max-width: 100% or adjusting their width
                                </span>
                              </li>
                            </ol>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded p-3 border-l-4 border-gray-400">
                          <ol className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                              <span className="font-semibold mr-2 text-gray-600">1.</span>
                              <span>Review the issues listed above and identify the affected elements</span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-semibold mr-2 text-gray-600">2.</span>
                              <span>Use browser DevTools (F12) to inspect and test responsive behavior</span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-semibold mr-2 text-gray-600">3.</span>
                              <span>Apply CSS media queries or use responsive design frameworks</span>
                            </li>
                            <li className="flex items-start">
                              <span className="font-semibold mr-2 text-gray-600">4.</span>
                              <span>Test on real devices or using browser device emulation</span>
                            </li>
                          </ol>
                        </div>
                      )}

                      {/* Additional Tips */}
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>💡 Pro Tip:</strong> After making changes, test your site on multiple devices and screen sizes. Use Chrome DevTools (F12 → Toggle Device Toolbar) to quickly test different viewport sizes.
                      </div>
                    </div>
                  </div>
                </details>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenScreenshot(null)}
          style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)' }}
        >
          <button
            onClick={() => setFullscreenScreenshot(null)}
            className="absolute top-4 right-4 text-gray-900 hover:text-gray-600 transition-colors"
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