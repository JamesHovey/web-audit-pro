"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Info, HelpCircle, Zap } from 'lucide-react'
import Tooltip from './Tooltip'

interface AccessibilityIssue {
  id: string
  description: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: string
  wcagPrinciple: string
  help: string
  helpUrl: string
  elementSelector?: string
  htmlSnippet?: string
  fixRecommendation: string
  codeExample?: string
  source: 'axe' | 'pa11y'
}

interface AccessibilityResult {
  url: string
  timestamp: string
  score: number
  totalIssues: number
  passedRules: number
  violatedRules: number
  issuesBySeverity: {
    critical: number
    serious: number
    moderate: number
    minor: number
  }
  issuesByPrinciple: {
    perceivable: number
    operable: number
    understandable: number
    robust: number
  }
  issues: AccessibilityIssue[]
  complianceLevel: 'AAA' | 'AA' | 'A' | 'Non-compliant'
  eaaCompliant: boolean
  summary: string
}

interface AccessibilityResultsProps {
  data: AccessibilityResult | { pages: AccessibilityResult[] }
}

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: 'text-red-500' },
  serious: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-500' },
  moderate: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', icon: 'text-yellow-500' },
  minor: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-500' }
}

const PRINCIPLE_INFO = {
  perceivable: {
    title: 'Perceivable',
    description: 'Information and UI components must be presentable to users in ways they can perceive',
    icon: '👁️'
  },
  operable: {
    title: 'Operable',
    description: 'UI components and navigation must be operable',
    icon: '⌨️'
  },
  understandable: {
    title: 'Understandable',
    description: 'Information and UI operation must be understandable',
    icon: '💡'
  },
  robust: {
    title: 'Robust',
    description: 'Content must be robust enough for interpretation by various assistive technologies',
    icon: '🔧'
  }
}

export default function AccessibilityResults({ data }: AccessibilityResultsProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterPrinciple, setFilterPrinciple] = useState<string>('all')
  const [selectedPage, setSelectedPage] = useState(0)

  // Check if we have multi-page results
  const isMultiPage = 'pages' in data
  const currentResult: AccessibilityResult = isMultiPage ? data.pages[selectedPage] : data
  const pageResults = isMultiPage ? data.pages : [data]

  const toggleIssue = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }

  // Filter issues
  const filteredIssues = currentResult.issues.filter(issue => {
    if (filterSeverity !== 'all' && issue.impact !== filterSeverity) return false
    if (filterPrinciple !== 'all' && issue.wcagPrinciple !== filterPrinciple) return false
    return true
  })

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  // Get compliance badge color
  const getComplianceBadgeColor = (level: string) => {
    if (level === 'AAA' || level === 'AA') return 'bg-green-100 text-green-800 border-green-300'
    if (level === 'A') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <div className="space-y-6">
      {/* Detected Plugins Banner */}
      {currentResult.installedPlugins && currentResult.installedPlugins.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Accessibility Plugins Detected</h3>
              <p className="text-sm text-blue-800 mb-2">
                We found {currentResult.installedPlugins.length} accessibility plugin{currentResult.installedPlugins.length > 1 ? 's' : ''} installed on this website
              </p>
              <div className="flex flex-wrap gap-2">
                {currentResult.installedPlugins.map((plugin, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {plugin}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Accessibility Audit</h2>
          <Tooltip
            content={
              <div>
                <p className="font-semibold mb-2">What is Accessibility Testing?</p>
                <p className="mb-2">Accessibility ensures your website can be used by everyone, including people with disabilities.</p>
                <div className="text-xs space-y-1">
                  <p><strong>Why it matters:</strong> 15% of the global population has some form of disability</p>
                  <p><strong>Legal requirement:</strong> UK Equality Act & European Accessibility Act compliance</p>
                  <p><strong>SEO benefit:</strong> Accessible sites rank better on Google</p>
                  <p><strong>Tools used:</strong> axe-core + Pa11y (industry-standard, free tools)</p>
                </div>
              </div>
            }
            position="right"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
          {isMultiPage && (
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {pageResults.map((result, index) => (
                <option key={index} value={index}>
                  {result.url} ({result.totalIssues} issues)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`text-5xl font-bold ${getScoreColor(currentResult.score)}`}>
                {currentResult.score}
              </div>
              <Tooltip
                content={
                  <div>
                    <p className="font-semibold mb-2">How is the score calculated?</p>
                    <p className="text-xs mb-2">Score starts at 100 and deductions are made based on severity:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Critical issues: -10 points each</li>
                      <li>• Serious issues: -5 points each</li>
                      <li>• Moderate issues: -2 points each</li>
                      <li>• Minor issues: -1 point each</li>
                    </ul>
                    <p className="text-xs mt-2"><strong>90+:</strong> Excellent | <strong>70-89:</strong> Good | <strong>50-69:</strong> Needs Work | <strong>&lt;50:</strong> Poor</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600 mt-2">Accessibility Score</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold ${getComplianceBadgeColor(currentResult.complianceLevel)}`}>
                WCAG {currentResult.complianceLevel}
              </div>
              <Tooltip
                content={
                  <div>
                    <p className="font-semibold mb-2">WCAG Compliance Levels</p>
                    <ul className="text-xs space-y-1">
                      <li><strong>Level A:</strong> Minimum accessibility (basic)</li>
                      <li><strong>Level AA:</strong> Standard compliance (required by law)</li>
                      <li><strong>Level AAA:</strong> Enhanced accessibility (gold standard)</li>
                    </ul>
                    <p className="text-xs mt-2">UK/EAA requires <strong>Level AA</strong> compliance</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600 mt-2">Compliance Level</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`text-2xl font-bold ${currentResult.eaaCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {currentResult.eaaCompliant ? '✓ Compliant' : '✗ Non-Compliant'}
              </div>
              <Tooltip
                content={
                  <div>
                    <p className="font-semibold mb-2">UK & European Requirements</p>
                    <p className="text-xs mb-2"><strong>UK Equality Act 2010:</strong> Requires reasonable adjustments for disabled users</p>
                    <p className="text-xs mb-2"><strong>European Accessibility Act:</strong> WCAG 2.2 AA required for businesses with 10+ employees and €2M+ turnover</p>
                    <p className="text-xs"><strong>Penalties:</strong> Up to €3M fines or legal action</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600 mt-2">UK/EAA Requirements</div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-700">{currentResult.summary}</p>
        </div>
      </div>

      {/* Issues by Severity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-900">Issues by Severity</h3>
          <Tooltip
            content={
              <div>
                <p className="font-semibold mb-2">Understanding Severity Levels</p>
                <ul className="text-xs space-y-1">
                  <li><strong className="text-red-600">Critical:</strong> Blocks disabled users from accessing content - fix immediately</li>
                  <li><strong className="text-orange-600">Serious:</strong> Significantly impairs user experience - high priority</li>
                  <li><strong className="text-yellow-600">Moderate:</strong> Causes inconvenience - medium priority</li>
                  <li><strong className="text-blue-600">Minor:</strong> Small improvements - low priority</li>
                </ul>
                <p className="text-xs mt-2">Focus on Critical and Serious issues first for maximum impact</p>
              </div>
            }
            position="right"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(currentResult.issuesBySeverity)
            .filter(([, count]) => count > 0)
            .map(([severity, count]) => {
              const colors = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
              return (
                <div
                  key={severity}
                  className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
                >
                  <div className={`text-3xl font-bold ${colors.text}`}>{count}</div>
                  <div className="text-sm text-gray-600 capitalize mt-1">{severity}</div>
                </div>
              )
            })}
        </div>
        {Object.values(currentResult.issuesBySeverity).every(count => count === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-medium">No issues found by severity level</p>
          </div>
        )}
      </div>

      {/* Issues by WCAG Principle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-900">Issues by WCAG Principle</h3>
          <Tooltip
            content={
              <div>
                <p className="font-semibold mb-2">The Four WCAG Principles (POUR)</p>
                <ul className="text-xs space-y-2">
                  <li><strong>👁️ Perceivable:</strong> Users must be able to perceive the information (e.g., alt text for images, color contrast)</li>
                  <li><strong>⌨️ Operable:</strong> Users must be able to operate the interface (e.g., keyboard navigation, no time limits)</li>
                  <li><strong>💡 Understandable:</strong> Information must be easy to understand (e.g., clear language, predictable behavior)</li>
                  <li><strong>🔧 Robust:</strong> Content must work with assistive technologies (e.g., proper HTML markup, ARIA labels)</li>
                </ul>
              </div>
            }
            position="right"
          >
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(currentResult.issuesByPrinciple)
            .filter(([, count]) => count > 0)
            .map(([principle, count]) => {
              const info = PRINCIPLE_INFO[principle as keyof typeof PRINCIPLE_INFO]
              return (
                <div key={principle} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="font-semibold text-gray-900">{info.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                  </div>
                </div>
              )
            })}
        </div>
        {Object.values(currentResult.issuesByPrinciple).every(count => count === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-medium">No issues found across WCAG principles</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filter by Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="serious">Serious</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filter by Principle:</label>
            <select
              value={filterPrinciple}
              onChange={(e) => setFilterPrinciple(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Principles</option>
              <option value="perceivable">Perceivable</option>
              <option value="operable">Operable</option>
              <option value="understandable">Understandable</option>
              <option value="robust">Robust</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600 flex items-center">
            Showing {filteredIssues.length} of {currentResult.totalIssues} issues
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No issues found with the selected filters</p>
          </div>
        ) : (
          filteredIssues.map((issue, index) => {
            const isExpanded = expandedIssues.has(issue.id + index)
            const colors = SEVERITY_COLORS[issue.impact]

            return (
              <div
                key={issue.id + index}
                className={`bg-white rounded-lg border-l-4 ${colors.border} border-y border-r border-gray-200 overflow-hidden`}
              >
                {/* Issue Header */}
                <button
                  onClick={() => toggleIssue(issue.id + index)}
                  className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors.bg} ${colors.text} uppercase`}>
                        {issue.impact}
                      </span>
                      <span className="text-xs text-gray-500">
                        {issue.wcagCriterion} ({issue.wcagLevel})
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {PRINCIPLE_INFO[issue.wcagPrinciple as keyof typeof PRINCIPLE_INFO]?.icon} {issue.wcagPrinciple}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{issue.help}</h4>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </button>

                {/* Issue Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    {/* Element Info */}
                    {issue.elementSelector && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Affected Element:</h5>
                        <code className="block p-2 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                          {issue.elementSelector}
                        </code>
                      </div>
                    )}

                    {/* HTML Snippet */}
                    {issue.htmlSnippet && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">HTML:</h5>
                        <code className="block p-2 bg-gray-900 text-gray-300 rounded text-xs overflow-x-auto">
                          {issue.htmlSnippet}
                        </code>
                      </div>
                    )}

                    {/* Fix Recommendation */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">How to Fix:</h5>
                      <p className="text-sm text-gray-600 mb-2">{issue.fixRecommendation}</p>
                    </div>

                    {/* Code Example */}
                    {issue.codeExample && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Code Example:</h5>
                        <pre className="p-3 bg-gray-900 text-gray-300 rounded text-xs overflow-x-auto">
                          {issue.codeExample}
                        </pre>
                      </div>
                    )}

                    {/* Learn More Link */}
                    <div>
                      <a
                        href={issue.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Learn more about this issue
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>

                    {/* Source Badge */}
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Detected by: <span className="font-semibold">{issue.source === 'axe' ? 'axe-core' : 'Pa11y'}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Legal Requirements Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">UK & European Legal Requirements</p>
            <p className="text-amber-800">
              The <strong>European Accessibility Act (EAA)</strong> requires WCAG 2.2 Level AA compliance for businesses with 10+ employees
              and €2M+ turnover. The <strong>UK Equality Act 2010</strong> requires reasonable adjustments for disabled users.
              Non-compliance may result in fines up to €3M or legal action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
