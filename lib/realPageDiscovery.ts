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
    // If both tags exist, consider it valid even if content is empty
    // Elementor and other page builders often use H1 tags with nested elements
    // or content filled by JavaScript (e.g., <h1 class="elementor-heading-title"><span>...</span></h1>)

    // Extract the H1 for logging (helpful for debugging)
    const h1Match = cleanHtml.match(/<h1[^>]*>[\s\S]{0,200}/i);
    if (h1Match) {
      console.log(`✓ H1 tag found: ${h1Match[0].substring(0, 100)}...`);
    }

    return true;
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

// Extract meta description text for duplicate detection
function extractMetaDescription(html: string): string | undefined {
  // Try standard meta description first
  const standardMatch = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (standardMatch && standardMatch[1]) {
    return standardMatch[1].trim();
  }

  // Try content before name attribute
  const altMatch = html.match(/<meta\s+content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  if (altMatch && altMatch[1]) {
    return altMatch[1].trim();
  }

  // Try Open Graph description
  const ogMatch = html.match(/<meta\s+property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogMatch && ogMatch[1]) {
    return ogMatch[1].trim();
  }

  // Try Twitter description
  const twitterMatch = html.match(/<meta\s+name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (twitterMatch && twitterMatch[1]) {
    return twitterMatch[1].trim();
  }

  return undefined;
}

// Extract H1 text for duplicate detection
function extractH1(html: string): string | undefined {
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    // Remove HTML tags and normalize whitespace
    return h1Match[1]
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  return undefined;
}

// Extract main body content for duplicate detection
function extractBodyContent(html: string): string {
  let content = html;

  // Remove common boilerplate elements
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ''); // Remove scripts
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // Remove styles
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ''); // Remove navigation
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ''); // Remove header
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ''); // Remove footer
  content = content.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments

  // Extract text content from remaining HTML
  content = content
    .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&[a-z]+;/gi, ' ') // Replace HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return content;
}

// Create a simple hash from text content for exact duplicate detection
async function createContentHash(content: string): Promise<string> {
  // Normalize content for consistent hashing
  const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();

  // Use browser's crypto API for hashing (SHA-256)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback to simple hash
      return simpleHash(normalized);
    }
  }

  // Fallback for non-browser environments
  return simpleHash(normalized);
}

// Simple hash function fallback
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
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
  isRedirect?: boolean; // True if this URL redirected to another URL
  originalUrl?: string; // Original URL before redirect (if redirected)
  finalUrl?: string; // Final URL after redirect (if redirected)
  redirectStatusCode?: number; // 301, 302, 307, or 308
  description?: string; // Actual meta description text for duplicate detection
  h1?: string; // Actual H1 text for duplicate detection
  bodyContent?: string; // Extracted main content for similarity detection
  contentHash?: string; // Hash of body content for exact duplicate detection
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
  private maxPages = 999999; // Effectively unlimited for crawling (sitemap parsing already has no limit)
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

      // CRITICAL: Also check internal links from sitemap pages to find broken links
      // Sitemaps don't include 404s, but pages in the sitemap may link to broken pages
      console.log(`🔍 Checking internal links from sitemap pages for 4XX/5XX errors...`);
      const allInternalLinks = await this.collectInternalLinksFromSitemapPages(sitemapResult.pages, domain);

      // Find links not in sitemap
      const sitemapUrls = new Set(sitemapResult.pages.map(p => p.url));
      const uncheckedLinks = Array.from(allInternalLinks).filter(link => !sitemapUrls.has(link));

      console.log(`   Found ${uncheckedLinks.length} internal links not in sitemap to check`);

      // Check status of links not in sitemap (they might be broken)
      const additionalPages = await this.checkLinksForErrors(uncheckedLinks);
      console.log(`   Found ${additionalPages.length} pages with 4XX/5XX errors`);

      const allPages = [...sitemapResult.pages, ...additionalPages];

      return {
        totalPages: allPages.length,
        pages: allPages,
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
      } catch (error) {
        console.log(`Could not parse sitemap ${sitemapUrl}:`, (error as Error).message);
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
      } catch (error) {
        console.log(`Could not fetch sitemap ${sitemapUrl}:`, (error as Error).message);
      }
    }

    console.log(`✅ Total pages discovered from all sitemaps: ${allPages.length}`);
    return allPages; // Return all pages, no limit
  }

  private async parseSitemapUrls(xml: string, sitemapUrl: string): Promise<DiscoveredPage[]> {
    const urlPattern = /<url>([\s\S]*?)<\/url>/g;
    const pages: DiscoveredPage[] = [];
    let match;
    let parsedCount = 0;
    let skippedCount = 0;

    // Remove limit - parse all URLs from sitemap (not just first 50)
    while ((match = urlPattern.exec(xml)) !== null) {
      parsedCount++;

      // CRITICAL FIX: Wrap each page processing in try-catch
      // If any single page fails, continue with the next URLs
      try {
        const urlBlock = match[1];

        const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
        if (!locMatch) {
          skippedCount++;
          continue;
        }

        let pageUrl = locMatch[1].trim();

        // Normalize and validate the URL from sitemap
        try {
          // Fix malformed URLs like "http:/example.com" (missing one slash)
          // by validating through URL constructor
          const urlObj = new URL(pageUrl);

          // Additional validation: ensure URL has a valid hostname
          if (!urlObj.hostname || urlObj.hostname.length === 0) {
            console.log(`Invalid URL in sitemap (no hostname): ${pageUrl}`);
            skippedCount++;
            continue; // Skip URLs without hostnames
          }

          pageUrl = urlObj.href; // Use normalized version
        } catch {
          console.log(`Invalid URL in sitemap: ${pageUrl}`);
          skippedCount++;
          continue; // Skip invalid URLs
        }

        if (this.visitedUrls.has(pageUrl)) {
          skippedCount++;
          continue;
        }
        this.visitedUrls.add(pageUrl);

        // Extract optional sitemap data
        const lastModMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
        const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);
        const changeFreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);

        // Analyze the page (may throw exception if fetch fails)
        const pageAnalysis = await this.analyzePage(pageUrl);

        // Log if non-200 status code detected
        if (pageAnalysis.statusCode !== 200) {
          console.log(`⚠️  Status ${pageAnalysis.statusCode} - ${pageUrl}`);
        }

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
          linkCount: pageAnalysis.linkCount,
          finalUrl: pageAnalysis.finalUrl, // Include redirect destination
          description: pageAnalysis.description, // Include meta description for duplicate detection
          h1: pageAnalysis.h1, // Include H1 for duplicate detection
          bodyContent: pageAnalysis.bodyContent, // Include body content for similarity detection
          contentHash: pageAnalysis.contentHash // Include content hash for exact duplicate detection
        });
      } catch (pageError) {
        // Log the error but continue parsing remaining URLs
        console.log(`⚠️  Failed to analyze page from sitemap (continuing with others):`, pageError.message);
        skippedCount++;
        continue;
      }
    }

    console.log(`📊 Parsed ${pages.length} URLs from sitemap (${parsedCount} total, ${skippedCount} skipped/failed)`);
    return pages;
  }

  private async intelligentCrawl(startUrl: string): Promise<{pages: DiscoveredPage[], depth: number}> {
    const url = new URL(startUrl);
    const domain = url.hostname;
    const pagesToCrawl = [startUrl];
    const foundPages: DiscoveredPage[] = [];
    const allDiscoveredLinks = new Set<string>(); // Track ALL links we find
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

        // CRITICAL FIX: Add ALL pages to results, not just 200s
        // This ensures we capture 4XX/5XX errors during crawling
        foundPages.push({
          url: currentUrl,
          title: pageAnalysis.title,
          statusCode: pageAnalysis.statusCode,
          source: currentDepth === 0 ? 'navigation' : 'crawl',
          hasTitle: pageAnalysis.hasTitle,
          hasDescription: pageAnalysis.hasDescription,
          hasH1: pageAnalysis.hasH1,
          imageCount: pageAnalysis.imageCount,
          linkCount: pageAnalysis.linkCount,
          finalUrl: pageAnalysis.finalUrl, // Include redirect destination
          description: pageAnalysis.description, // Include meta description for duplicate detection
          h1: pageAnalysis.h1, // Include H1 for duplicate detection
          bodyContent: pageAnalysis.bodyContent, // Include body content for similarity detection
          contentHash: pageAnalysis.contentHash // Include content hash for exact duplicate detection
        });

        // Log non-200 status codes
        if (pageAnalysis.statusCode !== 200) {
          console.log(`⚠️  HTTP ${pageAnalysis.statusCode} detected during crawl: ${currentUrl}`);
        }

        // Only continue crawling from successful pages
        if (pageAnalysis.statusCode === 200) {
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

          // Add all discovered links to our set (even if we won't crawl them all)
          pageAnalysis.internalLinks.forEach(link => {
            try {
              const linkUrl = new URL(link);
              if (linkUrl.hostname === domain) {
                allDiscoveredLinks.add(link);
              }
            } catch {
              // Invalid URL, skip
            }
          });

          pagesToCrawl.push(...newLinks);
        }
      } catch (error) {
        console.log(`Could not crawl ${currentUrl}:`, (error as Error).message);
      }

      // Move to next depth level
      if (pagesToCrawl.length === 0) {
        currentDepth++;
      }
    }

    console.log(`🎯 Intelligent crawl found ${foundPages.length} pages at depth ${currentDepth}`);

    // CRITICAL: Check status of ALL discovered links that we didn't fully crawl
    // This catches 404s and other errors beyond the 50-page crawl limit
    const uncheckedLinks = Array.from(allDiscoveredLinks).filter(link => !this.visitedUrls.has(link));

    if (uncheckedLinks.length > 0) {
      console.log(`🔍 Checking status of ${uncheckedLinks.length} additional discovered links for 4XX/5XX errors...`);

      // Check links in batches to avoid overwhelming the server
      const batchSize = 10;
      for (let i = 0; i < uncheckedLinks.length && i < 200; i += batchSize) {
        const batch = uncheckedLinks.slice(i, i + batchSize);
        const statusChecks = await Promise.allSettled(
          batch.map(link => this.checkLinkStatus(link))
        );

        statusChecks.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            const statusInfo = result.value;
            // Only add pages with errors (4XX/5XX) or important redirects
            if (statusInfo.statusCode >= 400) {
              console.log(`   ⚠️  Found ${statusInfo.statusCode} error: ${statusInfo.url}`);
              foundPages.push({
                url: statusInfo.url,
                title: `HTTP ${statusInfo.statusCode} Error`,
                statusCode: statusInfo.statusCode,
                source: 'crawl',
                hasTitle: false,
                hasDescription: false,
                hasH1: false,
                imageCount: 0,
                linkCount: 0,
                description: undefined,
                h1: undefined
              });
            }
          }
        });
      }
    }

    console.log(`✅ Total pages found (including status checks): ${foundPages.length}`);
    return { pages: foundPages, depth: currentDepth };
  }

  /**
   * Collect all internal links from ALL sitemap pages (in parallel for speed)
   * Used to find broken links that aren't in the sitemap
   */
  private async collectInternalLinksFromSitemapPages(
    sitemapPages: DiscoveredPage[],
    domain: string
  ): Promise<Set<string>> {
    const allLinks = new Set<string>();

    console.log(`   Extracting links from ${sitemapPages.length} sitemap pages in parallel...`);

    // Process pages in parallel batches for much faster performance
    const batchSize = 10; // Process 10 pages at a time
    let processedCount = 0;

    for (let i = 0; i < sitemapPages.length; i += batchSize) {
      const batch = sitemapPages.slice(i, i + batchSize);

      // Fetch all pages in batch in parallel
      const results = await Promise.allSettled(
        batch.map(async (page) => {
          try {
            const response = await fetch(page.url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
              signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) return [];

            const html = await response.text();
            const links: string[] = [];

            // Extract internal links
            const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
            let linkMatch;

            while ((linkMatch = linkRegex.exec(html)) !== null) {
              const href = linkMatch[1];
              if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                continue;
              }

              try {
                const baseUrl = new URL(page.url);
                let linkUrl: string;

                if (href.startsWith('http://') || href.startsWith('https://')) {
                  linkUrl = new URL(href).href;
                } else {
                  linkUrl = new URL(href, baseUrl).href;
                }

                const linkDomain = new URL(linkUrl).hostname;
                if (linkDomain === domain) {
                  links.push(linkUrl);
                }
              } catch {
                // Invalid URL, skip
              }
            }

            return links;
          } catch (error) {
            // Failed to fetch page
            return [];
          }
        })
      );

      // Collect all links from successful fetches
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          result.value.forEach(link => allLinks.add(link));
        }
      });

      processedCount += batch.length;
      console.log(`   Processed ${processedCount}/${sitemapPages.length} pages, found ${allLinks.size} unique links so far`);
    }

    console.log(`   ✅ Extracted ${allLinks.size} unique internal links from ${sitemapPages.length} pages`);
    return allLinks;
  }

  /**
   * Check a list of URLs for 4XX/5XX errors
   * Returns pages with error status codes
   */
  private async checkLinksForErrors(urls: string[]): Promise<DiscoveredPage[]> {
    const errorPages: DiscoveredPage[] = [];

    // Check in batches to avoid overwhelming the server
    const batchSize = 10;
    const maxToCheck = 1000; // Check up to 1000 additional links (increased from 200)

    for (let i = 0; i < urls.length && i < maxToCheck; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const statusChecks = await Promise.allSettled(
        batch.map(url => this.checkLinkStatus(url))
      );

      statusChecks.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const statusInfo = result.value;
          // Only add pages with errors (4XX/5XX)
          if (statusInfo.statusCode >= 400) {
            console.log(`   ⚠️  Found ${statusInfo.statusCode} error: ${statusInfo.url}`);
            errorPages.push({
              url: statusInfo.url,
              title: `HTTP ${statusInfo.statusCode} Error`,
              statusCode: statusInfo.statusCode,
              source: 'sitemap',
              hasTitle: false,
              hasDescription: false,
              hasH1: false,
              imageCount: 0,
              linkCount: 0,
              description: undefined,
              h1: undefined,
              bodyContent: undefined,
              contentHash: undefined
            });
          }
        }
      });
    }

    return errorPages;
  }

  /**
   * Lightweight status check for a URL without fetching full content
   * Used to check many links quickly for 4XX/5XX errors
   */
  private async checkLinkStatus(url: string): Promise<{url: string; statusCode: number} | null> {
    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD for faster checks
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
        redirect: 'manual',
        signal: AbortSignal.timeout(5000) // Shorter timeout for quick checks
      });

      return {
        url,
        statusCode: response.status
      };
    } catch (error) {
      // If HEAD fails, try GET with redirect: manual
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
          redirect: 'manual',
          signal: AbortSignal.timeout(5000)
        });

        return {
          url,
          statusCode: response.status
        };
      } catch {
        // Network error or timeout - don't report as it might be temporary
        return null;
      }
    }
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
    finalUrl?: string; // For tracking redirect destinations
    description?: string; // Actual meta description text for duplicate detection
    h1?: string; // Actual H1 text for duplicate detection
    bodyContent?: string; // Extracted main content for similarity detection
    contentHash?: string; // Hash of body content for exact duplicate detection
  }> {
    try {
      let html: string;
      let statusCode: number = 200;
      let finalUrl: string | undefined = undefined; // Track redirect destination

      if (useBrowser) {
        // Use Puppeteer to get fully rendered HTML (handles client-side rendered content)
        try {
          console.log(`🌐 Using browser rendering for: ${url}`);
          const browserResult = await BrowserService.withBrowser(async (browser, page) => {
            const response = await BrowserService.goto(page, url);

            // Capture HTTP status code from navigation response
            if (response) {
              statusCode = response.status();
            }

            // Wait a moment for JavaScript to execute
            await new Promise(resolve => setTimeout(resolve, 1000));

            const renderedHtml = await page.content();
            return renderedHtml;
          });

          html = browserResult;
        } catch (browserError) {
          console.warn('Browser rendering failed, falling back to fetch:', browserError);

          // IMPROVED STATUS CODE DETECTION for browser fallback
          const initialResponse = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
            redirect: 'manual', // Don't follow redirects - capture original status
            signal: AbortSignal.timeout(this.timeout)
          });

          statusCode = initialResponse.status;

          // If it's a 4XX or 5XX error, report it immediately
          if (statusCode >= 400) {
            console.log(`⚠️  HTTP ${statusCode} error detected for: ${url}`);
            return {
              title: `HTTP ${statusCode} Error`,
              statusCode: statusCode,
              hasTitle: false,
              hasDescription: false,
              hasH1: false,
              imageCount: 0,
              linkCount: 0,
              internalLinks: [],
              description: undefined,
              h1: undefined,
              bodyContent: undefined,
              contentHash: undefined
            };
          }

          // If it's a redirect (3XX), follow it to get the final content
          if (statusCode >= 300 && statusCode < 400) {
            const location = initialResponse.headers.get('location');
            if (location) {
              // Resolve relative redirect URLs
              const redirectUrl = location.startsWith('http') ? location : new URL(location, url).href;

              const redirectResponse = await fetch(redirectUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
                redirect: 'follow',
                signal: AbortSignal.timeout(this.timeout)
              });
              html = await redirectResponse.text();

              // For 301/308 permanent redirects, we want to track the destination
              if (statusCode === 301 || statusCode === 308) {
                console.log(`🔄 Permanent redirect (${statusCode}): ${url} → ${redirectUrl}`);
                finalUrl = redirectUrl; // Store redirect destination
              }
            } else {
              return {
                title: 'Redirect without location',
                statusCode: statusCode,
                hasTitle: false,
                hasDescription: false,
                hasH1: false,
                imageCount: 0,
                linkCount: 0,
                internalLinks: [],
                description: undefined,
                h1: undefined
              };
            }
          } else {
            // Status is 2XX, get the content normally
            html = await initialResponse.text();
          }
        }
      } else {
        // IMPROVED STATUS CODE DETECTION
        // First fetch with redirect: 'manual' to capture the original status code
        // This ensures we detect 4XX/5XX errors even if they later redirect
        const initialResponse = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
          redirect: 'manual', // Don't follow redirects - capture original status
          signal: AbortSignal.timeout(this.timeout)
        });

        statusCode = initialResponse.status;

        // If it's a 4XX or 5XX error, report it immediately
        if (statusCode >= 400) {
          console.log(`⚠️  HTTP ${statusCode} error detected for: ${url}`);
          return {
            title: `HTTP ${statusCode} Error`,
            statusCode: statusCode,
            hasTitle: false,
            hasDescription: false,
            hasH1: false,
            imageCount: 0,
            linkCount: 0,
            internalLinks: [],
            description: undefined,
            h1: undefined
          };
        }

        // If it's a redirect (3XX), follow it to get the final content
        if (statusCode >= 300 && statusCode < 400) {
          const location = initialResponse.headers.get('location');
          if (location) {
            // Resolve relative redirect URLs
            const redirectUrl = location.startsWith('http') ? location : new URL(location, url).href;

            // Fetch the redirected location
            const redirectResponse = await fetch(redirectUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
              redirect: 'follow',
              signal: AbortSignal.timeout(this.timeout)
            });

            // Keep the original status code (3XX), but get content from redirect
            html = await redirectResponse.text();

            // For 301/308 permanent redirects, we want to track the destination
            if (statusCode === 301 || statusCode === 308) {
              console.log(`🔄 Permanent redirect (${statusCode}): ${url} → ${redirectUrl}`);
              finalUrl = redirectUrl; // Store redirect destination
            }
          } else {
            // No location header, treat as error
            return {
              title: 'Redirect without location',
              statusCode: statusCode,
              hasTitle: false,
              hasDescription: false,
              hasH1: false,
              imageCount: 0,
              linkCount: 0,
              internalLinks: [],
              description: undefined,
              h1: undefined,
              bodyContent: undefined,
              contentHash: undefined
            };
          }
        } else {
          // Status is 2XX, get the content normally
          html = await initialResponse.text();
        }
      }
      const baseUrl = new URL(url);

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No title';

      // Extract meta description and H1 for duplicate detection
      const description = extractMetaDescription(html);
      const h1 = extractH1(html);

      // Extract body content and create hash for duplicate content detection
      const bodyContent = extractBodyContent(html);
      const contentHash = await createContentHash(bodyContent);

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

      // Debug logging for metadata detection issues
      if (!hasTitle || !hasDescription || !hasH1) {
        console.log(`⚠️  Metadata issues for ${url}:`);
        console.log(`   - Has title tag: ${hasTitle}`);
        console.log(`   - Has meta description: ${hasDescription}`);
        console.log(`   - Has H1 tag: ${hasH1}`);
        console.log(`   - HTML length: ${html.length} characters`);

        // Show snippet of HTML for debugging
        const htmlSnippet = html.substring(0, 500);
        console.log(`   - HTML snippet: ${htmlSnippet.substring(0, 200)}...`);
      }

      return {
        title,
        statusCode, // Use the local statusCode variable, not response.status
        hasTitle,
        hasDescription,
        hasH1,
        imageCount,
        linkCount: internalLinks.length,
        internalLinks: [...new Set(internalLinks)], // Remove duplicates
        finalUrl, // Include redirect destination for 301/308 redirects
        description, // Include meta description for duplicate detection
        h1, // Include H1 for duplicate detection
        bodyContent, // Include body content for similarity detection
        contentHash // Include content hash for exact duplicate detection
      };

    } catch (error) {
      console.log(`Error analyzing page ${url}:`, (error as Error).message);
      return {
        title: 'Error loading page',
        statusCode: 0,
        hasTitle: false,
        hasDescription: false,
        hasH1: false,
        imageCount: 0,
        linkCount: 0,
        internalLinks: [],
        description: undefined,
        h1: undefined,
        bodyContent: undefined,
        contentHash: undefined
      };
    }
  }
}

export async function discoverRealPages(baseUrl: string): Promise<PageDiscoveryResult> {
  const discovery = new RealPageDiscovery();
  return await discovery.discoverPages(baseUrl);
}