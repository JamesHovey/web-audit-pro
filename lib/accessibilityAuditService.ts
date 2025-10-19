import puppeteer from 'puppeteer'
import { AxePuppeteer } from '@axe-core/puppeteer'
import pa11y from 'pa11y'
import { detectInstalledAccessibilityPlugins, getInstalledAccessibilityPlugins, getRecommendedPlugins, AccessibilityPluginMetadata } from './accessibilityPluginRecommendations'

// WCAG Principles
const WCAG_PRINCIPLES = {
  perceivable: 'Perceivable',
  operable: 'Operable',
  understandable: 'Understandable',
  robust: 'Robust'
}

// Severity levels
const SEVERITY_LEVELS = {
  critical: 'Critical',
  serious: 'Serious',
  moderate: 'Moderate',
  minor: 'Minor'
}

export interface AccessibilityIssue {
  id: string
  description: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: string
  wcagPrinciple: string
  help: string
  helpUrl: string
  elementSelector?: string
  htmlSnippet?: string
  fixRecommendation: string
  codeExample?: string
  source: 'axe' | 'pa11y'
}

export interface AccessibilityResult {
  url: string
  timestamp: string
  score: number
  totalIssues: number
  passedRules: number
  violatedRules: number
  issuesBySeverity: {
    critical: number
    serious: number
    moderate: number
    minor: number
  }
  issuesByPrinciple: {
    perceivable: number
    operable: number
    understandable: number
    robust: number
  }
  issues: AccessibilityIssue[]
  complianceLevel: 'AAA' | 'AA' | 'A' | 'Non-compliant'
  eaaCompliant: boolean
  summary: string
  installedPlugins?: string[]
  installedPluginDetails?: AccessibilityPluginMetadata[]
  recommendedPlugins?: AccessibilityPluginMetadata[]
}

/**
 * Run axe-core accessibility tests using Puppeteer
 */
async function runAxeTests(url: string): Promise<AccessibilityIssue[]> {
  console.log(`🔍 Running axe-core tests on ${url}`)

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Run axe-core tests
    const results = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    // Transform axe results into our format
    const issues: AccessibilityIssue[] = results.violations.map(violation => {
      // Determine WCAG principle from tags
      let principle = 'robust'
      if (violation.tags.some(tag => tag.includes('perceivable') || tag.includes('color-contrast') || tag.includes('text-alternatives'))) {
        principle = 'perceivable'
      } else if (violation.tags.some(tag => tag.includes('keyboard') || tag.includes('navigation') || tag.includes('focus'))) {
        principle = 'operable'
      } else if (violation.tags.some(tag => tag.includes('readable') || tag.includes('predictable') || tag.includes('input'))) {
        principle = 'understandable'
      }

      // Extract WCAG criterion from tags
      const wcagTag = violation.tags.find(tag => tag.match(/wcag\d{3,4}/))
      const wcagLevel = violation.tags.includes('wcag2aaa') ? 'AAA' :
                       violation.tags.includes('wcag2aa') || violation.tags.includes('wcag21aa') || violation.tags.includes('wcag22aa') ? 'AA' : 'A'

      return {
        id: violation.id,
        description: violation.description,
        impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
        wcagCriterion: wcagTag || 'WCAG',
        wcagLevel,
        wcagPrinciple: principle,
        help: violation.help,
        helpUrl: violation.helpUrl,
        elementSelector: violation.nodes[0]?.target?.join(', '),
        htmlSnippet: violation.nodes[0]?.html,
        fixRecommendation: violation.nodes[0]?.failureSummary || violation.help,
        codeExample: generateCodeExample(violation),
        source: 'axe'
      }
    })

    console.log(`✅ axe-core found ${issues.length} issues`)
    return issues

  } catch (error) {
    console.error('Error running axe tests:', error)
    return []
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Run Pa11y accessibility tests
 */
async function runPa11yTests(url: string): Promise<AccessibilityIssue[]> {
  console.log(`🔍 Running Pa11y tests on ${url}`)

  try {
    const results = await pa11y(url, {
      standard: 'WCAG2AA',
      timeout: 30000,
      wait: 1000,
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    })

    // Transform Pa11y results into our format
    const issues: AccessibilityIssue[] = results.issues.map(issue => {
      // Map Pa11y type to severity
      const severityMap: Record<string, 'critical' | 'serious' | 'moderate' | 'minor'> = {
        'error': 'serious',
        'warning': 'moderate',
        'notice': 'minor'
      }

      // Extract WCAG info from code
      const wcagMatch = issue.code.match(/WCAG2AA\.Principle(\d)\.Guideline(\d+_\d+)\.(\d+_\d+_\d+)/)
      const principle = wcagMatch ? getPrincipleFromNumber(parseInt(wcagMatch[1])) : 'robust'

      return {
        id: issue.code,
        description: issue.message,
        impact: severityMap[issue.type] || 'moderate',
        wcagCriterion: issue.code,
        wcagLevel: 'AA',
        wcagPrinciple: principle,
        help: issue.message,
        helpUrl: `https://www.w3.org/WAI/WCAG22/quickref/`,
        elementSelector: issue.selector,
        htmlSnippet: issue.context,
        fixRecommendation: issue.message,
        source: 'pa11y'
      }
    })

    console.log(`✅ Pa11y found ${issues.length} issues`)
    return issues

  } catch (error) {
    console.error('Error running Pa11y tests:', error)
    return []
  }
}

/**
 * Helper: Get WCAG principle from number
 */
function getPrincipleFromNumber(num: number): string {
  switch (num) {
    case 1: return 'perceivable'
    case 2: return 'operable'
    case 3: return 'understandable'
    case 4: return 'robust'
    default: return 'robust'
  }
}

/**
 * Helper: Generate code example for fix
 */
function generateCodeExample(violation: any): string {
  const examples: Record<string, string> = {
    'color-contrast': `/* Improve color contrast */\n.element {\n  color: #000000; /* Dark text */\n  background-color: #FFFFFF; /* Light background */\n}`,
    'image-alt': `<!-- Add alt text to images -->\n<img src="image.jpg" alt="Descriptive text about the image" />`,
    'label': `<!-- Associate labels with form inputs -->\n<label for="email">Email Address</label>\n<input type="email" id="email" name="email" />`,
    'heading-order': `<!-- Use proper heading hierarchy -->\n<h1>Main Page Title</h1>\n<h2>Section Heading</h2>\n<h3>Subsection Heading</h3>`,
    'link-name': `<!-- Provide descriptive link text -->\n<a href="/contact">Contact Us</a>\n<!-- Instead of: <a href="/contact">Click Here</a> -->`,
    'button-name': `<!-- Add accessible name to buttons -->\n<button aria-label="Close dialog">×</button>`,
    'html-lang': `<!-- Add lang attribute to html tag -->\n<html lang="en">`,
    'landmark': `<!-- Use semantic HTML landmarks -->\n<header>...</header>\n<nav>...</nav>\n<main>...</main>\n<footer>...</footer>`
  }

  for (const [key, example] of Object.entries(examples)) {
    if (violation.id.includes(key)) {
      return example
    }
  }

  return `<!-- Fix: ${violation.help} -->`
}

/**
 * Merge and deduplicate issues from both tools
 */
function mergeIssues(axeIssues: AccessibilityIssue[], pa11yIssues: AccessibilityIssue[]): AccessibilityIssue[] {
  const allIssues = [...axeIssues, ...pa11yIssues]

  // Deduplicate based on selector and description similarity
  const uniqueIssues: AccessibilityIssue[] = []
  const seen = new Set<string>()

  for (const issue of allIssues) {
    const key = `${issue.elementSelector}:${issue.description.substring(0, 50)}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueIssues.push(issue)
    }
  }

  return uniqueIssues
}

/**
 * Calculate accessibility score (0-100)
 */
function calculateScore(issues: AccessibilityIssue[], passedRules: number, totalRules: number): number {
  // Weight issues by severity
  const weights = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1
  }

  const totalDeductions = issues.reduce((sum, issue) => {
    return sum + weights[issue.impact]
  }, 0)

  // Start with 100 and deduct based on issues
  const score = Math.max(0, 100 - totalDeductions)

  return Math.round(score)
}

/**
 * Determine compliance level
 */
function determineComplianceLevel(issues: AccessibilityIssue[]): 'AAA' | 'AA' | 'A' | 'Non-compliant' {
  const hasAAAViolations = issues.some(i => i.wcagLevel === 'AAA')
  const hasAAViolations = issues.some(i => i.wcagLevel === 'AA')
  const hasAViolations = issues.some(i => i.wcagLevel === 'A')

  if (!hasAViolations && !hasAAViolations && !hasAAAViolations) return 'AAA'
  if (!hasAViolations && !hasAAViolations) return 'AA'
  if (!hasAViolations) return 'A'
  return 'Non-compliant'
}

/**
 * Generate summary text
 */
function generateSummary(result: Partial<AccessibilityResult>): string {
  const { score, totalIssues, complianceLevel, eaaCompliant } = result

  if (score! >= 90) {
    return `Excellent accessibility! Your website scores ${score}/100 and ${eaaCompliant ? 'meets' : 'approaches'} WCAG 2.2 Level AA requirements for UK/EAA compliance.`
  } else if (score! >= 70) {
    return `Good accessibility foundation with ${totalIssues} issues to address. Your website scores ${score}/100 and ${eaaCompliant ? 'meets' : 'needs improvements for'} WCAG 2.2 Level AA compliance.`
  } else if (score! >= 50) {
    return `Moderate accessibility with ${totalIssues} issues requiring attention. Score: ${score}/100. Significant work needed to meet WCAG 2.2 Level AA requirements.`
  } else {
    return `Poor accessibility with ${totalIssues} critical issues. Score: ${score}/100. Immediate action required to meet legal requirements (UK Equality Act, EAA).`
  }
}

/**
 * Main accessibility audit function
 */
export async function performAccessibilityAudit(
  url: string,
  scope: 'single' | 'all' | 'custom' = 'single',
  pages: string[] = [url]
): Promise<AccessibilityResult | { pages: AccessibilityResult[] }> {

  // For single page audit - ONLY audit the main URL
  if (scope === 'single') {
    console.log(`📄 Accessibility audit: Single page mode - auditing ${url}`)
    return await auditSinglePage(url)
  }

  // For multi-page audit (all or custom)
  console.log(`📄 Accessibility audit: ${scope} mode - auditing ${pages.length} pages`)
  const results: AccessibilityResult[] = []
  const pagesToAudit = pages.slice(0, 10) // Limit to 10 pages for performance

  for (const pageUrl of pagesToAudit) {
    try {
      const result = await auditSinglePage(pageUrl)
      results.push(result)
    } catch (error) {
      console.error(`Error auditing ${pageUrl}:`, error)
    }
  }

  return { pages: results }
}

/**
 * Audit a single page
 */
async function auditSinglePage(url: string): Promise<AccessibilityResult> {
  console.log(`\n🚀 Starting accessibility audit for ${url}`)

  // Fetch HTML for plugin detection
  let htmlContent = ''
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      redirect: 'follow'
    })
    if (response.ok) {
      htmlContent = await response.text()
    }
  } catch (error) {
    console.error('Could not fetch HTML for plugin detection:', error)
  }

  // Run both tools in parallel
  const [axeIssues, pa11yIssues] = await Promise.all([
    runAxeTests(url),
    runPa11yTests(url)
  ])

  // Merge and deduplicate
  const allIssues = mergeIssues(axeIssues, pa11yIssues)

  // Count by severity
  const issuesBySeverity = {
    critical: allIssues.filter(i => i.impact === 'critical').length,
    serious: allIssues.filter(i => i.impact === 'serious').length,
    moderate: allIssues.filter(i => i.impact === 'moderate').length,
    minor: allIssues.filter(i => i.impact === 'minor').length
  }

  // Count by principle
  const issuesByPrinciple = {
    perceivable: allIssues.filter(i => i.wcagPrinciple === 'perceivable').length,
    operable: allIssues.filter(i => i.wcagPrinciple === 'operable').length,
    understandable: allIssues.filter(i => i.wcagPrinciple === 'understandable').length,
    robust: allIssues.filter(i => i.wcagPrinciple === 'robust').length
  }

  // Calculate metrics
  const passedRules = 50 // Approximate - axe has ~50 rules
  const totalRules = passedRules + allIssues.length
  const score = calculateScore(allIssues, passedRules, totalRules)
  const complianceLevel = determineComplianceLevel(allIssues)
  const eaaCompliant = complianceLevel === 'AA' || complianceLevel === 'AAA'

  // Detect installed accessibility plugins
  const installedPlugins = detectInstalledAccessibilityPlugins(htmlContent)
  const installedPluginDetails = getInstalledAccessibilityPlugins(installedPlugins)
  const recommendedPlugins = getRecommendedPlugins(allIssues, installedPlugins)

  console.log(`🔌 Detected ${installedPlugins.length} accessibility plugins: ${installedPlugins.join(', ') || 'None'}`)

  const result: AccessibilityResult = {
    url,
    timestamp: new Date().toISOString(),
    score,
    totalIssues: allIssues.length,
    passedRules,
    violatedRules: allIssues.length,
    issuesBySeverity,
    issuesByPrinciple,
    issues: allIssues,
    complianceLevel,
    eaaCompliant,
    summary: '',
    installedPlugins,
    installedPluginDetails,
    recommendedPlugins
  }

  result.summary = generateSummary(result)

  console.log(`✅ Accessibility audit complete: ${score}/100 score, ${allIssues.length} issues found`)

  return result
}
