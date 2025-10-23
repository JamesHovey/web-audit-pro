/**
 * Google AI Overview Analysis Service
 * Tracks AI-generated answers in Google search results and their impact
 */

export interface AIOverviewData {
  keyword: string;
  hasAIOverview: boolean;
  aiSnippet?: string;
  citedDomains: string[];
  isCitedInAI: boolean;
  competitorsCited: string[];
  position?: number; // Organic position if ranking
  volume?: number;
  estimatedClickImpact: number; // Estimated % of clicks AI might capture
  aiOverviewType?: 'comprehensive' | 'quick_answer' | 'list' | 'comparison';
}

export interface AIOverviewAnalysis {
  totalKeywords: number;
  keywordsWithAI: number;
  percentageWithAI: number;
  citationCount: number;
  competitorCitations: { domain: string; count: number; }[];
  estimatedTrafficLoss: number; // Overall % traffic loss due to AI
  keywords: AIOverviewData[];
  insights: string[];
}

export class AIOverviewService {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Analyze AI Overview presence and impact across keywords
   */
  async analyzeAIOverviews(serpResults: any[]): Promise<AIOverviewAnalysis> {
    console.log(`🤖 Analyzing Google AI Overviews for ${this.domain}...`);

    const keywords: AIOverviewData[] = [];
    let totalWithAI = 0;
    let totalCitations = 0;
    const competitorCitationMap = new Map<string, number>();

    for (const result of serpResults) {
      const aiData = this.extractAIOverviewData(result);

      if (aiData) {
        keywords.push(aiData);

        if (aiData.hasAIOverview) {
          totalWithAI++;
        }

        if (aiData.isCitedInAI) {
          totalCitations++;
        }

        // Track competitor citations
        aiData.competitorsCited.forEach(competitor => {
          const currentCount = competitorCitationMap.get(competitor) || 0;
          competitorCitationMap.set(competitor, currentCount + 1);
        });
      }
    }

    // Convert competitor map to sorted array
    const competitorCitations = Array.from(competitorCitationMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 competitors

    const percentageWithAI = serpResults.length > 0
      ? Math.round((totalWithAI / serpResults.length) * 100)
      : 0;

    // Estimate overall traffic loss
    const estimatedTrafficLoss = this.calculateTrafficLoss(keywords);

    // Generate insights
    const insights = this.generateInsights(
      percentageWithAI,
      totalCitations,
      totalWithAI,
      competitorCitations
    );

    const analysis: AIOverviewAnalysis = {
      totalKeywords: serpResults.length,
      keywordsWithAI: totalWithAI,
      percentageWithAI,
      citationCount: totalCitations,
      competitorCitations,
      estimatedTrafficLoss,
      keywords: keywords.sort((a, b) => {
        // Sort by: AI present first, then by volume
        if (a.hasAIOverview !== b.hasAIOverview) {
          return a.hasAIOverview ? -1 : 1;
        }
        return (b.volume || 0) - (a.volume || 0);
      }),
      insights
    };

    console.log(`🤖 AI Overview Analysis Complete:`);
    console.log(`  - ${totalWithAI}/${serpResults.length} keywords have AI Overviews (${percentageWithAI}%)`);
    console.log(`  - Your domain cited ${totalCitations} times`);
    console.log(`  - Estimated traffic loss: ${estimatedTrafficLoss}%`);
    console.log(`  - Top competitor cited: ${competitorCitations[0]?.domain || 'none'} (${competitorCitations[0]?.count || 0} times)`);

    return analysis;
  }

  /**
   * Extract AI Overview data from a single SERP result
   */
  private extractAIOverviewData(serpResult: any): AIOverviewData | null {
    try {
      const keyword = serpResult.keyword || serpResult.searchParameters?.q || '';
      const volume = serpResult.volume || 0;
      const position = this.findDomainPosition(serpResult.organic || [], this.domain);

      // Check for AI Overview in different possible locations
      const aiOverview = serpResult.aiOverview ||
                        serpResult.ai_overview ||
                        serpResult.answerBox?.aiGenerated ||
                        null;

      if (!aiOverview && !serpResult.organic) {
        return null;
      }

      const hasAIOverview = !!aiOverview;
      const aiSnippet = aiOverview?.snippet || aiOverview?.text || aiOverview?.content || '';

      // Extract cited domains from AI Overview
      const citedDomains = this.extractCitedDomains(aiOverview);
      const isCitedInAI = citedDomains.includes(this.domain);

      // Identify competitors (cited domains that aren't us)
      const competitorsCited = citedDomains.filter(d => d !== this.domain);

      // Estimate click impact based on position and AI presence
      const estimatedClickImpact = this.estimateClickImpact(position, hasAIOverview);

      // Determine AI overview type
      const aiOverviewType = this.categorizeAIOverview(aiSnippet);

      return {
        keyword,
        hasAIOverview,
        aiSnippet: aiSnippet ? aiSnippet.substring(0, 500) : undefined, // Limit snippet length
        citedDomains,
        isCitedInAI,
        competitorsCited,
        position,
        volume,
        estimatedClickImpact,
        aiOverviewType
      };
    } catch (error) {
      console.error('Error extracting AI Overview data:', error);
      return null;
    }
  }

  /**
   * Extract domains cited in AI Overview
   */
  private extractCitedDomains(aiOverview: any): string[] {
    if (!aiOverview) return [];

    const domains = new Set<string>();

    try {
      // Check for sources/citations array
      const sources = aiOverview.sources || aiOverview.citations || aiOverview.links || [];

      sources.forEach((source: any) => {
        const url = source.url || source.link || source.source || '';
        if (url) {
          const domain = this.extractDomain(url);
          if (domain) domains.add(domain);
        }
      });

      // Also check snippet for URLs (backup method)
      const snippet = aiOverview.snippet || aiOverview.text || '';
      const urlPattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g;
      const matches = snippet.matchAll(urlPattern);

      for (const match of matches) {
        if (match[1]) {
          domains.add(match[1]);
        }
      }
    } catch (error) {
      console.error('Error extracting cited domains:', error);
    }

    return Array.from(domains);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  /**
   * Find position of domain in organic results
   */
  private findDomainPosition(organicResults: any[], domain: string): number | undefined {
    const index = organicResults.findIndex(result => {
      const resultDomain = this.extractDomain(result.link || result.url || '');
      return resultDomain === domain;
    });

    return index >= 0 ? index + 1 : undefined;
  }

  /**
   * Estimate click impact based on position and AI presence
   */
  private estimateClickImpact(position: number | undefined, hasAI: boolean): number {
    if (!hasAI) return 0;

    // Base click-through rates by position (approximations)
    const baseCTR: { [key: number]: number } = {
      1: 28, 2: 15, 3: 11, 4: 8, 5: 7, 6: 5, 7: 4, 8: 3, 9: 3, 10: 2
    };

    const ctr = position && position <= 10 ? baseCTR[position] || 2 : 0;

    // AI can reduce clicks by 40-60% depending on position
    const aiReduction = position && position <= 3 ? 0.5 : 0.4; // 50% for top 3, 40% for others

    return Math.round(ctr * aiReduction);
  }

  /**
   * Calculate overall traffic loss estimate
   */
  private calculateTrafficLoss(keywords: AIOverviewData[]): number {
    if (keywords.length === 0) return 0;

    const totalPotentialImpact = keywords.reduce((sum, kw) => {
      return sum + (kw.estimatedClickImpact || 0);
    }, 0);

    return Math.round(totalPotentialImpact / keywords.length);
  }

  /**
   * Categorize AI Overview type
   */
  private categorizeAIOverview(snippet: string): 'comprehensive' | 'quick_answer' | 'list' | 'comparison' {
    if (!snippet) return 'quick_answer';

    const lowerSnippet = snippet.toLowerCase();

    if (lowerSnippet.includes('vs') || lowerSnippet.includes('versus') || lowerSnippet.includes('compared')) {
      return 'comparison';
    }

    if (snippet.split('\n').length > 3 || snippet.includes('1.') || snippet.includes('•')) {
      return 'list';
    }

    if (snippet.length > 300) {
      return 'comprehensive';
    }

    return 'quick_answer';
  }

  /**
   * Generate insights based on analysis
   */
  private generateInsights(
    percentageWithAI: number,
    citationCount: number,
    totalWithAI: number,
    competitorCitations: { domain: string; count: number; }[]
  ): string[] {
    const insights: string[] = [];

    // AI Prevalence insights
    if (percentageWithAI >= 60) {
      insights.push(`High AI Impact: ${percentageWithAI}% of your target keywords trigger AI Overviews, significantly affecting organic click-through rates.`);
    } else if (percentageWithAI >= 30) {
      insights.push(`Moderate AI Impact: ${percentageWithAI}% of keywords show AI Overviews. Monitor this trend as Google expands AI answers.`);
    } else if (percentageWithAI > 0) {
      insights.push(`Low AI Impact: Only ${percentageWithAI}% of keywords have AI Overviews currently. This may increase over time.`);
    }

    // Citation insights
    if (citationCount === 0 && totalWithAI > 0) {
      insights.push(`❌ Not Cited: Your domain is not cited in any AI Overviews. Focus on creating authoritative, well-structured content to increase citation chances.`);
    } else if (citationCount > 0) {
      const citationRate = Math.round((citationCount / totalWithAI) * 100);
      if (citationRate >= 30) {
        insights.push(`✅ Strong AI Presence: You're cited in ${citationCount} AI Overviews (${citationRate}% citation rate). This builds brand authority.`);
      } else {
        insights.push(`⚠️ Limited AI Citations: You're cited in ${citationCount} AI Overviews (${citationRate}% rate). Improve content depth and authority to increase citations.`);
      }
    }

    // Competitor insights
    if (competitorCitations.length > 0) {
      const topCompetitor = competitorCitations[0];
      insights.push(`🏆 Top AI Competitor: ${topCompetitor.domain} is cited ${topCompetitor.count} times in AI Overviews. Analyze their content strategy.`);
    }

    // Strategic recommendations
    if (percentageWithAI > 40 && citationCount === 0) {
      insights.push(`💡 Opportunity: Create comprehensive, well-researched content with clear structure, data, and expert quotes to increase AI citation chances.`);
    }

    if (insights.length === 0) {
      insights.push('No AI Overviews detected for analyzed keywords. AI features may not be enabled for these query types yet.');
    }

    return insights;
  }
}
