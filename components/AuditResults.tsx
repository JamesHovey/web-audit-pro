"use client"

import React, { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import LoadingMessages from "@/components/LoadingMessages"
import { HelpCircle, ArrowLeft, ChevronDown, ChevronRight, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Tooltip from './Tooltip'
import KeywordTable from './KeywordTable'
import BrandedKeywordTable from './BrandedKeywordTable'
import NonBrandedKeywordTable from './NonBrandedKeywordTable'
import AboveFoldCompetitorTable from './AboveFoldCompetitorTable'
import KeywordCompetitionTable from './KeywordCompetitionTable'
import RecommendedKeywordTable from './RecommendedKeywordTable'
import PaidAdvertisingOpportunities from './PaidAdvertisingOpportunities'
import { PMWLogo } from './PMWLogo'
import { PageDetailsModal } from './PageDetailsModal'
import OverallAuditConclusion from './OverallAuditConclusion'
import PerformanceTechnicalConclusion from './PerformanceTechnicalConclusion'
import TechnologyStackConclusion from './TechnologyStackConclusion'
import KeywordAnalysisConclusion from './KeywordAnalysisConclusion'
import CompetitionAnalysis from './CompetitionAnalysis'
import EnhancedRecommendations from './EnhancedRecommendations'
// import AuditSummary from './AuditSummary' // DISABLED: Claude API temporarily disabled

interface Audit {
  id: string
  url: string
  status: string
  sections: string[]
  results?: Record<string, unknown>
  createdAt: string
  completedAt?: string
}

interface AuditResultsProps {
  audit: Audit
}

const INSPIRATIONAL_QUOTES = [
  "Great SEO is a marathon, not a sprint. Stay consistent and patient.",
  "Every website has potential waiting to be unlocked.",
  "Quality content is the foundation of strong organic traffic.",
  "Your competitors are optimizing right now. Let's get you ahead.",
  "SEO isn't about gaming the system, it's about learning how to play by the rules.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Success in SEO comes from understanding your audience, not just algorithms.",
  "Small improvements compound into remarkable results.",
  "Every click represents a real person looking for answers.",
  "Your website is working 24/7. Make sure it's working smart.",
  "Behind every search is a human with a problem to solve.",
  "Good SEO makes your website easier to understand for both users and search engines.",
  "The journey to page one starts with a single optimization.",
  "Data drives decisions. Insights drive success.",
  "Your content should answer questions before they're asked.",
  "Building authority takes time, but the results last.",
  "Every audit brings you closer to your goals.",
  "Focus on user experience and search rankings will follow.",
  "Technical SEO is the foundation. Content is the house.",
  "Patience and persistence are SEO superpowers."
]

const BACKGROUND_THEMES = [
  {
    name: "Analytics Dashboard",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    pattern: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)"
  },
  {
    name: "SEO Growth",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    pattern: "radial-gradient(circle at 30% 70%, rgba(240, 147, 251, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)"
  },
  {
    name: "Traffic Analysis",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    pattern: "radial-gradient(circle at 25% 25%, rgba(79, 172, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)"
  },
  {
    name: "Technical Audit",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    pattern: "radial-gradient(circle at 60% 40%, rgba(67, 233, 123, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)"
  },
  {
    name: "Keyword Research",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    pattern: "radial-gradient(circle at 50% 20%, rgba(250, 112, 154, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)"
  },
  {
    name: "Performance Metrics",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    pattern: "radial-gradient(circle at 30% 30%, rgba(168, 237, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(254, 214, 227, 0.4) 0%, transparent 50%)"
  },
  {
    name: "Backlink Analysis", 
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    pattern: "radial-gradient(circle at 20% 60%, rgba(255, 236, 210, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 40%, rgba(252, 182, 159, 0.4) 0%, transparent 50%)"
  }
]

const SECTION_LABELS = {
  traffic: "Traffic Insights",
  keywords: "Keywords",
  performance: "Performance & Technical Audit", 
  backlinks: "Authority & Backlinks",
  technical: "Performance & Technical Audit",
  technology: "Technology Stack"
}

export function AuditResults({ audit: initialAudit }: AuditResultsProps) {
  const router = useRouter()
  const [audit, setAudit] = useState(initialAudit)
  const [isPolling, setIsPolling] = useState(audit.status === "pending" || audit.status === "running")
  const [isHydrated, setIsHydrated] = useState(false)
  const [showResults, setShowResults] = useState(audit.status === "completed")
  const [currentQuote, setCurrentQuote] = useState(INSPIRATIONAL_QUOTES[0])
  const [currentTheme, setCurrentTheme] = useState(BACKGROUND_THEMES[0])
  const [showTrafficExplanation, setShowTrafficExplanation] = useState(false)
  const [showTechnologyExplanation, setShowTechnologyExplanation] = useState(false)
  const [showCoreWebVitalsGuide, setShowCoreWebVitalsGuide] = useState(false)
  const [showNonBrandedKeywordsGuide, setShowNonBrandedKeywordsGuide] = useState(false)
  const [showMethodologyExpanded, setShowMethodologyExpanded] = useState<{[key: string]: boolean}>({
    traffic: false,
    performance: false,
    technical: false,
    technology: false,
    backlinks: false,
    keywords: false
  })
  const [pageModalState, setPageModalState] = useState<{
    isOpen: boolean;
    title: string;
    pages: unknown[];
    filterCondition?: (page: unknown) => boolean;
  }>({
    isOpen: false,
    title: '',
    pages: [],
    filterCondition: undefined
  })
  const [performancePagination, setPerformancePagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  })
  const [internalLinksModal, setInternalLinksModal] = useState<{ isOpen: boolean; targetPage: string; links: string[] }>({
    isOpen: false,
    targetPage: '',
    links: []
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const toggleMethodology = (section: string) => {
    setShowMethodologyExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Rotate inspirational quotes and background themes during loading
  useEffect(() => {
    if (!isPolling || showResults) return
    
    // Set initial random quote and theme
    setCurrentQuote(INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)])
    setCurrentTheme(BACKGROUND_THEMES[Math.floor(Math.random() * BACKGROUND_THEMES.length)])
    
    // Rotate quotes every 3 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote(INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)])
    }, 3000)
    
    // Rotate background themes every 5 seconds (slower than quotes)
    const themeInterval = setInterval(() => {
      setCurrentTheme(BACKGROUND_THEMES[Math.floor(Math.random() * BACKGROUND_THEMES.length)])
    }, 5000)
    
    return () => {
      clearInterval(quoteInterval)
      clearInterval(themeInterval)
    }
  }, [isPolling, showResults])

  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/audit/${audit.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const responseText = await response.text()
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server')
        }
        
        let updatedAudit
        try {
          updatedAudit = JSON.parse(responseText)
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError)
          console.error('Response text:', responseText)
          throw new Error(`Invalid JSON response: ${parseError.message}`)
        }
        
        setAudit(updatedAudit)
        
        if (updatedAudit.status === "completed" || updatedAudit.status === "failed") {
          setIsPolling(false)
          // Wait a moment for the final update to settle, then show results
          if (updatedAudit.status === "completed") {
            setTimeout(() => {
              setShowResults(true)
            }, 500)
          } else {
            setShowResults(true)
          }
        }
      } catch (error) {
        console.error("Error polling audit status:", error)
        // Stop polling if there are persistent errors
        setIsPolling(false)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [audit.id, isPolling])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "failed":
        return "text-red-600 bg-red-50"
      case "running":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Queued"
      case "running":
        return "Running"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with all controls inline - HIDDEN: Using main page header */}
      <div className="hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left side - Navigation and Status */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                {getStatusText(audit.status)}
              </span>
              {isPolling && <LoadingSpinner size="sm" />}
            </div>
            
            <div className="text-xs text-gray-600 flex gap-4">
              <span>Started: {new Date(audit.createdAt).toLocaleString('en-GB', { 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit'
              })}</span>
              {audit.completedAt && (
                <span>Completed: {new Date(audit.completedAt).toLocaleString('en-GB', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}</span>
              )}
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sitemapUrl = `/sitemap?domain=${encodeURIComponent(audit.url)}`;
                window.open(sitemapUrl, '_blank');
              }}
              className="btn-pmw-secondary text-xs px-3 py-2"
            >
              <Globe className="w-4 h-4" />
              <span>View Sitemap</span>
            </button>
            
            {audit.status === "completed" && (
              <>
                <button 
                  onClick={() => {
                    try {
                      console.log('Main PDF export clicked - exporting full audit');
                      
                      const targetUrl = new URL(audit.url);
                      const domain = targetUrl.hostname;
                      const currentDate = new Date();
                      
                      const printContent = `
                        <html>
                          <head>
                            <title>SEO Audit Report - ${domain}</title>
                            <style>
                              @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                                .page-break { page-break-before: always; }
                              }
                              body { 
                                font-family: Arial, sans-serif; 
                                margin: 20px; 
                                line-height: 1.4;
                                color: #333;
                                font-size: 12px;
                              }
                              .header { 
                                text-align: center; 
                                margin-bottom: 30px; 
                                border-bottom: 2px solid #333;
                                padding-bottom: 20px;
                              }
                              .title { 
                                font-size: 24px; 
                                font-weight: bold; 
                                color: #2563eb;
                                margin: 0;
                              }
                              .subtitle { 
                                font-size: 16px; 
                                color: #666; 
                                margin: 5px 0 0 0;
                              }
                              .audit-info {
                                background: #f8f9fa;
                                padding: 15px;
                                border-radius: 5px;
                                margin: 20px 0;
                                border-left: 4px solid #2563eb;
                              }
                              .section {
                                margin: 25px 0;
                                padding: 15px 0;
                                border-bottom: 1px solid #eee;
                              }
                              .section-title {
                                font-size: 18px;
                                font-weight: bold;
                                color: #333;
                                margin-bottom: 15px;
                                border-bottom: 2px solid #e5e7eb;
                                padding-bottom: 5px;
                              }
                              .metric-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                                gap: 15px;
                                margin: 15px 0;
                              }
                              .metric-card {
                                background: white;
                                border: 1px solid #e5e7eb;
                                border-radius: 5px;
                                padding: 15px;
                                text-align: center;
                              }
                              .metric-value {
                                font-size: 24px;
                                font-weight: bold;
                                color: #2563eb;
                                margin-bottom: 5px;
                              }
                              .metric-label {
                                font-size: 12px;
                                color: #666;
                                text-transform: uppercase;
                                font-weight: 500;
                              }
                              table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 15px 0;
                                font-size: 11px;
                              }
                              th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                              }
                              th {
                                background-color: #f8f9fa;
                                font-weight: bold;
                                color: #333;
                              }
                              .keyword-row {
                                background: #f9f9f9;
                              }
                              .tech-badge {
                                display: inline-block;
                                background: #e5e7eb;
                                color: #374151;
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 10px;
                                margin: 2px;
                              }
                              .footer {
                                margin-top: 40px;
                                text-align: center;
                                font-size: 10px;
                                color: #666;
                                border-top: 1px solid #eee;
                                padding-top: 20px;
                              }
                              .watermark {
                                position: fixed;
                                bottom: 20px;
                                right: 20px;
                                font-size: 10px;
                                color: #999;
                                transform: rotate(-45deg);
                                opacity: 0.3;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="watermark">Web Audit Pro</div>
                            <div class="header">
                              <div class="title">SEO Audit Report</div>
                              <div class="subtitle">${domain}</div>
                            </div>
                            
                            <div class="audit-info">
                              <p><strong>Website:</strong> ${audit.url}</p>
                              <p><strong>Audit Date:</strong> ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}</p>
                              <p><strong>Report Generated:</strong> ${currentDate.toLocaleString()}</p>
                              <p><strong>Sections Analyzed:</strong> ${audit.sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                            </div>
                            
                            ${audit.results ? Object.entries(audit.results).map(([section, data]) => {
                              if (!data || section === 'completedSections') return '';
                              
                              let sectionContent = '';
                              const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1');
                              
                              // Handle different section types
                              if (section === 'keywords' && typeof data === 'object') {
                                const keywordData = data as any;
                                sectionContent = `
                                  <div class="metric-grid">
                                    <div class="metric-card">
                                      <div class="metric-value">${keywordData.domainAuthority || 'N/A'}</div>
                                      <div class="metric-label">Domain Authority</div>
                                    </div>
                                    <div class="metric-card">
                                      <div class="metric-value">${keywordData.brandedKeywords || 0}</div>
                                      <div class="metric-label">Branded Keywords</div>
                                    </div>
                                    <div class="metric-card">
                                      <div class="metric-value">${keywordData.nonBrandedKeywords || 0}</div>
                                      <div class="metric-label">Non-Branded Keywords</div>
                                    </div>
                                  </div>
                                  
                                  ${keywordData.topKeywords && keywordData.topKeywords.length > 0 ? `
                                    <h4>Top Keywords Found</h4>
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Keyword</th>
                                          <th>Volume</th>
                                          <th>Position</th>
                                          <th>Type</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${keywordData.topKeywords.slice(0, 20).map((kw: any) => `
                                          <tr>
                                            <td>${kw.keyword || 'N/A'}</td>
                                            <td>${kw.volume || 'N/A'}</td>
                                            <td>${kw.position || 'N/A'}</td>
                                            <td>${kw.type || 'N/A'}</td>
                                          </tr>
                                        `).join('')}
                                      </tbody>
                                    </table>
                                  ` : ''}
                                `;
                              } else if (section === 'backlinks' && typeof data === 'object') {
                                sectionContent = `
                                  <div class="metric-grid">
                                    <div class="metric-card">
                                      <div class="metric-value">${data.domainAuthority || 'N/A'}</div>
                                      <div class="metric-label">Domain Authority</div>
                                    </div>
                                    <div class="metric-card">
                                      <div class="metric-value">${data.totalBacklinks || 'N/A'}</div>
                                      <div class="metric-label">Total Backlinks</div>
                                    </div>
                                    <div class="metric-card">
                                      <div class="metric-value">${data.referringDomains || 'N/A'}</div>
                                      <div class="metric-label">Referring Domains</div>
                                    </div>
                                  </div>
                                `;
                              } else if (section === 'technology' && typeof data === 'object') {
                                const techData = data as any;
                                sectionContent = `
                                  <div>
                                    <h4>Detected Technologies</h4>
                                    <div>
                                      ${techData.cms ? `<span class="tech-badge">CMS: ${techData.cms}</span>` : ''}
                                      ${techData.framework ? `<span class="tech-badge">Framework: ${techData.framework}</span>` : ''}
                                      ${techData.hosting ? `<span class="tech-badge">Hosting: ${techData.hosting}</span>` : ''}
                                      ${techData.analytics && techData.analytics.length > 0 ? 
                                        techData.analytics.map((a: string) => `<span class="tech-badge">Analytics: ${a}</span>`).join('') : ''
                                      }
                                    </div>
                                  </div>
                                `;
                              } else if (typeof data === 'object' && data !== null) {
                                // Generic object handling
                                sectionContent = `
                                  <div class="metric-grid">
                                    ${Object.entries(data).slice(0, 6).map(([key, value]) => `
                                      <div class="metric-card">
                                        <div class="metric-value">${typeof value === 'number' ? value.toLocaleString() : (value || 'N/A')}</div>
                                        <div class="metric-label">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                                      </div>
                                    `).join('')}
                                  </div>
                                `;
                              } else {
                                sectionContent = `<p>${data || 'No data available'}</p>`;
                              }
                              
                              return `
                                <div class="section">
                                  <div class="section-title">${sectionTitle}</div>
                                  ${sectionContent}
                                </div>
                              `;
                            }).join('') : '<p>No audit data available</p>'}
                            
                            <div class="footer">
                              <p>Generated by Web Audit Pro - ${currentDate.toLocaleString()}</p>
                              <p>This report contains comprehensive SEO analysis data for ${domain}</p>
                            </div>
                          </body>
                        </html>
                      `;

                      // Create and open print window
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        
                        // Wait for content to load then trigger print
                        printWindow.onload = () => {
                          setTimeout(() => {
                            printWindow.focus();
                            printWindow.print();
                          }, 500);
                        };
                        
                        console.log('Audit report print dialog opened successfully');
                      } else {
                        console.error('Could not open print window - check pop-up blocker');
                        alert('Could not open print dialog. Please check if pop-ups are blocked.');
                      }
                      
                    } catch (error) {
                      console.error('Error generating audit PDF:', error);
                      alert('Error generating PDF report: ' + error.message);
                    }
                  }}
                  className="bg-[#42499c] hover:bg-[#42499c]/80 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
                >
                  Export PDF
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors">
                  Export Excel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary - DISABLED: Claude API temporarily disabled */}
      {/* {audit.status === "completed" && (
        <AuditSummary 
          auditId={audit.id} 
          isAuditComplete={audit.status === "completed"} 
        />
      )} */}

      {/* Only show results when audit is complete */}
      {showResults ? (
        <>

          {/* Keywords Section - Full Width */}
          {audit?.sections?.includes('keywords') && (
        <div className="card-pmw mb-6">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {SECTION_LABELS['keywords']}
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Keyword Analysis</p>
                      <p className="mb-2">Analyzes what keywords your website ranks for on Google.</p>
                      <div className="text-xs space-y-1">
                        <p><strong>Branded Keywords:</strong> Searches including your company name</p>
                        <p><strong>Non-Branded Keywords:</strong> Generic industry terms you rank for</p>
                        <p><strong>Position:</strong> Where you rank on Google (1-100+)</p>
                        <p><strong>Search Volume:</strong> How many people search this term monthly</p>
                        <p><strong>Competition:</strong> How difficult it is to rank for this keyword</p>
                      </div>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </h3>
              {audit.results?.keywords?.dataSource && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    audit.results.keywords.dataSource === 'valueserp' || audit.results.keywords.dataSource === 'mixed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.results.keywords.dataSource === 'valueserp' && '✓ Real Google Ranking Data'}
                    {audit.results.keywords.dataSource === 'mixed' && '✓ Mixed Real & Estimated Data'}
                    {audit.results.keywords.dataSource === 'estimation' && '⚠ Estimated Data Only'}
                    {audit.results.keywords.searchesUsed && ` (${audit.results.keywords.searchesUsed} searches)`}
                  </span>
                </div>
              )}
            </div>
            
            {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
              <LoadingMessages section="keywords" />
            ) : audit.results?.keywords ? (
              <div className="space-y-4">
                {renderSectionResults('keywords', audit.results.keywords, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined, undefined, audit?.auditType, undefined, undefined)}
                
                {/* Competition Analysis */}
                {(() => {
                  const hasKeywords = !!audit.results.keywords;
                  const hasTopKeywords = !!audit.results.keywords?.topKeywords;
                  const topKeywordsLength = audit.results.keywords?.topKeywords?.length || 0;
                  const hasBrandedOrNonBranded = (audit.results.keywords?.brandedKeywordsList?.length || 0) + (audit.results.keywords?.nonBrandedKeywordsList?.length || 0) > 0;
                  
                  console.log('🔍 Competition Analysis Debug:', {
                    hasKeywords,
                    hasTopKeywords,
                    topKeywordsLength,
                    hasBrandedOrNonBranded,
                    brandedLength: audit.results.keywords?.brandedKeywordsList?.length || 0,
                    nonBrandedLength: audit.results.keywords?.nonBrandedKeywordsList?.length || 0,
                    topKeywordsSample: audit.results.keywords?.topKeywords?.slice(0, 3)
                  });
                  
                  // Try using brandedKeywordsList + nonBrandedKeywordsList if topKeywords is empty
                  const keywordsToUse = (audit.results.keywords?.topKeywords?.length > 0) 
                    ? audit.results.keywords.topKeywords
                    : [...(audit.results.keywords?.brandedKeywordsList || []), ...(audit.results.keywords?.nonBrandedKeywordsList || [])];
                  
                  return keywordsToUse.length > 0 ? (
                    <CompetitionAnalysis 
                      targetDomain={audit.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                      keywords={keywordsToUse}
                    />
                  ) : null;
                })()}
                
                {/* Claude AI Keyword Analysis Conclusion */}
                {audit.results.keywords.claudeAnalysis && (
                  <KeywordAnalysisConclusion analysis={audit.results.keywords.claudeAnalysis} />
                )}
              </div>
            ) : (
              <LoadingMessages section="keywords" />
            )}
          </div>
        </div>
      )}

      {/* Premium Traffic Insights - Full Width */}
      {audit?.sections?.includes('traffic') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.traffic}
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Traffic Insights</p>
                    <p className="mb-2">Shows estimated monthly visitors and how they find your website.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Organic:</strong> Visitors from Google search results</p>
                      <p><strong>Direct:</strong> People typing your URL directly</p>
                      <p><strong>Referral:</strong> Traffic from other websites linking to you</p>
                      <p><strong>Social:</strong> Visitors from social media platforms</p>
                      <p><strong>Geographic data:</strong> Where your visitors are located worldwide</p>
                    </div>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="traffic" />
              ) : (
                // Use original traffic rendering
                renderSectionResults("traffic", audit.results?.traffic || {}, setInternalLinksModal, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined, undefined, audit?.auditType, undefined, undefined)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Technology Stack - Full Width */}
      {audit?.sections?.includes('technology') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.technology}
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Technology Stack</p>
                    <p className="mb-2">Shows what technologies and tools power your website.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Content Management:</strong> WordPress, Shopify, etc.</p>
                      <p><strong>Analytics Tools:</strong> Google Analytics, tracking scripts</p>
                      <p><strong>Hosting & CDN:</strong> Where your site is hosted and cached</p>
                      <p><strong>Plugins & Extensions:</strong> Additional functionality and features</p>
                      <p><strong>Security Tools:</strong> SSL certificates and security services</p>
                    </div>
                  </div>
                }
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="technology" />
              ) : (
                renderSectionResults("technology", audit.results?.technology || {}, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined, undefined, audit?.auditType, undefined, undefined)
              )}
            </div>
            {/* AI-Enhanced Technology Conclusion */}
            {audit.status === "completed" && audit?.results?.technology && (
              <TechnologyStackConclusion 
                data={audit?.results?.technology} 
              />
            )}
          </div>
        </div>
      )}

      {/* Performance & Technical Audit - Full Width */}
      {(audit?.sections?.includes('performance') || audit?.sections?.includes('technical')) && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Performance & Technical Audit
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Performance & Technical Audit</p>
                    <p className="mb-2">Evaluates your website's speed, mobile experience, and technical health.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Core Web Vitals:</strong> Google's user experience metrics</p>
                      <p><strong>Page Speed:</strong> How fast your pages load</p>
                      <p><strong>Mobile Performance:</strong> How well your site works on phones</p>
                      <p><strong>SEO Issues:</strong> Technical problems affecting search rankings</p>
                      <p><strong>Optimization:</strong> Actionable improvements to make your site faster</p>
                    </div>
                  </div>
                }
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="performance" />
              ) : (
                renderSectionResults(
                  audit?.sections?.includes('technical') ? "technical" : "performance", 
                  {...(audit?.results?.performance || {}), ...(audit?.results?.technical || {})}, 
                  undefined, 
                  showMethodologyExpanded, 
                  toggleMethodology, 
                  setPageModalState,
                  performancePagination,
                  setPerformancePagination,
                  setShowCoreWebVitalsGuide,
                  audit?.auditType,
                  audit.results?.technical?.plugins || audit.results?.traffic?.plugins || [],
                  audit.results?.technical?.pageBuilder || audit.results?.traffic?.pageBuilder
                )
              )}
            </div>
          </div>
        </div>
      )}


      {/* Authority & Backlinks - Full Width */}
      {audit?.sections?.includes('backlinks') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.backlinks}
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Authority & Backlinks</p>
                    <p className="mb-2">Shows how authoritative your website is and which sites link to you.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Domain Authority:</strong> Overall strength of your website (0-100)</p>
                      <p><strong>Backlinks:</strong> Other websites linking to your pages</p>
                      <p><strong>Referring Domains:</strong> Number of unique websites linking to you</p>
                      <p><strong>Link Quality:</strong> Authority and relevance of sites linking to you</p>
                      <p><strong>Anchor Text:</strong> The clickable text in links pointing to your site</p>
                    </div>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="backlinks" />
              ) : (
                renderSectionResults("backlinks", audit.results?.backlinks || {}, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined, undefined, audit?.auditType, undefined, undefined)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Sections - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audit?.sections?.filter(section => section !== 'keywords' && section !== 'technology' && section !== 'traffic' && section !== 'performance' && section !== 'technical' && section !== 'backlinks').map((sectionId) => (
          <div key={sectionId} className="card-pmw">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {SECTION_LABELS[sectionId as keyof typeof SECTION_LABELS]}
                {sectionId === 'backlinks' && (
                  <Tooltip 
                    content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-2">Authority & Backlinks Analysis</p>
                        <p className="mb-2">We analyze your website's authority and backlink profile.</p>
                        <p className="mb-2"><strong>Metrics evaluated:</strong></p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Domain Authority score</li>
                          <li>Number of referring domains</li>
                          <li>Total backlinks count</li>
                          <li>High-quality backlink sources</li>
                          <li>Anchor text distribution</li>
                          <li>Link growth over time</li>
                        </ul>
                        <p className="mt-2 text-sm">Quality backlinks are crucial for ranking higher in search results.</p>
                      </div>
                    }
                  >
                    <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                  </Tooltip>
                )}
              </h3>
              
              {!isHydrated ? (
                <LoadingMessages />
              ) : audit.status === "completed" && audit.results?.[sectionId] ? (
                <div className="space-y-4">
                  {/* Section Results */}
                  {renderSectionResults(sectionId, audit.results[sectionId], undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined, undefined, audit?.auditType, undefined, undefined)}
                </div>
              ) : audit.status === "failed" ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Failed to generate results</p>
                </div>
              ) : (
                <LoadingMessages section={sectionId} />
              )}
            </div>
          </div>
        ))}
      </div>
        </>
      ) : (
        /* Loading Modal/Lightbox */
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dynamic Background */}
          <div 
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{
              background: `${currentTheme.gradient}, ${currentTheme.pattern}`,
              backgroundBlendMode: 'overlay'
            }}
          />
          {/* Semi-transparent overlay for readability */}
          <div className="absolute inset-0 bg-white bg-opacity-10" />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-8">
            {audit.status === "running" ? (
              <>
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Analyzing Website</h2>
                <p className="text-gray-600 mb-6 text-center">
                  We're conducting a comprehensive audit of {audit?.sections?.length || 0} sections.
                  This typically takes 1-2 minutes.
                </p>
                
                {/* Inspirational Quote */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <p className="text-center text-gray-700 italic mb-2">
                    "{currentQuote}"
                  </p>
                  <p className="text-center text-xs text-gray-500">
                    Background: {currentTheme.name}
                  </p>
                </div>
                
                {audit.results?._progress && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2 text-center">
                      Processing: <span className="font-semibold">
                        {SECTION_LABELS[audit.results._progress.currentSection as keyof typeof SECTION_LABELS] || audit.results._progress.currentSection}
                      </span> ({audit.results._progress.completedSections}/{audit.results._progress.totalSections})
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(audit.results._progress.completedSections / audit.results._progress.totalSections) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            ) : audit.status === "failed" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-2xl">✕</span>
                </div>
                <p className="text-red-600 text-lg font-semibold mb-4">Audit Failed</p>
                <p className="text-gray-600 mb-6">Something went wrong during the audit. Please try again.</p>
                <button 
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Preparing audit...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Internal Links Modal */}
      {internalLinksModal.isOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Internal Links Pointing to {internalLinksModal.targetPage}</h2>
              <button
                onClick={() => setInternalLinksModal({ isOpen: false, targetPage: '', links: [] })}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {internalLinksModal.links.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => alert('CSV export clicked!')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV (Test)
                  </button>
                  <button
                    onClick={() => {
                      // Export as CSV
                      const csvContent = [
                        'Source Page,Target Page',
                        ...internalLinksModal.links.map(link => {
                          try {
                            const url = new URL(link);
                            const sourcePath = url.pathname === '/' ? '/' : url.pathname;
                            return `"${sourcePath}","${internalLinksModal.targetPage}"`;
                          } catch {
                            return `"${link}","${internalLinksModal.targetPage}"`;
                          }
                        })
                      ].join('\\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `internal-links-${internalLinksModal.targetPage.replace(/[\\/]/g, '-')}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      alert('Button clicked!');
                      console.log('PDF export button clicked!');
                      
                      try {
                        const targetUrl = new URL(internalLinksModal.targetPage);
                        const targetPath = targetUrl.pathname === '/' ? '/' : targetUrl.pathname;
                        
                        console.log('Creating print window for:', targetPath);
                        
                        const printContent = `
                          <html>
                            <head>
                              <title>Internal Links Report - ${targetPath}</title>
                              <style>
                                @media print {
                                  body { margin: 0; }
                                  .no-print { display: none; }
                                }
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                .logo { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
                                .company { font-size: 14px; color: #666; margin-bottom: 15px; }
                                .title { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                th { background-color: #f5f5f5; font-weight: bold; }
                                tr:nth-child(even) { background-color: #f9f9f9; }
                                .details { margin-bottom: 20px; }
                                .details p { margin: 5px 0; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <div class="logo">PMW</div>
                                <div class="company">Professional Marketing & Web Design</div>
                                <div class="title">Internal Links Analysis Report</div>
                              </div>
                              <div class="details">
                                <p><strong>Target Page:</strong> ${targetPath}</p>
                                <p><strong>Domain:</strong> ${targetUrl.hostname}</p>
                                <p><strong>Total Internal Links:</strong> ${internalLinksModal.links.length}</p>
                                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                              </div>
                              <table>
                                <thead>
                                  <tr>
                                    <th style="width: 60px;">#</th>
                                    <th>Source Page</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${internalLinksModal.links.map((link, index) => {
                                    try {
                                      const url = new URL(link);
                                      const sourcePath = url.pathname === '/' ? '/' : url.pathname;
                                      return `<tr><td>${index + 1}</td><td>${sourcePath}</td></tr>`;
                                    } catch {
                                      return `<tr><td>${index + 1}</td><td>${link}</td></tr>`;
                                    }
                                  }).join('')}
                                </tbody>
                              </table>
                              <div class="no-print">
                                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                                  Tip: Use your browser's "Save as PDF" option in the print dialog to save this report as a PDF file.
                                </p>
                              </div>
                            </body>
                          </html>
                        `;
                        
                        console.log('Opening print window...');
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(printContent);
                          printWindow.document.close();
                          printWindow.focus();
                          setTimeout(() => printWindow.print(), 500);
                          console.log('Print dialog opened successfully');
                        } else {
                          console.error('Could not open print window');
                          alert('Could not open print dialog. Please check if pop-ups are blocked.');
                        }
                        
                      } catch (error) {
                        console.error('Error creating PDF export:', error);
                        alert('Error generating PDF report: ' + error.message);
                      }
                    }}
                    className="bg-[#42499c] text-white px-4 py-2 rounded hover:bg-[#42499c]/80 text-sm"
                  >
                    Export PDF
                  </button>
                </div>

                <div className="overflow-y-auto max-h-96 border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Source Page</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {internalLinksModal.links.map((link, index) => {
                        const sourcePath = (() => {
                          try {
                            const url = new URL(link);
                            return url.pathname === '/' ? '/' : url.pathname;
                          } catch {
                            return link;
                          }
                        })();
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm">{sourcePath}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                Visit
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p><strong>About this data:</strong> Shows all pages on the website that contain links pointing to <code className="bg-gray-200 px-1 rounded">{internalLinksModal.targetPage}</code>. This helps understand the internal linking structure and page authority flow.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No internal links found pointing to this page.</p>
                <p className="text-sm mt-2">This page might be orphaned or only accessible through external navigation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Details Modal */}
      <PageDetailsModal
        isOpen={pageModalState.isOpen}
        onClose={() => setPageModalState(prev => ({ ...prev, isOpen: false }))}
        pages={pageModalState.pages}
        title={pageModalState.title}
        filterCondition={pageModalState.filterCondition}
      />

      {/* Core Web Vitals Guide Modal */}
      {showCoreWebVitalsGuide && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">📚 Core Web Vitals: The Complete Guide</h2>
              <button
                onClick={() => setShowCoreWebVitalsGuide(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* What Are Core Web Vitals */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-600 mb-3">🎯 What Are Core Web Vitals?</h3>
                <p className="text-gray-700 mb-2">
                  Think of them as Google's "report card" for how fast and smooth your website feels to real users. 
                  Google uses these scores to decide which websites deserve higher search rankings.
                </p>
                <p className="text-gray-700">
                  <strong>Key Point:</strong> These aren't just numbers - they directly impact how much traffic Google sends to your website!
                </p>
              </div>

              {/* The 3 Key Measurements */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">📊 The 3 Key Measurements</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">🚀 LCP - Largest Contentful Paint (Loading Speed)</h4>
                    <p className="text-gray-600 text-sm mt-1">How fast does the main content load?</p>
                    <div className="mt-2 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">✅ Good: Under 2.5 seconds</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">⚠️ Needs work: 2.5-4 seconds</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Poor: Over 4 seconds</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">📐 CLS - Cumulative Layout Shift (Visual Stability)</h4>
                    <p className="text-gray-600 text-sm mt-1">Does content jump around while loading? (You know, when you try to click something and it moves!)</p>
                    <div className="mt-2 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">✅ Good: Under 0.1</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">⚠️ Needs work: 0.1-0.25</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Poor: Over 0.25</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">⚡ INP - Interaction to Next Paint (Responsiveness)</h4>
                    <p className="text-gray-600 text-sm mt-1">How quickly does the page respond when you click, tap, or type?</p>
                    <div className="mt-2 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">✅ Good: Under 200ms</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-2">⚠️ Needs work: 200-500ms</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Poor: Over 500ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Page-by-Page Matters */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-600 mb-3">🔍 Why Page-by-Page Analysis Matters</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span><strong>Google judges each page separately</strong> - not your whole site as one unit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span><strong>A slow homepage won't hurt your blog page rankings</strong> - they're scored independently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span><strong>Users only care about the page they're on right now</strong> - not your site average</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span><strong>You can fix problems one page at a time</strong> - no need to overhaul everything at once</span>
                  </li>
                </ul>
              </div>

              {/* Real-World Example */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="text-lg font-semibold text-red-600 mb-3">🚨 Real-World Example: Why Averages Are Misleading</h3>
                <div className="bg-white p-4 rounded border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Homepage:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">1.2s ✅ Excellent!</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Product Page:</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">4.8s ❌ Terrible!</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="font-medium">Site Average:</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">3.0s (Misleading!)</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-red-100 rounded">
                  <p className="text-red-800 font-semibold">What Actually Happens:</p>
                  <ul className="text-red-700 text-sm mt-1 space-y-1">
                    <li>• Homepage ranks well in Google ✅</li>
                    <li>• Product page gets buried in search results ❌</li>
                    <li>• You lose sales because customers can't find your products ❌</li>
                    <li>• The "3.0s average" hides this critical problem! ❌</li>
                  </ul>
                </div>
              </div>

              {/* How to Use This Table */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-600 mb-3">✅ How to Use the Page Performance Table</h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <span><strong>Start with the red scores first</strong> - These are your biggest problems that need immediate attention</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <span><strong>Focus on your most important pages</strong> - Homepage, main product/service pages, and high-traffic content</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <span><strong>Fix one page at a time</strong> - Don't try to fix everything at once. Test your changes and measure the results</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <span><strong>Green scores mean you're winning</strong> - Keep doing what you're doing for those pages!</span>
                  </li>
                </ol>
              </div>

              {/* Quick Fixes */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">⚡ Quick Wins to Improve Scores</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-red-600">🚀 Fix LCP (Loading)</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Optimize images</li>
                      <li>• Use faster web hosting</li>
                      <li>• Remove unused plugins</li>
                      <li>• Enable caching</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-yellow-600">📐 Fix CLS (Stability)</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Set image dimensions</li>
                      <li>• Reserve space for ads</li>
                      <li>• Avoid inserting content</li>
                      <li>• Use size attributes</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-green-600">⚡ Fix INP (Clicks)</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Reduce JavaScript</li>
                      <li>• Optimize third-party code</li>
                      <li>• Remove heavy animations</li>
                      <li>• Defer non-critical scripts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  💡 <strong>Pro Tip:</strong> Focus on pages that get the most traffic first for maximum impact on your business.
                </p>
                <button
                  onClick={() => setShowCoreWebVitalsGuide(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Got it, let's optimize! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Keywords Guide Modal */}
      {showNonBrandedKeywordsGuide && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">🎯 Recommended Keywords: The Complete Guide</h2>
              <button
                onClick={() => setShowNonBrandedKeywordsGuide(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* What Are Recommended Keywords */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-600 mb-3">🔍 What Are Recommended Keywords?</h3>
                <p className="text-gray-700 mb-2">
                  These are search terms related to your services or products that <strong>don't include your brand name</strong>. 
                  They're how potential customers find you when they don't know your business exists yet.
                </p>
                <p className="text-gray-700">
                  <strong>Key Point:</strong> These keywords bring you NEW customers, not existing ones who already know your brand!
                </p>
              </div>

              {/* How It Works */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">🔧 How Our Analysis Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">📖 Scrapes Your Website</h4>
                      <p className="text-gray-600 text-sm">Reads your actual website content, headings, and meta descriptions to understand your business.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">🏢 Detects Your Industry</h4>
                      <p className="text-gray-600 text-sm">Figures out if you're a "marketing agency", "law firm", "restaurant", etc. and what services you offer.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">🔍 Generates Relevant Keywords</h4>
                      <p className="text-gray-600 text-sm">Creates industry-specific terms like "digital marketing services" or "personal injury lawyer".</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">📊 Gets Real Search Data</h4>
                      <p className="text-gray-600 text-sm">Uses your Keywords Everywhere API to get real Google search volumes, competition, and cost-per-click data.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Examples by Industry */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-600 mb-4">💡 Examples by Industry</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">🎯 Marketing Agency</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• "digital marketing services"</li>
                      <li>• "SEO company London"</li>
                      <li>• "social media marketing"</li>
                      <li>• "PPC management"</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">⚖️ Law Firm</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• "personal injury lawyer"</li>
                      <li>• "divorce attorney"</li>
                      <li>• "employment law"</li>
                      <li>• "criminal defense"</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">📸 Photography</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• "wedding photographer"</li>
                      <li>• "family portrait photography"</li>
                      <li>• "corporate headshots"</li>
                      <li>• "event photography"</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">🍕 Restaurant</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• "best pizza near me"</li>
                      <li>• "Italian restaurant"</li>
                      <li>• "family dining"</li>
                      <li>• "takeaway food"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Understanding the Data */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-600 mb-4">📈 Understanding Your Data</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">📊 Search Volume</h4>
                    <p className="text-gray-600 text-sm">Monthly searches in your country. Higher = more potential customers, but also more competition.</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">🥊 Competition</h4>
                    <p className="text-gray-600 text-sm">Scale of 0-1. Higher competition = harder to rank, but often means more valuable keywords.</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-800">💰 Cost Per Click (CPC)</h4>
                    <p className="text-gray-600 text-sm">What advertisers pay per click. Higher CPC often means the keyword converts well to sales.</p>
                  </div>
                </div>
              </div>

              {/* How to Use This Data */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-600 mb-4">🚀 How to Use This Data</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-green-600">✅ Target These Keywords</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Medium volume (500-5,000 searches/month)</li>
                      <li>• Low to medium competition (0.1-0.6)</li>
                      <li>• Relevant to your services</li>
                      <li>• Include them in your website content</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-yellow-600">⚠️ Be Careful With These</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Very high competition (0.8+) = very hard to rank</li>
                      <li>• Very low volume (&lt;100/month) = not worth effort</li>
                      <li>• Not relevant to your business = won't convert</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-blue-600">💎 Golden Keywords</h4>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• High volume + low competition = rare gems</li>
                      <li>• High CPC = valuable to target</li>
                      <li>• Location-based = great for local businesses</li>
                      <li>• Question keywords = capture buying intent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  💡 <strong>Pro Tip:</strong> Focus on keywords where you can naturally create helpful content for your audience.
                </p>
                <button
                  onClick={() => setShowNonBrandedKeywordsGuide(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Let's find customers! 🎯
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function renderSectionResults(
  sectionId: string, 
  results: Record<string, unknown>, 
  setInternalLinksModal?: (state: { isOpen: boolean; targetPage: string; links: string[] }) => void,
  showMethodologyExpanded?: {[key: string]: boolean},
  toggleMethodology?: (section: string) => void,
  setPageModalState?: (state: { isOpen: boolean; title: string; pages: any[]; filterCondition?: (page: any) => boolean }) => void,
  performancePagination?: { currentPage: number; itemsPerPage: number },
  setPerformancePagination?: (state: { currentPage: number; itemsPerPage: number } | ((prev: { currentPage: number; itemsPerPage: number }) => { currentPage: number; itemsPerPage: number })) => void,
  setShowCoreWebVitalsGuide?: (show: boolean) => void,
  auditType?: string,
  detectedPlugins?: string[],
  pageBuilder?: string
) {
  switch (sectionId) {
    case "traffic":
      return (
        <div className="space-y-6">
          {/* Traffic Overview */}
          {results.estimationMethod === 'free_scraping' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 text-sm font-medium">
                  Data Confidence: {results.confidence === 'high' ? '🟢 High' : results.confidence === 'medium' ? '🟡 Medium' : '🔴 Low'}
                </span>
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Free Estimation Method</p>
                      <p className="mb-2">This data is estimated using publicly available SEO metrics and machine learning algorithms.</p>
                      <p className="mb-2"><strong>Confidence Factors:</strong></p>
                      <ul className="list-disc list-inside">
                        <li>Domain Authority: {results.metrics?.domainAuthority || 'N/A'}</li>
                        <li>Indexed Pages: {results.metrics?.indexedPages || 'N/A'}</li>
                        <li>Estimated Keywords: {results.metrics?.organicKeywords || 'N/A'}</li>
                      </ul>
                      <p className="mt-2 text-xs">For more accurate data, consider using premium APIs like SimilarWeb or SEMrush.</p>
                    </div>
                  }
                >
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                </Tooltip>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {(() => {
              const totalTraffic = (results.monthlyOrganicTraffic || 0) + (results.monthlyPaidTraffic || 0);
              const organicPercentage = totalTraffic > 0 ? Math.round((results.monthlyOrganicTraffic / totalTraffic) * 100) : 0;
              const paidPercentage = totalTraffic > 0 ? Math.round((results.monthlyPaidTraffic / totalTraffic) * 100) : 0;
              const brandedPercentage = results.monthlyOrganicTraffic > 0 ? Math.round((results.brandedTraffic / results.monthlyOrganicTraffic) * 100) : 0;
              
              return (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.monthlyOrganicTraffic?.toLocaleString('en-GB')}</div>
                    <div className="text-xs text-blue-500 font-medium mb-1">{organicPercentage}% of total traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Organic Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Organic Traffic (12-Month Average)</p>
                      <p className="mb-2"><strong>Time Period:</strong> Average of last 12 months</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who find your website through unpaid search engine results (Google, Bing, etc.)</p>
                      <p className="mb-2"><strong>Estimation Method:</strong> {results.estimationMethod === 'free_scraping' ? 'Web scraping with SEO metrics analysis' : 'Premium API data'}</p>
                      <p className="mb-2"><strong>Realistic Ranges (based on actual Google Analytics data):</strong></p>
                      <ul className="list-disc list-inside mb-2 text-xs">
                        <li>Small Business: 80-300 visitors/month</li>
                        <li>Medium Business: 200-500 visitors/month</li>
                        <li>Large Business: 600-1,500 visitors/month</li>
                        <li>Enterprise: 800-2,500+ visitors/month</li>
                      </ul>
                      <p><strong>Reference:</strong> PMW Communications (UK marketing agency) = 761 visitors/month from Google Analytics. Estimates now calibrated to real data.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
                    </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.monthlyPaidTraffic?.toLocaleString('en-GB')}</div>
                    <div className="text-xs text-green-500 font-medium mb-1">{paidPercentage}% of total traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Paid Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Paid Traffic</p>
                      <p className="mb-2"><strong>Time Period:</strong> Estimated monthly visitors from advertising (30-day period)</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who arrive through paid advertising (Google Ads, Facebook Ads, etc.)</p>
                      <p className="mb-2"><strong>Estimation Method:</strong> Ultra-conservative 3-4% of total traffic (based on real data)</p>
                      <p className="mb-2"><strong>Real Example:</strong> PMW Communications = 28 paid visitors/month (3.8% of 735 total)</p>
                      <p className="mb-2"><strong>Typical Range:</strong> 5-30 paid visitors/month for small businesses</p>
                      <p><strong>Reality:</strong> Many small businesses have 0 paid traffic. Only estimate non-zero if you see evidence of advertising spend.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
                    </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.brandedTraffic?.toLocaleString('en-GB')}</div>
                    <div className="text-xs text-purple-500 font-medium mb-1">{brandedPercentage}% of organic traffic</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      Monthly Branded Traffic
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Monthly Branded Traffic</p>
                      <p className="mb-2"><strong>Time Period:</strong> Estimated monthly visitors from brand searches (subset of organic traffic)</p>
                      <p className="mb-2"><strong>Definition:</strong> Visitors who search for your specific brand name, company name, or branded terms</p>
                      <p className="mb-2"><strong>Calculation:</strong> Estimated as 25% of organic traffic (realistic for established businesses)</p>
                      <p className="mb-2"><strong>Examples:</strong> Searches for &quot;PMW Communications&quot;, &quot;PMW marketing&quot;, or &quot;PMW agency&quot;</p>
                      <p className="mb-2"><strong>Realistic Range:</strong> 40-160 visitors/month for small businesses (20% of organic traffic)</p>
                      <p><strong>Importance:</strong> Shows brand recognition and customer loyalty. Higher numbers indicate stronger brand presence.</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Top Countries */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Top Countries
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Geographic Traffic Distribution</p>
                    <p className="mb-2"><strong>Time Period:</strong> Current month estimate</p>
                    <p className="mb-2"><strong>Method:</strong> Enhanced geographic analysis using:</p>
                    <ul className="list-disc list-inside mb-2 text-xs">
                      <li>Domain extension analysis (.co.uk = UK)</li>
                      <li>Website content analysis (addresses, phone numbers, VAT numbers)</li>
                      <li>Business registration clues (Companies House, etc.)</li>
                      <li>Language and spelling patterns</li>
                      <li>Currency and legal references</li>
                    </ul>
                    <p className="mb-2"><strong>Confidence:</strong> {results.confidence || 'Medium'} - based on strength of geographic indicators found</p>
                    <p><strong>Note:</strong> This analysis provides more accurate geographic distribution than generic estimates, especially for regional businesses</p>
                  </div>
                }
                position="bottom"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </h4>
            <div className="space-y-2">
              {results.topCountries?.slice(0, 3).map((country: { country: string; percentage: number; traffic?: number }, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{country.country}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{country.percentage}%</span>
                    <span className="font-medium">{country.traffic?.toLocaleString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Data Source Indicator */}
          {results.dataSource && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Data source: {results.dataSource === 'mcp-analysis' ? 'AI Analysis' : 
                              results.dataSource === 'web-scraping' ? 'Web Analysis' : 
                              results.dataSource === 'api' ? 'API Data' : 'Estimated'}
                </span>
                <span className={`px-2 py-1 rounded ${
                  results.confidence === 'high' ? 'bg-green-100 text-green-600' :
                  results.confidence === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {results.confidence} confidence
                </span>
              </div>
            </div>
          )}

          {/* How Results Were Obtained */}
          <div className="bg-blue-50 rounded-lg border border-blue-200">
            <button 
              onClick={() => toggleMethodology?.('traffic')}
              className="w-full p-6 text-left hover:bg-blue-100 transition-colors rounded-lg"
            >
              <h4 className="font-semibold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  How These Results Were Obtained
                </span>
                {showMethodologyExpanded?.traffic ? (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                )}
              </h4>
            </button>
            {showMethodologyExpanded?.traffic && (
              <div className="px-6 pb-6 space-y-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-medium mb-2">📊 Traffic Estimation Method</h5>
                <p className="text-blue-700 leading-relaxed">
                  Our traffic estimates are calculated using a combination of website analysis, SEO metrics, 
                  and machine learning algorithms. We analyze your site's content quality, page count, 
                  search engine visibility, and industry benchmarks to provide realistic traffic estimates.
                </p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">🎯 What We Analyze</h5>
                <ul className="list-disc list-inside text-blue-700 space-y-1 leading-relaxed">
                  <li><strong>Content Volume:</strong> Number of pages, blog posts, and content depth</li>
                  <li><strong>SEO Indicators:</strong> Meta tags, headings, and search optimization quality</li>
                  <li><strong>Domain Authority:</strong> Website credibility and link authority scores</li>
                  <li><strong>Geographic Targeting:</strong> Country-specific traffic distribution analysis</li>
                  <li><strong>Industry Benchmarks:</strong> Comparison with similar businesses in your sector</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium mb-2">🌍 Geographic Analysis</h5>
                <p className="text-blue-700 leading-relaxed">
                  Geographic traffic distribution is determined by analyzing your domain extension (.co.uk), 
                  content language patterns, business location indicators (addresses, phone numbers), 
                  and regional search behavior. This provides more accurate country-specific estimates 
                  than generic global averages.
                </p>
              </div>


              <div>
                <h5 className="font-medium mb-2">📈 Data Accuracy</h5>
                <ul className="list-disc list-inside text-blue-700 space-y-1 leading-relaxed">
                  <li>Estimates are calibrated against real Google Analytics data from similar businesses</li>
                  <li>12-month averages account for seasonal variations and provide stable baselines</li>
                  <li>Confidence levels reflect the strength of available indicators for your website</li>
                  <li>Results are conservative estimates - actual traffic may vary based on marketing efforts</li>
                </ul>
              </div>

              <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                <p className="text-blue-800 text-xs">
                  <strong>Note:</strong> These are estimates based on publicly available data and industry patterns. 
                  For precise traffic data, use Google Analytics or similar web analytics tools on your website.
                </p>
              </div>
              </div>
            )}
          </div>
          
        </div>
      );

    case "keywords":
      return (
        <div className="space-y-8">
          {/* Keywords Everywhere Real Data Notice */}
          {(results.dataSource === 'Keywords Everywhere (Bronze Package)' || results.volumeCreditsUsed > 0) && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-sm font-medium">
                      🎯 Real Google Data - Keywords Everywhere (Bronze Package)
                    </span>
                    <Tooltip 
                      content={
                        <div>
                          <p className="font-semibold mb-2">How These Results Were Obtained</p>
                          <p className="mb-2">Real Google data from Keywords Everywhere API:</p>
                          <div className="mb-2">
                            <p className="font-medium text-sm">📊 Search Volumes (Keywords Everywhere):</p>
                            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                              <li>Real Google Keyword Planner data</li>
                              <li>Actual monthly search volumes</li>
                              <li>CPC and competition metrics</li>
                              <li>UK-targeted search data</li>
                              <li>Bronze Package - 100,000 credits/year</li>
                            </ul>
                          </div>
                          <p className="mt-2 text-xs">100% real Google data - no estimates or approximations.</p>
                        </div>
                      }
                    >
                      <HelpCircle className="h-4 w-4 text-green-500" />
                    </Tooltip>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Keywords Analyzed:</span>
                      <span className="ml-1 text-green-600">{results.volumeCreditsUsed || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Credits Used:</span>
                      <span className="ml-1 text-green-600">{results.volumeCreditsUsed || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Search Engine:</span>
                      <span className="ml-1 text-green-600">Google UK</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data Quality:</span>
                      <span className="ml-1 text-green-600">{results.realVolumeData ? 'Premium' : 'Standard'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Business Context Notice for other methods */}
          {(results.estimationMethod === 'free_scraping' || results.methodology) && results.dataSource !== 'Keywords Everywhere (Bronze Package)' && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-sm font-medium">
                      🎯 Smart Business Analysis - Contextually Relevant Keywords for SMEs
                    </span>
                    <Tooltip 
                      content={
                        <div>
                          <p className="font-semibold mb-2">Smart Keyword Analysis</p>
                          <p className="mb-2">Advanced business context analysis that:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Identifies your specific industry and services</li>
                            <li>Extracts only business-relevant keywords</li>
                            <li>Shows realistic SME competitor landscape</li>
                            <li>Focuses on achievable ranking positions (1-10)</li>
                            <li>Provides appropriate difficulty levels for small businesses</li>
                          </ul>
                          <p className="mt-2 text-xs">Keywords are filtered for relevance and ranked by business impact.</p>
                        </div>
                      }
                    >
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                    </Tooltip>
                  </div>
                  
                  {results.businessContext && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">Industry:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.industry}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Business Size:</span>
                        <span className="ml-1 text-blue-600 capitalize">{results.businessContext.businessSize}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Target Market:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.targetMarket}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Locations:</span>
                        <span className="ml-1 text-blue-600">{results.businessContext.locations.join(', ') || 'Not specified'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Keywords Overview - Enhanced Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <button 
                onClick={() => {
                  const element = document.getElementById('branded-keywords-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {results.brandedKeywords || results.brandedKeywordsList?.length || 0}
              </button>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Branded Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Branded Keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Search terms that include your brand name, company name, or specific branded products/services</p>
                      <p className="mb-2"><strong>Examples:</strong> &quot;PMW Communications&quot;, &quot;PMW marketing agency&quot;, &quot;PMW reviews&quot;</p>
                      <p className="mb-2"><strong>Importance:</strong> Shows brand recognition and customer loyalty. Easier to rank for but lower volume.</p>
                      <p><strong>Typical Range:</strong> Small businesses: 15-50 branded keywords</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <button 
                onClick={() => {
                  const element = document.getElementById('non-branded-keywords-section');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-2xl font-bold text-green-600 hover:text-green-800 transition-colors cursor-pointer"
              >
                {results.nonBrandedKeywords || results.nonBrandedKeywordsList?.length || 0}
              </button>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Recommended keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Recommended keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Search terms related to your services/products that don&apos;t include your brand name</p>
                      <p className="mb-2"><strong>Examples:</strong> &quot;marketing agency London&quot;, &quot;digital marketing services&quot;, &quot;brand strategy consultant&quot;</p>
                      <p className="mb-2"><strong>Importance:</strong> Drives new customer acquisition. Higher competition but larger market opportunity.</p>
                      <p><strong>Typical Range:</strong> Small businesses: 50-200 non-branded keywords</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <div className="mt-2 flex justify-center">
                <button 
                  onClick={() => {
                    const element = document.getElementById('recommended-keywords-section');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-full text-xs font-medium transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Guide</span>
                </button>
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{(results.brandedKeywords || 0) + (results.nonBrandedKeywords || 0)}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Total Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Total Keywords Found</p>
                      <p className="mb-2"><strong>Source:</strong> All keywords extracted from your website content</p>
                      <p className="mb-2"><strong>Method:</strong> Content analysis and text processing</p>
                      <p><strong>Note:</strong> This represents keywords present in your content, not search rankings</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
            </div>
            
          </div>

          {/* Keyword Intent Distribution */}
          {results.intentDistribution && (
            <div>
              <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                Keyword Intent Distribution
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Keyword Intent Types</p>
                      <p className="mb-2"><strong>Informational:</strong> "How to", "What is", "Guide" - Users seeking information</p>
                      <p className="mb-2"><strong>Commercial:</strong> "Best", "Review", "Compare" - Users researching purchases</p>
                      <p className="mb-2"><strong>Transactional:</strong> "Buy", "Price", "Order" - Users ready to purchase</p>
                      <p><strong>Navigational:</strong> Brand names, "Login" - Users looking for specific sites</p>
                    </div>
                  }
                >
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{results.intentDistribution.informational}%</div>
                  <div className="text-xs text-gray-600">Informational</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{results.intentDistribution.commercial}%</div>
                  <div className="text-xs text-gray-600">Commercial</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{results.intentDistribution.transactional}%</div>
                  <div className="text-xs text-gray-600">Transactional</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{results.intentDistribution.navigational}%</div>
                  <div className="text-xs text-gray-600">Navigational</div>
                </div>
              </div>
            </div>
          )}



          {/* Keyword Competition Analysis */}
          {results.keywordCompetition && (
            <KeywordCompetitionTable 
              competitionData={results.keywordCompetition}
              title="Keyword Competition"
              description="Competitor websites with the highest keyword overlap based on your Above Fold Keywords"
            />
          )}

          {/* Branded Keywords Table */}
          {results.brandedKeywordsList && (
            <div id="branded-keywords-section">
            <BrandedKeywordTable 
              keywords={results.brandedKeywordsList}
              title="Branded keywords on Search engines"
              description="Complete list of search terms that include your brand name or company name"
            />
            </div>
          )}

          {/* Recommended Keywords Table */}
          {results.nonBrandedKeywordsList && (
            <div id="recommended-keywords-section">
            <RecommendedKeywordTable 
              keywords={results.nonBrandedKeywordsList}
              title="Recommended target keywords"
              description="Business-relevant keywords we recommend you target to improve your search visibility"
              auditType={auditType === 'page' ? 'page' : 'website'}
            />
            </div>
          )}

          {/* Paid Advertising Opportunities */}
          {results.nonBrandedKeywordsList && (
            <div id="paid-advertising-section">
            <PaidAdvertisingOpportunities 
              keywords={results.nonBrandedKeywordsList}
              targetDomainAuthority={results.domainAuthority || 35}
              title="Paid Advertising Opportunities"
              description="High-value keywords with strong competition - better suited for paid advertising than organic SEO"
            />
            </div>
          )}

          {/* Keywords with Search Volume Table */}
          {results.nonBrandedKeywordsList && (
            <div id="non-branded-keywords-section">
            <NonBrandedKeywordTable 
              keywords={results.nonBrandedKeywordsList}
              title="Keywords with search volume"
              description="Complete list of industry and service-related keywords that drive new customer acquisition"
              auditType={auditType === 'page' ? 'page' : 'website'}
            />
            </div>
          )}

          {/* Main Competition Analysis - moved below Keywords with Search Volume */}
          {results.aboveFoldCompetitors && results.aboveFoldCompetitors.competitors && (
            <div id="competition-analysis-section">
            <AboveFoldCompetitorTable 
              analysis={{
                ...results.aboveFoldCompetitors,
                targetDomainAuthority: results.domainAuthority
              }}
              title="Main Competition Analysis"
            />
            </div>
          )}


        </div>
      )

    case "performance":
    case "technical":
      return (
        <div className="space-y-6">

          {/* Core Web Vitals Pass/Fail Summary */}
          {results.pages && results.pages.some((page: any) => page.performance) && (() => {
            const pagesWithMetrics = results.pages.filter((page: any) => page.performance);
            
            // Calculate pass/fail for each page - using Core Web Vitals thresholds
            const desktopPass = pagesWithMetrics.filter((page: any) => 
              page.performance.desktop.lcp < 2500 && 
              page.performance.desktop.cls < 0.1 && 
              page.performance.desktop.inp < 200
            ).length;
            
            const mobilePass = pagesWithMetrics.filter((page: any) => 
              page.performance.mobile.lcp < 2500 && 
              page.performance.mobile.cls < 0.1 && 
              page.performance.mobile.inp < 200
            ).length;
            
            const totalPages = pagesWithMetrics.length;
            const desktopFail = totalPages - desktopPass;
            const mobileFail = totalPages - mobilePass;
            const desktopPassRate = Math.round((desktopPass / totalPages) * 100);
            const mobilePassRate = Math.round((mobilePass / totalPages) * 100);
            
            return (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">Core Web Vitals Summary</h4>
                    <Tooltip 
                      content={
                        <div>
                          <p className="font-semibold mb-2">Core Web Vitals Summary</p>
                          <p className="mb-2">Overview of how your pages perform on Google's Core Web Vitals metrics.</p>
                          <div className="text-xs space-y-1">
                            <p><strong>Pass Criteria:</strong> All 3 metrics must pass (LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms)</p>
                            <p><strong>Desktop vs Mobile:</strong> Separate scores for different device types</p>
                            <p><strong>Pass Rate:</strong> Percentage of pages meeting all Core Web Vitals thresholds</p>
                            <p><strong>Google Impact:</strong> Poor Core Web Vitals can hurt your search rankings</p>
                          </div>
                        </div>
                      }
                      position="top"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="text-sm text-gray-600">{totalPages} pages analyzed</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Desktop Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Desktop Performance</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Pass Rate</span>
                          <span className="text-sm font-medium">{desktopPassRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${desktopPassRate >= 75 ? 'bg-green-500' : desktopPassRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${desktopPassRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-600">Pass:</span>
                        <span className="font-medium text-green-600">{desktopPass}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-gray-600">Fail:</span>
                        <span className="font-medium text-red-600">{desktopFail}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Mobile Performance</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Pass Rate</span>
                          <span className="text-sm font-medium">{mobilePassRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${mobilePassRate >= 75 ? 'bg-green-500' : mobilePassRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${mobilePassRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-600">Pass:</span>
                        <span className="font-medium text-green-600">{mobilePass}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-gray-600">Fail:</span>
                        <span className="font-medium text-red-600">{mobileFail}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>Pass Criteria:</strong> LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms (all three metrics must pass)
                </div>
              </div>
            );
          })()}

          {/* Per-Page Performance Metrics Table */}
          {results.pages && results.pages.some((page: any) => page.performance) && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg">Page Performance Metrics</h4>
                  <Tooltip 
                    content={
                      <div>
                        <p className="font-semibold mb-2">Page Performance Metrics</p>
                        <p className="mb-2">Detailed Core Web Vitals scores for each page on your website.</p>
                        <div className="text-xs space-y-1">
                          <p><strong>LCP (Largest Contentful Paint):</strong> How quickly main content loads (&lt; 2.5s = Good)</p>
                          <p><strong>CLS (Cumulative Layout Shift):</strong> Visual stability of page (&lt; 0.1 = Good)</p>
                          <p><strong>INP (Interaction to Next Paint):</strong> Page responsiveness (&lt; 200ms = Good)</p>
                          <p><strong>Page-by-Page:</strong> Each page is scored independently by Google</p>
                          <p><strong>Worst First:</strong> Pages with poorest performance shown at top</p>
                        </div>
                      </div>
                    }
                    position="top"
                  >
                    <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
                <button 
                  onClick={() => setShowCoreWebVitalsGuide?.(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Core Web Vitals Guide
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Core Web Vitals for each page, sorted by worst-performing first. Each page is evaluated independently by Google.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Page</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Desktop Performance</p>
                              <p>Overall performance score (0-100) based on Core Web Vitals and other metrics.</p>
                            </div>
                          }>
                            Desktop Score
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Largest Contentful Paint (Desktop)</p>
                              <p>Time when largest content element loads. Good: &lt;2.5s, Needs Improvement: 2.5-4s, Poor: &gt;4s</p>
                            </div>
                          }>
                            Desktop LCP
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Cumulative Layout Shift (Desktop)</p>
                              <p>Visual stability measure. Good: &lt;0.1, Needs Improvement: 0.1-0.25, Poor: &gt;0.25</p>
                            </div>
                          }>
                            Desktop CLS
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Interaction to Next Paint (Desktop)</p>
                              <p>Page responsiveness to user interactions. Good: &lt;200ms, Needs Improvement: 200-500ms, Poor: &gt;500ms</p>
                            </div>
                          }>
                            Desktop INP
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Mobile Performance</p>
                              <p>Overall performance score (0-100) for mobile devices, typically lower than desktop.</p>
                            </div>
                          }>
                            Mobile Score
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Largest Contentful Paint (Mobile)</p>
                              <p>Time when largest content element loads on mobile. Good: &lt;2.5s, Needs Improvement: 2.5-4s, Poor: &gt;4s</p>
                            </div>
                          }>
                            Mobile LCP
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Cumulative Layout Shift (Mobile)</p>
                              <p>Visual stability measure on mobile. Good: &lt;0.1, Needs Improvement: 0.1-0.25, Poor: &gt;0.25</p>
                            </div>
                          }>
                            Mobile CLS
                          </Tooltip>
                        </th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">
                          <Tooltip content={
                            <div className="max-w-sm">
                              <p className="font-semibold mb-1">Interaction to Next Paint (Mobile)</p>
                              <p>Page responsiveness on mobile devices. Good: &lt;200ms, Needs Improvement: 200-500ms, Poor: &gt;500ms</p>
                            </div>
                          }>
                            Mobile INP
                          </Tooltip>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        // Filter and sort pages with performance data
                        const pagesWithPerformance = results.pages
                          .filter((page: any) => page.performance)
                          .sort((a: any, b: any) => {
                            // Sort by worst mobile score first (mobile is typically worse)
                            const aScore = a.performance?.mobile?.score || 0;
                            const bScore = b.performance?.mobile?.score || 0;
                            return aScore - bScore;
                          });
                        
                        // Calculate pagination
                        const totalPages = Math.ceil(pagesWithPerformance.length / performancePagination.itemsPerPage);
                        const startIndex = (performancePagination.currentPage - 1) * performancePagination.itemsPerPage;
                        const endIndex = startIndex + performancePagination.itemsPerPage;
                        const currentPageData = pagesWithPerformance.slice(startIndex, endIndex);
                        
                        return currentPageData.map((page: any, index: number) => {
                          if (!page.performance) return null;
                          
                          const { desktop, mobile } = page.performance;
                          
                          // Scoring functions
                          const getScoreColor = (score: number) => {
                            if (score >= 90) return 'text-green-600';
                            if (score >= 50) return 'text-yellow-600';
                            return 'text-red-600';
                          };
                          
                          const getLCPColor = (lcp: number) => {
                            if (lcp < 2500) return 'text-green-600';
                            if (lcp < 4000) return 'text-yellow-600';
                            return 'text-red-600';
                          };
                          
                          const getCLSColor = (cls: number) => {
                            if (cls < 0.1) return 'text-green-600';
                            if (cls < 0.25) return 'text-yellow-600';
                            return 'text-red-600';
                          };
                          
                          const getINPColor = (inp: number) => {
                            if (inp < 200) return 'text-green-600';
                            if (inp < 500) return 'text-yellow-600';
                            return 'text-red-600';
                          };
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <Tooltip content={page.url}>
                                  <a 
                                    href={page.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline font-mono text-sm"
                                  >
                                    {(() => {
                                      try {
                                        const urlObj = new URL(page.url);
                                        const path = urlObj.pathname;
                                        // Show root as "/" instead of empty string
                                        return path === '/' ? '/' : path;
                                      } catch {
                                        // Fallback if URL parsing fails
                                        return page.url.replace(/^https?:\/\/[^\/]+/, '') || '/';
                                      }
                                    })()}
                                  </a>
                                </Tooltip>
                              </td>
                              <td className={`px-4 py-3 text-center font-bold ${getScoreColor(desktop.score)}`}>
                                {desktop.score}
                              </td>
                              <td className={`px-4 py-3 text-center ${getLCPColor(desktop.lcp)}`}>
                                {(desktop.lcp / 1000).toFixed(1)}s
                              </td>
                              <td className={`px-4 py-3 text-center ${getCLSColor(desktop.cls)}`}>
                                {desktop.cls.toFixed(3)}
                              </td>
                              <td className={`px-4 py-3 text-center ${getINPColor(desktop.inp)}`}>
                                {desktop.inp}ms
                              </td>
                              <td className={`px-4 py-3 text-center font-bold ${getScoreColor(mobile.score)}`}>
                                {mobile.score}
                              </td>
                              <td className={`px-4 py-3 text-center ${getLCPColor(mobile.lcp)}`}>
                                {(mobile.lcp / 1000).toFixed(1)}s
                              </td>
                              <td className={`px-4 py-3 text-center ${getCLSColor(mobile.cls)}`}>
                                {mobile.cls.toFixed(3)}
                              </td>
                              <td className={`px-4 py-3 text-center ${getINPColor(mobile.inp)}`}>
                                {mobile.inp}ms
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination Controls */}
              {(() => {
                const pagesWithPerformance = results.pages.filter((page: any) => page.performance);
                const totalPages = Math.ceil(pagesWithPerformance.length / performancePagination.itemsPerPage);
                
                if (totalPages <= 1) return null;
                
                return (
                  <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-700">
                      Showing {((performancePagination.currentPage - 1) * performancePagination.itemsPerPage) + 1} to{' '}
                      {Math.min(performancePagination.currentPage * performancePagination.itemsPerPage, pagesWithPerformance.length)} of{' '}
                      {pagesWithPerformance.length} pages
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPerformancePagination(prev => ({ 
                          ...prev, 
                          currentPage: Math.max(1, prev.currentPage - 1) 
                        }))}
                        disabled={performancePagination.currentPage === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first, last, current, and adjacent pages
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - performancePagination.currentPage) <= 1;
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there's a gap
                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                            
                            return (
                              <React.Fragment key={page}>
                                {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                <button
                                  onClick={() => setPerformancePagination(prev => ({ 
                                    ...prev, 
                                    currentPage: page 
                                  }))}
                                  className={`px-3 py-1 text-sm border rounded ${
                                    page === performancePagination.currentPage
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>
                      
                      <button
                        onClick={() => setPerformancePagination(prev => ({ 
                          ...prev, 
                          currentPage: Math.min(totalPages, prev.currentPage + 1) 
                        }))}
                        disabled={performancePagination.currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">📊 Understanding Core Web Vitals</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Performance Score:</strong> Overall page performance (0-100). Higher is better.</li>
                  <li><strong>LCP (Largest Contentful Paint):</strong> Loading performance. Aim for &lt;2.5 seconds.</li>
                  <li><strong>CLS (Cumulative Layout Shift):</strong> Visual stability. Aim for &lt;0.1.</li>
                  <li><strong>INP (Interaction to Next Paint):</strong> Interactivity. Aim for &lt;200ms.</li>
                  <li><strong>Colors:</strong> <span className="text-green-600">Green = Good</span>, <span className="text-yellow-600">Yellow = Needs Improvement</span>, <span className="text-red-600">Red = Poor</span></li>
                </ul>
              </div>
            </div>
          )}


          {/* Technical Audit Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-semibold text-lg">Technical Health</h4>
              <Tooltip 
                content={
                  <div>
                    <p className="font-semibold mb-2">Technical Health</p>
                    <p className="mb-2">Core technical metrics that affect your website's performance and search ranking.</p>
                    <div className="text-xs space-y-1">
                      <p><strong>Security Status:</strong> HTTPS, mixed content, and certificate health</p>
                      <p><strong>Mobile Friendly:</strong> How well your site works on mobile devices</p>
                      <p><strong>Performance Issues:</strong> Technical problems affecting site speed</p>
                      <p><strong>SEO Impact:</strong> Technical factors that influence search rankings</p>
                      <p><strong>User Experience:</strong> Technical elements affecting visitor satisfaction</p>
                    </div>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            
            {/* Technical Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setPageModalState({
                  isOpen: true,
                  title: 'All Discovered Pages',
                  pages: results.pages || [],
                  filterCondition: undefined
                })}
              >
                <div className="text-2xl font-bold text-blue-600">{results.totalPages?.toLocaleString('en-GB')}</div>
                <div className="text-sm text-gray-600">Total Pages (Click to view)</div>
                {results.discoveryMethod && (
                  <div className="text-xs text-blue-500 mt-1">Via {results.discoveryMethod}</div>
                )}
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div 
                  className="text-2xl font-bold text-orange-600 cursor-pointer hover:text-orange-700 transition-colors" 
                  onClick={() => {
                    const element = document.getElementById('large-images-table');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  title="Click to view large images details"
                >
                  {results.largeImages}
                </div>
                <div className="text-sm text-gray-600">Large Images</div>
              </div>
            </div>

            {/* Issues Found */}
            <div className="mb-6">
              <h5 className="font-semibold mb-3">Issues Found</h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div 
                  className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setPageModalState({
                    isOpen: true,
                    title: 'Pages Missing Meta Titles',
                    pages: results.pages || [],
                    filterCondition: (page) => !page.hasTitle
                  })}
                >
                  <span className="text-gray-600">Missing Meta Titles:</span>
                  <span className={results.issues?.missingMetaTitles > 0 ? 'text-red-600 underline' : 'text-green-600'}>
                    {results.issues?.missingMetaTitles || 0}
                  </span>
                </div>
                <div 
                  className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setPageModalState({
                    isOpen: true,
                    title: 'Pages Missing Meta Descriptions',
                    pages: results.pages || [],
                    filterCondition: (page) => !page.hasDescription
                  })}
                >
                  <span className="text-gray-600">Missing Meta Descriptions:</span>
                  <span className={results.issues?.missingMetaDescriptions > 0 ? 'text-red-600 underline' : 'text-green-600'}>
                    {results.issues?.missingMetaDescriptions || 0}
                  </span>
                </div>
                <div 
                  className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => setPageModalState({
                    isOpen: true,
                    title: 'Pages Missing H1 Tags',
                    pages: results.pages || [],
                    filterCondition: (page) => !page.hasH1
                  })}
                >
                  <span className="text-gray-600">Missing H1 Tags:</span>
                  <span className={results.issues?.missingH1Tags > 0 ? 'text-red-600 underline' : 'text-green-600'}>
                    {results.issues?.missingH1Tags || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Large Images (&gt;100KB):</span>
                  <span className={results.issues?.largeImages > 0 ? 'text-red-600' : 'text-green-600'}>
                    {results.issues?.largeImages || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">404 Errors:</span>
                  <span className={results.issues?.notFoundErrors > 0 ? 'text-red-600' : 'text-green-600'}>
                    {results.issues?.notFoundErrors || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Broken Internal Links:</span>
                  <span className={results.issues?.brokenInternalLinks > 0 ? 'text-red-600' : 'text-green-600'}>
                    {results.issues?.brokenInternalLinks || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recommendations */}
          <EnhancedRecommendations 
            recommendations={results.recommendations || []}
            desktopScore={results.desktop?.score}
            mobileScore={results.mobile?.score}
            lcpScore={results.desktop?.lcp || results.mobile?.lcp}
            clsScore={results.desktop?.cls || results.mobile?.cls}
            inpScore={results.desktop?.inp || results.mobile?.inp}
            detectedPlugins={detectedPlugins || []}
            pageBuilder={pageBuilder}
          />

          {/* Large Images Table */}
          {(results.largeImagesList || results.largeImageDetails) && (results.largeImagesList || results.largeImageDetails).length > 0 && (
            <div id="large-images-table">
              <h4 className="font-semibold mb-3 text-orange-600">⚠️ Large Images Need Optimization</h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-orange-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-orange-800">Image</th>
                        <th className="px-4 py-3 text-left font-medium text-orange-800">Found On Page</th>
                        <th className="px-4 py-3 text-right font-medium text-orange-800">Size</th>
                        <th className="px-4 py-3 text-left font-medium text-orange-800">Action Needed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-200">
                      {(results.largeImagesList || results.largeImageDetails || []).slice(0, 10).map((image: any, index: number) => (
                        <tr key={index} className="hover:bg-orange-50">
                          <td className="px-4 py-3">
                            <a 
                              href={image.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {image.imageUrl.split('/').pop() || image.imageUrl}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <Tooltip content={image.pageUrl}>
                              <a 
                                href={image.pageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {image.pageUrl.replace(/^https?:\/\//, '').substring(0, 50)}...
                              </a>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">
                            {(image.sizeKB || 0).toLocaleString()}KB
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {image.sizeKB > 500 ? 'Optimize urgently' : 'Compress image'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Use image compression tools like TinyPNG or WebP format to reduce file sizes without losing quality.
              </p>
            </div>
          )}

          {/* 404 Errors Table */}
          {results.notFoundErrors && results.notFoundErrors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-red-600">❌ 404 Errors Found</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-red-800">Broken URL</th>
                        <th className="px-4 py-3 text-left font-medium text-red-800">Found On Page</th>
                        <th className="px-4 py-3 text-left font-medium text-red-800">Link Type</th>
                        <th className="px-4 py-3 text-left font-medium text-red-800">Action Needed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200">
                      {results.notFoundErrors.map((error: any, index: number) => (
                        <tr key={index} className="hover:bg-red-50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-red-600 break-all">
                              {error.brokenUrl}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a 
                              href={error.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {error.sourceUrl.replace(/^https?:\/\//, '').substring(0, 50)}...
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              error.linkType === 'internal' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {error.linkType === 'internal' ? 'Internal' : 'External'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {error.linkType === 'internal' ? 'Fix or redirect' : 'Update or remove link'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Set up 301 redirects for moved pages or create custom 404 pages to improve user experience.
              </p>
            </div>
          )}

          {/* How Results Were Obtained */}
          <div className="bg-blue-50 rounded-lg border border-blue-200">
            <button 
              onClick={() => toggleMethodology?.('technical')}
              className="w-full p-6 text-left hover:bg-blue-100 transition-colors rounded-lg"
            >
              <h4 className="font-semibold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  How These Results Were Obtained
                </span>
                {(showMethodologyExpanded?.performance || showMethodologyExpanded?.technical) ? (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                )}
              </h4>
            </button>
            {(showMethodologyExpanded?.performance || showMethodologyExpanded?.technical) && (
              <div className="px-6 pb-6 space-y-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-medium mb-2">⚡ Performance & Technical Analysis Method</h5>
                  <p className="text-blue-700 leading-relaxed">
                    Our comprehensive analysis combines performance testing with technical SEO auditing. We simulate 
                    your website loading on both desktop and mobile devices using Core Web Vitals metrics, while also 
                    crawling your site to analyze HTML structure, meta tags, images, and server responses.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">📊 What We Measure</h5>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 leading-relaxed">
                    <li><strong>Core Web Vitals:</strong> LCP, CLS, INP for both desktop and mobile experiences</li>
                    <li><strong>Page Structure:</strong> Meta titles, descriptions, H1 tags, and content hierarchy</li>
                    <li><strong>Image Optimization:</strong> File sizes, alt text, and format efficiency</li>
                    <li><strong>Site Health:</strong> 404 errors, broken links, and server response issues</li>
                    <li><strong>Technical SEO:</strong> URL structure, redirects, and crawlability factors</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">🔧 Data Sources & Accuracy</h5>
                  <p className="text-blue-700 leading-relaxed">
                    Results are based on simulated testing and automated crawling. Performance metrics may vary from 
                    real user experiences depending on device and network conditions. Technical audit results may not 
                    capture issues requiring user interaction or authentication. For comprehensive analysis, combine 
                    these results with manual testing and real user monitoring data.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )

    case "backlinks":
      return (
        <div className="space-y-6">
          {/* Check if API is configured */}
          {results.error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-amber-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">Professional Backlink Analysis Required</h3>
                  <p className="text-amber-700 text-sm mt-1">Real backlink data requires a premium API subscription</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">What You Get with Majestic API:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real referring domains that actually link to your site</li>
                  <li>• Actual anchor text used in backlinks</li>
                  <li>• Trust Flow and Citation Flow metrics</li>
                  <li>• Link discovery dates and historical data</li>
                  <li>• Spam detection and link quality assessment</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-amber-700 mb-1"><strong>Majestic Lite Plan: $49.99/month</strong></div>
                  <div className="text-xs text-amber-600">Most affordable professional backlink API</div>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={results.analysisUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Free Report
                  </a>
                  <a 
                    href="https://majestic.com/plans-pricing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Get API Access
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Backlink Overview - Only show when API is working */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.domainAuthority}</div>
                  <div className="text-sm text-gray-600">Trust Flow</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.totalBacklinks?.toLocaleString('en-GB')}</div>
                  <div className="text-sm text-gray-600">Total Backlinks</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.referringDomains?.toLocaleString('en-GB')}</div>
                  <div className="text-sm text-gray-600">Referring Domains</div>
                </div>
              </div>

              {/* Real Backlinks from Majestic */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">High Authority Backlinks</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Real Data from {results.dataSource}</span>
                </div>
                <div className="space-y-2">
                  {results.topBacklinks?.slice(0, 8).map((backlink: { domain: string; anchor: string; authority: number; type: string; trustFlow?: number; citationFlow?: number }, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{backlink.domain}</div>
                        <div className="text-gray-500 text-xs truncate max-w-xs">{backlink.anchor}</div>
                      </div>
                      <div className="text-right flex gap-4">
                        <div>
                          <div className="text-blue-600 font-medium">TF {backlink.authority}</div>
                          {backlink.citationFlow && (
                            <div className="text-gray-500 text-xs">CF {backlink.citationFlow}</div>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${backlink.type === 'dofollow' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {backlink.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )

    case "technology":
      return (
        <div className="space-y-6">
          {/* Core Technologies */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">CMS:</span>
                <div className="font-semibold text-blue-600">{results.cms || 'Not detected'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Framework:</span>
                <div className="font-semibold text-green-600">{results.framework || 'Not detected'}</div>
              </div>
              {results.pageBuilder && (
                <div>
                  <span className="text-gray-600 text-sm">Page Builder:</span>
                  <div className="font-semibold text-teal-600">{results.pageBuilder}</div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Analytics:</span>
                <div className="font-semibold text-purple-600">{results.analytics || 'Not detected'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Origin Hosting:</span>
                <div className="font-semibold text-orange-600">{results.hosting || 'Not detected'}</div>
              </div>
              {results.cdn && (
                <div>
                  <span className="text-gray-600 text-sm">CDN/Proxy:</span>
                  <div className="font-semibold text-cyan-600">{results.cdn}</div>
                </div>
              )}
              {results.organization && !results.hosting?.toLowerCase().includes('cloudflare') && (
                <div>
                  <span className="text-gray-600 text-sm">Organization:</span>
                  <div className="font-semibold text-indigo-600">{results.organization}</div>
                </div>
              )}
            </div>
          </div>

          {results.ecommerce && (
            <div>
              <span className="text-gray-600 text-sm">E-commerce:</span>
              <div className="font-semibold text-indigo-600">{results.ecommerce}</div>
            </div>
          )}

          {/* WordPress Plugins */}
          {results.plugins && results.plugins.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">WordPress Plugins Detected</h4>
              <div className="flex flex-wrap gap-2">
                {results.plugins.map((plugin: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {plugin}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Technologies */}
          <div>
            <h4 className="font-semibold mb-3">Additional Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {results.technologies?.map((tech: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Detection Quality Info */}
          {results.source && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold mb-2 text-sm">Detection Quality</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Source:</span>
                  <div className={`font-medium ${
                    results.source === 'direct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {results.source === 'direct' ? 'Direct Website Analysis' : 'Manual Analysis'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <div className={`font-medium ${
                    results.confidence === 'high' ? 'text-green-600' :
                    results.confidence === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {results.confidence === 'high' ? 'High' :
                     results.confidence === 'medium' ? 'Medium' :
                     'Low'}
                  </div>
                </div>
              </div>
              {results.confidence === 'low' && (
                <div className="mt-2 text-xs text-orange-600">
                  ⚠️ Results may be inaccurate. Direct analysis failed.
                </div>
              )}
              {results.confidence === 'high' && results.source === 'direct' && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ High confidence detection using professional patterns.
                </div>
              )}
            </div>
          )}

          {/* How Results Were Obtained */}
          <div className="bg-blue-50 rounded-lg border border-blue-200">
            <button 
              onClick={() => toggleMethodology?.('technology')}
              className="w-full p-6 text-left hover:bg-blue-100 transition-colors rounded-lg"
            >
              <h4 className="font-semibold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  How These Results Were Obtained
                </span>
                {showMethodologyExpanded?.technology ? (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                )}
              </h4>
            </button>
            {showMethodologyExpanded?.technology && (
              <div className="px-6 pb-6 space-y-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-medium mb-2">🔍 Detection Method</h5>
                <p className="text-blue-700 leading-relaxed">
                  Our technology detection system analyzes your website by examining the HTML source code, 
                  HTTP response headers, file paths, and other technical indicators. This is done completely 
                  automatically and safely - we don't make any changes to your website.
                </p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">🎯 What We Look For</h5>
                <ul className="list-disc list-inside text-blue-700 space-y-1 leading-relaxed">
                  <li><strong>CMS Detection:</strong> Meta tags, file paths like /wp-content/, and unique code signatures</li>
                  <li><strong>Framework Identification:</strong> JavaScript libraries, build artifacts, and framework-specific patterns</li>
                  <li><strong>Analytics Tracking:</strong> Google Analytics, Tag Manager, and other tracking code</li>
                  <li><strong>Hosting & CDN:</strong> Server headers, IP geolocation, and network infrastructure analysis</li>
                  <li><strong>Page Builders:</strong> CSS classes, JavaScript files, and plugin signatures</li>
                </ul>
              </div>

              <div>
                <h5 className="font-medium mb-2">🌐 Hosting Detection</h5>
                <p className="text-blue-700 leading-relaxed">
                  For hosting providers, we use IP geolocation APIs and network analysis to identify the actual 
                  hosting company. When a CDN like Cloudflare is detected, we attempt to identify the origin 
                  server behind it, though this isn't always possible due to security configurations.
                </p>
              </div>

              <div>
                <h5 className="font-medium mb-2">📊 Accuracy & Limitations</h5>
                <ul className="list-disc list-inside text-blue-700 space-y-1 leading-relaxed">
                  <li>Results are highly accurate for standard installations and popular technologies</li>
                  <li>Custom implementations or heavily modified setups may not be detected</li>
                  <li>Some hosting providers may be hidden behind CDNs and show as the CDN provider instead</li>
                  <li>Detection confidence is indicated in the quality section above</li>
                </ul>
              </div>

              <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                <p className="text-blue-800 text-xs">
                  <strong>Privacy Note:</strong> All analysis is performed using publicly available information. 
                  We only examine what your website publicly serves to any visitor - no private data is accessed.
                </p>
              </div>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return (
        <div className="text-gray-600">
          <p>Analysis completed successfully</p>
          <p className="text-sm mt-1">Detailed results are now available</p>
        </div>
      )
  }
}