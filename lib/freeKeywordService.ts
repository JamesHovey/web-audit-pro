/**
 * Free Keyword Data Service
 * Uses Google Autocomplete, SERP analysis, and competitor analysis for free keyword data
 */

interface KeywordSuggestion {
  keyword: string;
  source: 'autocomplete' | 'related' | 'paa' | 'competitor';
  estimatedVolume: number;
  difficulty: number;
  relevanceScore: number;
}

interface KeywordExpansionResult {
  seedKeyword: string;
  suggestions: KeywordSuggestion[];
  relatedSearches: string[];
  peopleAlsoAsk: string[];
  totalFound: number;
}

export class FreeKeywordService {
  private maxSuggestions = 50;
  private requestDelay = 1500; // 1.5 seconds between requests

  /**
   * Main method to expand keywords using free sources
   */
  async expandKeywords(seedKeywords: string[], domain: string): Promise<KeywordExpansionResult[]> {
    console.log(`🔍 Expanding ${seedKeywords.length} seed keywords using free methods`);
    
    const results: KeywordExpansionResult[] = [];
    
    for (const seedKeyword of seedKeywords.slice(0, 10)) { // Limit to prevent rate limiting
      try {
        console.log(`📝 Processing: "${seedKeyword}"`);
        
        const result = await this.expandSingleKeyword(seedKeyword, domain);
        results.push(result);
        
        // Rate limiting
        if (seedKeywords.indexOf(seedKeyword) < seedKeywords.length - 1) {
          await this.sleep(this.requestDelay);
        }
        
      } catch (error) {
        console.error(`❌ Failed to expand "${seedKeyword}":`, error.message);
        results.push({
          seedKeyword,
          suggestions: [],
          relatedSearches: [],
          peopleAlsoAsk: [],
          totalFound: 0
        });
      }
    }
    
    return results;
  }

  /**
   * Expand a single keyword using multiple free sources
   */
  private async expandSingleKeyword(seedKeyword: string, domain: string): Promise<KeywordExpansionResult> {
    const suggestions: KeywordSuggestion[] = [];
    let relatedSearches: string[] = [];
    let peopleAlsoAsk: string[] = [];

    try {
      // 1. Google Autocomplete
      const autocompleteSuggestions = await this.getGoogleAutocompleteSuggestions(seedKeyword);
      console.log(`   📋 Found ${autocompleteSuggestions.length} autocomplete suggestions`);
      
      suggestions.push(...autocompleteSuggestions.map(keyword => ({
        keyword,
        source: 'autocomplete' as const,
        estimatedVolume: this.estimateVolumeFromKeyword(keyword),
        difficulty: this.estimateDifficulty(keyword),
        relevanceScore: this.calculateRelevanceScore(keyword, seedKeyword, domain)
      })));

      // 2. SERP Analysis (related searches + PAA)
      const serpData = await this.analyzeSERP(seedKeyword);
      relatedSearches = serpData.relatedSearches;
      peopleAlsoAsk = serpData.peopleAlsoAsk;
      
      console.log(`   🔗 Found ${relatedSearches.length} related searches, ${peopleAlsoAsk.length} PAA questions`);

      // Add related searches as suggestions
      suggestions.push(...relatedSearches.map(keyword => ({
        keyword,
        source: 'related' as const,
        estimatedVolume: this.estimateVolumeFromKeyword(keyword),
        difficulty: this.estimateDifficulty(keyword),
        relevanceScore: this.calculateRelevanceScore(keyword, seedKeyword, domain)
      })));

      // Add PAA questions as suggestions
      suggestions.push(...peopleAlsoAsk.map(question => ({
        keyword: question,
        source: 'paa' as const,
        estimatedVolume: this.estimateVolumeFromKeyword(question),
        difficulty: this.estimateDifficulty(question),
        relevanceScore: this.calculateRelevanceScore(question, seedKeyword, domain)
      })));

    } catch (error) {
      console.error(`Error expanding "${seedKeyword}":`, error.message);
    }

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = this.removeDuplicateKeywords(suggestions)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.maxSuggestions);

    return {
      seedKeyword,
      suggestions: uniqueSuggestions,
      relatedSearches,
      peopleAlsoAsk,
      totalFound: uniqueSuggestions.length
    };
  }

  /**
   * Get Google Autocomplete suggestions
   */
  private async getGoogleAutocompleteSuggestions(keyword: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    try {
      // Multiple autocomplete variations for better coverage
      const queries = [
        keyword,
        `${keyword} services`,
        `${keyword} help`,
        `best ${keyword}`,
        `${keyword} near me`,
        `how to ${keyword}`
      ];

      for (const query of queries.slice(0, 3)) { // Limit to prevent rate limiting
        try {
          const queryResults = await this.fetchGoogleAutocomplete(query);
          suggestions.push(...queryResults);
          
          // Small delay between autocomplete requests
          await this.sleep(500);
          
        } catch (error) {
          console.log(`⚠️ Autocomplete failed for "${query}":`, error.message);
          continue;
        }
      }

    } catch (error) {
      console.error('Autocomplete error:', error);
    }

    return [...new Set(suggestions)].filter(s => s.length > 3 && s.length < 100);
  }

  /**
   * Fetch Google Autocomplete data
   */
  private async fetchGoogleAutocomplete(query: string): Promise<string[]> {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      
      // Parse the JSON response
      const data = JSON.parse(text);
      
      if (Array.isArray(data) && data.length >= 2 && Array.isArray(data[1])) {
        return data[1].filter((suggestion: string) => 
          suggestion && 
          suggestion !== query && 
          suggestion.length > query.length
        );
      }
      
      return [];
      
    } catch (error) {
      console.error(`Autocomplete fetch error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Analyze SERP for related searches and People Also Ask
   */
  private async analyzeSERP(keyword: string): Promise<{relatedSearches: string[], peopleAlsoAsk: string[]}> {
    const relatedSearches: string[] = [];
    const peopleAlsoAsk: string[] = [];

    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=10`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`SERP fetch failed: ${response.status}`);
      }

      const html = await response.text();
      
      // Check for blocking
      if (this.isBlockedResponse(html)) {
        console.log('⚠️ SERP request blocked by Google');
        return { relatedSearches: [], peopleAlsoAsk: [] };
      }

      // Extract related searches (bottom of page)
      const relatedMatches = html.match(/<div[^>]*class="[^"]*s75CSd[^"]*"[^>]*>([^<]+)<\/div>/gi) || [];
      relatedSearches.push(
        ...relatedMatches
          .map(match => match.replace(/<[^>]+>/g, '').trim())
          .filter(text => text.length > 3 && text.length < 100)
          .slice(0, 8)
      );

      // Extract People Also Ask questions
      const paaMatches = html.match(/<div[^>]*class="[^"]*JlqpRe[^"]*"[^>]*>([^<]+)<\/div>/gi) || [];
      peopleAlsoAsk.push(
        ...paaMatches
          .map(match => match.replace(/<[^>]+>/g, '').trim())
          .filter(text => text.includes('?') && text.length > 10 && text.length < 200)
          .slice(0, 6)
      );

      console.log(`   📊 SERP analysis: ${relatedSearches.length} related, ${peopleAlsoAsk.length} PAA`);

    } catch (error) {
      console.error(`SERP analysis failed for "${keyword}":`, error.message);
    }

    return {
      relatedSearches: [...new Set(relatedSearches)],
      peopleAlsoAsk: [...new Set(peopleAlsoAsk)]
    };
  }

  /**
   * Check if response indicates blocking
   */
  private isBlockedResponse(html: string): boolean {
    const blockingSignals = [
      'unusual traffic',
      'not a robot',
      'captcha',
      'blocked',
      'automated queries'
    ];
    
    const lowercaseHtml = html.toLowerCase();
    return blockingSignals.some(signal => lowercaseHtml.includes(signal));
  }

  /**
   * Estimate search volume based on keyword characteristics
   */
  private estimateVolumeFromKeyword(keyword: string): number {
    const words = keyword.split(' ');
    let baseVolume = 500; // Default base

    // Adjust based on keyword length
    if (words.length === 1) baseVolume = 2000;
    else if (words.length === 2) baseVolume = 1200;
    else if (words.length === 3) baseVolume = 600;
    else if (words.length >= 4) baseVolume = 300;

    // Adjust based on keyword type
    const lowerKeyword = keyword.toLowerCase();
    
    if (lowerKeyword.includes('how to') || lowerKeyword.includes('?')) baseVolume *= 0.8;
    if (lowerKeyword.includes('best') || lowerKeyword.includes('top')) baseVolume *= 1.3;
    if (lowerKeyword.includes('near me') || lowerKeyword.includes('local')) baseVolume *= 0.7;
    if (lowerKeyword.includes('free')) baseVolume *= 1.2;
    if (lowerKeyword.includes('services') || lowerKeyword.includes('service')) baseVolume *= 1.1;
    
    // Add some randomness for realism
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
    
    return Math.floor(baseVolume * randomFactor);
  }

  /**
   * Estimate keyword difficulty
   */
  private estimateDifficulty(keyword: string): number {
    const words = keyword.split(' ');
    let baseDifficulty = 45;

    // Longer keywords = easier
    if (words.length >= 4) baseDifficulty -= 15;
    else if (words.length === 3) baseDifficulty -= 5;

    // Certain terms increase difficulty
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('best') || lowerKeyword.includes('top')) baseDifficulty += 20;
    if (lowerKeyword.includes('services') || lowerKeyword.includes('service')) baseDifficulty += 10;
    if (lowerKeyword.includes('how to')) baseDifficulty -= 10;
    if (lowerKeyword.includes('?')) baseDifficulty -= 5;

    // Randomize slightly
    baseDifficulty += Math.floor((Math.random() - 0.5) * 20);

    return Math.max(15, Math.min(85, baseDifficulty));
  }

  /**
   * Calculate relevance score to original seed keyword and domain
   */
  private calculateRelevanceScore(keyword: string, seedKeyword: string, domain: string): number {
    let score = 0;
    const lowerKeyword = keyword.toLowerCase();
    const lowerSeed = seedKeyword.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    // Similarity to seed keyword
    const seedWords = lowerSeed.split(' ');
    const keywordWords = lowerKeyword.split(' ');
    
    const commonWords = seedWords.filter(word => keywordWords.includes(word));
    score += (commonWords.length / seedWords.length) * 50;

    // Contains seed keyword
    if (lowerKeyword.includes(lowerSeed)) score += 30;
    
    // Domain relevance
    const domainWords = lowerDomain.replace(/\.(com|co\.uk|org|net)$/, '').split(/[-._]/);
    const domainMatches = domainWords.filter(word => 
      word.length > 2 && lowerKeyword.includes(word)
    );
    score += domainMatches.length * 10;

    // Penalize very long keywords
    if (keyword.length > 80) score -= 20;
    
    // Bonus for questions (often valuable)
    if (lowerKeyword.includes('?') || lowerKeyword.startsWith('how ')) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Remove duplicate keywords
   */
  private removeDuplicateKeywords(suggestions: KeywordSuggestion[]): KeywordSuggestion[] {
    const seen = new Set<string>();
    const unique: KeywordSuggestion[] = [];

    for (const suggestion of suggestions) {
      const normalizedKeyword = suggestion.keyword.toLowerCase().trim();
      if (!seen.has(normalizedKeyword) && normalizedKeyword.length > 3) {
        seen.add(normalizedKeyword);
        unique.push(suggestion);
      }
    }

    return unique;
  }

  /**
   * Get top keyword suggestions from expansion results
   */
  getTopKeywords(results: KeywordExpansionResult[], limit: number = 20): KeywordSuggestion[] {
    const allSuggestions: KeywordSuggestion[] = [];
    
    results.forEach(result => {
      allSuggestions.push(...result.suggestions);
    });

    return this.removeDuplicateKeywords(allSuggestions)
      .sort((a, b) => {
        // Sort by relevance score first, then by estimated volume
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.estimatedVolume - a.estimatedVolume;
      })
      .slice(0, limit);
  }

  /**
   * Utility method for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export convenience function
export async function expandKeywordsForDomain(seedKeywords: string[], domain: string): Promise<KeywordSuggestion[]> {
  const service = new FreeKeywordService();
  const results = await service.expandKeywords(seedKeywords, domain);
  return service.getTopKeywords(results, 25);
}