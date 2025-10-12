/**
 * Keywords Everywhere API Service
 * Provides real Google Keyword Planner volume data
 * Cost: $60/year for 100,000 credits (1 credit = 1 keyword)
 */

interface KeywordsEverywhereResponse {
  data: {
    keyword: string;
    vol: number;
    cpc: {
      currency: string;
      value: string;
    };
    competition: number;
    trend: Array<{
      month: string;
      year: number;
      value: number;
    }>;
  }[];
  credits?: number;
  credits_consumed?: number;
  time?: number;
  error?: string;
}

interface VolumeData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  trend: number[];
}

export class KeywordsEverywhereService {
  private apiKey: string;
  private baseUrl = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
  private creditsUsed = 0;

  constructor() {
    this.apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Keywords Everywhere API key not configured - will use estimated volumes');
    }
  }

  /**
   * Get real search volumes for keywords
   */
  async getSearchVolumes(keywords: string[], country: string = 'uk', currency: string = 'gbp'): Promise<VolumeData[]> {
    if (!this.apiKey) {
      throw new Error('Keywords Everywhere API key not configured. Please add KEYWORDS_EVERYWHERE_API_KEY to your .env.local file.');
    }

    // Transform 'gb' to 'uk' for Keywords Everywhere API compatibility
    const apiCountry = country.toLowerCase() === 'gb' ? 'uk' : country;
    
    console.log(`🔍 Keywords Everywhere: Getting volumes for ${keywords.length} keywords in ${apiCountry.toUpperCase()}...`);
    console.log(`🌍 Country transformation: input="${country}" -> api="${apiCountry}" -> request="${apiCountry.toUpperCase()}"`);

    try {
      // Keywords Everywhere API supports max 100 keywords per request
      const batches = this.chunkArray(keywords, 100);
      const allResults: VolumeData[] = [];

      for (const batch of batches) {
        const batchResults = await this.fetchVolumesBatch(batch, apiCountry, currency);
        allResults.push(...batchResults);
        
        // Small delay between batches to respect rate limits
        if (batches.length > 1) {
          await this.sleep(200);
        }
      }

      console.log(`✅ Keywords Everywhere: Retrieved ${allResults.length} volumes, used ${this.creditsUsed} credits`);
      return allResults;

    } catch (error) {
      console.error('❌ Keywords Everywhere API error:', error);
      throw error;
    }
  }

  /**
   * Fetch volumes for a batch of keywords
   */
  private async fetchVolumesBatch(keywords: string[], country: string, currency: string): Promise<VolumeData[]> {
    // Keywords Everywhere API expects JSON data
    const requestBody = {
      kw: keywords,
      country: country.toUpperCase(),
      currency: currency.toUpperCase(),
      dataSource: 'gkp' // Google Keyword Planner
    };

    // Debug: Log the exact request being sent
    console.log(`📤 Keywords Everywhere API Request:`, {
      country: requestBody.country,
      currency: requestBody.currency,
      dataSource: requestBody.dataSource,
      keywordCount: keywords.length,
      sampleKeywords: keywords.filter(k => k.toLowerCase().includes('henry') || k.toLowerCase().includes('adams') || k.toLowerCase().includes('pmw')).slice(0, 3)
    });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Keywords Everywhere API error response:', errorText);
      throw new Error(`Keywords Everywhere API error: ${response.status} ${response.statusText}`);
    }

    const data: KeywordsEverywhereResponse = await response.json();

    if (data.error) {
      throw new Error(`Keywords Everywhere API error: ${data.error}`);
    }

    // Track credits used from API response
    if (data.credits_consumed) {
      this.creditsUsed += data.credits_consumed;
    } else {
      this.creditsUsed += keywords.length;
    }

    // Log credits information
    if (data.credits) {
      console.log(`💰 Keywords Everywhere: ${data.credits.toLocaleString()} credits remaining`);
    }

    // Debug: Log raw API response for branded keywords with full details
    const brandedKeywords = data.data.filter(item => 
      item.keyword.toLowerCase().includes('henryadams') || 
      item.keyword.toLowerCase().includes('henry adams') ||
      item.keyword.toLowerCase().includes('pmw')
    );
    if (brandedKeywords.length > 0) {
      console.log(`🔍 RAW Keywords Everywhere response for branded keywords:`, 
        brandedKeywords.map(item => ({
          keyword: item.keyword,
          volume: item.vol,
          cpc: item.cpc,
          competition: item.competition,
          trend: item.trend ? `${item.trend.length} months of data` : 'no trend data'
        }))
      );
      
      // Log the FULL response object to debug country issues
      console.log(`🌍 FULL API Response for debugging country issue:`, {
        requestCountry: country.toUpperCase(),
        requestCurrency: currency.toUpperCase(),
        apiResponseCredits: data.credits,
        firstKeywordFullData: data.data[0],
        responseMetadata: {
          creditsUsed: data.credits_consumed,
          creditsRemaining: data.credits,
          timeElapsed: data.time
        },
        sampleTrendData: data.data[0]?.trend?.slice(0, 3)
      });
    }

    // Transform response to our format
    return data.data.map(item => ({
      keyword: item.keyword,
      volume: item.vol || 0,
      cpc: typeof item.cpc === 'object' ? parseFloat(item.cpc.value) || 0 : item.cpc || 0,
      competition: item.competition || 0,
      trend: item.trend || []
    }));
  }

  /**
   * Get remaining credits
   */
  async getCreditsRemaining(): Promise<number | null> {
    if (!this.apiKey) return null;

    try {
      // Make a minimal request to check credits
      const response = await this.getSearchVolumes(['test'], 'us', 'usd');
      // Note: The actual credits remaining would be in the response
      // This is a simplified implementation
      return 100000; // Placeholder - would come from API response
    } catch (error) {
      console.error('Failed to get credits remaining:', error);
      return null;
    }
  }

  /**
   * Utility: Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Utility: Sleep for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get credits used in this session
   */
  getCreditsUsed(): number {
    return this.creditsUsed;
  }
}

/**
 * Convenience function to get volumes for keywords
 */
export async function getKeywordVolumes(keywords: string[], country: string = 'uk'): Promise<VolumeData[]> {
  const service = new KeywordsEverywhereService();
  return await service.getSearchVolumes(keywords, country);
}