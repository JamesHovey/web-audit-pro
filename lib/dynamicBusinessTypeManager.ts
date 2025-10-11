/**
 * Dynamic Business Type Manager
 * Manages the addition of new business types discovered through intelligent analysis
 */

import { INDUSTRY_KEYWORD_DATABASE, type ServiceKeywords } from './industryKeywordDatabase';
import type { ExtractedBusinessData } from './intelligentBusinessAnalyzer';

export interface DynamicBusinessType {
  category: string;
  subcategory: string;
  keywords: string[];
  ukTerms: string[];
  schemas: string[];
  urlPatterns: string[];
  serviceKeywords: ServiceKeywords;
  confidence: number;
  source: 'content_analysis' | 'companies_house' | 'user_input';
  createdAt: Date;
}

export interface BusinessTypeExpansion {
  isNewType: boolean;
  isNewSubcategory: boolean;
  addedKeywords: string[];
  enhancedType: DynamicBusinessType;
}

export class DynamicBusinessTypeManager {
  
  /**
   * Check if business type exists and enhance/create as needed
   */
  checkAndEnhanceBusinessType(
    category: string,
    subcategory: string,
    extractedData: ExtractedBusinessData
  ): BusinessTypeExpansion {
    console.log(`🔍 Checking business type: ${category} - ${subcategory}`);
    
    const existingType = INDUSTRY_KEYWORD_DATABASE[category];
    
    if (!existingType) {
      // Completely new business type
      console.log(`➕ Creating new business type: ${category}`);
      const newType = this.createNewBusinessType(category, subcategory, extractedData);
      return {
        isNewType: true,
        isNewSubcategory: true,
        addedKeywords: newType.keywords,
        enhancedType: newType
      };
    }
    
    const existingSubcategory = existingType[subcategory];
    
    if (!existingSubcategory) {
      // New subcategory for existing type
      console.log(`➕ Adding new subcategory: ${subcategory} to ${category}`);
      const enhancedType = this.addSubcategoryToExistingType(category, subcategory, extractedData);
      return {
        isNewType: false,
        isNewSubcategory: true,
        addedKeywords: enhancedType.keywords,
        enhancedType
      };
    }
    
    // Existing type - enhance with new keywords if found
    console.log(`🔧 Enhancing existing type: ${category} - ${subcategory}`);
    const enhancedType = this.enhanceExistingType(category, subcategory, extractedData);
    return {
      isNewType: false,
      isNewSubcategory: false,
      addedKeywords: enhancedType.addedKeywords,
      enhancedType: enhancedType.type
    };
  }
  
  /**
   * Create completely new business type from extracted data
   */
  private createNewBusinessType(
    category: string,
    subcategory: string,
    extractedData: ExtractedBusinessData
  ): DynamicBusinessType {
    
    // Extract keywords from various sources
    const primaryKeywords = this.extractPrimaryKeywords(extractedData);
    const secondaryKeywords = this.extractSecondaryKeywords(extractedData);
    const longTailKeywords = this.extractLongTailKeywords(extractedData);
    const commercialKeywords = this.extractCommercialKeywords(extractedData);
    const informationalKeywords = this.extractInformationalKeywords(extractedData);
    const localKeywords = this.extractLocalKeywords(extractedData);
    const urgencyKeywords = this.extractUrgencyKeywords(extractedData);
    
    // Extract UK-specific terms
    const ukTerms = this.extractUKTerms(extractedData);
    
    // Generate likely URL patterns
    const urlPatterns = this.generateUrlPatterns(extractedData);
    
    // Generate schema types
    const schemas = this.generateSchemaTypes(category, extractedData);
    
    const serviceKeywords: ServiceKeywords = {
      primary: primaryKeywords,
      secondary: secondaryKeywords,
      longTail: longTailKeywords,
      commercial: commercialKeywords,
      informational: informationalKeywords,
      local: localKeywords,
      urgency: urgencyKeywords
    };
    
    const allKeywords = [
      ...primaryKeywords,
      ...secondaryKeywords.slice(0, 10), // Limit to prevent bloat
      ...extractedData.industryTerms.slice(0, 5)
    ];
    
    return {
      category,
      subcategory,
      keywords: [...new Set(allKeywords)],
      ukTerms,
      schemas,
      urlPatterns,
      serviceKeywords,
      confidence: this.calculateConfidence(extractedData),
      source: 'content_analysis',
      createdAt: new Date()
    };
  }
  
  /**
   * Add new subcategory to existing business type
   */
  private addSubcategoryToExistingType(
    category: string,
    subcategory: string,
    extractedData: ExtractedBusinessData
  ): DynamicBusinessType {
    
    const baseType = INDUSTRY_KEYWORD_DATABASE[category];
    const baseSubcategory = Object.values(baseType)[0]; // Use first subcategory as template
    
    // Create new service keywords specific to this subcategory
    const serviceKeywords = this.createServiceKeywordsForSubcategory(subcategory, extractedData, baseSubcategory);
    
    // Extract subcategory-specific keywords
    const subcategoryKeywords = this.extractSubcategorySpecificKeywords(subcategory, extractedData);
    
    return {
      category,
      subcategory,
      keywords: subcategoryKeywords,
      ukTerms: this.extractUKTerms(extractedData),
      schemas: this.generateSchemaTypes(category, extractedData),
      urlPatterns: this.generateUrlPatterns(extractedData),
      serviceKeywords,
      confidence: this.calculateConfidence(extractedData),
      source: 'content_analysis',
      createdAt: new Date()
    };
  }
  
  /**
   * Enhance existing business type with new keywords
   */
  private enhanceExistingType(
    category: string,
    subcategory: string,
    extractedData: ExtractedBusinessData
  ): { type: DynamicBusinessType; addedKeywords: string[] } {
    
    const existingType = INDUSTRY_KEYWORD_DATABASE[category][subcategory];
    
    // Find new keywords not in existing database
    const allExtractedKeywords = [
      ...extractedData.primaryActivities.flatMap(a => a.keywords),
      ...extractedData.services,
      ...extractedData.industryTerms
    ];
    
    const newKeywords = allExtractedKeywords.filter(keyword => 
      !existingType.primary.includes(keyword) &&
      !existingType.secondary.includes(keyword) &&
      keyword.length > 2
    );
    
    // Create enhanced version
    const enhancedServiceKeywords: ServiceKeywords = {
      primary: existingType.primary,
      secondary: [...existingType.secondary, ...newKeywords.slice(0, 5)],
      longTail: existingType.longTail,
      commercial: existingType.commercial,
      informational: existingType.informational,
      local: existingType.local,
      urgency: existingType.urgency
    };
    
    return {
      type: {
        category,
        subcategory,
        keywords: [...existingType.primary, ...existingType.secondary, ...newKeywords.slice(0, 10)],
        ukTerms: this.extractUKTerms(extractedData),
        schemas: this.generateSchemaTypes(category, extractedData),
        urlPatterns: this.generateUrlPatterns(extractedData),
        serviceKeywords: enhancedServiceKeywords,
        confidence: this.calculateConfidence(extractedData),
        source: 'content_analysis',
        createdAt: new Date()
      },
      addedKeywords: newKeywords.slice(0, 10)
    };
  }
  
  /**
   * Extract primary keywords from business activities
   */
  private extractPrimaryKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    // Get keywords from top business activities
    extractedData.primaryActivities.forEach(activity => {
      activity.keywords.forEach(keyword => keywords.add(keyword));
    });
    
    // Add core service terms
    extractedData.services.slice(0, 5).forEach(service => {
      keywords.add(service.toLowerCase());
    });
    
    return Array.from(keywords).slice(0, 10);
  }
  
  /**
   * Extract secondary keywords (variations and related terms)
   */
  private extractSecondaryKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    // Add service variations
    extractedData.services.forEach(service => {
      keywords.add(`${service} services`);
      keywords.add(`professional ${service}`);
      keywords.add(`${service} provider`);
    });
    
    // Add business model terms
    if (extractedData.businessModel === 'B2B') {
      keywords.add('commercial');
      keywords.add('business');
      keywords.add('corporate');
    } else if (extractedData.businessModel === 'B2C') {
      keywords.add('personal');
      keywords.add('individual');
      keywords.add('family');
    }
    
    return Array.from(keywords).slice(0, 15);
  }
  
  /**
   * Extract long-tail keywords (specific problems and solutions)
   */
  private extractLongTailKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    // Extract from service descriptions
    extractedData.websiteContent.serviceDescriptions.forEach(description => {
      // Extract meaningful phrases
      const phrases = description.split(/[,.]/).filter(phrase => 
        phrase.length > 20 && phrase.length < 80 && 
        (phrase.includes('we ') || phrase.includes('our ') || phrase.includes('providing'))
      );
      
      phrases.forEach(phrase => {
        const cleaned = phrase.replace(/^(we |our |providing )/i, '').trim();
        if (cleaned.length > 10) {
          keywords.add(cleaned);
        }
      });
    });
    
    // Add target market specific long-tail
    extractedData.targetMarket.forEach(market => {
      extractedData.services.slice(0, 3).forEach(service => {
        keywords.add(`${service} for ${market}`);
      });
    });
    
    return Array.from(keywords).slice(0, 12);
  }
  
  /**
   * Extract commercial intent keywords
   */
  private extractCommercialKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    extractedData.services.forEach(service => {
      keywords.add(`${service} cost`);
      keywords.add(`${service} price`);
      keywords.add(`${service} quote`);
      keywords.add(`hire ${service}`);
      keywords.add(`book ${service}`);
    });
    
    return Array.from(keywords).slice(0, 15);
  }
  
  /**
   * Extract informational keywords
   */
  private extractInformationalKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    extractedData.services.forEach(service => {
      keywords.add(`what is ${service}`);
      keywords.add(`how to choose ${service}`);
      keywords.add(`${service} guide`);
      keywords.add(`${service} tips`);
    });
    
    return Array.from(keywords).slice(0, 12);
  }
  
  /**
   * Extract local keywords
   */
  private extractLocalKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    extractedData.services.slice(0, 3).forEach(service => {
      keywords.add(`${service} near me`);
      keywords.add(`local ${service}`);
    });
    
    extractedData.locationIndicators.forEach(location => {
      extractedData.services.slice(0, 2).forEach(service => {
        keywords.add(`${service} in ${location}`);
        keywords.add(`${location} ${service}`);
      });
    });
    
    return Array.from(keywords).slice(0, 15);
  }
  
  /**
   * Extract urgency keywords
   */
  private extractUrgencyKeywords(extractedData: ExtractedBusinessData): string[] {
    const keywords = new Set<string>();
    
    extractedData.services.slice(0, 3).forEach(service => {
      keywords.add(`urgent ${service}`);
      keywords.add(`emergency ${service}`);
      keywords.add(`same day ${service}`);
    });
    
    return Array.from(keywords).slice(0, 10);
  }
  
  /**
   * Extract UK-specific terms
   */
  private extractUKTerms(extractedData: ExtractedBusinessData): string[] {
    const ukTerms = new Set<string>();
    
    // Extract UK-specific language from content
    const allText = [
      extractedData.websiteContent.aboutText,
      ...extractedData.websiteContent.serviceDescriptions
    ].join(' ').toLowerCase();
    
    // Common UK business terms
    const ukIndicators = [
      'ltd', 'limited', 'uk', 'british', 'england', 'scotland', 'wales',
      'vat', 'hmrc', 'companies house', 'high street', 'city centre',
      'enquiry', 'enquiries', 'colour', 'favour', 'centre'
    ];
    
    ukIndicators.forEach(term => {
      if (allText.includes(term)) {
        ukTerms.add(term);
      }
    });
    
    return Array.from(ukTerms);
  }
  
  /**
   * Generate likely URL patterns
   */
  private generateUrlPatterns(extractedData: ExtractedBusinessData): string[] {
    const patterns = new Set<string>();
    
    // Add patterns from navigation
    extractedData.websiteContent.navigation.forEach(navItem => {
      const cleaned = navItem.replace(/<[^>]*>/g, '').toLowerCase().replace(/\s+/g, '-');
      if (cleaned.length > 1) {
        patterns.add(`/${cleaned}`);
      }
    });
    
    // Add service-based patterns
    extractedData.services.slice(0, 5).forEach(service => {
      const serviceSlug = service.toLowerCase().replace(/\s+/g, '-');
      patterns.add(`/${serviceSlug}`);
      patterns.add(`/services/${serviceSlug}`);
    });
    
    return Array.from(patterns).slice(0, 10);
  }
  
  /**
   * Generate schema types
   */
  private generateSchemaTypes(category: string, extractedData: ExtractedBusinessData): string[] {
    const schemas = ['LocalBusiness', 'Organization'];
    
    // Add category-specific schemas
    const schemaMap: { [key: string]: string[] } = {
      'Fitness & Sports': ['SportsActivityLocation', 'ExerciseGym', 'HealthClub'],
      'Legal Services': ['LegalService', 'Attorney', 'ProfessionalService'],
      'Food & Hospitality': ['Restaurant', 'FoodEstablishment', 'Hotel'],
      'Healthcare & Medical': ['MedicalOrganization', 'Physician', 'Hospital'],
      'Architecture & Design': ['ProfessionalService', 'Architect'],
      'Financial Services': ['FinancialService', 'AccountingService']
    };
    
    if (schemaMap[category]) {
      schemas.push(...schemaMap[category]);
    }
    
    return schemas;
  }
  
  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(extractedData: ExtractedBusinessData): number {
    let score = 0;
    
    // Strong business activity identification
    if (extractedData.primaryActivities.length > 0 && extractedData.primaryActivities[0].confidence > 0.8) {
      score += 0.4;
    }
    
    // Good service identification
    if (extractedData.services.length >= 3) {
      score += 0.3;
    }
    
    // Clear navigation structure
    if (extractedData.websiteContent.navigation.length >= 4) {
      score += 0.2;
    }
    
    // Rich content descriptions
    if (extractedData.websiteContent.serviceDescriptions.length >= 3) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }
  
  /**
   * Create service keywords for new subcategory
   */
  private createServiceKeywordsForSubcategory(
    subcategory: string,
    extractedData: ExtractedBusinessData,
    baseTemplate: ServiceKeywords
  ): ServiceKeywords {
    
    return {
      primary: this.extractPrimaryKeywords(extractedData),
      secondary: this.extractSecondaryKeywords(extractedData),
      longTail: this.extractLongTailKeywords(extractedData),
      commercial: this.extractCommercialKeywords(extractedData),
      informational: this.extractInformationalKeywords(extractedData),
      local: this.extractLocalKeywords(extractedData),
      urgency: this.extractUrgencyKeywords(extractedData)
    };
  }
  
  /**
   * Extract keywords specific to subcategory
   */
  private extractSubcategorySpecificKeywords(
    subcategory: string,
    extractedData: ExtractedBusinessData
  ): string[] {
    const keywords = new Set<string>();
    
    // Add subcategory name variations
    keywords.add(subcategory.toLowerCase());
    keywords.add(subcategory.toLowerCase().replace(/\s+/g, ''));
    
    // Add subcategory-related terms from content
    const subcategoryWords = subcategory.toLowerCase().split(/\s+/);
    subcategoryWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word);
      }
    });
    
    // Add top services that relate to subcategory
    extractedData.services.slice(0, 5).forEach(service => {
      keywords.add(service.toLowerCase());
    });
    
    return Array.from(keywords);
  }
}

// Export convenience function
export function checkAndEnhanceBusinessType(
  category: string,
  subcategory: string,
  extractedData: ExtractedBusinessData
): BusinessTypeExpansion {
  const manager = new DynamicBusinessTypeManager();
  return manager.checkAndEnhanceBusinessType(category, subcategory, extractedData);
}