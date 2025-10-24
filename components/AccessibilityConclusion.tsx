"use client"

import React, { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink, Star, X, Zap } from 'lucide-react'
import { AccessibilityPluginMetadata } from '@/lib/accessibilityPluginRecommendations'

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
  installedPlugins?: string[]
  installedPluginDetails?: AccessibilityPluginMetadata[]
  recommendedPlugins?: AccessibilityPluginMetadata[]
}

interface AccessibilityConclusionProps {
  data: AccessibilityResult | { pages: AccessibilityResult[] }
}

export default function AccessibilityConclusion({ data }: AccessibilityConclusionProps) {
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)

  // Check if multi-page results
  const isMultiPage = 'pages' in data
  const results = isMultiPage ? data.pages : [data]

  // Calculate aggregate stats for multi-page
  const aggregateStats = {
    avgScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    totalIssues: results.reduce((sum, r) => sum + r.totalIssues, 0),
    criticalIssues: results.reduce((sum, r) => sum + r.issuesBySeverity.critical, 0),
    seriousIssues: results.reduce((sum, r) => sum + r.issuesBySeverity.serious, 0),
    moderateIssues: results.reduce((sum, r) => sum + r.issuesBySeverity.moderate, 0),
    minorIssues: results.reduce((sum, r) => sum + r.issuesBySeverity.minor, 0),
    compliantPages: results.filter(r => r.eaaCompliant).length,
    totalPages: results.length
  }

  // Get top 3 critical issues across all pages
  const allIssues = results.flatMap(r => r.issues)
  const criticalIssues = allIssues
    .filter(i => i.impact === 'critical' || i.impact === 'serious')
    .slice(0, 5)

  // Priority recommendations
  const recommendations = generateRecommendations(aggregateStats)

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <div className={`rounded-lg border-2 p-6 ${
        aggregateStats.avgScore >= 90 ? 'bg-green-50 border-green-500' :
        aggregateStats.avgScore >= 70 ? 'bg-yellow-50 border-yellow-500' :
        aggregateStats.avgScore >= 50 ? 'bg-orange-50 border-orange-500' :
        'bg-red-50 border-red-500'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accessibility Compliance Summary
            </h2>
            <p className="text-gray-700">
              {isMultiPage ? `Analyzed ${aggregateStats.totalPages} pages` : 'Single page analysis'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${
              aggregateStats.avgScore >= 90 ? 'text-green-600' :
              aggregateStats.avgScore >= 70 ? 'text-yellow-600' :
              aggregateStats.avgScore >= 50 ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {aggregateStats.avgScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall Score</div>
          </div>
        </div>

        {/* EAA Compliance Status */}
        <div className={`p-4 rounded-lg border-2 ${
          aggregateStats.compliantPages === aggregateStats.totalPages
            ? 'bg-green-100 border-green-400'
            : 'bg-red-100 border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {aggregateStats.compliantPages === aggregateStats.totalPages ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {aggregateStats.compliantPages === aggregateStats.totalPages
                  ? '✓ Meets WCAG 2.2 Level AA (UK/EAA Compliant)'
                  : '✗ Does Not Meet WCAG 2.2 Level AA Requirements'}
              </p>
              {isMultiPage && (
                <p className="text-sm text-gray-700 mt-1">
                  {aggregateStats.compliantPages} of {aggregateStats.totalPages} pages are compliant
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600">{aggregateStats.criticalIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Critical Issues</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{aggregateStats.seriousIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Serious Issues</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{aggregateStats.moderateIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Moderate Issues</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{aggregateStats.minorIssues}</div>
            <div className="text-sm text-gray-600 mt-1">Minor Issues</div>
          </div>
        </div>
      </div>

      {/* Critical Issues Requiring Immediate Attention */}
      {criticalIssues.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">
              Critical Issues Requiring Immediate Attention
            </h3>
          </div>
          <div className="space-y-3">
            {criticalIssues.map((issue, index) => (
              <div key={index} className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{issue.help}</h4>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-white rounded border border-gray-200">
                        {issue.wcagCriterion}
                      </span>
                      <span className="px-2 py-1 bg-white rounded border border-gray-200 capitalize">
                        {issue.wcagPrinciple}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded uppercase flex-shrink-0 ml-4">
                    {issue.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded font-semibold ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="text-gray-500">Impact: {rec.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Compliance Notice */}
      <div className="bg-white border-2 border-[#42499c] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-[#42499c] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-black mb-2">
              Legal Compliance Requirements
            </h3>
            <div className="space-y-2 text-sm text-black">
              <p>
                <strong>European Accessibility Act (EAA):</strong> Businesses with 10+ employees and €2M+ annual turnover
                must comply with WCAG 2.2 Level AA by June 28, 2025. Penalties up to €3 million for non-compliance.
              </p>
              <p>
                <strong>UK Equality Act 2010:</strong> Requires &quot;reasonable adjustments&quot; for disabled users.
                WCAG 2.2 AA compliance demonstrates meeting these obligations.
              </p>
              <p className="pt-2 border-t border-[#42499c] mt-3">
                <strong>Recommendation:</strong> {
                  aggregateStats.avgScore >= 90
                    ? 'Your website shows excellent accessibility. Continue monitoring and maintain these standards.'
                    : aggregateStats.criticalIssues > 0
                      ? 'Address critical and serious issues immediately to avoid legal risks and improve user experience for all visitors.'
                      : 'Work through the prioritized recommendations to achieve full compliance within 30-60 days.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plugin Recommendations */}
      {(results[0].installedPluginDetails && results[0].installedPluginDetails.length > 0) ||
       (results[0].recommendedPlugins && results[0].recommendedPlugins.length > 0) ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Accessibility Plugins & Tools</h3>
          </div>

          {/* Installed Plugins */}
          {results[0].installedPluginDetails && results[0].installedPluginDetails.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Currently Installed Plugins
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                You already have accessibility plugins installed. Configure them properly to fix issues.
              </p>
              <div className="space-y-3">
                {results[0].installedPluginDetails.map((plugin) => (
                  <div key={plugin.slug} className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{plugin.name}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" /> Installed
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              plugin.cost === 'Free' ? 'bg-green-100 text-green-700' :
                              plugin.cost === 'Freemium' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {plugin.cost}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{plugin.rating}/5</span>
                            </div>
                            <span>{plugin.activeInstalls} active installs</span>
                            <span className="font-medium text-purple-600">{plugin.wcagCompliance}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedPlugin(expandedPlugin === plugin.slug ? null : plugin.slug)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 ml-4"
                        >
                          {expandedPlugin === plugin.slug ? (
                            <>Hide <ChevronUp className="w-4 h-4" /></>
                          ) : (
                            <>Details <ChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedPlugin === plugin.slug && (
                      <div className="border-t border-blue-200 p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Pros */}
                          <div>
                            <h6 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Pros
                            </h6>
                            <ul className="space-y-1">
                              {plugin.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cons */}
                          <div>
                            <h6 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                              <X className="w-4 h-4" /> Cons
                            </h6>
                            <ul className="space-y-1">
                              {plugin.cons.map((con, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Features */}
                          <div>
                            <h6 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                              <Info className="w-4 h-4" /> Key Features
                            </h6>
                            <ul className="space-y-1">
                              {plugin.features.slice(0, 5).map((feature, i) => (
                                <li key={i} className="text-xs text-gray-700">• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={plugin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Plugin Details <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Plugins */}
          {results[0].recommendedPlugins && results[0].recommendedPlugins.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Recommended Plugins to Fix Issues
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Based on the issues found, these plugins can help improve your website accessibility.
              </p>
              <div className="space-y-3">
                {results[0].recommendedPlugins.map((plugin) => (
                  <div key={plugin.slug} className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{plugin.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              plugin.cost === 'Free' ? 'bg-green-100 text-green-700' :
                              plugin.cost === 'Freemium' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {plugin.cost}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{plugin.rating}/5 ({plugin.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <span>{plugin.activeInstalls} active installs</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Best for:</span>
                            <span className="text-gray-600 ml-1">{plugin.bestFor}</span>
                          </div>
                        </div>
                        <a
                          href={plugin.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1 ml-4"
                        >
                          View <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Next Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              1
            </span>
            <div>
              <strong>Review Critical Issues:</strong> Focus on critical and serious severity issues first, as these
              have the biggest impact on users with disabilities.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              2
            </span>
            <div>
              <strong>Implement Fixes:</strong> Use the code examples provided for each issue to implement proper fixes.
              Test changes with screen readers and keyboard navigation.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              3
            </span>
            <div>
              <strong>Re-test Regularly:</strong> Run accessibility audits after making changes and on a regular schedule
              (monthly recommended) to catch new issues early.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              4
            </span>
            <div>
              <strong>Manual Testing:</strong> Automated tools detect ~57% of WCAG issues. Conduct manual testing
              with screen readers (NVDA, JAWS) and keyboard-only navigation for comprehensive coverage.
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}

/**
 * Generate prioritized recommendations based on issues
 */
function generateRecommendations(stats: {
  avgScore: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number
}) {
  const recommendations = []

  // High priority recommendations
  if (stats.criticalIssues > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix Critical Accessibility Barriers',
      description: `${stats.criticalIssues} critical issues are blocking users with disabilities from accessing your content. These must be addressed immediately to meet legal requirements.`,
      impact: 'Blocks disabled users, legal liability'
    })
  }

  if (stats.seriousIssues > 5) {
    recommendations.push({
      priority: 'high',
      title: 'Address Serious WCAG Violations',
      description: `${stats.seriousIssues} serious accessibility issues significantly impact user experience for people with disabilities. Focus on color contrast, form labels, and keyboard navigation.`,
      impact: 'Severely limits usability for disabled users'
    })
  }

  // Medium priority
  if (stats.moderateIssues > 10) {
    recommendations.push({
      priority: 'medium',
      title: 'Improve Overall Accessibility',
      description: `${stats.moderateIssues} moderate issues affect user experience. Address these to improve overall accessibility and user satisfaction.`,
      impact: 'Reduces usability and SEO performance'
    })
  }

  // General recommendations
  if (stats.avgScore < 90) {
    recommendations.push({
      priority: 'medium',
      title: 'Implement Accessibility Best Practices',
      description: 'Add ARIA labels, improve semantic HTML structure, ensure all interactive elements are keyboard accessible, and verify sufficient color contrast ratios.',
      impact: 'Improves usability for all users'
    })
  }

  recommendations.push({
    priority: 'low',
    title: 'Establish Ongoing Accessibility Monitoring',
    description: 'Set up automated accessibility testing in your CI/CD pipeline and conduct quarterly manual accessibility audits to maintain compliance.',
    impact: 'Prevents regression and ensures continuous compliance'
  })

  return recommendations
}
