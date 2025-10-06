/**
 * Professional Backlink Analysis Service
 * Uses free OpenPageRank API for domain authority + Majestic API for backlink data
 * Falls back to clear messaging when APIs not available
 */

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
      // Get domain authority from free OpenPageRank API
      const domainAuthorityResult = await getDomainAuthority(url);
      
      // Try to get backlink data from Majestic API
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