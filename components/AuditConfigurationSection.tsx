"use client"

import { useState, useEffect } from 'react'
import Tooltip from './Tooltip'

export interface AuditConfiguration {
  enableLighthouse: boolean
  enableAccessibility: boolean
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
  accessibility: 4, // Accessibility scan with pa11y
  imageOptimization: 2, // Image analysis
  seo: 1, // SEO & metadata
  technical: 1, // Technical issues (always included)
}

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
    let totalSeconds = 0

    // Always include technical issues
    totalSeconds += TIME_PER_PAGE.technical * pageCount

    // Add time for selected components
    if (configuration.enableLighthouse) totalSeconds += TIME_PER_PAGE.lighthouse * pageCount
    if (configuration.enableAccessibility) totalSeconds += TIME_PER_PAGE.accessibility * pageCount
    if (configuration.enableImageOptimization) totalSeconds += TIME_PER_PAGE.imageOptimization * pageCount
    if (configuration.enableSEO) totalSeconds += TIME_PER_PAGE.seo * pageCount

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
    if (minutes < 1) return '< 1 min'
    if (minutes < 60) return `~${minutes} min${minutes > 1 ? 's' : ''}`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `~${hours}h ${mins}m`
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

        {/* Accessibility Scan */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={configuration.enableAccessibility}
            onChange={() => handleToggle('enableAccessibility')}
            className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Accessibility Scan</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.accessibility}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Accessibility Scan (pa11y)</p>
                    <p>Tests your site for accessibility issues and WCAG compliance:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>WCAG Compliance:</strong> Level A and AA standards</li>
                      <li><strong>Screen Readers:</strong> Checks for screen reader compatibility</li>
                      <li><strong>Keyboard Navigation:</strong> Ensures keyboard-only access works</li>
                      <li><strong>Color Contrast:</strong> Verifies text is readable for everyone</li>
                      <li><strong>Alt Text:</strong> Checks images have descriptive text</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Important:</p>
                      <p>Accessibility is essential for inclusive design and legal compliance (UK Equality Act 2010).</p>
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
              WCAG 2.2 compliance testing for screen readers, keyboard navigation, and color contrast
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

        {/* Technical Issues (Always Included) */}
        <div className="flex items-start gap-3 opacity-75">
          <input
            type="checkbox"
            checked={true}
            disabled={true}
            className="mt-1 h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Technical Issues</span>
              <span className="text-xs text-gray-500">+{TIME_PER_PAGE.technical}s/page</span>
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-medium">Technical Issues (Always Included)</p>
                    <p>Core technical health checks that are always performed:</p>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li><strong>Page Discovery:</strong> Finds all pages via sitemap/crawling</li>
                      <li><strong>Technology Stack:</strong> Detects CMS, frameworks, plugins</li>
                      <li><strong>Broken Links:</strong> Identifies 404s and redirect chains</li>
                      <li><strong>Mobile Friendliness:</strong> Responsive design checks</li>
                      <li><strong>SSL/HTTPS:</strong> Security certificate validation</li>
                      <li><strong>Page Structure:</strong> HTML validity and best practices</li>
                    </ul>
                    <div className="mt-3 p-2 bg-blue-900 rounded text-white text-sm">
                      <p className="font-medium">Always On:</p>
                      <p>These checks are essential and cannot be disabled as they form the foundation of every audit.</p>
                    </div>
                  </div>
                }
                position="right"
              >
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 5 0c0 1.38-1.12 2.5-2.5 2.5m0 0v1.5m0 2.5h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Page discovery, technology detection, broken links, and mobile friendliness (always included)
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Time & Email Notification */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Estimated Time:</span>
          <span className="text-lg font-bold text-blue-700">{formatTime(estimatedMinutes)}</span>
        </div>

        <p className="text-xs text-blue-700">
          For {pageCount} page{pageCount !== 1 ? 's' : ''}
          {auditScope === 'single'
            ? ' (single page audit)'
            : auditScope === 'all'
              ? ' (all discoverable pages)'
              : ' (selected pages)'}
        </p>

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
