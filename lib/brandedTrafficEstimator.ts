/**
 * Branded Traffic Estimator
 * Simple estimation of monthly branded traffic using KeywordsEverywhere + ValueSerp APIs
 * Returns a single number: estimated monthly branded traffic
 */

import { KeywordsEverywhereService } from './keywordsEverywhereService';
import { ValueSerpService } from './valueSerpService';

export class BrandedTrafficEstimator {
  private keywordsService: KeywordsEverywhereService;
  private valueSerpService: ValueSerpService;

  constructor() {
    this.keywordsService = new KeywordsEverywhereService();
    this.valueSerpService = new ValueSerpService();
  }

  /**
   * Get estimated monthly branded traffic for a domain
   * @param domain - The domain to analyze (e.g., "pmwcom.co.uk")
   * @param country - Country code for search volumes (e.g., "uk", "us")
   * @returns Promise<number> - Estimated monthly branded traffic
   */
  async getMonthlyBrandedTraffic(domain: string, country: string = 'gb'): Promise<number> {
    console.log(`\n🎯 Estimating monthly branded traffic for ${domain}`);
    
    // Check if APIs are available
    if (!process.env.KEYWORDS_EVERYWHERE_API_KEY || !process.env.VALUESERP_API_KEY) {
      throw new Error('API keys not configured. Please ensure both KEYWORDS_EVERYWHERE_API_KEY and VALUESERP_API_KEY are set in your environment variables.');
    }

    try {
      // Step 1: Generate brand keywords
      const brandKeywords = this.generateBrandKeywords(domain);
      console.log(`Generated ${brandKeywords.length} brand keywords`);

      // Step 2: Get search volumes from KeywordsEverywhere
      const volumeData = await this.keywordsService.getSearchVolumes(brandKeywords, country);
      const totalSearchVolume = volumeData.reduce((sum, kw) => sum + kw.volume, 0);
      console.log(`Total monthly brand searches: ${totalSearchVolume.toLocaleString()}`);

      // Step 3: Check if domain ranks for its brand (quick check with main brand term)
      const mainBrandTerm = this.extractMainBrand(domain);
      const isRanking = await this.checkIfDomainRanks(mainBrandTerm, domain, country);
      
      // Step 4: Apply CTR multiplier based on brand ranking
      const ctrMultiplier = isRanking ? 0.35 : 0.05; // 35% if ranking, 5% if not
      const estimatedTraffic = Math.round(totalSearchVolume * ctrMultiplier);
      
      console.log(`Brand ranking detected: ${isRanking ? 'YES' : 'NO'}`);
      console.log(`Applied CTR multiplier: ${(ctrMultiplier * 100)}%`);
      console.log(`✅ Estimated monthly branded traffic: ${estimatedTraffic.toLocaleString()}`);
      
      return estimatedTraffic;

    } catch (error) {
      console.error('🚫 API estimation failed:', error.message);
      throw new Error(`Failed to estimate branded traffic using APIs: ${error.message}`);
    }
  }

  /**
   * Generate relevant brand keywords for the domain
   */
  private generateBrandKeywords(domain: string): string[] {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
    const brandName = this.extractMainBrand(domain);
    
    return [
      brandName,                    // "pmw"
      cleanDomain,                  // "pmwcom"  
      `${brandName} website`,       // "pmw website"
      `${brandName} site`,          // "pmw site"
      `${brandName} official`,      // "pmw official"
      `${brandName} company`,       // "pmw company"
      `${cleanDomain}.co.uk`,       // "pmwcom.co.uk"
      `${cleanDomain}.com`,         // "pmwcom.com"
      `www.${cleanDomain}`,         // "www.pmwcom"
      `${brandName} services`,      // "pmw services"
    ].filter(kw => kw.length > 2);
  }

  /**
   * Extract main brand name from domain
   */
  private extractMainBrand(domain: string): string {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
    
    // Remove common business suffixes and clean up
    return cleanDomain
      .replace(/(ltd|limited|inc|corp|company|group|solutions|services)$/gi, '')
      .replace(/[-_]/g, ' ')
      .trim();
  }

  /**
   * Quick check if domain ranks for its main brand term
   */
  private async checkIfDomainRanks(brandTerm: string, domain: string, country: string): Promise<boolean> {
    try {
      console.log(`Checking if ${domain} ranks for "${brandTerm}"...`);
      
      // Map country code to location name for ValueSERP
      const locationMap: { [key: string]: string } = {
        'gb': 'United Kingdom',
        'us': 'United States', 
        'ca': 'Canada',
        'au': 'Australia',
        'de': 'Germany',
        'fr': 'France',
        'es': 'Spain',
        'it': 'Italy',
        'nl': 'Netherlands'
      };
      
      const location = locationMap[country] || 'United Kingdom';
      const serpResults = await this.valueSerpService.getFullSerpResults(brandTerm, location, 10);

      if (!serpResults || !serpResults.results) {
        throw new Error(`No SERP results returned for "${brandTerm}" from ValueSERP API`);
      }

      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Check if domain appears in top 10 results
      const isFound = serpResults.results.some(result => 
        result.domain.includes(cleanDomain) || 
        result.url.includes(cleanDomain)
      );

      console.log(`${domain} ${isFound ? 'FOUND' : 'NOT FOUND'} in top 10 for "${brandTerm}"`);
      return isFound;

    } catch (error) {
      console.error(`Failed to check ranking for "${brandTerm}":`, error.message);
      throw new Error(`ValueSERP API failed to check brand ranking: ${error.message}`);
    }
  }

}