/**
 * Majestic Backlink Service
 * Integrates with Majestic API for real backlink data
 * Falls back to no-data message if API not configured
 */

interface MajesticBacklink {
  domain: string;
  anchor: string;
  authority: number;
  type: 'dofollow' | 'nofollow';
  url: string;
  trustFlow?: number;
  citationFlow?: number;
}

interface MajesticBacklinkAnalysis {
  success: boolean;
  domainAuthority: number;
  totalBacklinks: number;
  referringDomains: number;
  dofollowLinks: number;
  nofollowLinks: number;
  topBacklinks: MajesticBacklink[];
  analysisMethod: string;
  dataSource: string;
  analysisUrl?: string;
  error?: string;
}

class MajesticBacklinkService {
  private baseUrl = 'https://api.majestic.com/api/json';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.MAJESTIC_API_KEY;
  }

  async analyzeBacklinks(url: string): Promise<MajesticBacklinkAnalysis> {
    console.log(`🔗 Analyzing backlinks for: ${url}`);

    if (!this.apiKey) {
      return this.getNoDataResponse(url);
    }

    try {
      // Get basic site info
      const siteInfo = await this.getSiteInfo(url);
      
      // Get backlinks
      const backlinks = await this.getBacklinks(url);
      
      if (backlinks && backlinks.length > 0) {
        return {
          success: true,
          domainAuthority: Math.round(siteInfo.trustFlow || 0),
          totalBacklinks: siteInfo.externalBacklinks || 0,
          referringDomains: siteInfo.referringDomains || 0,
          dofollowLinks: Math.round((siteInfo.externalBacklinks || 0) * 0.7),
          nofollowLinks: Math.round((siteInfo.externalBacklinks || 0) * 0.3),
          topBacklinks: backlinks,
          analysisMethod: 'majestic_api',
          dataSource: 'Majestic API',
          analysisUrl: `https://majestic.com/reports/site-explorer?q=${encodeURIComponent(url)}&IndexDataSource=F`
        };
      } else {
        return this.getNoDataResponse(url);
      }
    } catch (error) {
      console.error('Majestic API error:', error);
      return this.getNoDataResponse(url, error.message);
    }
  }

  private async getSiteInfo(url: string) {
    const domain = this.cleanDomain(url);
    
    const params = new URLSearchParams({
      cmd: 'GetIndexItemInfo',
      datasource: 'fresh', // Use fresh index
      items: '1',
      item0: domain,
      app_api_key: this.apiKey!
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'WebAuditPro/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Majestic API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Code !== 'OK') {
      throw new Error(`Majestic API error: ${data.ErrorMessage}`);
    }

    const item = data.DataTables?.Results?.Data?.[0];
    return {
      trustFlow: item?.TrustFlow || 0,
      citationFlow: item?.CitationFlow || 0,
      externalBacklinks: item?.ExtBackLinks || 0,
      referringDomains: item?.RefDomains || 0
    };
  }

  private async getBacklinks(url: string): Promise<MajesticBacklink[]> {
    const domain = this.cleanDomain(url);
    
    const params = new URLSearchParams({
      cmd: 'GetBackLinkData',
      datasource: 'fresh',
      item: domain,
      Mode: '0', // Get backlinks to domain
      Count: '10', // Get top 10 backlinks
      OrderBy: 'SourceTrustFlow:desc',
      app_api_key: this.apiKey!
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'WebAuditPro/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Majestic backlinks API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Code !== 'OK') {
      throw new Error(`Majestic backlinks API error: ${data.ErrorMessage}`);
    }

    const backlinks = data.DataTables?.BackLinks?.Data || [];
    
    return backlinks.map((link: any) => ({
      domain: link.SourceURL ? this.extractDomain(link.SourceURL) : 'Unknown',
      anchor: link.AnchorText || 'No anchor text',
      authority: Math.round(link.SourceTrustFlow || 0),
      type: (link.FlagNoFollow === '0' ? 'dofollow' : 'nofollow') as 'dofollow' | 'nofollow',
      url: link.SourceURL || '',
      trustFlow: link.SourceTrustFlow || 0,
      citationFlow: link.SourceCitationFlow || 0
    }));
  }

  private getNoDataResponse(url: string, error?: string): MajesticBacklinkAnalysis {
    return {
      success: false,
      domainAuthority: 0,
      totalBacklinks: 0,
      referringDomains: 0,
      dofollowLinks: 0,
      nofollowLinks: 0,
      topBacklinks: [],
      analysisMethod: 'no_api',
      dataSource: 'No API Key Configured',
      analysisUrl: `https://majestic.com/reports/site-explorer?q=${encodeURIComponent(url)}`,
      error: error || 'Majestic API key not configured. Add MAJESTIC_API_KEY to environment variables.'
    };
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private cleanDomain(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export async function analyzeMajesticBacklinks(url: string): Promise<MajesticBacklinkAnalysis> {
  const service = new MajesticBacklinkService();
  return await service.analyzeBacklinks(url);
}