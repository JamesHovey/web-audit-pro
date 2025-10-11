/**
 * Claude Conclusion Service - Generate intelligent, tailored audit conclusions
 */

import { ClaudeApiService, type ClaudeUsageMetrics } from './claudeApiService';

export interface AuditData {
  domain: string;
  businessType: {
    category: string;
    subcategory: string;
    description: string;
  };
  keywordFindings: {
    totalKeywords: number;
    topPerformingKeywords: string[];
    missingOpportunities: string[];
    competitorKeywords: string[];
  };
  technicalFindings: {
    pageSpeed: number;
    mobileScore: number;
    issues: string[];
    recommendations: string[];
  };
  contentFindings: {
    titleIssues: number;
    metaDescriptionIssues: number;
    headingStructure: string;
    contentGaps: string[];
  };
  competitorAnalysis: {
    topCompetitors: string[];
    competitiveGaps: string[];
    opportunities: string[];
  };
}

export interface ConclusionResult {
  executiveSummary: string;
  priorityRecommendations: {
    priority: 'high' | 'medium' | 'low';
    category: 'technical' | 'content' | 'keywords' | 'competitive';
    title: string;
    description: string;
    estimatedImpact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: 'immediate' | 'short-term' | 'long-term';
  }[];
  keyInsights: string[];
  nextSteps: string[];
  industrySpecificAdvice: string[];
  usageMetrics: ClaudeUsageMetrics;
}

export class ClaudeConclusionService {
  private claudeService: ClaudeApiService;

  constructor(apiKey?: string) {
    this.claudeService = new ClaudeApiService(apiKey);
  }

  /**
   * Generate intelligent conclusions based on audit data
   */
  async generateConclusions(auditData: AuditData): Promise<ConclusionResult> {
    console.log(`🧠 Generating intelligent conclusions for ${auditData.domain}`);
    
    try {
      const prompt = this.buildConclusionPrompt(auditData);
      const response = await this.callClaudeForConclusions(prompt);
      
      console.log(`✅ Generated intelligent conclusions`);
      console.log(`💰 Conclusion generation cost: $${response.usageMetrics.totalCost.toFixed(4)}`);
      
      return response;

    } catch (error) {
      console.error('❌ Failed to generate Claude conclusions:', error);
      return this.getFallbackConclusions(auditData);
    }
  }

  /**
   * Build comprehensive prompt for conclusion generation
   */
  private buildConclusionPrompt(auditData: AuditData): string {
    return `You are an expert SEO consultant and digital marketing strategist. Analyze the following website audit data and provide comprehensive, actionable conclusions.

WEBSITE: ${auditData.domain}
BUSINESS TYPE: ${auditData.businessType.category} - ${auditData.businessType.subcategory}
BUSINESS DESCRIPTION: ${auditData.businessType.description}

AUDIT FINDINGS:

KEYWORD PERFORMANCE:
- Total keywords analyzed: ${auditData.keywordFindings.totalKeywords}
- Top performing keywords: ${auditData.keywordFindings.topPerformingKeywords.join(', ')}
- Missing opportunities: ${auditData.keywordFindings.missingOpportunities.join(', ')}
- Competitor keywords: ${auditData.keywordFindings.competitorKeywords.join(', ')}

TECHNICAL PERFORMANCE:
- Page speed score: ${auditData.technicalFindings.pageSpeed}/100
- Mobile score: ${auditData.technicalFindings.mobileScore}/100
- Key issues: ${auditData.technicalFindings.issues.join(', ')}
- Current recommendations: ${auditData.technicalFindings.recommendations.join(', ')}

CONTENT ANALYSIS:
- Title tag issues: ${auditData.contentFindings.titleIssues}
- Meta description issues: ${auditData.contentFindings.metaDescriptionIssues}
- Heading structure: ${auditData.contentFindings.headingStructure}
- Content gaps: ${auditData.contentFindings.contentGaps.join(', ')}

COMPETITIVE ANALYSIS:
- Top competitors: ${auditData.competitorAnalysis.topCompetitors.join(', ')}
- Competitive gaps: ${auditData.competitorAnalysis.competitiveGaps.join(', ')}
- Opportunities: ${auditData.competitorAnalysis.opportunities.join(', ')}

Please provide a comprehensive analysis in the following JSON format:

{
  "executiveSummary": "A 2-3 sentence high-level summary of the website's SEO health and biggest opportunities",
  "priorityRecommendations": [
    {
      "priority": "high|medium|low",
      "category": "technical|content|keywords|competitive",
      "title": "Brief recommendation title",
      "description": "Detailed explanation and implementation steps",
      "estimatedImpact": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "timeframe": "immediate|short-term|long-term"
    }
  ],
  "keyInsights": [
    "Important insight about the website's performance",
    "Industry-specific observation",
    "Competitive positioning insight"
  ],
  "nextSteps": [
    "Immediate action item",
    "Short-term goal",
    "Long-term strategy"
  ],
  "industrySpecificAdvice": [
    "Advice specific to this business type",
    "Industry best practices",
    "Target audience considerations"
  ]
}

GUIDELINES:
1. Focus on the specific business type and industry context
2. Prioritize recommendations by impact and effort
3. Provide actionable, specific advice rather than generic SEO tips
4. Consider the target audience and business model
5. Include industry-specific best practices
6. Suggest 5-8 priority recommendations maximum
7. Make insights data-driven and specific to the audit findings
8. Consider local SEO factors if relevant to the business type

Provide only the JSON response, no additional text.`;
  }

  /**
   * Call Claude API for conclusion generation
   */
  private async callClaudeForConclusions(prompt: string): Promise<ConclusionResult> {
    const requestBody = {
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('No Claude API key available');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const usage = data.usage;

    // Calculate costs (Haiku pricing)
    const inputCost = (usage.input_tokens / 1000000) * 0.25;
    const outputCost = (usage.output_tokens / 1000000) * 1.25;
    const totalCost = inputCost + outputCost;

    const usageMetrics: ClaudeUsageMetrics = {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      totalCost,
      requestCount: 1,
      timestamp: new Date()
    };

    try {
      const conclusionData = JSON.parse(content);
      return {
        ...conclusionData,
        usageMetrics
      };
    } catch (error) {
      console.error('❌ Failed to parse Claude conclusion response:', error);
      throw new Error('Invalid JSON response from Claude API');
    }
  }

  /**
   * Fallback conclusions when Claude API fails
   */
  private getFallbackConclusions(auditData: AuditData): ConclusionResult {
    const mockUsage: ClaudeUsageMetrics = {
      inputTokens: 1000,
      outputTokens: 500,
      totalCost: 0.00088,
      requestCount: 1,
      timestamp: new Date()
    };

    return {
      executiveSummary: `${auditData.domain} shows potential for SEO improvement. Key opportunities exist in keyword optimization and technical performance enhancement.`,
      priorityRecommendations: [
        {
          priority: 'high',
          category: 'technical',
          title: 'Improve Page Speed',
          description: 'Optimize images and reduce server response time to improve user experience and search rankings.',
          estimatedImpact: 'high',
          difficulty: 'medium',
          timeframe: 'short-term'
        },
        {
          priority: 'high',
          category: 'keywords',
          title: 'Optimize Target Keywords',
          description: 'Focus on industry-specific keywords that align with your business services.',
          estimatedImpact: 'high',
          difficulty: 'easy',
          timeframe: 'immediate'
        }
      ],
      keyInsights: [
        'Technical performance needs attention for better user experience',
        'Keyword strategy should focus on business-specific terms',
        'Content optimization opportunities identified'
      ],
      nextSteps: [
        'Address critical technical issues',
        'Implement keyword optimization',
        'Monitor competitive landscape'
      ],
      industrySpecificAdvice: [
        `For ${auditData.businessType.category} businesses, focus on local SEO and industry expertise`,
        'Consider your target audience needs when creating content',
        'Build authority through industry-specific content'
      ],
      usageMetrics: mockUsage
    };
  }

  /**
   * Estimate cost for conclusion generation
   */
  estimateConclusionCost(): { estimatedCost: number; estimatedTokens: number } {
    // Based on typical conclusion prompt size and response
    const estimatedInputTokens = 1000; // Comprehensive audit data
    const estimatedOutputTokens = 800; // Detailed conclusions
    
    const inputCost = (estimatedInputTokens / 1000000) * 0.25;
    const outputCost = (estimatedOutputTokens / 1000000) * 1.25;
    
    return {
      estimatedCost: inputCost + outputCost,
      estimatedTokens: estimatedInputTokens + estimatedOutputTokens
    };
  }
}

// Export convenience function
export async function generateAuditConclusions(
  auditData: AuditData, 
  apiKey?: string
): Promise<ConclusionResult> {
  const service = new ClaudeConclusionService(apiKey);
  return await service.generateConclusions(auditData);
}

// Export for cost estimation
export function createConclusionService(apiKey?: string): ClaudeConclusionService {
  return new ClaudeConclusionService(apiKey);
}