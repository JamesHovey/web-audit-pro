interface DiscoveredPage {
  url: string;
  title: string;
  description?: string;
  lastModified?: string;
  source: 'sitemap' | 'internal-link' | 'homepage';
}

interface PageDiscoveryResult {
  pages: DiscoveredPage[];
  totalFound: number;
  sources: {
    sitemap: number;
    internalLinks: number;
    homepage: number;
  };
}

// Discover pages from multiple sources with deep crawling
export async function discoverPages(baseUrl: string, maxPages: number = 100): Promise<PageDiscoveryResult> {
  // Ensure URL has protocol
  let normalizedBaseUrl = baseUrl;
  if (!normalizedBaseUrl.startsWith('http://') && !normalizedBaseUrl.startsWith('https://')) {
    normalizedBaseUrl = `https://${normalizedBaseUrl}`;
  }

  // Remove trailing slash and validate
  const cleanUrl = normalizedBaseUrl.replace(/\/$/, '');
  const baseUrlObj = new URL(cleanUrl);
  const domain = baseUrlObj.hostname;
  
  console.log(`\n=== ENHANCED PAGE DISCOVERY FOR ${domain} ===`);
  console.log(`Target: ${maxPages} pages maximum`);
  
  const discoveredPages = new Map<string, DiscoveredPage>();
  const sources = { sitemap: 0, internalLinks: 0, homepage: 0 };
  
  // Helper function to normalize URLs for deduplication
  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Remove www and trailing slash for comparison
      const normalizedHostname = urlObj.hostname.replace(/^www\./, '');
      const normalizedPathname = urlObj.pathname.replace(/\/$/, '') || '/';
      return `${urlObj.protocol}//${normalizedHostname}${normalizedPathname}`;
    } catch {
      return url.replace(/\/$/, '');
    }
  };
  
  try {
    // 1. Always include the homepage first
    const normalizedHomepage = normalizeUrl(cleanUrl);
    discoveredPages.set(normalizedHomepage, {
      url: cleanUrl,
      title: `Homepage - ${domain}`,
      source: 'homepage'
    });
    sources.homepage++;
    
    // 2. Try comprehensive sitemap discovery
    console.log('Step 1: Comprehensive sitemap analysis...');
    const sitemapPages = await discoverFromSitemap(cleanUrl);
    console.log(`📊 discoverFromSitemap returned ${sitemapPages.length} total pages`);
    sitemapPages.forEach(page => {
      const normalizedUrl = normalizeUrl(page.url);
      if (discoveredPages.size < maxPages && !discoveredPages.has(normalizedUrl)) {
        discoveredPages.set(normalizedUrl, page);
        sources.sitemap++;
      }
    });
    console.log(`✅ Added ${sources.sitemap} sitemap pages to discovered set (${discoveredPages.size} total)`);
    
    // 3. Multi-level crawling of internal links
    console.log('Step 2: Multi-level internal link discovery...');
    const crawledPages = await crawlInternalLinks(cleanUrl, maxPages - discoveredPages.size, discoveredPages);
    crawledPages.forEach(page => {
      const normalizedUrl = normalizeUrl(page.url);
      if (discoveredPages.size < maxPages && !discoveredPages.has(normalizedUrl)) {
        discoveredPages.set(normalizedUrl, page);
        sources.internalLinks++;
      }
    });
    console.log(`Found ${crawledPages.length} additional pages from crawling`);
    
    // 4. Check for common page patterns and structures
    console.log('Step 3: Checking common page patterns...');
    const patternPages = await discoverCommonPatterns(cleanUrl, discoveredPages);
    patternPages.forEach(page => {
      const normalizedUrl = normalizeUrl(page.url);
      if (discoveredPages.size < maxPages && !discoveredPages.has(normalizedUrl)) {
        discoveredPages.set(normalizedUrl, page);
        sources.internalLinks++;
      }
    });
    console.log(`Found ${patternPages.length} pages from common patterns`);
    
  } catch (error) {
    console.error('Page discovery error:', error);
    // Ensure homepage is always included
    const normalizedHomepage = normalizeUrl(cleanUrl);
    if (!discoveredPages.has(normalizedHomepage)) {
      discoveredPages.set(normalizedHomepage, {
        url: cleanUrl,
        title: `Homepage - ${domain}`,
        source: 'homepage'
      });
      sources.homepage = 1;
    }
  }
  
  console.log(`📦 Total discovered before slicing: ${discoveredPages.size} pages (maxPages: ${maxPages})`);
  const pages = Array.from(discoveredPages.values())
    .slice(0, maxPages)
    .sort((a, b) => {
      // Prioritize homepage, then sitemap, then internal links
      const priority = { homepage: 0, sitemap: 1, 'internal-link': 2 };
      return priority[a.source] - priority[b.source];
    });

  console.log(`✓ Discovery complete: ${pages.length} pages found`);
  console.log('Sources:', sources);
  
  return {
    pages,
    totalFound: pages.length,
    sources
  };
}

async function discoverFromSitemap(baseUrl: string): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/wp-sitemap.xml`, // WordPress
    `${baseUrl}/sitemap/sitemap.xml`,
    `${baseUrl}/sitemapindex.xml`,
    `${baseUrl}/sitemap-index.xml`,
    `${baseUrl}/wp-sitemap-posts-post-1.xml`, // WordPress posts
    `${baseUrl}/wp-sitemap-pages-1.xml` // WordPress pages
  ];
  
  const foundSitemaps = new Set<string>();
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) continue;
      
      const content = await response.text();
      console.log(`✓ Found sitemap: ${sitemapUrl}`);
      
      // Check if this is a sitemap index file
      if (content.includes('<sitemapindex') || content.includes('<sitemap>')) {
        console.log(`  Processing sitemap index: ${sitemapUrl}`);
        // Parse sitemap index to find individual sitemaps
        const sitemapMatches = content.match(/<loc>(.*?)<\/loc>/g);
        if (sitemapMatches) {
          console.log(`  Found ${sitemapMatches.length} child sitemaps`);
          for (const match of sitemapMatches) {
            const childSitemapUrl = match.replace(/<\/?loc>/g, '').trim();
            if (!foundSitemaps.has(childSitemapUrl) && childSitemapUrl.includes('.xml')) {
              foundSitemaps.add(childSitemapUrl);
              try {
                console.log(`  Fetching child sitemap: ${childSitemapUrl}`);
                const childPages = await parseSingleSitemap(childSitemapUrl, baseUrl);
                pages.push(...childPages);
                console.log(`  Child sitemap yielded ${childPages.length} pages`);

                // Check for paginated sitemaps (WordPress core & SEO plugin formats)
                // WordPress core: wp-sitemap-posts-post-1.xml -> wp-sitemap-posts-post-2.xml
                // SEOPress/Yoast: post-sitemap1.xml -> post-sitemap2.xml
                const wpCoreMatch = childSitemapUrl.match(/wp-sitemap-.*-(\d+)\.xml$/);
                const seoPluginMatch = childSitemapUrl.match(/(.*-sitemap)(\d+)\.xml$/);

                if (wpCoreMatch || seoPluginMatch) {
                  let baseSitemapUrl: string;
                  let firstPage: number;

                  if (seoPluginMatch) {
                    // SEO plugin format (SEOPress, Yoast, etc.): post-sitemap1.xml
                    baseSitemapUrl = seoPluginMatch[1]; // "post-sitemap"
                    firstPage = parseInt(seoPluginMatch[2]); // "1"
                  } else {
                    // WordPress core format: wp-sitemap-posts-post-1.xml
                    baseSitemapUrl = childSitemapUrl.replace(/-(\d+)\.xml$/, '');
                    firstPage = parseInt(wpCoreMatch![1]);
                  }

                  // Check for additional pages (up to 10 pages = 500 URLs)
                  for (let pageNum = firstPage + 1; pageNum <= firstPage + 10; pageNum++) {
                    // Build URL based on format
                    const paginatedUrl = seoPluginMatch
                      ? `${baseSitemapUrl}${pageNum}.xml` // SEOPress/Yoast: post-sitemap2.xml
                      : `${baseSitemapUrl}-${pageNum}.xml`; // WordPress core: wp-sitemap-posts-post-2.xml

                    if (foundSitemaps.has(paginatedUrl)) continue;

                    try {
                      console.log(`  Checking paginated sitemap: ${paginatedUrl}`);
                      const paginatedPages = await parseSingleSitemap(paginatedUrl, baseUrl);
                      if (paginatedPages.length === 0) break; // No more pages

                      foundSitemaps.add(paginatedUrl);
                      pages.push(...paginatedPages);
                      console.log(`  Paginated sitemap yielded ${paginatedPages.length} pages`);
                    } catch {
                      console.log(`  No more paginated sitemaps at page ${pageNum}`);
                      break; // Stop checking if we get an error (404)
                    }
                  }
                }
              } catch (error) {
                console.log(`Could not fetch child sitemap: ${childSitemapUrl}`);
              }
            }
          }
        }
      } else {
        // Parse individual sitemap
        console.log(`  Processing individual sitemap: ${sitemapUrl}`);
        const sitemapPages = await parseSingleSitemap(sitemapUrl, baseUrl, content);
        pages.push(...sitemapPages);
        console.log(`  Individual sitemap yielded ${sitemapPages.length} pages`);
      }
      
    } catch (error) {
      console.log(`Could not fetch sitemap: ${sitemapUrl}`);
      continue;
    }
  }
  
  // Remove duplicates and limit results
  console.log(`📋 Total pages collected from all sitemaps before deduplication: ${pages.length}`);
  const uniquePages = new Map<string, DiscoveredPage>();
  pages.forEach(page => {
    if (!uniquePages.has(page.url)) {
      uniquePages.set(page.url, page);
    }
  });

  console.log(`🔍 Unique pages after deduplication: ${uniquePages.size}`);
  return Array.from(uniquePages.values()); // No limit - return all discovered pages
}

async function parseSingleSitemap(sitemapUrl: string, baseUrl: string, content?: string): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];
  
  try {
    let sitemapContent = content;
    if (!sitemapContent) {
      const response = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) return pages;
      sitemapContent = await response.text();
    }
    
    // Enhanced XML sitemap parsing with multiple fallbacks
    console.log(`    Parsing XML content, length: ${sitemapContent.length}`);
    
    // Method 1: Try full <url> block parsing
    const urlMatches = sitemapContent.match(/<url>[\s\S]*?<\/url>/g);
    if (urlMatches && urlMatches.length > 0) {
      console.log(`    Found ${urlMatches.length} URL blocks`);
      urlMatches.forEach(urlBlock => {
        const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
        if (locMatch) {
          let url = locMatch[1].trim();

          // Skip malformed URLs where another URL was concatenated into the path
          if (url.includes('/http:') || url.includes('/https:')) {
            console.log(`    Skipping malformed URL (concatenated): ${url}`);
            return;
          }

          // Normalize URL using URL constructor to fix malformed URLs
          try {
            const urlObj = new URL(url);

            // Additional check: pathname shouldn't contain protocol strings
            if (urlObj.pathname.includes('http:') || urlObj.pathname.includes('https:')) {
              console.log(`    Skipping URL with protocol in pathname: ${url}`);
              return;
            }

            url = urlObj.href; // Use normalized URL
          } catch (e) {
            console.log(`    Invalid URL in sitemap: ${url}`);
            return; // Skip invalid URLs
          }

          if (isValidPageUrl(url, baseUrl)) {
            // Extract last modified date if available
            const lastModMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);

            pages.push({
              url,
              title: getPageTitleFromUrl(url),
              lastModified: lastModMatch ? lastModMatch[1] : undefined,
              source: 'sitemap'
            });
          }
        }
      });
    } else {
      // Method 2: Simple <loc> parsing
      console.log(`    No URL blocks found, trying simple <loc> parsing`);
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (locMatches && locMatches.length > 0) {
        console.log(`    Found ${locMatches.length} <loc> tags`);
        locMatches.forEach(match => {
          let url = match.replace(/<\/?loc>/g, '').trim();

          // Skip malformed URLs where another URL was concatenated into the path
          if (url.includes('/http:') || url.includes('/https:')) {
            console.log(`    Skipping malformed URL (concatenated): ${url}`);
            return;
          }

          // Normalize URL using URL constructor to fix malformed URLs
          try {
            const urlObj = new URL(url);

            // Additional check: pathname shouldn't contain protocol strings
            if (urlObj.pathname.includes('http:') || urlObj.pathname.includes('https:')) {
              console.log(`    Skipping URL with protocol in pathname: ${url}`);
              return;
            }

            url = urlObj.href; // Use normalized URL
          } catch (e) {
            console.log(`    Invalid URL in sitemap: ${url}`);
            return; // Skip invalid URLs
          }

          if (isValidPageUrl(url, baseUrl)) {
            pages.push({
              url,
              title: getPageTitleFromUrl(url),
              source: 'sitemap'
            });
          }
        });
      } else {
        // Method 3: Alternative XML patterns
        console.log(`    No <loc> tags found, trying alternative patterns`);
        // Try CDATA sections
        const cdataMatches = sitemapContent.match(/<!\[CDATA\[(.*?)\]\]>/g);
        if (cdataMatches) {
          console.log(`    Found ${cdataMatches.length} CDATA sections`);
          cdataMatches.forEach(match => {
            let url = match.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

            if (!url.startsWith('http')) return; // Skip non-HTTP URLs

            // Skip malformed URLs where another URL was concatenated into the path
            if (url.includes('/http:') || url.includes('/https:')) {
              console.log(`    Skipping malformed URL (concatenated): ${url}`);
              return;
            }

            // Normalize URL using URL constructor to fix malformed URLs
            try {
              const urlObj = new URL(url);

              // Additional check: pathname shouldn't contain protocol strings
              if (urlObj.pathname.includes('http:') || urlObj.pathname.includes('https:')) {
                console.log(`    Skipping URL with protocol in pathname: ${url}`);
                return;
              }

              url = urlObj.href; // Use normalized URL
            } catch (e) {
              console.log(`    Invalid URL in CDATA: ${url}`);
              return; // Skip invalid URLs
            }

            if (isValidPageUrl(url, baseUrl)) {
              pages.push({
                url,
                title: getPageTitleFromUrl(url),
                source: 'sitemap'
              });
            }
          });
        }
      }
    }
    
    console.log(`    Extracted ${pages.length} valid URLs from sitemap`);
    
    // Debug: Show first few URLs found
    if (pages.length > 0) {
      console.log(`    Sample URLs: ${pages.slice(0, 3).map(p => p.url).join(', ')}`);
    }
  } catch (error) {
    console.log(`Error parsing sitemap ${sitemapUrl}:`, error);
  }
  
  return pages;
}

async function discoverFromHomepage(baseUrl: string): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];
  
  try {
    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return pages;
    
    const html = await response.text();
    
    // Extract internal links
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi);
    if (!linkMatches) return pages;
    
    const uniqueUrls = new Set<string>();
    
    linkMatches.forEach(match => {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      const textMatch = match.match(/>([^<]+)</);

      if (!hrefMatch) return;

      let href = hrefMatch[1].trim();
      const linkText = textMatch ? textMatch[1].trim() : '';

      // Skip anchor links, mailto, tel
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Convert relative URLs to absolute using URL constructor
      let url: string;
      try {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          // Already absolute URL
          url = new URL(href).href;
        } else {
          // Relative URL - use URL constructor to resolve against base
          url = new URL(href, baseUrl).href;
        }
      } catch {
        // Invalid URL, skip
        return;
      }

      if (isValidPageUrl(url, baseUrl) && !uniqueUrls.has(url)) {
        uniqueUrls.add(url);
        pages.push({
          url,
          title: linkText || getPageTitleFromUrl(url),
          source: 'internal-link'
        });
      }
    });
    
    // Also look for common page patterns
    const commonPaths = [
      '/about', '/about-us', '/about-me',
      '/services', '/products', '/solutions',
      '/contact', '/contact-us',
      '/blog', '/news', '/articles',
      '/portfolio', '/work', '/projects',
      '/team', '/staff',
      '/privacy', '/privacy-policy',
      '/terms', '/terms-of-service'
    ];
    
    for (const path of commonPaths) {
      const url = baseUrl + path;
      if (!uniqueUrls.has(url)) {
        // Quick check if page exists
        try {
          const testResponse = await fetch(url, { 
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(3000)
          });
          if (testResponse.ok) {
            uniqueUrls.add(url);
            pages.push({
              url,
              title: getPageTitleFromUrl(url),
              source: 'internal-link'
            });
          }
        } catch {
          // Page doesn't exist, skip
        }
      }
    }
    
  } catch (error) {
    console.log('Could not analyze homepage for links:', error);
  }
  
  return pages.slice(0, 20); // Limit homepage results
}

function isValidPageUrl(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    
    // Handle domain canonicalization (www vs non-www)
    const normalizeHostname = (hostname: string) => hostname.replace(/^www\./, '');
    const urlHostname = normalizeHostname(urlObj.hostname);
    const baseHostname = normalizeHostname(baseObj.hostname);
    
    // Must be same domain (allowing www/non-www variations)
    if (urlHostname !== baseHostname) return false;
    
    // Skip common non-page URLs (but be conservative to match SEMrush)
    const skipPatterns = [
      /\.(pdf|jpg|jpeg|png|gif|svg|css|js|ico|xml|txt|zip|exe|dmg)$/i,
      /\/wp-admin\//,
      /\/wp-content\/uploads\//,
      /\/admin\//,
      /\/api\//,
      /\/feed\/?$/,
      /\?.*attachment_id=/,
      /#.+$/ // Only skip URLs with fragments, not just #
    ];

    return !skipPatterns.some(pattern => pattern.test(url));
    
  } catch {
    return false;
  }
}

function getPageTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length === 0) return 'Homepage';
    
    const lastSegment = segments[segments.length - 1];
    
    // Convert URL segment to readable title
    return lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\.(html?|php)$/i, '');
      
  } catch {
    return url;
  }
}

// Multi-level crawling of internal links
async function crawlInternalLinks(
  baseUrl: string, 
  remainingSlots: number, 
  alreadyFound: Map<string, DiscoveredPage>
): Promise<DiscoveredPage[]> {
  const newPages: DiscoveredPage[] = [];
  
  if (remainingSlots <= 0) return newPages;
  
  // Get key pages to crawl for more links
  const keyPagesToCrawl = [
    baseUrl,
    `${baseUrl}/services`,
    `${baseUrl}/services/`,
    `${baseUrl}/products`,
    `${baseUrl}/products/`,
    `${baseUrl}/blog`,
    `${baseUrl}/blog/`,
    `${baseUrl}/about`,
    `${baseUrl}/about/`,
    `${baseUrl}/team`,
    `${baseUrl}/team/`,
    `${baseUrl}/about/team`,
    `${baseUrl}/about/team/`,
    `${baseUrl}/sectors`,
    `${baseUrl}/sectors/`,
    `${baseUrl}/portfolio`,
    `${baseUrl}/work`
  ];
  
  const maxDepth = 5; // Increased from 2 to match SEMrush-style deep crawling
  const processedUrls = new Set<string>();

  for (let depth = 0; depth < maxDepth && newPages.length < remainingSlots; depth++) {
    console.log(`  Crawling depth ${depth + 1}/${maxDepth}...`);

    const urlsToProcess = depth === 0 ? keyPagesToCrawl :
      Array.from(alreadyFound.keys())
        .concat(newPages.map(p => p.url))
        .filter(url => !processedUrls.has(url))
        .slice(0, 50); // Increased from 10 to 50 URLs per depth for more thorough discovery

    console.log(`  Processing ${urlsToProcess.length} URLs at depth ${depth + 1}`);
    const depthStartCount = newPages.length;

    for (const pageUrl of urlsToProcess) {
      if (processedUrls.has(pageUrl) || newPages.length >= remainingSlots) continue;

      processedUrls.add(pageUrl);

      try {
        const pageLinks = await extractLinksFromPage(pageUrl, baseUrl);

        pageLinks.forEach(page => {
          if (newPages.length < remainingSlots &&
              !alreadyFound.has(page.url) &&
              !newPages.find(p => p.url === page.url)) {
            newPages.push(page);
          }
        });

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.log(`Could not crawl ${pageUrl}:`, error);
      }
    }

    const pagesFoundThisDepth = newPages.length - depthStartCount;
    console.log(`  ✓ Depth ${depth + 1} complete: found ${pagesFoundThisDepth} new pages (${newPages.length} total)`);
  }
  
  return newPages;
}

// Extract links from a specific page
async function extractLinksFromPage(pageUrl: string, baseUrl: string): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];
  
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });
    
    if (!response.ok) return pages;
    
    const html = await response.text();
    
    // Extract all internal links
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
    if (!linkMatches) return pages;
    
    const uniqueUrls = new Set<string>();
    
    linkMatches.forEach(match => {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) return;

      let href = hrefMatch[1].trim();

      // Skip anchor links, mailto, tel
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Convert relative URLs to absolute using URL constructor
      let url: string;
      try {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          // Already absolute URL
          url = new URL(href).href;
        } else {
          // Relative URL - use URL constructor to resolve against base
          url = new URL(href, baseUrl).href;
        }
      } catch {
        // Invalid URL, skip
        return;
      }

      if (isValidPageUrl(url, baseUrl) && !uniqueUrls.has(url)) {
        uniqueUrls.add(url);

        // Try to get a better title from the link text
        const linkTextMatch = match.match(/>([^<]+)</);
        const linkText = linkTextMatch ? linkTextMatch[1].trim() : '';

        pages.push({
          url,
          title: linkText && linkText.length > 2 && linkText.length < 100
            ? linkText
            : getPageTitleFromUrl(url),
          source: 'internal-link'
        });
      }
    });
    
  } catch (error) {
    console.log(`Error extracting links from ${pageUrl}:`, error);
  }
  
  return pages;
}

// Discover common page patterns and structures
async function discoverCommonPatterns(
  baseUrl: string, 
  alreadyFound: Map<string, DiscoveredPage>
): Promise<DiscoveredPage[]> {
  const pages: DiscoveredPage[] = [];
  
  // Extended list of common page patterns
  const patterns = [
    // Services
    '/services/seo', '/services/seo/', '/seo', '/seo-services',
    '/services/ppc', '/services/ppc/', '/ppc', '/google-ads', '/services/google-ads/',
    '/services/social-media', '/social-media-marketing', '/services/social-media-marketing',
    '/services/web-design', '/web-design', '/services/website-design',
    '/services/content-marketing', '/content-marketing',
    '/services/email-marketing', '/email-marketing',
    '/services/branding', '/branding',
    '/services/marketing-strategy', '/strategy',
    
    // Industries/Sectors
    '/sectors/', '/industries/', '/clients/',
    '/sectors/healthcare', '/sectors/finance', '/sectors/retail',
    '/sectors/technology', '/sectors/education',
    
    // Company
    '/about/', '/about-us/', '/team/', '/careers/', '/jobs/',
    '/contact/', '/contact-us/', '/get-quote/', '/quote/',
    
    // Resources
    '/blog/', '/news/', '/insights/', '/resources/',
    '/case-studies/', '/portfolio/', '/work/', '/projects/',
    '/testimonials/', '/reviews/', '/clients/',
    
    // Legal
    '/privacy/', '/privacy-policy/', '/terms/', '/terms-conditions/',
    '/cookie-policy/', '/gdpr/',
    
    // Specific to marketing agencies
    '/packages/', '/pricing/', '/plans/',
    '/free-audit/', '/consultation/', '/discovery-call/',
    '/roi-calculator/', '/tools/'
  ];
  
  const promises = patterns.slice(0, 30).map(async (pattern) => { // Limit concurrent requests
    const testUrl = baseUrl + pattern;
    
    if (alreadyFound.has(testUrl)) return null;
    
    try {
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return {
          url: testUrl,
          title: getPageTitleFromUrl(testUrl),
          source: 'internal-link' as const
        };
      }
    } catch {
      // Page doesn't exist or network error, ignore
    }
    
    return null;
  });
  
  const results = await Promise.allSettled(promises);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      pages.push(result.value);
    }
  });
  
  return pages;
}