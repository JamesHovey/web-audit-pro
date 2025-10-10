/**
 * Semantic Keyword Expansion Service
 * Uses multiple techniques to discover related keywords and longtail variations
 */

import { generateKeywordVariations, matchBusinessPatterns, BUSINESS_KEYWORD_COLLECTIONS } from './keywordCollections';

export interface SemanticKeyword {
  keyword: string;
  relevanceScore: number;
  searchVolume?: number;
  difficulty?: number;
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  longtail: boolean;
  source: 'extracted' | 'semantic' | 'competitor' | 'suggestion';
}

export class SemanticKeywordExpansion {
  
  /**
   * Expand keywords using semantic analysis and business patterns
   */
  async expandKeywords(
    extractedKeywords: string[],
    businessCategory: string,
    domain: string,
    location?: string
  ): Promise<SemanticKeyword[]> {
    const expandedKeywords: SemanticKeyword[] = [];
    
    // 1. Process extracted keywords
    const processedExtracted = this.processExtractedKeywords(extractedKeywords, businessCategory);
    expandedKeywords.push(...processedExtracted);
    
    // 2. Generate semantic variations
    const semanticVariations = this.generateSemanticVariations(extractedKeywords, businessCategory);
    expandedKeywords.push(...semanticVariations);
    
    // 3. Add location-based keywords
    if (location) {
      const locationKeywords = this.generateLocationKeywords(extractedKeywords, location);
      expandedKeywords.push(...locationKeywords);
    }
    
    // 4. Generate question-based longtails
    const questionKeywords = this.generateQuestionKeywords(extractedKeywords, businessCategory);
    expandedKeywords.push(...questionKeywords);
    
    // 5. Add commercial intent variations
    const commercialKeywords = this.generateCommercialKeywords(extractedKeywords);
    expandedKeywords.push(...commercialKeywords);
    
    // Remove duplicates and sort by relevance
    const uniqueKeywords = this.deduplicateKeywords(expandedKeywords);
    
    return uniqueKeywords
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 100); // Limit to top 100 most relevant
  }
  
  /**
   * Process originally extracted keywords
   */
  private processExtractedKeywords(
    keywords: string[], 
    businessCategory: string
  ): SemanticKeyword[] {
    const processed: SemanticKeyword[] = [];
    
    keywords.forEach(keyword => {
      const isLongtail = keyword.split(' ').length >= 3;
      const intent = this.determineIntent(keyword);
      const relevanceScore = this.calculateRelevanceScore(keyword, businessCategory);
      
      processed.push({
        keyword: keyword.toLowerCase(),
        relevanceScore,
        intent,
        longtail: isLongtail,
        source: 'extracted'
      });
    });
    
    return processed;
  }
  
  /**
   * Generate semantic variations using synonyms and related terms
   */
  private generateSemanticVariations(
    keywords: string[], 
    businessCategory: string
  ): SemanticKeyword[] {
    const variations: SemanticKeyword[] = [];
    
    // Semantic substitutions for common business terms
    const semanticMap: Record<string, string[]> = {
      'service': ['solution', 'support', 'assistance', 'help'],
      'company': ['business', 'firm', 'agency', 'organization'],
      'expert': ['specialist', 'professional', 'consultant', 'advisor'],
      'best': ['top', 'leading', 'premier', 'excellent'],
      'cheap': ['affordable', 'budget', 'low cost', 'economical'],
      'buy': ['purchase', 'order', 'acquire', 'get'],
      'help': ['assist', 'support', 'aid', 'guide']
    };
    
    keywords.forEach(originalKeyword => {
      const words = originalKeyword.toLowerCase().split(' ');
      
      words.forEach((word, index) => {
        if (semanticMap[word]) {
          semanticMap[word].forEach(synonym => {
            const newWords = [...words];
            newWords[index] = synonym;
            const newKeyword = newWords.join(' ');
            
            variations.push({
              keyword: newKeyword,
              relevanceScore: 0.8, // High relevance for semantic variations
              intent: this.determineIntent(newKeyword),
              longtail: newKeyword.split(' ').length >= 3,
              source: 'semantic'
            });
          });
        }
      });
    });
    
    return variations;
  }
  
  /**
   * Generate location-based keyword variations
   */
  private generateLocationKeywords(keywords: string[], location: string): SemanticKeyword[] {
    const locationVariations: SemanticKeyword[] = [];
    const locationTerms = [location, 'near me', 'local', `in ${location}`];
    
    keywords.forEach(keyword => {
      locationTerms.forEach(locTerm => {
        locationVariations.push({
          keyword: `${keyword} ${locTerm}`,
          relevanceScore: 0.85,
          intent: 'commercial',
          longtail: true,
          source: 'semantic'
        });
        
        locationVariations.push({
          keyword: `${locTerm} ${keyword}`,
          relevanceScore: 0.75,
          intent: 'commercial', 
          longtail: true,
          source: 'semantic'
        });
      });
    });
    
    return locationVariations;
  }
  
  /**
   * Generate question-based longtail keywords
   */
  private generateQuestionKeywords(
    keywords: string[], 
    businessCategory: string
  ): SemanticKeyword[] {
    const questionKeywords: SemanticKeyword[] = [];
    
    const questionStarters = [
      'how to choose', 'what is the best', 'how much does', 'where to find',
      'why choose', 'when to use', 'how to get', 'what are the benefits of',
      'how to find', 'what makes', 'how does', 'what type of'
    ];
    
    keywords.forEach(keyword => {
      questionStarters.forEach(starter => {
        questionKeywords.push({
          keyword: `${starter} ${keyword}`,
          relevanceScore: 0.7,
          intent: 'informational',
          longtail: true,
          source: 'semantic'
        });
      });
    });
    
    return questionKeywords;
  }
  
  /**
   * Generate commercial intent variations
   */
  private generateCommercialKeywords(keywords: string[]): SemanticKeyword[] {
    const commercialKeywords: SemanticKeyword[] = [];
    
    const commercialModifiers = [
      'buy', 'hire', 'book', 'order', 'get quote for', 'price of',
      'cost of', 'compare', 'reviews of', 'best', 'top rated'
    ];
    
    keywords.forEach(keyword => {
      commercialModifiers.forEach(modifier => {
        commercialKeywords.push({
          keyword: `${modifier} ${keyword}`,
          relevanceScore: 0.8,
          intent: 'commercial',
          longtail: keyword.split(' ').length >= 2,
          source: 'semantic'
        });
      });
    });
    
    return commercialKeywords;
  }
  
  /**
   * Determine keyword intent
   */
  private determineIntent(keyword: string): 'commercial' | 'informational' | 'navigational' | 'transactional' {
    const lowerKeyword = keyword.toLowerCase();
    
    // Commercial intent indicators
    if (/\b(buy|purchase|hire|book|order|price|cost|quote|compare|best|top)\b/.test(lowerKeyword)) {
      return 'commercial';
    }
    
    // Informational intent indicators  
    if (/\b(how|what|why|when|where|guide|tips|benefits)\b/.test(lowerKeyword)) {
      return 'informational';
    }
    
    // Transactional intent indicators
    if (/\b(contact|login|signup|trial|demo|download)\b/.test(lowerKeyword)) {
      return 'transactional';
    }
    
    // Default to commercial for business keywords
    return 'commercial';
  }
  
  /**
   * Calculate relevance score based on business category match
   */
  private calculateRelevanceScore(keyword: string, businessCategory: string): number {
    const matches = matchBusinessPatterns([keyword], businessCategory);
    
    if (matches.length > 0) {
      return Math.max(...matches.map(m => m.confidence));
    }
    
    // Base relevance for business-related terms
    const businessTerms = ['service', 'professional', 'expert', 'company', 'business'];
    const hasBusinessTerm = businessTerms.some(term => keyword.toLowerCase().includes(term));
    
    return hasBusinessTerm ? 0.6 : 0.4;
  }
  
  /**
   * Remove duplicate keywords
   */
  private deduplicateKeywords(keywords: SemanticKeyword[]): SemanticKeyword[] {
    const seen = new Map<string, SemanticKeyword>();
    
    keywords.forEach(keyword => {
      const key = keyword.keyword.toLowerCase().trim();
      
      if (!seen.has(key) || seen.get(key)!.relevanceScore < keyword.relevanceScore) {
        seen.set(key, keyword);
      }
    });
    
    return Array.from(seen.values());
  }
}

/**
 * Business category detection from content
 */
export function detectBusinessCategory(html: string, domain: string): string {
  const content = html.toLowerCase();
  
  // Check for category indicators
  const categoryIndicators = [
    { category: 'financial-services', terms: ['investment', 'trading', 'finance', 'capital', 'wealth', 'fund'] },
    { category: 'legal-services', terms: ['solicitor', 'lawyer', 'legal', 'law', 'barrister'] },
    { category: 'healthcare', terms: ['medical', 'health', 'doctor', 'clinic', 'treatment'] },
    { category: 'architecture-construction', terms: ['architect', 'design', 'building', 'construction', 'planning'] },
    { category: 'digital-marketing', terms: ['marketing', 'digital', 'SEO', 'web design', 'advertising'] },
    { category: 'manufacturing', terms: ['manufacturing', 'machinery', 'equipment', 'industrial'] }
  ];
  
  for (const indicator of categoryIndicators) {
    const matchCount = indicator.terms.filter(term => content.includes(term)).length;
    if (matchCount >= 2) {
      return indicator.category;
    }
  }
  
  return 'general-business';
}