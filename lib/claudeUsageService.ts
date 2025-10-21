/**
 * Claude Usage Tracking Service
 * Tracks Claude API usage in localStorage for cost monitoring
 */

export interface ClaudeUsageRecord {
  timestamp: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  requestType: 'business_analysis' | 'conclusion_generation' | 'other'
}

export interface ClaudeUsageSummary {
  totalRequests: number
  businessAnalysisRequests: number
  conclusionGenerationRequests: number
  otherRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalCost: number
  model: string
  lastUpdated: string
}

const STORAGE_KEY = 'claude_api_usage'

export class ClaudeUsageService {
  /**
   * Track a Claude API request
   */
  static trackUsage(
    model: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    requestType: 'business_analysis' | 'conclusion_generation' | 'other' = 'other'
  ): void {
    try {
      const record: ClaudeUsageRecord = {
        timestamp: new Date().toISOString(),
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
        requestType
      }

      const existing = this.getAllRecords()
      existing.push(record)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

      console.log(`📊 Claude usage tracked: ${requestType}, ${inputTokens + outputTokens} tokens, $${cost.toFixed(4)}`)
    } catch (error) {
      console.error('Failed to track Claude usage:', error)
    }
  }

  /**
   * Get all usage records
   */
  static getAllRecords(): ClaudeUsageRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get Claude usage records:', error)
      return []
    }
  }

  /**
   * Get usage summary for current month
   */
  static getMonthlyUsage(): ClaudeUsageSummary {
    const records = this.getAllRecords()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Filter to current month
    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })

    const summary: ClaudeUsageSummary = {
      totalRequests: monthlyRecords.length,
      businessAnalysisRequests: monthlyRecords.filter(r => r.requestType === 'business_analysis').length,
      conclusionGenerationRequests: monthlyRecords.filter(r => r.requestType === 'conclusion_generation').length,
      otherRequests: monthlyRecords.filter(r => r.requestType === 'other').length,
      totalInputTokens: monthlyRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: monthlyRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      totalTokens: monthlyRecords.reduce((sum, r) => sum + r.totalTokens, 0),
      totalCost: monthlyRecords.reduce((sum, r) => sum + r.cost, 0),
      model: monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].model : 'claude-3-5-haiku-20241022',
      lastUpdated: monthlyRecords.length > 0 ? monthlyRecords[monthlyRecords.length - 1].timestamp : new Date().toISOString()
    }

    return summary
  }

  /**
   * Get total usage (all time)
   */
  static getTotalUsage(): ClaudeUsageSummary {
    const records = this.getAllRecords()

    const summary: ClaudeUsageSummary = {
      totalRequests: records.length,
      businessAnalysisRequests: records.filter(r => r.requestType === 'business_analysis').length,
      conclusionGenerationRequests: records.filter(r => r.requestType === 'conclusion_generation').length,
      otherRequests: records.filter(r => r.requestType === 'other').length,
      totalInputTokens: records.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: records.reduce((sum, r) => sum + r.outputTokens, 0),
      totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
      totalCost: records.reduce((sum, r) => sum + r.cost, 0),
      model: records.length > 0 ? records[records.length - 1].model : 'claude-3-5-haiku-20241022',
      lastUpdated: records.length > 0 ? records[records.length - 1].timestamp : new Date().toISOString()
    }

    return summary
  }

  /**
   * Calculate average cost per request
   */
  static getAverageCostPerRequest(): number {
    const summary = this.getMonthlyUsage()
    return summary.totalRequests > 0 ? summary.totalCost / summary.totalRequests : 0
  }

  /**
   * Clear all usage data
   */
  static clearUsage(): void {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🧹 Claude usage data cleared')
  }

  /**
   * Export usage data
   */
  static exportUsageData(): string {
    const records = this.getAllRecords()
    return JSON.stringify(records, null, 2)
  }
}
