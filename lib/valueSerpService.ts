/**
 * ValueSERP API Service
 * Provides real-time Google SERP data and actual ranking positions
 * Documentation: https://www.valueserp.com/docs
 */

interface ValueSerpOrganicResult {
  position: number;
  title: string;
  link: string;
  domain: string;
  displayed_link?: string;
  snippet?: string;
  cached_page_link?: string;
  related_pages_link?: string;
  sitelinks?: unknown;
  rich_snippet?: unknown;
}

interface ValueSerpResponse {
  request_info: {
    success: boolean;
    credits_used: number;
    credits_remaining?: number;
  };
  search_metadata: {
    created_at: string;
    processed_at: string;
    total_time_taken: number;
    engine_url: string;
    html_url?: string;
    json_url?: string;
  };
  search_parameters: {
    q: string;
    location?: string;
    google_domain?: string;
    gl?: string;
    hl?: string;
    device?: string;
    page?: number;
    num?: number;
  };
  search_information?: {
    total_results?: number;
    time_taken_displayed?: number;
    query_displayed?: string;
  };
  organic_results: ValueSerpOrganicResult[];
  paid_results?: unknown[];
  local_results?: unknown[];
  answer_box?: unknown;
  knowledge_graph?: unknown;
  related_searches?: string[];
}

interface RankingData {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
  snippet: string | null;
  totalResults: number;
  allPositions: { position: number; url: string; title: string }[];
}

export class ValueSerpService {
  private apiKey: string;
  private baseUrl = 'https://api.valueserp.com/search';
  private creditsUsed = 0;

  constructor() {
    this.apiKey = process.env.VALUESERP_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ ValueSERP API key not configured - cannot fetch real SERP data');
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Check simple keyword position for a domain
   */
  async checkKeywordPosition(keyword: string, domain: string): Promise<number | null> {
    try {
      const ranking = await this.getKeywordRankings(keyword, domain);
      return ranking.position;
    } catch (error) {
      console.warn(`Failed to check position for "${keyword}":`, error.message);
      return null;
    }
  }

  /**
   * Get real SERP rankings for a keyword
   */
  async getKeywordRankings(
    keyword: string, 
    domain: string,
    location: string = 'United Kingdom',
    num: number = 100
  ): Promise<RankingData> {
    if (!this.isConfigured()) {
      throw new Error('ValueSERP API key not configured. Please add VALUESERP_API_KEY to your .env.local file.');
    }

    try {
      console.log(`🔍 ValueSERP: Checking rankings for "${keyword}" (domain: ${domain})...`);
      
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: keyword,
        location: location,
        google_domain: 'google.co.uk',
        gl: 'uk',
        hl: 'en',
        num: num.toString(),
        device: 'desktop',
        output: 'json'
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`ValueSERP API error: ${response.status} ${response.statusText}`);
      }

      const data: ValueSerpResponse = await response.json();
      
      if (!data.request_info?.success) {
        throw new Error('ValueSERP API request failed');
      }

      this.creditsUsed += data.request_info.credits_used || 1;
      console.log(`✅ ValueSERP: Used ${data.request_info.credits_used} credits`);

      // Find domain's ranking position
      return this.parseRankingData(keyword, domain, data);

    } catch (error) {
      console.error('ValueSERP API error:', error);
      throw error;
    }
  }

  /**
   * Get rankings for multiple keywords
   */
  async getBulkKeywordRankings(
    keywords: string[],
    domain: string,
    location: string = 'United Kingdom'
  ): Promise<RankingData[]> {
    const rankings: RankingData[] = [];
    
    // Process keywords in batches to avoid rate limiting
    for (const keyword of keywords) {
      try {
        const ranking = await this.getKeywordRankings(keyword, domain, location);
        rankings.push(ranking);
        
        // Add small delay to avoid rate limiting
        await this.sleep(100);
      } catch (error) {
        console.error(`Failed to get ranking for "${keyword}":`, error);
        rankings.push({
          keyword,
          position: null,
          url: null,
          title: null,
          snippet: null,
          totalResults: 0,
          allPositions: []
        });
      }
    }
    
    return rankings;
  }

  /**
   * Parse SERP response to extract ranking data
   */
  private parseRankingData(keyword: string, targetDomain: string, data: ValueSerpResponse): RankingData {
    const cleanDomain = targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    const organicResults = data.organic_results || [];
    
    // Find all positions for this domain
    const domainPositions: { position: number; url: string; title: string }[] = [];
    let primaryPosition: ValueSerpOrganicResult | null = null;
    
    organicResults.forEach((result, index) => {
      const resultDomain = this.extractDomain(result.link || '');
      
      if (resultDomain === cleanDomain) {
        const position = result.position || (index + 1);
        domainPositions.push({
          position,
          url: result.link || '',
          title: result.title || ''
        });
        
        // Track the first (best) position
        if (!primaryPosition) {
          primaryPosition = { ...result, position };
        }
      }
    });

    // Get top 10 positions for competitive analysis
    const allTopPositions = organicResults.slice(0, 10).map((result, index) => ({
      position: result.position || (index + 1),
      url: result.link || '',
      title: result.title || ''
    }));

    return {
      keyword,
      position: primaryPosition?.position || null,
      url: primaryPosition?.link || null,
      title: primaryPosition?.title || null,
      snippet: primaryPosition?.snippet || null,
      totalResults: data.search_information?.total_results || 0,
      allPositions: allTopPositions
    };
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    }
  }

  /**
   * Check actual above-fold rankings (positions 1-3)
   */
  async getAboveFoldRankings(
    keywords: string[],
    domain: string,
    location: string = 'United Kingdom'
  ): Promise<Array<RankingData & { isAboveFold: boolean }>> {
    const rankings = await this.getBulkKeywordRankings(keywords, domain, location);
    
    return rankings.map(ranking => ({
      ...ranking,
      isAboveFold: ranking.position !== null && ranking.position <= 3
    }));
  }

  /**
   * Discover keywords where domain ranks in top positions
   */
  async discoverRankingKeywords(
    potentialKeywords: string[],
    domain: string,
    location: string = 'United Kingdom',
    maxPosition: number = 10
  ): Promise<RankingData[]> {
    const rankings = await this.getBulkKeywordRankings(potentialKeywords, domain, location);
    
    // Filter to only keywords where domain actually ranks
    return rankings.filter(r => 
      r.position !== null && 
      r.position <= maxPosition
    );
  }

  /**
   * Get full SERP results for competitor analysis
   */
  async getFullSerpResults(
    keyword: string,
    location: string = 'United Kingdom',
    num: number = 20
  ): Promise<{ results: Array<{ domain: string; position: number; title: string; url: string }> } | null> {
    if (!this.isConfigured()) {
      throw new Error('ValueSERP API key not configured');
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        q: keyword,
        location: location,
        google_domain: 'google.co.uk',
        gl: 'uk',
        hl: 'en',
        device: 'desktop',
        num: num.toString()
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ValueSERP API error: ${response.status} ${response.statusText}`);
      }

      const data: ValueSerpResponse = await response.json();
      
      if (!data.request_info?.success) {
        throw new Error('ValueSERP API request failed');
      }

      this.creditsUsed += data.request_info.credits_used || 1;

      // Extract competitors from organic results
      const results = (data.organic_results || []).map((result, index) => ({
        domain: this.extractDomain(result.link || ''),
        position: result.position || (index + 1),
        title: result.title || '',
        url: result.link || ''
      }));

      return { results };

    } catch (error) {
      console.error('ValueSERP API error:', error);
      return null;
    }
  }

  /**
   * Get total credits used in this session
   */
  getCreditsUsed(): number {
    return this.creditsUsed;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Check if ValueSERP is available and configured
 */
export function isValueSerpConfigured(): boolean {
  return !!process.env.VALUESERP_API_KEY;
}

/**
 * Main function to get SERP rankings
 */
export async function getSerpRankings(
  keywords: string[],
  domain: string,
  location: string = 'United Kingdom'
): Promise<RankingData[]> {
  const service = new ValueSerpService();
  return await service.getBulkKeywordRankings(keywords, domain, location);
}

/**
 * Get above-fold rankings (positions 1-3)
 */
export async function getAboveFoldRankings(
  keywords: string[],
  domain: string,
  location: string = 'United Kingdom'
): Promise<Array<RankingData & { isAboveFold: boolean }>> {
  const service = new ValueSerpService();
  return await service.getAboveFoldRankings(keywords, domain, location);
}