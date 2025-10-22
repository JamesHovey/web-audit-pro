/**
 * Heading Hierarchy Checker Service
 * Analyzes HTML heading structure (H1-H6) for SEO and accessibility issues
 */

export interface HeadingIssue {
  type: 'missing_h1' | 'multiple_h1' | 'skipped_level' | 'no_headings' | 'empty_heading'
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  details?: string
  affectedHeadings?: string[]
}

export interface HeadingAnalysis {
  hasIssues: boolean
  issues: HeadingIssue[]
  headingStructure: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
    total: number
  }
  headings: Array<{
    level: number
    text: string
    isEmpty: boolean
  }>
}

/**
 * Analyze heading hierarchy from HTML content
 */
export function analyzeHeadingHierarchy(html: string): HeadingAnalysis {
  const issues: HeadingIssue[] = []
  const headings: Array<{ level: number; text: string; isEmpty: boolean }> = []

  // Count headings by level
  const headingStructure = {
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    total: 0
  }

  // Extract all headings from HTML
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi')
    let match

    while ((match = regex.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim() // Remove HTML tags and trim
      const isEmpty = text.length === 0

      headings.push({
        level: i,
        text: text || '(empty)',
        isEmpty
      })

      headingStructure[`h${i}` as keyof typeof headingStructure]++
      headingStructure.total++
    }
  }

  // Sort headings by their appearance in the document
  headings.sort((a, b) => {
    const aIndex = html.indexOf(`<h${a.level}`)
    const bIndex = html.indexOf(`<h${b.level}`)
    return aIndex - bIndex
  })

  // Check 1: No headings at all
  if (headingStructure.total === 0) {
    issues.push({
      type: 'no_headings',
      severity: 'critical',
      description: 'Page has no heading tags (H1-H6)',
      details: 'Headings provide structure for both users and search engines. Add proper heading hierarchy.'
    })

    return {
      hasIssues: true,
      issues,
      headingStructure,
      headings
    }
  }

  // Check 2: Missing H1
  if (headingStructure.h1 === 0) {
    issues.push({
      type: 'missing_h1',
      severity: 'critical',
      description: 'Page is missing an H1 heading',
      details: 'Every page should have exactly one H1 tag that describes the main topic.'
    })
  }

  // Check 3: Multiple H1s
  if (headingStructure.h1 > 1) {
    issues.push({
      type: 'multiple_h1',
      severity: 'medium',
      description: `Page has ${headingStructure.h1} H1 tags`,
      details: 'Best practice is to use only one H1 per page. Multiple H1s can confuse search engines about the page\'s main topic.',
      affectedHeadings: headings.filter(h => h.level === 1).map(h => h.text)
    })
  }

  // Check 4: Empty headings
  const emptyHeadings = headings.filter(h => h.isEmpty)
  if (emptyHeadings.length > 0) {
    issues.push({
      type: 'empty_heading',
      severity: 'high',
      description: `${emptyHeadings.length} heading${emptyHeadings.length > 1 ? 's' : ''} with no content`,
      details: 'Empty headings provide no value to users or search engines and should contain descriptive text.',
      affectedHeadings: emptyHeadings.map(h => `H${h.level} (empty)`)
    })
  }

  // Check 5: Skipped heading levels
  const skippedLevels: string[] = []
  let previousLevel = 0

  for (const heading of headings) {
    if (previousLevel === 0) {
      // First heading - should ideally be H1 but not critical
      if (heading.level > 1) {
        skippedLevels.push(`Document starts with H${heading.level} instead of H1`)
      }
    } else {
      // Check if we skipped levels (e.g., H2 → H4)
      if (heading.level > previousLevel + 1) {
        const skippedLevelNumbers = []
        for (let i = previousLevel + 1; i < heading.level; i++) {
          skippedLevelNumbers.push(`H${i}`)
        }
        skippedLevels.push(`H${previousLevel} → H${heading.level} (skipped ${skippedLevelNumbers.join(', ')})`)
      }
    }
    previousLevel = heading.level
  }

  if (skippedLevels.length > 0) {
    issues.push({
      type: 'skipped_level',
      severity: 'medium',
      description: 'Heading hierarchy has skipped levels',
      details: 'Headings should follow a logical order (H1 → H2 → H3, etc.) without skipping levels. This helps screen readers and SEO.',
      affectedHeadings: skippedLevels
    })
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    headingStructure,
    headings
  }
}
