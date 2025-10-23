/**
 * Credit Calculator Service
 * Calculates credit costs for audits with 100% markup over actual API costs
 *
 * Example: If an audit costs $0.14 (14p) to run, users pay 28 credits (28p)
 */

export interface AuditCostBreakdown {
  keywordsEverywhere: number  // Cost in dollars
  serper: number              // Cost in dollars
  claude: number              // Cost in dollars
  total: number               // Total cost in dollars
}

export interface CreditCost {
  actualCost: number          // Actual cost in dollars
  markup: number              // Markup percentage (100%)
  creditsRequired: number     // Credits needed (with markup)
  displayCost: string         // Formatted cost for display
}

export class CreditCalculator {
  private static MARKUP_PERCENTAGE = 100  // 100% markup
  private static CREDIT_VALUE = 0.01      // 1 credit = $0.01 (1 penny)

  /**
   * Calculate credits required for an audit
   * @param actualCost - Actual cost in dollars
   * @returns Credit calculation with markup
   */
  static calculateCredits(actualCost: number): CreditCost {
    // Apply 100% markup
    const costWithMarkup = actualCost * (1 + this.MARKUP_PERCENTAGE / 100)

    // Convert to credits (round up to nearest credit)
    const creditsRequired = Math.ceil(costWithMarkup / this.CREDIT_VALUE)

    return {
      actualCost,
      markup: this.MARKUP_PERCENTAGE,
      creditsRequired,
      displayCost: this.formatCost(costWithMarkup)
    }
  }

  /**
   * Calculate credits from cost breakdown
   * @param breakdown - Detailed cost breakdown
   * @returns Credit calculation
   */
  static calculateFromBreakdown(breakdown: AuditCostBreakdown): CreditCost {
    return this.calculateCredits(breakdown.total)
  }

  /**
   * Estimate credits for audit based on scope and sections
   * @param scope - 'single', 'custom', or 'all'
   * @param pageCount - Number of pages to audit
   * @param sections - Selected audit sections
   * @returns Estimated credit cost
   */
  static estimateAuditCost(
    scope: 'single' | 'custom' | 'all',
    pageCount: number,
    sections: string[]
  ): CreditCost {
    let estimatedCost = 0

    // Claude API costs per page (realistic estimates for Sonnet 4.5):
    // - Input tokens: ~5,000 per page (page content + prompts)
    // - Output tokens: ~2,000 per page (analysis/recommendations)
    const claudeInputPerPage = (5000 / 1000) * 0.003  // $0.015 per page
    const claudeOutputPerPage = (2000 / 1000) * 0.015  // $0.030 per page
    const claudePerPage = claudeInputPerPage + claudeOutputPerPage  // $0.045 total

    // Keywords Everywhere: ~10 keywords per page @ $0.0001 each
    const kePerPage = 10 * 0.0001  // $0.001 per page

    // Serper: 1 search per page @ $0.0003 each (includes AI Overview data - no extra cost)
    const serperPerPage = 0.0003

    // Base cost includes Claude for all pages
    estimatedCost += pageCount * claudePerPage

    // Add keyword costs if selected
    if (sections.includes('keywords')) {
      estimatedCost += pageCount * (kePerPage + serperPerPage)
    }

    // Single page minimum (covers at least one basic analysis)
    if (scope === 'single') {
      estimatedCost = Math.max(estimatedCost, 0.045)  // Minimum one page with Claude
    }

    return this.calculateCredits(estimatedCost)
  }

  /**
   * Format cost as currency
   */
  private static formatCost(cost: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cost)
  }

  /**
   * Check if user has sufficient credits
   */
  static hasSufficientCredits(userCredits: number, requiredCredits: number): boolean {
    return userCredits >= requiredCredits
  }

  /**
   * Calculate what user can afford
   */
  static calculateAffordableAudits(userCredits: number, costPerAudit: number): number {
    if (costPerAudit === 0) return 0
    return Math.floor(userCredits / costPerAudit)
  }

  /**
   * Format credits with breakdown
   */
  static formatCreditCost(cost: CreditCost): string {
    return `${cost.creditsRequired} credits (${cost.displayCost})`
  }

  /**
   * Convert actual API costs to credits
   * Used after audit completion to record actual cost
   * Note: AI Overview analysis uses existing Serper data - no additional costs
   */
  static convertActualCostToCredits(
    keywordsEverywhereCredits: number,
    serperSearches: number,
    claudeInputTokens: number = 0,
    claudeOutputTokens: number = 0
  ): number {
    // Keywords Everywhere: $0.0001 per credit (paid tier: $10 per 100,000 credits)
    const keCost = keywordsEverywhereCredits * 0.0001

    // Serper: $0.0003 per search (paid tier: $0.30 per 1,000 searches)
    // Note: AI Overview data comes from the same SERP calls - no extra cost
    const serperCost = serperSearches * 0.0003

    // Claude Sonnet 4.5 (paid tier):
    // Input: $0.003 per 1K tokens ($3 per million)
    // Output: $0.015 per 1K tokens ($15 per million)
    const claudeInputCost = (claudeInputTokens / 1000) * 0.003
    const claudeOutputCost = (claudeOutputTokens / 1000) * 0.015

    const totalCost = keCost + serperCost + claudeInputCost + claudeOutputCost

    return this.calculateCredits(totalCost).creditsRequired
  }
}

/**
 * Example usage and demonstrations
 */
export const CREDIT_EXAMPLES = {
  singlePageBasic: CreditCalculator.estimateAuditCost('single', 1, ['traffic', 'performance']),
  singlePageWithKeywords: CreditCalculator.estimateAuditCost('single', 1, ['traffic', 'performance', 'keywords']),
  smallSite: CreditCalculator.estimateAuditCost('all', 10, ['traffic', 'performance']),
  smallSiteWithKeywords: CreditCalculator.estimateAuditCost('all', 10, ['traffic', 'performance', 'keywords']),
  largeSite: CreditCalculator.estimateAuditCost('all', 50, ['traffic', 'performance', 'keywords']),
}

// Log examples for reference
if (process.env.NODE_ENV === 'development') {
  console.log('\n💰 Credit Calculator Examples:')
  console.log('================================')
  console.log('Single page (basic):', CreditCalculator.formatCreditCost(CREDIT_EXAMPLES.singlePageBasic))
  console.log('Single page (with keywords):', CreditCalculator.formatCreditCost(CREDIT_EXAMPLES.singlePageWithKeywords))
  console.log('Small site (10 pages, no keywords):', CreditCalculator.formatCreditCost(CREDIT_EXAMPLES.smallSite))
  console.log('Small site (10 pages, with keywords):', CreditCalculator.formatCreditCost(CREDIT_EXAMPLES.smallSiteWithKeywords))
  console.log('Large site (50 pages, with keywords):', CreditCalculator.formatCreditCost(CREDIT_EXAMPLES.largeSite))
  console.log('================================\n')
}
