"use client"

import { useState, useEffect, useMemo } from 'react'
import Tooltip from './Tooltip'

export interface AuditConfiguration {
  enableLighthouse: boolean
  enableViewport: boolean
  enableImageOptimization: boolean
  enableSEO: boolean
  enableEmail: boolean
}

interface AuditConfigurationSectionProps {
  pageCount: number
  auditScope: 'single' | 'all' | 'custom'
  configuration: AuditConfiguration
  onChange: (config: AuditConfiguration) => void
  onEstimatedTimeChange: (minutes: number) => void
}

// Time estimates per page in seconds
const TIME_PER_PAGE = {
  lighthouse: 8, // Performance analysis with Lighthouse
  viewport: 6, // Viewport responsiveness (per sampled page, ~5-10 pages tested)
  imageOptimization: 2, // Image analysis
  seo: 1, // SEO & metadata
  technical: 1, // Technical issues (always included)
}

// Parallel processing configuration
const CONCURRENT_PAGES = 3; // Process 3 pages at a time (Railway free tier safe)

export default function AuditConfigurationSection({
  pageCount,
  auditScope,
  configuration,
  onChange,
  onEstimatedTimeChange
}: AuditConfigurationSectionProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState(0)

  // Calculate estimated time whenever configuration or page count changes
  useEffect(() => {
    let totalSecondsPerPage = 0

    // Always include technical issues
    totalSecondsPerPage += TIME_PER_PAGE.technical

    // Add time for selected components
    if (configuration.enableLighthouse) totalSecondsPerPage += TIME_PER_PAGE.lighthouse
    if (configuration.enableViewport) totalSecondsPerPage += TIME_PER_PAGE.viewport
    if (configuration.enableImageOptimization) totalSecondsPerPage += TIME_PER_PAGE.imageOptimization
    if (configuration.enableSEO) totalSecondsPerPage += TIME_PER_PAGE.seo

    // Calculate total time with parallel processing
    // Formula: (total_pages * time_per_page) / concurrent_pages
    const totalSeconds = (pageCount * totalSecondsPerPage) / CONCURRENT_PAGES
    const minutes = Math.ceil(totalSeconds / 60)

    setEstimatedMinutes(minutes)
    onEstimatedTimeChange(minutes)

    // Auto-enable email notification for longer audits
    if (minutes > 5 && auditScope !== 'single' && !configuration.enableEmail) {
      onChange({ ...configuration, enableEmail: true })
    }
  }, [configuration, pageCount, auditScope, onChange, onEstimatedTimeChange])

  const handleToggle = (key: keyof AuditConfiguration) => {
    onChange({ ...configuration, [key]: !configuration[key] })
  }

  const formatTime = (minutes: number) => {
    if (minutes <= 1) return 'less than a minute'
    if (minutes < 60) return `~${minutes} mins`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `~${hours}h ${mins}m`
  }

  // Calculate estimated cost per audit in GBP (memoized to prevent re-renders)
  const estimatedCost = useMemo(() => {
    // Base costs (per audit, runs once regardless of page count)
    const quickTechDetectionCost = 0.0075 // Claude 3.5 Haiku for hybrid tech/plugin detection ~$0.01 USD = £0.0075 GBP
    const dnsHostingCost = 0.0002 // IPinfo.io - mostly free via nameserver patterns, occasional IP lookup

    // Total base cost per audit (not multiplied by page count)
    return quickTechDetectionCost + dnsHostingCost
  }, []) // Empty deps - cost is constant

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return '< 1p'
    if (cost < 1) return `${Math.ceil(cost * 100)}p`
    return `£${cost.toFixed(2)}`
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audit Configuration
        </label>
        <p className="text-xs text-gray-600 mb-4">
          Select which checks to include in your audit. Deselecting options will speed up the audit but provide less comprehensive results.
        </p>
      </div>

      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Performance Analysis (Lighthouse) */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={configuration.enableLighthouse}
            onChange={() => handleToggle('enableLighthouse')}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Performance Analysis</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.lighthouse}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Performance Analysis (Lighthouse)</p>
                    <p>Uses Google&apos;s Lighthouse tool to analyze page performance:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>Core Web Vitals:</strong> LCP, FID, CLS scores</li>
                      <li><strong>Speed Metrics:</strong> Load time, time to interactive</li>
                      <li><strong>Best Practices:</strong> HTTPS, console errors, security</li>
                      <li><strong>Recommendations:</strong> Actionable performance improvements</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Why it takes time:</p>
                      <p>Lighthouse loads your page in a simulated environment and measures real performance metrics.</p>
                    </div>
                  </div>
                }
                position="right"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Core Web Vitals, page speed, and performance metrics using Google Lighthouse
            </p>
          </div>
        </label>

        {/* Viewport Responsiveness */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={configuration.enableViewport}
            onChange={() => handleToggle('enableViewport')}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Viewport Responsiveness</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.viewport}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Viewport Responsiveness Analysis</p>
                    <p>Tests how your site looks and functions across different devices:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>Mobile:</strong> iPhone/Android phones (360px width)</li>
                      <li><strong>Tablet:</strong> iPad and tablets (768px width)</li>
                      <li><strong>Desktop:</strong> Standard laptops (1366px width)</li>
                      <li><strong>Wide Desktop:</strong> Large monitors (1920px width)</li>
                      <li><strong>Real Screenshots:</strong> Visual capture of each viewport</li>
                      <li><strong>Issue Detection:</strong> Horizontal scroll, layout breaks, small text</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Smart Sampling:</p>
                      <p>Tests 5-10 representative pages to efficiently identify responsive design issues across your site.</p>
                    </div>
                  </div>
                }
                position="right"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Mobile, tablet, and desktop testing with screenshots and responsive design analysis
            </p>
          </div>
        </label>

        {/* Image Optimization */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={configuration.enableImageOptimization}
            onChange={() => handleToggle('enableImageOptimization')}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Image Optimization</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.imageOptimization}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Image Optimization Analysis</p>
                    <p>Analyzes your images to find optimization opportunities:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>File Sizes:</strong> Identifies oversized images (&gt;100KB)</li>
                      <li><strong>Modern Formats:</strong> Finds JPEG/PNG that should be WebP</li>
                      <li><strong>Lazy Loading:</strong> Checks if images load only when needed</li>
                      <li><strong>Responsive Images:</strong> Verifies different sizes for devices</li>
                      <li><strong>Alt Text:</strong> Ensures images have descriptive text for SEO</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Impact:</p>
                      <p>Images often account for 50-70% of page weight. Optimizing them can dramatically improve load times.</p>
                    </div>
                  </div>
                }
                position="right"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Analyzes image sizes, formats (WebP vs JPEG/PNG), and loading strategies
            </p>
          </div>
        </label>

        {/* SEO & Metadata */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={configuration.enableSEO}
            onChange={() => handleToggle('enableSEO')}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">SEO & Metadata</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.seo}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">SEO & Metadata Analysis</p>
                    <p>Reviews your pages for search engine optimization:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>Meta Tags:</strong> Title, description, Open Graph, Twitter Cards</li>
                      <li><strong>Headings:</strong> H1-H6 structure and hierarchy</li>
                      <li><strong>Canonical Tags:</strong> Prevents duplicate content issues</li>
                      <li><strong>Robots Meta:</strong> Controls search engine indexing</li>
                      <li><strong>Schema Markup:</strong> Structured data for rich results</li>
                      <li><strong>Internal Links:</strong> Navigation and link structure</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Why it matters:</p>
                      <p>Proper SEO increases visibility in search results and drives organic traffic to your site.</p>
                    </div>
                  </div>
                }
                position="right"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Meta tags, title optimization, Open Graph, schema markup, and heading structure
            </p>
          </div>
        </label>

      </div>

      {/* Estimated Time & Email Notification */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Estimated Time (First Audit):</span>
            <span className="text-lg font-bold text-blue-700">{formatTime(estimatedMinutes)}</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-xs text-blue-600">Estimated cost: {formatCost(estimatedCost)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-blue-700">
            For {pageCount} page{pageCount !== 1 ? 's' : ''}
            {auditScope === 'single'
              ? ' (single page audit)'
              : auditScope === 'all'
                ? ' (all discoverable pages)'
                : ' (selected pages)'}
          </p>
          {pageCount > 1 && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Parallel processing (3 pages at a time) • Repeat audits 70-90% faster (24hr cache)
            </p>
          )}
        </div>

        {/* Email Notification - Show for estimates > 2 minutes */}
        {estimatedMinutes > 2 && (
          <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-blue-300">
            <input
              type="checkbox"
              checked={configuration.enableEmail}
              onChange={() => handleToggle('enableEmail')}
              className="mt-0.5 h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-blue-900">
                Email me when complete {estimatedMinutes > 5 && <span className="text-blue-600">(recommended)</span>}
              </span>
              <p className="text-xs text-blue-700 mt-1">
                {estimatedMinutes > 5
                  ? 'This audit will take a while. We\'ll send you an email with a link to the results when it\'s done.'
                  : 'Get notified by email when your audit completes instead of waiting on this page.'}
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}
