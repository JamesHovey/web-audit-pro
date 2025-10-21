'use client';

import React from 'react';
import { 
  Target, 
  TrendingUp, 
  Search, 
  Lightbulb,
  Award,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  Rocket
} from 'lucide-react';

interface KeywordAnalysisConclusionProps {
  analysis: any; // ClaudeKeywordAnalysis
}

export default function KeywordAnalysisConclusion({ analysis }: KeywordAnalysisConclusionProps) {
  if (!analysis || !analysis.summary) {
    return null; // Don't show component if no Claude analysis available
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'text-[#c42e3b]'; // Hard - PMW complementary red
    if (difficulty >= 40) return 'text-[#e67e22]'; // Medium - PMW complementary orange  
    return 'text-[#27ae60]'; // Easy - PMW complementary green
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-[#c42e3b]/10 text-[#c42e3b]'; // PMW complementary red
      case 'medium': return 'bg-[#e67e22]/10 text-[#e67e22]'; // PMW complementary orange
      case 'low': return 'bg-[#27ae60]/10 text-[#27ae60]'; // PMW complementary green
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'commercial': return 'bg-[#42499c]/10 text-[#42499c]'; // PMW blue
      case 'transactional': return 'bg-[#c42e3b]/10 text-[#c42e3b]'; // PMW complementary red
      case 'informational': return 'bg-[#675c9b]/10 text-[#675c9b]'; // PMW light green
      case 'navigational':
      case 'branded': return 'bg-[#ef86ce]/10 text-[#ef86ce]'; // PMW pink
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-[#42499c]" />
        Keyword Intelligence
      </h3>

      {/* Business Intelligence Summary */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-[#42499c]/5 to-[#675c9b]/5 rounded-lg p-4 border border-[#42499c]/20">
          <div className="flex items-start gap-2">
            <Target className="w-5 h-5 text-[#42499c] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-[#42499c] mb-2">Business Intelligence</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Business Type:</strong> {analysis.businessType}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Description:</strong> {analysis.businessDescription}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Target Audience:</strong> {analysis.targetAudience}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-[#42499c]" />
            <span className="text-xs text-gray-500">Total Keywords</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {analysis.totalKeywords}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#675c9b]" />
            <span className="text-xs text-gray-500">Avg Difficulty</span>
          </div>
          <div className={`text-lg font-bold ${getDifficultyColor(analysis.averageDifficulty)}`}>
            {Math.round(analysis.averageDifficulty)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-[#ef86ce]" />
            <span className="text-xs text-gray-500">Branded</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {analysis.brandedKeywords?.length || 0}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#27ae60]" />
            <span className="text-xs text-gray-500">Opportunities</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {analysis.recommendedKeywords?.length || 0}
          </div>
        </div>
      </div>

      {/* Top Keyword Opportunities */}
      {analysis.recommendedKeywords && analysis.recommendedKeywords.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#27ae60]" />
            Top Keyword Opportunities
          </h4>
          <div className="space-y-3">
            {analysis.recommendedKeywords.slice(0, 5).map((keyword: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-[#27ae60]/5 rounded-lg border border-[#27ae60]/20">
                <CheckCircle className="w-5 h-5 text-[#27ae60] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-[#27ae60]">{keyword.keyword}</h5>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(keyword.priority)}`}>
                        {keyword.priority?.toUpperCase()}
                      </span>
                      {keyword.volume && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {keyword.volume} searches/mo
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#27ae60] mb-2">{keyword.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-[#27ae60]">
                    <span className={`px-2 py-1 rounded-full ${getIntentColor(keyword.intent)}`}>
                      {keyword.intent}
                    </span>
                    {keyword.difficulty && (
                      <span className={`${getDifficultyColor(keyword.difficulty)}`}>
                        Difficulty: {keyword.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Gaps & Opportunities */}
      {(analysis.contentGaps?.length > 0 || analysis.keywordOpportunities?.length > 0) && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#e67e22]" />
            Content Strategy Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.contentGaps?.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Content Gaps</span>
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  {analysis.contentGaps.slice(0, 3).map((gap: string, index: number) => (
                    <li key={index} className="flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.keywordOpportunities?.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Keyword Opportunities</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {analysis.keywordOpportunities.slice(0, 3).map((opportunity: string, index: number) => (
                    <li key={index} className="flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategic Recommendations */}
      {analysis.strategicRecommendations?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#42499c]" />
            Strategic Recommendations
          </h4>
          <div className="space-y-2">
            {analysis.strategicRecommendations.slice(0, 4).map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[#42499c] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {analysis.nextSteps?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#675c9b]" />
            Next Steps
          </h4>
          <div className="space-y-2">
            {analysis.nextSteps.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="bg-[#675c9b] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-[#42499c]/5 to-[#675c9b]/5 rounded-lg border border-[#42499c]/20">
        <p className="text-sm text-gray-700">
          <strong>Automated Analysis Summary:</strong> {analysis.summary}
          {analysis.confidence && (
            <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
              analysis.confidence === 'high' ? 'bg-[#27ae60]/10 text-[#27ae60]' :
              analysis.confidence === 'medium' ? 'bg-[#e67e22]/10 text-[#e67e22]' :
              'bg-gray-100 text-gray-700'
            }`}>
              {analysis.confidence.toUpperCase()} CONFIDENCE
            </span>
          )}
        </p>
      </div>
    </div>
  );
}