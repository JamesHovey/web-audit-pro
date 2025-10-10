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
      
      // Step 9: SERP Position Analysis for both branded and non-branded keywords
      console.log('🔍 Step 9: SERP Position Analysis...');
      await this.enhanceWithSerpPositions(legacyFormat.brandedKeywordsList, cleanDomain, 'branded');
      await this.enhanceWithSerpPositions(legacyFormat.nonBrandedKeywordsList, cleanDomain, 'non-branded');
      
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
    const brandCandidates: { source: string; value: string; confidence: number }[] = [];
    
    // Clean domain for comparison
    const domainParts = domain.replace(/\.(com|co\.uk|uk|org|net|io|app)$/, '').split('.');
    let domainBrand = domainParts[0] || 'business';
    domainBrand = domainBrand
      .replace(/^(www|the|a|an)/, '')
      .replace(/(ltd|limited|inc|corp|company)$/, '')
      .trim();
    const domainBrandFormatted = domainBrand.charAt(0).toUpperCase() + domainBrand.slice(1).toLowerCase();
    
    // Helper function to clean and validate brand names
    const cleanBrandName = (name: string): string | null => {
      if (!name) return null;
      const cleaned = name.trim().replace(/[^\w\s&.-]/g, '').trim();
      if (cleaned.length < 2 || cleaned.length > 100) return null;
      
      // Skip generic words
      const genericWords = ['home', 'welcome', 'index', 'main', 'website', 'site', 'page', 'loading', 'error', 'test'];
      if (genericWords.includes(cleaned.toLowerCase())) return null;
      
      return cleaned;
    };

    // 1. HIGHEST PRIORITY: Schema.org/JSON-LD structured data
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          const data = JSON.parse(jsonContent);
          
          // Check for Organization schema
          if (data['@type'] === 'Organization' && data.name) {
            const cleaned = cleanBrandName(data.name);
            if (cleaned) brandCandidates.push({ source: 'schema:Organization', value: cleaned, confidence: 0.98 });
          }
          
          // Check for nested organization
          if (data.organization?.name) {
            const cleaned = cleanBrandName(data.organization.name);
            if (cleaned) brandCandidates.push({ source: 'schema:org.name', value: cleaned, confidence: 0.95 });
          }
          
          // Check for publisher/author
          if (data.publisher?.name) {
            const cleaned = cleanBrandName(data.publisher.name);
            if (cleaned) brandCandidates.push({ source: 'schema:publisher', value: cleaned, confidence: 0.92 });
          }
          
          // Legal name has high confidence
          if (data.legalName) {
            const cleaned = cleanBrandName(data.legalName);
            if (cleaned) brandCandidates.push({ source: 'schema:legalName', value: cleaned, confidence: 0.95 });
          }
          
          // Brand property
          if (data.brand?.name) {
            const cleaned = cleanBrandName(data.brand.name);
            if (cleaned) brandCandidates.push({ source: 'schema:brand', value: cleaned, confidence: 0.94 });
          }
          
          // Alternative name
          if (data.alternateName) {
            const cleaned = cleanBrandName(data.alternateName);
            if (cleaned) brandCandidates.push({ source: 'schema:alternateName', value: cleaned, confidence: 0.85 });
          }
          
          // General name field
          if (data.name && !data['@type']) {
            const cleaned = cleanBrandName(data.name);
            if (cleaned) brandCandidates.push({ source: 'schema:name', value: cleaned, confidence: 0.88 });
          }
          
        } catch (e) {
          // Invalid JSON, continue
        }
      }
    }

    // 2. HIGH PRIORITY: Open Graph metadata
    const ogSiteName = html.match(/<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i);
    if (ogSiteName && ogSiteName[1]) {
      const cleaned = cleanBrandName(ogSiteName[1]);
      if (cleaned) brandCandidates.push({ source: 'og:site_name', value: cleaned, confidence: 0.96 });
    }

    // 3. HIGH PRIORITY: Meta application-name
    const appName = html.match(/<meta\s+name=["']application-name["']\s+content=["']([^"']+)["']/i);
    if (appName && appName[1]) {
      const cleaned = cleanBrandName(appName[1]);
      if (cleaned) brandCandidates.push({ source: 'application-name', value: cleaned, confidence: 0.94 });
    }

    // 4. HIGH PRIORITY: Copyright notices
    const copyrightMatches = html.match(/©\s*(?:\d{4}[\s-]*)?([^.,"'\n\r<]{3,50})(?:\s+(?:ltd|limited|inc|corp|company|llc|all rights reserved))?/gi);
    if (copyrightMatches) {
      for (const match of copyrightMatches.slice(0, 3)) {
        const nameMatch = match.match(/©\s*(?:\d{4}[\s-]*)?([^.,"'\n\r<]{3,50})/i);
        if (nameMatch && nameMatch[1]) {
          const cleaned = cleanBrandName(nameMatch[1].replace(/\s+(?:ltd|limited|inc|corp|company|llc|all rights reserved)$/i, ''));
          if (cleaned) brandCandidates.push({ source: 'copyright', value: cleaned, confidence: 0.90 });
        }
      }
    }

    // 5. PWA Manifest data
    const manifestLink = html.match(/<link\s+rel=["']manifest["']\s+href=["']([^"']+)["']/i);
    if (manifestLink) {
      // Note: In a real implementation, you'd fetch the manifest.json file
      // For now, we'll look for inline manifest data or common patterns
    }

    // 6. MEDIUM-HIGH PRIORITY: Microdata
    const microdataOrg = html.match(/<[^>]+itemtype=["']https?:\/\/schema\.org\/Organization["'][^>]*>[\s\S]*?<[^>]+itemprop=["']name["'][^>]*>([^<]+)<\/[^>]+>/i);
    if (microdataOrg && microdataOrg[1]) {
      const cleaned = cleanBrandName(microdataOrg[1]);
      if (cleaned) brandCandidates.push({ source: 'microdata:org', value: cleaned, confidence: 0.92 });
    }

    // 7. Twitter Card metadata
    const twitterSite = html.match(/<meta\s+name=["']twitter:site["']\s+content=["']@?([^"']+)["']/i);
    if (twitterSite && twitterSite[1]) {
      const cleaned = cleanBrandName(twitterSite[1]);
      if (cleaned) brandCandidates.push({ source: 'twitter:site', value: cleaned, confidence: 0.85 });
    }

    const twitterCreator = html.match(/<meta\s+name=["']twitter:creator["']\s+content=["']@?([^"']+)["']/i);
    if (twitterCreator && twitterCreator[1]) {
      const cleaned = cleanBrandName(twitterCreator[1]);
      if (cleaned) brandCandidates.push({ source: 'twitter:creator', value: cleaned, confidence: 0.80 });
    }

    // 8. MEDIUM PRIORITY: Meta tags
    const metaTags = [
      { pattern: /<meta\s+name=["']author["']\s+content=["']([^"'@]+)["']/i, source: 'meta:author', confidence: 0.75 },
      { pattern: /<meta\s+name=["']publisher["']\s+content=["']([^"']+)["']/i, source: 'meta:publisher', confidence: 0.85 },
      { pattern: /<meta\s+name=["']copyright["']\s+content=["']([^"']+)["']/i, source: 'meta:copyright', confidence: 0.80 }
    ];

    for (const tag of metaTags) {
      const match = html.match(tag.pattern);
      if (match && match[1]) {
        const cleaned = cleanBrandName(match[1].replace(/©|\d{4}|all rights reserved/gi, ''));
        if (cleaned && !cleaned.includes('@')) {
          brandCandidates.push({ source: tag.source, value: cleaned, confidence: tag.confidence });
        }
      }
    }

    // 9. Open Graph title parsing
    const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitle && ogTitle[1]) {
      const titleParts = ogTitle[1].split(/[\|\-\:]/);
      for (const part of titleParts) {
        const cleaned = cleanBrandName(part);
        if (cleaned && cleaned.length > 3) {
          // Higher confidence if it matches domain
          const confidence = part.toLowerCase().includes(domainBrand.toLowerCase()) ? 0.82 : 0.75;
          brandCandidates.push({ source: 'og:title', value: cleaned, confidence });
          break;
        }
      }
    }

    // 10. Navigation brand analysis
    const navBrandPatterns = [
      /<a[^>]*class[^>]*navbar-brand[^>]*>([^<]+)</i,
      /<a[^>]*class[^>]*brand[^>]*>([^<]+)</i,
      /<a[^>]*href=["'][\/]?["'][^>]*>([^<]+)</i
    ];

    for (const pattern of navBrandPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const cleaned = cleanBrandName(match[1]);
        if (cleaned) {
          brandCandidates.push({ source: 'navigation', value: cleaned, confidence: 0.78 });
          break;
        }
      }
    }

    // 11. Logo alt text analysis
    const logoPatterns = [
      /<img[^>]+alt=["']([^"']*logo[^"']*)["']/gi,
      /<img[^>]+alt=["']([^"']*brand[^"']*)["']/gi,
      /<img[^>]+src=["'][^"']*logo[^"']*["'][^>]*alt=["']([^"']+)["']/gi
    ];

    for (const pattern of logoPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const altText = match[1].replace(/logo|brand|image/gi, '').trim();
        const cleaned = cleanBrandName(altText);
        if (cleaned && cleaned.length > 2) {
          brandCandidates.push({ source: 'logo-alt', value: cleaned, confidence: 0.70 });
          break;
        }
      }
    }

    // 12. Title tag analysis (improved)
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch && titleMatch[1]) {
      const titleParts = titleMatch[1].split(/[\|\-\:]/);
      
      for (const part of titleParts) {
        const cleaned = cleanBrandName(part);
        if (cleaned && cleaned.length > 3) {
          let confidence = 0.65;
          
          // Higher confidence if matches domain
          if (part.toLowerCase().includes(domainBrand.toLowerCase())) {
            confidence = 0.80;
          }
          
          // Higher confidence if capitalized properly
          if (cleaned.split(' ').every(word => word[0] === word[0].toUpperCase())) {
            confidence += 0.05;
          }
          
          brandCandidates.push({ source: 'title', value: cleaned, confidence });
        }
      }
    }

    // 13. H1 tag analysis
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    if (h1Matches) {
      for (const h1 of h1Matches.slice(0, 2)) {
        const h1Text = h1.replace(/<[^>]+>/g, '').trim();
        const cleaned = cleanBrandName(h1Text);
        if (cleaned && cleaned.length > 3 && cleaned.length < 50) {
          const confidence = h1Text.toLowerCase().includes(domainBrand.toLowerCase()) ? 0.72 : 0.65;
          brandCandidates.push({ source: 'h1', value: cleaned, confidence });
        }
      }
    }

    // 14. Contact/About section analysis
    const aboutSection = html.match(/(?:about\s+us|about\s+(?:the\s+)?company|who\s+we\s+are)[^<]*<[^>]*>([^<]{10,100})/i);
    if (aboutSection && aboutSection[1]) {
      // Extract potential brand names from about text
      const aboutText = aboutSection[1];
      const brandMatches = aboutText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g);
      if (brandMatches) {
        for (const match of brandMatches.slice(0, 2)) {
          const cleaned = cleanBrandName(match);
          if (cleaned && cleaned.length > 3) {
            brandCandidates.push({ source: 'about-section', value: cleaned, confidence: 0.68 });
          }
        }
      }
    }

    // 15. Social media link analysis
    const socialPatterns = [
      /facebook\.com\/([^\/?"'\s]+)/i,
      /twitter\.com\/([^\/?"'\s]+)/i,
      /linkedin\.com\/company\/([^\/?"'\s]+)/i,
      /instagram\.com\/([^\/?"'\s]+)/i
    ];

    for (const pattern of socialPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1] !== 'share') {
        const socialHandle = match[1].replace(/[-_]/g, ' ');
        const cleaned = cleanBrandName(socialHandle);
        if (cleaned) {
          brandCandidates.push({ source: 'social-media', value: cleaned, confidence: 0.70 });
        }
      }
    }

    // 16. Domain baseline (always include)
    brandCandidates.push({ source: 'domain', value: domainBrandFormatted, confidence: 0.40 });

    // Remove duplicates and sort by confidence
    const uniqueCandidates = new Map();
    for (const candidate of brandCandidates) {
      const key = candidate.value.toLowerCase();
      if (!uniqueCandidates.has(key) || uniqueCandidates.get(key).confidence < candidate.confidence) {
        uniqueCandidates.set(key, candidate);
      }
    }

    const sortedCandidates = Array.from(uniqueCandidates.values()).sort((a, b) => b.confidence - a.confidence);

    // Debug logging
    if (sortedCandidates.length > 1) {
      console.log('🏷️ Brand name detection results:');
      sortedCandidates.slice(0, 5).forEach(c => {
        console.log(`  - "${c.value}" (${c.source}, confidence: ${c.confidence.toFixed(2)})`);
      });
      console.log(`🎯 Selected: "${sortedCandidates[0].value}" from ${sortedCandidates[0].source}`);
    }

    return sortedCandidates[0]?.value || domainBrandFormatted;
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
      authority: comp.authority || 30, // Use real authority from KeywordCompetitionService
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
      keywordClusters,
      targetDomainAuthority: rawAnalysis.targetDomainAuthority // Include target domain authority for comparison
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
      .filter(k => this.isBrandedKeyword(k.keyword, businessContext))
      .map(k => {
        console.log(`🔍 Branded keyword volume mapping: "${k.keyword}" -> volume: ${k.volume} (from API: ${apiAvailable})`);
        return {
          keyword: k.keyword,
          position: 0, // Will be updated with real SERP data
          volume: apiAvailable ? (k.volume || null) : null,
          difficulty: this.mapDifficulty(k.difficulty),
          type: 'branded' as const
        };
      });
    
    const nonBrandedKeywordsList = allKeywords
      .filter(k => {
        const isNotBranded = !this.isBrandedKeyword(k.keyword, businessContext);
        const hasBusinessRelevance = k.businessRelevance >= 0.4; // Relaxed: accept medium-relevance keywords
        const hasValidVolume = k.volume === null || (k.volume >= 10 && k.volume <= 50000); // Relaxed: accept lower volume keywords
        const isNotGeneric = this.isBusinessSpecificKeyword(k.keyword, businessContext);
        
        console.log(`🔍 Filtering "${k.keyword}": branded=${!isNotBranded}, relevance=${k.businessRelevance}, volume=${k.volume}, specific=${isNotGeneric}`);
        
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
        type: this.isBrandedKeyword(k.keyword, businessContext) ? 'branded' as const : 'non-branded' as const
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
      
      // Debug: Log volume data for branded keywords
      console.log(`📊 Volume data received from Keywords Everywhere:`, volumeData.filter(v => 
        v.keyword.toLowerCase().includes('henryadams') || v.keyword.toLowerCase().includes('henry adams')
      ));
      
      // Helper function to update keyword with real volume (NO FALLBACK)
      const updateKeywordVolume = (keyword: any) => {
        const mappedVolume = volumeMap.get(keyword.keyword.toLowerCase());
        console.log(`📊 Volume mapping: "${keyword.keyword}" -> ${mappedVolume} (was: ${keyword.volume})`);
        return {
          ...keyword,
          volume: mappedVolume || null // null if no API data
        };
      };
      
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
   * Enhance keywords with real SERP positions
   */
  private async enhanceWithSerpPositions(keywords: any[], domain: string, type: 'branded' | 'non-branded'): Promise<void> {
    try {
      // Limit branded keywords to top 5, non-branded to top 8 to save API credits
      const maxKeywords = type === 'branded' ? 5 : 8;
      const topKeywords = keywords.slice(0, maxKeywords);
      
      if (topKeywords.length === 0) {
        console.log(`⚠️ No ${type} keywords to check positions for`);
        return;
      }
      
      // Check if ValueSERP is available
      const hasValueSerp = !!process.env.VALUESERP_API_KEY;
      if (!hasValueSerp) {
        console.log(`⚠️ ValueSERP API not configured - ${type} position data unavailable`);
        return;
      }
      
      console.log(`🔍 Checking SERP positions for ${topKeywords.length} top ${type} keywords...`);
      
      const { ValueSerpService } = await import('./valueSerpService');
      const serpService = new ValueSerpService();
      
      // Check positions for each keyword
      for (let i = 0; i < topKeywords.length; i++) {
        const keyword = topKeywords[i];
        try {
          console.log(`📊 Checking ${type} position for "${keyword.keyword}" (${i + 1}/${topKeywords.length})...`);
          const position = await serpService.checkKeywordPosition(keyword.keyword, domain);
          
          if (position && position > 0 && position <= 100) {
            keyword.position = position;
            console.log(`✅ Found ${type} ranking: "${keyword.keyword}" - Position ${position}`);
          } else {
            console.log(`❌ Not ranking: "${keyword.keyword}"`);
            // Keep position as 0 to show "Not ranking" in UI
          }
          
          // Small delay to respect API limits
          if (i < topKeywords.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.warn(`⚠️ Error checking position for "${keyword.keyword}":`, error.message);
          // Leave position as 0 to show "Not ranking"
        }
      }
      
      console.log(`✅ ${type} SERP position analysis complete`);
      
    } catch (error) {
      console.error(`❌ ${type} SERP position enhancement failed:`, error);
    }
  }

  /**
   * Check if a keyword is branded (includes brand name or natural variations)
   */
  private isBrandedKeyword(keyword: string, businessContext: BusinessContext): boolean {
    const keywordLower = keyword.toLowerCase();
    const brandName = businessContext.businessName.toLowerCase();
    
    // Get all possible brand variations to check against
    const brandVariations = this.getAllBrandVariations(businessContext);
    
    // Check if keyword matches any brand variation
    for (const brandVariation of brandVariations) {
      if (this.isKeywordMatchingBrand(keywordLower, brandVariation)) {
        console.log(`✅ Branded keyword detected: "${keyword}" (matches brand variation "${brandVariation}")`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all possible brand variations (compound, spaced, domain-based, title-based)
   */
  private getAllBrandVariations(businessContext: BusinessContext): string[] {
    const variations = new Set<string>();
    const brandName = businessContext.businessName.toLowerCase();
    
    // Add the main brand name
    variations.add(brandName);
    
    // If brand name has spaces, also add compound version
    if (brandName.includes(' ')) {
      const compoundVersion = brandName.replace(/\s+/g, '');
      variations.add(compoundVersion);
    }
    
    // If brand name is compound, add spaced version
    if (!brandName.includes(' ')) {
      const brandWords = this.extractBrandWords(brandName);
      if (brandWords.length > 1) {
        const spacedVersion = brandWords.join(' ');
        variations.add(spacedVersion);
      }
    }
    
    // Add individual brand words for partial matching
    const brandWords = this.extractBrandWords(brandName);
    brandWords.forEach(word => {
      if (word.length >= 4) { // Only add substantial words
        variations.add(word);
      }
    });
    
    console.log(`🏷️ Brand variations for "${brandName}": [${Array.from(variations).join(', ')}]`);
    return Array.from(variations);
  }

  /**
   * Check if a keyword matches a specific brand variation
   */
  private isKeywordMatchingBrand(keywordLower: string, brandVariation: string): boolean {
    // Exact match or contains the brand
    if (keywordLower.includes(brandVariation)) {
      return true;
    }
    
    // For spaced brand names, check if all words appear in correct order
    if (brandVariation.includes(' ')) {
      const brandWords = brandVariation.split(' ');
      const hasAllBrandWords = brandWords.every(word => keywordLower.includes(word));
      
      if (hasAllBrandWords && brandWords.length > 1) {
        // Check word order
        const keywordWords = keywordLower.split(/\s+/);
        const brandIndices = brandWords.map(brandWord => 
          keywordWords.findIndex(word => word.includes(brandWord))
        );
        
        // All brand words found and in correct order
        const inCorrectOrder = brandIndices.every((index, i) => 
          i === 0 || index > brandIndices[i - 1]
        );
        
        return inCorrectOrder;
      }
    }
    
    return false;
  }

  /**
   * Extract individual words from brand name, handling compound names
   */
  private extractBrandWords(brandName: string): string[] {
    // Handle cases like "henryadams" -> ["henry", "adams"]
    // Split on common patterns
    let words: string[] = [];
    
    // First try splitting on spaces, hyphens, underscores
    if (brandName.includes(' ') || brandName.includes('-') || brandName.includes('_')) {
      words = brandName.split(/[\s\-_]+/).filter(w => w.length > 0);
    } else {
      // Try to detect camelCase or compound words
      // Look for common patterns where capital letters indicate word boundaries
      const camelCaseMatch = brandName.match(/[a-z]+|[A-Z][a-z]*/g);
      if (camelCaseMatch && camelCaseMatch.length > 1) {
        words = camelCaseMatch;
      } else {
        // Try splitting at common word boundaries for known patterns
        // This is where we can add logic for "henryadams" -> "henry" + "adams"
        words = this.splitCompoundBrandName(brandName);
      }
    }
    
    // If no splitting worked, return the original as single word
    if (words.length === 0) {
      words = [brandName];
    }
    
    return words.map(w => w.toLowerCase()).filter(w => w.length > 1);
  }

  /**
   * Split compound brand names using enhanced heuristics (same as dynamicKeywordGenerator)
   */
  private splitCompoundBrandName(brandName: string): string[] {
    // For names 6+ characters, try splitting at different points
    if (brandName.length >= 6) {
      // Score different splits to find the best one
      const splitCandidates: { split: string[], score: number }[] = [];
      
      for (let i = 3; i <= brandName.length - 3; i++) {
        const part1 = brandName.substring(0, i);
        const part2 = brandName.substring(i);
        
        // Check if both parts look like real words
        const score1 = this.getWordScore(part1);
        const score2 = this.getWordScore(part2);
        
        if (score1 > 0 && score2 > 0) {
          const totalScore = score1 + score2;
          splitCandidates.push({ 
            split: [part1, part2], 
            score: totalScore 
          });
        }
      }
      
      // Return the highest scoring split
      if (splitCandidates.length > 0) {
        const bestSplit = splitCandidates.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        console.log(`📝 Enhanced split compound brand "${brandName}" -> ["${bestSplit.split[0]}", "${bestSplit.split[1]}"] (score: ${bestSplit.score})`);
        return bestSplit.split;
      }
    }
    
    return [brandName];
  }

  /**
   * Score how likely a string is to be a real word (same as dynamicKeywordGenerator)
   */
  private getWordScore(word: string): number {
    if (word.length < 3) return 0;
    
    let score = 0;
    
    // Common English names/words that boost score
    const commonWords = [
      'henry', 'adams', 'john', 'smith', 'david', 'wilson', 'james', 'brown',
      'robert', 'jones', 'michael', 'davis', 'william', 'miller', 'richard',
      'moore', 'charles', 'taylor', 'thomas', 'anderson', 'mark', 'white',
      'vantage', 'house', 'space', 'tech', 'data', 'digital', 'smart', 'pro'
    ];
    
    if (commonWords.includes(word.toLowerCase())) {
      score += 100; // Very high score for known names
    }
    
    // Vowel distribution scoring
    const vowelCount = (word.match(/[aeiou]/g) || []).length;
    const consonantCount = word.length - vowelCount;
    const vowelRatio = vowelCount / word.length;
    
    if (vowelCount === 0 || consonantCount === 0) {
      return 0; // No vowels or no consonants = not a word
    }
    
    // Ideal vowel ratio is around 0.3-0.5
    if (vowelRatio >= 0.25 && vowelRatio <= 0.6) {
      score += 50;
    } else if (vowelRatio >= 0.15 && vowelRatio <= 0.7) {
      score += 20;
    }
    
    // Length bonus (4-6 characters is typical for names)
    if (word.length >= 4 && word.length <= 6) {
      score += 30;
    } else if (word.length >= 3 && word.length <= 8) {
      score += 15;
    }
    
    // Common name endings
    if (word.endsWith('son') || word.endsWith('ton') || word.endsWith('ham') ||
        word.endsWith('ford') || word.endsWith('wood') || word.endsWith('field')) {
      score += 25;
    }
    
    // Common name patterns
    if (/^[a-z]{4,6}$/.test(word)) { // Simple 4-6 letter words
      score += 10;
    }
    
    // Penalize awkward letter combinations
    if (word.includes('rya') || word.includes('xqz') || word.includes('yyy')) {
      score -= 30;
    }
    
    return Math.max(0, score);
  }

  /**
   * Basic heuristic to check if a string looks like a real word (for backwards compatibility)
   */
  private looksLikeRealWord(word: string): boolean {
    return this.getWordScore(word) > 30;
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