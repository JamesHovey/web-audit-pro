/**
 * Real Page Discovery Service
 * Discovers actual pages using sitemaps, robots.txt, and intelligent crawling
 */

import { BrowserService } from './cloudflare-browser';

// More robust H1 detection that handles various edge cases
function hasH1Tag(html: string): boolean {
  // Remove comments and CDATA sections first
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  
  // Multiple detection methods for reliability
  const patterns = [
    /<h1[^>]*>[\s\S]*?<\/h1>/i,           // Standard pattern
    /<h1[^>]*>[^<]*[\w\s][^<]*<\/h1>/i,    // H1 with text content
    /<h1\b[^>]*>(?:(?!<\/h1>)[\s\S])*[a-zA-Z0-9](?:(?!<\/h1>)[\s\S])*<\/h1>/i  // H1 containing alphanumeric
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    if (pattern.test(cleanHtml)) {
      return true;
    }
  }
  
  // Additional check: Look for opening h1 tag and closing h1 tag separately
  const hasOpeningTag = /<h1[^>]*>/i.test(cleanHtml);
  const hasClosingTag = /<\/h1>/i.test(cleanHtml);
  
  if (hasOpeningTag && hasClosingTag) {
    // Extract content between first h1 opening and closing tags
    const h1Match = cleanHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match && h1Match[1].trim().length > 0) {
      return true;
    }
  }
  
  return false;
}

// Enhanced meta description detection including Open Graph tags
function hasMetaDescription(html: string): boolean {
  // Check for standard meta description
  const hasStandardMeta = /<meta\s+name=["']description["'][^>]*>/i.test(html);
  
  // Check for Open Graph description
  const hasOgDescription = /<meta\s+property=["']og:description["'][^>]*>/i.test(html);
  
  // Check for Twitter description
  const hasTwitterDescription = /<meta\s+name=["']twitter:description["'][^>]*>/i.test(html);
  
  return hasStandardMeta || hasOgDescription || hasTwitterDescription;
}

interface DiscoveredPage {
  url: string;
  title: string;
  statusCode: number;
  lastModified?: string;
  priority?: number;
  changeFreq?: string;
  source: 'sitemap' | 'crawl' | 'navigation';
  hasTitle: boolean;
  hasDescription: boolean;
  hasH1: boolean;
  imageCount: number;
  linkCount: number;
}

interface PageDiscoveryResult {
  totalPages: number;
  pages: DiscoveredPage[];
  sitemapUrl?: string;
  sitemapStatus: 'found' | 'missing';
  discoveryMethod: string;
  crawlDepth: number;
}

export class RealPageDiscovery {
  private maxPages = 50; // Limit for crawling only (not sitemap parsing)
  private timeout = 10000; // 10 second timeout per request
  private visitedUrls = new Set<string>();
  private foundPages: DiscoveredPage[] = [];

  async discoverPages(baseUrl: string): Promise<PageDiscoveryResult> {
    console.log(`🔍 Discovering real pages for: ${baseUrl}`);
    
    this.visitedUrls.clear();
    this.foundPages = [];

    const url = new URL(baseUrl);
    const domain = url.hostname;

    // Step 1: Try to find and parse sitemap
    const sitemapResult = await this.parseSitemap(url);
    
    if (sitemapResult.pages.length > 0) {
      console.log(`✅ Found ${sitemapResult.pages.length} pages from sitemap`);
      return {
        totalPages: sitemapResult.pages.length,
        pages: sitemapResult.pages,
        sitemapUrl: sitemapResult.sitemapUrl,
        sitemapStatus: 'found',
        discoveryMethod: 'sitemap',
        crawlDepth: 0
      };
    }

    // Step 2: Fallback to intelligent crawling
    console.log('📝 No sitemap found, using intelligent crawling');
    const crawlResult = await this.intelligentCrawl(baseUrl);

    return {
      totalPages: crawlResult.pages.length,
      pages: crawlResult.pages,
      sitemapStatus: 'missing',
      discoveryMethod: 'intelligent_crawl',
      crawlDepth: crawlResult.depth
    };
  }

  private async parseSitemap(baseUrl: URL): Promise<{pages: DiscoveredPage[], sitemapUrl?: string}> {
    const sitemapUrls = [
      `${baseUrl.origin}/sitemap.xml`,
      `${baseUrl.origin}/sitemap_index.xml`,
      `${baseUrl.origin}/wp-sitemap.xml`,
      `${baseUrl.origin}/sitemap`,
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        console.log(`🗺️ Checking sitemap: ${sitemapUrl}`);
        
        const response = await fetch(sitemapUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) continue;

        const xml = await response.text();
        
        // Check if it's a sitemap index (contains other sitemaps)
        if (xml.includes('<sitemapindex')) {
          const pages = await this.parseSitemapIndex(xml, baseUrl.origin);
          if (pages.length > 0) {
            return { pages, sitemapUrl };
          }
        } else if (xml.includes('<urlset')) {
          const pages = await this.parseSitemapUrls(xml, sitemapUrl);
          if (pages.length > 0) {
            return { pages, sitemapUrl };
          }
        }
      } catch (_error) {
        console.log(`Could not parse sitemap ${sitemapUrl}:`, error.message);
      }
    }

    return { pages: [] };
  }

  private async parseSitemapIndex(xml: string, origin: string): Promise<DiscoveredPage[]> {
    const sitemapRegex = /<loc>(.*?)<\/loc>/g;
    const sitemapUrls: string[] = [];
    let match;

    // Remove limit - parse all child sitemaps in sitemap index
    while ((match = sitemapRegex.exec(xml)) !== null) {
      sitemapUrls.push(match[1]);
    }

    console.log(`📑 Found ${sitemapUrls.length} child sitemaps in sitemap index`);
    const allPages: DiscoveredPage[] = [];

    // Process all child sitemaps (removed page limit)
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
          signal: AbortSignal.timeout(this.timeout)
        });

        if (response.ok) {
          const sitemapXml = await response.text();
          const pages = await this.parseSitemapUrls(sitemapXml, sitemapUrl);
          allPages.push(...pages);
          console.log(`   ✓ Parsed ${pages.length} pages from ${sitemapUrl.split('/').pop()}, total: ${allPages.length}`);
        }
      } catch (_error) {
        console.log(`Could not fetch sitemap ${sitemapUrl}`);
      }
    }

    console.log(`✅ Total pages discovered from all sitemaps: ${allPages.length}`);
    return allPages; // Return all pages, no limit
  }

  private async parseSitemapUrls(xml: string, sitemapUrl: string): Promise<DiscoveredPage[]> {
    const urlPattern = /<url>([\s\S]*?)<\/url>/g;
    const pages: DiscoveredPage[] = [];
    let match;

    // Remove limit - parse all URLs from sitemap (not just first 50)
    while ((match = urlPattern.exec(xml)) !== null) {
      const urlBlock = match[1];

      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      if (!locMatch) continue;

      let pageUrl = locMatch[1].trim();

      // Normalize and validate the URL from sitemap
      try {
        // Fix malformed URLs like "http:/example.com" (missing one slash)
        // by validating through URL constructor
        const urlObj = new URL(pageUrl);

        // Additional validation: ensure URL has a valid hostname
        if (!urlObj.hostname || urlObj.hostname.length === 0) {
          console.log(`Invalid URL in sitemap (no hostname): ${pageUrl}`);
          continue; // Skip URLs without hostnames
        }

        pageUrl = urlObj.href; // Use normalized version
      } catch {
        console.log(`Invalid URL in sitemap: ${pageUrl}`);
        continue; // Skip invalid URLs
      }

      if (this.visitedUrls.has(pageUrl)) continue;
      this.visitedUrls.add(pageUrl);

      // Extract optional sitemap data
      const lastModMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
      const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);
      const changeFreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);

      // Analyze the page
      const pageAnalysis = await this.analyzePage(pageUrl);

      pages.push({
        url: pageUrl,
        title: pageAnalysis.title,
        statusCode: pageAnalysis.statusCode,
        lastModified: lastModMatch?.[1],
        priority: priorityMatch ? parseFloat(priorityMatch[1]) : undefined,
        changeFreq: changeFreqMatch?.[1],
        source: 'sitemap',
        hasTitle: pageAnalysis.hasTitle,
        hasDescription: pageAnalysis.hasDescription,
        hasH1: pageAnalysis.hasH1,
        imageCount: pageAnalysis.imageCount,
        linkCount: pageAnalysis.linkCount
      });
    }

    console.log(`📊 Parsed ${pages.length} URLs from sitemap`);
    return pages;
  }

  private async intelligentCrawl(startUrl: string): Promise<{pages: DiscoveredPage[], depth: number}> {
    const url = new URL(startUrl);
    const domain = url.hostname;
    const pagesToCrawl = [startUrl];
    const foundPages: DiscoveredPage[] = [];
    let currentDepth = 0;
    const maxDepth = 3;

    while (pagesToCrawl.length > 0 && foundPages.length < this.maxPages && currentDepth < maxDepth) {
      const currentUrl = pagesToCrawl.shift()!;
      
      if (this.visitedUrls.has(currentUrl)) continue;
      this.visitedUrls.add(currentUrl);

      console.log(`🕷️ Crawling page: ${currentUrl}`);

      try {
        // Use browser rendering for the first page to handle JavaScript-rendered content
        const useBrowser = currentDepth === 0;
        const pageAnalysis = await this.analyzePage(currentUrl, useBrowser);

        if (pageAnalysis.statusCode === 200) {
          foundPages.push({
            url: currentUrl,
            title: pageAnalysis.title,
            statusCode: pageAnalysis.statusCode,
            source: currentDepth === 0 ? 'navigation' : 'crawl',
            hasTitle: pageAnalysis.hasTitle,
            hasDescription: pageAnalysis.hasDescription,
            hasH1: pageAnalysis.hasH1,
            imageCount: pageAnalysis.imageCount,
            linkCount: pageAnalysis.linkCount
          });

          // Find more internal links to crawl
          const newLinks = pageAnalysis.internalLinks
            .filter(link => {
              try {
                const linkUrl = new URL(link);
                return linkUrl.hostname === domain && !this.visitedUrls.has(link);
              } catch {
                return false;
              }
            })
            .slice(0, 10); // Limit new links per page

          pagesToCrawl.push(...newLinks);
        }
      } catch (_error) {
        console.log(`Could not crawl ${currentUrl}:`, error.message);
      }

      // Move to next depth level
      if (pagesToCrawl.length === 0) {
        currentDepth++;
      }
    }

    console.log(`🎯 Intelligent crawl found ${foundPages.length} pages at depth ${currentDepth}`);
    return { pages: foundPages, depth: currentDepth };
  }

  private async analyzePage(url: string, useBrowser: boolean = false): Promise<{
    title: string;
    statusCode: number;
    hasTitle: boolean;
    hasDescription: boolean;
    hasH1: boolean;
    imageCount: number;
    linkCount: number;
    internalLinks: string[];
  }> {
    try {
      let html: string;
      let statusCode: number = 200;

      if (useBrowser) {
        // Use Puppeteer to get fully rendered HTML (handles client-side rendered content)
        try {
          console.log(`🌐 Using browser rendering for: ${url}`);
          const browserResult = await BrowserService.withBrowser(async (browser, page) => {
            await BrowserService.goto(page, url);

            // Wait a moment for JavaScript to execute
            await new Promise(resolve => setTimeout(resolve, 1000));

            const renderedHtml = await page.content();
            return renderedHtml;
          });

          html = browserResult;
        } catch (browserError) {
          console.warn('Browser rendering failed, falling back to fetch:', browserError);
          // Fallback to simple fetch
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
            redirect: 'follow',
            signal: AbortSignal.timeout(this.timeout)
          });

          if (!response.ok) {
            return {
              title: 'Error loading page',
              statusCode: response.status,
              hasTitle: false,
              hasDescription: false,
              hasH1: false,
              imageCount: 0,
              linkCount: 0,
              internalLinks: []
            };
          }

          html = await response.text();
          statusCode = response.status;
        }
      } else {
        // Use simple fetch for speed (default for discovered pages)
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
          redirect: 'follow',
          signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
          return {
            title: 'Error loading page',
            statusCode: response.status,
            hasTitle: false,
            hasDescription: false,
            hasH1: false,
            imageCount: 0,
            linkCount: 0,
            internalLinks: []
          };
        }

        html = await response.text();
        statusCode = response.status;
      }
      const baseUrl = new URL(url);

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No title';

      // Check for meta elements
      const hasTitle = /<title[^>]*>.*<\/title>/is.test(html);
      const hasDescription = hasMetaDescription(html);
      const hasH1 = hasH1Tag(html);

      // Count images
      const imageMatches = html.match(/<img[^>]+>/gi) || [];
      const imageCount = imageMatches.length;

      // Find internal links
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      const internalLinks: string[] = [];
      let linkMatch;

      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const href = linkMatch[1];
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          continue;
        }

        try {
          // Always use URL constructor for proper normalization
          // This handles both absolute and relative URLs correctly
          let linkUrl: string;
          if (href.startsWith('http://') || href.startsWith('https://')) {
            // Valid absolute URL - use directly but validate
            linkUrl = new URL(href).href;
          } else {
            // Relative URL or malformed URL - resolve against base
            linkUrl = new URL(href, baseUrl).href;
          }

          const linkDomain = new URL(linkUrl).hostname;

          if (linkDomain === baseUrl.hostname) {
            internalLinks.push(linkUrl);
          }
        } catch {
          // Invalid URL, skip
        }
      }

      return {
        title,
        statusCode: response.status,
        hasTitle,
        hasDescription,
        hasH1,
        imageCount,
        linkCount: internalLinks.length,
        internalLinks: [...new Set(internalLinks)] // Remove duplicates
      };

    } catch (_error) {
      return {
        title: 'Error loading page',
        statusCode: 0,
        hasTitle: false,
        hasDescription: false,
        hasH1: false,
        imageCount: 0,
        linkCount: 0,
        internalLinks: []
      };
    }
  }
}

export async function discoverRealPages(baseUrl: string): Promise<PageDiscoveryResult> {
  const discovery = new RealPageDiscovery();
  return await discovery.discoverPages(baseUrl);
}