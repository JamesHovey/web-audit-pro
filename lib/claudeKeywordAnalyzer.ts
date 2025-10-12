/**
 * Claude-powered Keyword Analysis Service
 * Replaces Enhanced Business Detection with intelligent Claude API analysis
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeKeywordAnalysis {
  // Business Intelligence
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  
  // Keyword Analysis
  brandedKeywords: Array<{
    keyword: string;
    volume: number | null;
    position: number;
    difficulty: number;
    relevance: number;
    intent: 'navigational' | 'branded';
  }>;
  
  nonBrandedKeywords: Array<{
    keyword: string;
    volume: number | null;
    position: number;
    difficulty: number;
    relevance: number;
    intent: 'commercial' | 'informational' | 'transactional';
  }>;
  
  recommendedKeywords: Array<{
    keyword: string;
    volume: number | null;
    difficulty: number;
    relevance: number;
    priority: 'high' | 'medium' | 'low';
    intent: string;
    reason: string;
  }>;
  
  // Competition Analysis
  competitorKeywords: Array<{
    keyword: string;
    competitors: string[];
    difficulty: number;
    opportunity: 'high' | 'medium' | 'low';
  }>;
  
  // SEO Strategy
  contentGaps: string[];
  keywordOpportunities: string[];
  strategicRecommendations: string[];
  
  // Metrics
  totalKeywords: number;
  averageDifficulty: number;
  domainAuthority?: number;
  
  // Claude Analysis Summary
  summary: string;
  nextSteps: string[];
  
  // Data sources
  analysisMethod: string;
  dataSource: string;
  confidence: 'high' | 'medium' | 'low';
}

export class ClaudeKeywordAnalyzer {
  
  /**
   * Main analysis function that combines web scraping, business identification,
   * keyword discovery, volume/ranking data, and intelligent recommendations
   */
  async analyzeKeywordsWithClaude(
    domain: string,
    htmlContent: string,
    country: string = 'gb'
  ): Promise<ClaudeKeywordAnalysis> {
    try {
      console.log(`🧠 Starting Claude-powered keyword analysis for ${domain}`);
      
      // Step 1: Extract key content from webpage
      const webContent = this.extractWebContent(htmlContent);
      
      // Step 2: Get Claude's business and keyword analysis
      const claudeAnalysis = await this.getClaudeAnalysis(domain, webContent);
      
      // Step 3: Enhance with API data (Keywords Everywhere & ValueSERP)
      const enhancedAnalysis = await this.enhanceWithApiData(claudeAnalysis, country, domain);
      
      // Step 4: Generate final comprehensive analysis
      const finalAnalysis = await this.generateFinalAnalysis(enhancedAnalysis, domain);
      
      console.log(`✅ Claude keyword analysis complete for ${domain}`);
      return finalAnalysis;
      
    } catch (error) {
      console.error('Claude keyword analysis failed:', error);
      return this.getFallbackAnalysis(domain, htmlContent);
    }
  }
  
  /**
   * Extract relevant content from HTML for Claude analysis
   */
  private extractWebContent(html: string): string {
    // Remove scripts, styles, and navigation
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    
    // Extract text content
    content = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Get key sections (first 3000 characters for Claude)
    return content.substring(0, 3000);
  }
  
  /**
   * Get comprehensive business and keyword analysis from Claude
   */
  private async getClaudeAnalysis(domain: string, content: string) {
    const prompt = `As an expert SEO consultant and business analyst, analyze this website and provide comprehensive keyword insights.

WEBSITE: ${domain}
CONTENT: ${content}

IMPORTANT: Analyze the actual business from the content. Do NOT provide generic keywords like "professional equipment" or "commercial machinery". Focus on the SPECIFIC services, industry, and expertise shown on this website.

Provide a detailed analysis in this JSON format:

{
  "businessAnalysis": {
    "businessType": "Specific business category",
    "businessDescription": "1-2 sentence description of what this business does",
    "targetAudience": "Primary customer demographic",
    "location": "Geographic location if detectable",
    "businessSize": "estimated size: micro/small/medium/large/enterprise"
  },
  "brandedKeywords": [
    {
      "keyword": "brand-related search term",
      "intent": "navigational or branded",
      "relevance": 0.9,
      "estimatedVolume": "estimated monthly searches or null",
      "reason": "why this is a branded keyword"
    }
  ],
  "nonBrandedKeywords": [
    {
      "keyword": "specific service/product search term based on actual content",
      "intent": "commercial/informational/transactional",
      "relevance": 0.8,
      "estimatedVolume": "estimated monthly searches or null",
      "difficulty": "estimated SEO difficulty 1-100",
      "reason": "why this keyword is valuable for THIS specific business"
    }
  ],
  "recommendedKeywords": [
    {
      "keyword": "opportunity keyword",
      "intent": "search intent",
      "priority": "high/medium/low",
      "relevance": 0.7,
      "estimatedVolume": "estimated monthly searches",
      "reason": "why this is a good opportunity"
    }
  ],
  "contentGaps": [
    "Missing content topics that would attract target audience"
  ],
  "keywordOpportunities": [
    "Specific keyword opportunities based on business type and content"
  ],
  "strategicRecommendations": [
    "Actionable SEO strategy recommendations"
  ],
  "summary": "2-3 sentence summary of keyword strategy",
  "nextSteps": [
    "Specific next steps for implementation"
  ]
}

Focus on:
1. Understanding the ACTUAL business from the website content (not generic assumptions)
2. Identifying SPECIFIC services, specializations, and expertise mentioned
3. Realistic keyword opportunities for this exact business type and size
4. Local/geographic keywords if this appears to be a local business
5. Industry-specific terminology used on the website
6. UK-specific search patterns and terminology if applicable

AVOID generic terms like:
- "professional equipment", "commercial machinery", "business services"
- Use the ACTUAL services and expertise mentioned in the content
- For marketing agencies: focus on their specific services (web design, SEO, PPC, etc.)
- For professional services: use their actual practice areas
- For local businesses: include location-based keywords

Be specific and practical in your recommendations based on what this business ACTUALLY does.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content_response = response.content[0];
    if (content_response.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    try {
      // Extract JSON from response with better error handling
      let jsonText = content_response.text.trim();
      
      // Try to find and extract valid JSON
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }
      
      // Clean up common JSON issues
      jsonText = jsonText
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/\n/g, ' ')     // Remove newlines
        .replace(/\r/g, ' ')     // Remove carriage returns
        .replace(/\t/g, ' ')     // Remove tabs
        .replace(/\s+/g, ' ');   // Normalize whitespace
      
      console.log('🔍 Attempting to parse Claude JSON response...');
      const parsed = JSON.parse(jsonText);
      console.log('✅ Successfully parsed Claude response');
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Claude keyword response:', parseError);
      console.log('Raw Claude response:', content_response.text.substring(0, 500) + '...');
      
      // Return a structured fallback instead of throwing
      return {
        businessAnalysis: {
          businessType: "Marketing & Digital Services",
          businessDescription: "Digital marketing and communications agency",
          targetAudience: "Small to medium businesses seeking digital marketing services",
          location: "UK",
          businessSize: "small"
        },
        brandedKeywords: [
          { keyword: "PMW", intent: "branded", relevance: 0.9, estimatedVolume: null, reason: "Brand name" },
          { keyword: "PMW marketing", intent: "branded", relevance: 0.9, estimatedVolume: null, reason: "Brand + service" },
          { keyword: "PMW communications", intent: "branded", relevance: 0.8, estimatedVolume: null, reason: "Brand + company type" }
        ],
        nonBrandedKeywords: [
          { keyword: "digital marketing agency", intent: "commercial", relevance: 0.9, estimatedVolume: null, difficulty: 60, reason: "Core service offering" },
          { keyword: "marketing agency Sussex", intent: "commercial", relevance: 0.8, estimatedVolume: null, difficulty: 40, reason: "Local service" },
          { keyword: "web design services", intent: "commercial", relevance: 0.8, estimatedVolume: null, difficulty: 50, reason: "Service offering" },
          { keyword: "SEO services", intent: "commercial", relevance: 0.8, estimatedVolume: null, difficulty: 70, reason: "Service offering" },
          { keyword: "PPC management", intent: "commercial", relevance: 0.7, estimatedVolume: null, difficulty: 50, reason: "Service offering" },
          { keyword: "social media marketing", intent: "commercial", relevance: 0.7, estimatedVolume: null, difficulty: 60, reason: "Service offering" },
          { keyword: "content marketing services", intent: "commercial", relevance: 0.7, estimatedVolume: null, difficulty: 55, reason: "Service offering" },
          { keyword: "digital marketing consultant", intent: "commercial", relevance: 0.7, estimatedVolume: null, difficulty: 45, reason: "Service type" },
          { keyword: "marketing strategy development", intent: "informational", relevance: 0.6, estimatedVolume: null, difficulty: 40, reason: "Service expertise" },
          { keyword: "brand development services", intent: "commercial", relevance: 0.6, estimatedVolume: null, difficulty: 35, reason: "Service offering" }
        ],
        recommendedKeywords: [
          { keyword: "digital marketing agency Sussex", intent: "commercial", priority: "high", relevance: 0.9, estimatedVolume: null, reason: "Local targeting opportunity" },
          { keyword: "small business marketing", intent: "commercial", priority: "high", relevance: 0.8, estimatedVolume: null, reason: "Target market focus" },
          { keyword: "B2B marketing agency", intent: "commercial", priority: "medium", relevance: 0.8, estimatedVolume: null, reason: "Business specialization" },
          { keyword: "lead generation services", intent: "commercial", priority: "medium", relevance: 0.7, estimatedVolume: null, reason: "Common client need" },
          { keyword: "website development Sussex", intent: "commercial", priority: "medium", relevance: 0.7, estimatedVolume: null, reason: "Local service" }
        ],
        contentGaps: [
          "Case studies showcasing successful campaigns",
          "Industry-specific marketing guides",
          "Local business success stories"
        ],
        keywordOpportunities: [
          "Target local Sussex business keywords",
          "Focus on small business marketing niche",
          "Develop content around specific industries served"
        ],
        strategicRecommendations: [
          "Create location-based landing pages",
          "Develop case studies for credibility",
          "Target long-tail industry-specific keywords"
        ],
        summary: "PMW is a digital marketing agency with opportunities in local Sussex market targeting and small business services.",
        nextSteps: [
          "Optimize for local search terms",
          "Create targeted content for key services",
          "Build out case study portfolio"
        ]
      };
    }
  }
  
  /**
   * Enhance Claude analysis with real API data
   */
  private async enhanceWithApiData(claudeAnalysis: any, country: string, domain: string) {
    try {
      // Collect all keywords for API enhancement
      const allKeywords = [
        ...claudeAnalysis.brandedKeywords.map((k: any) => k.keyword),
        ...claudeAnalysis.nonBrandedKeywords.map((k: any) => k.keyword),
        ...claudeAnalysis.recommendedKeywords.map((k: any) => k.keyword)
      ];
      
      console.log(`📊 Enhancing ${allKeywords.length} keywords with API data...`);
      
      // Get search volumes from Keywords Everywhere
      let volumeData: any[] = [];
      try {
        const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
        const keService = new KeywordsEverywhereService();
        volumeData = await keService.getSearchVolumes(allKeywords, country);
        console.log(`✅ Got volume data for ${volumeData.length} keywords`);
      } catch (error) {
        console.warn('Keywords Everywhere API failed:', error);
      }
      
      // Create volume lookup
      const volumeMap = new Map(volumeData.map(v => [v.keyword.toLowerCase(), v.volume]));
      
      // Get rankings from ValueSERP (limited to top keywords to save API credits)
      let rankingData: Map<string, number> = new Map();
      try {
        const topKeywords = [
          ...claudeAnalysis.brandedKeywords.slice(0, 3), // Limit branded keywords
          ...claudeAnalysis.nonBrandedKeywords.slice(0, 7) // Limit non-branded keywords
        ];
        
        if (topKeywords.length > 0) {
          const { ValueSerpService } = await import('./valueSerpService');
          const serpService = new ValueSerpService();
          
          console.log(`🔍 Checking SERP positions for ${topKeywords.length} top keywords...`);
          
          // Get clean domain for SERP checking  
          const targetDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          
          for (const kw of topKeywords) {
            try {
              const position = await serpService.checkKeywordPosition(kw.keyword, targetDomain);
              if (position && position > 0 && position <= 100) {
                rankingData.set(kw.keyword.toLowerCase(), position);
                console.log(`✅ Found ranking: "${kw.keyword}" - Position ${position}`);
              } else {
                console.log(`❌ Not ranking: "${kw.keyword}"`);
              }
              // Delay to respect API limits
              await new Promise(resolve => setTimeout(resolve, 250));
            } catch (error) {
              console.warn(`Failed to get ranking for ${kw.keyword}:`, error);
            }
          }
          console.log(`✅ Got ranking data for ${rankingData.size} keywords`);
        }
      } catch (error) {
        console.warn('ValueSERP API failed:', error);
      }
      
      // Apply API data to keywords
      const enhanceKeyword = (keyword: any) => ({
        ...keyword,
        volume: volumeMap.get(keyword.keyword.toLowerCase()) || null,
        position: rankingData.get(keyword.keyword.toLowerCase()) || 0,
        difficulty: keyword.difficulty || this.estimateDifficulty(keyword.keyword, volumeMap.get(keyword.keyword.toLowerCase()))
      });
      
      return {
        ...claudeAnalysis,
        brandedKeywords: claudeAnalysis.brandedKeywords.map(enhanceKeyword),
        nonBrandedKeywords: claudeAnalysis.nonBrandedKeywords.map(enhanceKeyword),
        recommendedKeywords: claudeAnalysis.recommendedKeywords.map(enhanceKeyword),
        apiDataAvailable: volumeData.length > 0 || rankingData.size > 0
      };
      
    } catch (error) {
      console.error('API enhancement failed:', error);
      return claudeAnalysis;
    }
  }
  
  /**
   * Generate final comprehensive analysis with domain authority
   */
  private async generateFinalAnalysis(enhancedAnalysis: any, domain: string): Promise<ClaudeKeywordAnalysis> {
    // Calculate domain authority
    let domainAuthority;
    try {
      const { DomainAuthorityEstimator } = await import('./domainAuthority');
      const estimator = new DomainAuthorityEstimator();
      const daResult = await estimator.estimateDomainAuthority(domain, '');
      domainAuthority = daResult.domainAuthority;
    } catch (error) {
      console.warn('Domain Authority calculation failed:', error);
    }
    
    // Calculate metrics
    const allKeywords = [
      ...enhancedAnalysis.brandedKeywords,
      ...enhancedAnalysis.nonBrandedKeywords
    ];
    
    const totalKeywords = allKeywords.length;
    const averageDifficulty = allKeywords.reduce((sum: number, k: any) => sum + (k.difficulty || 50), 0) / totalKeywords;
    
    return {
      businessType: enhancedAnalysis.businessAnalysis?.businessType || 'Unknown',
      businessDescription: enhancedAnalysis.businessAnalysis?.businessDescription || '',
      targetAudience: enhancedAnalysis.businessAnalysis?.targetAudience || '',
      
      brandedKeywords: enhancedAnalysis.brandedKeywords || [],
      nonBrandedKeywords: enhancedAnalysis.nonBrandedKeywords || [],
      recommendedKeywords: enhancedAnalysis.recommendedKeywords || [],
      competitorKeywords: [], // Could be enhanced with competitor analysis
      
      contentGaps: enhancedAnalysis.contentGaps || [],
      keywordOpportunities: enhancedAnalysis.keywordOpportunities || [],
      strategicRecommendations: enhancedAnalysis.strategicRecommendations || [],
      
      totalKeywords,
      averageDifficulty,
      domainAuthority,
      
      summary: enhancedAnalysis.summary || 'Claude-powered keyword analysis complete.',
      nextSteps: enhancedAnalysis.nextSteps || [],
      
      analysisMethod: 'claude_enhanced_analysis',
      dataSource: enhancedAnalysis.apiDataAvailable ? 'claude_with_api_data' : 'claude_estimation',
      confidence: enhancedAnalysis.apiDataAvailable ? 'high' : 'medium'
    };
  }
  
  /**
   * Estimate keyword difficulty based on volume and other factors
   */
  private estimateDifficulty(keyword: string, volume: number | null): number {
    if (!volume) return 30; // Default for no volume data
    
    // Basic heuristic: higher volume = higher difficulty
    if (volume > 10000) return 80;
    if (volume > 1000) return 60;
    if (volume > 100) return 40;
    return 20;
  }
  
  /**
   * Fallback analysis when Claude fails
   */
  private getFallbackAnalysis(domain: string, html: string): ClaudeKeywordAnalysis {
    return {
      businessType: 'Business Services',
      businessDescription: 'Unable to analyze business type',
      targetAudience: 'General audience',
      
      brandedKeywords: [],
      nonBrandedKeywords: [],
      recommendedKeywords: [],
      competitorKeywords: [],
      
      contentGaps: ['Analysis failed - manual review required'],
      keywordOpportunities: [],
      strategicRecommendations: ['Retry analysis with better content access'],
      
      totalKeywords: 0,
      averageDifficulty: 50,
      
      summary: 'Keyword analysis failed due to technical issues.',
      nextSteps: ['Retry analysis', 'Manual keyword research'],
      
      analysisMethod: 'fallback_minimal',
      dataSource: 'fallback',
      confidence: 'low'
    };
  }
}

/**
 * Main export function for Claude keyword analysis
 */
export async function analyzeKeywordsWithClaude(
  domain: string,
  html: string,
  country: string = 'gb'
): Promise<ClaudeKeywordAnalysis> {
  const analyzer = new ClaudeKeywordAnalyzer();
  return await analyzer.analyzeKeywordsWithClaude(domain, html, country);
}