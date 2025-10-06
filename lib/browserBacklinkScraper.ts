/**
 * Browser-based Backlink Scraper using Playwright
 * Executes JavaScript and handles dynamic content to fetch real backlink data
 */

import { chromium, type Browser, type Page } from 'playwright';

interface RealBacklink {
  url: string;
  domain: string;
  domainAuthority?: number;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  firstSeen?: string;
}

interface BrowserBacklinkData {
  success: boolean;
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority?: number;
  backlinks: RealBacklink[];
  source: string;
  error?: string;
}

class BrowserBacklinkScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  
  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      console.log('🚀 Launching headless browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage'
        ]
      });
    }
    
    if (!this.page) {
      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
      });
      
      this.page = await context.newPage();
      
      // Block unnecessary resources to speed up loading
      await this.page.route('**/*.{png,jpg,jpeg,gif,svg,mp4,avi,css}', route => route.abort());
    }
  }
  
  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Main method to get real backlinks using browser automation
   */
  async getRealBacklinks(url: string): Promise<BrowserBacklinkData> {
    console.log(`🔍 Browser-based backlink analysis for: ${url}`);
    
    try {
      await this.initBrowser();
      
      // Try multiple sources in order of reliability
      const scrapers = [
        () => this.scrapeOpenLinkProfiler(url),
        () => this.scrapeNeilPatelUbersuggest(url),
        () => this.scrapeSemrushWithBrowser(url),
      ];
      
      for (const scraper of scrapers) {
        try {
          const result = await scraper();
          if (result.success && result.backlinks.length > 0) {
            return result;
          }
        } catch (error) {
          console.log(`Scraper failed, trying next: ${error.message}`);
        }
      }
      
      // If all scrapers fail
      return {
        success: false,
        totalBacklinks: 0,
        referringDomains: 0,
        backlinks: [],
        source: 'none',
        error: 'All browser scraping methods failed'
      };
      
    } catch (error) {
      console.error('Browser scraping error:', error);
      return {
        success: false,
        totalBacklinks: 0,
        referringDomains: 0,
        backlinks: [],
        source: 'browser',
        error: error.message
      };
    } finally {
      // Keep browser open for potential reuse
      // await this.cleanup();
    }
  }
  
  /**
   * Scrape Semrush free backlink checker with browser
   */
  private async scrapeSemrushWithBrowser(url: string): Promise<BrowserBacklinkData> {
    const domain = this.cleanDomain(url);
    const semrushUrl = `https://www.semrush.com/analytics/backlinks/backlink-analytics/${encodeURIComponent(domain)}:backlinks`;
    
    console.log(`📊 Scraping Semrush with browser: ${semrushUrl}`);
    
    try {
      await this.page!.goto(semrushUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for content to load
      await this.page!.waitForTimeout(3000);
      
      // Check if we need to handle any popups or cookie banners
      try {
        await this.page!.click('button:has-text("Accept")', { timeout: 2000 });
      } catch (e) {
        // No cookie banner, continue
      }
      
      // Try to extract backlink data
      const backlinks = await this.page!.evaluate(() => {
        const links: any[] = [];
        
        // Look for backlink table rows
        const rows = document.querySelectorAll('tr[data-test="backlinks-table-row"], .backlinks-row, [class*="backlink"]');
        
        rows.forEach(row => {
          const linkElement = row.querySelector('a[href*="http"], .source-url, [class*="source"]');
          const anchorElement = row.querySelector('.anchor-text, [class*="anchor"]');
          const authorityElement = row.querySelector('.authority-score, [class*="authority"]');
          const typeElement = row.querySelector('.link-type, [class*="follow"]');
          
          if (linkElement) {
            const url = linkElement.getAttribute('href') || linkElement.textContent?.trim() || '';
            const anchor = anchorElement?.textContent?.trim() || '';
            const authority = authorityElement?.textContent?.trim() || '';
            const isNofollow = typeElement?.textContent?.toLowerCase().includes('nofollow') || false;
            
            if (url && url.includes('http')) {
              links.push({
                url: url,
                anchorText: anchor,
                authority: parseInt(authority) || 0,
                linkType: isNofollow ? 'nofollow' : 'dofollow'
              });
            }
          }
        });
        
        // Also try to get summary stats
        const totalBacklinks = document.querySelector('[class*="total-backlinks"], [data-test*="backlinks-count"]')?.textContent?.trim();
        const referringDomains = document.querySelector('[class*="referring-domains"], [data-test*="domains-count"]')?.textContent?.trim();
        
        return {
          links,
          totalBacklinks,
          referringDomains
        };
      });
      
      if (backlinks.links.length > 0) {
        const formattedBacklinks: RealBacklink[] = backlinks.links.map((link: any) => ({
          url: link.url,
          domain: this.extractDomain(link.url),
          domainAuthority: link.authority,
          anchorText: link.anchorText || '',
          linkType: link.linkType
        }));
        
        return {
          success: true,
          totalBacklinks: this.parseNumber(backlinks.totalBacklinks) || backlinks.links.length,
          referringDomains: this.parseNumber(backlinks.referringDomains) || new Set(formattedBacklinks.map(b => b.domain)).size,
          backlinks: formattedBacklinks,
          source: 'Semrush (Browser)'
        };
      }
      
      throw new Error('No backlinks found on page');
      
    } catch (error) {
      console.error('Semrush browser scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Scrape Seobility free backlink checker with browser
   */
  private async scrapeSeobilityWithBrowser(url: string): Promise<BrowserBacklinkData> {
    const seobilityUrl = `https://www.seobility.net/en/backlinkchecker/`;
    
    console.log(`🔎 Scraping Seobility with browser`);
    
    try {
      await this.page!.goto(seobilityUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Fill in the URL and submit
      await this.page!.fill('input[name="url"], #url', url);
      await this.page!.click('button[type="submit"], input[type="submit"]');
      
      // Wait for results to load
      await this.page!.waitForSelector('.backlink-table, .results-table, table', { timeout: 15000 });
      await this.page!.waitForTimeout(2000);
      
      // Extract backlink data
      const backlinks = await this.page!.evaluate(() => {
        const links: any[] = [];
        
        // Look for backlink table rows
        const rows = document.querySelectorAll('table tr, .backlink-row');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const urlCell = cells[0];
            const anchorCell = cells[1];
            const typeCell = cells[2];
            
            const url = urlCell.querySelector('a')?.getAttribute('href') || urlCell.textContent?.trim() || '';
            const anchor = anchorCell?.textContent?.trim() || '';
            const isNofollow = typeCell?.textContent?.toLowerCase().includes('nofollow') || false;
            
            if (url && url.includes('http')) {
              links.push({
                url: url,
                anchorText: anchor,
                linkType: isNofollow ? 'nofollow' : 'dofollow'
              });
            }
          }
        });
        
        return links;
      });
      
      if (backlinks.length > 0) {
        const formattedBacklinks: RealBacklink[] = backlinks.map((link: any) => ({
          url: link.url,
          domain: this.extractDomain(link.url),
          anchorText: link.anchorText || '',
          linkType: link.linkType
        }));
        
        return {
          success: true,
          totalBacklinks: backlinks.length,
          referringDomains: new Set(formattedBacklinks.map(b => b.domain)).size,
          backlinks: formattedBacklinks,
          source: 'Seobility (Browser)'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('Seobility browser scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Scrape OpenLinkProfiler - completely free backlink tool
   */
  private async scrapeOpenLinkProfiler(url: string): Promise<BrowserBacklinkData> {
    const domain = this.cleanDomain(url);
    console.log(`🔗 Scraping OpenLinkProfiler for ${domain}`);
    
    try {
      // Direct URL with domain parameter
      const profileUrl = `https://openlinkprofiler.org/r/${encodeURIComponent(domain)}`;
      
      await this.page!.goto(profileUrl, { 
        waitUntil: 'networkidle',
        timeout: 45000 
      });
      
      // Wait for results to load
      await this.page!.waitForTimeout(5000);
      
      // Extract backlink data
      const data = await this.page!.evaluate(() => {
        const links: any[] = [];
        
        // Look for backlink table rows
        const rows = document.querySelectorAll('.table-backlinks tr, table.table tr, .backlinks-table tr');
        
        rows.forEach((row, index) => {
          if (index === 0) return; // Skip header
          
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            // Usually: Source URL | Anchor Text | Link Strength/Type
            const sourceCell = cells[0];
            const anchorCell = cells[1];
            const typeCell = cells[2];
            
            const sourceLink = sourceCell.querySelector('a');
            const sourceUrl = sourceLink?.getAttribute('href') || sourceLink?.textContent?.trim() || sourceCell.textContent?.trim() || '';
            const anchorText = anchorCell?.textContent?.trim() || '';
            const linkInfo = typeCell?.textContent?.trim() || '';
            
            if (sourceUrl && sourceUrl.includes('http')) {
              links.push({
                url: sourceUrl,
                anchorText: anchorText,
                linkType: linkInfo.toLowerCase().includes('nofollow') ? 'nofollow' : 'dofollow'
              });
            }
          }
        });
        
        // Try to get summary stats
        const statsText = document.body.innerText;
        const totalMatch = statsText.match(/(\d+[,\d]*) backlinks?/i);
        const domainsMatch = statsText.match(/(\d+[,\d]*) (?:referring|unique) domains?/i);
        
        return {
          links: links,
          totalBacklinks: totalMatch ? totalMatch[1].replace(/,/g, '') : links.length.toString(),
          referringDomains: domainsMatch ? domainsMatch[1].replace(/,/g, '') : '0'
        };
      });
      
      if (data.links.length > 0) {
        const formattedBacklinks: RealBacklink[] = data.links.map((link: any) => ({
          url: link.url,
          domain: this.extractDomain(link.url),
          anchorText: link.anchorText || '',
          linkType: link.linkType
        }));
        
        return {
          success: true,
          totalBacklinks: parseInt(data.totalBacklinks) || data.links.length,
          referringDomains: parseInt(data.referringDomains) || new Set(formattedBacklinks.map(b => b.domain)).size,
          backlinks: formattedBacklinks,
          source: 'OpenLinkProfiler'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('OpenLinkProfiler scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Scrape Neil Patel's Ubersuggest free backlink checker
   */
  private async scrapeNeilPatelUbersuggest(url: string): Promise<BrowserBacklinkData> {
    const domain = this.cleanDomain(url);
    console.log(`🔍 Scraping Ubersuggest for ${domain}`);
    
    try {
      const ubersuggestUrl = `https://neilpatel.com/backlinks-checker/`;
      
      await this.page!.goto(ubersuggestUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Fill in domain and submit
      await this.page!.fill('input[name="url"], #url, input[type="text"]', domain);
      await this.page!.click('button[type="submit"], .btn-submit');
      
      // Wait for results
      await this.page!.waitForTimeout(5000);
      
      // Extract data
      const backlinks = await this.page!.evaluate(() => {
        const links: any[] = [];
        
        // Look for backlink entries
        const entries = document.querySelectorAll('.backlink-item, .result-row, tr.data-row');
        
        entries.forEach(entry => {
          const urlElement = entry.querySelector('a[href*="http"]');
          const anchorElement = entry.querySelector('.anchor, .anchor-text');
          
          if (urlElement) {
            const url = urlElement.getAttribute('href') || '';
            const anchor = anchorElement?.textContent?.trim() || urlElement.textContent?.trim() || '';
            
            links.push({
              url: url,
              anchorText: anchor,
              linkType: 'dofollow' // Default
            });
          }
        });
        
        return links;
      });
      
      if (backlinks.length > 0) {
        const formattedBacklinks: RealBacklink[] = backlinks.map((link: any) => ({
          url: link.url,
          domain: this.extractDomain(link.url),
          anchorText: link.anchorText || '',
          linkType: link.linkType
        }));
        
        return {
          success: true,
          totalBacklinks: backlinks.length,
          referringDomains: new Set(formattedBacklinks.map(b => b.domain)).size,
          backlinks: formattedBacklinks,
          source: 'Ubersuggest'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('Ubersuggest scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Scrape backlink-checker.org (another free tool) - REPLACED WITH OPENLINKPROFILER
   */
  private async scrapeBacklinkCheckerOrg(url: string): Promise<BrowserBacklinkData> {
    const checkerUrl = `https://www.backlink-checker.org/`;
    
    console.log(`🔗 Scraping backlink-checker.org with browser`);
    
    try {
      await this.page!.goto(checkerUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Fill in the URL and submit
      await this.page!.fill('input[name="url"], #url, input[type="text"]', url);
      await this.page!.click('button[type="submit"], input[type="submit"], .submit-btn');
      
      // Wait for results
      await this.page!.waitForSelector('.results, .backlinks-list, table', { timeout: 15000 });
      await this.page!.waitForTimeout(2000);
      
      // Extract backlink data
      const backlinks = await this.page!.evaluate(() => {
        const links: any[] = [];
        
        // Look for backlink entries
        const entries = document.querySelectorAll('.backlink-item, .result-item, tr');
        
        entries.forEach(entry => {
          const linkElement = entry.querySelector('a[href*="http"]');
          const textContent = entry.textContent || '';
          
          if (linkElement) {
            const url = linkElement.getAttribute('href') || '';
            const anchor = linkElement.textContent?.trim() || '';
            const isNofollow = textContent.toLowerCase().includes('nofollow');
            
            if (url && url.includes('http')) {
              links.push({
                url: url,
                anchorText: anchor,
                linkType: isNofollow ? 'nofollow' : 'dofollow'
              });
            }
          }
        });
        
        return links;
      });
      
      if (backlinks.length > 0) {
        const formattedBacklinks: RealBacklink[] = backlinks.map((link: any) => ({
          url: link.url,
          domain: this.extractDomain(link.url),
          anchorText: link.anchorText || '',
          linkType: link.linkType
        }));
        
        return {
          success: true,
          totalBacklinks: backlinks.length,
          referringDomains: new Set(formattedBacklinks.map(b => b.domain)).size,
          backlinks: formattedBacklinks,
          source: 'Backlink-Checker.org (Browser)'
        };
      }
      
      throw new Error('No backlinks found');
      
    } catch (error) {
      console.error('Backlink-checker.org scraping failed:', error);
      throw error;
    }
  }
  
  /**
   * Helper: Parse number from text (handles K, M suffixes)
   */
  private parseNumber(text: string | undefined): number {
    if (!text) return 0;
    
    // Remove commas and spaces
    text = text.replace(/[,\s]/g, '');
    
    // Handle K, M suffixes
    if (text.toLowerCase().includes('k')) {
      return parseFloat(text) * 1000;
    }
    if (text.toLowerCase().includes('m')) {
      return parseFloat(text) * 1000000;
    }
    
    return parseInt(text) || 0;
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

// Singleton instance to reuse browser
let scraperInstance: BrowserBacklinkScraper | null = null;

export async function scrapeBacklinksWithBrowser(url: string): Promise<BrowserBacklinkData> {
  if (!scraperInstance) {
    scraperInstance = new BrowserBacklinkScraper();
  }
  return await scraperInstance.getRealBacklinks(url);
}

export async function cleanupBrowser(): Promise<void> {
  if (scraperInstance) {
    await scraperInstance.cleanup();
    scraperInstance = null;
  }
}