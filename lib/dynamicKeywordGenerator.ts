/**
 * Dynamic Keyword Generator
 * Creates comprehensive, business-specific keyword sets using algorithmic generation
 */

import { 
  INDUSTRY_KEYWORD_DATABASE, 
  GEOGRAPHIC_MODIFIERS, 
  INTENT_MODIFIERS, 
  SERVICE_MODIFIERS,
  type IndustryKeywords,
  type ServiceKeywords 
} from './industryKeywordDatabase';

export interface GeneratedKeywordSet {
  primary: KeywordWithMetadata[];
  secondary: KeywordWithMetadata[];
  longTail: KeywordWithMetadata[];
  local: KeywordWithMetadata[];
  commercial: KeywordWithMetadata[];
  informational: KeywordWithMetadata[];
  urgency: KeywordWithMetadata[];
  totalGenerated: number;
  industrySpecific: boolean;
  generationMethod: string;
}

export interface KeywordWithMetadata {
  keyword: string;
  category: 'primary' | 'secondary' | 'long-tail' | 'local' | 'commercial' | 'informational' | 'urgency';
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  difficulty: 'low' | 'medium' | 'high';
  businessRelevance: number; // 0-1 score
  searchVolumePotential: 'low' | 'medium' | 'high';
  generated: boolean;
  template?: string;
}

export interface LocationContext {
  detectedLocation?: string;
  isLocalBusiness: boolean;
  serviceArea?: string[];
  targetCities?: string[];
}

export interface BusinessContext {
  primaryType: string;
  subcategory: string;
  businessName: string;
  services: string[];
  isUkBusiness: boolean;
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
}

export class DynamicKeywordGenerator {
  private businessContext: BusinessContext;
  private locationContext: LocationContext;
  private contentKeywords: string[];
  
  constructor(
    businessContext: BusinessContext,
    locationContext: LocationContext,
    contentKeywords: string[] = []
  ) {
    this.businessContext = businessContext;
    this.locationContext = locationContext;
    this.contentKeywords = contentKeywords;
  }

  /**
   * Generate comprehensive keyword set for the business
   */
  async generateKeywordSet(): Promise<GeneratedKeywordSet> {
    console.log(`🎯 Generating keywords for ${this.businessContext.primaryType} - ${this.businessContext.subcategory}`);
    
    const industryData = this.getIndustryData();
    if (!industryData) {
      return this.generateFallbackKeywords();
    }

    const keywords: GeneratedKeywordSet = {
      primary: [],
      secondary: [],
      longTail: [],
      local: [],
      commercial: [],
      informational: [],
      urgency: [],
      totalGenerated: 0,
      industrySpecific: true,
      generationMethod: 'dynamic_industry_specific'
    };

    // Generate each category
    keywords.primary = await this.generatePrimaryKeywords(industryData);
    keywords.secondary = await this.generateSecondaryKeywords(industryData);
    keywords.longTail = await this.generateLongTailKeywords(industryData);
    keywords.local = await this.generateLocalKeywords(industryData);
    keywords.commercial = await this.generateCommercialKeywords(industryData);
    keywords.informational = await this.generateInformationalKeywords(industryData);
    keywords.urgency = await this.generateUrgencyKeywords(industryData);

    // Add content-derived keywords
    const contentKeywords = this.generateContentDerivedKeywords();
    keywords.secondary.push(...contentKeywords.filter(k => k.category === 'secondary'));
    keywords.longTail.push(...contentKeywords.filter(k => k.category === 'long-tail'));

    keywords.totalGenerated = Object.values(keywords)
      .filter(Array.isArray)
      .reduce((total, arr) => total + arr.length, 0);

    console.log(`✅ Generated ${keywords.totalGenerated} keywords across ${Object.keys(keywords).length - 3} categories`);
    
    return keywords;
  }

  /**
   * Get industry-specific keyword data
   */
  private getIndustryData(): ServiceKeywords | null {
    const industryKeywords = INDUSTRY_KEYWORD_DATABASE[this.businessContext.primaryType];
    if (!industryKeywords) return null;
    
    return industryKeywords[this.businessContext.subcategory] || null;
  }

  /**
   * Generate primary keywords (core services)
   */
  private async generatePrimaryKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base industry keywords
    industryData.primary.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'primary', 'navigational', 'high', 0.9));
    });

    // Add business name variations
    const businessName = this.businessContext.businessName.toLowerCase();
    if (businessName && businessName !== 'example') {
      keywords.push(
        this.createKeywordMetadata(businessName, 'primary', 'navigational', 'low', 1.0),
        this.createKeywordMetadata(`${businessName} services`, 'primary', 'commercial', 'medium', 0.8)
      );
    }

    // Add service-specific variations
    this.businessContext.services.forEach(service => {
      if (service.length > 2) {
        keywords.push(this.createKeywordMetadata(service, 'primary', 'commercial', 'medium', 0.8));
      }
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate secondary keywords (variations and related services)
   */
  private async generateSecondaryKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base secondary keywords
    industryData.secondary.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'secondary', 'commercial', 'medium', 0.7));
    });

    // Generate variations with quality modifiers
    SERVICE_MODIFIERS.quality_indicators.slice(0, 4).forEach(modifier => {
      industryData.primary.slice(0, 3).forEach(baseKeyword => {
        const variation = `${modifier} ${baseKeyword}`;
        keywords.push(this.createKeywordMetadata(variation, 'secondary', 'commercial', 'medium', 0.6));
      });
    });

    // Generate business type variations
    SERVICE_MODIFIERS.business_modifiers.slice(0, 3).forEach(modifier => {
      industryData.primary.slice(0, 2).forEach(baseKeyword => {
        const variation = `${modifier} ${baseKeyword}`;
        keywords.push(this.createKeywordMetadata(variation, 'secondary', 'commercial', 'medium', 0.6));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate long-tail keywords (specific problems and solutions)
   */
  private async generateLongTailKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base long-tail keywords
    industryData.longTail.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'long-tail', 'informational', 'low', 0.8));
    });

    // Generate problem-solution combinations
    const problemTemplates = [
      'how to find {service}',
      'best {service} for {problem}',
      '{service} {location} specialist',
      'affordable {service} solutions',
      '{service} expert advice'
    ];

    problemTemplates.forEach(template => {
      industryData.primary.slice(0, 2).forEach(service => {
        const keyword = template
          .replace('{service}', service)
          .replace('{problem}', this.getCommonProblem())
          .replace('{location}', this.getTargetLocation());
        
        keywords.push(this.createKeywordMetadata(keyword, 'long-tail', 'informational', 'low', 0.7, template));
      });
    });

    // Generate specific use case keywords
    const useCaseTemplates = [
      '{service} for small business',
      'emergency {service} service',
      '{service} cost calculator',
      '{service} consultation booking'
    ];

    useCaseTemplates.forEach(template => {
      industryData.primary.slice(0, 2).forEach(service => {
        const keyword = template.replace('{service}', service);
        keywords.push(this.createKeywordMetadata(keyword, 'long-tail', 'commercial', 'low', 0.6, template));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate local/geographic keywords
   */
  private async generateLocalKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    if (!this.locationContext.isLocalBusiness) return [];
    
    const keywords: KeywordWithMetadata[] = [];
    
    // Base local keywords
    industryData.local.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'local', 'navigational', 'medium', 0.8));
    });

    // Generate location + service combinations
    const targetLocations = this.getTargetLocations();
    const proximityTerms = GEOGRAPHIC_MODIFIERS.proximity;

    targetLocations.forEach(location => {
      industryData.primary.slice(0, 3).forEach(service => {
        // "[service] in [location]"
        keywords.push(this.createKeywordMetadata(
          `${service} in ${location}`, 
          'local', 
          'navigational', 
          'medium', 
          0.7
        ));
        
        // "[location] [service]"
        keywords.push(this.createKeywordMetadata(
          `${location} ${service}`, 
          'local', 
          'navigational', 
          'medium', 
          0.7
        ));
      });
    });

    // Generate proximity-based keywords
    proximityTerms.slice(0, 3).forEach(proximity => {
      industryData.primary.slice(0, 2).forEach(service => {
        keywords.push(this.createKeywordMetadata(
          `${service} ${proximity}`, 
          'local', 
          'navigational', 
          'high', 
          0.9
        ));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate commercial intent keywords
   */
  private async generateCommercialKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base commercial keywords
    industryData.commercial.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'commercial', 'commercial', 'medium', 0.8));
    });

    // Generate price/cost related keywords
    const priceModifiers = ['cost', 'price', 'rates', 'fees', 'quote', 'pricing'];
    priceModifiers.forEach(modifier => {
      industryData.primary.slice(0, 3).forEach(service => {
        keywords.push(this.createKeywordMetadata(
          `${service} ${modifier}`, 
          'commercial', 
          'commercial', 
          'medium', 
          0.7
        ));
      });
    });

    // Generate hiring/booking keywords
    const actionModifiers = ['hire', 'book', 'get', 'find', 'choose'];
    actionModifiers.forEach(modifier => {
      industryData.primary.slice(0, 2).forEach(service => {
        keywords.push(this.createKeywordMetadata(
          `${modifier} ${service}`, 
          'commercial', 
          'transactional', 
          'medium', 
          0.6
        ));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate informational keywords
   */
  private async generateInformationalKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base informational keywords
    industryData.informational.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'informational', 'informational', 'low', 0.7));
    });

    // Generate "how to" keywords
    const howToTemplates = [
      'how to choose {service}',
      'what is {service}',
      '{service} explained',
      '{service} guide',
      '{service} tips'
    ];

    howToTemplates.forEach(template => {
      industryData.primary.slice(0, 2).forEach(service => {
        const keyword = template.replace('{service}', service);
        keywords.push(this.createKeywordMetadata(keyword, 'informational', 'informational', 'low', 0.6, template));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate urgency-based keywords
   */
  private async generateUrgencyKeywords(industryData: ServiceKeywords): Promise<KeywordWithMetadata[]> {
    const keywords: KeywordWithMetadata[] = [];
    
    // Base urgency keywords
    industryData.urgency.forEach(keyword => {
      keywords.push(this.createKeywordMetadata(keyword, 'urgency', 'transactional', 'high', 0.8));
    });

    // Generate urgent service combinations
    const urgencyModifiers = INTENT_MODIFIERS.urgency.slice(0, 4);
    urgencyModifiers.forEach(modifier => {
      industryData.primary.slice(0, 2).forEach(service => {
        keywords.push(this.createKeywordMetadata(
          `${modifier} ${service}`, 
          'urgency', 
          'transactional', 
          'high', 
          0.7
        ));
      });
    });

    return this.deduplicateKeywords(keywords);
  }

  /**
   * Generate keywords from website content
   */
  private generateContentDerivedKeywords(): KeywordWithMetadata[] {
    const keywords: KeywordWithMetadata[] = [];
    
    // Extract meaningful phrases from content
    const contentPhrases = this.extractContentPhrases();
    
    contentPhrases.forEach(phrase => {
      if (this.isBusinessRelevant(phrase)) {
        keywords.push(this.createKeywordMetadata(
          phrase, 
          phrase.split(' ').length >= 3 ? 'long-tail' : 'secondary',
          'commercial',
          'medium',
          0.6
        ));
      }
    });

    return keywords;
  }

  /**
   * Generate fallback keywords when no industry data available
   */
  private generateFallbackKeywords(): GeneratedKeywordSet {
    const businessName = this.businessContext.businessName.toLowerCase();
    const fallbackKeywords = [
      businessName,
      `${businessName} services`,
      ...this.businessContext.services,
      ...this.contentKeywords.slice(0, 10)
    ].filter(k => k && k.length > 2);

    const keywords: KeywordWithMetadata[] = fallbackKeywords.map(keyword => 
      this.createKeywordMetadata(keyword, 'primary', 'commercial', 'medium', 0.5)
    );

    return {
      primary: keywords,
      secondary: [],
      longTail: [],
      local: [],
      commercial: [],
      informational: [],
      urgency: [],
      totalGenerated: keywords.length,
      industrySpecific: false,
      generationMethod: 'fallback_content_based'
    };
  }

  /**
   * Helper methods
   */
  private createKeywordMetadata(
    keyword: string,
    category: KeywordWithMetadata['category'],
    intent: KeywordWithMetadata['intent'],
    difficulty: KeywordWithMetadata['difficulty'],
    relevance: number,
    template?: string
  ): KeywordWithMetadata {
    return {
      keyword: keyword.toLowerCase().trim(),
      category,
      intent,
      difficulty,
      businessRelevance: relevance,
      searchVolumePotential: this.estimateSearchVolume(keyword, category),
      generated: true,
      template
    };
  }

  private estimateSearchVolume(keyword: string, category: KeywordWithMetadata['category']): 'low' | 'medium' | 'high' {
    const wordCount = keyword.split(' ').length;
    
    if (category === 'primary' && wordCount <= 2) return 'high';
    if (category === 'local' && keyword.includes('near me')) return 'high';
    if (category === 'long-tail' && wordCount >= 4) return 'low';
    if (category === 'commercial' && (keyword.includes('cost') || keyword.includes('price'))) return 'medium';
    
    return 'medium';
  }

  private getTargetLocations(): string[] {
    const locations: string[] = [];
    
    if (this.locationContext.detectedLocation) {
      locations.push(this.locationContext.detectedLocation);
    }
    
    if (this.locationContext.targetCities) {
      locations.push(...this.locationContext.targetCities);
    }
    
    // Add major UK cities if UK business
    if (this.businessContext.isUkBusiness && locations.length < 3) {
      locations.push(...GEOGRAPHIC_MODIFIERS.cities.slice(0, 5));
    }
    
    return [...new Set(locations)];
  }

  private getTargetLocation(): string {
    return this.locationContext.detectedLocation || 
           this.locationContext.targetCities?.[0] || 
           'your area';
  }

  private getCommonProblem(): string {
    const problems = ['issue', 'problem', 'need', 'requirement', 'solution'];
    return problems[Math.floor(Math.random() * problems.length)];
  }

  private extractContentPhrases(): string[] {
    // Extract 2-4 word phrases from content keywords
    return this.contentKeywords
      .filter(keyword => keyword.split(' ').length >= 2 && keyword.split(' ').length <= 4)
      .slice(0, 20);
  }

  private isBusinessRelevant(phrase: string): boolean {
    const businessTerms = [
      this.businessContext.primaryType.toLowerCase(),
      this.businessContext.subcategory.toLowerCase(),
      ...this.businessContext.services.map(s => s.toLowerCase())
    ];
    
    return businessTerms.some(term => 
      phrase.toLowerCase().includes(term) || 
      term.includes(phrase.toLowerCase())
    );
  }

  private deduplicateKeywords(keywords: KeywordWithMetadata[]): KeywordWithMetadata[] {
    const seen = new Set<string>();
    return keywords.filter(keyword => {
      const key = keyword.keyword.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * Convenience function for generating keywords
 */
export async function generateBusinessKeywords(
  businessContext: BusinessContext,
  locationContext: LocationContext,
  contentKeywords: string[] = []
): Promise<GeneratedKeywordSet> {
  const generator = new DynamicKeywordGenerator(businessContext, locationContext, contentKeywords);
  return await generator.generateKeywordSet();
}