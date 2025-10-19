/**
 * Audit Summary Service
 * Analyzes all audit results and generates prioritized action items
 */

export interface SummaryIssue {
  id: string
  title: string
  description: string
  category: 'performance' | 'accessibility' | 'seo' | 'technical' | 'content'
  severity: 'critical' | 'high' | 'medium' | 'low'
  impact: {
    coreWebVitals?: number // 0-100 potential improvement
    searchRanking?: number // 0-100 potential improvement
    accessibility?: number // 0-100 potential improvement
    userExperience?: number // 0-100 potential improvement
  }
  effort: 'low' | 'medium' | 'high'
  priorityScore: number
  section: string
  sectionId: string // For navigation
  fixRecommendation: string
  estimatedTimeToFix: string
  legalRisk: boolean
  quickWin: boolean
  affectedPages?: number
  detailsLink?: string
}

export interface AuditSummaryResult {
  totalIssues: number
  criticalIssues: number
  highPriorityIssues: number
  quickWins: number
  estimatedTotalTime: string
  topPriorities: SummaryIssue[]
  byCategory: {
    performance: SummaryIssue[]
    accessibility: SummaryIssue[]
    seo: SummaryIssue[]
    technical: SummaryIssue[]
    content: SummaryIssue[]
  }
}

/**
 * Generate comprehensive audit summary from all audit results
 */
export function generateAuditSummary(auditResults: any): AuditSummaryResult {
  const issues: SummaryIssue[] = []

  // Extract issues from each audit section
  if (auditResults.performance) {
    issues.push(...extractPerformanceIssues(auditResults.performance))
  }

  if (auditResults.technical) {
    issues.push(...extractTechnicalIssues(auditResults.technical))
  }

  if (auditResults.accessibility) {
    issues.push(...extractAccessibilityIssues(auditResults.accessibility))
  }

  if (auditResults.keywords) {
    issues.push(...extractSEOIssues(auditResults.keywords))
  }

  if (auditResults.traffic) {
    issues.push(...extractTrafficIssues(auditResults.traffic))
  }

  // Calculate priority scores for all issues
  const prioritizedIssues = issues.map(issue => ({
    ...issue,
    priorityScore: calculatePriorityScore(issue)
  }))

  // Sort by priority score (highest first)
  prioritizedIssues.sort((a, b) => b.priorityScore - a.priorityScore)

  // Categorize issues
  const byCategory = {
    performance: prioritizedIssues.filter(i => i.category === 'performance'),
    accessibility: prioritizedIssues.filter(i => i.category === 'accessibility'),
    seo: prioritizedIssues.filter(i => i.category === 'seo'),
    technical: prioritizedIssues.filter(i => i.category === 'technical'),
    content: prioritizedIssues.filter(i => i.category === 'content')
  }

  // Calculate metrics
  const criticalIssues = prioritizedIssues.filter(i => i.severity === 'critical').length
  const highPriorityIssues = prioritizedIssues.filter(i => i.severity === 'high').length
  const quickWins = prioritizedIssues.filter(i => i.quickWin).length

  return {
    totalIssues: prioritizedIssues.length,
    criticalIssues,
    highPriorityIssues,
    quickWins,
    estimatedTotalTime: calculateTotalTime(prioritizedIssues),
    topPriorities: prioritizedIssues.slice(0, 10), // Top 10 priorities
    byCategory
  }
}

/**
 * Calculate priority score based on multiple factors
 */
function calculatePriorityScore(issue: SummaryIssue): number {
  let score = 0

  // Severity weight (30%)
  const severityScores = { critical: 100, high: 70, medium: 40, low: 20 }
  score += severityScores[issue.severity] * 0.3

  // Impact weight (40%)
  const impactScore = Math.max(
    issue.impact.coreWebVitals || 0,
    issue.impact.searchRanking || 0,
    issue.impact.accessibility || 0,
    issue.impact.userExperience || 0
  )
  score += impactScore * 0.4

  // Legal/Compliance risk (20%)
  if (issue.legalRisk) {
    score += 100 * 0.2
  }

  // Effort vs. Benefit (10%)
  const effortScores = { low: 100, medium: 60, high: 30 }
  score += effortScores[issue.effort] * 0.1

  // Quick win bonus
  if (issue.quickWin) {
    score += 15
  }

  return Math.round(score)
}

/**
 * Extract performance issues
 */
function extractPerformanceIssues(performanceData: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Core Web Vitals issues
  if (performanceData.desktop?.scores) {
    const { lcp, cls, inp } = performanceData.desktop.scores

    if (lcp && lcp.score < 90) {
      issues.push({
        id: 'perf-lcp',
        title: 'Poor Largest Contentful Paint (LCP)',
        description: `LCP is ${lcp.displayValue}. Target is under 2.5s for good user experience.`,
        category: 'performance',
        severity: lcp.score < 50 ? 'critical' : lcp.score < 75 ? 'high' : 'medium',
        impact: {
          coreWebVitals: 100 - lcp.score,
          searchRanking: 80,
          userExperience: 90
        },
        effort: 'medium',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'performance',
        fixRecommendation: 'Optimize images, reduce server response time, eliminate render-blocking resources',
        estimatedTimeToFix: '2-4 hours',
        legalRisk: false,
        quickWin: false
      })
    }

    if (cls && cls.score < 90) {
      issues.push({
        id: 'perf-cls',
        title: 'Cumulative Layout Shift (CLS) Issues',
        description: `CLS is ${cls.displayValue}. Pages are shifting unexpectedly during load.`,
        category: 'performance',
        severity: cls.score < 50 ? 'critical' : cls.score < 75 ? 'high' : 'medium',
        impact: {
          coreWebVitals: 100 - cls.score,
          userExperience: 85,
          searchRanking: 70
        },
        effort: 'medium',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'performance',
        fixRecommendation: 'Add size attributes to images/videos, reserve space for ads, avoid inserting content above existing content',
        estimatedTimeToFix: '1-3 hours',
        legalRisk: false,
        quickWin: false
      })
    }

    if (inp && inp.score < 90) {
      issues.push({
        id: 'perf-inp',
        title: 'Slow Interaction to Next Paint (INP)',
        description: `INP is ${inp.displayValue}. User interactions are sluggish.`,
        category: 'performance',
        severity: inp.score < 50 ? 'critical' : inp.score < 75 ? 'high' : 'medium',
        impact: {
          coreWebVitals: 100 - inp.score,
          userExperience: 95,
          searchRanking: 75
        },
        effort: 'high',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'performance',
        fixRecommendation: 'Optimize JavaScript execution, reduce main thread work, break up long tasks',
        estimatedTimeToFix: '3-6 hours',
        legalRisk: false,
        quickWin: false
      })
    }
  }

  return issues
}

/**
 * Extract technical issues
 */
function extractTechnicalIssues(technicalData: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Large images
  if (technicalData.images?.largeImages?.length > 0) {
    const largeImagesCount = technicalData.images.largeImages.length
    issues.push({
      id: 'tech-large-images',
      title: `${largeImagesCount} Large Unoptimized Images`,
      description: `Found ${largeImagesCount} images over 100KB. These slow down page load significantly.`,
      category: 'performance',
      severity: largeImagesCount > 10 ? 'critical' : largeImagesCount > 5 ? 'high' : 'medium',
      impact: {
        coreWebVitals: Math.min(largeImagesCount * 5, 90),
        userExperience: 80,
        searchRanking: 60
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'performance',
      fixRecommendation: 'Compress images using WebP/AVIF format, implement lazy loading, use responsive images',
      estimatedTimeToFix: '1-2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: largeImagesCount
    })
  }

  // Missing meta descriptions
  if (technicalData.seo?.missingMetaDescriptions > 0) {
    const count = technicalData.seo.missingMetaDescriptions
    issues.push({
      id: 'tech-meta-descriptions',
      title: `${count} Pages Missing Meta Descriptions`,
      description: `${count} pages don't have meta descriptions, hurting click-through rates from search.`,
      category: 'seo',
      severity: count > 10 ? 'high' : 'medium',
      impact: {
        searchRanking: 85,
        userExperience: 40
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Add unique, compelling meta descriptions (150-160 characters) to each page',
      estimatedTimeToFix: '30 min - 2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: count
    })
  }

  // Missing H1 tags
  if (technicalData.seo?.missingH1 > 0) {
    const count = technicalData.seo.missingH1
    issues.push({
      id: 'tech-h1-tags',
      title: `${count} Pages Missing H1 Tags`,
      description: `${count} pages lack H1 headings, confusing search engines and users.`,
      category: 'seo',
      severity: 'high',
      impact: {
        searchRanking: 90,
        accessibility: 60,
        userExperience: 50
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Add descriptive H1 tag to each page with target keywords',
      estimatedTimeToFix: '30 min - 1 hour',
      legalRisk: false,
      quickWin: true,
      affectedPages: count
    })
  }

  // Broken links
  if (technicalData.links?.brokenLinks > 0) {
    const count = technicalData.links.brokenLinks
    issues.push({
      id: 'tech-broken-links',
      title: `${count} Broken Links Detected`,
      description: `${count} links return 404 errors, hurting SEO and user experience.`,
      category: 'technical',
      severity: count > 20 ? 'critical' : count > 10 ? 'high' : 'medium',
      impact: {
        searchRanking: 85,
        userExperience: 90
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Fix or remove broken links, implement 301 redirects where appropriate',
      estimatedTimeToFix: '1-3 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: count
    })
  }

  return issues
}

/**
 * Extract accessibility issues
 */
function extractAccessibilityIssues(accessibilityData: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Check if single result or multi-page
  const results = 'pages' in accessibilityData ? accessibilityData.pages : [accessibilityData]

  // Aggregate stats
  const totalCritical = results.reduce((sum: number, r: any) => sum + (r.issuesBySeverity?.critical || 0), 0)
  const totalSerious = results.reduce((sum: number, r: any) => sum + (r.issuesBySeverity?.serious || 0), 0)
  const avgScore = Math.round(results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / results.length)

  // Critical accessibility violations
  if (totalCritical > 0) {
    issues.push({
      id: 'a11y-critical',
      title: `${totalCritical} Critical Accessibility Violations`,
      description: `Critical WCAG violations blocking disabled users. Legal liability risk.`,
      category: 'accessibility',
      severity: 'critical',
      impact: {
        accessibility: 100,
        userExperience: 85,
        searchRanking: 40
      },
      effort: 'medium',
      priorityScore: 0,
      section: 'Accessibility',
      sectionId: 'accessibility',
      fixRecommendation: 'Address critical issues: missing alt text, keyboard navigation, color contrast, form labels',
      estimatedTimeToFix: '2-6 hours',
      legalRisk: true,
      quickWin: false,
      affectedPages: results.length
    })
  }

  // EAA/UK compliance
  if (!results[0]?.eaaCompliant) {
    issues.push({
      id: 'a11y-compliance',
      title: 'Non-Compliant with UK/EAA Accessibility Laws',
      description: `Website doesn't meet WCAG 2.2 AA. Risk of fines up to €3M under European Accessibility Act.`,
      category: 'accessibility',
      severity: 'critical',
      impact: {
        accessibility: 100
      },
      effort: 'high',
      priorityScore: 0,
      section: 'Accessibility',
      sectionId: 'accessibility',
      fixRecommendation: 'Achieve WCAG 2.2 Level AA compliance. Consider accessibility plugins or manual fixes.',
      estimatedTimeToFix: '1-2 weeks',
      legalRisk: true,
      quickWin: false
    })
  }

  return issues
}

/**
 * Extract SEO issues from keywords
 */
function extractSEOIssues(keywordsData: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Low keyword coverage
  if (keywordsData.nonBrandedKeywords?.length < 10) {
    issues.push({
      id: 'seo-keywords',
      title: 'Limited Non-Branded Keyword Rankings',
      description: `Only ${keywordsData.nonBrandedKeywords?.length || 0} non-branded keywords ranking. Missing opportunities.`,
      category: 'seo',
      severity: 'high',
      impact: {
        searchRanking: 90,
        userExperience: 30
      },
      effort: 'high',
      priorityScore: 0,
      section: 'Keywords',
      sectionId: 'keywords',
      fixRecommendation: 'Create content targeting recommended keywords, optimize existing pages for secondary keywords',
      estimatedTimeToFix: '2-4 weeks',
      legalRisk: false,
      quickWin: false
    })
  }

  // Keyword opportunities
  if (keywordsData.recommendedKeywords?.length > 0) {
    const opportunities = keywordsData.recommendedKeywords.slice(0, 5).length
    issues.push({
      id: 'seo-opportunities',
      title: `${opportunities} High-Value Keyword Opportunities`,
      description: `Found ${opportunities} keywords with good search volume and low competition.`,
      category: 'content',
      severity: 'medium',
      impact: {
        searchRanking: 80,
        userExperience: 50
      },
      effort: 'medium',
      priorityScore: 0,
      section: 'Keywords',
      sectionId: 'keywords',
      fixRecommendation: 'Create targeted content for recommended keywords, optimize page titles and headings',
      estimatedTimeToFix: '1-2 weeks',
      legalRisk: false,
      quickWin: false
    })
  }

  return issues
}

/**
 * Extract traffic-related issues
 */
function extractTrafficIssues(trafficData: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Low organic traffic
  const organicTraffic = trafficData.organic?.total || 0
  if (organicTraffic < 1000) {
    issues.push({
      id: 'traffic-low-organic',
      title: 'Low Organic Traffic',
      description: `Only ${organicTraffic.toLocaleString()} monthly organic visits. Significant growth opportunity.`,
      category: 'seo',
      severity: 'medium',
      impact: {
        searchRanking: 85,
        userExperience: 20
      },
      effort: 'high',
      priorityScore: 0,
      section: 'Traffic',
      sectionId: 'traffic',
      fixRecommendation: 'Improve SEO fundamentals, create quality content, build backlinks, target long-tail keywords',
      estimatedTimeToFix: '3-6 months',
      legalRisk: false,
      quickWin: false
    })
  }

  return issues
}

/**
 * Calculate total estimated time
 */
function calculateTotalTime(issues: SummaryIssue[]): string {
  let totalHours = 0

  issues.forEach(issue => {
    // Parse time estimate
    const timeStr = issue.estimatedTimeToFix
    if (timeStr.includes('week')) {
      const weeks = parseInt(timeStr)
      totalHours += weeks * 40 // 40 hours per week
    } else if (timeStr.includes('hour')) {
      const hours = parseInt(timeStr)
      totalHours += hours
    } else if (timeStr.includes('min')) {
      const mins = parseInt(timeStr)
      totalHours += mins / 60
    }
  })

  if (totalHours < 8) {
    return `${Math.round(totalHours)} hours`
  } else if (totalHours < 40) {
    return `${Math.round(totalHours / 8)} days`
  } else {
    return `${Math.round(totalHours / 40)} weeks`
  }
}
