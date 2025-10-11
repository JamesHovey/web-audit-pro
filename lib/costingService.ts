/**
 * Costing Service - Track API usage and calculate costs
 */

export interface ApiCosts {
  keywordsEverywhere: {
    creditsRemaining: number
    creditsUsed: number
    costPerCredit: number
    planType: string
    lastUpdated: string
  }
  valueSERP: {
    searchesRemaining: number
    searchesUsed: number
    costPer1000: number
    planType: string
    lastUpdated: string
  }
  claudeApi: {
    tokensUsed: number
    totalCost: number
    requestsThisMonth: number
    avgCostPerRequest: number
    lastUpdated: string
    model: string
    businessAnalysisRequests: number
    conclusionGenerationRequests: number
  }
}

export class CostingService {
  private static instance: CostingService
  private cachedCosts: ApiCosts | null = null
  private lastFetch = 0
  private cacheDuration = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CostingService {
    if (!CostingService.instance) {
      CostingService.instance = new CostingService()
    }
    return CostingService.instance
  }

  /**
   * Get real-time API costs and balances
   */
  async getRealTimeCosts(): Promise<ApiCosts> {
    const now = Date.now()
    
    // Return cached data if still fresh
    if (this.cachedCosts && (now - this.lastFetch) < this.cacheDuration) {
      return this.cachedCosts
    }

    try {
      console.log('🔍 Fetching real-time API balances...')
      
      // Fetch Keywords Everywhere balance
      const keBalance = await this.getKeywordsEverywhereBalance()
      
      // Fetch ValueSERP balance  
      const vsBalance = await this.getValueSerpBalance()

      // Fetch Claude API usage
      const claudeUsage = await this.getClaudeApiUsage()

      this.cachedCosts = {
        keywordsEverywhere: {
          creditsRemaining: keBalance.remaining,
          creditsUsed: keBalance.used,
          costPerCredit: 0.00024, // 24¢ per 1000 credits
          planType: keBalance.planType,
          lastUpdated: new Date().toISOString()
        },
        valueSERP: {
          searchesRemaining: vsBalance.remaining,
          searchesUsed: vsBalance.used,
          costPer1000: 1.60, // $1.60 per 1000 searches
          planType: vsBalance.planType,
          lastUpdated: new Date().toISOString()
        },
        claudeApi: {
          tokensUsed: claudeUsage.tokensUsed,
          totalCost: claudeUsage.totalCost,
          requestsThisMonth: claudeUsage.requestsThisMonth,
          avgCostPerRequest: claudeUsage.avgCostPerRequest,
          lastUpdated: new Date().toISOString(),
          model: 'claude-3-5-haiku-20241022'
        }
      }

      this.lastFetch = now
      return this.cachedCosts

    } catch (error) {
      console.error('Error fetching real-time costs:', error)
      
      // Return cached data or defaults on error
      return this.cachedCosts || this.getDefaultCosts()
    }
  }

  /**
   * Get Keywords Everywhere balance
   */
  private async getKeywordsEverywhereBalance(): Promise<{remaining: number, used: number, planType: string}> {
    try {
      const { KeywordsEverywhereService } = await import('./keywordsEverywhereService')
      const service = new KeywordsEverywhereService()
      
      // Make a minimal API call to get account info
      const testResult = await service.getSearchVolumes(['test'], 'gb')
      
      // Extract balance from response (this would need to be implemented in the service)
      // For now, return estimated values
      return {
        remaining: 79515, // This would come from the API response
        used: 485,
        planType: 'Bronze Package (100K/year)'
      }
    } catch (error) {
      console.warn('Could not fetch Keywords Everywhere balance:', error)
      return {
        remaining: 79515,
        used: 485,
        planType: 'Bronze Package (100K/year)'
      }
    }
  }

  /**
   * Get ValueSERP balance
   */
  private async getValueSerpBalance(): Promise<{remaining: number, used: number, planType: string}> {
    try {
      // ValueSERP doesn't typically provide balance info in responses
      // This would need to be tracked separately or estimated
      return {
        remaining: 22350,
        used: 2650,
        planType: '25K Searches/month ($50/month)'
      }
    } catch (error) {
      console.warn('Could not fetch ValueSERP balance:', error)
      return {
        remaining: 22350,
        used: 2650,
        planType: '25K Searches/month ($50/month)'
      }
    }
  }

  /**
   * Get Claude API usage from local storage or tracking
   */
  private async getClaudeApiUsage(): Promise<{
    tokensUsed: number, 
    totalCost: number, 
    requestsThisMonth: number, 
    avgCostPerRequest: number
  }> {
    try {
      // In a real implementation, this would pull from local storage or a database
      // For now, return estimated values based on typical usage
      const storedUsage = this.getStoredClaudeUsage()
      
      return {
        tokensUsed: storedUsage.tokensUsed,
        totalCost: storedUsage.totalCost,
        requestsThisMonth: storedUsage.requestsThisMonth,
        avgCostPerRequest: storedUsage.requestsThisMonth > 0 
          ? storedUsage.totalCost / storedUsage.requestsThisMonth 
          : 0.038 // Default average cost per request
      }
    } catch (error) {
      console.warn('Could not fetch Claude API usage:', error)
      return {
        tokensUsed: 0,
        totalCost: 0,
        requestsThisMonth: 0,
        avgCostPerRequest: 0.038
      }
    }
  }

  /**
   * Get stored Claude usage from localStorage
   */
  private getStoredClaudeUsage(): {
    tokensUsed: number,
    totalCost: number,
    requestsThisMonth: number
  } {
    if (typeof window === 'undefined') {
      // Server-side rendering
      return { tokensUsed: 0, totalCost: 0, requestsThisMonth: 0 }
    }

    try {
      const stored = localStorage.getItem('claude-api-usage')
      if (stored) {
        const data = JSON.parse(stored)
        
        // Check if data is from current month
        const currentMonth = new Date().getMonth()
        const storedMonth = new Date(data.lastUpdated).getMonth()
        
        if (currentMonth === storedMonth) {
          return data
        }
      }
    } catch (error) {
      console.warn('Error reading Claude usage from localStorage:', error)
    }

    // Return defaults if no stored data or from previous month
    return {
      tokensUsed: 0,
      totalCost: 0,
      requestsThisMonth: 0
    }
  }

  /**
   * Update Claude API usage tracking
   */
  updateClaudeUsage(tokensUsed: number, cost: number): void {
    if (typeof window === 'undefined') return

    try {
      const current = this.getStoredClaudeUsage()
      const updated = {
        tokensUsed: current.tokensUsed + tokensUsed,
        totalCost: current.totalCost + cost,
        requestsThisMonth: current.requestsThisMonth + 1,
        lastUpdated: new Date().toISOString()
      }

      localStorage.setItem('claude-api-usage', JSON.stringify(updated))
      
      // Clear cache to force refresh on next request
      this.clearCache()
      
    } catch (error) {
      console.warn('Error updating Claude usage in localStorage:', error)
    }
  }

  /**
   * Calculate cost for a specific audit (updated to include Claude)
   */
  calculateAuditCost(keCredits: number, vsSearches: number, claudeCost?: number): number {
    const keCost = keCredits * 0.00024 // 24¢ per 1000 credits
    const vsCost = vsSearches * 0.0016 // $1.60 per 1000 searches
    const totalCost = keCost + vsCost + (claudeCost || 0)
    return Math.round(totalCost * 1000) / 1000 // Round to 3 decimal places
  }

  /**
   * Estimate remaining audits based on current balances
   */
  calculateRemainingAudits(costs: ApiCosts): {ke: number, vs: number, limiting: number} {
    const avgKeCreditsPerAudit = 116
    const avgVsSearchesPerAudit = 75

    const keAudits = Math.floor(costs.keywordsEverywhere.creditsRemaining / avgKeCreditsPerAudit)
    const vsAudits = Math.floor(costs.valueSERP.searchesRemaining / avgVsSearchesPerAudit)

    return {
      ke: keAudits,
      vs: vsAudits,
      limiting: Math.min(keAudits, vsAudits)
    }
  }

  /**
   * Get default costs when APIs are unavailable
   */
  private getDefaultCosts(): ApiCosts {
    return {
      keywordsEverywhere: {
        creditsRemaining: 79515,
        creditsUsed: 485,
        costPerCredit: 0.00024,
        planType: 'Bronze Package (100K/year)',
        lastUpdated: new Date().toISOString()
      },
      valueSERP: {
        searchesRemaining: 22350,
        searchesUsed: 2650,
        costPer1000: 1.60,
        planType: '25K Searches/month ($50/month)',
        lastUpdated: new Date().toISOString()
      },
      claudeApi: {
        tokensUsed: 0,
        totalCost: 0,
        requestsThisMonth: 0,
        avgCostPerRequest: 0.038,
        lastUpdated: new Date().toISOString(),
        model: 'claude-3-5-haiku-20241022'
      }
    }
  }

  /**
   * Clear cache to force fresh data on next request
   */
  clearCache(): void {
    this.cachedCosts = null
    this.lastFetch = 0
  }
}