/**
 * Above Fold Competitor Analysis Service
 * Identifies main competitors based on keywords that appear in the Above Fold Keywords section
 */

interface AboveFoldKeyword {
  keyword: string;
  position: number;
  volume: number;
  difficulty?: number;
  searchIntent?: string;
}

interface CompetitorData {
  domain: string;
  overlap: number;
  keywords: number;
  authority: number;
  description: string;
  matchingKeywords: string[];
  competitionLevel: 'high' | 'medium' | 'low';
}

interface CompetitorAnalysis {
  competitors: CompetitorData[];
  totalCompetitors: number;
  averageOverlap: number;
  competitionIntensity: 'high' | 'medium' | 'low';
  keywordClusters: { [industry: string]: string[] };
}

export class AboveFoldCompetitorService {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }

  /**
   * Analyze competitors based on Above Fold Keywords
   */
  async analyzeCompetitors(aboveFoldKeywords: AboveFoldKeyword[]): Promise<CompetitorAnalysis> {
    console.log(`🔍 Analyzing competitors based on ${aboveFoldKeywords.length} above-fold keywords...`);

    try {
      // Step 1: Group keywords by industry/theme
      const keywordClusters = this.clusterKeywordsByIndustry(aboveFoldKeywords);
      
      // Step 2: Identify likely competitors based on keyword patterns
      const competitors = await this.identifyCompetitors(aboveFoldKeywords, keywordClusters);

      // Step 3: Calculate overall competition metrics
      const totalCompetitors = competitors.length;
      const averageOverlap = totalCompetitors > 0 
        ? Math.round(competitors.reduce((sum, comp) => sum + comp.overlap, 0) / totalCompetitors)
        : 0;

      const competitionIntensity = averageOverlap > 60 ? 'high' : averageOverlap > 30 ? 'medium' : 'low';

      return {
        competitors: competitors.slice(0, 10), // Top 10 competitors
        totalCompetitors,
        averageOverlap,
        competitionIntensity,
        keywordClusters
      };

    } catch (error) {
      console.error('Competitor analysis error:', error);
      return {
        competitors: [],
        totalCompetitors: 0,
        averageOverlap: 0,
        competitionIntensity: 'low',
        keywordClusters: {}
      };
    }
  }

  /**
   * Group keywords by industry or theme
   */
  private clusterKeywordsByIndustry(keywords: AboveFoldKeyword[]): { [industry: string]: string[] } {
    const clusters: { [industry: string]: string[] } = {};

    keywords.forEach(kw => {
      const keyword = kw.keyword.toLowerCase();
      
      // Food & Processing
      if (keyword.includes('food') || keyword.includes('confection') || keyword.includes('candy') || keyword.includes('processing') || keyword.includes('equipment')) {
        if (!clusters['Food & Processing']) clusters['Food & Processing'] = [];
        clusters['Food & Processing'].push(kw.keyword);
      }
      
      // Equipment & Machinery
      else if (keyword.includes('machine') || keyword.includes('equipment') || keyword.includes('machinery') || keyword.includes('apparatus')) {
        if (!clusters['Equipment & Machinery']) clusters['Equipment & Machinery'] = [];
        clusters['Equipment & Machinery'].push(kw.keyword);
      }
      
      // Digital & Marketing
      else if (keyword.includes('digital') || keyword.includes('marketing') || keyword.includes('seo') || keyword.includes('web') || keyword.includes('online')) {
        if (!clusters['Digital & Marketing']) clusters['Digital & Marketing'] = [];
        clusters['Digital & Marketing'].push(kw.keyword);
      }
      
      // Professional Services
      else if (keyword.includes('services') || keyword.includes('consulting') || keyword.includes('professional') || keyword.includes('expert')) {
        if (!clusters['Professional Services']) clusters['Professional Services'] = [];
        clusters['Professional Services'].push(kw.keyword);
      }
      
      // E-commerce & Retail
      else if (keyword.includes('buy') || keyword.includes('shop') || keyword.includes('store') || keyword.includes('retail') || keyword.includes('sale')) {
        if (!clusters['E-commerce & Retail']) clusters['E-commerce & Retail'] = [];
        clusters['E-commerce & Retail'].push(kw.keyword);
      }
      
      // Healthcare & Medical
      else if (keyword.includes('health') || keyword.includes('medical') || keyword.includes('doctor') || keyword.includes('clinic')) {
        if (!clusters['Healthcare & Medical']) clusters['Healthcare & Medical'] = [];
        clusters['Healthcare & Medical'].push(kw.keyword);
      }
      
      // Generic business
      else {
        if (!clusters['General Business']) clusters['General Business'] = [];
        clusters['General Business'].push(kw.keyword);
      }
    });

    return clusters;
  }

  /**
   * Identify competitors based on keyword patterns and industry knowledge
   */
  private async identifyCompetitors(keywords: AboveFoldKeyword[], clusters: { [industry: string]: string[] }): Promise<CompetitorData[]> {
    // For now, return empty array to avoid any hardcoded business-specific data
    // In production, this would use:
    // 1. SERP scraping to find who ranks for the same keywords
    // 2. Competitor APIs like SEMrush, Ahrefs
    // 3. Domain similarity analysis
    
    console.log(`ℹ️ Competitor analysis returns generic results. For accurate data, integrate with SERP APIs.`);
    console.log(`   Keywords analyzed: ${keywords.length}`);
    console.log(`   Industry clusters found: ${Object.keys(clusters).length}`);
    
    return [];
  }
}

export default AboveFoldCompetitorService;