import Anthropic from '@anthropic-ai/sdk'

interface AuditData {
  url: string
  sections: string[]
  results: Record<string, unknown>
  completedAt?: string
}

export class ClaudeService {
  private client: Anthropic | null

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY is not configured - AI summaries will not be available')
      this.client = null
    } else {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })
    }
  }

  async generateAuditSummary(auditData: AuditData): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API is not configured. Please add your ANTHROPIC_API_KEY to the environment variables.')
    }
    
    try {
      const prompt = this.buildSummaryPrompt(auditData)
      
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        temperature: 0.7,
        system: "You are an expert SEO analyst providing clear, actionable insights to website owners. Create a friendly, encouraging summary that highlights key findings and provides practical next steps. Be concise but comprehensive.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const textContent = response.content.find(c => c.type === 'text')
      return textContent?.text || 'Unable to generate summary'
      
    } catch (error) {
      console.error('Error generating Claude summary:', error)
      throw new Error('Failed to generate audit summary')
    }
  }

  private buildSummaryPrompt(auditData: AuditData): string {
    const { url, results } = auditData
    
    let prompt = `Please provide a human-friendly summary of this website audit for ${url}.\n\n`
    prompt += `The audit analyzed the following areas:\n`
    
    const traffic = results?.traffic as Record<string, unknown>
    if (traffic) {
      prompt += `\nTRAFFIC INSIGHTS:\n`
      prompt += `- Estimated Monthly Visitors: ${traffic.estimatedMonthlyVisitors || 'N/A'}\n`
      prompt += `- Domain Authority: ${traffic.domainAuthority || 'N/A'}\n`
      prompt += `- Traffic Trend: ${traffic.trafficTrend || 'N/A'}\n`
    }
    
    const keywords = results?.keywords as Record<string, unknown>
    if (keywords) {
      prompt += `\nKEYWORD PERFORMANCE:\n`
      const topKeywords = keywords.topKeywords as Array<{keyword: string}> | undefined
      const brandedKeywords = keywords.brandedKeywords as Array<unknown> | undefined
      const nonBrandedKeywords = keywords.nonBrandedKeywords as Array<unknown> | undefined
      
      if (topKeywords && topKeywords.length > 0) {
        prompt += `- Found ${topKeywords.length} ranking keywords\n`
        prompt += `- Top keywords include: ${topKeywords.slice(0, 3).map(k => k.keyword).join(', ')}\n`
      }
      if (brandedKeywords && brandedKeywords.length > 0) {
        prompt += `- ${brandedKeywords.length} branded keywords\n`
      }
      if (nonBrandedKeywords && nonBrandedKeywords.length > 0) {
        prompt += `- ${nonBrandedKeywords.length} non-branded keywords\n`
      }
    }
    
    const performance = results?.performance as Record<string, unknown>
    if (performance) {
      prompt += `\nPERFORMANCE METRICS:\n`
      const lighthouse = performance.lighthouse as Record<string, unknown> | undefined
      if (lighthouse) {
        prompt += `- Performance Score: ${lighthouse.performance || 'N/A'}\n`
        prompt += `- Accessibility Score: ${lighthouse.accessibility || 'N/A'}\n`
        prompt += `- Best Practices Score: ${lighthouse.bestPractices || 'N/A'}\n`
        prompt += `- SEO Score: ${lighthouse.seo || 'N/A'}\n`
      }
      const coreWebVitals = performance.coreWebVitals as Record<string, unknown> | undefined
      if (coreWebVitals) {
        prompt += `- Largest Contentful Paint: ${coreWebVitals.LCP || 'N/A'}\n`
        prompt += `- First Input Delay: ${coreWebVitals.FID || 'N/A'}\n`
        prompt += `- Cumulative Layout Shift: ${coreWebVitals.CLS || 'N/A'}\n`
      }
    }
    
    const backlinks = results?.backlinks as Record<string, unknown>
    if (backlinks) {
      prompt += `\nBACKLINK PROFILE:\n`
      prompt += `- Total Backlinks: ${backlinks.totalBacklinks || 'N/A'}\n`
      prompt += `- Referring Domains: ${backlinks.referringDomains || 'N/A'}\n`
      prompt += `- Domain Authority: ${backlinks.domainAuthority || 'N/A'}\n`
    }
    
    const technical = results?.technical as Record<string, unknown>
    if (technical) {
      prompt += `\nTECHNICAL SEO:\n`
      const issues = technical.issues as Record<string, unknown> | undefined
      if (issues) {
        prompt += `- ${issues.critical || 0} critical issues\n`
        prompt += `- ${issues.warnings || 0} warnings\n`
        prompt += `- ${issues.notices || 0} notices\n`
      }
    }
    
    prompt += `\nPlease create a summary that:\n`
    prompt += `1. Starts with a brief overall assessment (2-3 sentences)\n`
    prompt += `2. Highlights 3-5 key strengths\n`
    prompt += `3. Identifies 3-5 priority areas for improvement\n`
    prompt += `4. Provides 3-5 specific, actionable next steps\n`
    prompt += `5. Ends with an encouraging note about the site's potential\n`
    prompt += `\nKeep the tone professional yet friendly, and make it easy for non-technical users to understand.`
    
    return prompt
  }
}