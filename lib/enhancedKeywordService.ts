/**
 * Enhanced Keyword Service
 * Integrates enhanced business detection with dynamic keyword generation
 */

import { EnhancedBusinessDetector, type BusinessDetectionResult } from './enhancedBusinessDetection';
import { 
  DynamicKeywordGenerator, 
  generateBusinessKeywords,
  type BusinessContext,
  type LocationContext,
  type GeneratedKeywordSet,
  type KeywordWithMetadata
} from './dynamicKeywordGenerator';

export interface EnhancedKeywordAnalysis {
  // Enhanced business context
  businessDetection: BusinessDetectionResult;
  locationContext: LocationContext;
  
  // Generated keyword sets
  generatedKeywords: GeneratedKeywordSet;
  
  // Original format for compatibility
  brandedKeywords: number;
  nonBrandedKeywords: number;
  brandedKeywordsList: any[];
  nonBrandedKeywordsList: any[];
  topKeywords: any[];
  topCompetitors: any[];
  
  // Enhanced metrics
  keywordsByIntent: {
    commercial: number;
    informational: number;
    navigational: number;
    transactional: number;
  };
  
  keywordsByDifficulty: {
    low: number;
    medium: number;
    high: number;
  };
  
  // Above fold and competition data
  aboveFoldKeywords?: number;
  aboveFoldKeywordsList?: any[];
  aboveFoldCompetitors?: any;
  
  // Enhanced metadata
  analysisMethod: string;
  industrySpecific: boolean;
  totalGeneratedKeywords: number;
  businessRelevanceScore: number;
  geographicOptimization: boolean;
}

export class EnhancedKeywordService {
  private businessDetector: EnhancedBusinessDetector;
  
  constructor() {
    this.businessDetector = new EnhancedBusinessDetector();
  }

  /**
   * Main enhanced keyword analysis function
   */
  async analyzeKeywordsEnhanced(
    domain: string, 
    html: string, 
    country: string = 'gb'
  ): Promise<EnhancedKeywordAnalysis> {
    try {
      const cleanDomain = domain?.replace(/^https?:\/\//, '')?.replace(/^www\./, '')?.split('/')[0] || 'example.com';
      
      console.log(`\n=== ENHANCED KEYWORD ANALYSIS FOR ${cleanDomain} ===`);
      
      // Step 1: Enhanced business type detection
      console.log('🔍 Step 1: Enhanced Business Detection...');
      const businessDetection = await this.businessDetector.detectBusinessType(cleanDomain, html);
      
      console.log(`✅ Detected: ${businessDetection.primaryType.category} - ${businessDetection.primaryType.subcategory}`);
      console.log(`📊 Confidence: ${businessDetection.primaryType.confidence}`);
      console.log(`🛠️ Methods: ${businessDetection.detectionSources.join(', ')}`);
      
      // Step 2: Extract location context
      console.log('📍 Step 2: Location Context Analysis...');
      const locationContext = this.extractLocationContext(html, cleanDomain, businessDetection);
      
      // Step 3: Build business context
      console.log('🏢 Step 3: Business Context Building...');
      const businessContext = this.buildBusinessContext(cleanDomain, html, businessDetection);
      
      // Step 4: Extract content keywords
      console.log('📄 Step 4: Content Keyword Extraction...');
      const contentKeywords = this.extractContentKeywords(html);
      
      // Step 5: Generate comprehensive keyword sets
      console.log('🎯 Step 5: Dynamic Keyword Generation...');
      const generatedKeywords = await generateBusinessKeywords(
        businessContext,
        locationContext,
        contentKeywords
      );
      
      console.log(`✅ Generated ${generatedKeywords.totalGenerated} keywords across ${Object.keys(generatedKeywords).length - 3} categories`);
      
      // Step 6: Get API data for generated keywords (if available)
      console.log('📊 Step 6: API Data Enhancement...');
      const enhancementResult = await this.enhanceWithApiData(generatedKeywords, country);
      const enhancedKeywords = enhancementResult.keywords;
      const apiAvailable = enhancementResult.apiAvailable;
      
      // Step 7: Analyze above fold keywords (existing functionality)
      console.log('🔝 Step 7: Above Fold Analysis...');
      const aboveFoldAnalysis = await this.getAboveFoldAnalysis(cleanDomain, html, businessDetection, country);
      
      // Step 8: Competition analysis (existing functionality)
      console.log('🏆 Step 8: Competition Analysis...');
      // Use raw keywords (including 0-volume ones) for competition analysis
      const keywordsForCompetition = aboveFoldAnalysis?.rawKeywords || aboveFoldAnalysis?.keywords || [];
      const competitionAnalysis = await this.getCompetitionAnalysis(keywordsForCompetition, cleanDomain);
      
      // Convert to legacy format for compatibility
      const legacyFormat = this.convertToLegacyFormat(enhancedKeywords, businessContext, apiAvailable);
      
      // Step 9: SERP Position Analysis (disabled for now - API method needs implementation)
      // console.log('🔍 Step 9: SERP Position Analysis...');
      // await this.enhanceWithSerpPositions(legacyFormat.nonBrandedKeywordsList, cleanDomain);
      
      // Calculate enhanced metrics
      const metrics = this.calculateEnhancedMetrics(enhancedKeywords);
      
      const result: EnhancedKeywordAnalysis = {
        businessDetection,
        locationContext,
        generatedKeywords: enhancedKeywords,
        
        // Legacy compatibility
        ...legacyFormat,
        
        // Enhanced metrics
        ...metrics,
        
        // Above fold data
        aboveFoldKeywords: aboveFoldAnalysis?.keywords?.length || 0,
        aboveFoldKeywordsList: aboveFoldAnalysis?.keywords || [],
        aboveFoldCompetitors: competitionAnalysis,
        
        // Analysis metadata
        analysisMethod: 'enhanced_dynamic_generation',
        industrySpecific: enhancedKeywords.industrySpecific,
        totalGeneratedKeywords: enhancedKeywords.totalGenerated,
        businessRelevanceScore: this.calculateBusinessRelevanceScore(enhancedKeywords),
        geographicOptimization: locationContext.isLocalBusiness && enhancedKeywords.local.length > 0
      };
      
      console.log(`\n🎉 ENHANCED ANALYSIS COMPLETE:`);
      console.log(`📈 Total Keywords: ${result.totalGeneratedKeywords}`);
      console.log(`🎯 Business Relevance: ${(result.businessRelevanceScore * 100).toFixed(1)}%`);
      console.log(`🌍 Geographic Optimization: ${result.geographicOptimization ? 'Yes' : 'No'}`);
      console.log(`🏭 Industry Specific: ${result.industrySpecific ? 'Yes' : 'No'}`);
      
      return result;
      
    } catch (error) {
      console.error('Enhanced keyword analysis failed:', error);
      // Fallback to basic analysis
      return this.getFallbackAnalysis(domain, html);
    }
  }

  /**
   * Extract location context from content
   */
  private extractLocationContext(html: string, domain: string, businessDetection: BusinessDetectionResult): LocationContext {
    const content = html.toLowerCase();
    
    // Detect if it's a local business
    const localIndicators = [
      'near me', 'local', 'area', 'serving', 'coverage', 'postcode', 
      'address', 'location', 'visit us', 'find us', 'directions'
    ];
    const isLocalBusiness = businessDetection.localBusiness || 
                          localIndicators.some(indicator => content.includes(indicator));
    
    // Extract mentioned locations
    const ukCities = [
      'london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 
      'bristol', 'sheffield', 'edinburgh', 'leeds', 'cardiff'
    ];
    const mentionedCities = ukCities.filter(city => content.includes(city));
    
    // Detect location from domain or content
    let detectedLocation: string | undefined;
    for (const city of ukCities) {
      if (domain.includes(city) || content.includes(`${city} `)) {
        detectedLocation = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    
    return {
      detectedLocation,
      isLocalBusiness,
      serviceArea: mentionedCities.length > 0 ? mentionedCities : undefined,
      targetCities: mentionedCities.slice(0, 5)
    };
  }

  /**
   * Build comprehensive business context
   */
  private buildBusinessContext(domain: string, html: string, businessDetection: BusinessDetectionResult): BusinessContext {
    const brandName = this.extractBrandName(domain, html);
    const services = this.extractServices(html, businessDetection.primaryType.category);
    
    return {
      primaryType: businessDetection.primaryType.category,
      subcategory: businessDetection.primaryType.subcategory,
      businessName: brandName,
      services,
      isUkBusiness: businessDetection.ukSpecific,
      companySize: businessDetection.companySize
    };
  }

  /**
   * Extract brand name from domain and content
   */
  private extractBrandName(domain: string, html: string): string {
    // Try to extract from domain
    const domainParts = domain.replace(/\.(com|co\.uk|uk|org|net)$/, '').split('.');
    let brandCandidate = domainParts[0] || 'business';
    
    // Clean up common prefixes/suffixes
    brandCandidate = brandCandidate
      .replace(/^(www|the|a|an)/, '')
      .replace(/(ltd|limited|inc|corp|company)$/, '')
      .trim();
    
    // Try to find brand name in HTML title or h1
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)</i);
    
    if (titleMatch && titleMatch[1].length < 50) {
      const titleWords = titleMatch[1].split(/\s+/).slice(0, 2);
      if (titleWords.length > 0 && titleWords[0].length > 2) {
        brandCandidate = titleWords.join(' ');
      }
    }
    
    return brandCandidate.charAt(0).toUpperCase() + brandCandidate.slice(1).toLowerCase();
  }

  /**
   * Extract services from content based on business type
   */
  private extractServices(html: string, businessType: string): string[] {
    const content = html.toLowerCase();
    const services: string[] = [];
    
    // Common service patterns
    const servicePatterns = [
      /\bour services?\b[^.]*?(?:include|are|offer)[^.]*?([^.]+)/gi,
      /\bwe (provide|offer|specialize in|deliver)[^.]*?([^.]+)/gi,
      /\bservices?\s*:?\s*([^.]+)/gi
    ];
    
    servicePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract service terms
          const serviceText = match.replace(/[^a-z\s]/g, ' ');
          const words = serviceText.split(/\s+/).filter(w => w.length > 2);
          if (words.length >= 2 && words.length <= 4) {
            services.push(words.join(' '));
          }
        });
      }
    });
    
    // Extract from navigation or lists
    const navMatches = html.match(/<nav[^>]*>(.*?)<\/nav>/gis) || [];
    const listMatches = html.match(/<ul[^>]*>(.*?)<\/ul>/gis) || [];
    
    [...navMatches, ...listMatches].forEach(match => {
      const cleanText = match.replace(/<[^>]+>/g, ' ').toLowerCase();
      const items = cleanText.split(/\n|,|\|/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 30);
      services.push(...items);
    });
    
    // Return unique, relevant services
    return [...new Set(services)].slice(0, 10);
  }

  /**
   * Extract content keywords for supplementing generated keywords
   */
  private extractContentKeywords(html: string): string[] {
    const text = this.extractTextFromHtml(html);
    const words = text.toLowerCase().split(/\s+/);
    
    // Extract meaningful phrases (2-4 words)
    const phrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      for (let length = 2; length <= 4 && i + length <= words.length; length++) {
        const phrase = words.slice(i, i + length).join(' ');
        if (this.isValidKeywordPhrase(phrase)) {
          phrases.push(phrase);
        }
      }
    }
    
    // Count frequency and return most common
    const phraseCount = new Map<string, number>();
    phrases.forEach(phrase => {
      phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1);
    });
    
    return Array.from(phraseCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .map(([phrase]) => phrase);
  }

  /**
   * Check if a phrase is a valid keyword candidate
   */
  private isValidKeywordPhrase(phrase: string): boolean {
    if (phrase.length < 4 || phrase.length > 50) return false;
    
    const words = phrase.split(' ');
    if (words.length < 2) return false;
    
    // Filter out common stop phrases
    const stopPhrases = ['this is', 'there are', 'it is', 'you can', 'we are', 'they are'];
    if (stopPhrases.some(stop => phrase.includes(stop))) return false;
    
    // Must contain at least one meaningful word
    const meaningfulWords = words.filter(word => 
      word.length > 2 && 
      !/^(the|and|but|or|for|nor|on|at|to|from|up|by|in|of|with)$/.test(word)
    );
    
    return meaningfulWords.length >= 1;
  }

  /**
   * Extract clean text from HTML
   */
  private extractTextFromHtml(html: string): string {
    if (!html) return '';
    
    // Remove script and style elements
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags and decode entities
    const text = cleanHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    return text;
  }


  /**
   * Get above fold analysis (delegate to existing service)
   */
  private async getAboveFoldAnalysis(domain: string, html: string, businessDetection: BusinessDetectionResult, country: string) {
    try {
      const { AboveFoldDiscoveryService } = await import('./aboveFoldDiscovery');
      const service = new AboveFoldDiscoveryService(domain);
      
      return await service.discoverAboveFoldKeywords(
        html, 
        country, 
        undefined, 
        businessDetection.primaryType.category
      );
    } catch (error) {
      console.error('Above fold analysis failed:', error);
      return null;
    }
  }

  /**
   * Get competition analysis (delegate to existing service)
   */
  private async getCompetitionAnalysis(aboveFoldKeywords: any[], domain: string) {
    if (aboveFoldKeywords.length === 0) return null;
    
    try {
      const { KeywordCompetitionService } = await import('./keywordCompetitionService');
      const service = new KeywordCompetitionService(domain);
      
      const rawAnalysis = await service.analyzeCompetitorOverlap(aboveFoldKeywords);
      
      // Transform to expected format for AboveFoldCompetitorTable
      if (rawAnalysis && rawAnalysis.competitors) {
        return this.transformCompetitionAnalysis(rawAnalysis);
      }
      
      return null;
    } catch (error) {
      console.error('Competition analysis failed:', error);
      return null;
    }
  }

  /**
   * Transform KeywordCompetitionAnalysis to CompetitorAnalysis format
   */
  private transformCompetitionAnalysis(rawAnalysis: any) {
    const { competitors } = rawAnalysis;
    
    if (!competitors || competitors.length === 0) {
      return null;
    }

    // Calculate average overlap
    const averageOverlap = Math.round(
      competitors.reduce((sum: number, comp: any) => sum + comp.overlapPercentage, 0) / competitors.length
    );

    // Determine competition intensity
    let competitionIntensity: 'high' | 'medium' | 'low' = 'low';
    if (averageOverlap >= 60) competitionIntensity = 'high';
    else if (averageOverlap >= 30) competitionIntensity = 'medium';

    // Transform competitor data to match expected interface
    const transformedCompetitors = competitors.map((comp: any) => ({
      domain: comp.domain,
      overlap: comp.overlapPercentage,
      keywords: comp.overlapCount,
      authority: Math.floor(Math.random() * 50) + 30, // Placeholder - would need DA API
      description: `Competes for ${comp.overlapCount} shared keywords`,
      matchingKeywords: comp.sharedKeywords || [],
      competitionLevel: comp.overlapPercentage >= 60 ? 'high' : 
                       comp.overlapPercentage >= 30 ? 'medium' : 'low'
    }));

    // Create basic keyword clusters from shared keywords
    const keywordClusters: { [industry: string]: string[] } = {};
    competitors.forEach((comp: any) => {
      if (comp.sharedKeywords && comp.sharedKeywords.length > 0) {
        keywordClusters[comp.domain] = comp.sharedKeywords.slice(0, 5);
      }
    });

    return {
      competitors: transformedCompetitors,
      totalCompetitors: competitors.length,
      averageOverlap,
      competitionIntensity,
      keywordClusters
    };
  }

  /**
   * Convert enhanced keywords to legacy format for compatibility
   */
  private convertToLegacyFormat(keywords: GeneratedKeywordSet, businessContext: BusinessContext, apiAvailable: boolean = true) {
    // Combine all keywords and mark as branded/non-branded
    const allKeywords = [
      ...keywords.primary,
      ...keywords.secondary,
      ...keywords.longTail,
      ...keywords.local,
      ...keywords.commercial,
      ...keywords.informational,
      ...keywords.urgency
    ];
    
    const brandName = businessContext.businessName.toLowerCase();
    
    const brandedKeywordsList = allKeywords
      .filter(k => k.keyword.toLowerCase().includes(brandName))
      .map(k => ({
        keyword: k.keyword,
        position: 0,
        volume: apiAvailable ? (k.volume || null) : null,
        difficulty: this.mapDifficulty(k.difficulty),
        type: 'branded' as const
      }));
    
    const nonBrandedKeywordsList = allKeywords
      .filter(k => {
        const isNotBranded = !k.keyword.toLowerCase().includes(brandName);
        const hasBusinessRelevance = k.businessRelevance >= 0.6; // Only high-relevance keywords
        const hasValidVolume = k.volume === null || (k.volume >= 50 && k.volume <= 10000); // Volume limits
        const isNotGeneric = this.isBusinessSpecificKeyword(k.keyword, businessContext);
        
        // console.log(`🔍 Filtering "${k.keyword}": branded=${!isNotBranded}, relevance=${k.businessRelevance}, volume=${k.volume}, specific=${isNotGeneric}`);
        
        return isNotBranded && hasBusinessRelevance && hasValidVolume && isNotGeneric;
      })
      .sort((a, b) => b.businessRelevance - a.businessRelevance) // Sort by business relevance
      .slice(0, 30) // Limit to top 30 most relevant
      .map(k => ({
        keyword: k.keyword,
        position: 0, // Will be updated with real SERP data if available
        volume: apiAvailable ? (k.volume || null) : null,
        difficulty: this.mapDifficulty(k.difficulty),
        type: 'non-branded' as const
      }));
    
    // Top keywords (highest relevance)
    const topKeywords = allKeywords
      .sort((a, b) => b.businessRelevance - a.businessRelevance)
      .slice(0, 20)
      .map(k => ({
        keyword: k.keyword,
        position: 0,
        volume: apiAvailable ? (k.volume || null) : null,
        difficulty: this.mapDifficulty(k.difficulty),
        type: k.keyword.toLowerCase().includes(brandName) ? 'branded' as const : 'non-branded' as const
      }));
    
    console.log(`🔍 KEYWORD GENERATION DEBUG:`);
    console.log(`   Branded keywords: ${brandedKeywordsList.length}`);
    console.log(`   Non-branded keywords (after filtering): ${nonBrandedKeywordsList.length}`);
    console.log(`   Sample non-branded keywords: ${nonBrandedKeywordsList.slice(0, 3).map(k => k.keyword).join(', ')}`);
    
    return {
      brandedKeywords: brandedKeywordsList.length,
      nonBrandedKeywords: nonBrandedKeywordsList.length,
      brandedKeywordsList,
      nonBrandedKeywordsList,
      topKeywords,
      topCompetitors: [] // Will be filled by competition analysis
    };
  }

  /**
   * Enhance generated keywords with real API data
   */
  private async enhanceWithApiData(keywords: GeneratedKeywordSet, country: string = 'gb'): Promise<{ keywords: GeneratedKeywordSet, apiAvailable: boolean }> {
    try {
      // Collect all unique keywords from all categories
      const allKeywords = [
        ...keywords.primary,
        ...keywords.secondary,
        ...keywords.longTail,
        ...keywords.local,
        ...keywords.commercial,
        ...keywords.informational,
        ...keywords.urgency
      ];
      
      const uniqueKeywords = [...new Set(allKeywords.map(k => k.keyword))];
      console.log(`📊 Enhancing ${uniqueKeywords.length} keywords with API data...`);
      
      // Get real volumes from Keywords Everywhere API
      const { KeywordsEverywhereService } = await import('./keywordsEverywhereService');
      const keService = new KeywordsEverywhereService();
      const volumeData = await keService.getSearchVolumes(uniqueKeywords, country);
      
      // Create volume lookup map
      const volumeMap = new Map(volumeData.map(v => [v.keyword.toLowerCase(), v.volume]));
      
      // Helper function to update keyword with real volume (NO FALLBACK)
      const updateKeywordVolume = (keyword: any) => ({
        ...keyword,
        volume: volumeMap.get(keyword.keyword.toLowerCase()) || null // null if no API data
      });
      
      // Update all keyword categories with real API data
      const enhancedKeywords = {
        ...keywords,
        primary: keywords.primary.map(updateKeywordVolume),
        secondary: keywords.secondary.map(updateKeywordVolume),
        longTail: keywords.longTail.map(updateKeywordVolume),
        local: keywords.local.map(updateKeywordVolume),
        commercial: keywords.commercial.map(updateKeywordVolume),
        informational: keywords.informational.map(updateKeywordVolume),
        urgency: keywords.urgency.map(updateKeywordVolume)
      };
      
      console.log(`✅ API enhancement successful - real volumes applied`);
      return { keywords: enhancedKeywords, apiAvailable: true };
      
    } catch (error) {
      console.warn('⚠️ API enhancement failed:', error.message);
      return { keywords, apiAvailable: false }; // Return original keywords, mark API as unavailable
    }
  }

  /**
   * Calculate enhanced metrics
   */
  private calculateEnhancedMetrics(keywords: GeneratedKeywordSet) {
    const allKeywords = [
      ...keywords.primary,
      ...keywords.secondary,
      ...keywords.longTail,
      ...keywords.local,
      ...keywords.commercial,
      ...keywords.informational,
      ...keywords.urgency
    ];
    
    // Group by intent
    const intentCounts = {
      commercial: allKeywords.filter(k => k.intent === 'commercial').length,
      informational: allKeywords.filter(k => k.intent === 'informational').length,
      navigational: allKeywords.filter(k => k.intent === 'navigational').length,
      transactional: allKeywords.filter(k => k.intent === 'transactional').length
    };
    
    // Group by difficulty
    const difficultyCounts = {
      low: allKeywords.filter(k => k.difficulty === 'low').length,
      medium: allKeywords.filter(k => k.difficulty === 'medium').length,
      high: allKeywords.filter(k => k.difficulty === 'high').length
    };
    
    return {
      keywordsByIntent: intentCounts,
      keywordsByDifficulty: difficultyCounts
    };
  }

  /**
   * Calculate business relevance score
   */
  private calculateBusinessRelevanceScore(keywords: GeneratedKeywordSet): number {
    const allKeywords = [
      ...keywords.primary,
      ...keywords.secondary,
      ...keywords.longTail,
      ...keywords.local,
      ...keywords.commercial,
      ...keywords.informational,
      ...keywords.urgency
    ];
    
    if (allKeywords.length === 0) return 0;
    
    const totalRelevance = allKeywords.reduce((sum, k) => sum + k.businessRelevance, 0);
    return totalRelevance / allKeywords.length;
  }

  /**
   * Enhance non-branded keywords with real SERP positions
   */
  private async enhanceWithSerpPositions(keywords: any[], domain: string): Promise<void> {
    try {
      // Only check positions for top 10 keywords to save API credits
      const topKeywords = keywords.slice(0, 10);
      
      if (topKeywords.length === 0) {
        console.log('⚠️ No keywords to check positions for');
        return;
      }
      
      // Check if ValueSERP is available
      const hasValueSerp = !!process.env.VALUESERP_API_KEY;
      if (!hasValueSerp) {
        console.log('⚠️ ValueSERP API not configured - position data unavailable');
        return;
      }
      
      console.log(`🔍 Checking SERP positions for ${topKeywords.length} top non-branded keywords...`);
      
      const { ValueSerpService } = await import('./valueSerpService');
      const serpService = new ValueSerpService();
      
      // Check positions for each keyword
      for (let i = 0; i < topKeywords.length; i++) {
        const keyword = topKeywords[i];
        try {
          console.log(`📊 Checking position for "${keyword.keyword}" (${i + 1}/${topKeywords.length})...`);
          const position = await serpService.checkKeywordPosition(keyword.keyword, domain);
          
          if (position && position > 0 && position <= 100) {
            keyword.position = position;
            console.log(`✅ Found ranking: "${keyword.keyword}" - Position ${position}`);
          } else {
            console.log(`❌ Not ranking: "${keyword.keyword}"`);
          }
          
          // Small delay to respect API limits
          if (i < topKeywords.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.warn(`⚠️ Error checking position for "${keyword.keyword}":`, error.message);
        }
      }
      
      console.log(`✅ SERP position analysis complete`);
      
    } catch (error) {
      console.error('❌ SERP position enhancement failed:', error);
    }
  }

  /**
   * Check if a keyword is business-specific rather than generic
   */
  private isBusinessSpecificKeyword(keyword: string, businessContext: BusinessContext): boolean {
    const lowerKeyword = keyword.toLowerCase();
    
    // Filter out overly generic terms that are too competitive for SMBs
    const genericTerms = [
      // Core generic marketing terms
      'digital marketing', 'online marketing', 'internet marketing', 'marketing',
      'marketing services', 'digital marketing services', 'online marketing services',
      
      // Web/design generic terms
      'web design', 'website design', 'web development', 'website development',
      
      // SEO/SEM generic terms
      'seo', 'seo services', 'search engine optimization', 'sem', 'ppc',
      
      // Social/content generic terms
      'social media', 'social media marketing', 'content marketing', 'content marketing strategy',
      
      // Business generic terms
      'advertising', 'branding', 'graphic design', 'consulting', 'services',
      'business', 'company', 'agency', 'solutions', 'software', 'technology',
      
      // Vague service terms
      'open services', 'close services', 'professional services', 'expert services',
      'specialist services', 'commercial services', 'residential services'
    ];
    
    // Reject if it's a generic term
    if (genericTerms.some(term => lowerKeyword === term)) {
      return false;
    }
    
    // MUCH MORE RESTRICTIVE: Accept only if it includes business name, location, or very specific services
    const businessName = businessContext.businessName.toLowerCase();
    const hasBusinessName = lowerKeyword.includes(businessName);
    const hasLocation = /\b(london|birmingham|manchester|sussex|kent|surrey|devon|cornwall|essex|yorkshire)\b/.test(lowerKeyword);
    
    // Only accept very specific service combinations (not just any service)
    const hasSpecificService = businessContext.services.some(service => 
      lowerKeyword.includes(service.toLowerCase()) && lowerKeyword.split(' ').length >= 3
    );
    
    // Must be very specific: 4+ words OR include business name OR include location
    const wordCount = lowerKeyword.split(' ').length;
    const isVerySpecific = wordCount >= 4;
    
    // Additional checks for business-relevant terms
    const hasBusinessModifier = /\b(consultation|strategy|pricing|cost|quote|near me|in [a-z]+|agency in|services in)\b/.test(lowerKeyword);
    
    return hasBusinessName || hasLocation || (isVerySpecific && hasBusinessModifier) || hasSpecificService;
  }

  /**
   * Helper methods
   */
  private estimateVolume(potential: 'low' | 'medium' | 'high'): number {
    switch (potential) {
      case 'high': return 1000;
      case 'medium': return 300;
      case 'low': return 100;
    }
  }

  private mapDifficulty(difficulty: 'low' | 'medium' | 'high'): number {
    switch (difficulty) {
      case 'high': return 80;
      case 'medium': return 50;
      case 'low': return 20;
    }
  }

  /**
   * Fallback analysis when enhanced analysis fails
   */
  private async getFallbackAnalysis(domain: string, html: string): Promise<EnhancedKeywordAnalysis> {
    // Import and use original keyword service
    const { analyzeKeywords } = await import('./keywordService');
    const basicAnalysis = await analyzeKeywords(domain, html);
    
    // Convert to enhanced format
    return {
      businessDetection: {
        primaryType: { category: 'Business Services', subcategory: 'General', confidence: 'low', detectionMethods: ['fallback'], relevantKeywords: [] },
        secondaryTypes: [],
        ukSpecific: false,
        localBusiness: false,
        companySize: 'small',
        detectionSources: ['fallback']
      },
      locationContext: { isLocalBusiness: false },
      generatedKeywords: {
        primary: [],
        secondary: [],
        longTail: [],
        local: [],
        commercial: [],
        informational: [],
        urgency: [],
        totalGenerated: 0,
        industrySpecific: false,
        generationMethod: 'fallback'
      },
      ...basicAnalysis,
      keywordsByIntent: { commercial: 0, informational: 0, navigational: 0, transactional: 0 },
      keywordsByDifficulty: { low: 0, medium: 0, high: 0 },
      analysisMethod: 'fallback_basic',
      industrySpecific: false,
      totalGeneratedKeywords: basicAnalysis.topKeywords.length,
      businessRelevanceScore: 0.5,
      geographicOptimization: false
    };
  }
}

/**
 * Main export function that replaces the original analyzeKeywords
 */
export async function analyzeKeywordsEnhanced(
  domain: string, 
  html: string, 
  country: string = 'gb'
): Promise<EnhancedKeywordAnalysis> {
  const service = new EnhancedKeywordService();
  return await service.analyzeKeywordsEnhanced(domain, html, country);
}