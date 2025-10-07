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
import AboveFoldKeywordTable from './AboveFoldKeywordTable'
import AboveFoldCompetitorTable from './AboveFoldCompetitorTable'
import KeywordCompetitionTable from './KeywordCompetitionTable'
import { PMWLogo } from './PMWLogo'
import { PageDetailsModal } from './PageDetailsModal'

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
    pages: any[];
    filterCondition?: (page: any) => boolean;
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
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <button
          onClick={() => {
            const sitemapUrl = `/sitemap?domain=${encodeURIComponent(audit.url)}`;
            window.open(sitemapUrl, '_blank');
          }}
          className="btn-pmw-secondary text-sm px-4 py-2"
        >
          <Globe className="w-5 h-5" />
          <span>View Sitemap</span>
        </button>
      </div>

      {/* Status Header */}
      <div className="card-pmw">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(audit.status)}`}>
                {getStatusText(audit.status)}
              </span>
              {isPolling && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-gray-600 mt-2">
              Started: {new Date(audit.createdAt).toLocaleString('en-GB', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </p>
            
            {/* Progress info has been moved to the modal */}
            {audit.completedAt && (
              <p className="text-gray-600">
                Completed: {new Date(audit.completedAt).toLocaleString('en-GB', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </p>
            )}
          </div>
          
          {audit.status === "completed" && (
            <div className="flex space-x-2">
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
                            }
                            .header { 
                              margin-bottom: 40px; 
                              border-bottom: 3px solid #2563eb; 
                              padding-bottom: 30px; 
                              text-align: center;
                            }
                            .logo { 
                              font-size: 32px; 
                              font-weight: bold; 
                              color: #2563eb; 
                              margin-bottom: 8px; 
                            }
                            .company { 
                              font-size: 16px; 
                              color: #666; 
                              margin-bottom: 20px; 
                            }
                            .title { 
                              font-size: 28px; 
                              font-weight: bold; 
                              margin-bottom: 20px;
                              color: #1e40af;
                            }
                            .subtitle {
                              font-size: 20px;
                              color: #666;
                              margin-bottom: 10px;
                            }
                            .section { 
                              margin: 30px 0; 
                              padding: 20px;
                              border: 1px solid #e5e7eb;
                              border-radius: 8px;
                            }
                            .section-title { 
                              font-size: 22px; 
                              font-weight: bold; 
                              margin-bottom: 15px;
                              color: #1e40af;
                              border-bottom: 2px solid #e5e7eb;
                              padding-bottom: 8px;
                            }
                            .metric-grid {
                              display: grid;
                              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                              gap: 20px;
                              margin: 20px 0;
                            }
                            .metric-card {
                              padding: 15px;
                              background: #f8fafc;
                              border-radius: 6px;
                              text-align: center;
                            }
                            .metric-value {
                              font-size: 24px;
                              font-weight: bold;
                              color: #2563eb;
                            }
                            .metric-label {
                              font-size: 14px;
                              color: #666;
                              margin-top: 5px;
                            }
                            table { 
                              width: 100%; 
                              border-collapse: collapse; 
                              margin: 15px 0; 
                            }
                            th, td { 
                              border: 1px solid #d1d5db; 
                              padding: 12px; 
                              text-align: left; 
                            }
                            th { 
                              background-color: #f3f4f6; 
                              font-weight: bold;
                              color: #374151;
                            }
                            tr:nth-child(even) { 
                              background-color: #f9fafb; 
                            }
                            .audit-info { 
                              margin-bottom: 30px; 
                              padding: 20px;
                              background: #f0f9ff;
                              border-radius: 8px;
                            }
                            .audit-info p { 
                              margin: 8px 0; 
                            }
                            .footer {
                              margin-top: 40px;
                              padding-top: 20px;
                              border-top: 1px solid #e5e7eb;
                              font-size: 12px;
                              color: #666;
                              text-align: center;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo">PMW</div>
                            <div class="company">Professional Marketing & Web Design</div>
                            <div class="title">SEO Audit Report</div>
                            <div class="subtitle">${domain}</div>
                          </div>
                          
                          <div class="audit-info">
                            <p><strong>Website:</strong> ${audit.url}</p>
                            <p><strong>Audit Date:</strong> ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}</p>
                            <p><strong>Report Generated:</strong> ${currentDate.toLocaleString()}</p>
                            <p><strong>Sections Analyzed:</strong> ${audit.sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                          </div>
                          
                          ${audit.results && audit.sections ? audit.sections.map(section => {
                            const sectionData = audit.results[section];
                            if (!sectionData) return '';
                            
                            let sectionName = section.charAt(0).toUpperCase() + section.slice(1);
                            if (section === 'traffic') sectionName = 'Traffic Insights';
                            if (section === 'keywords') sectionName = 'Keywords Analysis';
                            if (section === 'performance') sectionName = 'Performance & Technical Audit';
                            if (section === 'backlinks') sectionName = 'Authority & Backlinks';
                            if (section === 'technical') sectionName = 'Performance & Technical Audit';
                            if (section === 'technology') sectionName = 'Technology Stack';
                            
                            let sectionContent = '';
                            
                            if (section === 'traffic' && typeof sectionData === 'object') {
                              sectionContent = `
                                <div class="metric-grid">
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.monthlyOrganicTraffic || 0}</div>
                                    <div class="metric-label">Monthly Organic Traffic</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.monthlyPaidTraffic || 0}</div>
                                    <div class="metric-label">Monthly Paid Traffic</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.brandedTraffic || 0}</div>
                                    <div class="metric-label">Branded Traffic</div>
                                  </div>
                                </div>
                                ${sectionData.topCountries && Array.isArray(sectionData.topCountries) ? `
                                  <h4>Top Countries</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Country</th><th>Traffic</th><th>Percentage</th></tr>
                                    </thead>
                                    <tbody>
                                      ${sectionData.topCountries.map(country => 
                                        `<tr><td>${country.country}</td><td>${country.traffic}</td><td>${country.percentage}%</td></tr>`
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                              `;
                            } else if (section === 'keywords' && typeof sectionData === 'object') {
                              sectionContent = `
                                <div class="metric-grid">
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.totalKeywords || 0}</div>
                                    <div class="metric-label">Total Keywords</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.brandedKeywords || 0}</div>
                                    <div class="metric-label">Branded Keywords</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.aboveFoldKeywords || 0}</div>
                                    <div class="metric-label">Top 3 Rankings</div>
                                  </div>
                                </div>
                                ${sectionData.aboveFoldKeywordsList && Array.isArray(sectionData.aboveFoldKeywordsList) && sectionData.aboveFoldKeywordsList.length > 0 ? `
                                  <h4>Above Fold Keywords (All Results)</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Keyword</th><th>Position</th><th>Search Volume</th><th>Type</th></tr>
                                    </thead>
                                    <tbody>
                                      ${sectionData.aboveFoldKeywordsList.map(keyword => 
                                        `<tr><td>${keyword.keyword}</td><td>${keyword.position}</td><td>${keyword.volume || 'N/A'}</td><td>${keyword.type || 'N/A'}</td></tr>`
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                                ${sectionData.brandedKeywordsList && Array.isArray(sectionData.brandedKeywordsList) && sectionData.brandedKeywordsList.length > 0 ? `
                                  <h4>All Branded Keywords</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Keyword</th><th>Position</th><th>Search Volume</th><th>Mentions</th></tr>
                                    </thead>
                                    <tbody>
                                      ${sectionData.brandedKeywordsList.map(keyword => 
                                        `<tr><td>${keyword.keyword}</td><td>${keyword.position ? `#${keyword.position}` : 'Not ranking'}</td><td>${(keyword.volume || 0).toLocaleString()}/mo</td><td>${keyword.mentions || 1}</td></tr>`
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                                ${sectionData.nonBrandedKeywordsList && Array.isArray(sectionData.nonBrandedKeywordsList) && sectionData.nonBrandedKeywordsList.length > 0 ? `
                                  <h4>All Non-Branded Keywords</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Keyword</th><th>Position</th><th>Search Volume</th><th>Difficulty</th></tr>
                                    </thead>
                                    <tbody>
                                      ${sectionData.nonBrandedKeywordsList.map(keyword => 
                                        `<tr><td>${keyword.keyword}</td><td>${keyword.position ? `#${keyword.position}` : 'Not ranking'}</td><td>${(keyword.volume || 0).toLocaleString()}/mo</td><td>${keyword.difficulty || 'N/A'}</td></tr>`
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                              `;
                            } else if ((section === 'performance' || section === 'technical') && typeof sectionData === 'object') {
                              // For combined Performance & Technical section, get both datasets
                              const performanceData = audit.results?.performance || {};
                              const technicalData = audit.results?.technical || {};
                              const dataToUse = section === 'performance' ? { ...performanceData, ...technicalData } : { ...technicalData, ...performanceData };
                              sectionContent = `
                                <h4>Performance Metrics</h4>
                                <div class="metric-grid">
                                  <div class="metric-card">
                                    <div class="metric-value">${dataToUse.desktop?.lcp || 'N/A'}</div>
                                    <div class="metric-label">Desktop LCP</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${dataToUse.mobile?.lcp || 'N/A'}</div>
                                    <div class="metric-label">Mobile LCP</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${dataToUse.totalPages || 0}</div>
                                    <div class="metric-label">Total Pages</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${dataToUse.largeImages || 0}</div>
                                    <div class="metric-label">Large Images</div>
                                  </div>
                                </div>
                                <h4>Technical Issues Summary</h4>
                                <table>
                                  <thead>
                                    <tr><th>Issue Type</th><th>Count</th></tr>
                                  </thead>
                                  <tbody>
                                    <tr><td>Missing Meta Titles</td><td>${dataToUse.issues?.missingMetaTitles || 0}</td></tr>
                                    <tr><td>Missing Meta Descriptions</td><td>${dataToUse.issues?.missingMetaDescriptions || 0}</td></tr>
                                    <tr><td>Missing H1 Tags</td><td>${dataToUse.issues?.missingH1Tags || 0}</td></tr>
                                    <tr><td>404 Errors</td><td>${dataToUse.notFoundErrors?.length || 0}</td></tr>
                                  </tbody>
                                </table>
                                ${dataToUse.largeImageDetails && Array.isArray(dataToUse.largeImageDetails) && dataToUse.largeImageDetails.length > 0 ? `
                                  <h4>All Large Images Requiring Optimization</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Image</th><th>Size (KB)</th><th>Page</th></tr>
                                    </thead>
                                    <tbody>
                                      ${dataToUse.largeImageDetails.map(img => 
                                        '<tr><td>' + (img.imageUrl.split('/').pop() || img.imageUrl) + '</td><td>' + img.sizeKB + '</td><td>' + img.pageUrl.replace(/^https?:\/\//g, '').substring(0, 50) + '...</td></tr>'
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                                ${dataToUse.recommendations && Array.isArray(dataToUse.recommendations) ? `
                                  <h4>All Recommendations</h4>
                                  <ul>
                                    ${dataToUse.recommendations.map(rec => '<li>' + rec + '</li>').join('')}
                                  </ul>
                                ` : ''}
                              `;
                            } else if (section === 'backlinks' && typeof sectionData === 'object') {
                              sectionContent = `
                                <div class="metric-grid">
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.domainAuthority || 'N/A'}</div>
                                    <div class="metric-label">Domain Authority</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.totalBacklinks || 'N/A'}</div>
                                    <div class="metric-label">Total Backlinks</div>
                                  </div>
                                  <div class="metric-card">
                                    <div class="metric-value">${sectionData.referringDomains || 'N/A'}</div>
                                    <div class="metric-label">Referring Domains</div>
                                  </div>
                                </div>
                                ${sectionData.topBacklinks && Array.isArray(sectionData.topBacklinks) && sectionData.topBacklinks.length > 0 ? `
                                  <h4>All Top Authority Backlinks</h4>
                                  <table>
                                    <thead>
                                      <tr><th>Domain</th><th>Authority</th><th>Anchor Text</th><th>Type</th></tr>
                                    </thead>
                                    <tbody>
                                      ${sectionData.topBacklinks.map(link => 
                                        `<tr><td>${link.domain}</td><td>${link.authority}</td><td>${link.anchor}</td><td>${link.type}</td></tr>`
                                      ).join('')}
                                    </tbody>
                                  </table>
                                ` : ''}
                              `;
                            } else if (section === 'technology' && typeof sectionData === 'object') {
                              sectionContent = `
                                <h4>Technology Stack</h4>
                                <table>
                                  <thead>
                                    <tr><th>Component</th><th>Technology</th></tr>
                                  </thead>
                                  <tbody>
                                    <tr><td>CMS</td><td>${sectionData.cms || 'Not detected'}</td></tr>
                                    <tr><td>Framework</td><td>${sectionData.framework || 'Not detected'}</td></tr>
                                    <tr><td>Analytics</td><td>${sectionData.analytics || 'Not detected'}</td></tr>
                                    <tr><td>Hosting</td><td>${sectionData.hosting || 'Not detected'}</td></tr>
                                    ${sectionData.cdn ? `<tr><td>CDN</td><td>${sectionData.cdn}</td></tr>` : ''}
                                  </tbody>
                                </table>
                                ${sectionData.plugins && Array.isArray(sectionData.plugins) && sectionData.plugins.length > 0 ? `
                                  <h4>WordPress Plugins Detected</h4>
                                  <p>${sectionData.plugins.join(', ')}</p>
                                ` : ''}
                              `;
                            } else {
                              sectionContent = '<p>No detailed data available for this section.</p>';
                            }
                            
                            return `
                              <div class="section">
                                <div class="section-title">${sectionName}</div>
                                ${sectionContent}
                              </div>
                            `;
                          }).join('') : ''}
                          
                          <div class="footer">
                            <p>This report was generated by Web Audit Pro - PMW Professional Marketing & Web Design</p>
                            <p>Generated on ${currentDate.toLocaleString()}</p>
                          </div>
                          
                          <div class="no-print">
                            <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                              Tip: Use your browser's "Save as PDF" option to save this report as a PDF file.
                            </p>
                          </div>
                        </body>
                      </html>
                    `;
                    
                    console.log('Opening audit report print window...');
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 500);
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Export PDF
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Only show results when audit is complete */}
      {showResults ? (
        <>
          {/* Keywords Section - Full Width */}
          {audit.sections.includes('keywords') && (
        <div className="card-pmw mb-6">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {SECTION_LABELS['keywords']}
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
                {renderSectionResults('keywords', audit.results.keywords, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined)}
              </div>
            ) : (
              <LoadingMessages section="keywords" />
            )}
          </div>
        </div>
      )}

      {/* Traffic Insights - Full Width */}
      {audit.sections.includes('traffic') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.traffic}
              <Tooltip 
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">How Traffic Insights Works</p>
                    <p className="mb-2">We analyze your website using publicly available data to estimate monthly organic traffic.</p>
                    <p className="mb-2"><strong>What we measure:</strong></p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Number of pages on your site</li>
                      <li>Content quality and structure</li>
                      <li>SEO indicators and rankings</li>
                      <li>Industry benchmarks</li>
                    </ul>
                    <p className="mt-2 text-sm">The data shows your 12-month average to account for seasonal variations.</p>
                  </div>
                }
              >
                <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="traffic" />
              ) : (
                renderSectionResults("traffic", audit.results?.traffic || {}, setInternalLinksModal, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Technology Stack - Full Width */}
      {audit.sections.includes('technology') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.technology}
              <Tooltip 
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Technology Stack Analysis</p>
                    <p className="mb-2">We detect and analyze the technologies powering your website.</p>
                    <p className="mb-2"><strong>What we identify:</strong></p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Content Management Systems (CMS)</li>
                      <li>E-commerce platforms</li>
                      <li>Analytics & tracking tools</li>
                      <li>Frameworks & libraries</li>
                      <li>Security & performance tools</li>
                    </ul>
                    <p className="mt-2 text-sm">Understanding your tech stack helps identify optimization opportunities.</p>
                  </div>
                }
              >
                <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="technology" />
              ) : (
                renderSectionResults("technology", audit.results?.technology || {}, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance & Technical Audit - Full Width */}
      {(audit.sections.includes('performance') || audit.sections.includes('technical')) && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              Performance & Technical Audit
              <Tooltip 
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Performance & Technical Audit</p>
                    <p className="mb-2">Comprehensive analysis of site performance and technical SEO health.</p>
                    <p className="mb-2"><strong>Performance Metrics:</strong></p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Core Web Vitals (LCP, CLS, INP)</li>
                      <li>Desktop & Mobile performance scores</li>
                      <li>Page load speed optimization</li>
                    </ul>
                    <p className="mb-2 mt-2"><strong>Technical SEO:</strong></p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Meta tags and H1 structure</li>
                      <li>Image optimization analysis</li>
                      <li>404 errors and broken links</li>
                      <li>Site health (HTTPS, sitemap, robots.txt)</li>
                    </ul>
                    <p className="mt-2 text-sm">Critical factors for both user experience and search rankings.</p>
                  </div>
                }
              >
                <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="performance" />
              ) : (
                renderSectionResults(
                  audit.sections.includes('technical') ? "technical" : "performance", 
                  {...(audit.results?.performance || {}), ...(audit.results?.technical || {})}, 
                  undefined, 
                  showMethodologyExpanded, 
                  toggleMethodology, 
                  setPageModalState,
                  performancePagination,
                  setPerformancePagination
                )
              )}
            </div>
          </div>
        </div>
      )}


      {/* Authority & Backlinks - Full Width */}
      {audit.sections.includes('backlinks') && (
        <div className="card-pmw">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {SECTION_LABELS.backlinks}
              <Tooltip 
                content={
                  <div className="max-w-sm">
                    <p className="font-semibold mb-2">Authority & Backlinks Analysis</p>
                    <p className="mb-2">We analyze your website's authority and backlink profile.</p>
                    <p className="mb-2"><strong>What we check:</strong></p>
                    <ul className="list-disc list-inside mb-2 text-xs">
                      <li>Domain Authority score</li>
                      <li>Total backlinks pointing to your site</li>
                      <li>Number of referring domains</li>
                      <li>Quality and authority of linking sites</li>
                    </ul>
                    <p><strong>Why important:</strong> High-quality backlinks signal trust and authority to search engines, directly impacting your search rankings.</p>
                  </div>
                }
                position="top"
              >
                <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
              </Tooltip>
            </h3>
            <div className="mt-4">
              {!isHydrated || audit.status === "pending" || audit.status === "running" ? (
                <LoadingMessages section="backlinks" />
              ) : (
                renderSectionResults("backlinks", audit.results?.backlinks || {}, undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Sections - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audit.sections.filter(section => section !== 'keywords' && section !== 'technology' && section !== 'traffic' && section !== 'performance' && section !== 'technical' && section !== 'backlinks').map((sectionId) => (
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
                  {renderSectionResults(sectionId, audit.results[sectionId], undefined, showMethodologyExpanded, toggleMethodology, setPageModalState, undefined, undefined)}
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
                  We're conducting a comprehensive audit of {audit.sections.length} sections.
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
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
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
  setPerformancePagination?: (state: { currentPage: number; itemsPerPage: number } | ((prev: { currentPage: number; itemsPerPage: number }) => { currentPage: number; itemsPerPage: number })) => void
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
              <div className="text-2xl font-bold text-blue-600">{results.brandedKeywords || results.brandedKeywordsList?.length || 0}</div>
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
              <div className="text-2xl font-bold text-green-600">{results.nonBrandedKeywords || results.nonBrandedKeywordsList?.length || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Non-branded Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Non-branded Keywords</p>
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
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.aboveFoldKeywords || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Above Fold Keywords
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Above Fold Keywords</p>
                      <p className="mb-2"><strong>Definition:</strong> Keywords that appear in the immediately visible area of your pages (above the fold)</p>
                      <p className="mb-2"><strong>Includes:</strong> Title tags, H1 headings, first paragraph, meta descriptions</p>
                      <p className="mb-2"><strong>Importance:</strong> These keywords get maximum visibility and SEO weight</p>
                      <p><strong>Best Practice:</strong> Focus your most important keywords above the fold</p>
                    </div>
                  }
                  position="top"
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
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
            
            {/* Domain Authority */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.domainAuthority || 'N/A'}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Domain Authority
                <Tooltip 
                  content={
                    <div>
                      <p className="font-semibold mb-2">Domain Authority Score</p>
                      <p className="mb-2"><strong>Range:</strong> 1-100 (higher is better)</p>
                      <p className="mb-2"><strong>Source:</strong> SEMrush Authority Score</p>
                      <p className="mb-2"><strong>Scoring:</strong> 1-20 (Low), 20-40 (Fair), 40-60 (Good), 60+ (Excellent)</p>
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


          {/* Above Fold Keywords Table */}
          {results.aboveFoldKeywordsList && results.aboveFoldKeywordsList.length > 0 && (
            <AboveFoldKeywordTable 
              keywords={results.aboveFoldKeywordsList}
              title="Above Fold Keywords"
              description="Keywords ranking in the top 3 positions on Google (above the fold in search results)"
              discoveryMethod={results.aboveFoldDiscoveryMethod}
            />
          )}

          {/* Keyword Competition Analysis */}
          {results.keywordCompetition && (
            <KeywordCompetitionTable 
              competitionData={results.keywordCompetition}
              title="Keyword Competition"
              description="Competitor websites with the highest keyword overlap based on your Above Fold Keywords"
            />
          )}

          {/* Above Fold Competitor Analysis */}
          {results.aboveFoldCompetitors && results.aboveFoldCompetitors.competitors && (
            <AboveFoldCompetitorTable 
              analysis={results.aboveFoldCompetitors}
              title="Main Competition Analysis"
            />
          )}

          {/* Branded Keywords Table */}
          {results.brandedKeywordsList && (
            <BrandedKeywordTable 
              keywords={results.brandedKeywordsList}
              title="All Branded Keywords"
              description="Complete list of search terms that include your brand name or company name"
            />
          )}

          {/* Non-branded Keywords Table */}
          {results.nonBrandedKeywordsList && (
            <NonBrandedKeywordTable 
              keywords={results.nonBrandedKeywordsList}
              title="All Non-branded Keywords"
              description="Complete list of industry and service-related keywords that drive new customer acquisition"
            />
          )}

        </div>
      )

    case "performance":
    case "technical":
      return (
        <div className="space-y-6">
          {/* Performance Overview Section */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">
              <Tooltip content={
                <div className="max-w-sm">
                  <p className="font-semibold mb-1">Performance Metrics Overview</p>
                  <p>Average Core Web Vitals across all analyzed pages. These metrics are calculated from real page performance data.</p>
                </div>
              }>
                Performance Metrics (Average)
              </Tooltip>
            </h4>
            
            {/* Desktop vs Mobile */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Desktop Performance</h4>
                  <span className={`px-2 py-1 rounded text-xs ${results.desktop?.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {results.desktop?.status === 'pass' ? 'PASS' : 'NEEDS WORK'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Largest Contentful Paint</p>
                        <p>Average time for the largest content element to load across all pages. Good: &lt;2.5s</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">LCP:</span>
                    </Tooltip>
                    <span className={results.desktop?.lcp?.includes('1.') || results.desktop?.lcp?.includes('2.') ? 'text-green-600' : 'text-red-600'}>
                      {results.desktop?.lcp || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Cumulative Layout Shift</p>
                        <p>Average visual stability score across all pages. Good: &lt;0.1, measures unexpected layout shifts.</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">CLS:</span>
                    </Tooltip>
                    <span className={parseFloat(results.desktop?.cls || '0') < 0.1 ? 'text-green-600' : 'text-red-600'}>
                      {results.desktop?.cls || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Interaction to Next Paint</p>
                        <p>Average page responsiveness across all pages. Good: &lt;200ms, measures how quickly pages respond to user interactions.</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">INP:</span>
                    </Tooltip>
                    <span className={parseInt(results.desktop?.inp || '0') < 200 ? 'text-green-600' : 'text-red-600'}>
                      {results.desktop?.inp || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Mobile Performance</h4>
                  <span className={`px-2 py-1 rounded text-xs ${results.mobile?.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {results.mobile?.status === 'pass' ? 'PASS' : 'NEEDS WORK'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Largest Contentful Paint (Mobile)</p>
                        <p>Average mobile loading performance across all pages. Mobile is typically slower than desktop. Good: &lt;2.5s</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">LCP:</span>
                    </Tooltip>
                    <span className={results.mobile?.lcp?.includes('2.') ? 'text-green-600' : 'text-red-600'}>
                      {results.mobile?.lcp || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Cumulative Layout Shift (Mobile)</p>
                        <p>Average mobile visual stability across all pages. Good: &lt;0.1, measures layout shifts on mobile devices.</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">CLS:</span>
                    </Tooltip>
                    <span className={parseFloat(results.mobile?.cls || '0') < 0.1 ? 'text-green-600' : 'text-red-600'}>
                      {results.mobile?.cls || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Tooltip content={
                      <div className="max-w-sm">
                        <p className="font-semibold mb-1">Interaction to Next Paint (Mobile)</p>
                        <p>Average mobile responsiveness across all pages. Good: &lt;200ms, measures touch/tap response times.</p>
                      </div>
                    }>
                      <span className="text-gray-600 cursor-help">INP:</span>
                    </Tooltip>
                    <span className={parseInt(results.mobile?.inp || '0') < 200 ? 'text-green-600' : 'text-red-600'}>
                      {results.mobile?.inp || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Page Performance Metrics Table */}
          {results.pages && results.pages.some((page: any) => page.performance) && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Page Performance Metrics</h4>
              <p className="text-sm text-gray-600 mb-4">
                Core Web Vitals for each page, sorted by worst-performing first. Pages with poor scores need optimization.
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
                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                  >
                                    {page.title || page.url.split('/').pop() || 'Page'}
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
            <h4 className="font-semibold mb-3 text-lg">Technical Health</h4>
            
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

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-3">Key Recommendations</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {results.recommendations?.slice(0, 5).map((rec: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

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
              {results.organization && (
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