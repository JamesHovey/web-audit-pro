/**
 * OpenPageRank API Service
 * Free domain authority alternative using OpenPageRank's PageRank-like metrics
 * Rate limits: 10,000 calls/hour, 4.3M domains/day
 */

interface OpenPageRankResponse {
  status_code: number;
  response: Array<{
    status_code: number;
    error: string;
    page_rank_integer: number;
    page_rank_decimal: number;
    rank: string;
    domain: string;
  }>;
}

interface DomainAuthorityResult {
  success: boolean;
  domain: string;
  authority: number; // PageRank value (0-10)
  rank: string; // Overall rank position
  dataSource: string;
  error?: string;
}

export class OpenPageRankService {
  private apiKey: string | undefined;
  private baseUrl = 'https://openpagerank.com/api/v1.0/getPageRank';

  constructor() {
    this.apiKey = process.env.OPENPAGERANK_API_KEY;
  }

  async getDomainAuthority(url: string): Promise<DomainAuthorityResult> {
    const domain = this.extractDomain(url);
    
    if (!this.apiKey) {
      return {
        success: false,
        domain,
        authority: 0,
        rank: '0',
        dataSource: 'OpenPageRank (API Key Required)',
        error: 'OpenPageRank API key not configured. Add OPENPAGERANK_API_KEY to environment variables. Get free API key at: https://www.domcop.com/openpagerank/'
      };
    }

    try {
      console.log(`🔍 Getting domain authority for: ${domain}`);
      
      const response = await fetch(`${this.baseUrl}?domains[]=${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          'API-OPR': this.apiKey,
          'User-Agent': 'WebAuditPro/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`OpenPageRank API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenPageRankResponse = await response.json();
      
      if (data.status_code !== 200) {
        throw new Error(`OpenPageRank API returned status: ${data.status_code}`);
      }

      const domainData = data.response.find(item => item.domain === domain);
      
      if (!domainData) {
        return {
          success: false,
          domain,
          authority: 0,
          rank: '0',
          dataSource: 'OpenPageRank',
          error: `Domain ${domain} not found in OpenPageRank database`
        };
      }

      if (domainData.status_code !== 200) {
        return {
          success: false,
          domain,
          authority: 0,
          rank: '0',
          dataSource: 'OpenPageRank',
          error: domainData.error || `Error retrieving data for ${domain}`
        };
      }

      console.log(`✅ Domain authority retrieved: ${domainData.page_rank_decimal}/10 (rank: ${domainData.rank})`);
      
      return {
        success: true,
        domain,
        authority: domainData.page_rank_decimal,
        rank: domainData.rank,
        dataSource: 'OpenPageRank (Free)'
      };

    } catch (error) {
      console.error('OpenPageRank API error:', error);
      
      return {
        success: false,
        domain,
        authority: 0,
        rank: '0',
        dataSource: 'OpenPageRank',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get domain authority for multiple domains in a single request
   * OpenPageRank supports up to 100 domains per request
   */
  async getMultipleDomainAuthority(urls: string[]): Promise<DomainAuthorityResult[]> {
    if (!this.apiKey) {
      return urls.map(url => ({
        success: false,
        domain: this.extractDomain(url),
        authority: 0,
        rank: '0',
        dataSource: 'OpenPageRank (API Key Required)',
        error: 'OpenPageRank API key not configured'
      }));
    }

    const domains = urls.map(url => this.extractDomain(url)).slice(0, 100); // Limit to 100 domains
    
    try {
      const queryParams = domains.map(domain => `domains[]=${encodeURIComponent(domain)}`).join('&');
      
      const response = await fetch(`${this.baseUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'API-OPR': this.apiKey,
          'User-Agent': 'WebAuditPro/1.0'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`OpenPageRank API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenPageRankResponse = await response.json();
      
      return domains.map(domain => {
        const domainData = data.response.find(item => item.domain === domain);
        
        if (!domainData || domainData.status_code !== 200) {
          return {
            success: false,
            domain,
            authority: 0,
            rank: '0',
            dataSource: 'OpenPageRank',
            error: domainData?.error || `Domain ${domain} not found`
          };
        }

        return {
          success: true,
          domain,
          authority: domainData.page_rank_decimal,
          rank: domainData.rank,
          dataSource: 'OpenPageRank (Free)'
        };
      });

    } catch (error) {
      console.error('OpenPageRank bulk API error:', error);
      
      return domains.map(domain => ({
        success: false,
        domain,
        authority: 0,
        rank: '0',
        dataSource: 'OpenPageRank',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }

  private extractDomain(url: string): string {
    try {
      // Remove protocol and www, get just the domain
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return cleanUrl.split('/')[0].toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Convert PageRank (0-10) to a percentage-based authority score (0-100)
   * for consistency with other authority metrics
   */
  static pageRankToAuthorityScore(pageRank: number): number {
    return Math.round(pageRank * 10);
  }
}

// Export convenience function
export async function getDomainAuthority(url: string): Promise<DomainAuthorityResult> {
  const service = new OpenPageRankService();
  return await service.getDomainAuthority(url);
}