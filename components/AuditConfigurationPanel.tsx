'use client'

import { useState, useMemo } from 'react'
import { AuditConfiguration } from '@/types/auditConfiguration'

interface AuditConfigurationPanelProps {
  onConfigurationChange: (config: AuditConfiguration) => void
  pageCount?: number
  auditScope?: 'single' | 'all' | 'custom'
}

// Time estimates per page in seconds
const TIME_PER_PAGE = {
  technicalSEO: 1,
  internalLinking: 1,
  performanceMetrics: 8, // Lighthouse analysis
  securityAndRedirects: 0.5,
  contentQuality: 0.5,
  imageOptimization: 2,
  accessibilityAnalysis: 3, // Expensive
  viewportAnalysis: 6, // Expensive - Smart sampling (~20 pages)
  technical: 1, // Always included (base)
}

// Parallel processing configuration
const CONCURRENT_PAGES = 3; // Process 3 pages at a time

export default function AuditConfigurationPanel({
  onConfigurationChange,
  pageCount = 1,
  auditScope = 'single'
}: AuditConfigurationPanelProps) {
  const [config, setConfig] = useState<AuditConfiguration>({
    technicalSEO: true,
    internalLinking: true,
    performanceMetrics: true,
    securityAndRedirects: true,
    contentQuality: true,
    imageOptimization: true,
    accessibilityAnalysis: false,
    viewportAnalysis: false
  })

  const handleToggle = (category: keyof AuditConfiguration) => {
    const newConfig = {
      ...config,
      [category]: !config[category]
    }
    setConfig(newConfig)
    onConfigurationChange(newConfig)
  }

  // Calculate estimated cost per audit in GBP
  const estimatedCost = useMemo(() => {
    const isSinglePage = auditScope === 'single'

    // Cloudflare browser rendering: £0.09 per hour = £0.000025 per second
    const costPerSecond = 0.09 / 3600

    // Viewport sampling: Test ~20 representative pages instead of all pages
    const VIEWPORT_SAMPLE_SIZE = 20
    const viewportPages = config.viewportAnalysis
      ? Math.min(pageCount, VIEWPORT_SAMPLE_SIZE)
      : 0

    // Calculate additional browser time based on enabled features
    let additionalSecondsPerPage = 0
    if (config.performanceMetrics) additionalSecondsPerPage += TIME_PER_PAGE.performanceMetrics
    if (config.imageOptimization) additionalSecondsPerPage += TIME_PER_PAGE.imageOptimization
    if (config.technicalSEO) additionalSecondsPerPage += TIME_PER_PAGE.technicalSEO
    if (config.internalLinking) additionalSecondsPerPage += TIME_PER_PAGE.internalLinking
    if (config.securityAndRedirects) additionalSecondsPerPage += TIME_PER_PAGE.securityAndRedirects
    if (config.contentQuality) additionalSecondsPerPage += TIME_PER_PAGE.contentQuality
    if (config.accessibilityAnalysis) additionalSecondsPerPage += TIME_PER_PAGE.accessibilityAnalysis

    const additionalBrowserCostPerPage = additionalSecondsPerPage * costPerSecond

    if (isSinglePage) {
      // Single page: Premium Sonnet 4.5 analysis
      const claudePerPage = 0.036
      const baseBrowserPerPage = 0.0036 // Base browser rendering (3 min)
      const viewportCost = config.viewportAnalysis ? TIME_PER_PAGE.viewportAnalysis * costPerSecond : 0
      const totalBrowserPerPage = baseBrowserPerPage + additionalBrowserCostPerPage + viewportCost
      const fixedCost = 0.0077 // DNS + quick tech
      return (claudePerPage + totalBrowserPerPage) * pageCount + fixedCost
    } else {
      // Multi-page: Smart Sampling for cost efficiency
      const aiAnalysisPages = Math.min(pageCount, 20)
      const patternOnlyPages = Math.max(0, pageCount - 20)

      // AI analysis costs (Haiku 3.5 - 70% cheaper than Sonnet)
      const claudeHaikuPerPage = 0.012
      const aiCost = aiAnalysisPages * claudeHaikuPerPage

      // Pattern-only analysis (optimized)
      const patternCostPerPage = 0.001
      const patternCost = patternOnlyPages * patternCostPerPage

      // Browser rendering for ALL pages
      const baseBrowserPerPage = 0.0012
      const totalBrowserPerPage = baseBrowserPerPage + additionalBrowserCostPerPage
      const browserCost = pageCount * totalBrowserPerPage

      // Viewport cost (smart sampling: ~20 pages only)
      const viewportCost = viewportPages * TIME_PER_PAGE.viewportAnalysis * costPerSecond

      // Fixed costs
      const fixedCost = 0.0077

      return aiCost + patternCost + browserCost + viewportCost + fixedCost
    }
  }, [pageCount, auditScope, config])

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return '< 1p'
    if (cost < 1) return `${Math.ceil(cost * 100)}p`
    return `£${cost.toFixed(2)}`
  }

  const categories = [
    {
      key: 'technicalSEO' as keyof AuditConfiguration,
      label: 'Technical SEO',
      description: 'H1 tags, meta titles, descriptions, structured data, title length'
    },
    {
      key: 'internalLinking' as keyof AuditConfiguration,
      label: 'Internal Linking',
      description: 'Orphaned pages, weak links, broken links'
    },
    {
      key: 'performanceMetrics' as keyof AuditConfiguration,
      label: 'Performance Metrics',
      description: 'Core Web Vitals, page speed'
    },
    {
      key: 'securityAndRedirects' as keyof AuditConfiguration,
      label: 'Security & Redirects',
      description: 'HTTPS, HSTS, 301/302 redirects, 4XX errors'
    },
    {
      key: 'contentQuality' as keyof AuditConfiguration,
      label: 'Content Quality',
      description: 'Text-to-HTML ratio, content depth'
    },
    {
      key: 'imageOptimization' as keyof AuditConfiguration,
      label: 'Image Optimization',
      description: 'Large images, legacy formats, missing alt tags'
    },
    {
      key: 'accessibilityAnalysis' as keyof AuditConfiguration,
      label: 'Accessibility Analysis',
      description: 'WCAG compliance, color contrast, keyboard navigation'
    },
    {
      key: 'viewportAnalysis' as keyof AuditConfiguration,
      label: 'Viewport Analysis',
      description: 'Mobile/tablet/desktop rendering'
    }
  ]

  // Split categories into two columns (4 items each)
  const leftColumn = categories.slice(0, 4)
  const rightColumn = categories.slice(4, 8)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Configuration</h3>

      {/* Two-column grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left column */}
        <div className="space-y-3">
          {leftColumn.map((category) => (
            <label
              key={category.key}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={config[category.key]}
                onChange={() => handleToggle(category.key)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {category.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {category.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {rightColumn.map((category) => (
            <label
              key={category.key}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={config[category.key]}
                onChange={() => handleToggle(category.key)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {category.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {category.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cost display */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Estimated Cost:</span>
          <span className="text-lg font-bold text-blue-700">{formatCost(estimatedCost)}</span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          For {pageCount} page{pageCount !== 1 ? 's' : ''}
          {auditScope === 'single'
            ? ' (single page audit)'
            : auditScope === 'all'
              ? ' (all discoverable pages)'
              : ' (selected pages)'}
          {config.viewportAnalysis && pageCount > 20 && (
            <span className="block mt-1">
              Viewport: Smart sampling (~20 pages tested)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
