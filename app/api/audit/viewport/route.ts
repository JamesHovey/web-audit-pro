import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import type { ViewportAuditRequestBody } from '@/types/api'

// Industry standard viewport breakpoints based on 2024 research
const VIEWPORT_BREAKPOINTS = [
  { name: 'Mobile', width: 360, height: 800, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  { name: 'Tablet', width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  { name: 'Desktop', width: 1366, height: 768, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Wide Desktop', width: 1920, height: 1080, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
]

interface ViewportIssue {
  viewport: string
  type: 'critical' | 'warning' | 'info'
  issue: string
  element?: string
  recommendation: string
  impact: string
}

interface ViewportAnalysis {
  viewport: string
  width: number
  height: number
  issues: ViewportIssue[]
  score: number
  hasHorizontalScroll: boolean
  hasBrokenLayout: boolean
  hasTextOverflow: boolean
  hasImageOverflow: boolean
  hasNavigationIssues: boolean
  fontSizeIssues: boolean
  touchTargetIssues: boolean
  screenshot?: string // Base64 encoded screenshot
}

export async function POST(request: NextRequest) {
  let browser = null

  try {
    const { url } = await request.json() as ViewportAuditRequestBody

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const viewportAnalyses: ViewportAnalysis[] = []

    // Launch browser once for all viewports
    console.log('🚀 Launching browser for screenshot capture...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })

    // Analyze each viewport with screenshots
    for (const viewport of VIEWPORT_BREAKPOINTS) {
      console.log(`📸 Capturing ${viewport.name} screenshot...`)
      const analysis = await analyzeViewportWithScreenshot(url, viewport, browser)
      viewportAnalyses.push(analysis)
    }

    // Calculate overall responsive score
    const overallScore = calculateOverallScore(viewportAnalyses)

    // Generate recommendations
    const recommendations = generateRecommendations(viewportAnalyses)

    return NextResponse.json({
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      viewports: viewportAnalyses,
      recommendations,
      summary: generateSummary(viewportAnalyses, overallScore)
    })

  } catch (error) {
    console.error('Viewport analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze viewport responsiveness' },
      { status: 500 }
    )
  } finally {
    if (browser) {
      await browser.close()
      console.log('✅ Browser closed')
    }
  }
}

async function analyzeViewportWithScreenshot(
  url: string,
  viewport: typeof VIEWPORT_BREAKPOINTS[0],
  browser: Awaited<ReturnType<typeof puppeteer.launch>>
): Promise<ViewportAnalysis> {
  const page = await browser.newPage()

  try {
    // Set viewport size
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1
    })

    // Set user agent
    await page.setUserAgent(viewport.userAgent)

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Wait a bit for animations/lazy loading
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get page content
    const html = await page.content()

    // Capture screenshot as base64
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: false, // Just capture above-the-fold
      type: 'jpeg',
      quality: 75
    })

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    // Analyze HTML for responsive design patterns
    const analysis = analyzeHtmlForResponsiveness(html, viewport)

    // Add screenshot and real scroll detection
    analysis.screenshot = `data:image/jpeg;base64,${screenshot}`
    analysis.hasHorizontalScroll = hasHorizontalScroll

    // Add horizontal scroll issue if detected
    if (hasHorizontalScroll && !analysis.issues.some(i => i.issue.includes('Horizontal scroll'))) {
      analysis.issues.push({
        viewport: viewport.name,
        type: 'critical',
        issue: 'Horizontal scrolling detected',
        element: 'page container',
        recommendation: 'Set max-width: 100% and overflow-x: hidden on the body. Check for fixed-width elements exceeding viewport.',
        impact: 'Users must scroll horizontally to see content, creating poor user experience'
      })
      analysis.score = Math.max(0, analysis.score - 25)
    }

    await page.close()
    return analysis

  } catch (error) {
    console.error(`Error capturing ${viewport.name}:`, error)
    await page.close()
    // Fallback to HTML-only analysis
    return analyzeViewport(url, viewport)
  }
}

async function analyzeViewport(url: string, viewport: typeof VIEWPORT_BREAKPOINTS[0]): Promise<ViewportAnalysis> {
  try {
    // Use WebFetch to analyze the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': viewport.userAgent
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`)
    }

    const html = await response.text()

    // Analyze HTML for responsive design patterns
    const analysis = analyzeHtmlForResponsiveness(html, viewport)

    return analysis
  } catch (error) {
    // Return empty analysis if fetch fails - no simulation
    console.log(`Failed to analyze ${viewport.name}: ${error}`)
    return {
      viewport: viewport.name,
      width: viewport.width,
      height: viewport.height,
      issues: [{
        viewport: viewport.name,
        type: 'warning',
        issue: 'Unable to analyze viewport',
        recommendation: 'Analysis failed due to connection issues. Try again later.',
        impact: 'Could not determine responsive design status'
      }],
      score: 0,
      hasHorizontalScroll: false,
      hasBrokenLayout: false,
      hasTextOverflow: false,
      hasImageOverflow: false,
      hasNavigationIssues: false,
      fontSizeIssues: false,
      touchTargetIssues: false
    }
  }
}

function analyzeHtmlForResponsiveness(html: string, viewport: typeof VIEWPORT_BREAKPOINTS[0]): ViewportAnalysis {
  const issues: ViewportIssue[] = []
  const isMobile = viewport.width < 768
  const isTablet = viewport.width >= 768 && viewport.width < 1024
  
  // Check for viewport meta tag
  const hasViewportMeta = html.includes('viewport') && html.includes('width=device-width')
  if (!hasViewportMeta && isMobile) {
    issues.push({
      viewport: viewport.name,
      type: 'critical',
      issue: 'Missing viewport meta tag',
      element: '<head>',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the head section',
      impact: 'Page will not scale properly on mobile devices'
    })
  }
  
  // Check for responsive CSS patterns
  const hasMediaQueries = html.includes('@media') || html.includes('media=')
  const hasFlexbox = html.includes('flex') || html.includes('flexbox')
  const hasGrid = html.includes('grid-')
  const hasResponsiveImages = html.includes('srcset') || html.includes('picture')
  
  if (!hasMediaQueries && !hasFlexbox && !hasGrid) {
    issues.push({
      viewport: viewport.name,
      type: 'warning',
      issue: 'No responsive CSS patterns detected',
      recommendation: 'Implement media queries, flexbox, or CSS grid for responsive layouts',
      impact: 'Layout may not adapt properly to different screen sizes'
    })
  }
  
  // Check for fixed widths
  const fixedWidthPattern = /width:\s*\d{3,}px/gi
  const fixedWidthMatches = html.match(fixedWidthPattern) || []
  if (fixedWidthMatches.length > 5 && isMobile) {
    issues.push({
      viewport: viewport.name,
      type: 'warning',
      issue: 'Multiple fixed-width elements detected',
      element: 'various elements',
      recommendation: 'Replace fixed pixel widths with responsive units (%, vw, rem)',
      impact: 'Elements may overflow or cause horizontal scrolling on small screens'
    })
  }
  
  // Check for small font sizes on mobile
  const smallFontPattern = /font-size:\s*([0-9]|1[0-3])px/gi
  const smallFontMatches = html.match(smallFontPattern) || []
  if (smallFontMatches.length > 0 && isMobile) {
    issues.push({
      viewport: viewport.name,
      type: 'warning',
      issue: 'Small font sizes detected',
      recommendation: 'Increase base font size to at least 16px for mobile readability',
      impact: 'Text may be difficult to read on mobile devices'
    })
  }
  
  // Check for responsive images
  if (!hasResponsiveImages && (isMobile || isTablet)) {
    issues.push({
      viewport: viewport.name,
      type: 'info',
      issue: 'Images not optimized for different screen sizes',
      recommendation: 'Use srcset attribute or <picture> element for responsive images',
      impact: 'Images may be larger than necessary, slowing page load'
    })
  }
  
  // Calculate score
  let score = 100
  issues.forEach(issue => {
    if (issue.type === 'critical') score -= 25
    else if (issue.type === 'warning') score -= 15
    else score -= 5
  })
  
  return {
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    issues,
    score: Math.max(0, score),
    hasHorizontalScroll: fixedWidthMatches.length > 5,
    hasBrokenLayout: !hasMediaQueries && !hasFlexbox,
    hasTextOverflow: false,
    hasImageOverflow: !hasResponsiveImages,
    hasNavigationIssues: false,
    fontSizeIssues: smallFontMatches.length > 0,
    touchTargetIssues: false
  }
}

function calculateOverallScore(analyses: ViewportAnalysis[]): number {
  // Weighted scoring - mobile is most important
  const weights = {
    'Mobile': 0.4,
    'Tablet': 0.25,
    'Desktop': 0.25,
    'Wide Desktop': 0.1
  }
  
  let weightedScore = 0
  analyses.forEach(analysis => {
    const weight = weights[analysis.viewport as keyof typeof weights] || 0.25
    weightedScore += analysis.score * weight
  })
  
  return Math.round(weightedScore)
}

function generateRecommendations(analyses: ViewportAnalysis[]) {
  const allIssues = analyses.flatMap(a => a.issues)
  const criticalIssues = allIssues.filter(i => i.type === 'critical')
  const warningIssues = allIssues.filter(i => i.type === 'warning')
  
  const recommendations = []
  
  if (criticalIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Critical Responsive Issues',
      description: 'Fix these issues immediately for basic mobile usability',
      items: [...new Set(criticalIssues.map(i => i.recommendation))]
    })
  }
  
  if (warningIssues.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Responsive Improvements',
      description: 'Address these to improve user experience across devices',
      items: [...new Set(warningIssues.map(i => i.recommendation))]
    })
  }
  
  // Add best practices
  recommendations.push({
    priority: 'low',
    title: 'Best Practices',
    description: 'Consider implementing these responsive design best practices',
    items: [
      'Use relative units (rem, em, %) instead of fixed pixels where possible',
      'Implement a mobile-first CSS approach',
      'Test on real devices, not just browser dev tools',
      'Use CSS Grid or Flexbox for flexible layouts',
      'Optimize images with srcset for different screen resolutions'
    ]
  })
  
  return recommendations
}

function generateSummary(analyses: ViewportAnalysis[], overallScore: number) {
  const criticalCount = analyses.reduce((sum, a) => 
    sum + a.issues.filter(i => i.type === 'critical').length, 0)
  const warningCount = analyses.reduce((sum, a) => 
    sum + a.issues.filter(i => i.type === 'warning').length, 0)
  
  let status = 'excellent'
  let message = 'Your site is highly responsive across all devices'
  
  if (overallScore < 50) {
    status = 'poor'
    message = 'Significant responsive design issues detected. Immediate attention needed.'
  } else if (overallScore < 70) {
    status = 'needs-improvement'
    message = 'Several responsive design issues found. Consider addressing critical issues first.'
  } else if (overallScore < 90) {
    status = 'good'
    message = 'Site is generally responsive with minor issues to address.'
  }
  
  return {
    status,
    score: overallScore,
    message,
    criticalIssues: criticalCount,
    warnings: warningCount,
    testedViewports: analyses.length
  }
}