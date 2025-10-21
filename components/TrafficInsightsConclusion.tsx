'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Target, Globe, Users, AlertCircle, Lightbulb, ChartBar, Zap, Award, Eye } from 'lucide-react';

interface TrafficInsightsConclusionProps {
  data: any;
}

export default function TrafficInsightsConclusion({ data }: TrafficInsightsConclusionProps) {
  // Helper function to extract traffic values (handles both number and object formats)
  const getTrafficValue = (value: any): number => {
    if (typeof value === 'object' && value?.estimate !== undefined) {
      return value.estimate || 0;
    }
    return value || 0;
  };

  const getTrafficHealthScore = () => {
    if (!data) return 0;

    let score = 0;
    const organic = getTrafficValue(data.monthlyOrganicTraffic);
    
    // Score based on traffic volume
    if (organic > 100000) score += 30;
    else if (organic > 50000) score += 25;
    else if (organic > 10000) score += 20;
    else if (organic > 5000) score += 15;
    else if (organic > 1000) score += 10;
    else score += 5;
    
    // Brand strength bonus
    if (data.brandStrength?.score > 70) score += 20;
    else if (data.brandStrength?.score > 50) score += 15;
    else if (data.brandStrength?.score > 30) score += 10;
    else score += 5;
    
    // Traffic diversity bonus
    if (data.trafficSources) {
      const sources = Object.values(data.trafficSources).filter(v => typeof v === 'number') as number[];
      const maxSource = Math.max(...sources);
      const totalPercentage = sources.reduce((a, b) => a + b, 0);
      if (totalPercentage > 0 && maxSource / totalPercentage < 0.5) score += 15; // Well-diversified
      else if (totalPercentage > 0 && maxSource / totalPercentage < 0.7) score += 10;
      else score += 5;
    }
    
    // Growth trend bonus
    if (data.trafficPotential?.growthTrend === 'rapid-growth') score += 20;
    else if (data.trafficPotential?.growthTrend === 'growing') score += 15;
    else if (data.trafficPotential?.growthTrend === 'stable') score += 10;
    else score += 5;
    
    // Competitive position bonus
    if (data.competitivePosition?.marketShare === 'dominant' || data.competitivePosition?.marketShare === 'strong') score += 15;
    else if (data.competitivePosition?.marketShare === 'moderate') score += 10;
    else score += 5;
    
    return Math.min(100, score);
  };

  const healthScore = getTrafficHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Needs Improvement';
  };

  // Generate intelligent, context-aware recommendations
  const getRecommendations = () => {
    const recommendations = [];
    const organic = getTrafficValue(data.monthlyOrganicTraffic);
    const paid = getTrafficValue(data.monthlyPaidTraffic);
    const branded = getTrafficValue(data.brandedTraffic);
    const brandScore = data.brandStrength?.score || 0;
    const industry = data.industry?.primary || '';
    const businessType = data.industry?.b2bVsB2c || '';
    
    // Smart traffic growth recommendations based on current stage
    if (organic < 1000) {
      recommendations.push({
        icon: <Target className="w-4 h-4" />,
        priority: 'high',
        title: 'Foundation SEO Strategy',
        description: `Focus on ${businessType === 'b2b' ? 'industry-specific keywords and thought leadership content' : 'local SEO and customer-focused content'} to establish organic presence`,
        impact: 'High',
        timeframe: '3-6 months'
      });
    } else if (organic < 5000) {
      recommendations.push({
        icon: <TrendingUp className="w-4 h-4" />,
        priority: 'high',
        title: 'Scale Content Strategy',
        description: `Expand to ${industry.toLowerCase()} long-tail keywords and create pillar content to capture more search volume`,
        impact: 'High',
        timeframe: '2-4 months'
      });
    } else if (organic < 20000) {
      recommendations.push({
        icon: <Users className="w-4 h-4" />,
        priority: 'medium',
        title: 'Audience Expansion',
        description: `Target adjacent market segments and optimize for voice search to reach broader ${businessType} audiences`,
        impact: 'Medium',
        timeframe: '4-8 months'
      });
    }
    
    // Brand strength recommendations with specific actions
    if (brandScore < 30) {
      recommendations.push({
        icon: <Award className="w-4 h-4" />,
        priority: 'high',
        title: 'Build Brand Authority',
        description: `Establish ${industry.toLowerCase()} thought leadership through expert content, case studies, and industry partnerships`,
        impact: 'High',
        timeframe: '6-12 months'
      });
    } else if (brandScore < 60) {
      recommendations.push({
        icon: <Zap className="w-4 h-4" />,
        priority: 'medium',
        title: 'Amplify Brand Recognition',
        description: 'Increase branded search volume through PR campaigns, social media presence, and customer testimonials',
        impact: 'Medium',
        timeframe: '3-6 months'
      });
    }
    
    // Traffic source optimization with ROI focus
    const organicRatio = totalTraffic > 0 ? (organic / totalTraffic) : 0;
    const paidRatio = totalTraffic > 0 ? (paid / totalTraffic) : 0;
    
    if (organicRatio > 0.9 && organic > 2000) {
      recommendations.push({
        icon: <ChartBar className="w-4 h-4" />,
        priority: 'medium',
        title: 'Strategic Paid Acquisition',
        description: `Launch targeted ${businessType === 'b2b' ? 'LinkedIn and Google Ads for high-intent keywords' : 'social media ads for customer acquisition'} to diversify traffic sources`,
        impact: 'Medium',
        timeframe: '1-3 months'
      });
    } else if (paidRatio > 0.4) {
      recommendations.push({
        icon: <Target className="w-4 h-4" />,
        priority: 'high',
        title: 'Reduce Paid Dependency',
        description: 'Invest in organic SEO to replace expensive paid traffic with sustainable organic growth',
        impact: 'High',
        timeframe: '6-12 months'
      });
    }
    
    // Geographic expansion with market-specific insights
    if (data.topCountries && data.topCountries[0]?.percentage > 70) {
      const primaryMarket = data.topCountries[0].country;
      recommendations.push({
        icon: <Globe className="w-4 h-4" />,
        priority: 'medium',
        title: 'International Market Entry',
        description: `Expand beyond ${primaryMarket} with localized content and ${businessType === 'b2b' ? 'region-specific industry insights' : 'culturally adapted marketing messages'}`,
        impact: 'Medium',
        timeframe: '6-12 months'
      });
    }
    
    // AI-identified opportunities with enhanced context
    if (data.competitivePosition?.trafficOpportunities?.length > 0) {
      recommendations.push({
        icon: <Lightbulb className="w-4 h-4" />,
        priority: 'high',
        title: 'Opportunity',
        description: data.competitivePosition.trafficOpportunities[0],
        impact: 'High',
        timeframe: 'Varies'
      });
    }
    
    // Industry-specific recommendations
    if (industry.toLowerCase().includes('agency') || industry.toLowerCase().includes('marketing')) {
      recommendations.push({
        icon: <Users className="w-4 h-4" />,
        priority: 'medium',
        title: 'Showcase Client Success',
        description: 'Create detailed case studies and client testimonials to build trust and attract similar businesses',
        impact: 'Medium',
        timeframe: '2-4 months'
      });
    }
    
    // Prioritize and return top recommendations
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 3);
  };

  // Calculate key metrics for display
  const organicTraffic = getTrafficValue(data.monthlyOrganicTraffic);
  const paidTraffic = getTrafficValue(data.monthlyPaidTraffic);
  const brandedTraffic = getTrafficValue(data.brandedTraffic);
  const totalTraffic = organicTraffic + paidTraffic;
  const organicPercentage = totalTraffic > 0 ? Math.round((organicTraffic / totalTraffic) * 100) : 0;
  const brandedPercentage = organicTraffic > 0
    ? Math.round((brandedTraffic / organicTraffic) * 100)
    : 0;

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-600" />
        Traffic Insights Conclusion
      </h3>

      {/* Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Traffic Health</span>
          <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              healthScore >= 80 ? 'bg-green-500' :
              healthScore >= 60 ? 'bg-blue-500' :
              healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <p className={`mt-2 text-sm font-medium ${getHealthColor(healthScore)}`}>
          {getHealthLabel(healthScore)}
        </p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Total Monthly Traffic</div>
          <div className="text-lg font-bold text-gray-900">
            {totalTraffic.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Organic Share</div>
          <div className="text-lg font-bold text-gray-900">{organicPercentage}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Branded Traffic</div>
          <div className="text-lg font-bold text-gray-900">{brandedPercentage}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Growth Trend</div>
          <div className="flex items-center gap-1">
            {data.trafficPotential?.growthTrend === 'declining' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : data.trafficPotential?.growthTrend === 'rapid-growth' || data.trafficPotential?.growthTrend === 'growing' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <span className="text-lg">→</span>
            )}
            <span className="text-sm font-medium capitalize">
              {data.trafficPotential?.growthTrend?.replace('-', ' ') || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Insights */}
      {data.enhancedWithAI && (
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Enhanced Analysis
                </p>
                <p className="text-sm text-blue-700">
                  {data.industry && (
                    <>Industry: <strong>{data.industry.primary}</strong> ({data.industry.b2bVsB2c?.toUpperCase()})<br/></>
                  )}
                  {data.competitivePosition && (
                    <>Market Position: <strong className="capitalize">{data.competitivePosition.marketShare}</strong><br/></>
                  )}
                  {data.brandStrength && (
                    <>Brand Strength: <strong>{data.brandStrength.score}/100</strong></>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Traffic Quality Metrics */}
          {data.qualityMetrics && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Eye className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Traffic Quality Analysis - Grade: <span className="text-lg font-bold">{data.qualityMetrics.qualityGrade}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                    <div>Engagement: {data.qualityMetrics.engagementScore}/100</div>
                    <div>Conversion Potential: {data.qualityMetrics.conversionPotential}/100</div>
                    <div>Est. Bounce Rate: {data.qualityMetrics.estimatedMetrics.bounceRate}%</div>
                    <div>Est. Session Time: {Math.round(data.qualityMetrics.estimatedMetrics.avgSessionDuration / 60)}min</div>
                  </div>
                  {data.qualityMetrics.insights.strengths.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      <strong>Key Strength:</strong> {data.qualityMetrics.insights.strengths[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Technical SEO Impact */}
          {data.technicalImpact && (
            <div className={`border rounded-lg p-4 ${
              data.technicalImpact.trafficImpactPercentage > 15 ? 'bg-red-50 border-red-200' :
              data.technicalImpact.trafficImpactPercentage > 5 ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  data.technicalImpact.trafficImpactPercentage > 15 ? 'text-red-600' :
                  data.technicalImpact.trafficImpactPercentage > 5 ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${
                    data.technicalImpact.trafficImpactPercentage > 15 ? 'text-red-900' :
                    data.technicalImpact.trafficImpactPercentage > 5 ? 'text-yellow-900' :
                    'text-green-900'
                  }`}>
                    Technical SEO Impact: {data.technicalImpact.trafficImpactPercentage}% Traffic at Risk
                  </p>
                  <div className={`grid grid-cols-2 gap-2 text-xs ${
                    data.technicalImpact.trafficImpactPercentage > 15 ? 'text-red-700' :
                    data.technicalImpact.trafficImpactPercentage > 5 ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    <div>Technical Health: {data.technicalImpact.overallImpactScore}/100</div>
                    <div>Potential Loss: {data.technicalImpact.estimatedTrafficLoss.toLocaleString()} visits</div>
                    <div>Mobile Score: {data.technicalImpact.mobileOptimization.score}/100</div>
                    <div>Core Web Vitals: {data.technicalImpact.coreWebVitals.score}/100</div>
                  </div>
                  {data.technicalImpact.prioritizedFixes.length > 0 && (
                    <p className={`text-xs mt-2 ${
                      data.technicalImpact.trafficImpactPercentage > 15 ? 'text-red-600' :
                      data.technicalImpact.trafficImpactPercentage > 5 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      <strong>Top Fix:</strong> {data.technicalImpact.prioritizedFixes[0].title} 
                      (+{data.technicalImpact.prioritizedFixes[0].expectedGain}% traffic)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Key Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`mt-0.5 ${
                  rec.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                    <div className="flex items-center gap-2">
                      {rec.impact && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          rec.impact === 'High' ? 'bg-green-100 text-green-700' :
                          rec.impact === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rec.impact} Impact
                        </span>
                      )}
                      {rec.priority === 'high' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statement */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Summary:</strong> Your website receives approximately{' '}
          <strong>{totalTraffic.toLocaleString()}</strong> monthly visitors with{' '}
          <strong>{organicPercentage}%</strong> from organic search.{' '}
          {data.brandStrength?.score > 50 
            ? 'Your brand shows strong recognition with ' 
            : 'There is opportunity to improve brand visibility with '}
          <strong>{brandedPercentage}%</strong> branded traffic.{' '}
          {data.trafficPotential?.growthTrend === 'growing' || data.trafficPotential?.growthTrend === 'rapid-growth'
            ? 'The positive growth trend indicates healthy momentum.'
            : data.trafficPotential?.growthTrend === 'stable'
            ? 'Traffic remains stable with room for growth initiatives.'
            : 'Focus on the recommendations above to improve traffic performance.'}
        </p>
      </div>
    </div>
  );
}