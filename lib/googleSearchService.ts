/**
 * Google Custom Search JSON API Service
 * Free tier: 100 searches per day
 * 
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project or select existing
 * 3. Enable "Custom Search API" 
 * 4. Create credentials (API Key)
 * 5. Go to https://programmablesearchengine.google.com
 * 6. Create a new search engine
 * 7. Set it to "Search the entire web"
 * 8. Get your Search Engine ID (cx)
 * 
 * Add to .env.local:
 * GOOGLE_API_KEY=your_api_key_here
 * GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
 */

interface GoogleSearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId?: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: any;
}

interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
    }>;
    nextPage?: Array<any>;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchResult[];
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface GoogleKeywordData {
  keyword: string;
  position: number;
  isRanking: boolean;
  url?: string;
  title?: string;
  snippet?: string;
  searchVolume?: number;
  totalResults?: number;
}

export class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private readonly baseUrl = 'https://www.googleapis.com/customsearch/v1';
  private dailySearchCount: number = 0;
  private lastResetDate: string;

  constructor(apiKey?: string, searchEngineId?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_API_KEY || '';
    this.searchEngineId = searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    this.lastResetDate = new Date().toDateString();
    
    if (!this.apiKey) {
      console.warn('Google API Key not found. Please set GOOGLE_API_KEY in environment variables.');
    }
    if (!this.searchEngineId) {
      console.warn('Google Search Engine ID not found. Please set GOOGLE_SEARCH_ENGINE_ID in environment variables.');
    }
  }

  private resetDailyCountIfNeeded(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailySearchCount = 0;
      this.lastResetDate = today;
    }
  }

  private checkDailyLimit(): boolean {
    this.resetDailyCountIfNeeded();
    return this.dailySearchCount < 100; // Google's free tier limit
  }

  async searchKeyword(keyword: string, domain: string): Promise<GoogleKeywordData | null> {
    if (!this.apiKey || !this.searchEngineId) {
      console.log('Google Search API not configured');
      return null;
    }

    if (!this.checkDailyLimit()) {
      console.log('Daily search limit reached (100/day)');
      return null;
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: keyword,
        num: '10', // Get top 10 results
        gl: 'uk', // Geographic location (UK)
        hl: 'en' // Language
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          console.log('Google API rate limit exceeded');
        } else if (response.status === 403) {
          console.log('Google API quota exceeded or invalid credentials');
        } else {
          console.error('Google Search API error:', errorData);
        }
        return null;
      }

      const data: GoogleSearchResponse = await response.json();
      this.dailySearchCount++;

      // Check if domain appears in results
      let position = 0;
      let rankingUrl = '';
      let title = '';
      let snippet = '';

      console.log(`\n=== Google Search Results for "${keyword}" ===`);
      console.log(`Target domain: ${domain}`);

      if (data.items) {
        console.log(`Found ${data.items.length} search results:`);
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          const itemDomain = new URL(item.link).hostname.replace('www.', '');
          const searchDomain = domain.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
          
          console.log(`  ${i + 1}. ${item.title} - ${itemDomain} (${item.link})`);
          
          if (itemDomain.includes(searchDomain) || searchDomain.includes(itemDomain)) {
            position = i + 1;
            rankingUrl = item.link;
            title = item.title;
            snippet = item.snippet;
            console.log(`    ✅ MATCH FOUND! Position: ${position}`);
            break;
          } else {
            console.log(`    ❌ No match: "${itemDomain}" vs "${searchDomain}"`);
          }
        }
      } else {
        console.log('No search results found');
      }
      
      console.log(`Final result: Position ${position} for "${keyword}"`);
      console.log('=====================================\n');

      const totalResults = parseInt(data.searchInformation?.totalResults || '0');

      return {
        keyword,
        position,
        isRanking: position > 0,
        url: rankingUrl || undefined,
        title: title || undefined,
        snippet: snippet || undefined,
        totalResults,
        searchVolume: this.estimateSearchVolume(keyword, totalResults)
      };

    } catch (error) {
      console.error('Error searching keyword:', error);
      return null;
    }
  }

  async checkMultipleKeywords(keywords: string[], domain: string): Promise<GoogleKeywordData[]> {
    const results: GoogleKeywordData[] = [];
    
    // Limit to available searches (max 100/day)
    this.resetDailyCountIfNeeded();
    const availableSearches = Math.min(100 - this.dailySearchCount, keywords.length);
    const keywordsToCheck = keywords.slice(0, availableSearches);
    
    console.log(`Checking ${keywordsToCheck.length} keywords (${100 - this.dailySearchCount} searches remaining today)`);
    
    for (const keyword of keywordsToCheck) {
      const result = await this.searchKeyword(keyword, domain);
      if (result) {
        results.push(result);
      }
      
      // Add small delay to avoid rate limiting
      if (keywordsToCheck.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Estimate search volume based on total results
   * This is a rough approximation since Google doesn't provide exact search volumes
   */
  private estimateSearchVolume(keyword: string, totalResults: number): number {
    // Base estimation logic
    let estimatedVolume = 100;
    
    // Adjust based on total results (more results usually = higher search volume)
    if (totalResults > 10000000) {
      estimatedVolume = 5000;
    } else if (totalResults > 1000000) {
      estimatedVolume = 1000;
    } else if (totalResults > 100000) {
      estimatedVolume = 500;
    } else if (totalResults > 10000) {
      estimatedVolume = 200;
    } else if (totalResults > 1000) {
      estimatedVolume = 100;
    } else {
      estimatedVolume = 50;
    }
    
    // Adjust based on keyword length (longer = usually lower volume)
    const wordCount = keyword.split(' ').length;
    if (wordCount > 4) {
      estimatedVolume = Math.floor(estimatedVolume * 0.5);
    } else if (wordCount > 3) {
      estimatedVolume = Math.floor(estimatedVolume * 0.7);
    }
    
    // Adjust for specific keyword patterns
    if (keyword.includes('how to') || keyword.includes('what is')) {
      estimatedVolume = Math.floor(estimatedVolume * 1.5);
    }
    if (keyword.includes('near me') || keyword.includes('local')) {
      estimatedVolume = Math.floor(estimatedVolume * 0.8);
    }
    if (keyword.includes('buy') || keyword.includes('price')) {
      estimatedVolume = Math.floor(estimatedVolume * 1.2);
    }
    
    // Add some randomness for variation (±20%)
    const variation = 0.8 + Math.random() * 0.4;
    estimatedVolume = Math.floor(estimatedVolume * variation);
    
    return Math.max(10, estimatedVolume); // Minimum 10 searches/month
  }

  /**
   * Get remaining daily searches
   */
  getRemainingSearches(): number {
    this.resetDailyCountIfNeeded();
    return Math.max(0, 100 - this.dailySearchCount);
  }

  /**
   * Check if API is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.searchEngineId);
  }
}

// Export a singleton instance
export const googleSearchService = new GoogleSearchService();