interface DomainAuthorityResult {
  source: string;
  score: number;
  success: boolean;
  error?: string;
}

interface AveragedDomainAuthority {
  averageScore: number;
  sources: DomainAuthorityResult[];
  successfulSources: number;
  reliability: 'high' | 'medium' | 'low';
}

class RealDomainAuthorityService {
  private baseDelay = 2000; // 2 second delay between requests to avoid rate limiting

  async getRealDomainAuthority(domain: string): Promise<AveragedDomainAuthority> {
    console.log(`Fetching real domain authority for: ${domain}`);
    
    const cleanDomain = this.cleanDomain(domain);
    const results: DomainAuthorityResult[] = [];

    // Scrape all free domain authority tools
    const scrapers = [
      { name: 'SEMrush', scraper: () => this.scrapeSemrushAS(cleanDomain) },
      { name: 'Ahrefs', scraper: () => this.scrapeAhrefsDR(cleanDomain) },
      { name: 'MOZ', scraper: () => this.scrapeMozDA(cleanDomain) },
      { name: 'Backlinko', scraper: () => this.scrapeBacklinko(cleanDomain) }
    ];

    // Execute scrapers with delays to avoid rate limiting
    for (let i = 0; i < scrapers.length; i++) {
      try {
        console.log(`Scraping ${scrapers[i].name} for ${cleanDomain}...`);
        const result = await scrapers[i].scraper();
        results.push(result);
        
        // Add delay between requests (except for the last one)
        if (i < scrapers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.baseDelay));
        }
      } catch (error) {
        console.error(`Error scraping ${scrapers[i].name}:`, error);
        results.push({
          source: scrapers[i].name,
          score: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return this.calculateAveragedScore(results);
  }

  private async scrapeSemrushAS(domain: string): Promise<DomainAuthorityResult> {
    try {
      const url = `https://www.semrush.com/free-tools/website-authority-checker/?domain=${encodeURIComponent(domain)}`;
      
      // Use fetch with proper headers to mimic a real browser
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Look for Authority Score in the HTML
      // SEMrush typically shows AS in a format like "Authority Score: 24"
      const asPatterns = [
        /authority\s*score[:\s]*(\d+)/i,
        /"authority_score"[:\s]*(\d+)/i,
        /as[:\s]*(\d+)/i,
        /score[:\s]*(\d+)/i
      ];

      for (const pattern of asPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1]);
          if (score >= 0 && score <= 100) {
            return {
              source: 'SEMrush',
              score,
              success: true
            };
          }
        }
      }

      throw new Error('Could not find Authority Score in response');
    } catch (error) {
      return {
        source: 'SEMrush',
        score: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async scrapeAhrefsDR(domain: string): Promise<DomainAuthorityResult> {
    try {
      const url = `https://ahrefs.com/website-authority-checker`;
      
      // Ahrefs requires a POST request to their checker
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body: `target=${encodeURIComponent(domain)}`,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Look for Domain Rating in the HTML
      const drPatterns = [
        /domain\s*rating[:\s]*(\d+)/i,
        /"domain_rating"[:\s]*(\d+)/i,
        /dr[:\s]*(\d+)/i,
        /"dr"[:\s]*(\d+)/i
      ];

      for (const pattern of drPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1]);
          if (score >= 0 && score <= 100) {
            return {
              source: 'Ahrefs',
              score,
              success: true
            };
          }
        }
      }

      throw new Error('Could not find Domain Rating in response');
    } catch (error) {
      return {
        source: 'Ahrefs',
        score: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async scrapeMozDA(domain: string): Promise<DomainAuthorityResult> {
    try {
      // MOZ's free checker URL
      const url = `https://moz.com/domain-analysis`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body: `site=${encodeURIComponent(domain)}`,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Look for Domain Authority in the HTML
      const daPatterns = [
        /domain\s*authority[:\s]*(\d+)/i,
        /"domain_authority"[:\s]*(\d+)/i,
        /da[:\s]*(\d+)/i,
        /"da"[:\s]*(\d+)/i
      ];

      for (const pattern of daPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1]);
          if (score >= 0 && score <= 100) {
            return {
              source: 'MOZ',
              score,
              success: true
            };
          }
        }
      }

      throw new Error('Could not find Domain Authority in response');
    } catch (error) {
      return {
        source: 'MOZ',
        score: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async scrapeBacklinko(domain: string): Promise<DomainAuthorityResult> {
    try {
      const url = `https://backlinko.com/tools/website-authority`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body: `url=${encodeURIComponent(domain)}`,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Look for authority score in the HTML
      const authorityPatterns = [
        /authority[:\s]*(\d+)/i,
        /score[:\s]*(\d+)/i,
        /"authority"[:\s]*(\d+)/i,
        /"score"[:\s]*(\d+)/i
      ];

      for (const pattern of authorityPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1]);
          if (score >= 0 && score <= 100) {
            return {
              source: 'Backlinko',
              score,
              success: true
            };
          }
        }
      }

      throw new Error('Could not find authority score in response');
    } catch (error) {
      return {
        source: 'Backlinko',
        score: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private calculateAveragedScore(results: DomainAuthorityResult[]): AveragedDomainAuthority {
    const successfulResults = results.filter(r => r.success && r.score > 0);
    const successfulSources = successfulResults.length;
    
    if (successfulSources === 0) {
      return {
        averageScore: 0,
        sources: results,
        successfulSources: 0,
        reliability: 'low'
      };
    }

    // Calculate weighted average (SEMrush gets higher weight as it's most reliable)
    const weights = {
      'SEMrush': 0.4,  // 40% weight - most reliable according to research
      'Ahrefs': 0.3,   // 30% weight
      'MOZ': 0.2,      // 20% weight
      'Backlinko': 0.1 // 10% weight
    };

    let weightedSum = 0;
    let totalWeight = 0;

    successfulResults.forEach(result => {
      const weight = weights[result.source as keyof typeof weights] || 0.1;
      weightedSum += result.score * weight;
      totalWeight += weight;
    });

    const averageScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    // Determine reliability based on number of successful sources
    let reliability: 'high' | 'medium' | 'low';
    if (successfulSources >= 3) {
      reliability = 'high';
    } else if (successfulSources >= 2) {
      reliability = 'medium';
    } else {
      reliability = 'low';
    }

    return {
      averageScore,
      sources: results,
      successfulSources,
      reliability
    };
  }

  private cleanDomain(domain: string): string {
    // Remove protocol and www
    return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export { RealDomainAuthorityService, type AveragedDomainAuthority, type DomainAuthorityResult };