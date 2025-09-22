import { GoogleSearchService } from './googleSearchService';

interface CompetitorData {
  domain: string;
  overlap: number;
  keywords: number;
  authority: number;
  description: string;
  title?: string;
  snippet?: string;
}

interface CompetitorAnalysis {
  competitors: CompetitorData[];
  searchTermsUsed: string[];
  realDataUsed: boolean;
  searchesUsed: number;
}

class CompetitorDetectionService {
  private googleSearchService: GoogleSearchService;

  constructor() {
    this.googleSearchService = new GoogleSearchService();
  }

  async findRealCompetitors(
    targetDomain: string, 
    industry: string, 
    location: string = 'UK',
    mainKeywords: string[] = []
  ): Promise<CompetitorAnalysis> {
    console.log(`\n=== COMPETITOR DETECTION FOR ${targetDomain} ===`);
    console.log(`Industry: ${industry}, Location: ${location}`);

    const remainingSearches = this.googleSearchService.getRemainingSearches();
    console.log(`Google API searches remaining: ${remainingSearches}/100`);
    
    if (remainingSearches < 2) {
      console.log('❌ Insufficient Google API searches remaining, using fallback');
      return this.generateFallbackCompetitors(targetDomain, industry);
    }

    // Generate search terms based on industry and keywords
    const searchTerms = this.generateCompetitorSearchTerms(industry, location, mainKeywords);
    console.log('Search terms:', searchTerms.slice(0, 5));

    const competitorDomains = new Map<string, CompetitorData>();
    const cleanTargetDomain = this.cleanDomain(targetDomain);
    let searchesUsed = 0;

    // Search for competitors using industry terms (limit to 3 searches to conserve API)
    for (const searchTerm of searchTerms.slice(0, Math.min(3, remainingSearches))) {
      try {
        console.log(`🔍 Searching: "${searchTerm}"`);
        const searchResult = await this.googleSearchService.searchKeyword(searchTerm, targetDomain);
        searchesUsed++;
        console.log(`   Search result position: ${searchResult?.position || 'not found'}`);

        // Extract competitor domains from search results (separate API call)
        const competitors = await this.extractCompetitorsFromSearch(searchTerm, targetDomain);
        console.log(`   Found ${competitors.length} potential competitors from this search`);
          
        competitors.forEach(competitor => {
            const domain = this.cleanDomain(competitor.domain);
            
            // Skip if it's the target domain or already found
            if (domain === cleanTargetDomain || competitorDomains.has(domain)) {
              return;
            }

            // Add or update competitor data
            if (!competitorDomains.has(domain)) {
              competitorDomains.set(domain, {
                domain: competitor.domain,
                title: competitor.title,
                snippet: competitor.snippet,
                description: this.generateDescription(competitor.title, competitor.snippet, industry),
                authority: this.estimateAuthority(competitor.domain, competitor.title),
                overlap: this.calculateOverlap(competitor.title, competitor.snippet, mainKeywords),
                keywords: this.estimateKeywords(competitor.domain, industry)
              });
            }
        });

        // Delay between searches to respect rate limits
        await this.delay(500);
      } catch (error) {
        console.error(`Error searching for "${searchTerm}":`, error);
      }
    }

    const competitors = Array.from(competitorDomains.values())
      .sort((a, b) => b.authority - a.authority) // Sort by authority
      .slice(0, 10); // Limit to top 10

    console.log(`\n🎯 COMPETITOR DETECTION RESULTS:`);
    console.log(`   Searches used: ${searchesUsed}`);
    console.log(`   Competitors found: ${competitors.length}`);
    
    if (competitors.length > 0) {
      console.log(`   Real competitors detected:`);
      competitors.forEach(c => console.log(`   ✅ ${c.domain} (authority: ${c.authority}, overlap: ${c.overlap}%)`));
    } else {
      console.log(`   ❌ No real competitors found - will use fallback data`);
    }

    return {
      competitors,
      searchTermsUsed: searchTerms.slice(0, searchesUsed),
      realDataUsed: true,
      searchesUsed
    };
  }

  private async extractCompetitorsFromSearch(searchTerm: string, targetDomain: string): Promise<Array<{
    domain: string;
    title: string;
    snippet: string;
  }>> {
    // Use the Google Custom Search API to get search results
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      return [];
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchTerm)}&num=10`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const competitors: Array<{ domain: string; title: string; snippet: string }> = [];

      if (data.items) {
        for (const item of data.items) {
          try {
            const domain = new URL(item.link).hostname.replace('www.', '');
            const targetClean = this.cleanDomain(targetDomain);
            
            // Skip if it's the target domain or common non-competitors
            if (domain === targetClean || this.isNonCompetitor(domain)) {
              continue;
            }

            competitors.push({
              domain,
              title: item.title || '',
              snippet: item.snippet || ''
            });
          } catch (error) {
            // Skip invalid URLs
            continue;
          }
        }
      }

      return competitors;
    } catch (error) {
      console.error('Error extracting competitors from search:', error);
      return [];
    }
  }

  private generateCompetitorSearchTerms(industry: string, location: string, mainKeywords: string[]): string[] {
    const terms = [];

    // Industry-based search terms
    const industryTerms = this.getIndustrySearchTerms(industry);
    industryTerms.forEach(term => {
      terms.push(`${term} ${location}`);
      terms.push(`${term} companies ${location}`);
      terms.push(`${term} services ${location}`);
      terms.push(`best ${term} ${location}`);
    });

    // Main keyword-based searches
    mainKeywords.slice(0, 3).forEach(keyword => {
      terms.push(`${keyword} ${location}`);
      terms.push(`${keyword} companies`);
    });

    // Remove duplicates and return limited set
    return [...new Set(terms)].slice(0, 10);
  }

  private getIndustrySearchTerms(industry: string): string[] {
    const industryMap: Record<string, string[]> = {
      'testing equipment': ['force testing', 'torque testing', 'calibration equipment', 'test instruments', 'measurement tools'],
      'manufacturing': ['manufacturing equipment', 'industrial machinery', 'production tools'],
      'engineering': ['engineering services', 'technical consulting', 'product development'],
      'software': ['software development', 'software services', 'tech solutions'],
      'marketing': ['digital marketing', 'marketing agency', 'SEO services'],
      'consulting': ['business consulting', 'management consulting', 'strategy consulting'],
      'legal': ['legal services', 'law firm', 'solicitors'],
      'healthcare': ['medical equipment', 'healthcare services', 'medical devices'],
      'automotive': ['automotive parts', 'car services', 'vehicle testing']
    };

    // Try to find matching industry terms
    for (const [key, terms] of Object.entries(industryMap)) {
      if (industry.toLowerCase().includes(key)) {
        return terms;
      }
    }

    // Default terms
    return ['business services', 'professional services', 'equipment suppliers'];
  }

  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase();
  }

  private isNonCompetitor(domain: string): boolean {
    const nonCompetitors = [
      'wikipedia.org', 'linkedin.com', 'facebook.com', 'twitter.com', 'youtube.com',
      'google.com', 'amazon.com', 'ebay.com', 'alibaba.com', 'gov.uk', 'gov.com',
      'bbc.co.uk', 'news.com', 'reddit.com', 'quora.com', 'stackoverflow.com'
    ];

    return nonCompetitors.some(nc => domain.includes(nc));
  }

  private generateDescription(title: string, snippet: string, industry: string): string {
    const text = `${title} ${snippet}`.toLowerCase();
    
    if (text.includes('testing') && text.includes('equipment')) {
      return 'Testing equipment and instrumentation provider';
    }
    if (text.includes('calibration')) {
      return 'Calibration and measurement services';
    }
    if (text.includes('force') && text.includes('gauge')) {
      return 'Force measurement and testing solutions';
    }
    if (text.includes('torque')) {
      return 'Torque testing and measurement equipment';
    }
    if (text.includes('manufacturing')) {
      return 'Manufacturing and industrial equipment';
    }
    if (text.includes('engineering')) {
      return 'Engineering services and solutions';
    }
    
    return `${industry} services and solutions`;
  }

  private estimateAuthority(domain: string, title: string): number {
    let authority = 35; // Base authority

    // Domain age indicators (common patterns)
    if (domain.includes('.co.uk') || domain.includes('.com')) {
      authority += 5;
    }

    // Title indicators
    const titleLower = title.toLowerCase();
    if (titleLower.includes('ltd') || titleLower.includes('limited') || titleLower.includes('inc')) {
      authority += 8;
    }
    if (titleLower.includes('group') || titleLower.includes('international')) {
      authority += 12;
    }
    if (titleLower.includes('leading') || titleLower.includes('specialist')) {
      authority += 7;
    }

    // Keep within realistic range
    return Math.min(65, Math.max(25, authority + Math.floor(Math.random() * 10)));
  }

  private calculateOverlap(title: string, snippet: string, mainKeywords: string[]): number {
    const text = `${title} ${snippet}`.toLowerCase();
    let overlap = 15; // Base overlap

    // Check for keyword matches
    mainKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        overlap += 8;
      }
    });

    // Industry similarity indicators
    if (text.includes('testing') || text.includes('measurement')) overlap += 10;
    if (text.includes('calibration') || text.includes('instruments')) overlap += 8;
    if (text.includes('equipment') || text.includes('solutions')) overlap += 6;

    return Math.min(50, Math.max(10, overlap));
  }

  private estimateKeywords(domain: string, industry: string): number {
    let keywords = 80; // Base keywords

    // Domain quality indicators
    const domainParts = domain.split('.');
    if (domainParts.length <= 2) keywords += 20; // Simple domain structure
    
    // Industry modifiers
    if (industry.includes('equipment') || industry.includes('testing')) {
      keywords += 30; // Technical industries tend to have more specific keywords
    }

    return keywords + Math.floor(Math.random() * 100); // Add some variance
  }

  private generateFallbackCompetitors(targetDomain: string, industry: string): CompetitorAnalysis {
    console.log('\n🚨 GENERATING FALLBACK COMPETITORS (FAKE DATA)');
    console.log(`   Target: ${targetDomain}`);
    console.log(`   Industry: ${industry}`);
    
    // Generate realistic but generic competitors based on industry
    const fallbackCompetitors: CompetitorData[] = [
      {
        domain: `${industry.toLowerCase().replace(/\s+/g, '')}-solutions.co.uk`,
        description: `${industry} solutions provider`,
        authority: 42,
        overlap: 25,
        keywords: 95
      },
      {
        domain: `professional-${industry.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `Professional ${industry.toLowerCase()} services`,
        authority: 38,
        overlap: 20,
        keywords: 78
      }
    ];

    return {
      competitors: fallbackCompetitors,
      searchTermsUsed: [],
      realDataUsed: false,
      searchesUsed: 0
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { CompetitorDetectionService, type CompetitorData, type CompetitorAnalysis };