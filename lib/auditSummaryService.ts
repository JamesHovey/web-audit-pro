/**
 * Audit Summary Service
 * Analyzes all audit results and generates prioritized action items
 */

import { analyzeHeadingHierarchy, type HeadingIssue } from './headingHierarchyService'

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
  subsectionId?: string // Optional subsection target for more precise navigation
  fixRecommendation: string
  estimatedTimeToFix: string
  legalRisk: boolean
  quickWin: boolean
  affectedPages?: number
  affectedItems?: number // Generic count (e.g., images, plugins, etc.)
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
  affectedPagesList?: Array<{
    url: string
    title: string
    details?: string // Additional details about the issue on this page
  }> // Detailed list of affected pages for modal display
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

  // Extract scope information from audit results
  const scope = auditResults.scope || 'single' // 'single', 'all', or 'custom'
  const totalPages = auditResults.totalPages || 1

  // Extract issues from each audit section
  if (auditResults.performance) {
    issues.push(...extractPerformanceIssues(
      auditResults.performance,
      pageUrl,
      scope,
      totalPages,
      auditResults.technology || auditResults.technical
    ))
  }

  // Technical issues are often embedded in performance results
  if (auditResults.performance) {
    issues.push(...extractTechnicalIssues(
      auditResults.performance,
      pageUrl,
      auditResults.technology || auditResults.technical,
      scope,
      totalPages
    ))
  }

  if (auditResults.accessibility) {
    issues.push(...extractAccessibilityIssues(auditResults.accessibility, pageUrl, scope, totalPages))
  }

  if (auditResults.keywords) {
    issues.push(...extractSEOIssues(auditResults.keywords, pageUrl, scope, totalPages))
  }

  if (auditResults.traffic) {
    issues.push(...extractTrafficIssues(auditResults.traffic, pageUrl, scope, totalPages))
  }

  // Extract technology/plugin insights
  if (auditResults.technology || auditResults.technical || auditResults.performance) {
    issues.push(...extractTechnologyInsights(
      auditResults.technology || auditResults.technical,
      auditResults.performance,
      pageUrl,
      scope,
      totalPages
    ))
  }

  // Extract viewport responsiveness issues
  if (auditResults.viewport) {
    issues.push(...extractViewportIssues(auditResults.viewport, pageUrl, scope, totalPages))
  }

  // Deduplicate issues by ID (keep the first occurrence, which is usually more specific)
  const deduplicatedIssues = issues.filter((issue, index, self) =>
    index === self.findIndex((i) => i.id === issue.id)
  )

  // Filter out Core Web Vitals issues (LCP, CLS) from Audit Summary
  // These are shown in the Performance section instead
  const filteredIssues = deduplicatedIssues.filter(issue =>
    !issue.id.startsWith('perf-lcp') && !issue.id.startsWith('perf-cls')
  )

  // Calculate priority scores for all issues
  const prioritizedIssues = filteredIssues.map(issue => ({
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
 * Helper function to generate scope-aware text for issue descriptions
 */
function getScopeText(scope: string, totalPages: number, singular: string, plural: string, customPlural?: string): string {
  if (scope === 'single') {
    return singular
  } else if (scope === 'custom') {
    return customPlural || `${totalPages} selected ${plural}`
  } else {
    // scope === 'all'
    return plural
  }
}

/**
 * Calculate priority score based on multiple factors
 * Prioritizes SEO and Technical issues over Core Web Vitals
 */
function calculatePriorityScore(issue: SummaryIssue): number {
  let score = 0

  // Severity weight (30%)
  const severityScores = { critical: 100, high: 70, medium: 40, low: 20 }
  score += severityScores[issue.severity] * 0.3

  // Impact weight (40%) - Prioritize SEO over Core Web Vitals
  const impactScore = Math.max(
    (issue.impact.searchRanking || 0) * 1.2, // Boost SEO ranking importance by 20%
    issue.impact.accessibility || 0,
    issue.impact.userExperience || 0,
    (issue.impact.coreWebVitals || 0) * 0.6 // Reduce Core Web Vitals importance by 40%
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
function extractPerformanceIssues(performanceData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1, technologyData?: any): SummaryIssue[] {
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

  // Skip generic image optimization check - we have a more specific one in extractTechnicalIssues that includes actual counts and links to the table

  if (performanceData.recommendations && Array.isArray(performanceData.recommendations)) {
    // Check for JavaScript optimization
    const hasJSOptimization = performanceData.recommendations.some((rec: string) =>
      rec.toLowerCase().includes('javascript') ||
      rec.toLowerCase().includes('js')
    )

    if (hasJSOptimization) {
      issues.push({
        id: 'perf-js-optimization',
        title: 'Excessive JavaScript Slowing Page Load',
        description: 'Unused or unoptimized JavaScript is impacting page performance and user experience.',
        category: 'performance',
        severity: 'medium',
        impact: {
          coreWebVitals: 65,
          userExperience: 70,
          searchRanking: 50
        },
        effort: 'medium',
        priorityScore: 0,
        section: 'Performance & Technical Audit',
        sectionId: 'performance',
        fixRecommendation: 'Remove unused JavaScript, defer non-critical scripts, minify and bundle JavaScript files, and consider code splitting.',
        estimatedTimeToFix: '3-6 hours',
        legalRisk: false,
        quickWin: false,
        pageUrl
      })
    }

    // Check for render-blocking resources
    const hasRenderBlocking = performanceData.recommendations.some((rec: string) =>
      rec.toLowerCase().includes('render-blocking') ||
      rec.toLowerCase().includes('css')
    )

    if (hasRenderBlocking) {
      // Check if technology audit was run and look for relevant plugins
      let pluginRecommendation = ''
      let hasRelevantPlugins = false
      let cmsRecommendation = ''

      if (technologyData) {
        // Detect CMS
        const cms = technologyData.cms?.toLowerCase() || ''

        // Check for installed optimization plugins
        if (Array.isArray(technologyData.plugins)) {
          const optimizationPlugins = technologyData.plugins.filter((plugin: any) => {
            const name = plugin.name?.toLowerCase() || ''
            return name.includes('cache') ||
                   name.includes('optimization') ||
                   name.includes('optimize') ||
                   name.includes('speed') ||
                   name.includes('performance') ||
                   name.includes('minif') ||
                   name.includes('wp rocket') ||
                   name.includes('w3 total cache') ||
                   name.includes('autoptimize')
          })

          if (optimizationPlugins.length > 0) {
            hasRelevantPlugins = true
            const pluginNames = optimizationPlugins.map((p: any) => p.name).slice(0, 3).join(', ')
            pluginRecommendation = ` Your installed plugins (${pluginNames}) may have settings to help address this.`
          }
        }

        // CMS-specific recommendations
        if (cms.includes('wordpress')) {
          cmsRecommendation = hasRelevantPlugins
            ? ''
            : ' For WordPress, consider installing WP Rocket, Autoptimize, or W3 Total Cache to automatically handle CSS/JS optimization.'
        } else if (cms.includes('shopify')) {
          cmsRecommendation = ' For Shopify, use the Theme Editor to defer JavaScript and consider apps like Booster: Page Speed Optimizer or Hyperspeed.'
        } else if (cms.includes('wix')) {
          cmsRecommendation = ' Wix handles most optimization automatically. Enable "Lazy Load" in Site Settings and use the "Performance" tab in Dashboard.'
        } else if (cms.includes('squarespace')) {
          cmsRecommendation = ' Squarespace manages asset loading automatically. Minimize custom code and use native blocks where possible.'
        } else if (cms.includes('webflow')) {
          cmsRecommendation = ' In Webflow, enable "Minify HTML, CSS & JavaScript" in Project Settings > Publishing tab.'
        } else if (cms.includes('drupal')) {
          cmsRecommendation = ' For Drupal, enable "Aggregate CSS files" and "Aggregate JavaScript files" in Performance settings. Consider the Advanced CSS/JS Aggregation module.'
        } else if (cms.includes('joomla')) {
          cmsRecommendation = ' For Joomla, enable "Gzip Page Compression" in Global Configuration > Server. Consider extensions like JCH Optimize or Speed Cache.'
        } else if (cms) {
          cmsRecommendation = ` Detected CMS: ${cms}. Look for built-in optimization settings or recommended performance plugins/extensions for this platform.`
        }
      }

      const techStackRecommendation = !technologyData
        ? ' Run the Performance & Technical Audit audit to get CMS-specific optimization recommendations.'
        : ''

      issues.push({
        id: 'perf-render-blocking',
        title: 'Render-Blocking Resources Delay Page Display',
        description: `CSS and JavaScript files are blocking the page from rendering quickly, creating a poor first impression.${pluginRecommendation}${techStackRecommendation}`,
        category: 'performance',
        severity: 'medium',
        impact: {
          coreWebVitals: 70,
          userExperience: 75,
          searchRanking: 55
        },
        effort: 'medium',
        priorityScore: 0,
        section: 'Performance & Technical Audit',
        sectionId: 'performance',
        fixRecommendation: hasRelevantPlugins
          ? 'Inline critical CSS, defer non-critical CSS, async load JavaScript, and minimize render-blocking resources. Check your optimization plugin settings for CSS/JS minification and deferral options.'
          : `Inline critical CSS, defer non-critical CSS, async load JavaScript, and minimize render-blocking resources.${cmsRecommendation || ' Consider using a CMS-specific optimization plugin or built-in performance settings.'}`,
        estimatedTimeToFix: '2-4 hours',
        legalRisk: false,
        quickWin: false,
        pageUrl
      })
    }
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
        section: 'Performance & Technical Audit',
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
        section: 'Performance & Technical Audit',
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
        section: 'Performance & Technical Audit',
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
function extractTechnicalIssues(technicalData: any, pageUrl?: string, technicalResults?: any, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
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
      largeImageDetails: technicalResults?.largeImageDetails || technicalData.largeImageDetails || []
    }

    const scopeContext = scope === 'single'
      ? 'on this page'
      : scope === 'custom'
        ? `across ${totalPages} selected pages`
        : 'across the site'

    issues.push({
      id: 'tech-large-images',
      title: largeImagesCount === 1 ? 'Large Image Needs Optimisation' : 'Large Images Need Optimisation',
      description: largeImagesCount === 1
        ? `1 large image over 100KB detected ${scopeContext}. This slows down page load significantly.`
        : `${largeImagesCount} large images over 100KB detected ${scopeContext}. These slow down page load significantly.`,
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
      subsectionId: 'large-images-table',
      fixRecommendation: 'Compress images using WebP/AVIF format, implement lazy loading, use responsive images. This will directly improve LCP performance.',
      estimatedTimeToFix: '1-2 hours',
      legalRisk: false,
      quickWin: true,
      affectedPages: scope === 'single' ? 1 : totalPages,
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
  // ONLY trust the actual technical audit data, not Claude's analysis which can hallucinate
  const hasMissingTitle = (technicalData.seo?.missingMetaTitles > 0) || (technicalData.issues?.missingMetaTitles > 0)

  const missingH1Count = technicalData.seo?.missingH1 || 0
  const hasMissingH1 = missingH1Count > 0

  // If both title and H1 are missing on a single page, create a combined issue
  if (hasMissingTitle && hasMissingH1 && missingH1Count === 1) {
    const pageContext = scope === 'single' ? 'This page is' : 'Page is'

    issues.push({
      id: 'tech-page-metadata',
      title: 'Missing <title> & <h1> Tags',
      description: `${pageContext} missing both <title> tag and <h1> heading. Critical for SEO and content structure.`,
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
    // Only add title issue if it's actually missing (not just H1 missing)
    if (hasMissingTitle && !hasMissingH1) {
      const titleIssue = technicalData.performanceDiagnosis?.primaryIssues?.find((i: any) =>
        i.title?.toLowerCase().includes('missing page title') ||
        i.description?.toLowerCase().includes('missing a title tag')
      )
      const titleCount = technicalData.seo?.missingMetaTitles || technicalData.issues?.missingMetaTitles || 1

      const titleDescription = scope === 'single'
        ? 'This page is missing a title tag, critical for SEO.'
        : scope === 'custom'
          ? `${titleCount} of ${totalPages} selected pages lack meta titles, severely impacting search engine rankings.`
          : `${titleCount} pages lack meta titles, severely impacting search engine rankings.`

      issues.push({
        id: 'tech-meta-titles',
        title: titleCount === 1 ? 'Missing <title> Tag' : `${titleCount} Pages Missing <title> Tags`,
        description: titleDescription,
        category: 'seo',
        severity: 'critical',
        impact: {
          searchRanking: 95,
          userExperience: 30
        },
        effort: 'low',
        priorityScore: 0,
        section: 'Performance & Technical Audit',
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
      const h1Description = scope === 'single'
        ? 'This page lacks an H1 heading, confusing search engines and users.'
        : scope === 'custom'
          ? `${missingH1Count} of ${totalPages} selected pages lack H1 headings, confusing search engines and users.`
          : `${missingH1Count} pages lack H1 headings, confusing search engines and users.`

      issues.push({
        id: 'tech-h1-tags',
        title: missingH1Count === 1 ? 'Missing <h1> Tag' : `${missingH1Count} Pages Missing <h1> Tags`,
        description: h1Description,
        category: 'seo',
        severity: 'high',
        impact: {
          searchRanking: 90,
          accessibility: 60,
          userExperience: 50
        },
        effort: 'low',
        priorityScore: 0,
        section: 'Performance & Technical Audit',
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

    const metaDescription = scope === 'single'
      ? "This page doesn't have a meta description, hurting click-through rates from search."
      : scope === 'custom'
        ? `${count} of ${totalPages} selected pages don't have meta descriptions, hurting click-through rates from search.`
        : `${count} pages don't have meta descriptions, hurting click-through rates from search.`

    issues.push({
      id: 'tech-meta-descriptions',
      title: count === 1 ? 'Missing Meta Description' : `${count} Pages Missing Meta Descriptions`,
      description: metaDescription,
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

  // Heading hierarchy analysis - analyze all pages with HTML
  const pages = technicalResults?.pages || technicalData.pages || (technicalData.html ? [{ url: pageUrl, title: 'Page', html: technicalData.html }] : [])

  if (pages.length > 0) {
    // Analyze heading hierarchy for each page and aggregate by issue type
    const headingIssuesByType: Map<HeadingIssue['type'], Array<{ url: string; title: string; details: string }>> = new Map()

    pages.forEach((page: any) => {
      if (page.html) {
        const headingAnalysis = analyzeHeadingHierarchy(page.html)

        if (headingAnalysis.hasIssues) {
          headingAnalysis.issues.forEach((headingIssue: HeadingIssue) => {
            if (!headingIssuesByType.has(headingIssue.type)) {
              headingIssuesByType.set(headingIssue.type, [])
            }

            headingIssuesByType.get(headingIssue.type)!.push({
              url: page.url,
              title: page.title || 'Untitled Page',
              details: headingIssue.affectedHeadings?.join(', ') || headingIssue.description
            })
          })
        }
      }
    })

    // Create aggregated issues
    const severityMap: Record<HeadingIssue['severity'], SummaryIssue['severity']> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low'
    }

    const impactMap: Record<HeadingIssue['type'], SummaryIssue['impact']> = {
      missing_h1: { searchRanking: 90, accessibility: 60 },
      multiple_h1: { searchRanking: 70, accessibility: 50 },
      skipped_level: { searchRanking: 60, accessibility: 80 },
      no_headings: { searchRanking: 95, accessibility: 90 },
      empty_heading: { searchRanking: 50, accessibility: 70 }
    }

    const effortMap: Record<HeadingIssue['type'], SummaryIssue['effort']> = {
      missing_h1: 'low',
      multiple_h1: 'low',
      skipped_level: 'medium',
      no_headings: 'medium',
      empty_heading: 'low'
    }

    const timeMap: Record<HeadingIssue['type'], string> = {
      missing_h1: '15-30 min',
      multiple_h1: '30 min - 1 hour',
      skipped_level: '1-2 hours',
      no_headings: '2-4 hours',
      empty_heading: '30 min - 1 hour'
    }

    const titleMap: Record<HeadingIssue['type'], (count: number) => string> = {
      missing_h1: (count) => count === 1 ? 'Page Missing <h1> Tag' : `${count} Pages Missing <h1> Tags`,
      multiple_h1: (count) => count === 1 ? 'Page Has Multiple <h1> Tags' : `${count} Pages Have Multiple <h1> Tags`,
      skipped_level: (count) => count === 1 ? 'Page Has Skipped Heading Levels' : `${count} Pages Have Skipped Heading Levels`,
      no_headings: (count) => count === 1 ? 'Page Has No Headings' : `${count} Pages Have No Headings`,
      empty_heading: (count) => count === 1 ? 'Page Has Empty Headings' : `${count} Pages Have Empty Headings`
    }

    const descriptionMap: Record<HeadingIssue['type'], (count: number) => string> = {
      missing_h1: (count) => count === 1
        ? 'This page lacks an H1 heading, confusing search engines and users.'
        : `${count} pages lack H1 headings, confusing search engines and users.`,
      multiple_h1: (count) => count === 1
        ? 'This page has multiple H1 tags. Best practice is to use only one H1 per page.'
        : `${count} pages have multiple H1 tags. Best practice is to use only one H1 per page.`,
      skipped_level: (count) => count === 1
        ? 'This page skips heading levels (e.g., H2 → H4). Headings should follow a logical order.'
        : `${count} pages skip heading levels (e.g., H2 → H4). Headings should follow a logical order.`,
      no_headings: (count) => count === 1
        ? 'This page has no heading tags (H1-H6). Headings provide structure for both users and search engines.'
        : `${count} pages have no heading tags (H1-H6). Headings provide structure for both users and search engines.`,
      empty_heading: (count) => count === 1
        ? 'This page has empty headings with no content. These provide no value to users or search engines.'
        : `${count} pages have empty headings with no content. These provide no value to users or search engines.`
    }

    const severityByType: Record<HeadingIssue['type'], HeadingIssue['severity']> = {
      missing_h1: 'high',
      multiple_h1: 'medium',
      skipped_level: 'medium',
      no_headings: 'critical',
      empty_heading: 'high'
    }

    headingIssuesByType.forEach((affectedPages, issueType) => {
      const count = affectedPages.length

      issues.push({
        id: `tech-heading-${issueType}`,
        title: titleMap[issueType](count),
        description: descriptionMap[issueType](count),
        category: 'seo',
        severity: severityMap[severityByType[issueType]],
        impact: impactMap[issueType],
        effort: effortMap[issueType],
        priorityScore: 0,
        section: 'Performance & Technical Audit',
        sectionId: 'technical',
        fixRecommendation: 'Correct heading hierarchy to follow proper H1→H2→H3 structure without skipping levels',
        estimatedTimeToFix: timeMap[issueType],
        legalRisk: false,
        quickWin: issueType === 'missing_h1' || issueType === 'empty_heading',
        affectedPages: count,
        affectedPagesList: affectedPages,
        pageUrl: scope === 'single' ? pageUrl : undefined
      })
    })
  }

  // Broken links
  if (technicalData.links?.brokenLinks > 0) {
    const count = technicalData.links.brokenLinks

    const brokenLinksDescription = scope === 'single'
      ? count === 1
        ? 'This page has a broken link that returns a 404 error, hurting SEO and user experience.'
        : `This page has ${count} broken links that return 404 errors, hurting SEO and user experience.`
      : scope === 'custom'
        ? `${count} broken links found across ${totalPages} selected pages, hurting SEO and user experience.`
        : `${count} links return 404 errors, hurting SEO and user experience.`

    issues.push({
      id: 'tech-broken-links',
      title: count === 1 ? 'Broken Link Detected' : `${count} Broken Links Detected`,
      description: brokenLinksDescription,
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

    const errorDescription = scope === 'single'
      ? 'This page returns a 404 error, creating poor user experience and wasting crawl budget.'
      : scope === 'custom'
        ? `${count} of ${totalPages} selected pages return 404 errors, creating poor user experience and wasting crawl budget.`
        : `${count} pages returning 404 errors, creating poor user experience and wasting crawl budget.`

    issues.push({
      id: 'tech-404-errors',
      title: `${count} 404 Errors Found`,
      description: errorDescription,
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

    const internalLinksDescription = scope === 'single'
      ? `${count} internal links on this page point to non-existent pages, hurting SEO and user navigation.`
      : scope === 'custom'
        ? `${count} broken internal links found across ${totalPages} selected pages, hurting SEO and user navigation.`
        : `${count} internal links pointing to non-existent pages, hurting SEO and user navigation.`

    issues.push({
      id: 'tech-broken-internal-links',
      title: `${count} Broken Internal Links`,
      description: internalLinksDescription,
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
function extractAccessibilityIssues(accessibilityData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Check if single result or multi-page
  const results = 'pages' in accessibilityData ? accessibilityData.pages : [accessibilityData]

  // Aggregate stats
  const totalCritical = results.reduce((sum: number, r: any) => sum + (r.issuesBySeverity?.critical || 0), 0)
  const totalSerious = results.reduce((sum: number, r: any) => sum + (r.issuesBySeverity?.serious || 0), 0)
  const avgScore = Math.round(results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / results.length)

  // Critical accessibility violations
  if (totalCritical > 0) {
    const a11yDescription = scope === 'single'
      ? `${totalCritical} critical WCAG violations found on this page, blocking disabled users. Legal liability risk.`
      : scope === 'custom'
        ? `${totalCritical} critical WCAG violations found across ${totalPages} selected pages, blocking disabled users. Legal liability risk.`
        : `${totalCritical} critical WCAG violations found, blocking disabled users. Legal liability risk.`

    issues.push({
      id: 'a11y-critical',
      title: `${totalCritical} Critical Accessibility Violations`,
      description: a11yDescription,
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
    const complianceDescription = scope === 'single'
      ? "This page doesn't meet WCAG 2.2 AA standards. Risk of fines up to €3M under European Accessibility Act."
      : scope === 'custom'
        ? `${totalPages} selected pages don't meet WCAG 2.2 AA standards. Risk of fines up to €3M under European Accessibility Act.`
        : "Website doesn't meet WCAG 2.2 AA. Risk of fines up to €3M under European Accessibility Act."

    issues.push({
      id: 'a11y-compliance',
      title: 'Non-Compliant with UK/EAA Accessibility Laws',
      description: complianceDescription,
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
function extractSEOIssues(keywordsData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Handle both formats: nonBrandedKeywordsList (array) or nonBrandedKeywords (number or array)
  const keywordList = keywordsData.nonBrandedKeywordsList || keywordsData.nonBrandedKeywords
  const keywordCount = Array.isArray(keywordList) ? keywordList.length : (typeof keywordList === 'number' ? keywordList : 0)

  // Low keyword coverage
  if (keywordCount < 10) {
    const keywordDescription = scope === 'single'
      ? `This page ranks for only ${keywordCount} non-branded keywords. Missing opportunities for broader visibility.`
      : scope === 'custom'
        ? `${totalPages} selected pages rank for only ${keywordCount} non-branded keywords combined. Missing opportunities.`
        : `Only ${keywordCount} non-branded keywords ranking. Missing opportunities.`

    issues.push({
      id: 'seo-keywords',
      title: 'Limited Non-Branded Keyword Rankings',
      description: keywordDescription,
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
    const opportunitiesDescription = scope === 'single'
      ? `Found ${opportunities} high-value keywords with good search volume and low competition that this page could target.`
      : `Found ${opportunities} high-value keywords with good search volume and low competition.`

    issues.push({
      id: 'seo-opportunities',
      title: `${opportunities} High-Value Keyword Opportunities`,
      description: opportunitiesDescription,
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
function extractTrafficIssues(trafficData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Note: Traffic data is pattern-based estimation, not actual analytics
  // Removed "Low Organic Traffic" warning as it's not helpful without real data

  return issues
}

/**
 * Extract technology and plugin insights for executive summary
 */
function extractTechnologyInsights(technicalData: any, performanceData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  // Check if we have plugin data
  if (!technicalData?.plugins && !technicalData?.cms && !performanceData?.cms) {
    return issues
  }

  // Handle both array and object formats for plugins
  let detectedPlugins: string[] = []
  if (technicalData?.plugins) {
    if (Array.isArray(technicalData.plugins)) {
      detectedPlugins = technicalData.plugins
    } else if (typeof technicalData.plugins === 'object') {
      // Plugin data is categorized (seo, page-builder, analytics, etc.)
      // Extract all plugin names from all categories
      Object.values(technicalData.plugins).forEach((category: any) => {
        if (Array.isArray(category)) {
          category.forEach((plugin: any) => {
            if (plugin.name) {
              detectedPlugins.push(plugin.name)
            }
          })
        }
      })
    }
  }

  const cms = technicalData?.cms || performanceData?.cms
  const pageBuilder = technicalData?.pageBuilder

  // WordPress site with minimal plugins
  if (cms === 'WordPress' && detectedPlugins.length > 0 && detectedPlugins.length < 5) {
    issues.push({
      id: 'tech-minimal-plugins',
      title: 'Limited WordPress Plugin Usage',
      description: `Only ${detectedPlugins.length} plugins detected (${detectedPlugins.join(', ')}). Consider adding SEO, caching, and security plugins.`,
      category: 'technical',
      severity: 'medium',
      impact: {
        searchRanking: 60,
        userExperience: 50
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Technology Stack',
      sectionId: 'technical',
      fixRecommendation: 'Install essential plugins: SEO (Yoast/Rank Math), Caching (WP Rocket), Security (Wordfence)',
      estimatedTimeToFix: '1-2 hours',
      legalRisk: false,
      quickWin: true,
      pageUrl
    })
  }

  // WordPress site with many plugins
  if (cms === 'WordPress' && detectedPlugins.length > 15) {
    issues.push({
      id: 'tech-plugin-bloat',
      title: 'Excessive Plugin Usage Detected',
      description: `${detectedPlugins.length} plugins detected. This can slow down your site and create security vulnerabilities.`,
      category: 'performance',
      severity: 'medium',
      impact: {
        coreWebVitals: 65,
        userExperience: 70,
        searchRanking: 50
      },
      effort: 'medium',
      priorityScore: 0,
      section: 'Technology Stack',
      sectionId: 'technical',
      fixRecommendation: 'Audit plugins, remove unused ones, replace multiple plugins with all-in-one solutions',
      estimatedTimeToFix: '2-4 hours',
      legalRisk: false,
      quickWin: false,
      pageUrl
    })
  }

  // No caching plugin detected (WordPress)
  if (cms === 'WordPress' && detectedPlugins && (Array.isArray(detectedPlugins) ? detectedPlugins.length > 0 : Object.keys(detectedPlugins).length > 0)) {
    let hasCachingPlugin = false;

    // Check if detectedPlugins is categorized (from hybrid detection)
    if (!Array.isArray(detectedPlugins) && typeof detectedPlugins === 'object' && detectedPlugins.performance) {
      // Categorized format from hybrid detection
      hasCachingPlugin = detectedPlugins.performance.some((plugin: any) =>
        plugin.subcategory === 'caching' || (plugin.name && plugin.name.toLowerCase().includes('cache'))
      );
    } else if (Array.isArray(detectedPlugins)) {
      // Legacy array format
      hasCachingPlugin = detectedPlugins.some((plugin: any) => {
        const pluginStr = typeof plugin === 'string' ? plugin : (plugin?.name || '');
        const pluginLower = pluginStr.toLowerCase();
        return pluginLower.includes('cache') ||
          pluginLower.includes('rocket') ||
          pluginLower.includes('w3') ||
          pluginLower.includes('litespeed');
      });
    }

    if (!hasCachingPlugin) {
      issues.push({
        id: 'tech-no-caching',
        title: 'No Caching Plugin Detected',
        description: 'WordPress site without caching plugin. This significantly impacts page load speed.',
        category: 'performance',
        severity: 'high',
        impact: {
          coreWebVitals: 80,
          userExperience: 85,
          searchRanking: 75
        },
        effort: 'low',
        priorityScore: 0,
        section: 'Technology Stack',
        sectionId: 'technical',
        fixRecommendation: 'Install and configure a caching plugin like WP Rocket, LiteSpeed Cache, or W3 Total Cache',
        estimatedTimeToFix: '30 min - 1 hour',
        legalRisk: false,
        quickWin: true,
        pageUrl
      })
    }
  }

  // No SEO plugin detected (WordPress)
  if (cms === 'WordPress') {
    let hasSEOPlugin = false;

    // Check if detectedPlugins is categorized (from hybrid detection)
    if (!Array.isArray(detectedPlugins) && typeof detectedPlugins === 'object' && detectedPlugins.seo) {
      // Categorized format from hybrid detection
      hasSEOPlugin = detectedPlugins.seo.length > 0;
    } else if (Array.isArray(detectedPlugins) && detectedPlugins.length > 0) {
      // Legacy array format
      hasSEOPlugin = detectedPlugins.some((plugin: string) => {
        const pluginLower = plugin.toLowerCase()
        return pluginLower.includes('yoast') ||
          pluginLower.includes('rank math') ||
          pluginLower.includes('seopress') ||
          pluginLower.includes('aioseo') ||
          pluginLower.includes('all in one seo') ||
          pluginLower.includes('squirrly') ||
          pluginLower.includes('seo framework') ||
          (pluginLower.includes('seo') && !pluginLower.includes('image')) // Generic SEO but not image SEO
      })
    }

    if (!hasSEOPlugin) {
      issues.push({
        id: 'tech-no-seo-plugin',
        title: 'No SEO Plugin Detected',
        description: 'Missing SEO plugin makes it harder to optimize content and manage technical SEO.',
        category: 'seo',
        severity: 'medium',
        impact: {
          searchRanking: 70,
          userExperience: 30
        },
        effort: 'low',
        priorityScore: 0,
        section: 'Technology Stack',
        sectionId: 'technical',
        fixRecommendation: 'Install an SEO plugin like Yoast SEO, Rank Math, or All in One SEO',
        estimatedTimeToFix: '1 hour',
        legalRisk: false,
        quickWin: true,
        pageUrl
      })
    }
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

/**
 * Extract viewport responsiveness issues for the Audit Summary
 */
function extractViewportIssues(viewportData: any, pageUrl?: string, scope: string = 'single', totalPages: number = 1): SummaryIssue[] {
  const issues: SummaryIssue[] = []

  if (!viewportData) return issues

  // Check overall responsive score
  const score = viewportData.overallScore || 100

  // Add issue if score is below acceptable threshold
  if (score < 90) {
    const severity = score < 50 ? 'critical' : score < 70 ? 'high' : 'medium'
    const criticalIssues = viewportData.globalIssues?.filter((issue: any) => issue.severity === 'critical') || []
    const warningIssues = viewportData.globalIssues?.filter((issue: any) => issue.severity === 'warning') || []

    // Count issues by type
    let issueDescription = 'Website has responsive design issues affecting mobile and tablet users.'
    if (criticalIssues.length > 0) {
      const types = [...new Set(criticalIssues.map((i: any) => {
        switch(i.type) {
          case 'horizontal_scroll': return 'horizontal scrolling'
          case 'small_touch_targets': return 'small touch targets'
          case 'small_text': return 'small text'
          case 'layout_break': return 'layout breaks'
          case 'navigation_issues': return 'navigation problems'
          case 'content_hidden': return 'hidden content'
          case 'viewport_meta': return 'viewport configuration'
          default: return 'responsive issues'
        }
      }))]
      issueDescription = `Critical responsive issues detected: ${types.join(', ')}. ${warningIssues.length > 0 ? `Also ${warningIssues.length} warning(s).` : ''}`
    } else if (warningIssues.length > 0) {
      issueDescription = `${warningIssues.length} responsive design warning(s) found that should be addressed.`
    }

    issues.push({
      id: 'viewport-responsive',
      title: 'Responsive Design Issues',
      description: issueDescription,
      category: 'accessibility',
      severity: severity,
      impact: {
        userExperience: 80,
        accessibility: 70,
        searchRanking: 60 // Google prioritizes mobile-friendly sites
      },
      effort: severity === 'critical' ? 'high' : 'medium',
      priorityScore: 0,
      section: 'Viewport Responsiveness',
      sectionId: 'viewport',
      fixRecommendation: viewportData.cssAnalysis?.hasViewportMeta
        ? 'Fix layout breaks, ensure touch targets are at least 48x48px, use responsive font sizes (minimum 16px), and test on actual devices.'
        : 'Add viewport meta tag (<meta name="viewport" content="width=device-width, initial-scale=1">), fix layout breaks, ensure touch targets are at least 48x48px, and use responsive font sizes.',
      estimatedTimeToFix: severity === 'critical' ? '8-16 hours' : '4-8 hours',
      legalRisk: false,
      quickWin: severity === 'medium' && !viewportData.cssAnalysis?.hasViewportMeta,
      pageUrl,
      affectedPages: scope === 'single' ? undefined : totalPages
    })
  }

  // Check for missing viewport meta tag specifically (quick win)
  if (viewportData.cssAnalysis && !viewportData.cssAnalysis.hasViewportMeta) {
    issues.push({
      id: 'viewport-meta-missing',
      title: 'Missing Viewport Meta Tag',
      description: 'The viewport meta tag is missing, causing poor mobile display and zooming issues.',
      category: 'technical',
      severity: 'high',
      impact: {
        userExperience: 75,
        searchRanking: 50,
        accessibility: 60
      },
      effort: 'low',
      priorityScore: 0,
      section: 'Viewport Responsiveness',
      sectionId: 'viewport',
      fixRecommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section of your HTML.',
      estimatedTimeToFix: '5-15 minutes',
      legalRisk: false,
      quickWin: true,
      pageUrl,
      affectedPages: scope === 'single' ? undefined : totalPages
    })
  }

  return issues
}
