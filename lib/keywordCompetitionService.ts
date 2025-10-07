/**
 * Keyword Competition Service
 * Analyzes competitor websites based on keyword overlap from Above Fold Keywords
 * Uses ValueSERP API to identify competitors ranking for the same keywords
 */

interface CompetitorData {
  domain: string;
  overlapCount: number;
  overlapPercentage: number;
  sharedKeywords: string[];
  averagePosition: number;
}

interface KeywordCompetitionAnalysis {
  competitors: CompetitorData[];
  totalKeywordsAnalyzed: number;
  analysisMethod: string;
  creditsUsed: number;
}

export class KeywordCompetitionService {
  private domain: string;
  
  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Analyze competitor overlap based on Above Fold Keywords
   */
  async analyzeCompetitorOverlap(
    aboveFoldKeywords: Array<{keyword: string; position: number; volume?: number}>,
    country: string = 'gb'
  ): Promise<KeywordCompetitionAnalysis> {
    console.log(`🏆 Starting competitor analysis for ${this.domain} with ${aboveFoldKeywords.length} keywords...`);
    
    // Check if ValueSERP is configured
    const { isValueSerpConfigured } = await import('./valueSerpService');
    const useValueSerp = isValueSerpConfigured();
    
    if (!useValueSerp) {
      console.log('⚠️ ValueSERP API required for competitor analysis');
      return {
        competitors: [],
        totalKeywordsAnalyzed: 0,
        analysisMethod: 'api_required',
        creditsUsed: 0
      };
    }

    const { ValueSerpService } = await import('./valueSerpService');
    const valueSerpService = new ValueSerpService();
    
    // Map country code to location string
    const location = country === 'gb' ? 'United Kingdom' : 
                     country === 'us' ? 'United States' : 
                     'United Kingdom';

    // Track competitors and their overlapping keywords
    const competitorMap = new Map<string, {
      keywords: string[];
      positions: number[];
      domains: string[];
    }>();

    let checkedKeywords = 0;
    const maxKeywordsToCheck = Math.min(15, aboveFoldKeywords.length); // Limit to avoid excessive API usage

    // Sort keywords by volume to check most important ones first
    const sortedKeywords = [...aboveFoldKeywords]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, maxKeywordsToCheck);

    console.log(`🔍 Checking competitor rankings for top ${sortedKeywords.length} keywords...`);

    for (const keyword of sortedKeywords) {
      try {
        checkedKeywords++;
        console.log(`📊 Analyzing competitors for "${keyword.keyword}" (${checkedKeywords}/${sortedKeywords.length})...`);
        
        // Get full SERP results for this keyword
        const serpResults = await valueSerpService.getFullSerpResults(
          keyword.keyword,
          location,
          20 // Get top 20 results to find competitors
        );

        // Process competitors from SERP results
        if (serpResults && serpResults.results) {
          for (const result of serpResults.results) {
            if (result.domain && result.domain !== this.domain && result.position <= 10) {
              const domain = this.cleanDomain(result.domain);
              
              if (!competitorMap.has(domain)) {
                competitorMap.set(domain, {
                  keywords: [],
                  positions: [],
                  domains: []
                });
              }

              const competitor = competitorMap.get(domain)!;
              competitor.keywords.push(keyword.keyword);
              competitor.positions.push(result.position);
              competitor.domains.push(domain);
            }
          }
        }
        
        // Small delay to avoid rate limiting
        await this.sleep(200);
        
      } catch (error) {
        console.error(`Failed to analyze competitors for "${keyword.keyword}":`, error);
      }
    }

    // Process competitors and calculate overlap percentages
    const competitors: CompetitorData[] = [];
    
    for (const [domain, data] of competitorMap.entries()) {
      if (data.keywords.length >= 2) { // Only include competitors with 2+ shared keywords
        const overlapCount = data.keywords.length;
        const overlapPercentage = Math.round((overlapCount / checkedKeywords) * 100);
        const averagePosition = data.positions.reduce((sum, pos) => sum + pos, 0) / data.positions.length;

        competitors.push({
          domain,
          overlapCount,
          overlapPercentage,
          sharedKeywords: [...new Set(data.keywords)], // Remove duplicates
          averagePosition: Math.round(averagePosition * 10) / 10 // Round to 1 decimal
        });
      }
    }

    // Sort by overlap percentage (highest first) and limit to top 10
    competitors.sort((a, b) => b.overlapPercentage - a.overlapPercentage);
    const topCompetitors = competitors.slice(0, 10);

    console.log(`✅ Found ${topCompetitors.length} competitors with significant keyword overlap`);
    topCompetitors.slice(0, 5).forEach(comp => {
      console.log(`  🎯 ${comp.domain}: ${comp.overlapPercentage}% overlap (${comp.overlapCount} keywords, avg pos ${comp.averagePosition})`);
    });

    return {
      competitors: topCompetitors,
      totalKeywordsAnalyzed: checkedKeywords,
      analysisMethod: 'valueserp_competitor_analysis',
      creditsUsed: checkedKeywords // Approximate - ValueSERP tracks actual usage
    };
  }

  /**
   * Clean domain name for consistent comparison
   */
  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();
  }

  /**
   * Simple sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Export function for use in keyword analysis
 */
export async function analyzeKeywordCompetition(
  domain: string,
  aboveFoldKeywords: Array<{keyword: string; position: number; volume?: number}>,
  country: string = 'gb'
): Promise<KeywordCompetitionAnalysis> {
  const service = new KeywordCompetitionService(domain);
  return service.analyzeCompetitorOverlap(aboveFoldKeywords, country);
}