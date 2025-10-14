'use client'

import { useState, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { ClaudeConclusionService, type AuditData, type ConclusionResult } from '../lib/claudeConclusionService'
import Tooltip from './Tooltip'

interface OverallAuditConclusionProps {
  results: {
    brandedKeywordsList?: Array<any>
    nonBrandedKeywordsList?: Array<any>
    aboveFoldKeywordsList?: Array<any>
    keywordCompetition?: {
      competitors: Array<any>
      targetDomainAuthority?: number
    }
    aboveFoldCompetitors?: {
      competitors: Array<any>
      competitionIntensity?: string
      targetDomainAuthority?: number
    }
    viewportAnalysis?: {
      overallScore: number
      globalIssues: Array<any>
    }
    businessType?: {
      category: string
      subcategory: string
      description: string
    }
  }
  domain: string
  auditType?: 'page' | 'website' | 'full'
}

export default function OverallAuditConclusion({ results, domain, auditType = 'website' }: OverallAuditConclusionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [claudeConclusions, setClaudeConclusions] = useState<ConclusionResult | null>(null)
  const [loadingConclusions, setLoadingConclusions] = useState(true)
  const [conclusionError, setConclusionError] = useState<string | null>(null)

  // Generate Claude conclusions when component mounts
  useEffect(() => {
    async function generateConclusions() {
      if (!results.businessType) {
        setConclusionError('Business type information required for Claude conclusions')
        setLoadingConclusions(false)
        return
      }

      try {
        setLoadingConclusions(true)
        setConclusionError(null)

        // Prepare audit data for Claude
        const auditData: AuditData = {
          domain,
          businessType: results.businessType,
          keywordFindings: {
            totalKeywords: (results.brandedKeywordsList?.length || 0) + (results.nonBrandedKeywordsList?.length || 0),
            topPerformingKeywords: results.aboveFoldKeywordsList?.slice(0, 5).map(k => k.keyword || k.term) || [],
            missingOpportunities: [], // Could be enhanced with more data
            competitorKeywords: results.keywordCompetition?.competitors?.slice(0, 5).map(c => c.domain) || []
          },
          technicalFindings: {
            pageSpeed: results.viewportAnalysis?.overallScore || 0,
            mobileScore: results.viewportAnalysis?.overallScore || 0,
            issues: results.viewportAnalysis?.globalIssues?.map(i => i.description || i.message || 'Technical issue') || [],
            recommendations: ['Improve mobile responsiveness', 'Optimize page speed', 'Fix technical errors']
          },
          contentFindings: {
            titleIssues: 0, // Could be enhanced with title analysis
            metaDescriptionIssues: 0, // Could be enhanced with meta analysis
            headingStructure: 'Standard H1-H6 hierarchy',
            contentGaps: ['Industry-specific content', 'Local content', 'Service pages']
          },
          competitorAnalysis: {
            topCompetitors: results.keywordCompetition?.competitors?.slice(0, 3).map(c => c.domain) || [],
            competitiveGaps: ['Higher domain authority needed', 'More content required'],
            opportunities: ['Long-tail keywords', 'Local SEO', 'Content marketing']
          }
        }

        const conclusionService = new ClaudeConclusionService()
        const conclusions = await conclusionService.generateConclusions(auditData)
        setClaudeConclusions(conclusions)

      } catch (error) {
        console.error('Failed to generate Claude conclusions:', error)
        setConclusionError('Failed to generate intelligent conclusions. Using fallback analysis.')
      } finally {
        setLoadingConclusions(false)
      }
    }

    generateConclusions()
  }, [domain, results])
  
  // Randomly select an office worker image
  const officeWorkerImages = [
    '/images/office-worker-dark-skin-tone-svgrepo-com.svg',
    '/images/office-worker-light-skin-tone-svgrepo-com.svg',
    '/images/office-worker-medium-light-skin-tone-svgrepo-com.svg',
    '/images/office-worker-medium-skin-tone-svgrepo-com.svg'
  ]
  const randomImage = officeWorkerImages[Math.floor(Math.random() * officeWorkerImages.length)]

  // Analyze the audit results to determine priorities
  const brandedKeywords = results.brandedKeywordsList || []
  const nonBrandedKeywords = results.nonBrandedKeywordsList || []
  const aboveFoldKeywords = results.aboveFoldKeywordsList || []
  const competitors = results.keywordCompetition?.competitors || []
  const aboveFoldCompetitors = results.aboveFoldCompetitors?.competitors || []
  const viewportScore = results.viewportAnalysis?.overallScore || 0
  const viewportIssues = results.viewportAnalysis?.globalIssues || []

  // Determine priority levels and recommendations
  const priorities = {
    critical: [] as Array<{category: string, issue: string, action: string}>,
    high: [] as Array<{category: string, issue: string, action: string}>,
    medium: [] as Array<{category: string, issue: string, action: string}>,
    low: [] as Array<{category: string, issue: string, action: string}>
  }

  // Critical Priority: Major technical issues
  if (viewportScore < 60) {
    priorities.critical.push({
      category: 'Mobile Responsiveness',
      issue: `Poor mobile experience (${viewportScore}/100 score)`,
      action: 'Fix responsive design issues immediately - Google uses mobile-first indexing'
    })
  }

  if (viewportIssues.length > 3) {
    priorities.critical.push({
      category: 'Technical Issues',
      issue: `${viewportIssues.length} critical viewport issues detected`,
      action: 'Address all responsive design problems to prevent user experience issues'
    })
  }

  // High Priority: SEO fundamentals
  if (brandedKeywords.length === 0) {
    priorities.high.push({
      category: 'Brand Awareness',
      issue: 'No branded keyword searches found',
      action: 'Invest in brand marketing and ensure consistent brand naming across platforms'
    })
  }

  if (nonBrandedKeywords.length < 5) {
    priorities.high.push({
      category: 'Organic Traffic',
      issue: 'Limited non-branded keyword presence',
      action: 'Research and create content targeting relevant industry keywords'
    })
  }

  if (aboveFoldKeywords.length < 3) {
    priorities.high.push({
      category: 'Search Rankings',
      issue: 'Few top-ranking keywords (positions 1-3)',
      action: 'Optimize existing content to improve search rankings for target keywords'
    })
  }

  // Medium Priority: Competitive positioning
  if (competitors.length > 5) {
    const hasStrongCompetitors = competitors.some(c => 
      c.authority && results.keywordCompetition?.targetDomainAuthority && 
      c.authority > (results.keywordCompetition.targetDomainAuthority + 15)
    )
    
    if (hasStrongCompetitors) {
      priorities.medium.push({
        category: 'Competitive Positioning',
        issue: 'Competitors with significantly higher domain authority detected',
        action: 'Focus on building high-quality backlinks to improve domain authority'
      })
    }
  }

  if (results.aboveFoldCompetitors?.competitionIntensity === 'high') {
    priorities.medium.push({
      category: 'Market Competition',
      issue: 'High competition intensity in your top keyword markets',
      action: 'Develop content strategies to differentiate from competitors'
    })
  }

  // Low Priority: Optimization opportunities
  if (brandedKeywords.length > 0 && brandedKeywords.some(k => !k.position || k.position > 5)) {
    priorities.low.push({
      category: 'Brand Optimization',
      issue: 'Some branded keywords ranking below position 5',
      action: 'Optimize pages for branded keywords where rankings can be improved'
    })
  }

  if (viewportScore >= 60 && viewportScore < 80) {
    priorities.low.push({
      category: 'Mobile Enhancement',
      issue: 'Good but improvable mobile experience',
      action: 'Fine-tune responsive design for better mobile user experience'
    })
  }

  // Calculate overall audit score
  const scores = {
    brandAwareness: brandedKeywords.length > 0 ? (brandedKeywords.length > 5 ? 90 : 70) : 20,
    organicPresence: nonBrandedKeywords.length > 10 ? 90 : nonBrandedKeywords.length > 5 ? 70 : nonBrandedKeywords.length > 0 ? 50 : 20,
    topRankings: aboveFoldKeywords.length > 5 ? 90 : aboveFoldKeywords.length > 2 ? 70 : aboveFoldKeywords.length > 0 ? 50 : 20,
    mobileExperience: viewportScore,
    competitivePosition: competitors.length > 0 ? (competitors.length > 8 ? 60 : 80) : 90
  }

  const overallScore = Math.round(
    (scores.brandAwareness * 0.2 + 
     scores.organicPresence * 0.25 + 
     scores.topRankings * 0.25 + 
     scores.mobileExperience * 0.2 + 
     scores.competitivePosition * 0.1)
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    if (score >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-800'
      case 'high': return 'text-orange-800'
      case 'medium': return 'text-yellow-800'
      case 'low': return 'text-blue-800'
      default: return 'text-gray-800'
    }
  }

  const allPriorities = [
    ...priorities.critical.map(p => ({ ...p, priority: 'critical' })),
    ...priorities.high.map(p => ({ ...p, priority: 'high' })),
    ...priorities.medium.map(p => ({ ...p, priority: 'medium' })),
    ...priorities.low.map(p => ({ ...p, priority: 'low' }))
  ]

  return (
    <div className="space-y-6 mt-12 mb-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src={randomImage} 
            alt="Office worker" 
            className="w-16 h-16 opacity-80"
          />
          <div>
            <div className="flex items-center gap-3 justify-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900">📊 Overall Audit Conclusion</h2>
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Overall Audit Conclusion</p>
                    <p className="mb-2">AI-powered comprehensive analysis combining all audit data into actionable insights.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Overall Score:</strong> Weighted combination of all audit sections</p>
                      <p><strong>Priority Actions:</strong> Most important tasks ranked by impact</p>
                      <p><strong>Timeline:</strong> Suggested implementation order (Quick wins → Long-term)</p>
                      <p><strong>Business Impact:</strong> Expected results from implementing recommendations</p>
                      <p><strong>AI Analysis:</strong> Claude processes all data to identify patterns and opportunities</p>
                    </div>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-gray-600">Complete analysis summary with prioritized action plan</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}/100
          </div>
          <h3 className="text-xl font-semibold mt-2 text-gray-900">Overall SEO Health Score</h3>
          <p className="text-gray-600 text-sm mt-1">
            Based on brand presence, organic visibility, rankings, mobile experience, and competitive position
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-2 rounded ${getScoreColor(scores.brandAwareness)}`}>
              {scores.brandAwareness}
            </div>
            <div className="text-xs text-gray-600 mt-1">Brand Awareness</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-2 rounded ${getScoreColor(scores.organicPresence)}`}>
              {scores.organicPresence}
            </div>
            <div className="text-xs text-gray-600 mt-1">Organic Presence</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-2 rounded ${getScoreColor(scores.topRankings)}`}>
              {scores.topRankings}
            </div>
            <div className="text-xs text-gray-600 mt-1">Top Rankings</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-2 rounded ${getScoreColor(scores.mobileExperience)}`}>
              {scores.mobileExperience}
            </div>
            <div className="text-xs text-gray-600 mt-1">Mobile Experience</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold px-3 py-2 rounded ${getScoreColor(scores.competitivePosition)}`}>
              {scores.competitivePosition}
            </div>
            <div className="text-xs text-gray-600 mt-1">Competitive Position</div>
          </div>
        </div>
      </div>

      {/* Claude Executive Summary */}
      {claudeConclusions && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧠</span>
            <h3 className="text-xl font-semibold text-gray-900">AI Executive Summary</h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Claude AI Analysis
            </span>
          </div>
          
          <p className="text-gray-800 mb-4 bg-white p-4 rounded-lg border">
            {claudeConclusions.executiveSummary}
          </p>

          {claudeConclusions.keyInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-blue-900 mb-2">🔍 Key Insights</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  {claudeConclusions.keyInsights.map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>

              {claudeConclusions.industrySpecificAdvice.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Industry-Specific Advice</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    {claudeConclusions.industrySpecificAdvice.map((advice, index) => (
                      <li key={index}>• {advice}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Priority Action Plan */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">🎯 Prioritized Action Plan</h3>
          {claudeConclusions && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Analysis
            </span>
          )}
        </div>
        
        {loadingConclusions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Generating intelligent conclusions...</span>
          </div>
        ) : claudeConclusions && claudeConclusions.priorityRecommendations.length > 0 ? (
          <div className="space-y-3">
            {claudeConclusions.priorityRecommendations.map((item, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(item.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getPriorityTextColor(item.priority)} bg-white`}>
                        {item.priority} Priority
                      </span>
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className={`text-sm ${getPriorityTextColor(item.priority)} mb-2`}>
                      <strong>Description:</strong> {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`${getPriorityTextColor(item.priority)}`}>
                        <strong>Impact:</strong> {item.estimatedImpact}
                      </span>
                      <span className={`${getPriorityTextColor(item.priority)}`}>
                        <strong>Difficulty:</strong> {item.difficulty}
                      </span>
                      <span className={`${getPriorityTextColor(item.priority)}`}>
                        <strong>Timeline:</strong> {item.timeframe}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allPriorities.length > 0 ? (
          <div className="space-y-3">
            {allPriorities.map((item, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(item.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${getPriorityTextColor(item.priority)} bg-white`}>
                        {item.priority} Priority
                      </span>
                      <span className="font-medium text-gray-900">{item.category}</span>
                    </div>
                    <p className={`text-sm ${getPriorityTextColor(item.priority)} mb-2`}>
                      <strong>Issue:</strong> {item.issue}
                    </p>
                    <p className={`text-sm ${getPriorityTextColor(item.priority)}`}>
                      <strong>Action:</strong> {item.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>🎉 Excellent! No major issues detected.</p>
            <p className="text-sm mt-1">Continue monitoring and optimizing for sustained growth.</p>
          </div>
        )}
        
        {conclusionError && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{conclusionError}</p>
          </div>
        )}
      </div>

      {/* Summary by Section */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Section Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keyword Analysis Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🔍 Keyword Analysis</h4>
            <div className="text-blue-800 text-sm space-y-1">
              <p>• Branded keywords: {brandedKeywords.length} found</p>
              <p>• Non-branded keywords: {nonBrandedKeywords.length} found</p>
              <p>• Top rankings (1-3): {aboveFoldKeywords.length} keywords</p>
              <p className="font-medium">
                {nonBrandedKeywords.length > 10 ? 'Strong' : nonBrandedKeywords.length > 5 ? 'Good' : 'Needs improvement'} organic presence
              </p>
            </div>
          </div>

          {/* Competition Summary */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">⚔️ Competition Analysis</h4>
            <div className="text-red-800 text-sm space-y-1">
              <p>• Direct competitors: {competitors.length} identified</p>
              <p>• Above-fold competitors: {aboveFoldCompetitors.length} found</p>
              <p>• Market intensity: {results.aboveFoldCompetitors?.competitionIntensity || 'Unknown'}</p>
              <p className="font-medium">
                {competitors.length > 8 ? 'High' : competitors.length > 4 ? 'Moderate' : 'Low'} competition level
              </p>
            </div>
          </div>

          {/* Technical Summary */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-2">⚙️ Technical Analysis</h4>
            <div className="text-teal-800 text-sm space-y-1">
              <p>• Mobile score: {viewportScore}/100</p>
              <p>• Critical issues: {viewportIssues.length} found</p>
              <p>• Responsive design: {viewportScore >= 80 ? 'Excellent' : viewportScore >= 60 ? 'Good' : 'Needs work'}</p>
              <p className="font-medium">
                {viewportScore >= 80 ? 'Mobile-optimized' : 'Mobile optimization needed'}
              </p>
            </div>
          </div>

          {/* Growth Opportunities */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">🚀 Growth Opportunities</h4>
            <div className="text-purple-800 text-sm space-y-1">
              <p>• Recommended keywords available</p>
              <p>• Authority building potential</p>
              <p>• Content optimization opportunities</p>
              <p className="font-medium">
                Focus on {priorities.critical.length + priorities.high.length} high-impact items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">⏰ Recommended Timeline</h3>
          {claudeConclusions && claudeConclusions.nextSteps.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              🧠 AI Next Steps
            </span>
          )}
        </div>
        
        {claudeConclusions && claudeConclusions.nextSteps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-purple-600 mb-2">Next Steps</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {claudeConclusions.nextSteps.map((step, index) => (
                  <li key={index}>• {step}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-red-600 mb-2">Week 1-2: Critical Issues</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {claudeConclusions.priorityRecommendations.filter(r => r.priority === 'high' && r.timeframe === 'immediate').length > 0 ? (
                  claudeConclusions.priorityRecommendations
                    .filter(r => r.priority === 'high' && r.timeframe === 'immediate')
                    .map((item, index) => (
                      <li key={index}>• {item.title}</li>
                    ))
                ) : (
                  <li>• No critical immediate issues ✅</li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-blue-600 mb-2">Ongoing: Optimization</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {claudeConclusions.priorityRecommendations.filter(r => r.timeframe === 'long-term').length > 0 ? (
                  claudeConclusions.priorityRecommendations
                    .filter(r => r.timeframe === 'long-term')
                    .slice(0, 4)
                    .map((item, index) => (
                      <li key={index}>• {item.title}</li>
                    ))
                ) : (
                  <>
                    <li>• Monitor keyword rankings</li>
                    <li>• Content optimization</li>
                    <li>• Competitive analysis</li>
                    <li>• Performance tracking</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-red-600 mb-2">Week 1-2: Critical Issues</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {priorities.critical.length > 0 ? (
                  priorities.critical.map((item, index) => (
                    <li key={index}>• {item.category}</li>
                  ))
                ) : (
                  <li>• No critical issues ✅</li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-orange-600 mb-2">Month 1: High Priority</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {priorities.high.length > 0 ? (
                  priorities.high.map((item, index) => (
                    <li key={index}>• {item.category}</li>
                  ))
                ) : (
                  <li>• No high priority issues ✅</li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-blue-600 mb-2">Ongoing: Optimization</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Monitor keyword rankings</li>
                <li>• Content optimization</li>
                <li>• Competitive analysis</li>
                <li>• Performance tracking</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}