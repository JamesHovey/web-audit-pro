/**
 * Intelligent Keyword Generator using Claude API
 * Replaces static database with AI-powered business understanding
 */

import { analyzeBusinessWithClaude, type BusinessAnalysisResult, type ClaudeUsageMetrics } from './claudeApiService';

export interface IntelligentKeywordResult {
  // Business Understanding
  businessAnalysis: {
    category: string;
    subcategory: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    targetAudience: string[];
    businessModel: 'B2B' | 'B2C' | 'B2B2C';
  };
  
  // Generated Keywords
  keywords: {
    primary: KeywordWithIntelligence[];
    secondary: KeywordWithIntelligence[];
    longTail: KeywordWithIntelligence[];
    local: KeywordWithIntelligence[];
    commercial: KeywordWithIntelligence[];
    informational: KeywordWithIntelligence[];
    urgency: KeywordWithIntelligence[];
  };
  
  // Additional Insights
  insights: {
    competitiveKeywords: string[];
    contentOpportunities: string[];
    seasonalKeywords: string[];
    searchIntentMapping: { [keyword: string]: 'navigational' | 'informational' | 'commercial' | 'transactional' };
  };
  
  // Metadata
  metadata: {
    totalKeywords: number;
    generationMethod: 'claude_api';
    apiUsage: ClaudeUsageMetrics;
    generatedAt: Date;
    costPerKeyword: number;
  };
}

export interface KeywordWithIntelligence {
  keyword: string;
  category: 'primary' | 'secondary' | 'long-tail' | 'local' | 'commercial' | 'informational' | 'urgency';
  searchIntent: 'navigational' | 'informational' | 'commercial' | 'transactional';
  businessRelevance: number; // 0-1 score
  commercialValue: 'high' | 'medium' | 'low';
  competitionLevel: 'high' | 'medium' | 'low';
  searchVolumePotential: 'high' | 'medium' | 'low';
  aiGenerated: true;
  reasoning?: string; // Why Claude suggested this keyword
}

export class IntelligentKeywordGenerator {
  private claudeApiKey?: string;
  
  constructor(claudeApiKey?: string) {
    this.claudeApiKey = claudeApiKey;
  }
  
  /**
   * Generate intelligent keywords using Claude API
   */
  async generateKeywords(domain: string, htmlContent: string): Promise<IntelligentKeywordResult> {
    console.log(`🧠 Generating intelligent keywords for: ${domain}`);
    
    try {
      // Use Claude to analyze the business and generate keywords
      const claudeAnalysis = await analyzeBusinessWithClaude(domain, htmlContent, this.claudeApiKey);
      
      // Convert Claude's analysis to our keyword format
      const intelligentResult = this.convertToIntelligentFormat(claudeAnalysis);
      
      console.log(`✅ Generated ${intelligentResult.metadata.totalKeywords} intelligent keywords`);
      console.log(`💰 API cost: $${claudeAnalysis.usageMetrics.totalCost.toFixed(4)}`);
      
      return intelligentResult;
      
    } catch (error) {
      console.error('❌ Intelligent keyword generation failed:', error);
      throw new Error(`Failed to generate intelligent keywords: ${error.message}`);
    }
  }
  
  /**
   * Convert Claude's analysis to our intelligent keyword format
   */
  private convertToIntelligentFormat(claudeAnalysis: BusinessAnalysisResult): IntelligentKeywordResult {
    const keywords = {
      primary: this.convertKeywordCategory(claudeAnalysis.keywordCategories.primary, 'primary'),
      secondary: this.convertKeywordCategory(claudeAnalysis.keywordCategories.secondary, 'secondary'),
      longTail: this.convertKeywordCategory(claudeAnalysis.keywordCategories.longTail, 'long-tail'),
      local: this.convertKeywordCategory(claudeAnalysis.keywordCategories.local, 'local'),
      commercial: this.convertKeywordCategory(claudeAnalysis.keywordCategories.commercial, 'commercial'),
      informational: this.convertKeywordCategory(claudeAnalysis.keywordCategories.informational, 'informational'),
      urgency: this.convertKeywordCategory(claudeAnalysis.keywordCategories.urgency, 'urgency')
    };
    
    const totalKeywords = Object.values(keywords).reduce((total, category) => total + category.length, 0);
    const costPerKeyword = totalKeywords > 0 ? claudeAnalysis.usageMetrics.totalCost / totalKeywords : 0;
    
    // Create search intent mapping
    const searchIntentMapping: { [keyword: string]: 'navigational' | 'informational' | 'commercial' | 'transactional' } = {};
    Object.values(keywords).flat().forEach(kw => {
      searchIntentMapping[kw.keyword] = kw.searchIntent;
    });
    
    return {
      businessAnalysis: {
        category: claudeAnalysis.businessType.category,
        subcategory: claudeAnalysis.businessType.subcategory,
        description: claudeAnalysis.businessType.description,
        confidence: claudeAnalysis.businessType.confidence,
        targetAudience: [...claudeAnalysis.targetAudience.primary, ...claudeAnalysis.targetAudience.secondary],
        businessModel: claudeAnalysis.targetAudience.businessModel
      },
      keywords,
      insights: {
        competitiveKeywords: claudeAnalysis.competitiveKeywords,
        contentOpportunities: claudeAnalysis.contentOpportunities,
        seasonalKeywords: this.extractSeasonalKeywords(claudeAnalysis),
        searchIntentMapping
      },
      metadata: {
        totalKeywords,
        generationMethod: 'claude_api',
        apiUsage: claudeAnalysis.usageMetrics,
        generatedAt: new Date(),
        costPerKeyword
      }
    };
  }
  
  /**
   * Convert keyword list to intelligent format with metadata
   */
  private convertKeywordCategory(
    keywords: string[], 
    category: KeywordWithIntelligence['category']
  ): KeywordWithIntelligence[] {
    return keywords.map(keyword => ({
      keyword: keyword.toLowerCase().trim(),
      category,
      searchIntent: this.determineSearchIntent(keyword, category),
      businessRelevance: this.calculateBusinessRelevance(keyword, category),
      commercialValue: this.assessCommercialValue(keyword, category),
      competitionLevel: this.estimateCompetition(keyword),
      searchVolumePotential: this.estimateSearchVolume(keyword, category),
      aiGenerated: true,
      reasoning: `Claude AI identified this as a relevant ${category} keyword based on business analysis`
    }));
  }
  
  /**
   * Determine search intent based on keyword and category
   */
  private determineSearchIntent(
    keyword: string, 
    category: KeywordWithIntelligence['category']
  ): 'navigational' | 'informational' | 'commercial' | 'transactional' {
    // Commercial category keywords are usually transactional
    if (category === 'commercial') {
      return keyword.includes('buy') || keyword.includes('price') || keyword.includes('cost') 
        ? 'transactional' : 'commercial';
    }
    
    // Informational category keywords
    if (category === 'informational') {
      return 'informational';
    }
    
    // Primary keywords often navigational
    if (category === 'primary') {
      return 'navigational';
    }
    
    // Local keywords are usually navigational
    if (category === 'local') {
      return 'navigational';
    }
    
    // Urgency keywords are transactional
    if (category === 'urgency') {
      return 'transactional';
    }
    
    // Default to commercial for secondary and long-tail
    return 'commercial';
  }
  
  /**
   * Calculate business relevance score
   */
  private calculateBusinessRelevance(
    keyword: string, 
    category: KeywordWithIntelligence['category']
  ): number {
    // Primary keywords are most relevant
    if (category === 'primary') return 0.9;
    
    // Commercial keywords are highly relevant for business
    if (category === 'commercial') return 0.8;
    
    // Local keywords are highly relevant for local businesses
    if (category === 'local') return 0.8;
    
    // Secondary keywords are moderately relevant
    if (category === 'secondary') return 0.7;
    
    // Long-tail keywords can be very specific
    if (category === 'long-tail') return 0.75;
    
    // Informational keywords are valuable for content strategy
    if (category === 'informational') return 0.6;
    
    // Urgency keywords are valuable but niche
    if (category === 'urgency') return 0.7;
    
    return 0.6;
  }
  
  /**
   * Assess commercial value of keyword
   */
  private assessCommercialValue(
    keyword: string, 
    category: KeywordWithIntelligence['category']
  ): 'high' | 'medium' | 'low' {
    // Commercial and urgency keywords have high commercial value
    if (category === 'commercial' || category === 'urgency') {
      return 'high';
    }
    
    // Primary and local keywords have medium-high commercial value
    if (category === 'primary' || category === 'local') {
      return 'medium';
    }
    
    // Long-tail keywords can be high value if specific
    if (category === 'long-tail') {
      return keyword.includes('buy') || keyword.includes('service') || keyword.includes('professional') 
        ? 'high' : 'medium';
    }
    
    // Secondary keywords are medium value
    if (category === 'secondary') {
      return 'medium';
    }
    
    // Informational keywords are typically low commercial value
    return 'low';
  }
  
  /**
   * Estimate competition level
   */
  private estimateCompetition(keyword: string): 'high' | 'medium' | 'low' {
    // Single word keywords are usually high competition
    if (keyword.split(' ').length === 1) {
      return 'high';
    }
    
    // 2-3 word phrases are medium competition
    if (keyword.split(' ').length <= 3) {
      return 'medium';
    }
    
    // Long-tail keywords (4+ words) are usually lower competition
    return 'low';
  }
  
  /**
   * Estimate search volume potential
   */
  private estimateSearchVolume(
    keyword: string, 
    category: KeywordWithIntelligence['category']
  ): 'high' | 'medium' | 'low' {
    // Primary keywords usually have high search volume
    if (category === 'primary') {
      return 'high';
    }
    
    // Local keywords with "near me" are high volume
    if (category === 'local' && keyword.includes('near me')) {
      return 'high';
    }
    
    // Commercial keywords often have good volume
    if (category === 'commercial') {
      return 'medium';
    }
    
    // Long-tail keywords typically have lower but more targeted volume
    if (category === 'long-tail') {
      return 'low';
    }
    
    // Secondary keywords are medium volume
    if (category === 'secondary') {
      return 'medium';
    }
    
    // Default to medium
    return 'medium';
  }
  
  /**
   * Extract seasonal keywords from analysis
   */
  private extractSeasonalKeywords(analysis: BusinessAnalysisResult): string[] {
    const seasonalTerms = ['christmas', 'holiday', 'summer', 'winter', 'seasonal', 'valentine', 'easter', 'black friday'];
    const allKeywords = Object.values(analysis.keywordCategories).flat();
    
    return allKeywords.filter(keyword => 
      seasonalTerms.some(term => keyword.toLowerCase().includes(term))
    );
  }
  
  /**
   * Estimate cost for keyword generation
   */
  async estimateKeywordGenerationCost(htmlContent: string): Promise<{
    estimatedCost: number;
    estimatedTokens: number;
    estimatedKeywords: number;
  }> {
    // This would use the Claude service to estimate
    // For now, return average estimates
    return {
      estimatedCost: 0.038, // Average cost per audit
      estimatedTokens: 6500, // Average token usage
      estimatedKeywords: 85 // Average keywords generated
    };
  }
}

// Export convenience function
export async function generateIntelligentKeywords(
  domain: string, 
  htmlContent: string, 
  claudeApiKey?: string
): Promise<IntelligentKeywordResult> {
  const generator = new IntelligentKeywordGenerator(claudeApiKey);
  return await generator.generateKeywords(domain, htmlContent);
}

// Export for cost estimation
export function createIntelligentGenerator(claudeApiKey?: string): IntelligentKeywordGenerator {
  return new IntelligentKeywordGenerator(claudeApiKey);
}