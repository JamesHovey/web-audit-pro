// Real technical audit service that analyzes actual website data
interface TechnicalAuditResult {
  totalPages: number;
  largeImages: number;
  largeImageDetails: Array<{
    imageUrl: string;
    pageUrl: string;
    sizeKB: number;
  }>;
  issues: {
    missingMetaTitles: number;
    missingMetaDescriptions: number;
    missingH1Tags: number;
    httpErrors: number;
  };
  notFoundErrors: Array<{
    brokenUrl: string;
    sourceUrl: string;
    linkType: 'internal' | 'external';
  }>;
  sitemapStatus: 'found' | 'missing';
  robotsTxtStatus: 'found' | 'missing';
  httpsStatus: 'secure' | 'insecure';
}

export async function performTechnicalAudit(url: string): Promise<TechnicalAuditResult> {
  console.log(`🔧 Starting technical audit for ${url}`);
  
  // Normalize URL
  const baseUrl = new URL(url);
  const domain = baseUrl.hostname;
  
  // Initialize results
  const result: TechnicalAuditResult = {
    totalPages: 0,
    largeImages: 0,
    largeImageDetails: [],
    issues: {
      missingMetaTitles: 0,
      missingMetaDescriptions: 0,
      missingH1Tags: 0,
      httpErrors: 0,
    },
    notFoundErrors: [],
    sitemapStatus: 'missing',
    robotsTxtStatus: 'missing',
    httpsStatus: baseUrl.protocol === 'https:' ? 'secure' : 'insecure'
  };

  try {
    // 1. Fetch main page HTML
    const mainPageResponse = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    
    if (!mainPageResponse.ok) {
      console.error(`Failed to fetch main page: ${mainPageResponse.status}`);
      return result;
    }
    
    const html = await mainPageResponse.text();
    
    // 2. Analyze page structure
    const pageAnalysis = analyzePageStructure(html);
    if (!pageAnalysis.hasTitle) result.issues.missingMetaTitles++;
    if (!pageAnalysis.hasDescription) result.issues.missingMetaDescriptions++;
    if (!pageAnalysis.hasH1) result.issues.missingH1Tags++;
    
    // 3. Find and analyze all images
    const images = await findAndAnalyzeImages(html, url);
    result.largeImages = images.largeImages.length;
    result.largeImageDetails = images.largeImages;
    
    // 4. Find and check all links for 404s
    const links = findAllLinks(html, url);
    const brokenLinks = await checkLinksFor404s(links, url);
    result.notFoundErrors = brokenLinks;
    result.issues.httpErrors = brokenLinks.length;
    
    // 5. Check for sitemap
    result.sitemapStatus = await checkSitemap(baseUrl);
    
    // 6. Check for robots.txt
    result.robotsTxtStatus = await checkRobotsTxt(baseUrl);
    
    // 7. Estimate total pages (simplified - in production would crawl sitemap)
    result.totalPages = estimateTotalPages(html, links);
    
  } catch (error) {
    console.error('Technical audit error:', error);
  }
  
  console.log(`✅ Technical audit complete for ${url}`);
  console.log(`   - Large images found: ${result.largeImages}`);
  console.log(`   - 404 errors found: ${result.notFoundErrors.length}`);
  
  return result;
}

function analyzePageStructure(html: string) {
  return {
    hasTitle: /<title[^>]*>.*<\/title>/i.test(html),
    hasDescription: /<meta\s+name=["']description["'][^>]*>/i.test(html),
    hasH1: /<h1[^>]*>.*<\/h1>/i.test(html),
  };
}

async function findAndAnalyzeImages(html: string, pageUrl: string) {
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: Array<{ imageUrl: string; pageUrl: string; sizeKB: number }> = [];
  const largeImages: Array<{ imageUrl: string; pageUrl: string; sizeKB: number }> = [];
  
  let match;
  const checkedUrls = new Set<string>();
  
  while ((match = imageRegex.exec(html)) !== null) {
    const imgSrc = match[1];
    if (!imgSrc || checkedUrls.has(imgSrc)) continue;
    checkedUrls.add(imgSrc);
    
    // Convert relative URLs to absolute
    let imageUrl = imgSrc;
    try {
      if (!imgSrc.startsWith('http')) {
        const base = new URL(pageUrl);
        imageUrl = new URL(imgSrc, base).href;
      }
      
      // Skip data URLs and SVGs
      if (imageUrl.startsWith('data:') || imageUrl.endsWith('.svg')) continue;
      
      // Try to get image size via HEAD request
      const sizeKB = await getImageSize(imageUrl);
      
      if (sizeKB > 0) {
        const imageData = { imageUrl, pageUrl, sizeKB };
        images.push(imageData);
        
        // Track images over 100KB
        if (sizeKB > 100) {
          largeImages.push(imageData);
        }
      }
    } catch (error) {
      console.log(`Could not check image ${imgSrc}:`, error);
    }
  }
  
  // Sort large images by size (largest first)
  largeImages.sort((a, b) => b.sizeKB - a.sizeKB);
  
  return { images, largeImages };
}

async function getImageSize(imageUrl: string): Promise<number> {
  try {
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return 0;
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      return Math.round(bytes / 1024); // Convert to KB
    }
    
    // If no content-length header, try to fetch the image
    const imageResponse = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    
    if (imageResponse.ok) {
      const blob = await imageResponse.blob();
      return Math.round(blob.size / 1024);
    }
  } catch (error) {
    console.log(`Could not get size for ${imageUrl}`);
  }
  
  return 0;
}

function findAllLinks(html: string, pageUrl: string): string[] {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const links: string[] = [];
  const baseUrl = new URL(pageUrl);
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }
    
    try {
      // Convert relative URLs to absolute
      const linkUrl = href.startsWith('http') 
        ? href 
        : new URL(href, baseUrl).href;
      
      links.push(linkUrl);
    } catch (error) {
      console.log(`Invalid link found: ${href}`);
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

async function checkLinksFor404s(links: string[], sourceUrl: string): Promise<Array<{
  brokenUrl: string;
  sourceUrl: string;
  linkType: 'internal' | 'external';
}>> {
  const brokenLinks: Array<{
    brokenUrl: string;
    sourceUrl: string;
    linkType: 'internal' | 'external';
  }> = [];
  
  const sourceHost = new URL(sourceUrl).hostname;
  
  // Check only a sample of links to avoid overwhelming the server
  // In production, this would be more sophisticated with rate limiting
  const linksToCheck = links.slice(0, 20);
  
  for (const link of linksToCheck) {
    try {
      const linkHost = new URL(link).hostname;
      const isInternal = linkHost === sourceHost;
      
      const response = await fetch(link, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.status === 404) {
        brokenLinks.push({
          brokenUrl: link,
          sourceUrl: sourceUrl,
          linkType: isInternal ? 'internal' : 'external'
        });
      }
    } catch (error) {
      // Network errors might indicate broken links
      console.log(`Could not check link ${link}`);
    }
  }
  
  return brokenLinks;
}

async function checkSitemap(baseUrl: URL): Promise<'found' | 'missing'> {
  const sitemapUrls = [
    `${baseUrl.origin}/sitemap.xml`,
    `${baseUrl.origin}/sitemap_index.xml`,
    `${baseUrl.origin}/sitemap`,
  ];
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`✓ Sitemap found at ${sitemapUrl}`);
        return 'found';
      }
    } catch (error) {
      continue;
    }
  }
  
  return 'missing';
}

async function checkRobotsTxt(baseUrl: URL): Promise<'found' | 'missing'> {
  try {
    const robotsUrl = `${baseUrl.origin}/robots.txt`;
    const response = await fetch(robotsUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAuditPro/1.0)' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`✓ Robots.txt found at ${robotsUrl}`);
      return 'found';
    }
  } catch (error) {
    console.log('Robots.txt not found');
  }
  
  return 'missing';
}

function estimateTotalPages(html: string, links: string[]): number {
  // Simple estimation based on internal links found
  // In production, would parse sitemap for accurate count
  const internalLinksCount = links.filter(link => {
    try {
      return !link.includes('://') || link.includes(new URL(links[0]).hostname);
    } catch {
      return false;
    }
  }).length;
  
  // Rough estimate: assume we found about 20% of total pages
  return Math.max(1, Math.round(internalLinksCount * 5));
}