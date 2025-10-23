'use client';

import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Smartphone, 
  Monitor, 
  Image as ImageIcon,
  Target,
  Lightbulb,
  TrendingUp,
  Shield,
  Settings,
  Award,
  Eye,
  ArrowRight
} from 'lucide-react';

interface PerformanceTechnicalConclusionProps {
  data: any;
}

export default function PerformanceTechnicalConclusion({ data }: PerformanceTechnicalConclusionProps) {
  // Check if we have Advanced analysis enhanced data
  const hasAIAnalysis = data?.enhancedWithAI && (
    data?.performanceDiagnosis || 
    data?.technicalSEOIntelligence || 
    data?.imageOptimizationStrategy
  );

  if (!hasAIAnalysis) {
    return null; // Don't show component if no AI analysis available
  }

  const performanceDiagnosis = data.performanceDiagnosis;
  const seoIntelligence = data.technicalSEOIntelligence;
  const imageStrategy = data.imageOptimizationStrategy;

  // Get overall health scores
  const performanceScore = performanceDiagnosis?.overallHealthScore || 0;
  const seoScore = seoIntelligence?.seoHealthScore || 0;
  const imageScore = imageStrategy?.overallScore || 0;
  const overallScore = Math.round((performanceScore + seoScore + imageScore) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical Issues';
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-600" />
        Performance & Technical Audit Analysis
      </h3>

      {/* Overall Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Website Health</span>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              overallScore >= 80 ? 'bg-green-500' :
              overallScore >= 60 ? 'bg-blue-500' :
              overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <p className={`mt-2 text-sm font-medium ${getScoreColor(overallScore)}`}>
          {getScoreLabel(overallScore)}
        </p>
      </div>

      {/* Health Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Performance Health */}
        {performanceDiagnosis && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${getGradeBadgeColor(performanceDiagnosis.healthGrade)}`}>
                  {performanceDiagnosis.healthGrade}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {performanceDiagnosis.performanceInsights?.speedSummary || 'Loading speed analysis'}
            </div>
          </div>
        )}

        {/* SEO Health */}
        {seoIntelligence && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Technical SEO</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(seoScore)}`}>
                {seoScore}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Content quality: {seoIntelligence.contentQuality?.score || 0}/100
            </div>
          </div>
        )}

        {/* Image Optimization */}
        {imageStrategy && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Images</span>
              </div>
              <span className={`text-lg font-bold ${getScoreColor(imageScore)}`}>
                {imageScore}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {imageStrategy.estimatedSavings?.loadTimeImprovement} potential savings
            </div>
          </div>
        )}
      </div>

      {/* Critical Issues */}
      {performanceDiagnosis?.primaryIssues && performanceDiagnosis.primaryIssues.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Critical Issues to Address
          </h4>
          <div className="space-y-3">
            {performanceDiagnosis.primaryIssues
              .filter((issue: any) => issue.severity === 'critical' || issue.severity === 'important')
              .slice(0, 3)
              .map((issue: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                issue.severity === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{issue.title}</h5>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        issue.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        issue.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {issue.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                    <p className="text-xs text-gray-500 italic">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {issue.timeToFix} • Expected: {issue.expectedImprovement}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Performance Quick Wins */}
        {performanceDiagnosis?.quickWins && performanceDiagnosis.quickWins.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Performance Quick Wins
            </h4>
            <div className="space-y-2">
              {performanceDiagnosis.quickWins.slice(0, 3).map((win: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">{win.title}</p>
                    <p className="text-xs text-green-700">{win.timeToImplement} • {win.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Quick Wins */}
        {seoIntelligence?.quickSEOWins && seoIntelligence.quickSEOWins.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              SEO Quick Wins
            </h4>
            <div className="space-y-2">
              {seoIntelligence.quickSEOWins.slice(0, 3).map((win: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{win.title}</p>
                    <p className="text-xs text-blue-700">{win.timeRequired} • {win.expectedImprovement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Business Impact */}
      {performanceDiagnosis?.businessImpact && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6 border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-600" />
            Business Impact Analysis
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-orange-600 mb-1">Estimated Visitor Loss</div>
              <div className="text-lg font-bold text-orange-900">
                {performanceDiagnosis.businessImpact.estimatedVisitorLoss}%
              </div>
            </div>
            <div>
              <div className="text-xs text-orange-600 mb-1">User Experience</div>
              <div className="text-lg font-bold text-orange-900">
                {performanceDiagnosis.businessImpact.userExperienceScore}/100
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-orange-600 mb-1">Revenue Impact</div>
              <div className="text-sm text-orange-800">
                {performanceDiagnosis.businessImpact.revenueImpact}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Plan */}
      {performanceDiagnosis?.actionPlan && performanceDiagnosis.actionPlan.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            Recommended Action Plan
          </h4>
          <div className="space-y-3">
            {performanceDiagnosis.actionPlan.map((phase: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {phase.phase}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{phase.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span><Clock className="w-3 h-3 inline mr-1" />{phase.timeline}</span>
                    <span><TrendingUp className="w-3 h-3 inline mr-1" />{phase.estimatedImpact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statement */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Automated Analysis Summary:</strong> Your website scored{' '}
          <strong>{overallScore}/100</strong> overall. 
          {performanceDiagnosis && (
            <> Performance grade: <strong>{performanceDiagnosis.healthGrade}</strong>.</>
          )}
          {performanceDiagnosis?.businessImpact?.estimatedVisitorLoss > 10 && (
            <> Current issues may be causing approximately{' '}
            <strong>{performanceDiagnosis.businessImpact.estimatedVisitorLoss}%</strong> visitor loss.</>
          )}
          {' '}Focus on the critical issues and quick wins above to see immediate improvements in user experience and search engine rankings.
        </p>
      </div>
    </div>
  );
}