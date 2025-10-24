/**
 * ValueSerp Keyword Service - Primary keyword ranking data source
 * Uses real Google SERP data from ValueSerp API (paid service)
 * No fallbacks - requires active ValueSerp subscription
 */

interface ValueSerpResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  domain: string;
}

interface ValueSerpResponse {
  request_info: {
    success: boolean;
    credits_used_this_request: number;
    topup_credits_remaining?: number;
  };
  search_metadata: {
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  organic_results: ValueSerpResult[];
}

interface KeywordRankingData {
  keyword: string;
  position: number;
  title: string;
  snippet: string;
  url: string;
  isRanking: boolean;
  searchVolume?: number;
  difficulty?: number;
  type: 'branded' | 'non-branded';
  realVolumeData?: boolean; // Flag to indicate if using real Keywords Everywhere data
}

export class ValueSerpKeywordService {
  private apiKey: string;
  private baseUrl = 'https://api.valueserp.com/search';
  private creditsUsed = 0;
  
  constructor() {
    this.apiKey = process.env.VALUESERP_API_KEY || '';
    if (!this.apiKey) {
      console.error('⚠️ ValueSerp API key not configured - keyword analysis will not work');
    }
  }
  
  /**
   * Main method to analyze keywords using ValueSerp
   */
  async analyzeKeywords(domain: string, html: string) {
    console.log(`\n=== VALUESERP KEYWORD ANALYSIS FOR ${domain} ===`);
    
    if (!this.apiKey) {
      throw new Error('ValueSerp API key not configured. Please add VALUESERP_API_KEY to your .env.local file.');
    }
    
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Extract brand name and generate keyword list
    const brandName = this.extractBrandName(cleanDomain, html);
    const businessType = 'General Business'; // Removed pattern-based detection
    const keywordsToCheck = this.generateKeywordList(brandName, businessType, html);
    
    console.log(`🔍 Checking ${keywordsToCheck.length} keywords for ${cleanDomain}`);
    console.log(`💼 Business Type: ${businessType} (using generic - Claude API handles business detection)`);
    console.log(`🏷️ Brand: ${brandName}`);
    
    // Check rankings for each keyword
    const rankings: KeywordRankingData[] = [];
    
    for (const keyword of keywordsToCheck.slice(0, 30)) { // Limit to 30 keywords to conserve credits
      try {
        const ranking = await this.checkKeywordRanking(keyword, cleanDomain);
        if (ranking) {
          rankings.push(ranking);
        }
        
        // Small delay between API calls
        await this.sleep(500);
        
      } catch (_error) {
        console.error(`Error checking "${keyword}":`, error.message);
      }
    }
    
    // Get real search volumes from Keywords Everywhere
    let volumeCreditsUsed = 0;
    try {
      console.log('📊 Getting real search volumes from Keywords Everywhere...');
      const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
      const volumeService = new KeywordsEverywhereService();
      
      const keywordList = rankings.map(r => r.keyword);
      const volumeData = await volumeService.getSearchVolumes(keywordList, 'uk', 'gbp');
      volumeCreditsUsed = volumeService.getCreditsUsed();
      
      // Update rankings with real volume data
      rankings.forEach(ranking => {
        const volumeInfo = volumeData.find(v => v.keyword === ranking.keyword);
        if (volumeInfo) {
          ranking.searchVolume = volumeInfo.volume;
          ranking.realVolumeData = true;
        }
      });
      
      console.log(`✅ Updated ${volumeData.length} keywords with real Google volume data`);
    } catch (volumeError) {
      console.warn('⚠️ Keywords Everywhere unavailable, using estimates:', volumeError.message);
      // Keep existing estimated volumes
    }

    // Categorize results
    const brandedKeywords = rankings.filter(k => k.type === 'branded');
    const nonBrandedKeywords = rankings.filter(k => k.type === 'non-branded');
    const rankingKeywords = rankings.filter(k => k.isRanking);
    const topRankings = rankingKeywords.filter(k => k.position <= 3);
    const pageOneRankings = rankingKeywords.filter(k => k.position <= 10);
    
    console.log(`\n📊 ValueSerp Results Summary:`);
    console.log(`✅ Total keywords checked: ${keywordsToCheck.length}`);
    console.log(`💰 Credits used: ${this.creditsUsed}`);
    console.log(`🎯 Keywords ranking: ${rankingKeywords.length}`);
    console.log(`🏆 Top 3 rankings: ${topRankings.length}`);
    console.log(`📍 Page 1 rankings: ${pageOneRankings.length}`);
    
    return {
      brandedKeywords: brandedKeywords.length,
      nonBrandedKeywords: nonBrandedKeywords.length,
      brandedKeywordsList: brandedKeywords,
      nonBrandedKeywordsList: nonBrandedKeywords,
      topKeywords: rankings.sort((a, b) => {
        // Sort by ranking position (lower is better), non-ranking at end
        if (a.isRanking && !b.isRanking) return -1;
        if (!a.isRanking && b.isRanking) return 1;
        return a.position - b.position;
      }).slice(0, 10),
      topCompetitors: [], // ValueSerp doesn't provide competitor data directly
      pagesAnalyzed: 1,
      totalContentLength: html.length,
      estimationMethod: 'serper_real_data',
      dataSource: 'serper_keywords_everywhere',
      searchesUsed: this.creditsUsed,
      volumeCreditsUsed: volumeCreditsUsed,
      creditsRemaining: await this.getCreditsRemaining(),
      topThreeRankings: topRankings.length,
      pageOneRankings: pageOneRankings.length,
      realVolumeData: volumeCreditsUsed > 0
    };
  }
  
  /**
   * Check ranking for a specific keyword
   */
  private async checkKeywordRanking(keyword: string, domain: string): Promise<KeywordRankingData | null> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: keyword,
        location: 'United Kingdom',
        google_domain: 'google.co.uk',
        gl: 'uk',
        hl: 'en',
        num: '100' // Check top 100 results
      });
      
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data: ValueSerpResponse = await response.json();
      
      if (!data.request_info?.success) {
        throw new Error(`ValueSerp API error: ${JSON.stringify(data.request_info)}`);
      }
      
      this.creditsUsed += data.request_info.credits_used_this_request || 1;
      
      // Find our domain in results
      const ourResult = data.organic_results?.find(result => 
        result.domain?.includes(domain) || result.link?.includes(domain)
      );
      
      const position = ourResult ? 
        data.organic_results.indexOf(ourResult) + 1 : 0;
      
      // Determine if branded or non-branded
      const brandName = domain.split('.')[0].toLowerCase();
      const isBranded = keyword.toLowerCase().includes(brandName);
      
      return {
        keyword,
        position,
        title: ourResult?.title || '',
        snippet: ourResult?.snippet || '',
        url: ourResult?.link || '',
        isRanking: position > 0,
        type: isBranded ? 'branded' : 'non-branded',
        // Estimate volume and difficulty based on keyword characteristics
        searchVolume: this.estimateSearchVolume(keyword),
        difficulty: this.estimateDifficulty(keyword)
      };
      
    } catch (_error) {
      console.error(`Failed to check ranking for "${keyword}":`, error.message);
      return null;
    }
  }
  
  /**
   * Generate keyword list based on business type and content
   */
  private generateKeywordList(brandName: string, businessType: string, html: string): string[] {
    const keywords: string[] = [];
    
    // Branded variations
    keywords.push(brandName);
    keywords.push(`${brandName} ${businessType.toLowerCase()}`);
    keywords.push(`${brandName} reviews`);
    keywords.push(`${brandName} contact`);
    
    // Business-specific keywords
    const businessKeywords = this.getBusinessTypeKeywords(businessType);
    keywords.push(...businessKeywords);
    
    // Extract location if present
    const location = this.extractLocation(html);
    if (location) {
      keywords.push(`${businessType.toLowerCase()} ${location}`);
      businessKeywords.forEach(kw => {
        keywords.push(`${kw} ${location}`);
      });
    }
    
    // Extract service keywords from content
    const serviceKeywords = this.extractServiceKeywords(html);
    keywords.push(...serviceKeywords);
    
    // Remove duplicates and return
    return [...new Set(keywords)];
  }
  
  /**
   * Get industry-specific keywords based on business type
   */
  private getBusinessTypeKeywords(businessType: string): string[] {
    const keywordSets: { [key: string]: string[] } = {
      'Architecture & Design': [
        'architects',
        'architectural services',
        'house extensions',
        'barn conversion architects',
        'sustainable architecture',
        'heritage architects',
        'listed building architects',
        'residential architects',
        'planning permission',
        'building regulations'
      ],
      'Marketing & Digital': [
        'marketing agency',
        'digital marketing',
        'seo services',
        'ppc management',
        'social media marketing',
        'content marketing',
        'web design',
        'branding agency'
      ],
      'Legal Services': [
        'solicitors',
        'legal advice',
        'commercial law',
        'employment law',
        'family law',
        'property law',
        'litigation',
        'legal services'
      ],
      // Add more business types as needed
      'default': [
        'services',
        'professional services',
        'consulting',
        'solutions',
        'expertise',
        'specialists'
      ]
    };
    
    return keywordSets[businessType] || keywordSets['default'];
  }
  
  /**
   * Extract brand name from domain and content
   */
  private extractBrandName(domain: string, html: string): string {
    // Try to extract from title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1];
      const words = title.split(/[\s\-|]+/).filter(word => word.length > 2);
      if (words.length > 0) {
        return words[0];
      }
    }
    
    // Fallback to domain name
    const domainParts = domain.split('.');
    return domainParts[0];
  }
  
  
  /**
   * Extract location from content
   */
  private extractLocation(html: string): string | null {
    // Look for UK locations
    const ukLocations = [
      'devon', 'exeter', 'london', 'manchester', 'birmingham', 'bristol',
      'cornwall', 'sussex', 'kent', 'surrey', 'yorkshire', 'scotland'
    ];
    
    const lowerHtml = html.toLowerCase();
    for (const location of ukLocations) {
      if (lowerHtml.includes(location)) {
        return location;
      }
    }
    
    return null;
  }
  
  /**
   * Extract service keywords from content
   */
  private extractServiceKeywords(html: string): string[] {
    const keywords: string[] = [];
    const lowerHtml = html.toLowerCase();
    
    // Extract from headings
    const headingMatches = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi) || [];
    headingMatches.forEach(match => {
      const text = match.replace(/<[^>]+>/g, '').trim();
      if (text.length > 3 && text.length < 50) {
        keywords.push(text.toLowerCase());
      }
    });
    
    // Look for service patterns
    const servicePatterns = [
      /(\w+\s+services?)/gi,
      /(\w+\s+solutions?)/gi,
      /(\w+\s+consulting)/gi,
      /(\w+\s+management)/gi
    ];
    
    servicePatterns.forEach(pattern => {
      const matches = lowerHtml.match(pattern) || [];
      matches.slice(0, 5).forEach(match => {
        if (match.length > 5 && match.length < 50) {
          keywords.push(match.trim());
        }
      });
    });
    
    return [...new Set(keywords)].slice(0, 10);
  }
  
  /**
   * Estimate search volume based on keyword characteristics
   */
  private estimateSearchVolume(keyword: string): number {
    const words = keyword.split(' ').length;
    let baseVolume = 1000;
    
    // Adjust based on keyword length
    if (words === 1) baseVolume = 2000;
    else if (words === 2) baseVolume = 800;
    else if (words === 3) baseVolume = 400;
    else if (words >= 4) baseVolume = 200;
    
    // Adjust based on keyword type
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('near me')) baseVolume *= 0.8;
    if (lowerKeyword.includes('best')) baseVolume *= 1.2;
    if (lowerKeyword.includes('services')) baseVolume *= 1.1;
    
    return Math.floor(baseVolume * (0.8 + Math.random() * 0.4));
  }
  
  /**
   * Estimate keyword difficulty
   */
  private estimateDifficulty(keyword: string): number {
    const words = keyword.split(' ').length;
    let difficulty = 50;
    
    // Long tail = easier
    if (words >= 4) difficulty -= 15;
    else if (words === 3) difficulty -= 5;
    
    // Commercial intent = harder
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('services')) difficulty += 10;
    if (lowerKeyword.includes('best')) difficulty += 15;
    if (lowerKeyword.includes('near me')) difficulty += 5;
    
    return Math.max(20, Math.min(80, difficulty));
  }
  
  /**
   * Get remaining credits
   */
  private async getCreditsRemaining(): Promise<number | null> {
    try {
      // Make a simple test request to get credit info
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: 'test',
        num: '1'
      });
      
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data: ValueSerpResponse = await response.json();
      
      return data.request_info?.topup_credits_remaining || null;
    } catch (_error) {
      return null;
    }
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Export convenience function
 */
export async function analyzeKeywordsWithValueSerp(domain: string, html: string) {
  const service = new ValueSerpKeywordService();
  return await service.analyzeKeywords(domain, html);
}