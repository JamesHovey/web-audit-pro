/**
 * Usage Tracker
 * Tracks actual API usage during audits for accurate cost calculation
 */

export interface UsageMetrics {
  browserMinutes: number
  keywordsEverywhereCredits: number
  serperSearches: number
  claudeInputTokens: number
  claudeOutputTokens: number
  startTime: number
  endTime?: number
}

export class UsageTracker {
  private metrics: UsageMetrics

  constructor() {
    this.metrics = {
      browserMinutes: 0,
      keywordsEverywhereCredits: 0,
      serperSearches: 0,
      claudeInputTokens: 0,
      claudeOutputTokens: 0,
      startTime: Date.now()
    }
  }

  /**
   * Start tracking browser time
   */
  startBrowserSession(): void {
    this.metrics.startTime = Date.now()
  }

  /**
   * End tracking browser time and calculate duration
   */
  endBrowserSession(): void {
    this.metrics.endTime = Date.now()
    const durationMs = this.metrics.endTime - this.metrics.startTime
    this.metrics.browserMinutes = durationMs / (1000 * 60) // Convert to minutes
  }

  /**
   * Add browser time manually (in minutes)
   */
  addBrowserTime(minutes: number): void {
    this.metrics.browserMinutes += minutes
  }

  /**
   * Track Keywords Everywhere usage
   */
  addKeywordsEverywhereCredits(credits: number): void {
    this.metrics.keywordsEverywhereCredits += credits
  }

  /**
   * Track Serper API searches
   */
  addSerperSearch(count: number = 1): void {
    this.metrics.serperSearches += count
  }

  /**
   * Track Claude API token usage
   */
  addClaudeTokens(inputTokens: number, outputTokens: number): void {
    this.metrics.claudeInputTokens += inputTokens
    this.metrics.claudeOutputTokens += outputTokens
  }

  /**
   * Get current metrics
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics }
  }

  /**
   * Get metrics as JSON for database storage
   */
  getMetricsJSON(): string {
    return JSON.stringify(this.metrics)
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      browserMinutes: 0,
      keywordsEverywhereCredits: 0,
      serperSearches: 0,
      claudeInputTokens: 0,
      claudeOutputTokens: 0,
      startTime: Date.now()
    }
  }
}

/**
 * Create a new usage tracker instance
 */
export function createUsageTracker(): UsageTracker {
  return new UsageTracker()
}
