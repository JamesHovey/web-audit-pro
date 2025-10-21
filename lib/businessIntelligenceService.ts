/**
 * Business Intelligence Service
 * Dynamically analyzes websites to identify business type, extract keywords, and find real competitors
 */

interface BusinessAnalysis {
  businessType: string;
  industry: string;
  services: string[];
  location: string[];
  targetAudience: string;
  businessModel: string;
  extractedKeywords: string[];
  confidence: number;
}

interface CompetitorIntelligence {
  domain: string;
  title: string;
  position: number;
  sharedKeywords: string[];
  overlapPercentage: number;
  estimatedAuthority: number;
  competitorType: 'direct' | 'aspirational';
}

export class BusinessIntelligenceService {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Scrape and analyze website content to identify business type and extract keywords
   */
  async analyzeWebsiteContent(): Promise<BusinessAnalysis> {
    try {
      console.log(`🔍 Analyzing website content for ${this.domain}...`);
      
      // Scrape website content
      const websiteContent = await this.scrapeWebsiteContent();
      
      // Use Claude to analyze the content and identify business intelligence
      const analysis = await this.analyzeContentWithClaude(websiteContent);
      
      return analysis;
      
    } catch (error) {
      console.error('Website content analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Scrape website content from multiple sources
   */
  private async scrapeWebsiteContent(): Promise<{
    homePageContent: string;
    aboutPageContent: string;
    servicesPageContent: string;
    metaData: { title: string; description: string };
  }> {
    const baseUrl = `https://${this.domain}`;
    
    try {
      // Scrape homepage
      const homePageContent = await this.fetchPageContent(baseUrl);
      
      // Try to scrape about and services pages
      const aboutPageContent = await this.fetchPageContent(`${baseUrl}/about`) || 
                              await this.fetchPageContent(`${baseUrl}/about-us`) || '';
      
      const servicesPageContent = await this.fetchPageContent(`${baseUrl}/services`) || 
                                 await this.fetchPageContent(`${baseUrl}/what-we-do`) || '';
      
      return {
        homePageContent,
        aboutPageContent,
        servicesPageContent,
        metaData: this.extractMetaData(homePageContent)
      };
      
    } catch (error) {
      console.error('Content scraping failed:', error);
      throw error;
    }
  }

  /**
   * Fetch and clean content from a webpage
   */
  private async fetchPageContent(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Basic content extraction (remove scripts, styles, and clean text)
      const cleanedContent = this.extractTextFromHtml(html);
      
      return cleanedContent.slice(0, 5000); // Limit content size
      
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message);
      return '';
    }
  }

  /**
   * Extract clean text content from HTML
   */
  private extractTextFromHtml(html: string): string {
    // Remove scripts, styles, and other non-content elements
    let text = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  }

  /**
   * Extract meta data from HTML
   */
  private extractMetaData(html: string): { title: string; description: string } {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=['"]*description['"]*[^>]*content=['"]*([^'"]*)['"]*[^>]*>/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : ''
    };
  }

  /**
   * Use Claude to analyze website content and extract business intelligence
   */
  private async analyzeContentWithClaude(content: {
    homePageContent: string;
    aboutPageContent: string;
    servicesPageContent: string;
    metaData: { title: string; description: string };
  }): Promise<BusinessAnalysis> {
    
    const prompt = `Analyze this website content to identify the business type, industry, and extract relevant keywords for SEO competitor analysis.

DOMAIN: ${this.domain}
TITLE: ${content.metaData.title}
META DESCRIPTION: ${content.metaData.description}

HOMEPAGE CONTENT:
${content.homePageContent}

ABOUT PAGE CONTENT:
${content.aboutPageContent}

SERVICES PAGE CONTENT:
${content.servicesPageContent}

Analyze this content and provide a JSON response with business intelligence:

{
  "businessType": "specific business type (e.g., 'Digital Marketing Agency', 'Law Firm', 'E-commerce Store')",
  "industry": "broad industry category (e.g., 'marketing', 'legal', 'retail', 'healthcare', 'finance', 'technology')",
  "services": ["list", "of", "main", "services", "offered"],
  "location": ["geographic", "locations", "served"],
  "targetAudience": "description of target customers",
  "businessModel": "B2B, B2C, marketplace, SaaS, etc.",
  "extractedKeywords": ["business-relevant", "keywords", "for", "seo", "analysis"],
  "confidence": 85
}

INSTRUCTIONS:
1. Identify the PRIMARY business type and industry from the content
2. Extract 15-25 relevant keywords that this business should rank for
3. Include service-based keywords, location-based keywords, and industry terms
4. Focus on commercial intent keywords that competitors would also target
5. Include both broad and specific (long-tail) keyword opportunities
6. Rate confidence 1-100 based on content quality and clarity
7. If location is mentioned, include local keywords (e.g., "marketing agency london")
8. Extract keywords that would be valuable for competitor analysis

Focus on keywords that real competitors in this industry would actually rank for.`;

    try {
      // Use direct Claude API call instead of fetch to another API route
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content_response = response.content[0];
      if (content_response.type !== 'text') {
        throw new Error('Unexpected response format from Claude');
      }

      // Parse Claude's JSON response
      let jsonText = content_response.text.trim();
      
      // Extract JSON from response
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }
      
      // Clean up JSON
      jsonText = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ');

      const analysis = JSON.parse(jsonText);
      return analysis;
      
    } catch (error) {
      console.error('Claude business analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Estimate target website's domain authority for comparison
   */
  async estimateTargetDomainAuthority(): Promise<number> {
    try {
      // Get some ranking data for the target domain to estimate its authority
      const { isSerperConfigured, SerperService } = await import('./serperService');

      if (!isSerperConfigured()) {
        return 35; // Default estimate
      }

      const serperService = new SerperService();

      // Try common business keywords to see if target ranks
      const testKeywords = [this.domain.replace(/\.[^.]+$/, ''), 'about', 'contact', 'services'];
      let totalScore = 30; // Base score

      for (const keyword of testKeywords) {
        try {
          const ranking = await serperService.checkKeywordPosition(keyword, this.domain);
          if (ranking && ranking <= 20) {
            totalScore += (21 - ranking) * 2;
          }
        } catch (error) {
          // Continue with other keywords
        }
      }

      return Math.min(85, Math.max(15, totalScore));

    } catch (error) {
      console.warn('Target domain authority estimation failed:', error);
      return 35; // Default estimate
    }
  }

  /**
   * Find real competitors ranking for specific keywords with enhanced filtering
   */
  async findCompetitorsForKeywords(
    keywords: Array<{ keyword: string; volume?: number }>,
    country: string = 'gb'
  ): Promise<CompetitorIntelligence[]> {
    console.log(`🏆 Finding competitors for ${keywords.length} keywords...`);

    try {
      // Check if Serper is available
      const { isSerperConfigured, SerperService } = await import('./serperService');

      if (!isSerperConfigured()) {
        console.warn('⚠️ Serper not configured - cannot get real competitor data');
        return [];
      }

      const serperService = new SerperService();
      const competitorMap = new Map<string, {
        keywords: string[];
        positions: number[];
        titles: string[];
        totalScore: number;
      }>();

      // Get target domain authority for comparison
      const targetAuthority = await this.estimateTargetDomainAuthority();
      console.log(`🎯 Target domain authority: ${targetAuthority}`);

      // Analyze more keywords to ensure we get 10+ competitors
      const keywordsToAnalyze = keywords
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 15); // Increased to 15 keywords to get more competitors

      console.log(`🔍 Analyzing competitor rankings for:`, keywordsToAnalyze.map(k => k.keyword));

      for (const keywordData of keywordsToAnalyze) {
        try {
          const serpResults = await serperService.getFullSerpResults(
            keywordData.keyword,
            country === 'gb' ? 'United Kingdom' : 'United States',
            20
          );
          
          if (serpResults?.results) {
            for (const result of serpResults.results) {
              if (result.domain && result.domain !== this.domain && result.position <= 10) {
                const domain = this.cleanDomain(result.domain);
                
                // Skip irrelevant sites
                if (this.shouldSkipDomain(domain)) continue;
                
                if (!competitorMap.has(domain)) {
                  competitorMap.set(domain, {
                    keywords: [],
                    positions: [],
                    titles: [],
                    totalScore: 0
                  });
                }
                
                const competitor = competitorMap.get(domain)!;
                competitor.keywords.push(keywordData.keyword);
                competitor.positions.push(result.position);
                competitor.titles.push(result.title);
                
                // Score based on position (higher score for better positions)
                competitor.totalScore += (11 - result.position) * (keywordData.volume || 100) / 100;
              }
            }
          }
          
          // Rate limiting
          await this.sleep(300);
          
        } catch (error) {
          console.error(`Failed to analyze keyword "${keywordData.keyword}":`, error);
        }
      }
      
      // Convert to competitor intelligence format with enhanced filtering
      const directCompetitors: CompetitorIntelligence[] = [];
      const aspirationalCompetitors: CompetitorIntelligence[] = [];
      
      for (const [domain, data] of competitorMap.entries()) {
        // Require minimum overlap percentage
        const overlapPercentage = Math.round((data.keywords.length / keywordsToAnalyze.length) * 100);
        
        if (overlapPercentage >= 30) { // Minimum 30% overlap
          const avgPosition = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
          const estimatedAuthority = this.estimateAuthorityFromRankings(data.positions, data.totalScore);
          
          const competitor: CompetitorIntelligence = {
            domain,
            title: data.titles[0] || domain,
            position: Math.round(avgPosition),
            sharedKeywords: [...new Set(data.keywords)],
            overlapPercentage,
            estimatedAuthority,
            competitorType: 'direct' // Will be updated below
          };
          
          // Classify as direct or aspirational based on DA difference
          const authorityDifference = estimatedAuthority - targetAuthority;
          
          if (authorityDifference > 20) {
            // High DA competitor - aspirational
            competitor.competitorType = 'aspirational';
            aspirationalCompetitors.push(competitor);
          } else {
            // Similar DA - direct competitor
            competitor.competitorType = 'direct';
            directCompetitors.push(competitor);
          }
        }
      }
      
      // Sort direct competitors by relevance
      directCompetitors.sort((a, b) => 
        (b.overlapPercentage * (100 - Math.abs(a.estimatedAuthority - targetAuthority))) - 
        (a.overlapPercentage * (100 - Math.abs(b.estimatedAuthority - targetAuthority)))
      );
      
      // Sort aspirational competitors by authority and relevance
      aspirationalCompetitors.sort((a, b) => 
        (b.estimatedAuthority * b.overlapPercentage) - (a.estimatedAuthority * a.overlapPercentage)
      );
      
      // Combine results: prioritize direct competitors, then add aspirational
      let allCompetitors = [
        ...directCompetitors.slice(0, 8), // Take up to 8 direct competitors
        ...aspirationalCompetitors.slice(0, 4) // Add up to 4 aspirational competitors
      ];
      
      // If we don't have 10 results, lower the overlap threshold and try again
      if (allCompetitors.length < 10) {
        console.log(`⚠️ Only found ${allCompetitors.length} competitors, lowering threshold...`);
        
        for (const [domain, data] of competitorMap.entries()) {
          const overlapPercentage = Math.round((data.keywords.length / keywordsToAnalyze.length) * 100);
          
          if (overlapPercentage >= 20 && overlapPercentage < 30) { // Lower threshold to 20%
            const avgPosition = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
            const estimatedAuthority = this.estimateAuthorityFromRankings(data.positions, data.totalScore);
            
            const competitor: CompetitorIntelligence = {
              domain,
              title: data.titles[0] || domain,
              position: Math.round(avgPosition),
              sharedKeywords: [...new Set(data.keywords)],
              overlapPercentage,
              estimatedAuthority,
              competitorType: (estimatedAuthority - targetAuthority) > 20 ? 'aspirational' : 'direct'
            };
            
            allCompetitors.push(competitor);
            
            if (allCompetitors.length >= 12) break; // Stop when we have enough
          }
        }
      }
      
      console.log(`✅ Found ${allCompetitors.length} total competitors (${directCompetitors.length} direct, ${aspirationalCompetitors.length} aspirational)`);
      
      // Return up to 12 competitors to ensure we have 10+ after any filtering
      return allCompetitors.slice(0, 12);
      
    } catch (error) {
      console.error('Competitor analysis failed:', error);
      return [];
    }
  }

  /**
   * Check if domain should be skipped (directories, irrelevant sites)
   */
  private shouldSkipDomain(domain: string): boolean {
    const skipDomains = [
      'wikipedia.org', 'youtube.com', 'facebook.com', 'linkedin.com',
      'indeed.com', 'glassdoor.com', 'trustpilot.com', 'yelp.com',
      'amazon.com', 'ebay.com', 'gumtree.com',
      'gov.uk', 'nhs.uk', 'bbc.com', 'theguardian.com'
    ];
    
    return skipDomains.some(skip => domain.includes(skip)) || 
           domain.length < 4 || 
           domain.includes('sortlist');
  }

  /**
   * Estimate domain authority based on ranking performance
   */
  private estimateAuthorityFromRankings(positions: number[], totalScore: number): number {
    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
    const topPositions = positions.filter(p => p <= 3).length;
    
    let authority = 30; // Base score
    
    // Bonus for average position
    if (avgPosition <= 3) authority += 40;
    else if (avgPosition <= 5) authority += 25;
    else if (avgPosition <= 10) authority += 10;
    
    // Bonus for multiple top positions
    authority += topPositions * 5;
    
    // Score factor
    authority += Math.min(20, totalScore / 100);
    
    return Math.min(95, Math.max(15, Math.round(authority)));
  }

  /**
   * Clean domain for consistent comparison
   */
  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fallback analysis if scraping fails
   */
  private getFallbackAnalysis(): BusinessAnalysis {
    return {
      businessType: 'Unknown Business',
      industry: 'general',
      services: [],
      location: ['uk'],
      targetAudience: 'General audience',
      businessModel: 'Unknown',
      extractedKeywords: [],
      confidence: 10
    };
  }
}

/**
 * Main function to get comprehensive competitor analysis
 */
export async function getBusinessIntelligenceAnalysis(
  domain: string,
  additionalKeywords?: Array<{ keyword: string; volume?: number }>
): Promise<{
  businessAnalysis: BusinessAnalysis;
  competitors: CompetitorIntelligence[];
  totalKeywordsAnalyzed: number;
}> {
  const service = new BusinessIntelligenceService(domain);
  
  // Step 1: Analyze website content
  const businessAnalysis = await service.analyzeWebsiteContent();
  console.log(`📊 Business analysis complete:`, businessAnalysis.businessType);
  
  // Step 2: Combine extracted keywords with additional keywords (recommended targets)
  const extractedKeywords = businessAnalysis.extractedKeywords.map(keyword => ({
    keyword,
    volume: 0 // Will be populated by Keywords Everywhere
  }));
  
  const allKeywords = [
    ...extractedKeywords,
    ...(additionalKeywords || [])
  ];
  
  // Step 3: Get search volumes
  try {
    const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
    const keService = new KeywordsEverywhereService();
    const volumeData = await keService.getSearchVolumes(
      allKeywords.map(k => k.keyword),
      'gb'
    );
    
    // Update keywords with volume data
    allKeywords.forEach(keyword => {
      const volumeInfo = volumeData.find(v => v.keyword.toLowerCase() === keyword.keyword.toLowerCase());
      keyword.volume = volumeInfo?.volume || 0;
    });
    
    console.log(`✅ Enhanced ${allKeywords.length} keywords with volume data`);
  } catch (error) {
    console.warn('Keywords Everywhere enhancement failed:', error);
  }
  
  // Step 4: Find competitors
  const competitors = await service.findCompetitorsForKeywords(
    allKeywords.filter(k => k.volume && k.volume > 0).slice(0, 15) // Use top keywords with volume
  );
  
  return {
    businessAnalysis,
    competitors,
    totalKeywordsAnalyzed: allKeywords.length
  };
}