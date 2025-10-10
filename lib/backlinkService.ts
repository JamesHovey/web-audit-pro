/**
 * Simplified Backlink Analysis Service for Cloud Deployment
 * Uses only APIs that work well in serverless environments
 * Primary: OpenPageRank for domain authority (free)
 * Secondary: Web scraping fallback where possible
 */

interface BacklinkData {
  domain: string;
  anchor: string;
  authority: number;
  type: 'dofollow' | 'nofollow';
  url: string;
}

interface BacklinkAnalysis {
  success: boolean;
  domainAuthority: number;
  totalBacklinks: number;
  referringDomains: number;
  dofollowLinks: number;
  nofollowLinks: number;
  topBacklinks: BacklinkData[];
  analysisMethod: string;
  dataSource: string;
  analysisUrl?: string;
  error?: string;
}

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

class BacklinkService {
  
  async analyzeBacklinks(url: string): Promise<BacklinkAnalysis> {
    console.log(`🔗 Analyzing backlinks for: ${url}`);
    
    try {
      // Get domain authority from OpenPageRank (free tier)
      const domainAuthorityResult = await this.getDomainAuthority(url);
      
      if (domainAuthorityResult.success) {
        console.log(`✅ Retrieved domain authority from OpenPageRank`);
        
        // For now, provide domain authority only
        // Note: Full backlinks data requires paid APIs like Majestic ($50/month) or DataForSEO
        return {
          success: true,
          domainAuthority: Math.round(domainAuthorityResult.authority * 10), // Convert 0-10 to 0-100 scale
          totalBacklinks: 0,
          referringDomains: 0,
          dofollowLinks: 0,
          nofollowLinks: 0,
          topBacklinks: [],
          analysisMethod: 'domain_authority_only',
          dataSource: 'OpenPageRank (Free)',
          analysisUrl: `https://www.domcop.com/openpagerank/`
        };
      } else {
        // No APIs configured - return helpful guidance
        console.log('⚠️ No backlink APIs configured');
        return this.getApiNotConfiguredResponse(url, domainAuthorityResult.error);
      }
      
    } catch (error) {
      console.error('Backlink analysis error:', error);
      return this.getApiNotConfiguredResponse(url, error.message);
    }
  }
  
  private async getDomainAuthority(url: string): Promise<{success: boolean, authority: number, error?: string}> {
    const apiKey = process.env.OPENPAGERANK_API_KEY;
    const domain = this.cleanDomain(url);
    
    if (!apiKey) {
      return {
        success: false,
        authority: 0,
        error: 'OpenPageRank API key not configured. Get free API key at: https://www.domcop.com/openpagerank/'
      };
    }

    try {
      console.log(`📊 Getting domain authority for: ${domain}`);
      
      const response = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(domain)}`, {
        headers: {
          'API-OPR': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`OpenPageRank API error: ${response.status}`);
      }

      const data: OpenPageRankResponse = await response.json();
      
      if (data.status_code === 200 && data.response && data.response.length > 0) {
        const domainData = data.response[0];
        
        if (domainData.status_code === 200) {
          return {
            success: true,
            authority: domainData.page_rank_decimal || domainData.page_rank_integer || 0
          };
        }
      }
      
      return {
        success: false,
        authority: 0,
        error: 'Domain not found in OpenPageRank database'
      };
      
    } catch (error) {
      console.error('OpenPageRank error:', error);
      return {
        success: false,
        authority: 0,
        error: `OpenPageRank API error: ${error.message}`
      };
    }
  }
  
  private getApiNotConfiguredResponse(url: string, error?: string): BacklinkAnalysis {
    const domain = this.cleanDomain(url);
    
    return {
      success: false,
      domainAuthority: 0,
      totalBacklinks: 0,
      referringDomains: 0,
      dofollowLinks: 0,
      nofollowLinks: 0,
      topBacklinks: [],
      analysisMethod: 'api_required',
      dataSource: 'API Key Required',
      analysisUrl: `https://majestic.com/reports/site-explorer?q=${encodeURIComponent(domain)}`,
      error: error || 'To get backlinks data, you need: 1) Free domain authority with OpenPageRank API (add OPENPAGERANK_API_KEY), 2) Full backlink analysis requires Majestic API ($50/month) or DataForSEO API.'
    };
  }
  
  private cleanDomain(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export async function analyzeBacklinks(url: string): Promise<BacklinkAnalysis> {
  const service = new BacklinkService();
  return await service.analyzeBacklinks(url);
}