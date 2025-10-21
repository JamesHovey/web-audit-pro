'use client';

import React from 'react';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Settings,
  Award,
  BarChart3,
  Rocket,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';
import { getPluginInfo } from '@/lib/pluginUrlService';
import Tooltip from './Tooltip';

interface TechnologyStackConclusionProps {
  data: any;
}

export default function TechnologyStackConclusion({ data }: TechnologyStackConclusionProps) {
  // Check if we have Advanced analysis enhanced data
  const hasAIAnalysis = data?.enhancedWithAI && data?.technologyIntelligence;

  if (!hasAIAnalysis) {
    return null; // Don't show component if no AI analysis available
  }

  const intelligence = data.technologyIntelligence;
  const stackAnalysis = intelligence.stackAnalysis;
  const performanceImpact = intelligence.performanceImpact;
  const securityAssessment = intelligence.securityAssessment;
  const businessImpact = intelligence.businessImpact;
  
  // Plugin analysis data
  const pluginAnalysis = data.pluginAnalysis;
  const hasPluginAnalysis = pluginAnalysis && 
    typeof pluginAnalysis.totalPluginsDetected === 'number' && 
    pluginAnalysis.totalPluginsDetected > 0 &&
    pluginAnalysis.pluginsByCategory;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#27ae60]'; // PMW complementary green
    if (score >= 60) return 'text-[#42499c]'; // PMW blue
    if (score >= 40) return 'text-[#e67e22]'; // PMW complementary orange
    return 'text-[#c42e3b]'; // PMW complementary red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical Issues';
  };

  const getMaturityColor = (level: string) => {
    switch (level) {
      case 'modern': return 'bg-[#27ae60]/10 text-[#27ae60]'; // PMW complementary green
      case 'stable': return 'bg-[#42499c]/10 text-[#42499c]'; // PMW blue
      case 'outdated': return 'bg-[#e67e22]/10 text-[#e67e22]'; // PMW complementary orange
      case 'legacy': return 'bg-[#c42e3b]/10 text-[#c42e3b]'; // PMW complementary red
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-[#27ae60]/10 text-[#27ae60]'; // PMW complementary green
      case 'medium': return 'bg-[#e67e22]/10 text-[#e67e22]'; // PMW complementary orange
      case 'high': return 'bg-[#c42e3b]/10 text-[#c42e3b]'; // PMW complementary red
      case 'critical': return 'bg-[#c42e3b]/20 text-[#c42e3b]'; // PMW complementary red (darker)
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceCostColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'text-[#27ae60]'; // PMW complementary green
      case 'medium': return 'text-[#e67e22]'; // PMW complementary orange
      case 'high': return 'text-[#c42e3b]'; // PMW complementary red
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-[#42499c]" />
        Technology Intelligence
        <Tooltip 
          content={
            <div>
              <p className="font-semibold mb-2">Technology Intelligence</p>
              <p className="mb-2">Automated analysis of your website's technology stack and security posture.</p>
              <div className="text-xs space-y-1">
                <p><strong>Stack Health:</strong> Overall technology score and recommendations</p>
                <p><strong>Performance Impact:</strong> How your tech choices affect site speed</p>
                <p><strong>Security Assessment:</strong> Potential vulnerabilities and risks</p>
                <p><strong>Plugin Analysis:</strong> Detailed breakdown of detected plugins</p>
                <p><strong>Optimization Tips:</strong> Actionable improvements for better performance</p>
              </div>
            </div>
          }
          position="top"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
        </Tooltip>
      </h3>

      {/* Overall Technology Health */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Technology Stack Health</span>
          <span className={`text-2xl font-bold ${getScoreColor(stackAnalysis.overallScore)}`}>
            {stackAnalysis.overallScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              stackAnalysis.overallScore >= 80 ? 'bg-[#27ae60]' :
              stackAnalysis.overallScore >= 60 ? 'bg-[#42499c]' :
              stackAnalysis.overallScore >= 40 ? 'bg-[#e67e22]' : 'bg-[#c42e3b]'
            }`}
            style={{ width: `${stackAnalysis.overallScore}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${getScoreColor(stackAnalysis.overallScore)}`}>
            {getScoreLabel(stackAnalysis.overallScore)}
          </p>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMaturityColor(stackAnalysis.maturityLevel)}`}>
            {stackAnalysis.maturityLevel.charAt(0).toUpperCase() + stackAnalysis.maturityLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#c42e3b]" />
            <span className="text-xs text-gray-500">Security</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${getScoreColor(securityAssessment.securityScore)}`}>
              {securityAssessment.securityScore}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(securityAssessment.riskLevel)}`}>
              {securityAssessment.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#27ae60]" />
            <span className="text-xs text-gray-500">Performance</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {performanceImpact.performanceScore}/100
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#675c9b]" />
            <span className="text-xs text-gray-500">Scalability</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {businessImpact.scalabilityRating}/100
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#42499c]" />
            <span className="text-xs text-gray-500">Maintenance</span>
          </div>
          <div className={`text-lg font-bold ${getMaintenanceCostColor(businessImpact.maintenanceCost)}`}>
            {businessImpact.maintenanceCost.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Architecture Analysis */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-600" />
          Technology Stack Analysis
          <Tooltip 
            content={
              <div>
                <p className="font-semibold mb-2">Technology Stack Analysis</p>
                <p className="mb-2">Detailed breakdown of your website's technical architecture and compatibility.</p>
                <div className="text-xs space-y-1">
                  <p><strong>Architecture Type:</strong> Classification of your technical setup (WordPress, React, etc.)</p>
                  <p><strong>Suitability Rating:</strong> How well your current stack fits your business needs</p>
                  <p><strong>Strengths:</strong> What your technology does well</p>
                  <p><strong>Weaknesses:</strong> Areas needing improvement or modernization</p>
                </div>
              </div>
            }
            position="top"
          >
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </h4>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">
                {stackAnalysis.architectureType}
              </p>
              <p className="text-sm text-blue-700 mb-3">
                {stackAnalysis.suitabilityRating}
              </p>
              
              {stackAnalysis.strengths && stackAnalysis.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Strengths:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {Array.isArray(stackAnalysis.strengths) && stackAnalysis.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {stackAnalysis.weaknesses && stackAnalysis.weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">Areas for Improvement:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {Array.isArray(stackAnalysis.weaknesses) && stackAnalysis.weaknesses.slice(0, 2).map((weakness, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins - Only show if there are actual issues to address */}
      {(() => {
        // Only show Quick Wins if there are actual issues identified
        const hasRealIssues = (
          stackAnalysis.overallScore < 80 || // Stack needs improvement
          securityAssessment.securityScore < 70 || // Security concerns
          performanceImpact.performanceScore < 70 || // Performance issues
          (performanceImpact.criticalIssues && performanceImpact.criticalIssues.length > 0) || // Critical issues exist
          (securityAssessment.vulnerabilities && securityAssessment.vulnerabilities.length > 0) // Vulnerabilities exist
        );

        const hasQuickWins = intelligence.quickWins && intelligence.quickWins.length > 0;

        // Only show the section if we have both issues AND quick wins
        if (!hasRealIssues || !hasQuickWins) {
          return null;
        }

        return (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[#27ae60]" />
              Quick Technology Wins
              <Tooltip
                content={
                  <div>
                    <p className="font-semibold mb-2">Quick Technology Wins</p>
                    <p className="mb-2">High-impact improvements identified for your website based on the technology audit.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Contextual:</strong> Specific to your technology stack and issues found</p>
                      <p><strong>High Impact:</strong> Changes that provide significant benefits</p>
                      <p><strong>Actionable:</strong> Clear recommendations you can implement</p>
                    </div>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h4>
            <div className="space-y-3">
              {Array.isArray(intelligence.quickWins) && intelligence.quickWins.slice(0, 3).map((win, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#27ae60]/5 rounded-lg border border-[#27ae60]/20">
                  <CheckCircle className="w-5 h-5 text-[#27ae60] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-[#27ae60] mb-1">{win.title}</h5>
                    <p className="text-sm text-[#27ae60] mb-2">{win.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#27ae60]">
                      <span><TrendingUp className="w-3 h-3 inline mr-1" />Impact: {win.estimatedImpact}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Performance Audit Recommendation */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-900 mb-2">Want More Optimization Ideas?</h5>
                    <p className="text-sm text-blue-700 mb-3">
                      Run a <strong>Performance &amp; Technical Audit</strong> to get detailed, step-by-step optimization recommendations with specific plugin instructions.
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded">
                      💡 <strong>Tip:</strong> The Performance audit provides plugin-specific instructions for WP Rocket, Autoptimize, W3 Total Cache, and page builders like Elementor.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Critical Issues */}
      {(performanceImpact.criticalIssues?.length > 0 || securityAssessment.vulnerabilities?.length > 0) && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Critical Issues to Address
            <Tooltip 
              content={
                <div>
                  <p className="font-semibold mb-2">Critical Issues to Address</p>
                  <p className="mb-2">High-priority technical problems that need immediate attention.</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Performance Issues:</strong> Technical problems slowing down your website</p>
                    <p><strong>Security Concerns:</strong> Vulnerabilities that could compromise your site</p>
                    <p><strong>Business Impact:</strong> How these issues affect your visitors and conversions</p>
                    <p><strong>Urgency:</strong> Problems that should be fixed as soon as possible</p>
                  </div>
                </div>
              }
              position="top"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </h4>
          <div className="space-y-3">
            {Array.isArray(performanceImpact.criticalIssues) && performanceImpact.criticalIssues.slice(0, 2).map((issue, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">Performance Issue</p>
                    <p className="text-sm text-red-700">{issue}</p>
                  </div>
                </div>
              </div>
            ))}
            {Array.isArray(securityAssessment.vulnerabilities) && securityAssessment.vulnerabilities.slice(0, 2).map((vulnerability, index) => (
              <div key={`sec-${index}`} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">Security Concern</p>
                    <p className="text-sm text-orange-700">{vulnerability}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Plugin Analysis */}
      {hasPluginAnalysis && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#675c9b]" />
            Plugin Analysis ({pluginAnalysis.totalPluginsDetected} detected)
            <Tooltip 
              content={
                <div>
                  <p className="font-semibold mb-2">Plugin Analysis</p>
                  <p className="mb-2">Comprehensive breakdown of all detected plugins and extensions on your website.</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Plugin Categories:</strong> Grouped by functionality (Security, Performance, SEO, etc.)</p>
                    <p><strong>Security Risk:</strong> Assessment of potential vulnerabilities</p>
                    <p><strong>Performance Impact:</strong> How plugins affect your site speed</p>
                    <p><strong>Business Insights:</strong> What your plugin choices reveal about your business</p>
                    <p><strong>Conflicts:</strong> Redundant or potentially conflicting plugins</p>
                  </div>
                </div>
              }
              position="top"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </h4>
          
          {/* Plugin Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {pluginAnalysis.pluginsByCategory && Object.entries(pluginAnalysis.pluginsByCategory).map(([category, plugins]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category.replace('-', ' ')}
                  </span>
                  <span className="text-xs bg-[#42499c]/10 text-[#42499c] px-2 py-1 rounded-full">
                    {Array.isArray(plugins) ? plugins.length : 0}
                  </span>
                </div>
                <div className="space-y-1">
                  <>
                    {Array.isArray(plugins) && plugins.slice(0, 3).map((plugin, index) => {
                      const pluginInfo = getPluginInfo(plugin.name);
                      return (
                        <div key={index} className="text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            {pluginInfo.url ? (
                              <a 
                                href={pluginInfo.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {plugin.name}
                              </a>
                            ) : (
                              <span className="font-medium">{plugin.name}</span>
                            )}
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              plugin.confidence === 'high' ? 'bg-[#27ae60]/10 text-[#27ae60]' :
                              plugin.confidence === 'medium' ? 'bg-[#e67e22]/10 text-[#e67e22]' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {plugin.confidence}
                            </span>
                          </div>
                          {plugin.version && plugin.version !== '[Unable to detect]' && (
                            <div className="text-xs text-gray-500">v{plugin.version}</div>
                          )}
                        </div>
                      );
                    })}
                    {Array.isArray(plugins) && plugins.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{plugins.length - 3} more
                      </div>
                    )}
                  </>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Security Assessment */}
            <div className="bg-[#c42e3b]/5 rounded-lg p-4 border border-[#c42e3b]/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#c42e3b]" />
                <span className="text-sm font-medium text-[#c42e3b]">Security Risk</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(pluginAnalysis.securityAssessment?.overallRisk || 'low')}`}>
                  {(pluginAnalysis.securityAssessment?.overallRisk || 'low').toUpperCase()}
                </span>
              </div>
              {Array.isArray(pluginAnalysis.securityAssessment?.vulnerablePlugins) && pluginAnalysis.securityAssessment.vulnerablePlugins.length > 0 ? (
                <div className="text-xs text-[#c42e3b]">
                  <p className="mb-1">Vulnerable plugins detected:</p>
                  <ul className="space-y-1">
                    {Array.isArray(pluginAnalysis.securityAssessment.vulnerablePlugins) && pluginAnalysis.securityAssessment.vulnerablePlugins.slice(0, 2).map((plugin, index) => {
                      const pluginInfo = getPluginInfo(plugin.name);
                      return (
                      <li key={index} className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {pluginInfo.url ? (
                          <a 
                            href={pluginInfo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {plugin.name}
                          </a>
                        ) : (
                          <span>{plugin.name}</span>
                        )} ({plugin.riskLevel} risk)
                      </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-[#c42e3b]">No high-risk plugins detected</p>
              )}
            </div>

            {/* Performance Impact */}
            <div className="bg-[#42499c]/5 rounded-lg p-4 border border-[#42499c]/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#42499c]" />
                <span className="text-sm font-medium text-[#42499c]">Performance Impact</span>
              </div>
              {Array.isArray(pluginAnalysis.performanceAnalysis?.heavyPlugins) && pluginAnalysis.performanceAnalysis.heavyPlugins.length > 0 ? (
                <div className="text-xs text-[#42499c]">
                  <p className="mb-1">Heavy plugins:</p>
                  <ul className="space-y-1">
                    {Array.isArray(pluginAnalysis.performanceAnalysis.heavyPlugins) && pluginAnalysis.performanceAnalysis.heavyPlugins.slice(0, 2).map((plugin, index) => {
                      const pluginInfo = getPluginInfo(plugin.name);
                      return (
                      <li key={index} className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pluginInfo.url ? (
                          <a 
                            href={pluginInfo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {plugin.name}
                          </a>
                        ) : (
                          <span>{plugin.name}</span>
                        )} ({plugin.performanceImpact} impact)
                      </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-[#42499c]">No performance-heavy plugins detected</p>
              )}
            </div>
          </div>

          {/* Business Insights */}
          {pluginAnalysis.businessInsights && (
            <div className="bg-[#675c9b]/5 rounded-lg p-4 border border-[#675c9b]/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#675c9b]" />
                <span className="text-sm font-medium text-[#675c9b]">Business Analysis</span>
              </div>
              <div className="text-xs text-[#675c9b] space-y-2">
                <p><strong>Business Type:</strong> {pluginAnalysis.businessInsights.businessType}</p>
                <p><strong>Plugin Purpose:</strong> {pluginAnalysis.businessInsights.pluginPurpose}</p>
                {pluginAnalysis.businessInsights.missingEssentials?.length > 0 && (
                  <div>
                    <p className="font-medium">Missing Essentials:</p>
                    <ul className="ml-2 space-y-1">
                      {Array.isArray(pluginAnalysis.businessInsights.missingEssentials) && pluginAnalysis.businessInsights.missingEssentials.slice(0, 3).map((missing, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#e67e22]" />
                          {missing}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plugin Conflicts */}
          {((Array.isArray(pluginAnalysis.conflicts?.redundantPlugins) && pluginAnalysis.conflicts.redundantPlugins.length > 0) || 
            (Array.isArray(pluginAnalysis.conflicts?.potentialConflicts) && pluginAnalysis.conflicts.potentialConflicts.length > 0)) && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Plugin Conflicts</span>
              </div>
              <div className="text-xs text-yellow-700 space-y-2">
                {Array.isArray(pluginAnalysis.conflicts?.redundantPlugins) && pluginAnalysis.conflicts.redundantPlugins.length > 0 && (
                  <div>
                    <p className="font-medium">Redundant Functionality:</p>
                    <ul className="ml-2">
                      {pluginAnalysis.conflicts.redundantPlugins.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(pluginAnalysis.conflicts?.potentialConflicts) && pluginAnalysis.conflicts.potentialConflicts.length > 0 && (
                  <div>
                    <p className="font-medium">Potential Conflicts:</p>
                    <ul className="ml-2">
                      {pluginAnalysis.conflicts.potentialConflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Industry Benchmark */}
      {intelligence.industryBenchmark && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Industry Comparison
            <Tooltip 
              content={
                <div>
                  <p className="font-semibold mb-2">Industry Comparison</p>
                  <p className="mb-2">How your technology stack compares to industry standards and competitors.</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Market Position:</strong> Where you stand relative to similar businesses</p>
                    <p><strong>Modernization Rank:</strong> How current your technology is</p>
                    <p><strong>Competitive Analysis:</strong> Comparison with industry leaders</p>
                    <p><strong>Recommended Upgrades:</strong> Technologies that could give you an edge</p>
                  </div>
                </div>
              }
              position="top"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </h4>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-2">
                  Market Position: {intelligence.industryBenchmark.modernityRank}
                </p>
                <p className="text-sm text-purple-700 mb-3">
                  {intelligence.industryBenchmark.comparison}
                </p>
                {intelligence.industryBenchmark.recommendedUpgrades?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-purple-900 mb-1">Competitive Improvements:</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      {Array.isArray(intelligence.industryBenchmark.recommendedUpgrades) && intelligence.industryBenchmark.recommendedUpgrades.slice(0, 2).map((upgrade, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          {upgrade}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Impact Summary */}
      <div className="p-4 bg-gradient-to-r from-[#42499c]/5 to-[#675c9b]/5 rounded-lg border border-[#42499c]/20">
        <p className="text-sm text-gray-700">
          <strong>Technology Summary:</strong> Your technology stack scored{' '}
          <strong>{stackAnalysis.overallScore}/100</strong> with a{' '}
          <strong>{stackAnalysis.maturityLevel}</strong> maturity level. 
          {securityAssessment.riskLevel !== 'low' && (
            <> Security risk is <strong>{securityAssessment.riskLevel}</strong> and should be addressed.</>
          )}
          {performanceImpact.estimatedSpeedGain && (
            <> Performance optimizations could achieve <strong>{performanceImpact.estimatedSpeedGain}</strong> improvement.</>
          )}
          {' '}Focus on the quick wins and roadmap above to modernize your technology foundation.
        </p>
      </div>
    </div>
  );
}