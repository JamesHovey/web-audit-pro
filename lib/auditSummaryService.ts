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
  pageUrl?: string // The URL of the page with the issue
  imageData?: {
    totalImages: number
    largeImages: number
    averageSize: number
    totalSavings: string
    recommendations?: any[]
    quickWins?: any[]
    largeImageDetails?: Array<{
      imageUrl: string
      pageUrl: string
      sizeKB: number
    }>
  }
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
export function generateAuditSummary(auditResults: any, pageUrl?: string): AuditSummaryResult {
  const issues: SummaryIssue[] = []

  // Extract issues from each audit section
  if (auditResults.performance) {
    issues.push(...extractPerformanceIssues(auditResults.performance, pageUrl))
  }

  // Technical issues are often embedded in performance results
  if (auditResults.performance) {
    issues.push(...extractTechnicalIssues(auditResults.performance, pageUrl, auditResults.technical))
  }

  if (auditResults.accessibility) {
    issues.push(...extractAccessibilityIssues(auditResults.accessibility, pageUrl))
  }

  if (auditResults.keywords) {
    issues.push(...extractSEOIssues(auditResults.keywords, pageUrl))
  }

  if (auditResults.traffic) {
    issues.push(...extractTrafficIssues(auditResults.traffic, pageUrl))
  }

  // Deduplicate issues by ID (keep the first occurrence, which is usually more specific)
  const deduplicatedIssues = issues.filter((issue, index, self) =>
    index === self.findIndex((i) => i.id === issue.id)
  )

  // Calculate priority scores for all issues
  const prioritizedIssues = deduplicatedIssues.map(issue => ({
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
function extractPerformanceIssues(performanceData: any, pageUrl?: string): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Parse LCP value (format: "5.5s" or "11.4s")
  const parseLCP = (lcpString: string): number => {
    if (!lcpString || lcpString === 'N/A') return 0
    return parseFloat(lcpString.replace('s', '')) * 1000 // Convert to ms
  }

  // Parse CLS value (format: "0.000")
  const parseCLS = (clsString: string): number => {
    if (!clsString || clsString === 'N/A') return 0
    return parseFloat(clsString)
  }

  // Check desktop performance
  if (performanceData.desktop) {
    const desktop = performanceData.desktop
    const lcpMs = parseLCP(desktop.lcp)
    const cls = parseCLS(desktop.cls)

    // LCP issues (target < 2500ms)
    if (lcpMs > 2500) {
      const severity = lcpMs > 4000 ? 'critical' : lcpMs > 3000 ? 'high' : 'medium'
      issues.push({
        id: 'perf-lcp-desktop',
        title: 'Slow Largest Contentful Paint (LCP)',
        description: `Desktop LCP is ${desktop.lcp} (target: under 2.5s). This impacts user experience and search rankings.`,
        category: 'performance',
        severity,
        impact: {
          coreWebVitals: Math.min(Math.round((lcpMs - 2500) / 40), 95),
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
        quickWin: false,
        pageUrl
      })
    }

    // CLS issues (target < 0.1)
    if (cls > 0.1) {
      issues.push({
        id: 'perf-cls-desktop',
        title: 'Layout Shift Issues (CLS)',
        description: `Desktop CLS is ${desktop.cls} (target: under 0.1). Page elements shift unexpectedly.`,
        category: 'performance',
        severity: cls > 0.25 ? 'high' : 'medium',
        impact: {
          coreWebVitals: Math.min(Math.round(cls * 400), 90),
          userExperience: 85,
          searchRanking: 70
        },
        effort: 'medium',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'performance',
        fixRecommendation: 'Add size attributes to images/videos, reserve space for ads',
        estimatedTimeToFix: '1-3 hours',
        legalRisk: false,
        quickWin: false,
        pageUrl
      })
    }
  }

  // Check mobile performance (often worse)
  if (performanceData.mobile) {
    const mobile = performanceData.mobile
    const lcpMs = parseLCP(mobile.lcp)

    if (lcpMs > 2500) {
      const severity = lcpMs > 4000 ? 'critical' : 'high'
      issues.push({
        id: 'perf-lcp-mobile',
        title: 'Critical Mobile Performance Issue',
        description: `Mobile LCP is ${mobile.lcp} (target: under 2.5s). ${Math.round(100 - mobile.score)}% of mobile users experience slow loading.`,
        category: 'performance',
        severity,
        impact: {
          coreWebVitals: Math.min(Math.round((lcpMs - 2500) / 40), 95),
          searchRanking: 90, // Mobile-first indexing
          userExperience: 95
        },
        effort: 'high',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'performance',
        fixRecommendation: 'Prioritize mobile optimization: compress images, lazy load content, minimize JavaScript',
        estimatedTimeToFix: '4-8 hours',
        legalRisk: false,
        quickWin: false,
        pageUrl
      })
    }
  }

  return issues
}

/**
 * Extract technical issues
 */
function extractTechnicalIssues(technicalData: any, pageUrl?: string, technicalResults?: any): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Large images - check in imageOptimizationStrategy
  const imageOptData = technicalData.imageOptimizationStrategy?.imageAnalysis
  const largeImagesCount = imageOptData?.largeImages || technicalData.images?.largeImages?.length || 0

  if (largeImagesCount > 0) {
    const imageData = {
      totalImages: imageOptData?.totalImages || 0,
      largeImages: largeImagesCount,
      averageSize: imageOptData?.averageSize || 0,
      totalSavings: technicalData.imageOptimizationStrategy?.estimatedSavings?.totalSizeReduction || '0 MB',
      recommendations: technicalData.imageOptimizationStrategy?.recommendations || [],
      quickWins: technicalData.imageOptimizationStrategy?.quickWins || [],
      largeImageDetails: technicalResults?.largeImageDetails || []
    }

    issues.push({
      id: 'tech-large-images',
      title: 'Large Images Need Optimization',
      description: largeImagesCount === 1
        ? '1 large image over 100KB detected. This slows down page load significantly.'
        : `${largeImagesCount} large images over 100KB detected. These slow down page load significantly.`,
      category: 'performance',
      severity: largeImagesCount > 10 ? 'high' : largeImagesCount > 5 ? 'medium' : 'low',
      impact: {
        coreWebVitals: Math.min(largeImagesCount * 5, 90),
        userExperience: 80,
        searchRanking: 60
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'performance',
      fixRecommendation: 'Compress images using WebP/AVIF format, implement lazy loading, use responsive images. This will directly improve LCP performance.',
      estimatedTimeToFix: '1-2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: largeImagesCount,
      pageUrl,
      imageData
    })
  }

  // Check technical recommendations from AI analysis
  if (technicalData.technicalSEOIntelligence?.technicalRecommendations) {
    const recommendations = technicalData.technicalSEOIntelligence.technicalRecommendations

    // Missing H1 tags - Skip adding here, will be handled in the combined check below
    // const h1Recommendation = recommendations.find((r: any) =>
    //   r.title?.toLowerCase().includes('h1') || r.description?.toLowerCase().includes('h1 tag')
    // )
  }

  // Check for missing title and H1 tags - combine if both are missing on single page
  const hasMissingTitle = technicalData.performanceDiagnosis?.primaryIssues?.some((i: any) =>
    i.title?.toLowerCase().includes('missing page title') ||
    i.description?.toLowerCase().includes('missing a title tag')
  ) || (technicalData.seo?.missingMetaTitles > 0) || (technicalData.issues?.missingMetaTitles > 0)

  const missingH1Count = technicalData.seo?.missingH1 || 0
  const hasMissingH1 = missingH1Count > 0

  // If both title and H1 are missing on a single page, create a combined issue
  if (hasMissingTitle && hasMissingH1 && missingH1Count === 1) {
    issues.push({
      id: 'tech-page-metadata',
      title: 'Missing Page Title & H1 Tag',
      description: 'Page is missing both title tag and H1 heading. Critical for SEO and content structure.',
      category: 'seo',
      severity: 'critical',
      impact: {
        searchRanking: 95,
        accessibility: 60,
        userExperience: 50
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Add unique, descriptive title tag (50-60 characters) and H1 heading with target keywords',
      estimatedTimeToFix: '15 min',
      legalRisk: false,
      quickWin: true,
      affectedPages: 1,
      pageUrl
    })
  } else {
    // Add them separately if only one is missing or if multiple pages
    if (hasMissingTitle) {
      const titleIssue = technicalData.performanceDiagnosis?.primaryIssues?.find((i: any) =>
        i.title?.toLowerCase().includes('missing page title') ||
        i.description?.toLowerCase().includes('missing a title tag')
      )
      const titleCount = technicalData.seo?.missingMetaTitles || technicalData.issues?.missingMetaTitles || 1

      issues.push({
        id: 'tech-meta-titles',
        title: titleCount === 1 ? 'Missing Page Title' : `${titleCount} Pages Missing Meta Titles`,
        description: titleCount === 1
          ? 'Page missing title tag, critical for SEO.'
          : `${titleCount} pages lack meta titles, severely impacting search engine rankings.`,
        category: 'seo',
        severity: 'critical',
        impact: {
          searchRanking: 95,
          userExperience: 30
        },
        effort: 'low',
        priorityScore: 0,
        section: 'Performance & Technical',
        sectionId: 'technical',
        fixRecommendation: titleCount === 1
          ? 'Add unique, descriptive title tag (50-60 characters) with target keywords'
          : 'Add unique, descriptive meta titles (50-60 characters) to each page with target keywords',
        estimatedTimeToFix: '15 min',
        legalRisk: false,
        quickWin: true,
        affectedPages: titleCount,
        pageUrl
      })
    }

    if (hasMissingH1) {
      issues.push({
        id: 'tech-h1-tags',
        title: missingH1Count === 1 ? 'Missing H1 Tag' : `${missingH1Count} Pages Missing H1 Tags`,
        description: missingH1Count === 1
          ? 'Page lacks H1 heading, confusing search engines and users.'
          : `${missingH1Count} pages lack H1 headings, confusing search engines and users.`,
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
        fixRecommendation: missingH1Count === 1
          ? 'Add descriptive H1 tag with target keywords'
          : 'Add descriptive H1 tag to each page with target keywords',
        estimatedTimeToFix: '30 min - 1 hour',
        legalRisk: false,
        quickWin: true,
        affectedPages: missingH1Count,
        pageUrl
      })
    }
  }

  // Missing meta descriptions
  if (technicalData.seo?.missingMetaDescriptions > 0) {
    const count = technicalData.seo.missingMetaDescriptions
    issues.push({
      id: 'tech-meta-descriptions',
      title: count === 1 ? 'Missing Meta Description' : `${count} Pages Missing Meta Descriptions`,
      description: count === 1
        ? "Page doesn't have a meta description, hurting click-through rates from search."
        : `${count} pages don't have meta descriptions, hurting click-through rates from search.`,
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
      fixRecommendation: count === 1
        ? 'Add unique, compelling meta description (150-160 characters)'
        : 'Add unique, compelling meta descriptions (150-160 characters) to each page',
      estimatedTimeToFix: '30 min - 2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: count,
      pageUrl
    })
  }

  // Broken links
  if (technicalData.links?.brokenLinks > 0) {
    const count = technicalData.links.brokenLinks
    issues.push({
      id: 'tech-broken-links',
      title: count === 1 ? 'Broken Link Detected' : `${count} Broken Links Detected`,
      description: count === 1
        ? 'Link returns 404 error, hurting SEO and user experience.'
        : `${count} links return 404 errors, hurting SEO and user experience.`,
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
      fixRecommendation: count === 1
        ? 'Fix or remove broken link, or implement 301 redirect'
        : 'Fix or remove broken links, implement 301 redirects where appropriate',
      estimatedTimeToFix: '1-3 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: count,
      pageUrl
    })
  }

  // Removed duplicate meta titles check - now handled above in combined check

  // 404 Errors
  if (technicalData.issues?.notFoundErrors > 0 || technicalData.issues?.httpErrors > 0) {
    const count = technicalData.issues?.notFoundErrors || technicalData.issues?.httpErrors || 0
    issues.push({
      id: 'tech-404-errors',
      title: `${count} 404 Errors Found`,
      description: `${count} pages returning 404 errors, creating poor user experience and wasting crawl budget.`,
      category: 'technical',
      severity: count > 20 ? 'critical' : count > 10 ? 'high' : 'medium',
      impact: {
        searchRanking: 80,
        userExperience: 95
      },
      effort: 'medium',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Fix broken pages, implement 301 redirects, or create custom 404 page with helpful navigation',
      estimatedTimeToFix: '2-4 hours',
      legalRisk: false,
      quickWin: false,
      affectedPages: count,
      pageUrl
    })
  }

  // Broken internal links
  if (technicalData.issues?.brokenInternalLinks > 0) {
    const count = technicalData.issues.brokenInternalLinks
    issues.push({
      id: 'tech-broken-internal-links',
      title: `${count} Broken Internal Links`,
      description: `${count} internal links pointing to non-existent pages, hurting SEO and user navigation.`,
      category: 'technical',
      severity: count > 15 ? 'high' : 'medium',
      impact: {
        searchRanking: 75,
        userExperience: 85
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Performance & Technical',
      sectionId: 'technical',
      fixRecommendation: 'Update internal links to point to correct pages or implement redirects',
      estimatedTimeToFix: '1-2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: count,
      pageUrl
    })
  }

  return issues
}

/**
 * Extract accessibility issues
 */
function extractAccessibilityIssues(accessibilityData: any, pageUrl?: string): SummaryIssue[] {
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
      affectedPages: results.length,
      pageUrl
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
      quickWin: false,
      pageUrl
    })
  }

  return issues
}

/**
 * Extract SEO issues from keywords
 */
function extractSEOIssues(keywordsData: any, pageUrl?: string): SummaryIssue[] {
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
      quickWin: false,
      pageUrl
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
      quickWin: false,
      pageUrl
    })
  }

  return issues
}

/**
 * Extract traffic-related issues
 */
function extractTrafficIssues(trafficData: any, pageUrl?: string): SummaryIssue[] {
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
      quickWin: false,
      pageUrl
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
