interface PageInfo {
  url: string;
  title: string;
  popularityScore: number;
  signals: {
    isHomepage: boolean;
    navigationPosition: number; // 0 = main nav, 1 = footer, 2 = not found
    internalLinkCount: number;
    urlDepth: number; // Number of slashes in path
    hasMetaDescription: boolean;
    contentLength: number;
    isInSitemap: boolean;
  };
  internalLinks: string[]; // Array of URLs that link to this page
  estimatedTrafficShare: number; // Percentage of site traffic
}

interface PopularPagesResult {
  pages: PageInfo[];
  methodology: string;
  confidence: 'high' | 'medium' | 'low';
  discoveredPages: number;
  analyzedPages: number;
}

export async function analyzePagePopularity(domain: string): Promise<PopularPagesResult> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const baseUrl = `https://${cleanDomain}`;
  
  console.log(`Analyzing page popularity for: ${cleanDomain}`);
  
  const pages: PageInfo[] = [];
  const discoveredUrls = new Set<string>();
  
  try {
    // Always include homepage FIRST (ensure it's analyzed)
    const homepageUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    discoveredUrls.add(homepageUrl);
    
    // Step 1: Try to fetch and parse sitemap
    const sitemapUrls = await fetchSitemapUrls(baseUrl);
    sitemapUrls.forEach(url => discoveredUrls.add(url));
    
    // Step 2: Fetch homepage to get navigation links
    const homepageData = await analyzeHomepage(baseUrl);
    homepageData.navigationLinks.forEach(url => discoveredUrls.add(url));
    homepageData.footerLinks.forEach(url => discoveredUrls.add(url));
    
    // Step 3: Analyze discovered pages (limit to top 20 for performance)
    // Put homepage first to ensure it's always included
    const urlsArray = Array.from(discoveredUrls);
    const urlsToAnalyze = [
      homepageUrl,
      ...urlsArray.filter(url => url !== homepageUrl && url !== baseUrl).slice(0, 19)
    ];
    
    // Step 4: Build internal linking map by analyzing all pages
    const internalLinkingMap = new Map<string, string[]>();
    
    for (const url of urlsToAnalyze) {
      const pageInfo = await analyzePage(url, homepageData, sitemapUrls, internalLinkingMap);
      if (pageInfo) {
        pages.push(pageInfo);
      }
    }
    
    // Step 5: Update pages with actual internal links pointing to them
    pages.forEach(page => {
      // Try multiple URL variations to find internal links
      const urlVariations = [
        page.url,
        page.url.endsWith('/') ? page.url.slice(0, -1) : `${page.url}/`,
        page.url.replace(/\/$/, ''),
        page.url.includes('//') ? page.url : `${baseUrl}${page.url}`
      ];
      
      const allInternalLinks = new Set<string>();
      urlVariations.forEach(variation => {
        const links = internalLinkingMap.get(variation) || [];
        links.forEach(link => allInternalLinks.add(link));
      });
      
      page.internalLinks = Array.from(allInternalLinks);
      page.signals.internalLinkCount = page.internalLinks.length;
    });
    
    // Step 6: Calculate popularity scores
    calculatePopularityScores(pages);
    
    // Step 7: Sort by popularity and limit to top 10
    pages.sort((a, b) => b.popularityScore - a.popularityScore);
    const topPages = pages.slice(0, 10);
    
    // Step 8: Calculate estimated traffic share
    calculateTrafficShare(topPages);
    
    return {
      pages: topPages,
      methodology: getMethodologyExplanation(),
      confidence: determineConfidence(discoveredUrls.size, pages.length),
      discoveredPages: discoveredUrls.size,
      analyzedPages: pages.length
    };
    
  } catch (error) {
    console.error('Error analyzing page popularity:', error);
    return {
      pages: [],
      methodology: getMethodologyExplanation(),
      confidence: 'low',
      discoveredPages: 0,
      analyzedPages: 0
    };
  }
}

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const urls: string[] = [];
  
  try {
    // Try common sitemap locations
    const sitemapUrls = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap.xml.gz`
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl);
        if (response.ok) {
          const text = await response.text();
          // Simple regex to extract URLs from sitemap
          const urlMatches = text.match(/<loc>(.*?)<\/loc>/g);
          if (urlMatches) {
            urlMatches.forEach(match => {
              const url = match.replace(/<\/?loc>/g, '');
              if (url && !url.includes('image') && !url.includes('video')) {
                urls.push(url);
              }
            });
            break; // Stop after first successful sitemap
          }
        }
      } catch (err) {
        // Continue to next sitemap location
      }
    }
  } catch (error) {
    console.log('Could not fetch sitemap:', error);
  }
  
  return urls;
}

async function analyzeHomepage(baseUrl: string): Promise<{
  navigationLinks: string[];
  footerLinks: string[];
  allInternalLinks: string[];
}> {
  const result = {
    navigationLinks: [] as string[],
    footerLinks: [] as string[],
    allInternalLinks: [] as string[]
  };
  
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) return result;
    
    const html = await response.text();
    
    // Extract all internal links
    const linkMatches = html.match(/href=["'](\/[^"']*|https?:\/\/[^"']*)/g);
    if (linkMatches) {
      linkMatches.forEach(match => {
        const url = match.replace(/href=["']/, '');
        if (url.startsWith('/')) {
          result.allInternalLinks.push(`${baseUrl}${url}`);
        } else if (url.includes(baseUrl.replace('https://', ''))) {
          result.allInternalLinks.push(url);
        }
      });
    }
    
    // Try to identify navigation links (usually in header/nav elements)
    const navPattern = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
    const headerPattern = /<header[^>]*>([\s\S]*?)<\/header>/gi;
    
    const navMatches = [...(html.match(navPattern) || []), ...(html.match(headerPattern) || [])];
    navMatches.forEach(navHtml => {
      const navLinks = navHtml.match(/href=["'](\/[^"']*|https?:\/\/[^"']*)/g);
      if (navLinks) {
        navLinks.forEach(match => {
          const url = match.replace(/href=["']/, '');
          if (url.startsWith('/')) {
            result.navigationLinks.push(`${baseUrl}${url}`);
          } else if (url.includes(baseUrl.replace('https://', ''))) {
            result.navigationLinks.push(url);
          }
        });
      }
    });
    
    // Try to identify footer links
    const footerPattern = /<footer[^>]*>([\s\S]*?)<\/footer>/gi;
    const footerMatches = html.match(footerPattern) || [];
    footerMatches.forEach(footerHtml => {
      const footerLinks = footerHtml.match(/href=["'](\/[^"']*|https?:\/\/[^"']*)/g);
      if (footerLinks) {
        footerLinks.forEach(match => {
          const url = match.replace(/href=["']/, '');
          if (url.startsWith('/')) {
            result.footerLinks.push(`${baseUrl}${url}`);
          } else if (url.includes(baseUrl.replace('https://', ''))) {
            result.footerLinks.push(url);
          }
        });
      }
    });
    
  } catch (error) {
    console.log('Error analyzing homepage:', error);
  }
  
  return result;
}

async function analyzePage(
  url: string, 
  homepageData: any, 
  sitemapUrls: string[],
  internalLinkingMap: Map<string, string[]>
): Promise<PageInfo | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const html = await response.text();
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const urlDepth = pathname === '/' ? 0 : pathname.split('/').filter(p => p).length;
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].substring(0, 100) : urlObj.pathname;
    
    // Check for meta description
    const hasMetaDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html);
    
    // Estimate content length (remove HTML tags)
    const textContent = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
    const contentLength = textContent.length;
    
    // Extract all internal links from THIS page and update the linking map
    const linkMatches = html.match(/href=["'](\/[^"'#]*|https?:\/\/[^"'#]*)/g);
    if (linkMatches) {
      linkMatches.forEach(match => {
        let targetUrl = match.replace(/href=["']/, '');
        
        // Convert relative URLs to absolute
        if (targetUrl.startsWith('/')) {
          targetUrl = `${baseUrl}${targetUrl}`;
        }
        
        // Only process internal links
        if (targetUrl.includes(baseUrl.replace('https://', ''))) {
          // Normalize both the target URL and track multiple variations
          const normalizedTarget = targetUrl.endsWith('/') && targetUrl !== `${baseUrl}/` 
            ? targetUrl.slice(0, -1) 
            : targetUrl;
          const alternateTarget = normalizedTarget.endsWith('/') ? normalizedTarget : `${normalizedTarget}/`;
          
          // Add this page as a source that links to both URL variations
          [normalizedTarget, alternateTarget].forEach(target => {
            if (!internalLinkingMap.has(target)) {
              internalLinkingMap.set(target, []);
            }
            const sourcesArray = internalLinkingMap.get(target)!;
            if (!sourcesArray.includes(url)) {
              sourcesArray.push(url);
            }
          });
        }
      });
    }
    
    // Initial count from homepage data (will be updated later with actual count)
    const internalLinksToThisPage = homepageData.allInternalLinks.filter((link: string) => 
      link === url || link === url.replace(/\/$/, '') || link === `${url}/`
    );
    const internalLinkCount = internalLinksToThisPage.length;
    
    // Check navigation position
    let navigationPosition = 2; // Not found by default
    if (homepageData.navigationLinks.includes(url)) {
      navigationPosition = 0; // Main navigation
    } else if (homepageData.footerLinks.includes(url)) {
      navigationPosition = 1; // Footer
    }
    
    return {
      url,
      title,
      popularityScore: 0, // Will be calculated later
      signals: {
        isHomepage: urlDepth === 0,
        navigationPosition,
        internalLinkCount,
        urlDepth,
        hasMetaDescription,
        contentLength,
        isInSitemap: sitemapUrls.includes(url)
      },
      internalLinks: internalLinksToThisPage,
      estimatedTrafficShare: 0 // Will be calculated later
    };
    
  } catch (error) {
    console.log(`Error analyzing page ${url}:`, error);
    return null;
  }
}

function calculatePopularityScores(pages: PageInfo[]): void {
  // Calculate max values for normalization
  const maxInternalLinks = Math.max(...pages.map(p => p.signals.internalLinkCount), 1);
  const maxContentLength = Math.max(...pages.map(p => p.signals.contentLength), 1);
  
  pages.forEach(page => {
    let score = 0;
    
    // Homepage gets highest weight
    if (page.signals.isHomepage) {
      score += 100;
    }
    
    // Navigation position weight
    if (page.signals.navigationPosition === 0) {
      score += 50; // Main navigation
    } else if (page.signals.navigationPosition === 1) {
      score += 20; // Footer
    }
    
    // Internal links weight (normalized)
    score += (page.signals.internalLinkCount / maxInternalLinks) * 40;
    
    // URL depth penalty (shallower = better)
    score -= page.signals.urlDepth * 10;
    
    // Content signals
    if (page.signals.hasMetaDescription) {
      score += 10;
    }
    
    // Content length weight (normalized)
    score += (page.signals.contentLength / maxContentLength) * 15;
    
    // Sitemap presence
    if (page.signals.isInSitemap) {
      score += 15;
    }
    
    page.popularityScore = Math.max(score, 0);
  });
}

function calculateTrafficShare(pages: PageInfo[]): void {
  const totalScore = pages.reduce((sum, p) => sum + p.popularityScore, 0);
  
  // Use a power law distribution for more realistic traffic distribution
  pages.forEach((page, index) => {
    if (totalScore > 0) {
      // Apply power law: top pages get disproportionally more traffic
      const rankFactor = Math.pow(1 / (index + 1), 0.7);
      const baseShare = (page.popularityScore / totalScore) * 100;
      page.estimatedTrafficShare = parseFloat((baseShare * rankFactor * 2).toFixed(1));
    } else {
      page.estimatedTrafficShare = 0;
    }
  });
  
  // Normalize to ensure it doesn't exceed 100%
  const totalShare = pages.reduce((sum, p) => sum + p.estimatedTrafficShare, 0);
  if (totalShare > 100) {
    const factor = 100 / totalShare;
    pages.forEach(page => {
      page.estimatedTrafficShare = parseFloat((page.estimatedTrafficShare * factor).toFixed(1));
    });
  }
}

function determineConfidence(discovered: number, analyzed: number): 'high' | 'medium' | 'low' {
  if (analyzed >= 15 && discovered >= 30) return 'high';
  if (analyzed >= 10 && discovered >= 15) return 'medium';
  return 'low';
}

function getMethodologyExplanation(): string {
  return `We analyzed the website structure to identify likely popular pages by examining:
• Homepage and main navigation links (usually most visited)
• How many internal links point to each page (more links = more important)
• Page depth in the site structure (shallower pages typically get more traffic)
• Presence in sitemap and content quality signals
• Common web patterns (homepage gets ~30-40% of traffic, main nav pages get ~40-50%)`;
}