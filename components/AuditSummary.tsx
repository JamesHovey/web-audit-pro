"use client"

import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, ChevronRight, Zap, TrendingUp, Shield, Search, Code, FileText, Eye, HelpCircle, ShoppingCart, Check, Lightbulb } from 'lucide-react'
import { generateAuditSummary, SummaryIssue, AuditSummaryResult } from '@/lib/auditSummaryService'
import { useSynergistBasket } from '@/contexts/SynergistBasketContext'
import Tooltip from './Tooltip'
import AffectedPagesModal from './AffectedPagesModal'
import LargeImagesModal from './LargeImagesModal'

interface AuditSummaryProps {
  auditResults: any
  auditUrl?: string
  onNavigateToSection?: (sectionId: string) => void
  defaultCollapsed?: boolean
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

export default function AuditSummary({ auditResults, auditUrl, onNavigateToSection, defaultCollapsed = false }: AuditSummaryProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [modalIssue, setModalIssue] = useState<SummaryIssue | null>(null)
  const [largeImagesModalIssue, setLargeImagesModalIssue] = useState<SummaryIssue | null>(null)
  const { toggleBasket, isInBasket } = useSynergistBasket()

  // Extract CMS and plugin data
  const technologyData = auditResults.technology || auditResults.technical
  const detectedCMS = technologyData?.cms || technologyData?.platform
  const detectedPlugins = technologyData?.plugins || technologyData?.detectedPlugins || []

  // Generate summary
  const summary: AuditSummaryResult = generateAuditSummary(auditResults, auditUrl)

  if (summary.totalIssues === 0) {
    return null
  }

  const handleSeeMore = (sectionId: string, subsectionId?: string) => {
    if (onNavigateToSection) {
      // Use the passed callback which will open accordion and scroll
      onNavigateToSection(sectionId)

      // After opening section, scroll to subsection if provided
      if (subsectionId) {
        setTimeout(() => {
          const subsection = document.querySelector(`[data-subsection="${subsectionId}"]`)
          if (subsection) {
            subsection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300) // Wait for accordion to open
      }
    } else {
      // Fallback to just scrolling if callback not provided
      const targetSelector = subsectionId
        ? `[data-subsection="${subsectionId}"]`
        : `[data-section="${sectionId}"]`
      const element = document.querySelector(targetSelector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
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
        <div
          className="mb-6 flex items-start justify-between cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Summary</h2>
            {!isCollapsed && (
              <p className="text-gray-600">
                Prioritized action items to improve your website performance, SEO, and user experience
              </p>
            )}
          </div>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors ml-4">
            <svg
              className={`w-5 h-5 transform transition-transform ${
                isCollapsed ? 'rotate-0' : 'rotate-180'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {!isCollapsed && (
          <>
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
                onSeeMore={() => handleSeeMore(issue.sectionId, issue.subsectionId)}
                isInBasket={isInBasket(issue.id)}
                onToggleBasket={() => toggleBasket(issue.id)}
                detectedCMS={detectedCMS}
                detectedPlugins={detectedPlugins}
                onShowAffectedPages={
                  issue.affectedPagesList && issue.affectedPagesList.length > 0
                    ? () => setModalIssue(issue)
                    : undefined
                }
                onShowLargeImages={
                  issue.imageData && issue.imageData.largeImages > 0
                    ? () => setLargeImagesModalIssue(issue)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No issues found in this category</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Affected Pages Modal */}
      <AffectedPagesModal
        isOpen={modalIssue !== null}
        onClose={() => setModalIssue(null)}
        title={modalIssue?.title || ''}
        description={modalIssue?.description || ''}
        pages={modalIssue?.affectedPagesList || []}
      />

      {/* Large Images Modal */}
      <LargeImagesModal
        isOpen={largeImagesModalIssue !== null}
        onClose={() => setLargeImagesModalIssue(null)}
        images={largeImagesModalIssue?.imageData?.largeImageDetails || []}
        totalSavings={largeImagesModalIssue?.imageData?.totalSavings}
      />
    </div>
  )
}

// Plugin URLs mapping
const PLUGIN_URLS: { [key: string]: string } = {
  'WP Rocket': 'https://wp-rocket.me/',
  'LiteSpeed Cache': 'https://wordpress.org/plugins/litespeed-cache/',
  'W3 Total Cache': 'https://wordpress.org/plugins/w3-total-cache/',
  'Yoast SEO': 'https://yoast.com/wordpress/plugins/seo/',
  'Yoast': 'https://yoast.com/wordpress/plugins/seo/',
  'Rank Math': 'https://rankmath.com/',
  'All in One SEO': 'https://aioseo.com/',
  'Wordfence': 'https://www.wordfence.com/',
  'Autoptimize': 'https://wordpress.org/plugins/autoptimize/',
  'Imagify': 'https://imagify.io/',
  'ShortPixel': 'https://shortpixel.com/',
  'EWWW Image Optimizer': 'https://wordpress.org/plugins/ewww-image-optimizer/'
}

// Helper function to convert plugin names to links
function renderTextWithPluginLinks(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remainingText = text
  let keyCounter = 0

  // Find all plugin names in the text
  const matches: Array<{ name: string; url: string; index: number; length: number }> = []

  Object.entries(PLUGIN_URLS).forEach(([pluginName, url]) => {
    const regex = new RegExp(`\\b${pluginName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        name: match[0],
        url: url,
        index: match.index,
        length: match[0].length
      })
    }
  })

  // Sort matches by index to process them in order
  matches.sort((a, b) => a.index - b.index)

  // Build the result by alternating between text and links
  let currentIndex = 0
  matches.forEach((match, i) => {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index))
    }

    // Add the link
    parts.push(
      <a
        key={`plugin-link-${keyCounter++}`}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {match.name}
      </a>
    )

    currentIndex = match.index + match.length
  })

  // Add any remaining text after the last match
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex))
  }

  // If no matches were found, return the original text
  if (parts.length === 0) {
    return text
  }

  return <>{parts}</>
}

interface IssueCardProps {
  issue: SummaryIssue
  index: number
  isExpanded: boolean
  onToggle: () => void
  onSeeMore: () => void
  isInBasket: boolean
  onToggleBasket: () => void
  detectedCMS?: any
  detectedPlugins?: any[]
  onShowAffectedPages?: () => void
  onShowLargeImages?: () => void
}

function IssueCard({ issue, index, isExpanded, onToggle, onSeeMore, isInBasket, onToggleBasket, detectedCMS, detectedPlugins, onShowAffectedPages, onShowLargeImages }: IssueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[issue.category]
  const severityConfig = SEVERITY_CONFIG[issue.severity]
  const CategoryIcon = categoryConfig.icon

  // Generate contextual recommendations based on detected CMS and plugins
  const getContextualRecommendations = () => {
    if (!detectedCMS) return null

    const cmsName = detectedCMS.name || detectedCMS

    // Safely extract plugin names - handle various data structures
    let pluginNames: string[] = []
    if (Array.isArray(detectedPlugins)) {
      pluginNames = detectedPlugins.map((p: any) => (p.name || p).toLowerCase())
    } else if (detectedPlugins && typeof detectedPlugins === 'object') {
      // Handle case where plugins is an object
      pluginNames = Object.keys(detectedPlugins).map(key => key.toLowerCase())
    }

    const issueTitle = issue.title.toLowerCase()
    const issueCategory = issue.category

    let recommendations: string[] = []
    let existingTools: string[] = []

    // Performance and JavaScript issues
    if (issueCategory === 'performance' || issueTitle.includes('javascript') || issueTitle.includes('speed') || issueTitle.includes('loading')) {
      // Check for existing caching/optimization plugins
      const cachingPlugins = pluginNames.filter(name =>
        name.includes('cache') ||
        name.includes('rocket') ||
        name.includes('litespeed') ||
        name.includes('w3 total') ||
        name.includes('wp super') ||
        name.includes('autoptimize') ||
        name.includes('speed')
      )

      if (cachingPlugins.length > 0) {
        existingTools.push(`Your site has caching/optimization tools installed. Ensure they're properly configured for JavaScript minification and combination.`)
      } else if (cmsName.toLowerCase().includes('wordpress')) {
        recommendations.push(`Install a caching plugin like WP Rocket or LiteSpeed Cache to automatically optimize JavaScript files.`)
      }
    }

    // Image optimization issues
    if (issueTitle.includes('image') || issueTitle.includes('photo') || issueCategory === 'performance') {
      const imagePlugins = pluginNames.filter(name =>
        name.includes('imagify') ||
        name.includes('shortpixel') ||
        name.includes('ewww') ||
        name.includes('smush') ||
        name.includes('optimole')
      )

      if (imagePlugins.length > 0) {
        existingTools.push(`You have image optimization plugins installed. Enable automatic compression and WebP conversion.`)
      } else if (cmsName.toLowerCase().includes('wordpress')) {
        recommendations.push(`Install Imagify or ShortPixel to automatically compress and optimize images.`)
      }
    }

    // SEO issues
    if (issueCategory === 'seo' || issueTitle.includes('seo') || issueTitle.includes('meta') || issueTitle.includes('heading')) {
      const seoPlugins = pluginNames.filter(name =>
        name.includes('yoast') ||
        name.includes('rank math') ||
        name.includes('seo') ||
        name.includes('all in one seo')
      )

      if (seoPlugins.length > 0) {
        existingTools.push(`Your SEO plugin can help fix this. Check its recommendations and settings.`)
      } else if (cmsName.toLowerCase().includes('wordpress')) {
        recommendations.push(`Install Rank Math or Yoast SEO for comprehensive SEO management and automatic optimization.`)
      }
    }

    // Page builder issues
    if (issueTitle.includes('builder') || issueTitle.includes('elementor') || issueTitle.includes('wpbakery') || issueTitle.includes('divi')) {
      const builderPlugins = pluginNames.filter(name =>
        name.includes('elementor') ||
        name.includes('wpbakery') ||
        name.includes('divi') ||
        name.includes('beaver') ||
        name.includes('oxygen')
      )

      if (builderPlugins.length > 0) {
        existingTools.push(`Your page builder (${builderPlugins.join(', ')}) may be causing performance issues. Consider optimizing or replacing heavy elements.`)
      }
    }

    return { existingTools, recommendations }
  }

  const contextualInfo = getContextualRecommendations()

  return (
    <div className="border-2 border-[#42499c] rounded-lg overflow-hidden bg-white">
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
              <div className="w-8 h-8 rounded-full bg-[#42499c] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
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

            {issue.detailsLink ? (
              <h4 className="font-semibold text-gray-900 mb-1">
                <a
                  href={issue.detailsLink}
                  className="hover:text-[#42499c] transition-colors hover:underline"
                >
                  {issue.affectedItems ? `${issue.affectedItems} ${issue.title}` : issue.title}
                </a>
              </h4>
            ) : (
              <h4 className="font-semibold text-gray-900 mb-1">
                {issue.affectedItems ? `${issue.affectedItems} ${issue.title}` : issue.title}
              </h4>
            )}
            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {/* Affected Pages Count */}
              {issue.affectedPages && issue.affectedPages > 1 && (
                issue.affectedPagesList && issue.affectedPagesList.length > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onShowAffectedPages?.()
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold hover:bg-orange-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{issue.affectedPages} pages affected</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
                    <FileText className="w-3 h-3" />
                    <span>{issue.affectedPages} pages affected</span>
                  </div>
                )
              )}

              {/* Large Images Count */}
              {issue.imageData && issue.imageData.largeImages > 0 && onShowLargeImages && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onShowLargeImages()
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>See Large Images</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={onToggleBasket}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isInBasket
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-white text-[#42499c] border border-[#42499c] hover:bg-gray-50'
              }`}
              title={isInBasket ? 'Remove from Synergist basket' : 'Add to Synergist basket'}
            >
              {isInBasket ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  In Basket
                </>
              ) : (
                <>
                  <img src="https://synergist.co.uk/favicon.ico" alt="" className="w-7 h-7" />
                  Add to Synergist
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* How to Fix Section */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">How to Fix:</h5>
                <p className="text-sm text-gray-600 mb-3">{renderTextWithPluginLinks(issue.fixRecommendation)}</p>

                {/* Contextual Recommendations based on existing CMS/plugins */}
                {contextualInfo && (contextualInfo.existingTools.length > 0 || contextualInfo.recommendations.length > 0) && (
                  <div className="mt-3 space-y-2">
                    {/* Existing Tools */}
                    {contextualInfo.existingTools.length > 0 && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-green-800">
                            <p className="font-semibold mb-1">Using Your Existing Tools:</p>
                            {contextualInfo.existingTools.map((tool, idx) => (
                              <p key={idx} className="mb-1 last:mb-0">{renderTextWithPluginLinks(tool)}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommended Tools */}
                    {contextualInfo.recommendations.length > 0 && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Recommended Solutions:</p>
                            {contextualInfo.recommendations.map((rec, idx) => (
                              <p key={idx} className="mb-1 last:mb-0">{renderTextWithPluginLinks(rec)}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
