/**
 * DataForSEO Backlink Service
 * Cost-effective professional backlink analysis
 * Documentation: https://docs.dataforseo.com/v3/backlinks
 * Pricing: $0.02 per 1000 backlinks (pay-per-use)
 */

interface DataForSeoBacklink {
  domain_from: string;
  url_from: string;
  url_to: string;
  anchor: string;
  dofollow: boolean;
  page_from_rank: number;
  domain_from_rank: number;
  domain_from_platform_type?: string[];
  domain_from_is_ip?: boolean;
  domain_from_country?: string;
  first_seen?: string;
  last_seen?: string;
  item_type: string;
  attributes?: string[];
}

interface DataForSeoSummary {
  total: number;
  live: number;
  lost: number;
  new: number;
  referring_domains: number;
  referring_domains_nofollow: number;
  referring_pages: number;
  referring_pages_nofollow: number;
  referring_ips: number;
  referring_subnets: number;
  referring_links_types: {
    anchor: number;
    redirect: number;
    canonical: number;
    alternate: number;
    image: number;
  };
  referring_links_attributes: {
    nofollow: number;
    noopener: number;
    noreferrer: number;
    external: number;
    ugc: number;
    sponsored: number;
  };
}

interface DataForSeoDomainMetrics {
  rank: number;
  backlinks: number;
  first_seen?: string;
  lost_date?: string | null;
  backlinks_spam_score?: number;
  broken_backlinks?: number;
  broken_pages?: number;
  referring_domains?: number;
  referring_domains_nofollow?: number;
  referring_main_domains?: number;
  referring_ips?: number;
  referring_subnets?: number;
  referring_pages?: number;
  referring_links_tld?: { [key: string]: number };
  referring_links_types?: { [key: string]: number };
  referring_links_attributes?: { [key: string]: number };
  referring_links_platform_types?: { [key: string]: number };
  referring_links_semantic_locations?: { [key: string]: number };
  referring_links_countries?: { [key: string]: number };
}

export interface DataForSeoBacklinkAnalysis {
  success: boolean;
  domainAuthority: number;
  totalBacklinks: number;
  referringDomains: number;
  dofollowLinks: number;
  nofollowLinks: number;
  newBacklinks30Days: number;
  lostBacklinks30Days: number;
  topBacklinks: Array<{
    domain: string;
    url: string;
    anchor: string;
    authority: number;
    type: 'dofollow' | 'nofollow';
    trustFlow?: number;
    citationFlow?: number;
    firstSeen?: string;
    pageRank?: number;
  }>;
  anchorTextDistribution: Array<{
    anchor: string;
    count: number;
    percentage: number;
  }>;
  linkTypes: {
    text: number;
    image: number;
    redirect: number;
    canonical: number;
  };
  topReferringDomains: Array<{
    domain: string;
    backlinks: number;
    domainRank: number;
  }>;
  countriesDistribution?: Array<{
    country: string;
    count: number;
  }>;
  analysisMethod: string;
  dataSource: string;
  creditsUsed?: number;
  error?: string;
}

class DataForSeoBacklinkService {
  private baseUrl = 'https://api.dataforseo.com/v3';
  private auth: string | undefined;

  constructor() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    
    if (login && password) {
      // DataForSEO uses basic auth
      this.auth = Buffer.from(`${login}:${password}`).toString('base64');
    }
  }

  /**
   * Main analysis method - gets comprehensive backlink data
   */
  async analyzeBacklinks(url: string): Promise<DataForSeoBacklinkAnalysis> {
    console.log(`🔗 DataForSEO Backlink Analysis for: ${url}`);

    if (!this.auth) {
      console.log('⚠️ DataForSEO credentials not configured');
      return this.getNoDataResponse(url);
    }

    try {
      // Extract domain from URL
      const domain = this.extractDomain(url);
      
      // Get summary data first (most cost-effective)
      const summary = await this.getBacklinkSummary(domain);
      
      // Get domain metrics
      const domainMetrics = await this.getDomainMetrics(domain);
      
      // Get top backlinks (limit to save credits)
      const backlinks = await this.getTopBacklinks(domain, 100);
      
      // Get anchor text distribution
      const anchors = await this.getAnchorTexts(domain, 50);
      
      // Get top referring domains
      const referringDomains = await this.getReferringDomains(domain, 20);

      // Calculate metrics
      const dofollowLinks = summary.referring_pages - summary.referring_pages_nofollow;
      const nofollowLinks = summary.referring_pages_nofollow;

      // Process backlinks for our format
      const topBacklinks = backlinks.map(link => ({
        domain: link.domain_from,
        url: link.url_from,
        anchor: link.anchor || 'No anchor text',
        authority: link.domain_from_rank || 0,
        type: link.dofollow ? 'dofollow' as const : 'nofollow' as const,
        pageRank: link.page_from_rank,
        firstSeen: link.first_seen
      }));

      // Process anchor text distribution
      const totalAnchors = anchors.reduce((sum, a) => sum + (a.referring_links || 0), 0);
      const anchorTextDistribution = anchors.map(anchor => ({
        anchor: anchor.anchor || 'No anchor text',
        count: anchor.referring_links || 0,
        percentage: totalAnchors > 0 ? ((anchor.referring_links || 0) / totalAnchors) * 100 : 0
      }));

      // Process referring domains
      const topReferringDomains = referringDomains.map(domain => ({
        domain: domain.domain,
        backlinks: domain.backlinks || 0,
        domainRank: domain.rank || 0
      }));

      return {
        success: true,
        domainAuthority: Math.round(domainMetrics.rank * 100), // Convert to 0-100 scale
        totalBacklinks: summary.total,
        referringDomains: summary.referring_domains,
        dofollowLinks,
        nofollowLinks,
        newBacklinks30Days: summary.new || 0,
        lostBacklinks30Days: summary.lost || 0,
        topBacklinks: topBacklinks.slice(0, 20), // Return top 20 for display
        anchorTextDistribution: anchorTextDistribution.slice(0, 10),
        linkTypes: {
          text: summary.referring_links_types.anchor || 0,
          image: summary.referring_links_types.image || 0,
          redirect: summary.referring_links_types.redirect || 0,
          canonical: summary.referring_links_types.canonical || 0
        },
        topReferringDomains,
        analysisMethod: 'DataForSEO API',
        dataSource: 'DataForSEO (3.8 trillion backlinks database)',
        creditsUsed: this.calculateCreditsUsed(100) // Estimate based on backlinks fetched
      };

    } catch (error) {
      console.error('DataForSEO API error:', error);
      return this.getNoDataResponse(url, error.message);
    }
  }

  /**
   * Get backlink summary (most cost-effective endpoint)
   */
  private async getBacklinkSummary(domain: string): Promise<DataForSeoSummary> {
    const response = await fetch(`${this.baseUrl}/backlinks/summary/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: domain,
        limit: 1
      }])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.tasks?.[0]?.result?.[0]) {
      return data.tasks[0].result[0];
    }
    
    // Return empty summary if no data
    return this.getEmptySummary();
  }

  /**
   * Get domain metrics
   */
  private async getDomainMetrics(domain: string): Promise<DataForSeoDomainMetrics> {
    const response = await fetch(`${this.baseUrl}/backlinks/domain_metrics/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: domain,
        limit: 1
      }])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.tasks?.[0]?.result?.[0]) {
      return data.tasks[0].result[0];
    }
    
    return { rank: 0, backlinks: 0, referring_domains: 0 };
  }

  /**
   * Get top backlinks
   */
  private async getTopBacklinks(domain: string, limit: number = 100): Promise<DataForSeoBacklink[]> {
    const response = await fetch(`${this.baseUrl}/backlinks/backlinks/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: domain,
        limit: limit,
        order_by: ["domain_from_rank,desc"],
        filters: ["dofollow", "=", true] // Focus on dofollow links
      }])
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.tasks?.[0]?.result?.[0]?.items) {
      return data.tasks[0].result[0].items;
    }
    
    return [];
  }

  /**
   * Get anchor text distribution
   */
  private async getAnchorTexts(domain: string, limit: number = 50): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/backlinks/anchors/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: domain,
        limit: limit,
        order_by: ["referring_links,desc"]
      }])
    });

    if (!response.ok) {
      console.warn('Could not fetch anchor texts');
      return [];
    }

    const data = await response.json();
    
    if (data.tasks?.[0]?.result?.[0]?.items) {
      return data.tasks[0].result[0].items;
    }
    
    return [];
  }

  /**
   * Get top referring domains
   */
  private async getReferringDomains(domain: string, limit: number = 20): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/backlinks/referring_domains/live`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        target: domain,
        limit: limit,
        order_by: ["rank,desc"]
      }])
    });

    if (!response.ok) {
      console.warn('Could not fetch referring domains');
      return [];
    }

    const data = await response.json();
    
    if (data.tasks?.[0]?.result?.[0]?.items) {
      return data.tasks[0].result[0].items;
    }
    
    return [];
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }

  /**
   * Calculate credits used (for cost tracking)
   */
  private calculateCreditsUsed(backlinksRetrieved: number): number {
    // DataForSEO charges $0.02 per 1000 backlinks
    return Math.ceil(backlinksRetrieved / 1000) * 0.02;
  }

  /**
   * Get empty summary object
   */
  private getEmptySummary(): DataForSeoSummary {
    return {
      total: 0,
      live: 0,
      lost: 0,
      new: 0,
      referring_domains: 0,
      referring_domains_nofollow: 0,
      referring_pages: 0,
      referring_pages_nofollow: 0,
      referring_ips: 0,
      referring_subnets: 0,
      referring_links_types: {
        anchor: 0,
        redirect: 0,
        canonical: 0,
        alternate: 0,
        image: 0
      },
      referring_links_attributes: {
        nofollow: 0,
        noopener: 0,
        noreferrer: 0,
        external: 0,
        ugc: 0,
        sponsored: 0
      }
    };
  }

  /**
   * Return no-data response when API not configured
   */
  private getNoDataResponse(url: string, error?: string): DataForSeoBacklinkAnalysis {
    return {
      success: false,
      domainAuthority: 0,
      totalBacklinks: 0,
      referringDomains: 0,
      dofollowLinks: 0,
      nofollowLinks: 0,
      newBacklinks30Days: 0,
      lostBacklinks30Days: 0,
      topBacklinks: [],
      anchorTextDistribution: [],
      linkTypes: {
        text: 0,
        image: 0,
        redirect: 0,
        canonical: 0
      },
      topReferringDomains: [],
      analysisMethod: 'no_api',
      dataSource: 'DataForSEO API not configured',
      error: error || 'Please add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to your environment variables'
    };
  }
}

// Export singleton instance
export const dataForSeoBacklinkService = new DataForSeoBacklinkService();

// Export main function for backward compatibility
export async function analyzeDataForSeoBacklinks(url: string): Promise<DataForSeoBacklinkAnalysis> {
  return await dataForSeoBacklinkService.analyzeBacklinks(url);
}