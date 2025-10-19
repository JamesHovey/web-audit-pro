"use client"

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronRight, Clock, Zap, TrendingUp, Shield, Search, Code, FileText, Eye } from 'lucide-react'
import { generateAuditSummary, SummaryIssue, AuditSummaryResult } from '@/lib/auditSummaryService'

interface AuditSummaryProps {
  auditResults: any
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

export default function AuditSummary({ auditResults }: AuditSummaryProps) {
  const [viewMode, setViewMode] = useState<'priority' | 'category'>('priority')
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  // Generate summary
  const summary: AuditSummaryResult = generateAuditSummary(auditResults)

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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Critical</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{summary.criticalIssues}</div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">High Priority</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">{summary.highPriorityIssues}</div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Quick Wins</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{summary.quickWins}</div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Est. Time</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{summary.estimatedTotalTime}</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">View by:</span>
          <button
            onClick={() => setViewMode('priority')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'priority'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Category
          </button>
        </div>

        {/* Issues List - Priority View */}
        {viewMode === 'priority' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Priority Actions</h3>
            {summary.topPriorities.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index + 1}
                isExpanded={expandedIssue === issue.id}
                onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                onSeeMore={() => scrollToSection(issue.sectionId)}
              />
            ))}
          </div>
        )}

        {/* Issues List - Category View */}
        {viewMode === 'category' && (
          <div className="space-y-6">
            {Object.entries(summary.byCategory).map(([category, issues]) => {
              if (issues.length === 0) return null
              const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
              const Icon = config.icon

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
                    <span className="text-sm text-gray-500">({issues.length} issues)</span>
                  </div>
                  <div className="space-y-3">
                    {issues.slice(0, 5).map((issue, index) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        index={index + 1}
                        isExpanded={expandedIssue === issue.id}
                        onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                        onSeeMore={() => scrollToSection(issue.sectionId)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
              {issue.estimatedTimeToFix && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{issue.estimatedTimeToFix}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-medium">Impact Score:</span>
                <span className="font-bold text-blue-600">{issue.priorityScore}</span>
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

              {/* Impact Breakdown */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Impact on:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {issue.impact.coreWebVitals && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="text-gray-600">Core Web Vitals</span>
                      <span className="font-bold text-red-600">+{issue.impact.coreWebVitals}</span>
                    </div>
                  )}
                  {issue.impact.searchRanking && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="text-gray-600">Search Ranking</span>
                      <span className="font-bold text-blue-600">+{issue.impact.searchRanking}</span>
                    </div>
                  )}
                  {issue.impact.accessibility && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="text-gray-600">Accessibility</span>
                      <span className="font-bold text-purple-600">+{issue.impact.accessibility}</span>
                    </div>
                  )}
                  {issue.impact.userExperience && (
                    <div className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="text-gray-600">User Experience</span>
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
