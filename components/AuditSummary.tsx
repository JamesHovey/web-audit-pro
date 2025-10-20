"use client"

import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, ChevronRight, Clock, Zap, TrendingUp, Shield, Search, Code, FileText, Eye, HelpCircle } from 'lucide-react'
import { generateAuditSummary, SummaryIssue, AuditSummaryResult } from '@/lib/auditSummaryService'
import Tooltip from './Tooltip'

interface AuditSummaryProps {
  auditResults: any
  auditUrl?: string
}

const CATEGORY_CONFIG = {
  performance: { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Performance' },
  accessibility: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Accessibility' },
  seo: { icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'SEO' },
  technical: { icon: Code, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Technical' },
  content: { icon: FileText, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Content' }
}

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', label: 'Critical' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', label: 'High' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300', label: 'Medium' },
  low: { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', label: 'Low' }
}

type TabFilter = 'all' | 'critical' | 'high' | 'quickWins'

export default function AuditSummary({ auditResults, auditUrl }: AuditSummaryProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  // Generate summary
  const summary: AuditSummaryResult = generateAuditSummary(auditResults, auditUrl)

  if (summary.totalIssues === 0) {
    return (
      <div className="card-pmw">
        <div className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Excellent! No Issues Found</h2>
          <p className="text-gray-600">Your website is in great shape across all audited areas.</p>
        </div>
      </div>
    )
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Sort and filter issues
  const getSortedAndFilteredIssues = () => {
    let filtered = [...summary.topPriorities]

    // Filter by active tab
    if (activeTab === 'critical') {
      filtered = filtered.filter(issue => issue.severity === 'critical')
    } else if (activeTab === 'high') {
      filtered = filtered.filter(issue => issue.severity === 'high')
    } else if (activeTab === 'quickWins') {
      filtered = filtered.filter(issue => issue.quickWin === true)
    }

    // Sort by severity: Critical → High → Medium → Low
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    filtered.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
      if (severityDiff !== 0) return severityDiff
      // If same severity, sort by priority score
      return b.priorityScore - a.priorityScore
    })

    return filtered
  }

  const filteredIssues = getSortedAndFilteredIssues()

  // Expand the first issue by default when tab changes
  useEffect(() => {
    if (filteredIssues.length > 0) {
      setExpandedIssue(filteredIssues[0].id)
    }
  }, [activeTab])

  // Count issues by type
  const criticalCount = summary.topPriorities.filter(i => i.severity === 'critical').length
  const highCount = summary.topPriorities.filter(i => i.severity === 'high').length
  const quickWinsCount = summary.topPriorities.filter(i => i.quickWin === true).length

  return (
    <div className="card-pmw" data-section="summary">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Summary</h2>
          <p className="text-gray-600">
            Prioritized action items to improve your website performance, SEO, and user experience
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              All Issues ({summary.topPriorities.length})
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'critical'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical ({criticalCount})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'high'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                High Priority ({highCount})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quickWins')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'quickWins'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Wins ({quickWinsCount})
              </div>
            </button>
          </div>
        </div>

        {/* Issues List - Sorted and Filtered */}
        <div className="space-y-3">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index + 1}
                isExpanded={expandedIssue === issue.id}
                onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                onSeeMore={() => scrollToSection(issue.sectionId)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No issues found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface IssueCardProps {
  issue: SummaryIssue
  index: number
  isExpanded: boolean
  onToggle: () => void
  onSeeMore: () => void
}

function IssueCard({ issue, index, isExpanded, onToggle, onSeeMore }: IssueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[issue.category]
  const severityConfig = SEVERITY_CONFIG[issue.severity]
  const CategoryIcon = categoryConfig.icon

  return (
    <div className={`border rounded-lg overflow-hidden ${categoryConfig.border} ${isExpanded ? categoryConfig.bg : 'bg-white'}`}>
      <div className="p-4">
        {/* Page URL */}
        {issue.pageUrl && (
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">Page:</span>
              <a
                href={issue.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {issue.pageUrl}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {index}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityConfig.bg} ${severityConfig.color} uppercase`}>
                  {severityConfig.label}
                </span>
                {issue.quickWin && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Quick Win
                  </span>
                )}
                {issue.legalRisk && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Legal Risk
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CategoryIcon className="w-3 h-3" />
                  <span>{categoryConfig.label}</span>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-medium">Impact Score:</span>
                <span className="font-bold text-blue-600">{issue.priorityScore}</span>
                <Tooltip
                  content={
                    <div className="text-xs max-w-xs">
                      <p className="font-semibold mb-2">What is Impact Score?</p>
                      <p className="mb-2">This score helps you prioritize which issues to fix first. It considers:</p>
                      <ul className="space-y-1.5 ml-2">
                        <li>• How serious the problem is</li>
                        <li>• How much it affects your site's performance, SEO, or user experience</li>
                        <li>• Whether it could cause legal problems</li>
                        <li>• How easy or hard it is to fix</li>
                      </ul>
                      <p className="mt-2 font-medium text-blue-300">Higher score = Fix this first!</p>
                      <p className="text-gray-400 text-[10px] mt-1">Issues are ranked automatically so you can focus on what matters most.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={onSeeMore}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 whitespace-nowrap"
            >
              See more
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">How to Fix:</h5>
                <p className="text-sm text-gray-600">{issue.fixRecommendation}</p>
              </div>

              {/* Image Data Table */}
              {issue.imageData && issue.imageData.largeImageDetails && issue.imageData.largeImageDetails.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h5 className="text-sm font-semibold text-gray-700">Large Images Need Optimization</h5>
                  </div>
                  <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-orange-100 border-b border-orange-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-orange-900">Image</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-900">Found On Page</th>
                          <th className="px-3 py-2 text-right font-semibold text-orange-900">Size</th>
                          <th className="px-3 py-2 text-left font-semibold text-orange-900">Action Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issue.imageData.largeImageDetails.map((img: any, idx: number) => {
                          const fileName = img.imageUrl.split('/').pop() || img.imageUrl
                          const sizeKB = Math.round(img.sizeKB)
                          const actionNeeded = sizeKB > 500 ? 'Optimize urgently' : 'Compress image'

                          return (
                            <tr key={idx} className="border-b border-orange-100 hover:bg-orange-50">
                              <td className="px-3 py-2">
                                <a
                                  href={img.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {fileName}
                                </a>
                              </td>
                              <td className="px-3 py-2">
                                <a
                                  href={img.pageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-xs block"
                                >
                                  {img.pageUrl}
                                </a>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="text-red-600 font-semibold">{sizeKB}KB</span>
                              </td>
                              <td className="px-3 py-2 text-gray-700">{actionNeeded}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {/* Tip */}
                    <div className="p-3 bg-orange-50 border-t border-orange-200">
                      <div className="flex items-start gap-2 text-xs text-orange-800">
                        <span className="text-orange-600">💡</span>
                        <span><strong>Tip:</strong> Use image compression tools like TinyPNG or WebP format to reduce file sizes without losing quality.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Impact Breakdown */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Impact on:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {issue.impact.coreWebVitals && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Core Web Vitals</span>
                        <Tooltip content="Metrics that measure the quality of user experience on your site, including loading speed, interactivity, and visual stability">
                          <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-bold text-red-600">+{issue.impact.coreWebVitals}</span>
                    </div>
                  )}
                  {issue.impact.searchRanking && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Search Ranking</span>
                        <Tooltip content="How well your site ranks in search engine results. Better SEO practices lead to higher visibility and more organic traffic">
                          <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-bold text-blue-600">+{issue.impact.searchRanking}</span>
                    </div>
                  )}
                  {issue.impact.accessibility && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Accessibility</span>
                        <Tooltip content="How easily people with disabilities can use your website. This includes screen reader support, keyboard navigation, and visual clarity">
                          <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-bold text-purple-600">+{issue.impact.accessibility}</span>
                    </div>
                  )}
                  {issue.impact.userExperience && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">User Experience</span>
                        <Tooltip content="The overall quality of interaction visitors have with your site. This includes ease of navigation, visual design, and content readability">
                          <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-bold text-green-600">+{issue.impact.userExperience}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 font-medium transition-colors border-t border-gray-200"
      >
        {isExpanded ? 'Show less' : 'Show details'}
      </button>
    </div>
  )
}
