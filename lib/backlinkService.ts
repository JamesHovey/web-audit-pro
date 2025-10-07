/**
 * Professional Backlink Analysis Service
 * Primary: DataForSEO API (cost-effective pay-per-use)
 * Fallback: Majestic API or OpenPageRank for domain authority
 * Falls back to clear messaging when APIs not available
 */

import { analyzeDataForSeoBacklinks } from './dataForSeoBacklinkService';
import { analyzeMajesticBacklinks } from './majesticBacklinkService';
import { getDomainAuthority } from './openPageRankService';

interface BacklinkData {
  domain: string;
  anchor: string;
  authority: number;
  type: 'dofollow' | 'nofollow';
  url: string;
  trustFlow?: number;
  citationFlow?: number;
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

class BacklinkService {
  
  async analyzeBacklinks(url: string): Promise<BacklinkAnalysis> {
    console.log(`🔗 Professional backlink analysis for: ${url}`);
    
    try {
      // Try DataForSEO first (most cost-effective and comprehensive)
      const dataForSeoResult = await analyzeDataForSeoBacklinks(url);
      
      if (dataForSeoResult.success) {
        console.log(`✅ Retrieved comprehensive backlink data from ${dataForSeoResult.dataSource}`);
        return {
          success: true,
          domainAuthority: dataForSeoResult.domainAuthority,
          totalBacklinks: dataForSeoResult.totalBacklinks,
          referringDomains: dataForSeoResult.referringDomains,
          dofollowLinks: dataForSeoResult.dofollowLinks,
          nofollowLinks: dataForSeoResult.nofollowLinks,
          topBacklinks: dataForSeoResult.topBacklinks.map(link => ({
            domain: link.domain,
            anchor: link.anchor,
            authority: link.authority,
            type: link.type,
            url: link.url,
            trustFlow: link.trustFlow,
            citationFlow: link.citationFlow
          })),
          analysisMethod: dataForSeoResult.analysisMethod,
          dataSource: dataForSeoResult.dataSource,
          analysisUrl: url
        };
      }
      
      // Fall back to OpenPageRank + Majestic combination
      const domainAuthorityResult = await getDomainAuthority(url);
      const majesticResult = await analyzeMajesticBacklinks(url);
      
      if (majesticResult.success) {
        // Use Majestic backlink data with OpenPageRank domain authority
        console.log(`✅ Retrieved backlinks from ${majesticResult.dataSource} and domain authority from ${domainAuthorityResult.dataSource}`);
        return {
          success: true,
          domainAuthority: domainAuthorityResult.success ? 
            Math.round(domainAuthorityResult.authority * 10) : // Convert 0-10 to 0-100 scale
            majesticResult.domainAuthority,
          totalBacklinks: majesticResult.totalBacklinks,
          referringDomains: majesticResult.referringDomains,
          dofollowLinks: majesticResult.dofollowLinks,
          nofollowLinks: majesticResult.nofollowLinks,
          topBacklinks: majesticResult.topBacklinks,
          analysisMethod: 'hybrid_analysis',
          dataSource: `${domainAuthorityResult.dataSource} + ${majesticResult.dataSource}`,
          analysisUrl: majesticResult.analysisUrl
        };
      } else if (domainAuthorityResult.success) {
        // Only domain authority available from OpenPageRank
        console.log(`✅ Retrieved domain authority from ${domainAuthorityResult.dataSource}`);
        return {
          success: true,
          domainAuthority: Math.round(domainAuthorityResult.authority * 10), // Convert 0-10 to 0-100 scale
          totalBacklinks: 0,
          referringDomains: 0,
          dofollowLinks: 0,
          nofollowLinks: 0,
          topBacklinks: [],
          analysisMethod: 'domain_authority_only',
          dataSource: domainAuthorityResult.dataSource,
          analysisUrl: `https://www.domcop.com/openpagerank/`
        };
      } else {
        // No APIs configured - return clear message
        console.log('⚠️ No backlink/authority APIs configured');
        return this.getApiNotConfiguredResponse(url, domainAuthorityResult.error);
      }
      
    } catch (error) {
      console.error('Backlink analysis error:', error);
      return this.getApiNotConfiguredResponse(url, error.message);
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
      error: 'Free domain authority available with OpenPageRank API (add OPENPAGERANK_API_KEY). Full backlink data requires Majestic API subscription ($49.99/month).'
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