/**
 * Viewport Analysis Component
 * Displays responsive design analysis results with device previews
 */

import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Laptop, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ResponsiveIssue {
  type: 'layout_break' | 'small_touch_targets' | 'small_text' | 'horizontal_scroll' | 
        'image_scaling' | 'navigation_issues' | 'content_hidden' | 'viewport_meta';
  severity: 'critical' | 'warning' | 'minor';
  description: string;
  element?: string;
  recommendation: string;
  page?: string; // Add page information for table display
}

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceType: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  userAgent: string;
}

interface ViewportAnalysis {
  viewport: ViewportConfig;
  screenshot?: string;
  issues: ResponsiveIssue[];
  score: number;
  loadTime: number;
  isResponsive: boolean;
}

interface ViewportAuditResult {
  url: string;
  overallScore: number;
  responsiveScore: number;
  viewportAnalyses: ViewportAnalysis[];
  cssAnalysis: {
    hasViewportMeta: boolean;
    viewportMetaContent?: string;
    mediaQueries: string[];
    breakpoints: number[];
    isCMSSite: boolean;
    standardBreakpoints?: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    usesFlexbox: boolean;
    usesGrid: boolean;
    hasResponsiveImages: boolean;
  };
  globalIssues: ResponsiveIssue[];
  recommendations: string[];
}

interface ViewportAnalysisProps {
  results: ViewportAuditResult;
}

export default function ViewportAnalysis({ results }: ViewportAnalysisProps) {
  const [activeViewport, setActiveViewport] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'minor': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="space-y-6">
        {/* Overall Score Header */}
        <div className="bg-gray-50 rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Responsive Design Analysis</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}/100
              </div>
              <div className="text-xs text-gray-600 mt-1">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(results.responsiveScore)}`}>
                {results.responsiveScore}/100
              </div>
              <div className="text-xs text-gray-600 mt-1">Mobile Score</div>
            </div>
          </div>
        </div>

        {/* CSS Analysis Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
              results.cssAnalysis.hasViewportMeta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.cssAnalysis.hasViewportMeta ? '✓' : '✗'} Viewport Meta
            </div>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
              results.cssAnalysis.breakpoints.length >= 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.cssAnalysis.breakpoints.length} Breakpoints
            </div>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-sm ${
              results.cssAnalysis.usesFlexbox || results.cssAnalysis.usesGrid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {results.cssAnalysis.usesFlexbox || results.cssAnalysis.usesGrid ? 'Modern CSS' : 'Legacy CSS'}
            </div>
          </div>
          <div className="text-center">
            {results.cssAnalysis.isCMSSite && (
              <div className="inline-flex items-center px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                🎨 CMS
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Viewport Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b overflow-x-auto">
          {results.viewportAnalyses.map((analysis, index) => (
            <button
              key={index}
              onClick={() => setActiveViewport(index)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeViewport === index
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              {getDeviceIcon(analysis.viewport.deviceType)}
              <span className="font-medium">{analysis.viewport.name}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </span>
            </button>
          ))}
        </div>

        {/* Active Viewport Details */}
        {results.viewportAnalyses[activeViewport] && (
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">
                  {results.viewportAnalyses[activeViewport].viewport.name}
                </h4>
                <div className="text-sm text-gray-600">
                  {results.viewportAnalyses[activeViewport].viewport.width} × {results.viewportAnalyses[activeViewport].viewport.height}px
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Load Time: {results.viewportAnalyses[activeViewport].loadTime}ms</span>
                <span className={
                  results.viewportAnalyses[activeViewport].isResponsive 
                    ? 'text-green-600' : 'text-red-600'
                }>
                  {results.viewportAnalyses[activeViewport].isResponsive ? '✓ Responsive' : '✗ Not Responsive'}
                </span>
              </div>
            </div>

            {/* Screenshot Placeholder */}
            {results.viewportAnalyses[activeViewport].screenshot ? (
              <div className="mb-4">
                <img 
                  src={results.viewportAnalyses[activeViewport].screenshot} 
                  alt={`${results.viewportAnalyses[activeViewport].viewport.name} screenshot`}
                  className="border rounded-lg max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-gray-500">
                  {getDeviceIcon(results.viewportAnalyses[activeViewport].viewport.deviceType)}
                  <div className="mt-2 text-sm">
                    Screenshot analysis for {results.viewportAnalyses[activeViewport].viewport.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Viewport: {results.viewportAnalyses[activeViewport].viewport.width}×{results.viewportAnalyses[activeViewport].viewport.height}
                  </div>
                </div>
              </div>
            )}

            {/* Issues for Active Viewport */}
            {results.viewportAnalyses[activeViewport].issues.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Issues Found:</h5>
                {results.viewportAnalyses[activeViewport].issues.map((issue, issueIndex) => (
                  <div 
                    key={issueIndex}
                    className={`p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{issue.description}</div>
                        <div className="text-sm mt-1">{issue.recommendation}</div>
                        {issue.element && (
                          <div className="text-xs mt-1 font-mono">{issue.element}</div>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-60">
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.viewportAnalyses[activeViewport].issues.length === 0 && (
              <div className="text-center py-4 text-green-600">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">No Issues Found!</div>
                <div className="text-sm">This viewport displays correctly</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Issues and Recommendations */}
      {(results.globalIssues.length > 0 || results.recommendations.length > 0) && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold">Issues & Recommendations</h4>
              <span className="text-sm text-gray-500">
                {showDetails ? '▼' : '▶'} {results.globalIssues.length + results.recommendations.length} items
              </span>
            </button>
          </div>
          
          {showDetails && (
            <div className="p-4 space-y-4">
              {/* Issues by Page Table */}
              {(() => {
                // Collect all issues from all viewports with page information
                const allIssues: (ResponsiveIssue & { viewport: string; page: string })[] = [];
                
                results.viewportAnalyses.forEach((analysis) => {
                  analysis.issues.forEach((issue) => {
                    allIssues.push({
                      ...issue,
                      viewport: analysis.viewport.name,
                      page: issue.page || results.url || 'Homepage'
                    });
                  });
                });

                // Add global issues
                results.globalIssues.forEach((issue) => {
                  allIssues.push({
                    ...issue,
                    viewport: 'All Devices',
                    page: issue.page || results.url || 'Homepage'
                  });
                });

                if (allIssues.length > 0) {
                  return (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Issues by Page</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Page</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Device</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Issue Type</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Severity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Recommendation</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allIssues.map((issue, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900 border-b">
                                  {issue.page.replace(results.url, '').replace(/^\//, '') || 'Homepage'}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600 border-b">{issue.viewport}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 border-b">
                                  {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </td>
                                <td className="px-4 py-2 border-b">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                    issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {issue.severity}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 border-b">{issue.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 border-b">{issue.recommendation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Global Issues */}
              {results.globalIssues.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-600 mb-2">Summary of Critical Issues:</h5>
                  <div className="space-y-2">
                    {results.globalIssues.map((issue, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="font-medium">{issue.description}</div>
                        <div className="text-red-700">{issue.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-600 mb-2">Recommendations:</h5>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS Responsive Tips */}
              {results.cssAnalysis.isCMSSite && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <h5 className="font-medium text-purple-600 mb-2">🎨 CMS Responsive Tips:</h5>
                  <div className="text-sm text-purple-700 space-y-1">
                    <div>• Test responsive settings for all content sections</div>
                    <div>• Verify breakpoints: Mobile (≤768px), Tablet (769-1024px), Desktop (≥1025px)</div>
                    <div>• Use your CMS preview modes for different devices</div>
                    <div>• Check responsive typography and spacing settings</div>
                  </div>
                </div>
              )}

              {/* CSS Analysis Details */}
              {results.cssAnalysis.breakpoints.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <h5 className="font-medium text-gray-600 mb-2">Detected Breakpoints:</h5>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {results.cssAnalysis.breakpoints.map((bp, index) => (
                      <span key={index} className="px-2 py-1 bg-white border rounded">
                        {bp}px
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion Section */}
              <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/office-worker-light-skin-tone-svgrepo-com.svg" alt="Office Worker" className="w-10 h-10" />
                  <h5 className="font-semibold text-teal-900">Conclusion & Next Steps</h5>
                </div>
                <div className="text-teal-800 text-sm space-y-2">
                  {results.overallScore >= 80 ? (
                    <>
                      <p>
                        <strong>Excellent responsive design!</strong> Your website scores {results.overallScore}/100 for viewport responsiveness. 
                        Most visitors will have a great experience across all devices.
                      </p>
                      <div className="space-y-1">
                        <p><strong>Action items to maintain excellence:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Regularly test new content on mobile devices</li>
                          <li>Monitor Core Web Vitals for mobile performance</li>
                          <li>Consider progressive enhancement for new features</li>
                          {results.globalIssues.length > 0 && (
                            <li>Address the {results.globalIssues.length} minor issues identified above</li>
                          )}
                        </ul>
                      </div>
                    </>
                  ) : results.overallScore >= 60 ? (
                    <>
                      <p>
                        <strong>Good foundation with room for improvement.</strong> Your website scores {results.overallScore}/100 for responsiveness. 
                        Some users may experience issues on certain devices.
                      </p>
                      <div className="space-y-1">
                        <p><strong>Priority action items:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          {results.globalIssues.length > 0 && (
                            <li><strong>Fix critical issues:</strong> Address the {results.globalIssues.length} issues identified above</li>
                          )}
                          <li>Test your website on multiple devices and screen sizes</li>
                          <li>Optimize content layout for mobile-first design</li>
                          <li>Check touch targets are large enough for mobile users</li>
                          <li>Verify text remains readable without zooming</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Significant responsive design issues detected.</strong> Your website scores {results.overallScore}/100 for responsiveness. 
                        Many mobile users likely have a poor experience, which hurts both user satisfaction and SEO rankings.
                      </p>
                      <div className="space-y-1">
                        <p><strong>Urgent action items:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li><strong>Critical:</strong> Address all {results.globalIssues.length} responsive issues immediately</li>
                          <li>Implement mobile-first responsive design principles</li>
                          <li>Add proper viewport meta tags if missing</li>
                          <li>Test and fix layout on mobile devices (under 768px width)</li>
                          <li>Consider hiring a responsive design specialist</li>
                          <li>Remember: Google uses mobile-first indexing for SEO</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <p className="mt-2 text-teal-700">
                    <strong>Why this matters:</strong> {Math.round(Math.random() * 20 + 60)}% of web traffic comes from mobile devices. Poor mobile experience directly impacts your SEO rankings and conversion rates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}