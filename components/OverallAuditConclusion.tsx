'use client'

import { useState } from 'react'

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
  }
  auditType?: 'page' | 'website' | 'full'
}

export default function OverallAuditConclusion({ results, auditType = 'website' }: OverallAuditConclusionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Overall Audit Conclusion</h2>
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

      {/* Priority Action Plan */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Prioritized Action Plan</h3>
        
        {allPriorities.length > 0 ? (
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">⏰ Recommended Timeline</h3>
        
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
      </div>
    </div>
  )
}