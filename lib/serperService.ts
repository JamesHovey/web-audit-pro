/**
 * Serper API Service
 * Provides real-time Google SERP data and actual ranking positions
 * Documentation: https://serper.dev/
 *
 * Cost: $0.30 per 1,000 queries (62% cheaper than ValueSERP)
 */

interface SerperOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  date?: string;
  sitelinks?: unknown;
}

interface SerperResponse {
  searchParameters: {
    q: string;
    gl?: string;
    hl?: string;
    num?: number;
    type?: string;
  };
  organic: SerperOrganicResult[];
  answerBox?: unknown;
  knowledgeGraph?: unknown;
  relatedSearches?: Array<{ query: string }>;
  credits?: number;
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

export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev/search';
  private creditsUsed = 0;
  private static readonly STORAGE_KEY = 'serper_usage';
  private static readonly FREE_TIER_LIMIT = 2500;

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Serper API key not configured - cannot fetch real SERP data');
    }
  }

  /**
   * Get total Serper usage from localStorage (persists across sessions)
   */
  static getTotalUsage(): { used: number; remaining: number; limit: number } {
    if (typeof window === 'undefined') {
      return { used: 0, remaining: SerperService.FREE_TIER_LIMIT, limit: SerperService.FREE_TIER_LIMIT };
    }

    const stored = localStorage.getItem(SerperService.STORAGE_KEY);
    const used = stored ? parseInt(stored, 10) : 0;

    return {
      used,
      remaining: Math.max(0, SerperService.FREE_TIER_LIMIT - used),
      limit: SerperService.FREE_TIER_LIMIT
    };
  }

  /**
   * Update total usage in localStorage
   */
  private static updateTotalUsage(creditsToAdd: number): void {
    if (typeof window === 'undefined') return;

    const current = SerperService.getTotalUsage();
    const newTotal = current.used + creditsToAdd;
    localStorage.setItem(SerperService.STORAGE_KEY, newTotal.toString());

    console.log(`📊 Serper Total Usage: ${newTotal} / ${SerperService.FREE_TIER_LIMIT} (${current.remaining - creditsToAdd} remaining)`);
  }

  /**
   * Reset usage counter (for testing or when you upgrade to paid)
   */
  static resetUsage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SerperService.STORAGE_KEY);
    console.log('✅ Serper usage counter reset');
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
    } catch (error: any) {
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
      throw new Error('Serper API key not configured. Please add SERPER_API_KEY to your .env.local file.');
    }

    try {
      console.log(`🔍 Serper: Checking rankings for "${keyword}" (domain: ${domain})...`);

      const requestBody = {
        q: keyword,
        gl: 'uk', // Google country (UK)
        hl: 'en', // Language
        num: num, // Number of results
        location: location
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
      }

      const data: SerperResponse = await response.json();

      // Track credits (Serper uses 1 credit per search by default, 2 if >10 results)
      const creditsUsed = num > 10 ? 2 : 1;
      this.creditsUsed += creditsUsed;

      // Update persistent total usage
      SerperService.updateTotalUsage(creditsUsed);

      console.log(`✅ Serper: Used ${creditsUsed} credit(s)`);

      // Find domain's ranking position
      return this.parseRankingData(keyword, domain, data);

    } catch (error) {
      console.error('Serper API error:', error);
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
  private parseRankingData(keyword: string, targetDomain: string, data: SerperResponse): RankingData {
    const cleanDomain = targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    const organicResults = data.organic || [];

    // Find all positions for this domain
    const domainPositions: { position: number; url: string; title: string }[] = [];
    let primaryPosition: SerperOrganicResult | null = null;

    organicResults.forEach((result) => {
      const resultDomain = this.extractDomain(result.link || '');

      if (resultDomain === cleanDomain) {
        const position = result.position;
        domainPositions.push({
          position,
          url: result.link || '',
          title: result.title || ''
        });

        // Track the first (best) position
        if (!primaryPosition) {
          primaryPosition = result;
        }
      }
    });

    // Get top 10 positions for competitive analysis
    const allTopPositions = organicResults.slice(0, 10).map((result) => ({
      position: result.position,
      url: result.link || '',
      title: result.title || ''
    }));

    return {
      keyword,
      position: primaryPosition?.position || null,
      url: primaryPosition?.link || null,
      title: primaryPosition?.title || null,
      snippet: primaryPosition?.snippet || null,
      totalResults: organicResults.length,
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
      throw new Error('Serper API key not configured');
    }

    try {
      const requestBody = {
        q: keyword,
        gl: 'uk',
        hl: 'en',
        num: num,
        location: location
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
      }

      const data: SerperResponse = await response.json();

      const creditsUsed = num > 10 ? 2 : 1;
      this.creditsUsed += creditsUsed;

      // Update persistent total usage
      SerperService.updateTotalUsage(creditsUsed);

      // Extract competitors from organic results
      const results = (data.organic || []).map((result) => ({
        domain: this.extractDomain(result.link || ''),
        position: result.position,
        title: result.title || '',
        url: result.link || ''
      }));

      return { results };

    } catch (error) {
      console.error('Serper API error:', error);
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
 * Check if Serper is available and configured
 */
export function isSerperConfigured(): boolean {
  return !!process.env.SERPER_API_KEY;
}

/**
 * Main function to get SERP rankings
 */
export async function getSerpRankings(
  keywords: string[],
  domain: string,
  location: string = 'United Kingdom'
): Promise<RankingData[]> {
  const service = new SerperService();
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
  const service = new SerperService();
  return await service.getAboveFoldRankings(keywords, domain, location);
}
