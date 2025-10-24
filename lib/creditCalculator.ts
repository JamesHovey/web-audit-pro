/**
 * Credit Calculator Service
 * Calculates credit costs for audits with 100% markup over actual API costs
 * All costs in British Pounds (GBP)
 *
 * Example: If an audit costs £0.14 (14p) to run, users pay 28 credits (28p)
 */

export interface AuditCostBreakdown {
  keywordsEverywhere: number  // Cost in GBP
  serper: number              // Cost in GBP
  claude: number              // Cost in GBP
  cloudflare: number          // Cost in GBP (Browser Rendering API)
  total: number               // Total cost in GBP
}

export interface CreditCost {
  actualCost: number          // Actual cost in GBP
  markup: number              // Markup percentage (100%)
  creditsRequired: number     // Credits needed (with markup)
  displayCost: string         // Formatted cost for display
}

export class CreditCalculator {
  private static MARKUP_PERCENTAGE = 100  // 100% markup
  private static CREDIT_VALUE = 0.01      // 1 credit = £0.01 (1 penny)
  private static USD_TO_GBP = 0.79        // Exchange rate: $1 = £0.79

  /**
   * Calculate credits required for an audit
   * @param actualCost - Actual cost in GBP
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
   * Convert USD to GBP
   */
  private static toGBP(usdAmount: number): number {
    return usdAmount * this.USD_TO_GBP
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

    // Claude API costs per page (Sonnet 4.5 in USD, converted to GBP):
    // - Input tokens: ~5,000 per page @ $0.003 per 1K = $0.015
    // - Output tokens: ~2,000 per page @ $0.015 per 1K = $0.030
    const claudeInputPerPageUSD = (5000 / 1000) * 0.003  // $0.015
    const claudeOutputPerPageUSD = (2000 / 1000) * 0.015  // $0.030
    const claudePerPage = this.toGBP(claudeInputPerPageUSD + claudeOutputPerPageUSD)  // ~£0.036

    // Keywords Everywhere: ~10 keywords per page @ $0.0001 each
    const kePerPage = this.toGBP(10 * 0.0001)  // ~£0.0008

    // Serper: 1 search per page @ $0.0003 each
    const serperPerPage = this.toGBP(0.0003)  // ~£0.00024

    // Cloudflare Browser Rendering API: £0.09 per hour
    // Estimate: ~2-5 minutes per page = 0.033-0.083 hours
    // Conservative estimate: 3 minutes per page = 0.05 hours
    const browserMinutesPerPage = 3
    const browserHoursPerPage = browserMinutesPerPage / 60  // 0.05 hours
    const cloudflarePerPage = this.toGBP(0.09) * browserHoursPerPage  // ~£0.0036

    // Base cost includes Claude + Browser for all pages
    estimatedCost += pageCount * (claudePerPage + cloudflarePerPage)

    // Add keyword costs if selected
    if (sections.includes('keywords')) {
      estimatedCost += pageCount * (kePerPage + serperPerPage)
    }

    // Add extra browser time for technical audits (accessibility, performance testing)
    if (sections.includes('technical') || sections.includes('performance') || sections.includes('accessibility')) {
      // Technical audits take longer - add 2 more minutes per page
      const extraBrowserTime = (2 / 60) * this.toGBP(0.09)  // ~£0.0024
      estimatedCost += pageCount * extraBrowserTime
    }

    // Single page minimum (covers at least one basic analysis)
    if (scope === 'single') {
      const minimumCost = claudePerPage + cloudflarePerPage
      estimatedCost = Math.max(estimatedCost, minimumCost)
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
   * All costs converted from USD to GBP
   * @param keywordsEverywhereCredits - Number of KE credits used
   * @param serperSearches - Number of Serper searches
   * @param claudeInputTokens - Claude input tokens used
   * @param claudeOutputTokens - Claude output tokens used
   * @param cloudfareBrowserMinutes - Minutes of browser usage
   */
  static convertActualCostToCredits(
    keywordsEverywhereCredits: number,
    serperSearches: number,
    claudeInputTokens: number = 0,
    claudeOutputTokens: number = 0,
    cloudfareBrowserMinutes: number = 0
  ): number {
    // Keywords Everywhere: $0.0001 per credit → £0.000079
    const keCostUSD = keywordsEverywhereCredits * 0.0001
    const keCost = this.toGBP(keCostUSD)

    // Serper: $0.0003 per search → £0.000237
    // Note: AI Overview data comes from the same SERP calls - no extra cost
    const serperCostUSD = serperSearches * 0.0003
    const serperCost = this.toGBP(serperCostUSD)

    // Claude Sonnet 4.5:
    // Input: $0.003 per 1K tokens → £0.00237 per 1K
    // Output: $0.015 per 1K tokens → £0.01185 per 1K
    const claudeInputCostUSD = (claudeInputTokens / 1000) * 0.003
    const claudeOutputCostUSD = (claudeOutputTokens / 1000) * 0.015
    const claudeCost = this.toGBP(claudeInputCostUSD + claudeOutputCostUSD)

    // Cloudflare Browser Rendering API:
    // $0.09 per hour → £0.0711 per hour → £0.001185 per minute
    const browserHours = cloudfareBrowserMinutes / 60
    const cloudflareCostUSD = browserHours * 0.09
    const cloudflareCost = this.toGBP(cloudflareCostUSD)

    const totalCost = keCost + serperCost + claudeCost + cloudflareCost

    return this.calculateCredits(totalCost).creditsRequired
  }

  /**
   * Create detailed cost breakdown
   * Useful for displaying itemized costs to users
   */
  static createBreakdown(
    keywordsEverywhereCredits: number,
    serperSearches: number,
    claudeInputTokens: number = 0,
    claudeOutputTokens: number = 0,
    cloudfareBrowserMinutes: number = 0
  ): AuditCostBreakdown {
    const keCost = this.toGBP(keywordsEverywhereCredits * 0.0001)
    const serperCost = this.toGBP(serperSearches * 0.0003)
    const claudeCost = this.toGBP(
      (claudeInputTokens / 1000) * 0.003 + (claudeOutputTokens / 1000) * 0.015
    )
    const cloudflareCost = this.toGBP((cloudfareBrowserMinutes / 60) * 0.09)

    return {
      keywordsEverywhere: keCost,
      serper: serperCost,
      claude: claudeCost,
      cloudflare: cloudflareCost,
      total: keCost + serperCost + claudeCost + cloudflareCost
    }
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
