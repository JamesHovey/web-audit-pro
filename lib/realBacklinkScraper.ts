/**
 * Real Backlink Scraper Service
 * Uses server-side fetching and parsing to get actual backlink data
 */

interface RealBacklink {
  url: string;
  domain: string;
  domainAuthority?: number;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  firstSeen?: string;
}

interface ScrapedBacklinkData {
  success: boolean;
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority?: number;
  backlinks: RealBacklink[];
  source: string;
  error?: string;
}

class RealBacklinkScraper {
  
  /**
   * Main method to get real backlinks using multiple free sources
   */
  async getRealBacklinks(url: string): Promise<ScrapedBacklinkData> {
    console.log(`🔍 Attempting to fetch real backlinks for: ${url}`);
    
    // Try multiple sources in order of reliability
    const scrapers = [
      () => this.scrapeSemrushFree(url),
      () => this.scrapeSeobilityFree(url),
      () => this.scrapeSmallSEOToolsFree(url),
    ];
    
    for (const scraper of scrapers) {
      try {
        const result = await scraper();
        if (result.success && result.backlinks.length > 0) {
          return result;
        }
      } catch (error) {
        console.log(`Scraper failed, trying next: ${error}`);
      }
    }
    
    // If all scrapers fail, return failure
    return {
      success: false,
      totalBacklinks: 0,
      referringDomains: 0,
      backlinks: [],
      source: 'none',
      error: 'All scraping methods failed - dynamic content requires browser automation'
    };
  }
  
  /**
   * Scrape Semrush free backlink data
   * Note: Requires dynamic content loading
   */
  private async scrapeSemrushFree(url: string): Promise<ScrapedBacklinkData> {
    const domain = this.cleanDomain(url);
    const semrushUrl = `https://www.semrush.com/analytics/backlinks/backlink-analytics/${encodeURIComponent(domain)}:backlinks`;
    
    console.log(`📊 Attempting Semrush scrape: ${semrushUrl}`);
    
    try {
      // Fetch the page
      const response = await fetch(semrushUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Check if we got real content or just the loading page
      if (html.includes('__NEXT_DATA__')) {
        // Try to extract data from Next.js props
        const dataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (dataMatch) {
          try {
            const jsonData = JSON.parse(dataMatch[1]);
            // Extract backlinks from the Next.js props if available
            const backlinks = this.extractSemrushBacklinks(jsonData);
            if (backlinks.length > 0) {
              return {
                success: true,
                totalBacklinks: backlinks.length,
                referringDomains: new Set(backlinks.map(b => b.domain)).size,
                backlinks: backlinks,
                source: 'Semrush'
              };
            }
          } catch (_e) {
            console.log('Could not parse Semrush Next.js data');
          }
        }
      }
      
      // Fallback: try to find any backlink data in the HTML
      if (html.includes('referring domain') || html.includes('backlink')) {
        // Parse static HTML for any visible backlink data
        const backlinks = this.parseStaticBacklinks(html);
        if (backlinks.length > 0) {
          return {
            success: true,
            totalBacklinks: backlinks.length,
            referringDomains: new Set(backlinks.map(b => b.domain)).size,
            backlinks: backlinks,
            source: 'Semrush (static)'
          };
        }
      }
      
      throw new Error('No backlink data found in response');
      
    } catch (error) {
      console.error('Semrush scraping failed:', error);
      return {
        success: false,
        totalBacklinks: 0,
        referringDomains: 0,
        backlinks: [],
        source: 'Semrush',
        error: error.message
      };
    }
  }
  
  /**
   * Scrape Seobility free backlink checker
   */
  private async scrapeSeobilityFree(url: string): Promise<ScrapedBacklinkData> {
    const seobilityUrl = `https://www.seobility.net/en/backlinkchecker/check?url=${encodeURIComponent(url)}&i=1`;
    
    console.log(`🔎 Attempting Seobility scrape: ${seobilityUrl}`);
    
    try {
      const response = await fetch(seobilityUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Parse Seobility specific HTML structure
      const backlinks = this.parseSeobilityBacklinks(html);
      
      if (backlinks.length > 0) {
        return {
          success: true,
          totalBacklinks: backlinks.length,
          referringDomains: new Set(backlinks.map(b => b.domain)).size,
          backlinks: backlinks,
          source: 'Seobility'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('Seobility scraping failed:', error);
      return {
        success: false,
        totalBacklinks: 0,
        referringDomains: 0,
        backlinks: [],
        source: 'Seobility',
        error: error.message
      };
    }
  }
  
  /**
   * Scrape SmallSEOTools free backlink checker
   */
  private async scrapeSmallSEOToolsFree(url: string): Promise<ScrapedBacklinkData> {
    const toolUrl = `https://smallseotools.com/backlink-checker/`;
    
    console.log(`🔍 Attempting SmallSEOTools scrape`);
    
    try {
      // This tool requires form submission
      const response = await fetch(toolUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Parse the response for backlink data
      const backlinks = this.parseSmallSEOToolsBacklinks(html);
      
      if (backlinks.length > 0) {
        return {
          success: true,
          totalBacklinks: backlinks.length,
          referringDomains: new Set(backlinks.map(b => b.domain)).size,
          backlinks: backlinks,
          source: 'SmallSEOTools'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('SmallSEOTools scraping failed:', error);
      return {
        success: false,
        totalBacklinks: 0,
        referringDomains: 0,
        backlinks: [],
        source: 'SmallSEOTools',
        error: error.message
      };
    }
  }
  
  /**
   * Parse static HTML for backlinks (fallback method)
   */
  private parseStaticBacklinks(html: string): RealBacklink[] {
    const backlinks: RealBacklink[] = [];
    
    // Try to find common patterns in HTML
    const linkPatterns = [
      /<a[^>]*href=['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/gi,
      /referring domain[^>]*>([^<]+)</gi,
      /backlink[^>]*>([^<]+)</gi,
    ];
    
    // Extract what we can from the HTML
    const urlRegex = /https?:\/\/[^\s<>"]+/gi;
    const urls = html.match(urlRegex) || [];
    
    // Filter for external domains (not the tool's domain)
    const externalUrls = urls.filter(u => 
      !u.includes('semrush.com') && 
      !u.includes('seobility.net') && 
      !u.includes('smallseotools.com') &&
      !u.includes('googleapis.com') &&
      !u.includes('gstatic.com')
    );
    
    // Convert to backlink format
    externalUrls.slice(0, 20).forEach(url => {
      try {
        const urlObj = new URL(url);
        backlinks.push({
          url: url,
          domain: urlObj.hostname,
          anchorText: urlObj.hostname,
          linkType: 'dofollow' // Default assumption
        });
      } catch (_e) {
        // Invalid URL, skip
      }
    });
    
    return backlinks;
  }
  
  /**
   * Extract Semrush backlinks from Next.js data
   */
  private extractSemrushBacklinks(jsonData: any): RealBacklink[] {
    const backlinks: RealBacklink[] = [];
    
    try {
      // Navigate through possible data structures
      const props = jsonData?.props?.pageProps;
      const data = props?.data || props?.backlinks || props?.report;
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.source_url || item.url) {
            backlinks.push({
              url: item.source_url || item.url,
              domain: item.source_domain || this.extractDomain(item.source_url || item.url),
              domainAuthority: item.authority_score || item.domain_authority,
              anchorText: item.anchor || item.anchor_text || '',
              linkType: item.follow ? 'dofollow' : 'nofollow',
              firstSeen: item.first_seen || item.discovered_date
            });
          }
        });
      }
    } catch (_e) {
      console.log('Could not extract Semrush backlinks from JSON');
    }
    
    return backlinks;
  }
  
  /**
   * Parse Seobility specific HTML structure
   */
  private parseSeobilityBacklinks(html: string): RealBacklink[] {
    const backlinks: RealBacklink[] = [];
    
    // Seobility uses table structure for backlinks
    const tableRegex = /<tr[^>]*>.*?<td[^>]*>(.*?)<\/td>.*?<td[^>]*>(.*?)<\/td>.*?<td[^>]*>(.*?)<\/td>/gis;
    let match;
    
    while ((match = tableRegex.exec(html)) !== null) {
      const url = this.extractUrlFromHtml(match[1]);
      const anchorText = this.stripHtml(match[2]);
      const linkType = match[3].toLowerCase().includes('nofollow') ? 'nofollow' : 'dofollow';
      
      if (url) {
        backlinks.push({
          url: url,
          domain: this.extractDomain(url),
          anchorText: anchorText || '',
          linkType: linkType as 'dofollow' | 'nofollow'
        });
      }
    }
    
    return backlinks;
  }
  
  /**
   * Parse SmallSEOTools specific HTML structure
   */
  private parseSmallSEOToolsBacklinks(html: string): RealBacklink[] {
    const backlinks: RealBacklink[] = [];
    
    // Look for backlink data in various formats
    const backlinkRegex = /<div[^>]*class="[^"]*backlink[^"]*"[^>]*>(.*?)<\/div>/gis;
    let match;
    
    while ((match = backlinkRegex.exec(html)) !== null) {
      const url = this.extractUrlFromHtml(match[1]);
      if (url) {
        backlinks.push({
          url: url,
          domain: this.extractDomain(url),
          anchorText: this.stripHtml(match[1]),
          linkType: 'dofollow' // Default
        });
      }
    }
    
    return backlinks;
  }
  
  /**
   * Helper: Extract URL from HTML string
   */
  private extractUrlFromHtml(html: string): string | null {
    const urlMatch = html.match(/href=['"]([^'"]+)['"]/);
    if (urlMatch) return urlMatch[1];
    
    const httpMatch = html.match(/https?:\/\/[^\s<>"]+/);
    if (httpMatch) return httpMatch[0];
    
    return null;
  }
  
  /**
   * Helper: Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }
  
  /**
   * Helper: Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }
  
  /**
   * Helper: Clean domain from URL
   */
  private cleanDomain(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export async function scrapeRealBacklinks(url: string): Promise<ScrapedBacklinkData> {
  const scraper = new RealBacklinkScraper();
  return await scraper.getRealBacklinks(url);
}