/**
 * Puppeteer-based SERP Scraper with Stealth Mode
 * Provides more reliable Google SERP scraping with browser automation
 */

let puppeteer: any = null;
let StealthPlugin: any = null;

// Lazy load Puppeteer to avoid webpack issues
async function initializePuppeteer() {
  if (!puppeteer) {
    try {
      const puppeteerExtra = await import('puppeteer-extra');
      const stealthPlugin = await import('puppeteer-extra-plugin-stealth');
      
      puppeteer = puppeteerExtra.default;
      StealthPlugin = stealthPlugin.default;
      
      // Enable stealth mode
      puppeteer.use(StealthPlugin());
      
      console.log('✅ Puppeteer modules loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Puppeteer:', error);
      throw new Error('Puppeteer not available');
    }
  }
  return puppeteer;
}

interface SerpResult {
  position: number;
  domain: string;
  url: string;
  title: string;
  snippet: string;
}

interface PuppeteerSerpData {
  keyword: string;
  results: SerpResult[];
  searchSuccess: boolean;
  method: 'puppeteer';
}

export class PuppeteerSerpScraper {
  private browser: any = null;
  private page: any = null;
  private isInitialized = false;
  private maxResults = 10;
  private requestDelay = 4000; // 4 seconds between searches

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Puppeteer with stealth mode...');
    
    try {
      const pptr = await initializePuppeteer();
      this.browser = await pptr.launch({
        headless: 'new', // Use new headless mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set viewport to common desktop resolution
      await this.page.setViewport({ 
        width: 1366, 
        height: 768,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false
      });

      // Set additional headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      });

      // Enable request interception for additional stealth
      await this.page.setRequestInterception(true);
      
      this.page.on('request', (request: any) => {
        // Block unnecessary resources to speed up page loads
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Simulate initial browsing behavior
      await this.simulateHumanBehavior();
      
      this.isInitialized = true;
      console.log('✅ Puppeteer initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer:', error);
      throw error;
    }
  }

  private async simulateHumanBehavior(): Promise<void> {
    try {
      console.log('🎭 Simulating human browsing behavior...');
      
      // Visit Google homepage first
      await this.page.goto('https://www.google.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Random delay
      await this.randomDelay(1000, 3000);

      // Simulate some mouse movement
      await this.page.mouse.move(
        Math.random() * 800 + 100, 
        Math.random() * 600 + 100
      );

      // Check if CAPTCHA or consent screen appears
      const pageText = await this.page.content();
      if (pageText.includes('Before you continue') || pageText.includes('consent')) {
        console.log('🍪 Consent screen detected, attempting to handle...');
        
        // Try to click accept button
        const acceptSelectors = [
          'button[id*="accept"]',
          'button[aria-label*="Accept"]',
          'button:contains("Accept all")',
          'button:contains("I agree")',
          '#L2AGLb' // Google's accept all button ID
        ];

        for (const selector of acceptSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 2000 });
            await this.page.click(selector);
            await this.randomDelay(1000, 2000);
            break;
          } catch {
            continue;
          }
        }
      }

      console.log('✅ Human behavior simulation complete');
      
    } catch (error) {
      console.log('⚠️ Human behavior simulation had issues:', error.message);
    }
  }

  async searchKeywords(keywords: string[]): Promise<PuppeteerSerpData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: PuppeteerSerpData[] = [];
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`🔎 Puppeteer search: "${keyword}" (${i + 1}/${keywords.length})`);
      
      try {
        const serpResults = await this.performSearch(keyword);
        
        results.push({
          keyword,
          results: serpResults,
          searchSuccess: serpResults.length > 0,
          method: 'puppeteer'
        });

        // Rate limiting between searches
        if (i < keywords.length - 1) {
          const delay = this.requestDelay + Math.random() * 2000; // 4-6 seconds
          console.log(`⏱️  Waiting ${Math.round(delay)}ms before next search...`);
          await this.randomDelay(delay, delay + 500);
        }
        
      } catch (error) {
        console.log(`❌ Search failed for "${keyword}":`, error.message);
        results.push({
          keyword,
          results: [],
          searchSuccess: false,
          method: 'puppeteer'
        });
        
        // Longer delay on errors
        await this.randomDelay(5000, 8000);
      }
    }

    return results;
  }

  private async performSearch(query: string): Promise<SerpResult[]> {
    try {
      // Navigate to search results
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Check for blocking
      const pageText = await this.page.content();
      if (this.isBlockedPage(pageText)) {
        throw new Error('Search blocked by Google');
      }

      // Wait for search results to load
      await this.page.waitForTimeout(2000);

      // Extract search results using multiple strategies
      const results = await this.extractSearchResults();
      
      console.log(`✅ Extracted ${results.length} results from Puppeteer`);
      return results;
      
    } catch (error) {
      console.log(`❌ Puppeteer search error: ${error.message}`);
      throw error;
    }
  }

  private async extractSearchResults(): Promise<SerpResult[]> {
    return await this.page.evaluate((maxResults: number) => {
      const results: SerpResult[] = [];
      const seenDomains = new Set<string>();

      // Multiple selectors for different Google layouts
      const selectors = [
        // Main organic results
        'div[data-ved] h3 a',
        'div.yuRUbf a h3',
        'h3.LC20lb a',
        'div.g a h3',
        'a h3.LC20lb',
        
        // Alternative patterns
        '[data-href] h3',
        'div[jscontroller] a h3',
        '.BNeawe a',
        
        // Fallback patterns
        'a[href^="https://"][href*="://"][href*="."]'
      ];

      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          
          elements.forEach((element, index) => {
            if (results.length >= maxResults) return;
            
            let url = '';
            let title = '';
            const linkElement = element;

            // Handle different element types
            if (element.tagName === 'A') {
              url = (element as HTMLAnchorElement).href;
              title = element.textContent?.trim() || '';
            } else if (element.tagName === 'H3') {
              const link = element.closest('a') || element.querySelector('a');
              if (link) {
                url = (link as HTMLAnchorElement).href;
                title = element.textContent?.trim() || '';
              }
            }

            // Clean and validate URL
            if (url && title && url.startsWith('http')) {
              try {
                const urlObj = new URL(url);
                const domain = urlObj.hostname.replace(/^www\./, '');
                
                // Filter out unwanted domains
                const unwantedDomains = [
                  'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
                  'linkedin.com', 'instagram.com', 'wikipedia.org', 'reddit.com'
                ];
                
                const isUnwanted = unwantedDomains.some(unwanted => 
                  domain.includes(unwanted) || url.includes('google.com/search')
                );
                
                if (!isUnwanted && !seenDomains.has(domain) && title.length > 5) {
                  seenDomains.add(domain);
                  
                  results.push({
                    position: results.length + 1,
                    domain,
                    url,
                    title: title.substring(0, 200), // Limit title length
                    snippet: '' // We'll add snippet extraction later if needed
                  });
                }
              } catch (_e) {
                // Invalid URL, skip
              }
            }
          });
          
          if (results.length >= maxResults) break;
          
        } catch (_e) {
          console.log(`Selector ${selector} failed:`, e.message);
          continue;
        }
      }

      return results;
    }, this.maxResults);
  }

  private isBlockedPage(html: string): boolean {
    const blockingSignals = [
      'unusual traffic',
      'not a robot',
      'captcha',
      'blocked',
      'sorry, but your computer or network may be sending automated queries',
      'automated requests',
      'verify you are human'
    ];
    
    const lowercaseHtml = html.toLowerCase();
    return blockingSignals.some(signal => lowercaseHtml.includes(signal));
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      console.log('🧹 Cleaning up Puppeteer browser...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
    }
  }

  // Static method for one-off searches
  static async search(keywords: string[]): Promise<PuppeteerSerpData[]> {
    const scraper = new PuppeteerSerpScraper();
    try {
      await scraper.initialize();
      return await scraper.searchKeywords(keywords);
    } finally {
      await scraper.cleanup();
    }
  }
}

export { PuppeteerSerpData };